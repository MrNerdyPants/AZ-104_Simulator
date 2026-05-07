/**
 * AZ-104 Exam Simulator Engine
 * Handles question loading, rendering, scoring, navigation, and timer.
 */

const Engine = (() => {
  // ── State ────────────────────────────────────────────────────────────────────
  let state = {
    mode: 'exam',          // 'exam' | 'study'
    questions: [],         // filtered question list for this session
    currentIndex: 0,
    answers: {},           // questionId → [selectedIndices]
    dragAnswers: {},       // questionId → {zoneIndex: itemIndex}
    flagged: new Set(),
    startTime: null,
    timerInterval: null,
    durationMs: 100 * 60 * 1000,  // 100 minutes
    submitted: false,
    domainFilter: 0        // 0 = all
  };

  // ── Public API ───────────────────────────────────────────────────────────────
  function init(options) {
    state.mode        = options.mode        || 'exam';
    state.domainFilter= options.domain      || 0;
    state.durationMs  = (options.minutes    || 100) * 60 * 1000;
    state.submitted   = false;
    state.answers     = {};
    state.dragAnswers = {};
    state.flagged     = new Set();
    state.currentIndex= 0;

    state.questions = filterQuestions(state.domainFilter);
    if (state.questions.length === 0) {
      document.getElementById('question-area').innerHTML =
        '<p class="empty-state">No questions found for this selection.</p>';
      return;
    }

    if (state.mode === 'exam') {
      state.startTime = Date.now();
      startTimer();
    }

    buildNavPanel();
    renderQuestion(0);
  }

  function filterQuestions(domain) {
    if (typeof QUESTIONS === 'undefined') return [];
    let pool = [...QUESTIONS];
    if (domain > 0) pool = pool.filter(q => q.domain === domain);
    // Shuffle for exam mode
    if (state.mode === 'exam') pool = shuffle(pool);
    return pool;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Timer ────────────────────────────────────────────────────────────────────
  function startTimer() {
    updateTimerDisplay();
    state.timerInterval = setInterval(() => {
      if (state.submitted) { clearInterval(state.timerInterval); return; }
      const elapsed = Date.now() - state.startTime;
      const remaining = state.durationMs - elapsed;
      if (remaining <= 0) {
        clearInterval(state.timerInterval);
        submit(true);
      } else {
        updateTimerDisplay(remaining);
      }
    }, 1000);
  }

  function updateTimerDisplay(remainingMs) {
    const el = document.getElementById('timer');
    if (!el) return;
    if (remainingMs === undefined) remainingMs = state.durationMs;
    const totalSec = Math.ceil(remainingMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const str = h > 0
      ? `${h}:${pad(m)}:${pad(s)}`
      : `${pad(m)}:${pad(s)}`;
    el.textContent = str;
    el.classList.toggle('timer-warning', totalSec <= 600);
    el.classList.toggle('timer-critical', totalSec <= 120);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  // ── Navigation Panel ─────────────────────────────────────────────────────────
  function buildNavPanel() {
    const panel = document.getElementById('nav-panel');
    if (!panel) return;
    panel.innerHTML = '';
    state.questions.forEach((q, i) => {
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.id = `nav-${i}`;
      btn.textContent = i + 1;
      btn.title = `Q${i + 1} — Domain ${q.domain}`;
      btn.setAttribute('data-domain', q.domain);
      btn.addEventListener('click', () => goTo(i));
      panel.appendChild(btn);
    });
    updateNavPanel();
  }

  function updateNavPanel() {
    state.questions.forEach((q, i) => {
      const btn = document.getElementById(`nav-${i}`);
      if (!btn) return;
      btn.className = 'nav-btn';
      if (i === state.currentIndex) btn.classList.add('nav-current');
      if (state.flagged.has(q.id)) btn.classList.add('nav-flagged');
      else if (isAnswered(q)) btn.classList.add('nav-answered');
    });
  }

  function isAnswered(q) {
    if (q.type === 'dragdrop') {
      const da = state.dragAnswers[q.id];
      return da && Object.keys(da).length > 0;
    }
    const a = state.answers[q.id];
    return a && a.length > 0;
  }

  // ── Question Rendering ───────────────────────────────────────────────────────
  function renderQuestion(index) {
    state.currentIndex = index;
    const q = state.questions[index];
    if (!q) return;

    const area = document.getElementById('question-area');
    if (!area) return;

    // Case study panel
    const csPanelEl = document.getElementById('case-study-panel');
    if (q.caseStudyId && typeof CASE_STUDIES !== 'undefined' && CASE_STUDIES[q.caseStudyId]) {
      renderCaseStudy(CASE_STUDIES[q.caseStudyId], csPanelEl);
      if (csPanelEl) csPanelEl.style.display = '';
    } else {
      if (csPanelEl) csPanelEl.style.display = 'none';
    }

    area.innerHTML = buildQuestionHTML(q, index);

    // Wire up interactions
    if (q.type === 'dragdrop') {
      initDragDrop(q);
    } else {
      wireOptions(q);
    }

    // Restore previous answers
    restoreAnswers(q);

    // Study mode: show explanation immediately
    if (state.mode === 'study') {
      showExplanation(q, true);
    }

    updateNavPanel();
    updateProgressBar();
    updateNavButtons();
  }

  function buildQuestionHTML(q, index) {
    const total = state.questions.length;
    const domainLabel = domainName(q.domain);
    const typeLabel = typeDisplay(q.type);

    let html = `
    <div class="question-card" data-qid="${q.id}">
      <div class="question-meta">
        <span class="q-counter">Question ${index + 1} of ${total}</span>
        <span class="q-domain d${q.domain}">${domainLabel}</span>
        <span class="q-type">${typeLabel}</span>
        <span class="q-subdomain">${q.subdomain || ''}</span>
        <button class="flag-btn ${state.flagged.has(q.id) ? 'flagged' : ''}" onclick="Engine.toggleFlag(${q.id})" title="Flag for review">
          ${state.flagged.has(q.id) ? '🚩 Flagged' : '⚑ Flag'}
        </button>
      </div>`;

    // Inline scenario for yesno/single with short scenario
    if (q.scenario) {
      html += `<div class="scenario-box"><strong>Scenario:</strong> ${escHtml(q.scenario)}</div>`;
    }

    // Image
    if (q.image) {
      html += `<div class="question-image"><img src="${q.image}" alt="Question diagram" loading="lazy" onerror="this.style.display='none'"></div>`;
    }

    html += `<p class="question-text">${escHtml(q.question)}</p>`;

    if (q.type === 'dragdrop') {
      html += buildDragDropHTML(q);
    } else {
      html += buildOptionsHTML(q);
    }

    html += `<div class="explanation-box" id="exp-${q.id}" style="display:none"></div>`;

    if (state.mode === 'study') {
      html += `<button class="btn-reveal" onclick="Engine.revealAnswer(${q.id})">Reveal Answer &amp; Explanation</button>`;
    }

    html += `</div>`;
    return html;
  }

  function buildOptionsHTML(q) {
    const isMulti = q.type === 'multi';
    const inputType = isMulti ? 'checkbox' : 'radio';
    let html = `<div class="options-list" id="opts-${q.id}">`;
    if (isMulti) {
      html += `<p class="multi-hint">Select all that apply.</p>`;
    }
    q.options.forEach((opt, i) => {
      html += `
      <label class="option-item" id="opt-${q.id}-${i}">
        <input type="${inputType}" name="q${q.id}" value="${i}" data-qid="${q.id}" data-idx="${i}">
        <span class="option-letter">${String.fromCharCode(65 + i)}</span>
        <span class="option-text">${escHtml(stripLetter(opt))}</span>
      </label>`;
    });
    html += `</div>`;
    return html;
  }

  function buildDragDropHTML(q) {
    let html = `<div class="dragdrop-wrapper">
      <div class="drag-items-panel">
        <h4 class="panel-label">Items</h4>
        <div class="drag-source" id="drag-source-${q.id}">`;
    q.dragItems.forEach((item, i) => {
      html += `<div class="drag-item" draggable="true" data-item="${i}" data-qid="${q.id}">${escHtml(item)}</div>`;
    });
    html += `</div></div>
      <div class="drop-zones-panel">
        <h4 class="panel-label">Drop Zones</h4>`;
    q.dropZones.forEach((zone, i) => {
      html += `
      <div class="drop-zone" id="dz-${q.id}-${i}" data-zone="${i}" data-qid="${q.id}">
        <span class="dz-label">${escHtml(zone)}</span>
        <div class="dz-slot" id="slot-${q.id}-${i}">Drop here</div>
      </div>`;
    });
    html += `</div></div>`;
    return html;
  }

  function wireOptions(q) {
    const inputs = document.querySelectorAll(`input[data-qid="${q.id}"]`);
    inputs.forEach(input => {
      input.addEventListener('change', () => handleOptionChange(q));
    });
  }

  function handleOptionChange(q) {
    if (state.submitted) return;
    const inputs = document.querySelectorAll(`input[data-qid="${q.id}"]:checked`);
    state.answers[q.id] = Array.from(inputs).map(i => parseInt(i.value));
    updateNavPanel();
    if (state.mode === 'study') showExplanation(q, false);
  }

  function restoreAnswers(q) {
    if (q.type === 'dragdrop') {
      const saved = state.dragAnswers[q.id];
      if (saved) {
        Object.entries(saved).forEach(([zone, item]) => {
          placeItemInZone(q, parseInt(item), parseInt(zone));
        });
      }
      return;
    }
    const saved = state.answers[q.id];
    if (!saved || saved.length === 0) return;
    saved.forEach(idx => {
      const input = document.querySelector(`input[data-qid="${q.id}"][value="${idx}"]`);
      if (input) input.checked = true;
    });
    if (state.submitted) markAnswers(q);
  }

  // ── Drag and Drop ────────────────────────────────────────────────────────────
  function initDragDrop(q) {
    const items = document.querySelectorAll(`.drag-item[data-qid="${q.id}"]`);
    const zones = document.querySelectorAll(`.drop-zone[data-qid="${q.id}"]`);

    let draggedItem = null;

    items.forEach(item => {
      item.addEventListener('dragstart', e => {
        draggedItem = item;
        e.dataTransfer.effectAllowed = 'move';
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        draggedItem = null;
      });
    });

    zones.forEach(zone => {
      zone.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (!draggedItem || state.submitted) return;
        const zoneIdx = parseInt(zone.dataset.zone);
        const itemIdx = parseInt(draggedItem.dataset.item);
        placeItemInZone(q, itemIdx, zoneIdx);
        saveDragAnswer(q, itemIdx, zoneIdx);
      });
    });

    // Also allow clicking items back to source
    zones.forEach(zone => {
      zone.addEventListener('click', e => {
        if (state.submitted) return;
        const zoneIdx = parseInt(zone.dataset.zone);
        removeItemFromZone(q, zoneIdx);
      });
    });
  }

  function placeItemInZone(q, itemIdx, zoneIdx) {
    const slot = document.getElementById(`slot-${q.id}-${zoneIdx}`);
    if (!slot) return;
    const itemText = q.dragItems[itemIdx];
    slot.innerHTML = `<div class="placed-item" data-item="${itemIdx}">${escHtml(itemText)}</div>`;
  }

  function removeItemFromZone(q, zoneIdx) {
    const slot = document.getElementById(`slot-${q.id}-${zoneIdx}`);
    if (!slot) return;
    const placed = slot.querySelector('.placed-item');
    if (!placed) return;
    slot.innerHTML = 'Drop here';
    // Remove from saved answers
    if (!state.dragAnswers[q.id]) return;
    delete state.dragAnswers[q.id][zoneIdx];
    updateNavPanel();
  }

  function saveDragAnswer(q, itemIdx, zoneIdx) {
    if (!state.dragAnswers[q.id]) state.dragAnswers[q.id] = {};
    state.dragAnswers[q.id][zoneIdx] = itemIdx;
    updateNavPanel();
  }

  // ── Case Study Rendering ─────────────────────────────────────────────────────
  function renderCaseStudy(cs, container) {
    if (!container) return;
    let html = `<div class="cs-header"><h3 class="cs-title">📋 ${escHtml(cs.title)}</h3></div>`;

    if (cs.image) {
      html += `<div class="cs-image-wrap"><img src="${cs.image}" alt="Case study diagram" class="cs-image" onerror="this.style.display='none'"></div>`;
    }

    if (cs.tabs && cs.tabs.length) {
      html += `<div class="cs-tabs">`;
      cs.tabs.forEach((tab, i) => {
        html += `<button class="cs-tab-btn ${i === 0 ? 'active' : ''}" onclick="Engine.switchCsTab(this, 'cs-tab-${cs.id}-${i}')">${escHtml(tab.label)}</button>`;
      });
      html += `</div>`;
      cs.tabs.forEach((tab, i) => {
        html += `<div class="cs-tab-content ${i === 0 ? 'active' : ''}" id="cs-tab-${cs.id}-${i}"><pre class="cs-content">${escHtml(tab.content)}</pre></div>`;
      });
    }

    container.innerHTML = html;
  }

  function switchCsTab(btn, targetId) {
    const panel = btn.closest('.case-study-panel') || document.getElementById('case-study-panel');
    if (!panel) return;
    panel.querySelectorAll('.cs-tab-btn').forEach(b => b.classList.remove('active'));
    panel.querySelectorAll('.cs-tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(targetId);
    if (target) target.classList.add('active');
  }

  // ── Answer Reveal ────────────────────────────────────────────────────────────
  function revealAnswer(qId) {
    const q = state.questions.find(x => x.id === qId);
    if (!q) return;
    markAnswers(q);
    showExplanation(q, true);
    const btn = document.querySelector(`.btn-reveal`);
    if (btn) btn.style.display = 'none';
  }

  function showExplanation(q, force) {
    const box = document.getElementById(`exp-${q.id}`);
    if (!box) return;
    if (!force && state.mode !== 'study') return;

    let correctText = '';
    if (q.type === 'dragdrop') {
      const mapping = (q.correct || []).map(([item, zone]) =>
        `• &quot;${escHtml(q.dragItems[item])}&quot; → &quot;${escHtml(q.dropZones[zone])}&quot;`
      ).join('<br>');
      correctText = `<strong>Correct Mapping:</strong><br>${mapping}`;
    } else {
      const letters = (q.correct || []).map(i => String.fromCharCode(65 + i)).join(', ');
      const texts = (q.correct || []).map(i => '<strong>' + escHtml(stripLetter(q.options[i])) + '</strong>').join('; ');
      correctText = `Correct Answer${(q.correct||[]).length > 1 ? 's' : ''}: ${letters} — ${texts}`;
    }

    const explanationHtml = (q.explanation || 'No explanation provided.')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    const referenceHtml = q.reference
      ? `<div class="exp-reference">📖 <a href="${q.reference}" target="_blank" rel="noopener">${q.reference}</a></div>`
      : '';

    box.innerHTML = `
      <div class="exp-correct-row">
        <span class="exp-check">✓</span>
        <span>${correctText}</span>
      </div>
      <div class="exp-body">${explanationHtml}</div>
      ${referenceHtml}`;
    box.style.display = '';
  }

  function markAnswers(q) {
    if (q.type === 'dragdrop') {
      markDragDrop(q);
      return;
    }
    const saved = state.answers[q.id] || [];
    q.options.forEach((_, i) => {
      const label = document.getElementById(`opt-${q.id}-${i}`);
      if (!label) return;
      const isCorrect = q.correct.includes(i);
      const isSelected = saved.includes(i);
      label.classList.remove('correct', 'incorrect', 'missed');
      if (isSelected && isCorrect) label.classList.add('correct');
      else if (isSelected && !isCorrect) label.classList.add('incorrect');
      else if (!isSelected && isCorrect) label.classList.add('missed');
    });
  }

  function markDragDrop(q) {
    const saved = state.dragAnswers[q.id] || {};
    q.correct.forEach(([item, zone]) => {
      const slot = document.getElementById(`slot-${q.id}-${zone}`);
      if (!slot) return;
      const placed = slot.querySelector('.placed-item');
      if (placed) {
        const placedItem = parseInt(placed.dataset.item);
        placed.classList.add(placedItem === item ? 'dd-correct' : 'dd-incorrect');
      }
      const dz = document.getElementById(`dz-${q.id}-${zone}`);
      if (dz) {
        const placedItem = saved[zone];
        dz.classList.add(placedItem === item ? 'dz-correct' : 'dz-incorrect');
      }
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────────
  function next() {
    if (state.currentIndex < state.questions.length - 1) {
      renderQuestion(state.currentIndex + 1);
      scrollTop();
    }
  }

  function prev() {
    if (state.currentIndex > 0) {
      renderQuestion(state.currentIndex - 1);
      scrollTop();
    }
  }

  function goTo(index) {
    renderQuestion(index);
    scrollTop();
  }

  function scrollTop() {
    const area = document.getElementById('question-area');
    if (area) area.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleFlag(qId) {
    if (state.flagged.has(qId)) state.flagged.delete(qId);
    else state.flagged.add(qId);
    const btn = document.querySelector(`.flag-btn`);
    if (btn) {
      btn.classList.toggle('flagged', state.flagged.has(qId));
      btn.textContent = state.flagged.has(qId) ? '🚩 Flagged' : '⚑ Flag';
    }
    updateNavPanel();
  }

  function updateNavButtons() {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    if (prevBtn) prevBtn.disabled = state.currentIndex === 0;
    if (nextBtn) nextBtn.disabled = state.currentIndex === state.questions.length - 1;
  }

  function updateProgressBar() {
    const bar = document.getElementById('progress-fill');
    const lbl = document.getElementById('progress-label');
    if (!bar) return;
    const answered = state.questions.filter(q => isAnswered(q)).length;
    const pct = Math.round((answered / state.questions.length) * 100);
    bar.style.width = pct + '%';
    if (lbl) lbl.textContent = `${answered} / ${state.questions.length} answered`;
  }

  // ── Submit & Score ────────────────────────────────────────────────────────────
  function submit(autoSubmit) {
    if (state.submitted) return;
    const unanswered = state.questions.filter(q => !isAnswered(q)).length;
    if (!autoSubmit && unanswered > 0) {
      const go = confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`);
      if (!go) return;
    }
    clearInterval(state.timerInterval);
    state.submitted = true;
    const score = calculateScore();
    renderScoreReport(score);
  }

  function calculateScore() {
    const result = {
      total: state.questions.length,
      correct: 0,
      incorrect: 0,
      unanswered: 0,
      domains: {}
    };

    // Init domain buckets
    for (let d = 1; d <= 5; d++) {
      result.domains[d] = { total: 0, correct: 0, name: domainName(d) };
    }

    state.questions.forEach(q => {
      const d = q.domain;
      result.domains[d].total++;

      if (!isAnswered(q)) {
        result.unanswered++;
        return;
      }

      let isCorrect = false;
      if (q.type === 'dragdrop') {
        const saved = state.dragAnswers[q.id] || {};
        isCorrect = q.correct.every(([item, zone]) => saved[zone] === item) &&
                    Object.keys(saved).length === q.correct.length;
      } else {
        const saved = state.answers[q.id] || [];
        const sortedSaved = [...saved].sort();
        const sortedCorrect = [...q.correct].sort();
        isCorrect = JSON.stringify(sortedSaved) === JSON.stringify(sortedCorrect);
      }

      if (isCorrect) {
        result.correct++;
        result.domains[d].correct++;
      } else {
        result.incorrect++;
      }
    });

    result.percentage = result.total > 0
      ? Math.round((result.correct / result.total) * 100)
      : 0;

    return result;
  }

  function renderScoreReport(score) {
    const container = document.getElementById('score-report');
    if (!container) {
      // Fallback: show inline
      const area = document.getElementById('question-area');
      if (area) area.innerHTML = buildScoreHTML(score);
      return;
    }
    container.innerHTML = buildScoreHTML(score);
    container.style.display = '';
    const examArea = document.getElementById('exam-container');
    if (examArea) examArea.style.display = 'none';
  }

  function buildScoreHTML(score) {
    const passThreshold = 70;
    const passed = score.percentage >= passThreshold;
    const grade = passed ? 'PASS' : 'FAIL';
    const gradeClass = passed ? 'grade-pass' : 'grade-fail';

    let domainRows = '';
    for (let d = 1; d <= 5; d++) {
      const dom = score.domains[d];
      if (dom.total === 0) continue;
      const pct = dom.total > 0 ? Math.round((dom.correct / dom.total) * 100) : 0;
      const barClass = pct >= 70 ? 'bar-pass' : 'bar-fail';
      domainRows += `
      <div class="domain-score-row">
        <span class="ds-name d${d}">${dom.name}</span>
        <div class="ds-bar-wrap">
          <div class="ds-bar ${barClass}" style="width:${pct}%"></div>
        </div>
        <span class="ds-pct">${dom.correct}/${dom.total} (${pct}%)</span>
      </div>`;
    }

    return `
    <div class="score-report">
      <div class="score-header">
        <h2 class="score-title">Exam Results</h2>
        <div class="score-circle ${gradeClass}">
          <span class="score-pct">${score.percentage}%</span>
          <span class="score-grade">${grade}</span>
        </div>
      </div>
      <div class="score-summary">
        <div class="stat-box"><span class="stat-num success">${score.correct}</span><span class="stat-lbl">Correct</span></div>
        <div class="stat-box"><span class="stat-num error">${score.incorrect}</span><span class="stat-lbl">Incorrect</span></div>
        <div class="stat-box"><span class="stat-num warning">${score.unanswered}</span><span class="stat-lbl">Unanswered</span></div>
        <div class="stat-box"><span class="stat-num">${score.total}</span><span class="stat-lbl">Total</span></div>
      </div>
      <div class="domain-breakdown">
        <h3>Domain Breakdown</h3>
        ${domainRows}
      </div>
      <div class="score-actions">
        <button class="btn-primary" onclick="Engine.reviewAnswers()">Review Answers</button>
        <button class="btn-secondary" onclick="location.reload()">New Exam</button>
        <button class="btn-secondary" onclick="location.href='index.html'">Dashboard</button>
      </div>
    </div>`;
  }

  function reviewAnswers() {
    const container = document.getElementById('score-report');
    if (container) container.style.display = 'none';
    const examArea = document.getElementById('exam-container');
    if (examArea) examArea.style.display = '';
    renderQuestion(0);
    // Mark all answers visible
    state.questions.forEach(q => {
      markAnswers(q);
      showExplanation(q, true);
    });
    renderQuestion(state.currentIndex);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function domainName(d) {
    const names = {
      1: 'Domain 1: Identities & Governance',
      2: 'Domain 2: Storage',
      3: 'Domain 3: Compute',
      4: 'Domain 4: Networking',
      5: 'Domain 5: Monitor & Maintain'
    };
    return names[d] || `Domain ${d}`;
  }

  function typeDisplay(t) {
    const map = {
      single: 'Single Choice',
      multi: 'Multiple Choice',
      yesno: 'Yes/No',
      dragdrop: 'Drag & Drop'
    };
    return map[t] || t;
  }

  function stripLetter(str) {
    return String(str || '').replace(/^[A-F]\.\s+/, '');
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br>');
  }

  // ── Public interface ──────────────────────────────────────────────────────────
  return {
    init,
    next,
    prev,
    goTo,
    toggleFlag,
    revealAnswer,
    submit,
    reviewAnswers,
    switchCsTab,
    getState: () => state,
    getQuestions: () => state.questions
  };
})();
