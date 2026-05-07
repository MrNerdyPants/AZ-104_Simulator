var QUESTIONS = typeof QUESTIONS !== 'undefined' ? QUESTIONS : [];
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 501,
    domain: 5,
    subdomain: "Azure Monitor",
    type: "single",
    question: "You have an Azure subscription with virtual machines deployed across three resource groups. You need to collect performance metrics (CPU, memory, disk) from all VMs and store them in a central location for querying with KQL. What should you configure?",
    options: [
      "Enable Azure Diagnostics extension on each VM and send data to Azure Storage",
      "Deploy the Azure Monitor Agent on VMs and create a Data Collection Rule (DCR) sending data to a Log Analytics workspace",
      "Create an alert rule for each metric on each VM",
      "Configure Azure Metrics Explorer to aggregate data from all VMs"
    ],
    correct: [1],
    explanation: "The Azure Monitor Agent (AMA) with Data Collection Rules (DCRs) is the modern approach for collecting performance data from VMs. A DCR defines what data to collect (performance counters, event logs) and where to send it (Log Analytics workspace, Azure Monitor Metrics). Once in Log Analytics, you can query data using KQL across all VMs regardless of resource group. The legacy Azure Diagnostics extension sends to Storage but is harder to query. Alert rules trigger notifications but don't store historical data for querying."
  },
  {
    id: 502,
    domain: 5,
    subdomain: "Azure Monitor",
    type: "single",
    caseStudy: {
      title: "Contoso Manufacturing — Monitoring Architecture",
      background: "Contoso Manufacturing has 200 Azure VMs across 3 subscriptions (Production, Staging, Development). They use Azure Monitor with a central Log Analytics workspace named 'ContosoLAW' in the Production subscription. The workspace retains data for 30 days by default. The operations team needs to query VM performance data across all three subscriptions from a single workspace.",
      requirements: [
        "All VM performance metrics and event logs must flow to ContosoLAW",
        "Queries must be possible across all subscriptions from ContosoLAW",
        "Data retention must be extended to 90 days for compliance",
        "Alerts must notify the ops team via email when VM CPU exceeds 90% for 5 minutes"
      ],
      details: "The current setup uses the legacy MMA (Microsoft Monitoring Agent) on Production VMs only. Staging and Development VMs have no monitoring agents. There is a single action group named 'OpsTeamAG' with the ops team's email addresses already configured."
    },
    question: "You need to extend data collection to Staging and Development subscription VMs. Which agent and configuration approach should you use for new deployments?",
    options: [
      "Install the legacy MMA agent on all Staging and Development VMs, pointing to ContosoLAW workspace ID and key",
      "Deploy the Azure Monitor Agent (AMA) using a Data Collection Rule (DCR) associated with the VMs in Staging and Development",
      "Configure Azure Diagnostics extension on each VM to write to ContosoLAW directly",
      "Enable VM Insights from the Azure Monitor blade, which automatically installs the required agent on all VMs"
    ],
    correct: [1],
    explanation: "The Azure Monitor Agent (AMA) with Data Collection Rules (DCRs) is the current recommended agent, replacing the legacy MMA/OMS agent. AMA advantages: supports multi-homing to multiple workspaces, uses managed identity (no workspace keys), can be deployed at scale via Azure Policy, and supports cross-subscription DCRs. You create a DCR specifying what to collect and the target workspace (ContosoLAW), then associate the DCR with VMs in Staging and Development. VM Insights can use AMA but requires separate configuration."
  },
  {
    id: 503,
    domain: 5,
    subdomain: "Azure Monitor",
    type: "single",
    caseStudy: {
      title: "Contoso Manufacturing — Monitoring Architecture",
      background: "Same case study as Q502."
    },
    question: "You need to extend the Log Analytics workspace data retention from 30 days to 90 days for compliance. What should you configure?",
    options: [
      "Create a Storage account and configure diagnostic settings to archive logs older than 30 days",
      "Modify the Log Analytics workspace retention setting to 90 days",
      "Create a second Log Analytics workspace with 90-day retention and configure cross-workspace queries",
      "Enable Azure Sentinel on ContosoLAW which extends retention to 90 days automatically"
    ],
    correct: [1],
    explanation: "Log Analytics workspace retention is configurable per workspace (or per table in newer pricing tiers). Navigate to the workspace → Usage and estimated costs → Data Retention, and set it to 90 days. Interactive retention can be set from 4 to 730 days. Data beyond the interactive period can be archived at lower cost for up to 12 years total. This is the direct, correct approach. Creating a separate workspace adds complexity. Azure Sentinel (Microsoft Sentinel) does not automatically extend retention."
  },
  {
    id: 504,
    domain: 5,
    subdomain: "Azure Monitor Alerts",
    type: "single",
    caseStudy: {
      title: "Contoso Manufacturing — Monitoring Architecture",
      background: "Same case study as Q502. The action group 'OpsTeamAG' is already configured with the ops team email."
    },
    question: "You need to create an alert that fires when any VM's CPU percentage exceeds 90% for 5 consecutive minutes. Which alert rule configuration should you use?",
    options: [
      "Signal type: Activity Log | Condition: CPU > 90% | Evaluation: 5-minute window",
      "Signal type: Metric | Signal name: Percentage CPU | Condition: Greater than 90 | Aggregation: Average | Evaluation granularity: 5 minutes | Action group: OpsTeamAG",
      "Signal type: Log | KQL query for CPU > 90% | Threshold: 1 result | Frequency: 5 minutes",
      "Signal type: Smart detection | Anomaly detection on CPU metric"
    ],
    correct: [1],
    explanation: "For CPU-based metric alerts: use Signal type 'Metric', select the 'Percentage CPU' metric (available on Azure VMs), configure condition 'Greater than 90', with Average aggregation over a 5-minute evaluation granularity. This means the alert fires when the average CPU over a 5-minute window exceeds 90%. Attach the OpsTeamAG action group to send notifications. Activity Log alerts are for control-plane events (VM stop/start). Log alerts use KQL and are better for complex conditions. Smart detection is for Application Insights anomaly detection."
  },
  {
    id: 505,
    domain: 5,
    subdomain: "Log Analytics",
    type: "single",
    question: "You have a Log Analytics workspace with VM performance data. You need to write a KQL query that returns the top 5 VMs with the highest average CPU utilization over the last 24 hours. Which KQL query is correct?",
    options: [
      "Perf | where TimeGenerated > ago(24h) | where CounterName == 'Processor(_Total)\\\\% Processor Time' | summarize AvgCPU = avg(CounterValue) by Computer | top 5 by AvgCPU desc",
      "AzureMetrics | where TimeGenerated > ago(24h) | where MetricName == 'Percentage CPU' | summarize AvgCPU = avg(Maximum) by Resource | top 5 by AvgCPU",
      "VMPerformance | where TimeGenerated > ago(1d) | top 5 CPU",
      "Event | where EventLog == 'CPU' | summarize by Computer | top 5"
    ],
    correct: [0],
    explanation: "In Log Analytics, VM performance counter data is stored in the 'Perf' table. The Windows CPU counter is stored as CounterName = '% Processor Time' with ObjectName = 'Processor' and InstanceName = '_Total'. The KQL query filters to the last 24 hours, filters for the CPU counter, calculates average CPU per Computer (VM hostname), and returns the top 5 by descending average CPU. AzureMetrics stores Azure-platform metrics (useful for PaaS resources). The 'Event' table stores Windows Event Log entries, not performance counters."
  },
  {
    id: 506,
    domain: 5,
    subdomain: "Log Analytics",
    type: "dragdrop",
    question: "Match each Azure Monitor data type to the correct Log Analytics table where it is stored.",
    dragItems: [
      "Windows Event Log entries (Security, System, Application)",
      "VM performance counter data (CPU, Memory, Disk)",
      "Azure Activity Log (subscription-level operations)",
      "Azure resource diagnostic logs (sent to workspace)"
    ],
    dropZones: [
      "Event table",
      "Perf table",
      "AzureActivity table",
      "Resource-specific tables (e.g., AzureDiagnostics or dedicated tables)"
    ],
    correct: [[0, 0], [1, 1], [2, 2], [3, 3]],
    explanation: "Log Analytics table organization: 'Event' — Windows Event Log entries (EventID, EventLog, Computer, RenderedDescription). 'Perf' — Performance counter data from Windows and Linux VMs (CounterName, CounterValue, Computer). 'AzureActivity' — Azure Activity Log entries from when you route the subscription's Activity Log to the workspace (operations like VM create/delete/stop, policy compliance changes). 'AzureDiagnostics' or dedicated tables — resource diagnostic logs (e.g., NSG flow logs in NetworkWatcher tables, Storage logs in StorageBlobLogs, etc.)."
  },
  {
    id: 507,
    domain: 5,
    subdomain: "Azure Monitor Alerts",
    type: "multi",
    question: "You need to configure Azure Monitor alert rules. For each of the following scenarios, which alert signal type should you use? (Select all correct answers — one per scenario listed)",
    options: [
      "Alert when an Azure VM is deallocated — use Activity Log signal type",
      "Alert when a VM's average CPU exceeds 85% for 10 minutes — use Metric signal type",
      "Alert when the count of failed sign-in attempts in Microsoft Sentinel exceeds 10 in 1 hour — use Log (KQL) signal type",
      "Alert when Azure detects a performance anomaly in an Application Insights app — use Smart Detection signal type",
      "Alert when a storage account is deleted — use Metric signal type"
    ],
    correct: [0, 1, 2, 3],
    explanation: "Correct signal types: (A) VM deallocated — Activity Log (control-plane events like start/stop/deallocate/delete appear in Activity Log). (B) CPU metric threshold — Metric signal (platform metrics like Percentage CPU, with aggregation/threshold/evaluation window). (C) Security event count query — Log/KQL signal (custom log queries for complex conditions not expressible as simple metrics). (D) Application Insights anomaly — Smart Detection (ML-based anomaly detection built into App Insights). (E) Storage account deletion is an Activity Log event, NOT a metric — option E is incorrect."
  },
  {
    id: 508,
    domain: 5,
    subdomain: "Action Groups",
    type: "single",
    question: "You have an Azure Monitor alert that fires frequently. You need to ensure that the same alert does not send repeated notifications to the team more than once per hour to avoid alert fatigue. What should you configure?",
    options: [
      "Set the alert frequency to 60 minutes",
      "Configure Alert Processing Rules with a suppression window of 1 hour",
      "Modify the action group to use a Logic App that rate-limits notifications",
      "Reduce the evaluation period of the alert to 60 minutes"
    ],
    correct: [1],
    explanation: "Alert Processing Rules (formerly Suppression Rules or Action Rules) allow you to suppress notifications for specific time windows or filter which action groups are triggered. A suppression rule can prevent the same alert from firing notifications more frequently than desired. This is different from alert frequency (how often the condition is evaluated) and evaluation period (time window used to evaluate the condition). Alert Processing Rules operate on the notification layer, not the detection layer, making them the correct tool for notification throttling."
  },
  {
    id: 509,
    domain: 5,
    subdomain: "Azure Backup",
    type: "single",
    caseStudy: {
      title: "Fabrikam Healthcare — Backup Strategy",
      background: "Fabrikam Healthcare runs critical workloads on Azure VMs and Azure SQL Databases. They have a Recovery Services vault named 'FabrikamRSV' in East US. Compliance requirements mandate: VM backups retained for 7 years, daily backups at 2:00 AM, ability to restore individual files from VM backups, cross-region restore capability for disasters.",
      currentState: "Currently no backup policies are configured. All VMs are in a resource group named 'ProdVMs-RG'. The vault uses LRS redundancy."
    },
    question: "You need to enable cross-region restore for VM backups. What must you change on the Recovery Services vault?",
    options: [
      "Change the vault's storage replication from LRS to GRS",
      "Create a second Recovery Services vault in West US and configure geo-replication",
      "Enable Azure Site Recovery on the vault",
      "Change the vault's storage replication from LRS to ZRS"
    ],
    correct: [0],
    explanation: "Cross-Region Restore (CRR) for Azure Backup requires the Recovery Services vault to use GRS (Geo-Redundant Storage) replication. CRR must be explicitly enabled on the vault (it's not on by default even with GRS). Once enabled, backup data is replicated to the secondary region (paired region), and you can restore VMs from the secondary region during a disaster. ZRS provides zone redundancy but not cross-region. Creating a second vault is not necessary — CRR works within a single GRS vault. Azure Site Recovery is for disaster recovery replication, not backup."
  },
  {
    id: 510,
    domain: 5,
    subdomain: "Azure Backup",
    type: "single",
    caseStudy: {
      title: "Fabrikam Healthcare — Backup Strategy",
      background: "Same case study as Q509."
    },
    question: "You need to retain VM backups for 7 years (2,555 days) to meet compliance requirements. You configure a backup policy. What is the maximum retention period you can set for a yearly recovery point in an Enhanced backup policy?",
    options: [
      "180 days",
      "5 years (1,825 days)",
      "10 years (3,650 days)",
      "99 years"
    ],
    correct: [2],
    explanation: "Azure Backup Enhanced policy for Azure VMs supports: Daily recovery points — up to 180 days. Weekly recovery points — up to 5 years. Monthly recovery points — up to 10 years. Yearly recovery points — up to 10 years. To retain backups for 7 years, configure the yearly recovery point retention to 7 years (2,555 days), which is within the 10-year maximum. The Standard policy has lower retention limits. Enhanced policy also supports backup frequency up to 4 times per day and trusted Azure VM backup."
  },
  {
    id: 511,
    domain: 5,
    subdomain: "Azure Backup",
    type: "single",
    question: "An administrator accidentally deleted a file from an Azure VM. The VM is protected by Azure Backup with daily backups. You need to restore only the deleted file without restoring the entire VM. What restore option should you use?",
    options: [
      "Replace existing VM — restores the full VM disk from a recovery point",
      "Create new VM — provisions a new VM from the recovery point",
      "Restore disks — creates managed disk snapshots from the recovery point",
      "File Recovery — mounts the recovery point as a drive to copy individual files"
    ],
    correct: [3],
    explanation: "Azure Backup File Recovery (also called 'Item-level recovery') mounts the backup's OS or data disks as a virtual drive on a recovery VM using iSCSI. You can then browse the mounted drive and copy individual files/folders without restoring the entire VM or disk. The script to mount the recovery point is downloaded from the Azure portal and run on a Windows or Linux machine. After copying the needed files, you unmount the recovery point. This is the fastest and least disruptive option for single-file recovery."
  },
  {
    id: 512,
    domain: 5,
    subdomain: "Azure Backup",
    type: "yesno",
    scenario: "You have an Azure VM named VM1 that is protected by Azure Backup. An administrator deletes VM1 from the Azure portal. You need to restore VM1 from the most recent backup.",
    question: "Solution: Navigate to the Recovery Services vault, find VM1's backup item (which will show as 'Stop Protection with Delete Data'), and use the Restore VM option to recreate the VM. Does this meet the goal?",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "No. When a VM is deleted, if 'Stop Protection with Delete Data' was selected, the backup data is also deleted and cannot be restored. However, if the VM was deleted from Azure but the backup was stopped with 'Retain Data' (or the backup is still active), the backup item remains in the vault in a 'Soft Deleted' state for 14 days and data is retained. For the scenario to work, the backup data must still exist (either soft-deleted or retained). The scenario says the VM was deleted but doesn't specify what happened to the backup — if backup data was retained, restore is possible. But if backup data was also deleted, restoration is not possible."
  },
  {
    id: 513,
    domain: 5,
    subdomain: "Azure Backup",
    type: "single",
    question: "You need to protect an Azure file share using Azure Backup. Where should you create the backup vault, and which vault type should you use?",
    options: [
      "Create a Recovery Services vault in any region; Azure Files backup works across regions",
      "Create a Recovery Services vault in the same region as the storage account containing the file share",
      "Create an Azure Backup vault in the same region as the storage account",
      "Both B and C are correct depending on the desired feature set"
    ],
    correct: [3],
    explanation: "Azure Files backup can use both vault types: Recovery Services vault — the traditional vault, required for backup policies with daily snapshots and retention up to 200 days for daily, 10 years for yearly. Must be in the same region as the storage account. Azure Backup vault — newer vault type that also supports Azure Files backup and other workloads (AKS, blobs). Also must be in the same region. The key constraint for both is same-region as the storage account. Both vault types support Azure Files backup, so the correct answer is D — both B and C are valid."
  },
  {
    id: 514,
    domain: 5,
    subdomain: "Azure Site Recovery",
    type: "single",
    caseStudy: {
      title: "Tailwind Traders — Disaster Recovery",
      background: "Tailwind Traders runs production workloads on Azure VMs in East US. Their RPO requirement is 1 hour and RTO is 4 hours. They need a DR solution to replicate VMs to West US. They currently use Recovery Services vault 'TailwindRSV' in East US. All production VMs are in a resource group 'Prod-VMs-EastUS'.",
      requirements: [
        "VMs must be continuously replicated to West US",
        "RPO of 1 hour or less",
        "RTO of 4 hours or less",
        "Ability to test failover without impacting production"
      ]
    },
    question: "You need to enable Azure Site Recovery for VM replication to West US. Where must the Recovery Services vault be located?",
    options: [
      "In East US (same as the source VMs) — the vault manages replication from the source region",
      "In West US (the target region) — the vault is created in the target/secondary region",
      "In a third region (e.g., Central US) that is different from both source and target",
      "The vault can be in any region; location does not matter for ASR"
    ],
    correct: [1],
    explanation: "For Azure Site Recovery (Azure-to-Azure replication), the Recovery Services vault must be in the TARGET (secondary) region, NOT the source region. This is because if the source region has an outage, the vault in the source region would also be unavailable. By placing the vault in West US (target region), recovery operations remain accessible even during an East US outage. This is a common exam topic — the vault location for ASR must be the secondary/target region."
  },
  {
    id: 515,
    domain: 5,
    subdomain: "Azure Site Recovery",
    type: "single",
    caseStudy: {
      title: "Tailwind Traders — Disaster Recovery",
      background: "Same case study as Q514. ASR is configured with the vault in West US. VMs are being replicated."
    },
    question: "You need to verify that your DR plan works without affecting production VMs in East US. What should you perform?",
    options: [
      "Perform a planned failover of all production VMs to West US",
      "Perform a test failover using an isolated virtual network in West US",
      "Perform an unplanned failover and then fail back immediately",
      "Review the replication health status in the Azure portal"
    ],
    correct: [1],
    explanation: "Test Failover is ASR's non-disruptive DR test mechanism. It creates a copy of the replicated VM(s) in an isolated test network in the target region, allowing you to verify the VM boots, applications function, and connectivity works — all without impacting the source production VMs or breaking replication. The test VMs are created using the recovery point you select. After testing, you 'clean up test failover' to delete the test VMs. This is the correct way to validate DR readiness. Planned/unplanned failover is for actual disaster events."
  },
  {
    id: 516,
    domain: 5,
    subdomain: "Azure Site Recovery",
    type: "dragdrop",
    question: "Match each Azure Site Recovery term to its correct definition.",
    dragItems: [
      "RPO (Recovery Point Objective)",
      "RTO (Recovery Time Objective)",
      "Failover",
      "Failback",
      "Reprotect"
    ],
    dropZones: [
      "Maximum acceptable data loss measured in time (e.g., 15 minutes of transactions)",
      "Maximum acceptable time to restore service after an outage",
      "Activating replicated VMs in the secondary region when primary region fails",
      "Returning VMs from the secondary region back to the primary region after recovery",
      "Reversing replication direction so the failed-over secondary becomes the new source"
    ],
    correct: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]],
    explanation: "ASR terminology: RPO — how much data can be lost (e.g., RPO of 1 hour means up to 1 hour of data may be lost). Azure-to-Azure ASR typically achieves RPO < 15 minutes for crash-consistent recovery points. RTO — how quickly you need to be back online (e.g., RTO of 4 hours). Failover — switching workloads to the secondary region; can be planned (graceful) or unplanned (immediate). Failback — after the primary region recovers, returning workloads back to their original location. Reprotect — after failover, configures replication in reverse (secondary → primary) to prepare for failback."
  },
  {
    id: 517,
    domain: 5,
    subdomain: "Azure Monitor — VM Insights",
    type: "single",
    question: "You enable VM Insights for a virtual machine named VM1. VM Insights uses the Azure Monitor Agent and collects performance and process data. In the Azure Monitor workspace, which two tables will contain data collected by VM Insights?",
    options: [
      "InsightsMetrics and VMConnection",
      "Perf and Event",
      "AzureMetrics and SecurityEvent",
      "VMComputer and VMBoundPort"
    ],
    correct: [0],
    explanation: "VM Insights with Azure Monitor Agent stores data in specific tables: InsightsMetrics — performance counters (CPU, memory, disk, network) collected at high frequency. VMConnection — network connection data (which VMs are communicating with which endpoints, traffic volume). These replace the legacy Perf and VMConnection tables from the older MMA-based VM Insights. VMComputer and VMBoundPort are also VM Insights tables for computer inventory and bound ports. The primary performance and connection tables are InsightsMetrics and VMConnection."
  },
  {
    id: 518,
    domain: 5,
    subdomain: "Azure Monitor — Diagnostic Settings",
    type: "single",
    question: "You need to send Azure Activity Log entries for a subscription to three different destinations simultaneously: a Log Analytics workspace for querying, an Azure Storage account for long-term archiving, and an Event Hub for streaming to a SIEM. What should you configure?",
    options: [
      "Create three separate Activity Log diagnostic settings, one for each destination",
      "Create one diagnostic setting with all three destinations selected",
      "Configure Azure Monitor to route Activity Log to Storage, then use Logic Apps to forward to the workspace and Event Hub",
      "Use Azure Policy to enforce Activity Log collection to all three destinations"
    ],
    correct: [1],
    explanation: "Azure Diagnostic Settings support multiple destinations in a single setting. You can select any combination of: Log Analytics workspace, Storage account, Event Hub, and partner solutions — all within one diagnostic setting. This routes the same log data to all selected destinations simultaneously. There is no need to create multiple settings for the same resource. The Activity Log diagnostic setting is at the subscription level (not resource level) and routes all subscription activity to the specified destinations."
  },
  {
    id: 519,
    domain: 5,
    subdomain: "Azure Monitor — Workbooks",
    type: "single",
    question: "You need to create a visual dashboard that combines VM performance metrics, alert data, and custom KQL query results in a single interactive view that can be shared with the management team. Which Azure Monitor feature should you use?",
    options: [
      "Azure Monitor Metrics Explorer — for creating charts from metric data",
      "Azure Monitor Workbooks — for creating rich interactive reports combining multiple data sources",
      "Azure Dashboard — for pinning individual charts and metrics tiles",
      "Power BI — for creating reports from Log Analytics data"
    ],
    correct: [1],
    explanation: "Azure Monitor Workbooks are interactive documents that can combine: metric charts, log query results (KQL), text, parameters (filters/dropdowns), and links — all in a single visual report. Workbooks can be shared with others and can include drill-down interactions. They support multiple data sources (metrics, logs, Azure Resource Graph) in one report. Metrics Explorer creates individual metric charts but can't combine with KQL or alerts. Azure Dashboards can pin charts but are limited in interactivity. Workbooks are purpose-built for comprehensive monitoring reports."
  },
  {
    id: 520,
    domain: 5,
    subdomain: "Azure Backup — Soft Delete",
    type: "single",
    question: "An administrator accidentally stops backup protection for a VM and selects 'Delete backup data'. The Recovery Services vault has soft delete enabled. What happens to the backup data?",
    options: [
      "The backup data is immediately and permanently deleted",
      "The backup data is retained for 14 additional days in a soft-deleted state and can be recovered",
      "The backup data is archived to an Azure Storage account for 30 days",
      "The backup data is retained indefinitely until explicitly purged by a global administrator"
    ],
    correct: [1],
    explanation: "Azure Backup soft delete (enabled by default on Recovery Services vaults) provides a safety net when backup data is deleted. When 'Delete backup data' is selected: the data enters a 'Soft Deleted' state, is retained for 14 days at no additional cost, and can be recovered by 'Undoing deletion' during this period. After 14 days, the data is permanently deleted. During the 14-day window, the backup item shows as 'Soft Deleted' in the vault. To prevent accidental deletion, soft delete can be set to 'Always-on' (irreversible). This feature protects against both accidental and malicious deletion."
  },
  {
    id: 521,
    domain: 5,
    subdomain: "Azure Monitor — Network Watcher",
    type: "single",
    caseStudy: {
      title: "Northwind Retail — Network Monitoring",
      background: "Northwind Retail has a complex Azure network with VNets in East US and West US connected via VNet peering. They have NSGs on all subnets. Their web application VMs in East US cannot reach a database VM in West US. The database VM has an NSG on its subnet. The security team needs to identify whether NSG rules or routing is causing the connectivity failure.",
      topology: "WebVM (East US, 10.1.0.4) → VNet Peering → DbVM (West US, 10.2.0.5, port 1433). NSG 'DB-NSG' is applied to the DbVM's subnet in West US."
    },
    question: "You need to determine if an NSG rule is blocking traffic from WebVM to DbVM on port 1433. Which Network Watcher tool should you use?",
    options: [
      "Connection Monitor — create a test from WebVM to DbVM:1433 and check connectivity",
      "IP Flow Verify — specify source IP 10.1.0.4, destination 10.2.0.5, port 1433, and check the result",
      "Next Hop — check the route from WebVM to DbVM's IP",
      "Packet Capture — capture packets on DbVM's NIC and filter for port 1433"
    ],
    correct: [1],
    explanation: "IP Flow Verify is the correct tool to diagnose NSG blocking. It simulates a specific flow (source IP, destination IP, port, protocol, direction) and tells you: allowed or denied, and which specific NSG rule caused the result. Run it targeting DbVM, specifying source IP 10.1.0.4, destination 10.2.0.5, port 1433, TCP, inbound — it will immediately tell you if DB-NSG is blocking the traffic and which rule. Next Hop diagnoses routing issues (not NSG). Connection Monitor tests real connectivity over time. Packet Capture requires the traffic to actually reach the VM."
  },
  {
    id: 522,
    domain: 5,
    subdomain: "Azure Monitor — Network Watcher",
    type: "single",
    caseStudy: {
      title: "Northwind Retail — Network Monitoring",
      background: "Same case study as Q521. IP Flow Verify confirmed that NSG rules are allowing the traffic, but connectivity still fails."
    },
    question: "Since NSG rules are not blocking the traffic, you suspect a routing issue. Which Network Watcher tool should you use next?",
    options: [
      "IP Flow Verify — run again with different parameters",
      "Next Hop — specify WebVM and destination IP 10.2.0.5 to check the routing path",
      "Topology — view the VNet topology to check if peering is configured",
      "Connection Troubleshoot — run a one-time connectivity test from WebVM to DbVM"
    ],
    correct: [1],
    explanation: "Next Hop determines what the next routing hop would be for traffic from a specific VM to a specific destination. If VNet peering is misconfigured or a UDR is sending traffic to the wrong hop (or None), Next Hop will reveal it. Run Next Hop from WebVM targeting 10.2.0.5 — expected result is 'VNet Peering' with no specific next hop IP. If it shows 'None' or an unexpected hop, you've found the routing issue. Connection Troubleshoot tests connectivity but doesn't isolate routing vs. NSG. Topology shows the visual network map but doesn't diagnose routing."
  },
  {
    id: 523,
    domain: 5,
    subdomain: "Azure Backup — MARS Agent",
    type: "single",
    question: "You need to back up files and folders from an on-premises Windows Server directly to an Azure Recovery Services vault, without deploying Azure Backup Server. Which agent should you install on the on-premises server?",
    options: [
      "Microsoft Azure Recovery Services (MARS) agent",
      "Azure Monitor Agent (AMA)",
      "Microsoft Monitoring Agent (MMA/OMS)",
      "Azure Site Recovery Mobility Service agent"
    ],
    correct: [0],
    explanation: "The MARS agent (Microsoft Azure Recovery Services agent) enables direct backup of files, folders, and Windows System State from on-premises Windows servers and Windows client machines directly to a Recovery Services vault. No additional server infrastructure is needed. MARS supports up to 3 backups per day, file-level restore, and retention up to 99 years. AMA and MMA are monitoring agents for sending telemetry to Log Analytics. ASR Mobility Service is for disaster recovery replication, not backup."
  },
  {
    id: 524,
    domain: 5,
    subdomain: "Azure Monitor — Alerts",
    type: "yesno",
    scenario: "You have an Azure Monitor alert rule configured to fire when a storage account's transactions exceed 10,000 per minute. The alert is currently in 'Fired' state. You fix the underlying issue and the transaction count drops below 10,000. The alert state changes to 'Resolved' automatically.",
    question: "Solution: Configure the action group to send a notification email when the alert fires AND when it resolves, so the team knows when the issue is cleared. Does this configuration notify the team of both events?",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes. Azure Monitor alert rules support notifications on both 'Fired' (when condition is met) and 'Resolved' (when condition is no longer met) state transitions. In the action group, you can configure notification actions that trigger on both states. When the alert auto-resolves (condition drops below threshold for the 'resolved' evaluation), the action group fires the 'resolved' notification. This is useful for operations teams to know when incidents automatically clear without manual acknowledgment."
  },
  {
    id: 525,
    domain: 5,
    subdomain: "Azure Monitor — Application Insights",
    type: "single",
    question: "You have a web application hosted on Azure App Service. You need to monitor application performance, track exceptions, measure page load times, and perform distributed tracing across microservices. Which Azure service should you configure?",
    options: [
      "Azure Monitor Log Analytics with custom application logs",
      "Application Insights — enable via the App Service 'Application Insights' blade",
      "Azure Monitor VM Insights",
      "Azure Diagnostics extension with IIS logs"
    ],
    correct: [1],
    explanation: "Application Insights is Azure Monitor's APM (Application Performance Management) feature designed for web applications. It provides: live metrics, exception tracking, dependency tracking (SQL, HTTP calls), distributed tracing (across microservices), browser/client performance (page load, AJAX calls), availability tests, usage analytics, and integration with Azure DevOps. Enable it from App Service's Application Insights blade (auto-instruments .NET, Node.js, Java apps without code changes) or via SDK for custom instrumentation. VM Insights is for infrastructure, not application-level tracing."
  },
  {
    id: 526,
    domain: 5,
    subdomain: "Azure Backup — Policy",
    type: "single",
    question: "You need to ensure that every Azure VM in a subscription is automatically enrolled in backup with a policy that retains daily backups for 30 days. You do not want to manually configure backup for each VM. What is the most scalable approach?",
    options: [
      "Create a backup policy and manually apply it to each VM in the Recovery Services vault",
      "Use an Azure Policy definition with effect 'deployIfNotExists' to automatically enable backup on VMs that are missing backup protection",
      "Create an Azure Automation runbook that runs daily and backs up VMs not yet protected",
      "Configure backup for a single VM and use ARM template export to replicate to other VMs"
    ],
    correct: [1],
    explanation: "Azure Policy with 'DeployIfNotExists' effect can automatically deploy backup configuration to VMs that match the policy scope (subscription, management group, resource group) and are not yet protected. Microsoft provides built-in policy definitions like 'Configure backup on VMs without a backup policy' and 'Configure backup on virtual machines with a given tag'. When a new VM is created or an existing VM is found without backup, the policy automatically creates the backup item using the specified Recovery Services vault and backup policy. This is the scalable, governance-driven approach for enterprise environments."
  },
  {
    id: 527,
    domain: 5,
    subdomain: "Azure Monitor — Service Health",
    type: "single",
    question: "You need to receive notifications when an Azure service in East US experiences an outage that affects your subscription's resources. Which Azure Monitor feature should you configure?",
    options: [
      "Create a metric alert on Azure infrastructure metrics",
      "Configure Service Health alerts in Azure Monitor",
      "Enable Resource Health for each individual resource",
      "Create an Activity Log alert for 'ServiceHealth' event type"
    ],
    correct: [1],
    explanation: "Azure Service Health provides personalized alerts about Azure service issues that affect YOUR subscription and resources (not generic status page updates). Configure Service Health alerts in Azure Monitor → Service Health → Health alerts. You can filter by: event type (Service issue, Planned maintenance, Health advisories), region (East US), and services. When an outage occurs in East US affecting your subscription, you receive the alert. Resource Health shows individual resource health status but doesn't proactively alert. Activity Log alerts can capture Service Health events (category: ServiceHealth) but Service Health alerts UI provides a more guided experience."
  },
  {
    id: 528,
    domain: 5,
    subdomain: "Azure Backup — SQL",
    type: "single",
    question: "You have a SQL Server running on an Azure VM. You need to back up SQL databases with a recovery point objective (RPO) of 15 minutes, retaining backups for 35 days. Which backup solution should you use?",
    options: [
      "Azure VM backup to capture the entire VM including SQL data files",
      "SQL Server Always On with a replica in another region",
      "Azure Backup for SQL Server in Azure VMs, with hourly log backups and 35-day retention",
      "SQL Server native backup to Azure Blob Storage using Backup to URL"
    ],
    correct: [2],
    explanation: "Azure Backup for SQL Server in Azure VMs provides: automated transaction log backups every 15 minutes (meeting 15-minute RPO), full and differential backups, retention up to 35 days (within standard policy limits), and point-in-time restore capability. Azure VM backup captures crash-consistent snapshots of the whole VM disk but cannot provide 15-minute RPO for SQL. SQL Always On is replication/HA, not backup. Native Backup to URL requires manual management. Azure Backup for SQL is the Azure-native, managed solution that achieves the 15-minute RPO requirement."
  },
  {
    id: 529,
    domain: 5,
    subdomain: "Azure Monitor — Cost",
    type: "single",
    question: "You have a Log Analytics workspace that is ingesting 50 GB of data per day. You want to reduce costs while maintaining the ability to query all data. Which pricing tier option should you consider?",
    options: [
      "Switch to Pay-As-You-Go tier which charges per GB and has no commitment",
      "Enable Commitment Tiers (previously Capacity Reservations) for 50 GB/day which provides a discount over Pay-As-You-Go",
      "Reduce data collection by disabling all diagnostic settings",
      "Create multiple workspaces to split the data across them and reduce per-workspace cost"
    ],
    correct: [1],
    explanation: "Log Analytics Commitment Tiers (formerly Capacity Reservations) offer significant discounts (up to 30%+ off) compared to Pay-As-You-Go pricing when you commit to a minimum daily ingestion (100, 200, 300, 400, 500, 1000, 2000, 5000 GB/day tiers). At 50 GB/day, the 100 GB/day commitment tier may still provide savings if you have burst ingestion. You only pay the commitment tier rate for actual ingestion up to the commitment, and overage at Pay-As-You-Go. Splitting across multiple workspaces doesn't reduce per-GB cost. Disabling diagnostic settings reduces costs but also removes visibility."
  },
  {
    id: 530,
    domain: 5,
    subdomain: "Azure Site Recovery — Replication",
    type: "multi",
    question: "You are configuring Azure Site Recovery for Azure-to-Azure VM replication. Which three statements about ASR replication are correct? (Choose three)",
    options: [
      "ASR continuously replicates VM disk changes to the target region, achieving near-zero RPO",
      "Recovery points are created at multiple frequencies: crash-consistent (every 5 minutes) and app-consistent (configurable)",
      "ASR requires the installation of the Mobility Service agent on each replicated VM",
      "ASR can replicate VMs that are in an Azure Availability Zone to another zone in the same region",
      "ASR always requires a dedicated subnet in the target VNet — it cannot use existing subnets"
    ],
    correct: [0, 1, 3],
    explanation: "Correct ASR facts: (A) True — ASR replicates block-level changes continuously using the Site Recovery replication engine, typically achieving RPO < 15 minutes in practice. (B) True — crash-consistent recovery points are taken every 5 minutes (capturing disk state); app-consistent points are taken per schedule (default every 4 hours) and involve quiescing the OS for consistent application state. (C) False for Azure-to-Azure — Mobility Service is required for on-premises VMware/physical to Azure, but Azure-to-Azure replication is agentless for the base replication (uses Azure built-in mechanisms). (D) True — ASR supports zone-to-zone replication (ZtZ) within the same region. (E) False — ASR creates pre-configured target network mappings and can use existing subnets."
  }
]);
