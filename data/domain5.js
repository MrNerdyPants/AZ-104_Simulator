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


// ─── Microsoft Practice Assessment — Domain 5 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 551,
    domain: 5,
    subdomain: "Alerts",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure virtual network named VNet1.\nYou need to ensure that email is sent to an administrator when a virtual machine is connected to VNet1.\nWhat two settings should you configure? Each correct answer presents part of the solution.",
    options: [
      "an action group",
      "an alert processing rule",
      "an alert rule",
      "a mail-enabled security group",
      "a Microsoft 365 group"
    ],
    correct: [0, 2],
    explanation: "The correct answers are an action group and an alert rule. An alert rule in Azure Monitor is used to detect a specific condition or event—in this case, when a virtual machine is connected to VNet1. The alert rule monitors the relevant activity or resource signal and triggers when the defined condition occurs. An action group defines what happens when the alert fires, such as sending an email notification to an administrator. Therefore, the alert rule detects the event, and the action group performs the notification action. The other options do not directly provide the mechanism to both detect the event and send the email notification."
  },
  {
    id: 552,
    domain: 5,
    subdomain: "Azure Monitor",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains the following resources:\nEight virtual networks\n24 virtual machines\n16 storage accounts\nYou need to implement a monitoring solution that provides the ability to view diagnostics and telemetry data generated by Azure resources.\nWhat should you include in the solution?",
    options: [
      "a Log Analytics workspace",
      "an Azure Machine Learning workspace",
      "metrics logs",
      "resource logs"
    ],
    correct: [0],
    explanation: "A Log Analytics workspace is a unique environment for log data from Azure Monitor and other Azure services, such as Microsoft Sentinel and Microsoft Defender for Cloud. Each workspace has its own data repository and configuration and can combine data from multiple services."
  },
  {
    id: 553,
    domain: 5,
    subdomain: "Network Watcher",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a resource group named RG1. RG1 contains two virtual machines named VM1 and VM2.\nYou need to inspect all the network traffic from VM1 to VM2. The solution must use Azure Monitor metrics.\nWhich two actions should you perform? Each correct answer presents part of the solution.",
    options: [
      "Configure a log alert.",
      "Configure Network In and Network Out.",
      "Install AzureNetworkWatcherExtension.",
      "Use packet capture."
    ],
    correct: [2, 3],
    explanation: "Azure Network Watcher variable packet capture allows you to create packet capture sessions to track traffic to and from a virtual machine. Packet capture helps to diagnose network anomalies both reactively and proactively. The AzureNetworkWatcherExtension must be installed on the virtual machine to enable packet capture."
  },
  {
    id: 554,
    domain: 5,
    subdomain: "Alerts",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have 100 virtual machines deployed to Azure. You have Azure Monitor alerts configured for CPU and memory utilization for the virtual machines.\nYou open Azure Monitor alerts and discover 50 closed alerts for the virtual machines.\nWhat can cause the alert state to be Closed?",
    options: [
      "An administrator manually changed the state of the alerts.",
      "The alerts are older than 60 days.",
      "The alert rule contains an action group that remediates the alert conditions.",
      "The conditions that caused the alerts are no longer present."
    ],
    correct: [0],
    explanation: "The alert state is manually set by the user and does not have any automated logic behind it. The alert state can be either New, Acknowledged, or Closed."
  },
  {
    id: 555,
    domain: 5,
    subdomain: "Azure Backup",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription named Sub1 that contains a resource group named RG1 and an on-premises server named Server1 that runs Windows Server.\nYou plan to back up files and folders from Server1 to Azure by using Azure Backup.\nIn RG1, you create a Recovery Services vault named Vault1.\nYou install the Microsoft Azure Recovery Services (MARS) agent on Server1.\nYou need to ensure that Server1 can back up data to Vault1.\nWhat should you do next?",
    options: [
      "Create a backup policy for Vault1.",
      "Download the credentials of Vault1 and register Server1 with Vault1.",
      "Enable soft delete for Vault1.",
      "Modify the security settings of Vault1."
    ],
    correct: [1],
    explanation: "Correct – Downloading the vault credentials and registering the server with the Recovery Services vault is required before any backup operations can occur, because this establishes trust between the on-premises server and the vault.\nIncorrect – Configuring a backup policy, enabling soft delete, or modifying the vault security settings can be performed only after the server is registered and recognized by the vault, so these actions do not enable backup connectivity on their own."
  },
  {
    id: 556,
    domain: 5,
    subdomain: "Azure Advisor",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains 200 virtual machines.\nYou plan to use Azure Advisor to provide cost recommendations.\nYou need to ensure that all Azure admins are notified whenever an Advisor alert is generated. The solution must minimize administrative effort.\nWhat should you include in the solution?",
    options: [
      "an action group",
      "an application security group",
      "an Azure Automation account",
      "a capacity reservation group"
    ],
    correct: [0],
    explanation: "Whenever Azure Advisor detects a new recommendation for resources, an event is stored in the Azure Activity log. You can set up alerts for these events from Azure Advisor. You can select a subscription and optionally a resource group to specify the resources for which you want to receive alerts. You also need to create an action group that will contain all the users to be notified."
  },
  {
    id: 557,
    domain: 5,
    subdomain: "Azure Backup",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure virtual machine named Server1 that runs Windows Server.\nYou need to configure Azure Backup to back up files and folders.\nWhat should you install on Server1?",
    options: [
      "the Microsoft Azure Recovery Services (MARS) agent",
      "the Azure Monitor Agent (AMA)",
      "the Microsoft Azure Site Recovery (ASR) provider",
      "the Microsoft Monitoring Agent (MMA)"
    ],
    correct: [0],
    explanation: "The Microsoft Azure Recovery Service (MARS) agent must be installed on the servers. The MARS agent is mandatory to perform backup and recovery services for any servers."
  },
  {
    id: 558,
    domain: 5,
    subdomain: "Alerts",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You need to create Azure alerts based on metric values and activity log events.\nThe solution must meet the following requirements:\nSet a limit on how many times an alert notification is sent.\nCall an Azure function when an alert is triggered.\nConfigure the alert to have a severity of warning when triggered.\nWhich two resources should you create? Each correct answer presents part of the solution.",
    options: [
      "an action group",
      "an alert rule",
      "an alert processing rule",
      "a notification"
    ],
    correct: [0, 1],
    explanation: "You must create an action group to set up an action and create an alert rule to set the severity of the errors. A notification is only used to send email and you do not need to call a webhook."
  },
  {
    id: 559,
    domain: 5,
    subdomain: "Azure Backup",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have multiple Azure virtual machines and an Azure recovery services vault. Virtual machines are configured with the default backup policy.\nWhat is the retention period of virtual machine backups in the default backup policy?",
    options: [
      "30 days",
      "7 days",
      "90 days",
      "180 days"
    ],
    correct: [0],
    explanation: "By default, backups of virtual machines are kept for 30 days."
  },
  {
    id: 560,
    domain: 5,
    subdomain: "Azure Backup",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a user named User1 and a Recovery Services vault named Vault1.\nYou use Azure Backup reports to monitor the status of protected resources.\nYou need to notify User1 by email when a backup report shows a Failure status. The solution must minimize administrative effort.\nWhat should you do first?",
    options: [
      "Create an action group in Azure Monitor.",
      "Modify the properties of Vault1.",
      "Configure an alert processing rule.",
      "Assign User1 a role by using IAM on Vault1."
    ],
    correct: [0],
    explanation: "Correct – An action group must be created first to define the email notification target before it can be associated with any Azure Monitor alert, making it the required initial step when configuring backup alert notifications.\nIncorrect – Vault properties and IAM settings do not configure alert notifications, and alert processing rules are optional post-alert modifiers that cannot send notifications without an existing action group."
  },
  {
    id: 561,
    domain: 5,
    subdomain: "Azure Monitor",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have a Log Analytics workspace that collects data from various data sources.\nYou create a new Azure Monitor log query.\nYou plan to view data pinned as a chart to a shared dashboard.\nWhat is the maximum number of days for which data can be shown on the shared dashboard?",
    options: [
      "30",
      "7",
      "90",
      "365"
    ],
    correct: [0],
    explanation: "Data shown on a shared dashboard can only be displayed for a maximum of 30 days."
  },
  {
    id: 562,
    domain: 5,
    subdomain: "Site Recovery",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure virtual machine named VM1 that is protected by using Azure Site Recovery.\nYou fail over VM1 from the primary region to the secondary region.\nYou need to reprotect VM1 after the failover so that VM1 will replicate back to the primary region.\nWhat is the VM1 status before the reprotection?",
    options: [
      "Failover committed",
      "Failover in progress",
      "Replication enabled",
      "Failback completed"
    ],
    correct: [0],
    explanation: "Before you begin, you must ensure that the virtual machine status is Failover committed. This will ensure replication back to the primary region."
  }
]);


// ─── Original Practice Questions — Domain 5 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 563,
    domain: 5,
    subdomain: "Log Analytics — KQL",
    type: "single",
    source: "Original Practice",
    question: "You have a Log Analytics workspace that collects VM performance data into the Perf table. You need a KQL query that returns the average CPU per computer in 1-hour buckets over the last 24 hours, suitable for a time chart. Which query is correct?",
    options: [
      "Perf | where TimeGenerated > ago(24h) | where CounterName == \"% Processor Time\" | summarize avg(CounterValue) by Computer, bin(TimeGenerated, 1h) | render timechart",
      "Perf | where TimeGenerated > ago(24h) | where CounterName == \"% Processor Time\" | summarize avg(CounterValue) by Computer | sort by TimeGenerated | render barchart",
      "Perf | where TimeGenerated > ago(24h) | top 1h by CounterValue | project Computer, CounterValue | render piechart",
      "Perf | where TimeGenerated > ago(24h) | extend bucket = 1h | summarize avg(CounterValue) by bucket | render scatterchart"
    ],
    correct: [0],
    explanation: "To chart a metric over time you must group by a time bucket. The bin() function rounds TimeGenerated down to fixed intervals (here 1h), so summarize avg(CounterValue) by Computer, bin(TimeGenerated, 1h) produces one average per computer per hour. render timechart then plots the series over time.\n- Option B has no time bucket in the summarize, so all 24 hours collapse into a single value per computer — there is nothing to plot over time.\n- Option C: 'top 1h' is not valid syntax; top takes a number, and a pie chart is not a time series.\n- Option D: 'extend bucket = 1h' just creates a constant column equal to the timespan 1h; it does not bucket TimeGenerated.",
    reference: "https://learn.microsoft.com/en-us/azure/azure-monitor/logs/get-started-queries"
  },
  {
    id: 564,
    domain: 5,
    subdomain: "Log Analytics — KQL",
    type: "single",
    source: "Original Practice",
    question: "You need a KQL query that lists every computer reporting heartbeats but that has NOT generated any record in the Perf table in the last hour, to find VMs where the performance counters stopped. Which approach correctly combines the two tables?",
    options: [
      "Heartbeat | join kind=inner (Perf) on Computer | where TimeGenerated > ago(1h)",
      "Heartbeat | where TimeGenerated > ago(1h) | distinct Computer | join kind=leftanti (Perf | where TimeGenerated > ago(1h) | distinct Computer) on Computer",
      "union Heartbeat, Perf | where TimeGenerated > ago(1h) | summarize count() by Computer",
      "Heartbeat | where TimeGenerated > ago(1h) | join kind=fullouter (Perf) on TimeGenerated"
    ],
    correct: [1],
    explanation: "A leftanti join returns rows from the left table that have NO match in the right table. Taking the distinct computers from Heartbeat and leftanti-joining the distinct computers from Perf returns exactly the computers that sent a heartbeat but produced no Perf records in the last hour.\n- Option A (inner join) returns only computers present in BOTH tables — the opposite of what is needed.\n- Option C unions the tables and counts; it cannot express 'present in one but absent in the other'.\n- Option D joins on TimeGenerated rather than Computer, which is meaningless for matching machines, and fullouter does not isolate the missing set.",
    reference: "https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/joinoperator"
  },
  {
    id: 565,
    domain: 5,
    subdomain: "Azure Monitor Alerts — Dynamic Thresholds",
    type: "single",
    source: "Original Practice",
    question: "You manage 300 VMs with widely varying baseline CPU patterns (some are busy at night, others during the day). You need a single metric alert rule that learns each VM's normal pattern and alerts on abnormal CPU spikes without you hand-tuning a static threshold per VM. What should you configure?",
    options: [
      "A static threshold metric alert at 80% applied to all 300 VMs",
      "A metric alert using Dynamic Thresholds, applied at scale to all 300 VMs",
      "A log alert with a fixed KQL threshold of CounterValue > 80",
      "An activity log alert filtered to high CPU events"
    ],
    correct: [1],
    explanation: "Dynamic Thresholds use machine learning to establish each resource's normal metric baseline (including daily/weekly seasonality) and alert when the value deviates abnormally. Because the threshold is computed per resource, a single rule scoped to all 300 VMs adapts to each VM's individual pattern — no manual per-VM tuning.\n- A static 80% threshold ignores that 'normal' differs per VM, producing false positives on naturally busy VMs and missing anomalies on idle ones.\n- A fixed KQL threshold has the same static problem and adds query cost.\n- Activity log alerts capture control-plane operations, not CPU metric values, so they cannot detect a CPU spike.",
    reference: "https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-dynamic-thresholds"
  },
  {
    id: 566,
    domain: 5,
    subdomain: "Azure Monitor — Action Groups",
    type: "multi",
    source: "Original Practice",
    question: "You are configuring an Azure Monitor action group. Which three of the following are valid notification or action types that can be added directly to an action group? Each correct answer presents part of the solution.",
    options: [
      "SMS notification to a phone number",
      "Azure Function action",
      "ITSM (IT Service Management) connector action",
      "A KQL log query that runs on a schedule",
      "A Data Collection Rule association"
    ],
    correct: [0, 1, 2],
    explanation: "Action groups define WHO is notified and WHAT automated action runs when an alert fires. Valid members include notifications (Email, SMS, Push to the Azure mobile app, Voice) and actions (Automation Runbook, Azure Function, Logic App, Webhook, Secure Webhook, Event Hub, and the ITSM connector).\n- SMS (A), Azure Function (B), and ITSM connector (C) are all valid action group members.\n- A scheduled KQL log query (D) is the definition of a log alert RULE, not an action group member.\n- A Data Collection Rule association (E) controls data collection by the Azure Monitor Agent and is unrelated to action groups.",
    reference: "https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/action-groups"
  },
  {
    id: 567,
    domain: 5,
    subdomain: "Azure Monitor — Alert Processing Rules",
    type: "single",
    source: "Original Practice",
    question: "You schedule monthly maintenance on all VMs in a resource group named RG-Maint between 01:00 and 03:00 on the first Sunday of each month. During this window you do not want any of the existing metric or log alerts for those resources to send notifications, but you do not want to disable or modify each individual alert rule. What should you configure?",
    options: [
      "An alert processing rule scoped to RG-Maint that suppresses notifications on a recurring schedule",
      "A separate action group with no receivers and attach it to every alert rule",
      "Set the alert rules to Disabled and re-enable them after maintenance each month",
      "A diagnostic setting on RG-Maint that pauses Azure Monitor during the window"
    ],
    correct: [0],
    explanation: "Alert processing rules act on alerts AFTER they fire and can suppress notifications for a defined scope (resource group, subscription, resource) on a one-time or recurring schedule. A rule scoped to RG-Maint with a recurring 01:00–03:00 first-Sunday schedule suppresses all matching alert notifications without touching any individual alert rule.\n- Swapping action groups would require editing every rule and reverting later — high effort and error-prone.\n- Manually disabling/re-enabling rules is exactly the per-rule effort the requirement forbids.\n- Diagnostic settings route logs/metrics to destinations; they cannot 'pause' alerting.",
    reference: "https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-processing-rules"
  },
  {
    id: 568,
    domain: 5,
    subdomain: "Azure Monitor — Network Watcher",
    type: "single",
    source: "Original Practice",
    question: "You need to continuously measure latency, packet loss, and reachability between an Azure VM and an external HTTPS endpoint over time, with historical trend data and alerting when a threshold is crossed. Which Network Watcher feature should you use?",
    options: [
      "IP Flow Verify",
      "Connection Monitor",
      "Next Hop",
      "Effective Security Rules"
    ],
    correct: [1],
    explanation: "Connection Monitor provides ongoing, scheduled connectivity monitoring. It continuously tests reachability, round-trip latency, and packet loss between sources (VMs or on-prem agents) and destinations (VMs, FQDNs, URLs, IPs), stores the results for trend analysis in a Log Analytics workspace, and can raise metric alerts when thresholds are breached.\n- IP Flow Verify performs a single point-in-time check of whether an NSG allows a specific flow; it does not measure latency or run continuously.\n- Next Hop returns the routing next hop for a single flow — no latency/loss data.\n- Effective Security Rules shows the aggregated NSG rules applied to a NIC; it does no active testing.",
    reference: "https://learn.microsoft.com/en-us/azure/network-watcher/connection-monitor-overview"
  },
  {
    id: 569,
    domain: 5,
    subdomain: "Azure Monitor — Application Insights",
    type: "single",
    source: "Original Practice",
    question: "Your web app is instrumented with Application Insights. You need to be alerted within minutes if the application becomes unreachable from multiple geographic locations, even when no users are currently visiting the site. Which Application Insights capability should you configure?",
    options: [
      "Adaptive sampling",
      "A standard (URL ping / multi-step) availability test",
      "Smart Detection failure anomalies",
      "Live Metrics Stream"
    ],
    correct: [1],
    explanation: "Availability tests (standard URL ping tests, or multi-step tests) proactively send synthetic requests to your URL from multiple Azure regions on a schedule. They detect outages even with zero real user traffic and can alert when the site fails from a configurable number of locations.\n- Adaptive sampling reduces telemetry volume to control cost; it does not test availability.\n- Smart Detection failure anomalies analyzes the rate of failed REAL requests, so it needs live traffic and will not fire when nobody is using the site.\n- Live Metrics Stream is a real-time dashboard for manual observation, not an automated alerting probe.",
    reference: "https://learn.microsoft.com/en-us/azure/azure-monitor/app/availability-overview"
  },
  {
    id: 570,
    domain: 5,
    subdomain: "Azure Monitor — Data Collection Rules",
    type: "yesno",
    source: "Original Practice",
    scenario: "You deploy the Azure Monitor Agent to 50 Windows VMs. You create one Data Collection Rule (DCR) named DCR-Security that collects the Windows Security event log and sends it to a Log Analytics workspace. You associate DCR-Security with all 50 VMs. Later you create a second DCR named DCR-Perf that collects performance counters to the same workspace, and you also associate it with the same 50 VMs.",
    question: "Statement: A single VM running the Azure Monitor Agent can have multiple Data Collection Rules associated with it simultaneously, so all 50 VMs will collect both the security events and the performance counters. Is this statement correct?",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes. A VM with the Azure Monitor Agent can be associated with multiple Data Collection Rules at the same time, and the agent merges their instructions. The DCR associations are additive: DCR-Security contributes Windows Security event collection and DCR-Perf contributes performance counter collection, so each of the 50 VMs collects both data types. This modular design lets you compose reusable, single-purpose DCRs (one for security logs, one for performance, etc.) and apply them independently across machines.",
    reference: "https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/data-collection-rule-overview"
  },
  {
    id: 571,
    domain: 5,
    subdomain: "Azure Backup — Instant Restore",
    type: "single",
    source: "Original Practice",
    question: "After triggering an Azure VM backup, you notice recovery points are available for fast restore for a limited time before being transferred to the vault. You need to control how many days these local snapshots are kept for instant (snapshot-based) restore. Which backup policy setting controls this?",
    options: [
      "The instant restore snapshot retention range (1 to 5 days)",
      "The cross-region restore toggle",
      "The yearly recovery point retention",
      "The soft delete retention period"
    ],
    correct: [0],
    explanation: "Azure VM backup first takes a local snapshot, which is kept for fast 'instant restore' before the recovery point is transferred into the vault. The instant restore snapshot retention is configurable in the backup policy from 1 to 5 days (default 2). Higher values mean faster restores for more days but slightly higher snapshot storage cost.\n- Cross-region restore is about restoring from the GRS secondary region, not snapshot retention.\n- Yearly recovery point retention governs long-term vault-tier copies, not local snapshots.\n- Soft delete retention (14 days) protects deleted backup data, unrelated to the instant restore window.",
    reference: "https://learn.microsoft.com/en-us/azure/backup/backup-instant-restore-capability"
  },
  {
    id: 572,
    domain: 5,
    subdomain: "Azure Backup — Security",
    type: "multi",
    source: "Original Practice",
    question: "To protect backups against a malicious admin or ransomware scenario, you want to harden a Recovery Services vault. Which two features specifically help prevent unauthorized or accidental destruction of backup data? Each correct answer presents part of the solution.",
    options: [
      "Multi-user authorization (MUA) using a Resource Guard",
      "Immutability (immutable vault) to block deletion of recovery points before expiry",
      "Switching the vault replication from GRS to LRS",
      "Disabling soft delete on the vault",
      "Reducing the daily backup frequency"
    ],
    correct: [0, 1],
    explanation: "Two vault-hardening features directly defend backup data:\n- Multi-user authorization (MUA) uses a Resource Guard so that critical destructive operations (disabling soft delete, deleting backup data, stopping protection with delete) require approval from a second security principal, blocking a single rogue admin.\n- Immutability (immutable vault) prevents recovery points from being deleted or shortened before their expiry, defending against tampering.\n- Switching to LRS reduces durability and offers no protection against deletion.\n- Disabling soft delete REMOVES a protection — the opposite of hardening.\n- Backup frequency has no security effect.",
    reference: "https://learn.microsoft.com/en-us/azure/backup/multi-user-authorization-concept"
  },
  {
    id: 573,
    domain: 5,
    subdomain: "Azure Backup — MABS",
    type: "single",
    source: "Original Practice",
    question: "You have an on-premises environment with VMware VMs, application-aware workloads (SQL Server, SharePoint), and a requirement to keep short-term backups on a local disk for fast restore while sending long-term copies to Azure. Which Azure Backup component should you deploy on-premises?",
    options: [
      "The MARS agent installed directly on each guest",
      "Microsoft Azure Backup Server (MABS)",
      "Azure Site Recovery mobility service",
      "The Azure Monitor Agent with a Data Collection Rule"
    ],
    correct: [1],
    explanation: "Microsoft Azure Backup Server (MABS) is built for richer on-premises scenarios. It provides application-aware backup (SQL Server, SharePoint, Exchange, Hyper-V/VMware VMs), keeps short-term recovery points on local disk for fast restore, and tiers long-term copies to a Recovery Services vault in Azure — no System Center license required.\n- The MARS agent alone backs up only files, folders, and Windows system state, with no app-aware or local-disk staging.\n- ASR mobility service is for disaster-recovery replication, not backup.\n- The Azure Monitor Agent collects telemetry; it does not perform backups.",
    reference: "https://learn.microsoft.com/en-us/azure/backup/backup-azure-microsoft-azure-backup"
  },
  {
    id: 574,
    domain: 5,
    subdomain: "Azure Monitor — Activity Log",
    type: "yesno",
    source: "Original Practice",
    scenario: "A compliance auditor asks you to produce Azure subscription control-plane operations (resource creates, deletes, and role assignments) from 8 months ago. Your team has never configured any diagnostic setting to export the Activity Log to another destination.",
    question: "Solution: Open the Activity Log blade in the Azure portal, set the time range to the relevant period 8 months ago, and export the listed events. Does this retrieve the required records?",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "No. The Azure Activity Log is retained in the platform for only 90 days. Events from 8 months ago are no longer available unless they were exported beforehand. To retain Activity Log data longer, you must create a diagnostic setting that routes it to a Log Analytics workspace (with your chosen retention), an Azure Storage account (for cheap long-term archive), and/or an Event Hub. Because no such export was ever configured, the 8-month-old records cannot be retrieved.",
    reference: "https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/activity-log"
  },
  {
    id: 575,
    domain: 5,
    subdomain: "Azure Monitor — Log Alerts",
    type: "single",
    source: "Original Practice",
    question: "You create a log search (KQL) alert rule that counts errors per server. You want a SEPARATE alert to fire for each server that breaches the threshold, rather than one combined alert for all servers. Which configuration achieves this?",
    options: [
      "Split the alert by dimensions, choosing the Computer column as the dimension",
      "Set the alert's aggregation granularity to 1 minute",
      "Increase the number of evaluation periods (Aggregation over multiple periods)",
      "Enable the 'mute actions' setting on the alert rule"
    ],
    correct: [0],
    explanation: "Log alert rules support splitting by dimensions. When you select a column such as Computer as a dimension, Azure Monitor evaluates the threshold per distinct value and creates an individual alert (and individual resolution) for each server that breaches it, rather than a single aggregate alert.\n- Aggregation granularity changes the time bucket size, not whether alerts are split per entity.\n- Adding more evaluation periods changes how many windows must breach before firing; it does not separate by server.\n- 'Mute actions' temporarily stops notifications after firing; it does not produce per-server alerts.",
    reference: "https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-types"
  },
  {
    id: 576,
    domain: 5,
    subdomain: "Azure Monitor — Network Watcher",
    type: "single",
    source: "Original Practice",
    question: "You need to capture and analyze the volume and pattern of IP traffic flowing through your network security groups, then visualize top talkers, blocked flows, and traffic by region on a dashboard. Which combination should you configure?",
    options: [
      "NSG flow logs sent to a storage account, with Traffic Analytics enabled (using a Log Analytics workspace)",
      "IP Flow Verify scheduled to run every 5 minutes",
      "Packet capture saved to a storage account and parsed manually",
      "Connection Monitor between every pair of VMs"
    ],
    correct: [0],
    explanation: "NSG flow logs record information about ingress and egress IP traffic through a network security group and are written to an Azure Storage account. Traffic Analytics then processes those flow logs using a Log Analytics workspace to provide rich visualizations — top talkers, allowed vs. blocked flows, traffic geography, and malicious flow detection — on a dashboard.\n- IP Flow Verify only tests one simulated flow; it produces no traffic-volume analytics.\n- Manually parsing packet captures does not scale and lacks built-in dashboards.\n- Connection Monitor measures connectivity/latency between defined endpoints, not aggregate NSG traffic patterns.",
    reference: "https://learn.microsoft.com/en-us/azure/network-watcher/traffic-analytics"
  },
  {
    id: 577,
    domain: 5,
    subdomain: "Azure Monitor — Concepts",
    type: "dragdrop",
    source: "Original Practice",
    question: "Match each Azure monitoring or backup task to the most appropriate Azure feature.",
    dragItems: [
      "Query historical log data across resources using KQL",
      "Visualize a single platform metric trend in near real time without writing queries",
      "Receive personalized notifications about Azure platform outages affecting your subscription",
      "See the current up/down availability status of one specific Azure resource"
    ],
    dropZones: [
      "Log Analytics (Logs)",
      "Metrics Explorer",
      "Azure Service Health",
      "Azure Resource Health"
    ],
    correct: [[0, 0], [1, 1], [2, 2], [3, 3]],
    explanation: "These four Azure Monitor surfaces serve distinct purposes:\n- Log Analytics (Logs): run KQL queries over collected log and performance data across many resources for historical analysis and correlation.\n- Metrics Explorer: chart numeric platform metrics over time interactively, with no query language required.\n- Azure Service Health: personalized alerts and dashboards about Azure-side service issues, planned maintenance, and health advisories affecting YOUR subscriptions.\n- Azure Resource Health: shows the current health/availability state of an individual resource and explains why it may be unavailable.",
    reference: "https://learn.microsoft.com/en-us/azure/azure-monitor/overview"
  }
]);


// ─── Microsoft Practice Assessment (Attempt 2b additions) — Domain 5 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 578,
    domain: 5,
    subdomain: "Azure Advisor",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains hundreds of virtual machines that were migrated from a local datacenter.\nYou need to identify which virtual machines are underutilized.\nWhich Azure Advisor category (settings) should you use?",
    options: ["Cost", "Performance", "High availability", "Operational excellence"],
    correct: [0],
    explanation: "The Cost category in Azure Advisor helps you optimize and reduce overall Azure spending, including identifying underutilized (or idle) virtual machines so they can be resized or shut down.\n\nWhy the others are wrong:\n• Performance focuses on improving the speed and responsiveness of applications.\n• High availability is not an Azure Advisor category by that name (Advisor categories are Cost, Security, Reliability, Operational excellence, and Performance).\n• Operational excellence covers process/workflow efficiency, resource manageability, and deployment best practices — not utilization.",
    reference: "https://learn.microsoft.com/azure/advisor/advisor-cost-recommendations"
  },
  {
    id: 579,
    domain: 5,
    subdomain: "Azure Monitor",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure virtual machine that hosts a third-party application named App1.\nUsers report that they experience performance issues when they use the application.\nYou need to find the root cause of the performance issue.\nWhat should you use?",
    options: ["Azure Monitor", "Activity logs", "Azure Advisor", "Azure Cost Management"],
    correct: [0],
    explanation: "Azure Monitor collects and stores metrics in a time-series database optimized for analyzing time-stamped data, letting you correlate CPU, memory, disk, and other signals over time to find the root cause of a performance issue.\n\nWhy the others are wrong:\n• Activity logs record subscription/management-plane operations (who did what), not application performance telemetry.\n• Azure Advisor analyzes configuration and usage to make recommendations but does not provide the time-series data needed for root-cause analysis.\n• Azure Cost Management only helps optimize and reduce spending.",
    reference: "https://learn.microsoft.com/azure/azure-monitor/overview"
  },
  {
    id: 580,
    domain: 5,
    subdomain: "Log Analytics (KQL)",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have a Kusto query that returns 1,000 events from the SecurityEvent table in Azure Monitor.\nYou need to configure the query to aggregate the results by the Account column.\nWhich operator should you use?",
    options: ["summarize", "where", "project", "extend"],
    correct: [0],
    explanation: "The summarize operator groups (aggregates) rows by one or more columns and produces aggregate values (for example, count() by Account). It is the correct operator to aggregate results by the Account column.\n\nWhy the others are wrong:\n• where filters rows based on a condition.\n• project selects and renames columns.\n• extend adds calculated columns.",
    reference: "https://learn.microsoft.com/azure/data-explorer/kusto/query/summarizeoperator"
  }
]);
