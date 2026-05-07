var CASE_STUDIES = typeof CASE_STUDIES !== 'undefined' ? CASE_STUDIES : {};

// Each case study: id → { title, tabs: [{label, content}], questionIds: [...] }
// Questions in domain files reference caseStudyId to link back here.

CASE_STUDIES['contoso-network'] = {
  id: 'contoso-network',
  title: 'Contoso Ltd — Network Infrastructure Migration',
  image: 'images/cs_contoso_network.svg',
  tabs: [
    {
      label: 'Overview',
      content: `Contoso Ltd is a mid-size financial services company migrating from an on-premises datacenter in Chicago to Azure. They have 500 employees across three offices: Chicago (HQ), New York, and London. Their Azure environment consists of a single subscription with VNets in East US and UK South.`
    },
    {
      label: 'Current Environment',
      content: `On-premises (Chicago):
• Cisco ASA firewall with 192.168.0.0/16 address space
• Active Directory domain: contoso.local
• 120 Windows Server VMs (2016/2019)
• SharePoint farm, SQL Server cluster

Azure — East US:
• VNet1: 10.10.0.0/16 with subnets: AppSubnet (10.10.1.0/24), DataSubnet (10.10.2.0/24), GatewaySubnet (10.10.255.0/27)
• VPN Gateway (VpnGw1) connected to Chicago via S2S VPN
• 40 Azure VMs (web/app tier)

Azure — UK South:
• VNet2: 10.20.0.0/16 (London office)
• No gateway deployed yet
• 15 Azure VMs (European workloads)`
    },
    {
      label: 'Requirements',
      content: `REQ-1: London (UK South) VMs must access Chicago on-premises resources via the existing East US VPN Gateway without deploying a second gateway.
REQ-2: All internet-bound traffic from Azure VMs must pass through a centralized Azure Firewall in East US.
REQ-3: Azure administrators must access VMs via browser-based RDP/SSH without public IPs on VMs.
REQ-4: SQL Server VMs in DataSubnet must only be reachable from AppSubnet VMs on port 1433.
REQ-5: A new third-party vendor needs read-only access to blob storage. Access must be time-limited to 48 hours and revocable at any time.`
    },
    {
      label: 'Constraints',
      content: `• Budget: No new gateway deployments in UK South.
• Security: No public IP addresses on any VM.
• Compliance: All traffic between Azure and on-premises must be encrypted.
• Operations: Minimal management overhead for vendor access tokens.`
    }
  ],
  questionIds: [601, 602, 603, 604, 605]
};

CASE_STUDIES['fabrikam-identity'] = {
  id: 'fabrikam-identity',
  title: 'Fabrikam Inc — Identity and Governance Consolidation',
  image: 'images/cs_fabrikam_mgmt.svg',
  tabs: [
    {
      label: 'Overview',
      content: `Fabrikam Inc is a global manufacturing company with three subsidiaries: Fabrikam US, Fabrikam EU, and Fabrikam APAC. Each subsidiary had its own Azure subscription and Microsoft Entra ID tenant. They have completed a tenant consolidation and now use a single Entra ID tenant with three subscriptions managed under a Management Group hierarchy.`
    },
    {
      label: 'Management Group Hierarchy',
      content: `Root Management Group
└── Fabrikam-MG (Fabrikam Parent)
    ├── Corp-IT-MG
    │   ├── Production-Sub (Pay-as-you-go)
    │   └── Staging-Sub (Dev/Test)
    ├── FabrikamUS-MG
    │   └── FabUS-Sub
    ├── FabrikamEU-MG
    │   └── FabEU-Sub
    └── FabrikamAPAC-MG
        └── FabAPAC-Sub

Policies already assigned:
• Fabrikam-MG: 'Require a tag and its value on resources' (initiative)
• Corp-IT-MG: 'Allowed locations: East US, West US 2'
• Production-Sub: 'Not allowed resource types: Classic resources'`
    },
    {
      label: 'Current Issues',
      content: `Issue 1: A developer in FabUS-Sub accidentally deleted a production resource group containing 15 VMs and all their data.
Issue 2: EU compliance requires that all FabEU-Sub resources stay within European Azure regions (West Europe, North Europe). Currently, resources can be deployed anywhere.
Issue 3: The Corp IT security team needs to review privileged role assignments monthly. Currently there is no process for this — 12 users have Owner role at subscription level with no expiration.
Issue 4: Fabrikam needs to track cloud spend per subsidiary. Currently costs are visible at subscription level but not aggregated by subsidiary.`
    },
    {
      label: 'Requirements',
      content: `REQ-1: Prevent accidental deletion of resource groups containing production VMs.
REQ-2: Enforce that FabEU-Sub resources can only be deployed to West Europe or North Europe.
REQ-3: Implement a process for quarterly review and renewal of Owner role assignments in Corp-IT-MG.
REQ-4: Enable cost reporting aggregated per subsidiary management group.
REQ-5: All new users must complete MFA registration within 14 days of account creation.`
    }
  ],
  questionIds: [606, 607, 608, 609, 610]
};

CASE_STUDIES['woodgrove-compute'] = {
  id: 'woodgrove-compute',
  title: 'Woodgrove Bank — Compute Modernization',
  image: 'images/cs_woodgrove_compute.svg',
  tabs: [
    {
      label: 'Overview',
      content: `Woodgrove Bank is migrating its core banking applications to Azure. They are moving from physical servers running Windows Server 2016 to Azure VMs and containerized workloads. The migration is to East US 2 (primary) with disaster recovery to Central US.`
    },
    {
      label: 'Existing Infrastructure',
      content: `Applications to migrate:
• CoreBanking: Java monolith, requires 32 vCPUs, 256 GB RAM, ultra-low latency to SQL
• WebPortal: .NET 6 web app, stateless, horizontally scalable, 8 vCPUs typical load
• BatchProcessor: Nightly batch jobs, runs 10 PM – 4 AM, cost-sensitive
• ImageService: Containerized Python microservice, variable load (0–500 req/sec)
• AdminPortal: Internal tool, 20 concurrent users max, used 8 AM – 6 PM only

Current issues:
• High cost running idle BatchProcessor and AdminPortal outside working hours
• WebPortal cannot scale fast enough during peak trading hours
• ImageService deployment takes 2 hours due to manual processes
• CoreBanking requires dedicated hardware — no sharing with other workloads`
    },
    {
      label: 'Requirements',
      content: `REQ-1: CoreBanking must have the highest available SLA and must not share underlying hardware with other workloads.
REQ-2: WebPortal must automatically scale between 2 and 20 instances based on HTTP queue length.
REQ-3: BatchProcessor must minimize cost — only pay for compute time during the nightly window.
REQ-4: ImageService must scale to zero when not in use and scale out in seconds.
REQ-5: AdminPortal must be deployable as infrastructure-as-code and should not run when not needed.
REQ-6: All VM deployments must use a standard base image from a private registry with security patches applied.`
    },
    {
      label: 'Technical Constraints',
      content: `• All production Azure VMs must be in Availability Zones.
• Container images must be stored in a private registry with geo-replication between East US 2 and Central US.
• Batch jobs cannot be interrupted once started.
• No public internet access from CoreBanking or BatchProcessor VMs.
• ImageService must support scale-to-zero (0 instances when idle).`
    }
  ],
  questionIds: [611, 612, 613, 614, 615]
};

// Extended case study questions — these reference the case studies above
QUESTIONS.push.apply(QUESTIONS, [
  // ─── Contoso Network Case Study Questions ────────────────────────────────────
  {
    id: 601,
    domain: 4,
    subdomain: "VNet Peering / Gateway Transit",
    caseStudyId: 'contoso-network',
    type: "single",
    question: "You need to fulfill REQ-1: UK South VMs must access Chicago on-premises resources through the existing East US VPN Gateway, without deploying a new gateway in UK South. What is the correct configuration?",
    options: [
      "Create a VPN Gateway in UK South and connect it to the Chicago on-premises device",
      "Peer VNet2 (UK South) with VNet1 (East US), enable 'Allow gateway transit' on VNet1 peering, and enable 'Use remote gateways' on VNet2 peering",
      "Configure ExpressRoute from London to East US and enable global reach",
      "Create a VNet-to-VNet connection between VNet1 and VNet2, then configure route tables"
    ],
    correct: [1],
    explanation: "Gateway transit in VNet peering allows spokes to use a hub VNet's gateway. Steps: (1) Peer VNet2 → VNet1: on the VNet1 side of the peering, enable 'Allow gateway transit' (allows VNet1's VPN Gateway to be used by peers). On the VNet2 side, enable 'Use remote gateways' (tells VNet2 to route via VNet1's gateway). With this, traffic from UK South VMs flows: VNet2 → peering → VNet1 → VPN Gateway → Chicago. No gateway needed in UK South. This directly meets REQ-1 and the budget constraint."
  },
  {
    id: 602,
    domain: 4,
    subdomain: "User Defined Routes",
    caseStudyId: 'contoso-network',
    type: "single",
    question: "You need to fulfill REQ-2: All internet-bound traffic from Azure VMs must pass through Azure Firewall deployed in East US VNet1. Azure Firewall is deployed in AzureFirewallSubnet (10.10.100.0/26) with private IP 10.10.100.4. What must you configure on AppSubnet and DataSubnet?",
    options: [
      "Add NSG outbound rules denying all internet traffic except through port 80/443",
      "Create a Route Table with route 0.0.0.0/0 → Next hop: Virtual Appliance → 10.10.100.4, and associate it with AppSubnet and DataSubnet",
      "Configure Azure Firewall DNAT rules to catch all outbound traffic",
      "Enable Azure Firewall forced tunneling mode and associate it with the VNet"
    ],
    correct: [1],
    explanation: "To force all internet traffic through Azure Firewall, create a UDR (User Defined Route) with destination 0.0.0.0/0, next hop type 'Virtual Appliance', next hop IP 10.10.100.4 (the Firewall's private IP). Associate this route table with AppSubnet and DataSubnet. When VMs attempt internet access, the 0.0.0.0/0 UDR overrides the default internet route and sends traffic to Azure Firewall first. Azure Firewall then applies application and network rules before forwarding or dropping the traffic. NSG rules can restrict ports but cannot redirect traffic to a different hop."
  },
  {
    id: 603,
    domain: 4,
    subdomain: "Azure Bastion",
    caseStudyId: 'contoso-network',
    type: "single",
    question: "You need to fulfill REQ-3: Administrators must access all VMs in VNet1 and VNet2 via browser-based RDP/SSH without public IPs. Azure Bastion is deployed in VNet1. Can the same Azure Bastion instance be used to connect to VMs in VNet2 (peered with VNet1)?",
    options: [
      "No — a separate Azure Bastion must be deployed in VNet2",
      "Yes — Azure Bastion Standard SKU with IP-based connection or with peering supports connecting to VMs in peered VNets",
      "Yes — automatically once VNets are peered, Bastion extends to all peered VNets",
      "No — Bastion only works within the same VNet, not across peerings"
    ],
    correct: [1],
    explanation: "Azure Bastion Standard SKU supports connecting to VMs in peered VNets through two mechanisms: (1) IP-based connection — connect to any VM by specifying its private IP address directly, works across peerings. (2) Peering-based access — with Standard SKU and VNet peering configured, Bastion can reach VMs in peered VNets. The Basic SKU does NOT support cross-peering connections. Since VNet1 and VNet2 are peered, a Standard Bastion in VNet1 can connect to VMs in VNet2, fulfilling REQ-3 without deploying a second Bastion instance."
  },
  {
    id: 604,
    domain: 4,
    subdomain: "Application Security Groups",
    caseStudyId: 'contoso-network',
    type: "single",
    question: "You need to fulfill REQ-4: SQL Server VMs in DataSubnet must only be reachable from AppSubnet VMs on port 1433. You want a solution that doesn't require updating IP-based rules when new VMs are added. What should you configure?",
    options: [
      "Create an NSG rule on DataSubnet: Allow TCP 1433 from source IP range 10.10.1.0/24",
      "Create ASG 'AppServers', assign all app VM NICs to it. Create ASG 'SqlServers', assign SQL VM NICs to it. Create NSG rule: Allow TCP 1433 from AppServers ASG to SqlServers ASG. Deny all other inbound on DataSubnet.",
      "Create a firewall rule in Azure Firewall to allow port 1433 between the subnets",
      "Configure a Private Endpoint for SQL Server in AppSubnet"
    ],
    correct: [1],
    explanation: "Application Security Groups (ASGs) are the correct solution for role-based network filtering without IP management. By assigning VM NICs to ASGs (AppServers, SqlServers), the NSG rule references the ASG names, not IP addresses. When new app servers or SQL servers are added, simply assign their NICs to the appropriate ASG — no rule changes needed. IP-based rules (option A) require manual updates when VM IPs change or new VMs are added. ASGs scale automatically and are the recommended approach for REQ-4's 'no IP management' constraint."
  },
  {
    id: 605,
    domain: 2,
    subdomain: "Storage / SAS",
    caseStudyId: 'contoso-network',
    type: "single",
    question: "You need to fulfill REQ-5: A vendor needs read-only access to blob storage for 48 hours, and the access must be revocable at any time (even before the 48-hour window expires). Which approach should you use?",
    options: [
      "Generate an Account SAS token with 48-hour expiry and ReadOnly permissions on the blob container",
      "Create a Stored Access Policy on the container, set expiry to 48 hours. Generate a Service SAS token linked to this policy. To revoke, delete or modify the Stored Access Policy.",
      "Create a User Delegation SAS linked to a Microsoft Entra ID service account, set 48-hour expiry",
      "Grant the vendor's external account Blob Reader RBAC role at the container scope, with a Conditional Access policy requiring time-based restrictions"
    ],
    correct: [1],
    explanation: "The requirement for revocability before expiry is the key constraint. A Stored Access Policy (SAP) acts as a server-side policy that a Service SAS token references. To revoke access before the 48-hour expiry, simply delete or modify the Stored Access Policy — all SAS tokens linked to it are immediately invalidated. A standalone SAS token (Account or Service SAS without a SAP) cannot be revoked once issued without rotating the storage account key (which affects all tokens). User Delegation SAS can be revoked by revoking the delegating user's credentials, but adds identity dependency. Stored Access Policy is the cleanest revocation mechanism."
  },

  // ─── Fabrikam Identity Case Study Questions ───────────────────────────────────
  {
    id: 606,
    domain: 1,
    subdomain: "Resource Locks",
    caseStudyId: 'fabrikam-identity',
    type: "single",
    question: "You need to fulfill REQ-1: Prevent accidental deletion of resource groups containing production VMs in Production-Sub. What is the most appropriate solution?",
    options: [
      "Assign the Reader role to all users on the production resource groups",
      "Apply a CanNotDelete lock on each production resource group",
      "Apply a ReadOnly lock on each production resource group",
      "Create an Azure Policy with effect 'Deny' for delete operations on resource groups"
    ],
    correct: [1],
    explanation: "A CanNotDelete (Delete) lock prevents deletion of the resource group and all resources within it, even by users with Owner role. The lock blocks delete operations while allowing read and modify operations (VMs can still be started/stopped, configurations changed). A ReadOnly lock is too restrictive — it prevents any modifications including starting/stopping VMs. Assigning Reader role removes write permissions entirely, which prevents normal operations. Azure Policy cannot block delete operations (Policy effects don't include blocking delete via the deny effect on ARM DELETE operations in the same way locks do). CanNotDelete locks are the correct tool for REQ-1."
  },
  {
    id: 607,
    domain: 1,
    subdomain: "Azure Policy",
    caseStudyId: 'fabrikam-identity',
    type: "single",
    question: "You need to fulfill REQ-2: Ensure that all resources in FabEU-Sub can only be deployed to West Europe or North Europe. Resources already exist in other regions. What should you do?",
    options: [
      "Apply the 'Allowed locations' policy at FabrikamEU-MG scope with allowed values: West Europe, North Europe",
      "Apply the 'Allowed locations' policy at the Root Management Group scope to block non-EU regions globally",
      "Create an ARM deployment template that hardcodes the location to West Europe and use Azure Blueprints to enforce it",
      "Configure Conditional Access to restrict deployments to EU regions"
    ],
    correct: [0],
    explanation: "The built-in 'Allowed locations' policy restricts new resource deployments to specified Azure regions. Assigning it at FabrikamEU-MG scope ensures it applies to FabEU-Sub (which is under FabrikamEU-MG). Set the allowed locations parameter to ['westeurope', 'northeurope']. Existing resources in other regions are NOT automatically moved (Policy only affects new deployments unless effect is Modify/Remediate). Applying at Root MG would affect all subsidiaries globally, which exceeds the requirement scope. Conditional Access is for identity authentication, not resource deployment location."
  },
  {
    id: 608,
    domain: 1,
    subdomain: "Privileged Identity Management",
    caseStudyId: 'fabrikam-identity',
    type: "single",
    question: "You need to fulfill REQ-3: Implement quarterly review and time-limited renewal of Owner role assignments in Corp-IT-MG. Currently 12 users have permanent Owner assignments. Which Azure feature should you use?",
    options: [
      "Remove all Owner assignments and recreate them as 30-day temporary role assignments via Azure RBAC",
      "Enable Microsoft Entra ID Privileged Identity Management (PIM) and convert Owner assignments to eligible assignments with access reviews",
      "Create a scheduled Logic App that removes Owner roles every 90 days and emails the security team",
      "Configure Azure Policy to audit permanent Owner assignments and send a compliance report quarterly"
    ],
    correct: [1],
    explanation: "Microsoft Entra PIM provides: Eligible assignments — users can activate the role when needed (Just-In-Time access), no permanent standing privilege. Time-bound assignments — set expiration on role eligibility or active assignments. Access Reviews — periodic reviews (quarterly) where reviewers approve or deny continued access. Users whose access isn't approved are automatically removed. This directly meets REQ-3: quarterly review + removal of permanent Owner assignments. PIM requires Entra ID P2 licensing. Azure Policy audit doesn't enforce removal. Manual Logic Apps are fragile and not audit-friendly."
  },
  {
    id: 609,
    domain: 1,
    subdomain: "Cost Management",
    caseStudyId: 'fabrikam-identity',
    type: "single",
    question: "You need to fulfill REQ-4: Enable cost reporting aggregated per subsidiary (FabrikamUS-MG, FabrikamEU-MG, FabrikamAPAC-MG). What is the correct approach in Azure Cost Management?",
    options: [
      "Create separate billing accounts for each subsidiary and link them to the management groups",
      "Use Azure Cost Management + Billing cost analysis scoped to each Management Group to view and aggregate costs across member subscriptions",
      "Configure a cost allocation rule that distributes shared costs from Corp-IT-MG to the three subsidiary management groups",
      "Export subscription-level cost data to Excel and manually aggregate by subsidiary"
    ],
    correct: [1],
    explanation: "Azure Cost Management + Billing supports Management Group as a scope for cost analysis. When you set the scope to FabrikamUS-MG, it aggregates costs from all subscriptions under that MG (including FabUS-Sub and any child subscriptions). This provides built-in subsidiary-level cost views without needing separate billing accounts. You can also set budgets and alerts at MG scope. Cost allocation rules (option C) are for distributing shared costs but don't solve the aggregation reporting requirement. Management Group scope in Cost Management is the direct answer."
  },
  {
    id: 610,
    domain: 1,
    subdomain: "Conditional Access / MFA",
    caseStudyId: 'fabrikam-identity',
    type: "single",
    question: "You need to fulfill REQ-5: All new users must complete MFA registration within 14 days of account creation, after which MFA becomes mandatory. Which solution should you implement?",
    options: [
      "Create a Conditional Access policy requiring MFA for all users, with no grace period",
      "Enable the Microsoft Entra ID MFA registration policy in Identity Protection, set the scope to all users, and configure a 14-day grace period via Temporary Access Pass or combined registration campaign",
      "Use Microsoft Entra ID Security Defaults which enforce MFA registration automatically",
      "Create a PowerShell script that runs daily and disables accounts that haven't registered MFA after 14 days"
    ],
    correct: [1],
    explanation: "Microsoft Entra Identity Protection's MFA registration policy allows you to: require users to register for MFA, configure which users are in scope, and track registration status. For the 14-day grace period, use the 'Authentication methods' → 'Registration campaign' feature (available in Entra ID P2), which sets a 14-day snooze window before requiring MFA registration. Security Defaults enforce MFA registration but with a 14-day window for all users automatically — however they don't provide the granular control needed for enterprise environments. The Identity Protection registration policy with a campaign is the enterprise-appropriate answer."
  },

  // ─── Woodgrove Bank Compute Case Study Questions ─────────────────────────────
  {
    id: 611,
    domain: 3,
    subdomain: "VM / Dedicated Hosts",
    caseStudyId: 'woodgrove-compute',
    type: "single",
    question: "You need to fulfill REQ-1: CoreBanking must have the highest available SLA and must NOT share underlying hardware with other workloads. Which Azure compute option should you use?",
    options: [
      "Deploy CoreBanking VMs in an Availability Set to ensure maximum fault domain isolation",
      "Deploy CoreBanking VMs on Azure Dedicated Hosts — physical servers dedicated to a single customer",
      "Deploy CoreBanking in Availability Zones with zone-redundant storage",
      "Use Isolated VM sizes (e.g., Standard_E96is_v5) which run on single-tenant hardware"
    ],
    correct: [1],
    explanation: "Azure Dedicated Hosts provide physical servers fully dedicated to a single Azure customer, with no hardware sharing with other customers' VMs. This satisfies the 'no sharing with other workloads' requirement. Dedicated Hosts also support Availability Zone placement for 99.99% SLA. Isolated VM sizes run on isolated hardware but are software-defined and may still share the physical host with future VM sizes. Availability Sets provide fault domain isolation across shared hardware — still shared with other customers. Dedicated Hosts are the only option guaranteeing both dedicated hardware and highest SLA."
  },
  {
    id: 612,
    domain: 3,
    subdomain: "VM Scale Sets",
    caseStudyId: 'woodgrove-compute',
    type: "single",
    question: "You need to fulfill REQ-2: WebPortal must automatically scale between 2 and 20 instances based on HTTP request queue length. Which Azure service and scaling approach should you use?",
    options: [
      "Deploy WebPortal VMs in an Availability Set with manual scaling rules",
      "Deploy WebPortal on Azure Virtual Machine Scale Sets (VMSS) with custom metric autoscale based on HTTP queue depth",
      "Deploy WebPortal on Azure App Service with auto-scale rules based on HTTP queue metric",
      "Deploy WebPortal VMs with Azure Automation runbooks that add/remove VMs based on a schedule"
    ],
    correct: [2],
    explanation: "Azure App Service autoscale supports custom metric-based scaling rules, including queue length from Azure Storage Queue or Service Bus. Since WebPortal is a .NET 6 web app, App Service is the natural PaaS fit with built-in autoscale, deployment slots, and managed infrastructure. Configure scale-out rule: 'When HTTP queue length > threshold, add 1 instance' and scale-in rule: 'When queue length < threshold, remove 1 instance'. Min instances: 2, Max: 20. VMSS also works for VM-based scaling but App Service is the better fit for web apps. The key is autoscale on HTTP queue depth metric."
  },
  {
    id: 613,
    domain: 3,
    subdomain: "Azure Spot VMs",
    caseStudyId: 'woodgrove-compute',
    type: "single",
    question: "You need to fulfill REQ-3: BatchProcessor runs nightly 10 PM – 4 AM and must minimize cost. The constraint says batch jobs cannot be interrupted once started. Which VM option should you use?",
    options: [
      "Azure Spot VMs — up to 90% cost savings, ideal for batch workloads",
      "Reserved VM Instances (1-year) for BatchProcessor to reduce hourly cost",
      "Standard pay-as-you-go VMs that are started at 10 PM and deallocated at 4 AM via automation",
      "Azure Batch with low-priority nodes for maximum cost savings"
    ],
    correct: [2],
    explanation: "The constraint 'cannot be interrupted once started' rules out Spot VMs (which can be evicted with 30-second notice) and Azure Batch low-priority nodes (which can also be preempted). Reserved Instances reduce per-hour cost but VMs run 24/7 — wasting cost during the 18 non-batch hours. The correct solution: standard pay-as-you-go VMs that are deallocated when not in use. Use Azure Automation, Logic Apps, or Azure VM start/stop schedules (Cost Management) to automatically start at 10 PM and deallocate at 4 AM. Deallocated VMs don't incur compute charges (only disk storage costs). This gives the best cost for scheduled, interruptible-protected workloads."
  },
  {
    id: 614,
    domain: 3,
    subdomain: "Azure Container Apps",
    caseStudyId: 'woodgrove-compute',
    type: "single",
    question: "You need to fulfill REQ-4: ImageService must scale to zero when not in use and scale out in seconds when traffic arrives. It is a containerized Python microservice. Which Azure service should you use?",
    options: [
      "Azure Container Instances (ACI) — serverless containers with per-second billing",
      "Azure Kubernetes Service (AKS) with Horizontal Pod Autoscaler (HPA)",
      "Azure Container Apps with KEDA-based scale rules including scale-to-zero",
      "Azure App Service with container deployment and autoscale enabled"
    ],
    correct: [2],
    explanation: "Azure Container Apps supports KEDA (Kubernetes Event Driven Autoscaling) which includes scale-to-zero. When no traffic arrives, Container Apps scales to 0 replicas (no compute cost). When traffic arrives, it scales out within seconds. This is perfect for the ImageService pattern: variable 0–500 req/sec load with scale-to-zero cost optimization. ACI doesn't support event-driven auto-scaling. AKS HPA can scale to 1 minimum but requires KEDA add-on for scale-to-zero (more infrastructure overhead). App Service containers can scale but minimum is 1 instance in most configurations. Container Apps is the purpose-built service for scale-to-zero event-driven microservices."
  },
  {
    id: 615,
    domain: 3,
    subdomain: "Azure Container Registry",
    caseStudyId: 'woodgrove-compute',
    type: "single",
    question: "You need to fulfill REQ-6: All VM deployments must use a standard base image from a private container/VM image registry with geo-replication between East US 2 and Central US. Which service and tier should you use?",
    options: [
      "Azure Container Registry (ACR) Basic tier with replication enabled",
      "Azure Container Registry (ACR) Premium tier with geo-replication configured to East US 2 and Central US",
      "Azure Shared Image Gallery (Azure Compute Gallery) with image replicas in East US 2 and Central US",
      "Azure Marketplace with private offering configured for both regions"
    ],
    correct: [2],
    explanation: "For VM base images (not container images), Azure Compute Gallery (formerly Shared Image Gallery) is the correct service. It stores VM images (generalized or specialized) with version management and can replicate image versions to multiple regions (East US 2 and Central US). During VM deployment, the image is read from the nearest replica, improving deployment speed and resilience. ACR stores container (OCI) images, not VM disk images. ACR Premium supports geo-replication but for containers. Since REQ-6 is about VM deployments, Azure Compute Gallery is the answer. Note: if the question was about containers, ACR Premium would be correct."
  }
]);

// ── Northwind Traders — Hybrid Identity & Governance case study ──────────────
CASE_STUDIES['northwind-identity'] = {
  id: 'northwind-identity',
  title: 'Northwind Traders — Hybrid Identity & Governance',
  image: 'images/cs_northwind_identity.svg',
  tabs: [
    {
      label: 'Overview',
      content: `Northwind Traders is a global retail company with headquarters in London and regional offices in New York, Tokyo, and Sydney. The company employs 15,000 staff and works with 320 partner users from Fabrikam (supplier) and Contoso (logistics).

The IT team is halfway through a hybrid identity migration. An on-premises Active Directory domain (corp.northwindtraders.com) currently hosts all user accounts. Azure AD Connect has been deployed with Password Hash Sync (PHS) to synchronize identities to Microsoft Entra ID (northwindtraders.com).

Current concerns:
• Privileged accounts (Global Admins, Subscription Owners) are permanently assigned — no just-in-time model
• Partner (guest) users have accumulated over time with no formal removal process
• Legacy authentication protocols (SMTP AUTH, Basic Auth) are still in use by some line-of-business apps
• Each regional IT helpdesk team currently needs full Entra ID admin rights to manage their local users, giving them excessive permissions globally
• Several Azure workloads use hard-coded service account credentials stored in application configuration files`
    },
    {
      label: 'Current Environment',
      content: `Active Directory (On-Premises):
• Domain: corp.northwindtraders.com (Windows Server 2019)
• 15,000 user objects, 480 security groups, 8,200 computer objects
• Organizational Unit structure: OU=Regions > OU=London/NewYork/Tokyo/Sydney > OU=Users/Computers

Azure AD Connect:
• Version: 2.1.x (latest)
• Sync method: Password Hash Sync (PHS)
• Scope: All OUs (full sync)
• Staging server: configured but not yet activated

Microsoft Entra ID:
• Tenant: northwindtraders.onmicrosoft.com | Custom domain: northwindtraders.com verified
• Licenses: Microsoft 365 E5 (covers Entra ID P2 features including PIM and Access Reviews)
• Guest users: 320 (invited via B2B collaboration from fabrikam.com and contoso.com)
• App registrations: 42 (including ERP integration, reporting tools, custom workflows)
• Hybrid Azure AD Join: Enabled for Windows 10/11 devices

Current Admin Roles (permanently assigned, no PIM):
• Global Administrators: 8 accounts
• Subscription Owners: 5 accounts (across 3 subscriptions)
• User Administrator: 12 helpdesk staff (global scope)`
    },
    {
      label: 'Requirements',
      content: `Identity Security Requirements:
• REQ-ID-1: All privileged role assignments (Global Admin, Subscription Owner, User Admin) must use just-in-time (JIT) activation via Privileged Identity Management (PIM). Maximum activation duration: 4 hours. Require MFA and business justification.
• REQ-ID-2: A Conditional Access policy must enforce MFA for all users when accessing any cloud app. An additional policy must block all legacy authentication protocols.
• REQ-ID-3: Regional helpdesk teams must only be able to manage users and groups within their own region (London, New York, Tokyo, Sydney) — not globally.
• REQ-ID-4: Guest (B2B) users must be reviewed quarterly by their assigned sponsor. Guests who fail review or whose sponsor is inactive must be automatically removed.
• REQ-ID-5: Azure workloads (VMs, Functions, Logic Apps) must not use hard-coded credentials. Identity-based access to Key Vault, Storage, and SQL must use managed identities.

Migration Requirements:
• REQ-ID-6: The Azure AD Connect staging server must be promotable to active in under 15 minutes during a failover without re-syncing the full directory.
• REQ-ID-7: Users must be able to sign in to cloud apps using their on-premises AD passwords (no separate cloud password to maintain).`
    },
    {
      label: 'Constraints',
      content: `Technical Constraints:
• CONST-1: Entra ID P2 licenses are available for all 15,000 users (included in M365 E5).
• CONST-2: The company cannot implement ADFS — the architecture must remain cloud-managed.
• CONST-3: Legacy LOB applications (ERP system) currently use SMTP AUTH and Basic Auth. The vendor has committed to OAuth 2.0 support in the next release (6 months away). Until then, these must continue to work.
• CONST-4: The Azure subscription structure has three subscriptions under a single Management Group: Production, Non-Production, and Shared Services.
• CONST-5: All identity-related configuration changes require change-board approval and must be deployed using Infrastructure as Code (Bicep or ARM templates).
• CONST-6: External partner users must retain their own organizational credentials — Northwind cannot manage partner passwords.`
    }
  ],
  questionIds: [616, 617, 618, 619, 620, 621]
};

// ── Northwind Identity Case Study Questions ──────────────────────────────────
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 616,
    domain: 1,
    subdomain: "Privileged Identity Management",
    caseStudyId: 'northwind-identity',
    type: "single",
    question: "You are implementing REQ-ID-1: all Global Administrator assignments must use PIM with JIT activation, a maximum 4-hour duration, and require MFA plus a business justification. A user currently holds a permanent Global Administrator assignment. What action must you perform first in PIM to enforce this requirement?",
    options: [
      "Create a PIM role setting for Global Administrator that sets maximum duration to 4 hours, requires MFA and justification, then remove the permanent assignment and convert it to an Eligible assignment",
      "Create a PIM role setting for Global Administrator, then add the user as Active (not Eligible) with a 4-hour time-bound assignment",
      "Delete the existing permanent role assignment — PIM will automatically convert it to Eligible status",
      "Configure a Conditional Access policy requiring MFA for the Global Administrator role and set a session lifetime of 4 hours"
    ],
    correct: [0],
    explanation: "To implement JIT for a previously permanently assigned Global Admin:\n\n1. In PIM → Manage → Azure AD roles → Global Administrator → Settings → Edit:\n   • Set 'Maximum activation duration' to 4 hours\n   • Enable 'Require MFA on activation'\n   • Enable 'Require justification on activation'\n   • Optionally require approval\n\n2. Remove the permanent (Active) assignment: Assignments → Active assignments → Remove the user\n\n3. Add an Eligible assignment: Assignments → Add assignments → Eligible → select the user\n\nNow the user must activate via PIM each time, get the role for max 4 hours, must do MFA and enter a justification.\n\nOption B is wrong — Active time-bound is NOT JIT; the role is still active without user intervention.\nOption C is wrong — PIM does NOT auto-convert removed assignments to Eligible.\nOption D is wrong — Conditional Access alone can't enforce time-limited role activation; that is PIM's function."
  },
  {
    id: 617,
    domain: 1,
    subdomain: "Conditional Access",
    caseStudyId: 'northwind-identity',
    type: "multi",
    question: "You must implement REQ-ID-2: enforce MFA for all users accessing any cloud app AND block all legacy authentication protocols. CONST-3 states the ERP vendor uses SMTP AUTH / Basic Auth and cannot be migrated for 6 months. Which two Conditional Access policies should you create to satisfy both requirements?",
    options: [
      "Policy 1: Assignments → All users, All cloud apps; Grant → Require MFA. Policy 2: Assignments → All users, All cloud apps; Conditions → Client apps = Exchange ActiveSync clients + Other clients; Grant → Block access",
      "Policy 1: Assignments → All users (exclude ERP service account), All cloud apps; Grant → Require MFA. Policy 2: Assignments → All users, All cloud apps; Conditions → Client apps = Exchange ActiveSync clients + Other clients; Grant → Block access. Exclude the ERP service account from Policy 2",
      "Policy 1: Assignments → All users, All cloud apps; Grant → Require MFA. Policy 2: Use Azure AD Identity Protection to block legacy auth via Sign-in Risk policy",
      "Policy 1: Assignments → All users, All cloud apps; Session → Sign-in frequency = 4 hours. Policy 2: Configure Entra ID Authentication Methods to disable SMTP AUTH globally"
    ],
    correct: [1],
    explanation: "CONST-3 requires the ERP system (using SMTP AUTH / Basic Auth) to continue working for 6 months. A blanket legacy-auth block would break the ERP.\n\nCorrect approach:\n• Policy 1 (MFA everywhere): All users, all apps → Require MFA. This enforces REQ-ID-2 part 1.\n• Policy 2 (Block legacy auth): All users, all cloud apps, Client apps: Exchange ActiveSync + Other clients → Block access. EXCLUDE the ERP service account (or a group containing it) so the ERP continues to authenticate.\n\nThis satisfies REQ-ID-2 (block legacy auth) while respecting CONST-3 (ERP exemption for 6 months).\n\nOption A blocks legacy auth for ALL users including the ERP account — violates CONST-3.\nOption C: Identity Protection risk policies target sign-in risk, not legacy auth protocol blocking — not the right tool.\nOption D: Sign-in frequency doesn't block legacy auth. SMTP AUTH is controlled in Exchange Online, not directly in Conditional Access session controls."
  },
  {
    id: 618,
    domain: 1,
    subdomain: "Administrative Units",
    caseStudyId: 'northwind-identity',
    type: "single",
    question: "REQ-ID-3 requires that each regional helpdesk team (London, New York, Tokyo, Sydney) can only manage users within their own region. Currently all 12 helpdesk staff have the User Administrator role assigned globally. What is the recommended solution using Entra ID features?",
    options: [
      "Create four Azure subscriptions (one per region) and assign RBAC User Access Administrator to each regional helpdesk team scoped to their subscription",
      "Create four Administrative Units (London-AU, NewYork-AU, Tokyo-AU, Sydney-AU), add the regional users to the corresponding AU, then assign the User Administrator role to each helpdesk team scoped to their AU only",
      "Create four Resource Groups with the regional users' Azure resources, then use RBAC to restrict helpdesk teams to their resource group",
      "Use Azure AD Dynamic Groups with membership rules based on department attribute, then assign User Administrator to those groups"
    ],
    correct: [1],
    explanation: "Administrative Units (AUs) are an Entra ID P1/P2 feature that scopes Entra ID role assignments to a subset of users, groups, or devices.\n\nImplementation:\n1. Create AUs: London-AU, NewYork-AU, Tokyo-AU, Sydney-AU\n2. Add users from each region to the corresponding AU (can be dynamic membership based on OU/department attribute synced from on-premises AD)\n3. Remove the global User Administrator assignment from helpdesk staff\n4. Assign User Administrator role with scope = specific AU to each regional helpdesk team\n\nNow London helpdesk can manage London-AU users ONLY. They cannot see or manage Tokyo, New York, or Sydney users.\n\nOption A: Azure subscriptions are a billing/resource boundary, not an identity boundary — RBAC on subscriptions controls resource access, not Entra user management.\nOption C: Resource Groups hold Azure resources (VMs, storage), not identity objects.\nOption D: Dynamic groups based on attributes would segment users into groups, but assigning User Admin to a group of users doesn't restrict their management scope — they'd still have global User Admin rights."
  },
  {
    id: 619,
    domain: 1,
    subdomain: "Access Reviews",
    caseStudyId: 'northwind-identity',
    type: "single",
    question: "REQ-ID-4 requires quarterly reviews of guest (B2B) users, with automatic removal of guests who fail review or whose sponsor is inactive. You have Entra ID P2 licenses. Which configuration in Entra ID Identity Governance satisfies this requirement?",
    options: [
      "Create a Lifecycle Workflow that runs every 90 days and deletes guest accounts older than 90 days",
      "Create an Access Review for Guest users, set recurrence to Quarterly, reviewers = Sponsors, enable 'Auto apply results to resource', set 'If reviewers don't respond' = Remove access, and enable 'If sponsor is inactive, remove guest'",
      "Create a Conditional Access policy that blocks guests after 90 days of inactivity, monitored via Azure Monitor sign-in logs",
      "Configure an Entitlement Management Access Package for guest users with a 90-day expiration and require renewal"
    ],
    correct: [1],
    explanation: "Entra ID Access Reviews (part of Identity Governance, requires P2) is purpose-built for this scenario.\n\nConfiguration:\n• Review type: Guest users (in a group or all guests)\n• Recurrence: Quarterly (every 3 months)\n• Reviewers: Sponsors (the person who invited/sponsors each guest)\n• Upon completion: Auto-apply results → Remove access for denied users\n• Reviewer response: If reviewer doesn't respond → Remove access (conservative)\n• Sponsor inactive: If the sponsor's account is disabled/deleted → Remove the guest\n\nThis directly meets REQ-ID-4: quarterly, sponsor-driven, automatic removal.\n\nOption A: Lifecycle Workflows manage employee joiners/movers/leavers, not guest review cycles based on sponsor decisions.\nOption C: Conditional Access can block stale accounts but cannot automate the sponsor review process or handle the 'sponsor inactive' case.\nOption D: Entitlement Management is for granting access to resources via access packages — useful for provisioning, not for reviewing and revoking existing guest access."
  },
  {
    id: 620,
    domain: 1,
    subdomain: "Managed Identities",
    caseStudyId: 'northwind-identity',
    type: "dragdrop",
    question: "REQ-ID-5 requires Azure workloads to use managed identities instead of hard-coded credentials. Match each workload scenario to the correct managed identity type.",
    dragItems: [
      "A VM that needs access to Key Vault — the identity should be tied to the VM's lifecycle",
      "A set of 10 VMs that all share the same permissions to read from Azure Blob Storage",
      "An Azure Function that needs to authenticate to Azure SQL — deployed across multiple environments (dev/test/prod)"
    ],
    dropZones: [
      "System-Assigned Managed Identity",
      "User-Assigned Managed Identity"
    ],
    correct: [[0,0],[1,1],[2,1]],
    explanation: "System-Assigned Managed Identity:\n• Created automatically when enabled on a resource\n• Lifecycle tied to that specific resource — deleted when the resource is deleted\n• One-to-one relationship: one identity per resource\n• Best for: single resource that needs its own identity (the VM that owns its Key Vault access)\n\nUser-Assigned Managed Identity:\n• Created as a standalone Azure resource\n• Can be assigned to multiple resources (VMs, Functions, etc.)\n• Lifecycle independent of any single resource\n• Best for: multiple VMs sharing the same permissions (10 VMs → one shared identity) or Functions that need consistent identity across dev/test/prod\n\nMapping:\n• Single VM → Key Vault: System-Assigned (tied to VM lifecycle)\n• 10 VMs → Blob Storage: User-Assigned (shared across VMs)\n• Azure Function → SQL (multi-env): User-Assigned (same identity across dev/test/prod environments)"
  },
  {
    id: 621,
    domain: 1,
    subdomain: "Azure AD Connect",
    caseStudyId: 'northwind-identity',
    type: "single",
    question: "REQ-ID-6 requires the Azure AD Connect staging server to be promotable to active in under 15 minutes without a full directory re-sync. REQ-ID-7 requires users to sign in to cloud apps using their on-premises AD passwords. The current setup uses Password Hash Sync (PHS). Which Azure AD Connect feature enables the staging server to be promoted quickly?",
    options: [
      "Configure the staging server to use Pass-through Authentication (PTA) instead of PHS so cloud authentication is handled by on-premises agents",
      "The staging server in Azure AD Connect runs in staging mode — it receives sync data but doesn't export to Entra ID. Switching it to active mode requires only toggling the staging mode flag; no re-sync is required because the SQL database is already current",
      "Deploy a second Azure AD Connect server in active mode and use Azure Traffic Manager to load balance between the two",
      "Use Entra ID Connect Cloud Sync (lightweight agents) instead of Azure AD Connect server — failover is automatic"
    ],
    correct: [1],
    explanation: "Azure AD Connect Staging Mode:\n• A staging server receives full sync data from on-premises AD (imports and syncs) but does NOT export changes to Entra ID (or Azure AD)\n• It essentially has an up-to-date copy of the sync database at all times\n• Promotion: Disable staging mode on the staging server → it immediately begins exporting. No re-sync required because the connector space and metaverse are already current\n• Typical promotion time: 1–5 minutes (just flipping the staging flag)\n\nThis satisfies REQ-ID-6 (<15 min failover, no re-sync).\n\nREQ-ID-7 (PHS): Users authenticate using their synced password hash stored in Entra ID — no on-premises component required for authentication, so cloud apps work even if on-premises connectivity is disrupted.\n\nOption A: Switching to PTA would mean authentication hits on-premises AD agents — if on-premises is degraded, users can't sign in. PHS is superior for availability.\nOption C: Running two active Azure AD Connect servers would cause conflicts and duplicate exports (not supported).\nOption D: Cloud Sync is a valid alternative but doesn't automatically solve the staging-server failover scenario described — and the company is already using Azure AD Connect."
  }
]);
