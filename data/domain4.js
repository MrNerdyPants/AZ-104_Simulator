// ============================================================
// DOMAIN 4: Implement and Manage Virtual Networking (15-20%)
// Question IDs: 401 - 446
// 2026 Skills: VNets, NSGs, Routing, Bastion, Load Balancing, DNS
// ============================================================

var QUESTIONS = typeof QUESTIONS !== 'undefined' ? QUESTIONS : [];
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 401,
    domain: 4,
    subdomain: "Virtual Networks",
    type: "single",
    question: "You have an Azure virtual network named VNet1 with address space 10.0.0.0/16. You need to create a subnet that supports at least 500 hosts and can be used for Azure Virtual Machine Scale Sets. Which subnet address space should you use?",
    options: [
      "10.0.0.0/23",
      "10.0.0.0/24",
      "10.0.0.0/22",
      "10.0.0.0/25"
    ],
    correct: [0],
    explanation: "A /23 subnet provides 512 addresses (510 usable after Azure reserves 5 addresses per subnet: network address, default gateway, two DNS addresses, and broadcast). A /24 provides only 256 addresses (251 usable), which is less than 500. A /22 works (1,024 addresses) but wastes addresses beyond the requirement. A /25 provides only 128 addresses — insufficient.\n\nAzure reserved addresses per subnet (first 4 + last 1):\n• x.x.x.0 — network address\n• x.x.x.1 — default gateway\n• x.x.x.2 and x.x.x.3 — Azure DNS\n• x.x.x.255 — broadcast\n\nThe /23 is the smallest subnet that meets the ≥500 host requirement.",
    reference: "https://learn.microsoft.com/azure/virtual-network/virtual-networks-faq#how-many-usable-addresses-are-there-per-virtual-network-and-subnet"
  },
  {
    id: 402,
    domain: 4,
    subdomain: "Virtual Networks",
    type: "yesno",
    scenario: "You have two Azure virtual networks: VNet1 (10.1.0.0/16) in East US and VNet2 (10.2.0.0/16) in West US. You configure VNet peering between VNet1 and VNet2.",
    question: "After peering, VMs in VNet1 can communicate with VMs in VNet2 using private IP addresses without going through the public internet.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes. VNet peering connects two virtual networks so that traffic between them uses the Azure backbone network — not the public internet. Resources in peered VNets communicate using private IP addresses with low latency and high bandwidth.\n\nVNet peering features:\n• Global peering: Works across Azure regions (cross-region VNet peering)\n• Private IPs: Traffic stays on the Azure backbone — no internet exposure\n• Low latency: Same as intra-region communications\n• Non-transitive by default: VNet1↔VNet2 and VNet2↔VNet3 does NOT mean VNet1↔VNet3\n• Bidirectional: Must create peering from both sides\n\nBoth address spaces (10.1.0.0/16 and 10.2.0.0/16) are non-overlapping, so peering is valid.",
    reference: "https://learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview"
  },
  {
    id: 403,
    domain: 4,
    subdomain: "VNet Peering",
    type: "single",
    question: "You have three virtual networks: VNet1, VNet2, and VNet3. VNet1 is peered with VNet2. VNet2 is peered with VNet3. A VM in VNet1 tries to communicate with a VM in VNet3. What happens?",
    options: [
      "Communication succeeds because VNet2 acts as a transit network",
      "Communication fails because VNet peering is not transitive",
      "Communication succeeds only if hub-spoke topology is configured",
      "Communication fails because cross-region peering is required"
    ],
    correct: [1],
    explanation: "VNet peering is NOT transitive. Even though VNet1 is peered with VNet2 and VNet2 is peered with VNet3, traffic cannot flow from VNet1 → VNet2 → VNet3 automatically.\n\nTo enable VNet1-to-VNet3 communication, you must either:\n1. Create a direct peering between VNet1 and VNet3\n2. Use a hub-spoke topology with Azure VPN Gateway or Azure Firewall configured for transit routing (with UDRs)\n3. Use Azure Virtual WAN which supports transitive connectivity\n\nHub-spoke with gateway transit:\n• Hub has VPN Gateway or Azure Firewall\n• Spokes peer with Hub and use UDRs to route spoke-to-spoke traffic through hub\n• This creates 'effective' transitive routing through the network virtual appliance",
    reference: "https://learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview#requirements-and-constraints"
  },
  {
    id: 404,
    domain: 4,
    subdomain: "VNet Peering",
    type: "single",
    question: "You have a hub VNet (HubVNet) with an Azure VPN Gateway. You peer SpokeVNet1 with HubVNet. Users in SpokeVNet1 cannot reach on-premises resources through the VPN Gateway in HubVNet. What must you configure on the peering from SpokeVNet1 to HubVNet?",
    options: [
      "Enable 'Allow gateway transit' on the SpokeVNet1 side of the peering",
      "Enable 'Use remote gateways' on the SpokeVNet1 side of the peering",
      "Enable 'Allow forwarded traffic' on the HubVNet side of the peering",
      "Enable 'Allow gateway transit' on the HubVNet side of the peering"
    ],
    correct: [1],
    explanation: "Gateway transit in hub-spoke peering requires TWO settings:\n\n1. HubVNet side of the peering: Enable 'Allow gateway transit'\n   • This tells the hub that it allows its gateway to be used by peered VNets\n   • Must be set on the SIDE THAT HAS THE GATEWAY\n\n2. SpokeVNet1 side of the peering: Enable 'Use remote gateways'\n   • This tells the spoke to route traffic through the remote gateway (Hub's VPN Gateway)\n   • Must be set on the SPOKE side\n\nThe question says SpokeVNet1 cannot reach on-premises resources. The missing setting on the SpokeVNet1 side of the peering is 'Use remote gateways'. Without this, the spoke ignores the hub's gateway for routing.\n\n'Allow forwarded traffic': Allows traffic that didn't originate in the VNet to be forwarded through — different setting.",
    reference: "https://learn.microsoft.com/azure/vpn-gateway/vpn-gateway-peering-gateway-transit"
  },
  {
    id: 405,
    domain: 4,
    subdomain: "VNet Peering",
    type: "yesno",
    scenario: "You have VNet1 (10.1.0.0/16) and VNet2 (10.1.0.0/16) in the same region. You need to peer these two virtual networks.",
    question: "You configure VNet peering between VNet1 and VNet2.",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "No — VNet peering requires non-overlapping address spaces. Both VNet1 and VNet2 use 10.1.0.0/16, which is the SAME address space. Azure will reject the peering creation with an error about overlapping address spaces.\n\nRequirements for VNet peering:\n• Address spaces must NOT overlap\n• No gateway required (unlike VPN connections)\n• Works across regions and subscriptions\n• Both VNets must exist before creating the peering\n\nTo fix this scenario:\n• Change the address space of one VNet (e.g., VNet2 → 10.2.0.0/16)\n• Then create the peering\n\nNote: You cannot change the primary address space of a VNet that already has resources deployed. You may need to recreate the VNet or add a non-overlapping secondary address space.",
    reference: "https://learn.microsoft.com/azure/virtual-network/virtual-network-manage-peering#requirements-and-constraints"
  },
  {
    id: 406,
    domain: 4,
    subdomain: "Network Security Groups",
    type: "single",
    question: "You have a subnet with an NSG that has the following inbound rules: Priority 100 – Allow TCP 443 from Internet; Priority 200 – Deny All from Internet. A VM in the subnet has a NIC-level NSG with: Priority 100 – Deny TCP 443 from Internet. A user on the internet tries to connect to the VM on port 443. What is the result?",
    options: [
      "Connection is allowed because the subnet NSG allows port 443",
      "Connection is denied because the NIC NSG denies port 443",
      "Connection is allowed because subnet NSG is evaluated first and Allow takes precedence",
      "Connection is denied because the subnet Deny All rule at priority 200 matches"
    ],
    correct: [1],
    explanation: "When both a subnet NSG and a NIC NSG are applied, traffic must pass THROUGH BOTH NSGs for inbound traffic.\n\nInbound traffic flow:\nInternet → Subnet NSG → NIC NSG → VM\n\nSubnet NSG evaluation:\n• Priority 100 — Allow TCP 443 from Internet: MATCHES → traffic allowed through subnet NSG\n\nNIC NSG evaluation:\n• Priority 100 — Deny TCP 443 from Internet: MATCHES → traffic DENIED at NIC NSG\n\nResult: Traffic is DENIED because it fails at the NIC-level NSG.\n\nKey rule: Traffic must satisfy BOTH NSGs. If EITHER NSG denies it, the traffic is blocked.\n\nOutbound traffic flow (opposite direction): VM → NIC NSG → Subnet NSG → Internet\nBoth NSGs must allow traffic in both directions.",
    reference: "https://learn.microsoft.com/azure/virtual-network/network-security-groups-overview#how-traffic-is-evaluated"
  },
  {
    id: 407,
    domain: 4,
    subdomain: "Network Security Groups",
    type: "multi",
    question: "You need to allow SQL Server traffic (port 1433) from a group of application servers to a group of database servers, without specifying individual IP addresses. Which steps should you perform? (Choose three)",
    options: [
      "Create an Application Security Group (ASG) named AppServers and assign app server NICs to it",
      "Create an Application Security Group (ASG) named DbServers and assign database server NICs to it",
      "Create an NSG rule allowing port 1433 from source ASG AppServers to destination ASG DbServers",
      "Create a service tag rule allowing SQL traffic from the VirtualNetwork service tag",
      "Assign both ASGs to the same subnet NSG"
    ],
    correct: [0, 1, 2],
    explanation: "Application Security Groups (ASGs) let you group VM NICs by role and reference those groups in NSG rules instead of IP addresses.\n\nSteps:\n1. Create ASG 'AppServers' and assign all application server NICs to it\n2. Create ASG 'DbServers' and assign all database server NICs to it\n3. Create an NSG inbound rule:\n   • Source: ASG — AppServers\n   • Destination: ASG — DbServers\n   • Destination port: 1433\n   • Protocol: TCP\n   • Action: Allow\n\nBenefits of ASGs:\n• No IP address management: Add new servers by assigning their NIC to the ASG — rules update automatically\n• Readable rules: 'Allow AppServers to DbServers on 1433' is self-documenting\n• Reusable groups: Same ASG can be referenced in multiple NSG rules\n\nASG requirements:\n• NIC must be in the same VNet as the ASG\n• One NIC can be a member of multiple ASGs\n\n• A 'VirtualNetwork' service tag would allow any resource in any VNet — too broad\n• ASGs are assigned to NICs, not to NSGs directly",
    reference: "https://learn.microsoft.com/azure/virtual-network/application-security-groups"
  },
  {
    id: 408,
    domain: 4,
    subdomain: "Network Security Groups",
    type: "single",
    question: "You need to determine why a VM named VM1 cannot communicate with a VM named VM2 in the same VNet. Both VMs have NSGs applied. What Azure tool should you use to check which specific NSG rule is blocking the traffic?",
    options: [
      "Azure Policy compliance dashboard",
      "Network Watcher IP Flow Verify",
      "Azure Monitor Network Insights",
      "Connection Monitor"
    ],
    correct: [1],
    explanation: "Network Watcher IP Flow Verify tests whether a specific flow is allowed or denied by NSG rules applied to a VM.\n\nUsage:\n• Specify: VM, direction (inbound/outbound), protocol, source IP, source port, destination IP, destination port\n• Result: 'Access allowed' or 'Access denied', and the NAME of the NSG rule that made the decision\n\nThis pinpoints EXACTLY which NSG rule is blocking traffic without needing to manually review all rules.\n\nOther Network Watcher tools:\n• Next Hop: Shows the route a packet takes from a VM\n• Connection Monitor: Tests connectivity over time and monitors for changes\n• Packet Capture: Captures actual packets for deep analysis\n• NSG Flow Logs: Records all traffic flows through an NSG (audit trail)\n• Effective Security Rules: Shows merged effective NSG rules for a NIC\n\nFor quick troubleshooting of 'why can't VM1 reach VM2':\n1. First: Use IP Flow Verify to identify which NSG is blocking\n2. Then: Use Effective Security Rules to see all active rules on that NIC",
    reference: "https://learn.microsoft.com/azure/network-watcher/diagnose-vm-network-traffic-filtering-problem"
  },
  {
    id: 409,
    domain: 4,
    subdomain: "User Defined Routes",
    type: "single",
    question: "You have a VNet with three subnets: Subnet1 (app servers), Subnet2 (database servers), and AzureFirewallSubnet (Azure Firewall). You need to ensure all traffic from Subnet1 to Subnet2 passes through Azure Firewall for inspection. What should you configure?",
    options: [
      "Configure an NSG on Subnet1 to route traffic to the Azure Firewall private IP",
      "Create a route table with a route for Subnet2's CIDR, set next hop to the Azure Firewall private IP (Virtual Appliance), and associate it with Subnet1",
      "Create a route table with a route for 0.0.0.0/0, set next hop to Virtual Network Gateway, and associate it with Subnet1",
      "Configure Azure Firewall DNAT rules to intercept traffic between subnets"
    ],
    correct: [1],
    explanation: "User Defined Routes (UDRs) override Azure's default system routes to force traffic through a specific next hop.\n\nSolution:\n1. Create a Route Table\n2. Add route:\n   • Address prefix: Subnet2's CIDR (e.g., 10.0.2.0/24)\n   • Next hop type: Virtual appliance\n   • Next hop IP: Azure Firewall's private IP address\n3. Associate the Route Table with Subnet1\n\nResult: When VMs in Subnet1 send traffic to Subnet2, it's routed through Azure Firewall instead of directly.\n\nAzure Firewall then:\n• Inspects the traffic against network rules and application rules\n• Allows or denies based on the policy\n• Logs the traffic for audit\n\nNSG vs UDR:\n• NSG: Controls whether traffic is ALLOWED or DENIED (Layer 4 firewall)\n• UDR: Controls WHERE traffic is ROUTED (changes the route/path)\n• NSGs cannot redirect traffic to another IP — only UDRs do routing\n\nFor 0.0.0.0/0: Would redirect ALL traffic (including internet) through Azure Firewall — not just Subnet2.",
    reference: "https://learn.microsoft.com/azure/virtual-network/virtual-networks-udr-overview"
  },
  {
    id: 410,
    domain: 4,
    subdomain: "Azure Bastion",
    type: "single",
    question: "You have an Azure VM with no public IP address. You need to enable RDP/SSH access to the VM from the Azure portal without deploying a jump server or modifying NSG rules to open port 3389/22. What should you deploy?",
    options: [
      "Azure VPN Gateway with Point-to-Site configuration",
      "Azure Bastion in the VM's virtual network",
      "Azure Application Gateway with WAF",
      "Just-in-Time VM access in Microsoft Defender for Cloud"
    ],
    correct: [1],
    explanation: "Azure Bastion provides fully managed, browser-based RDP/SSH access to VMs directly from the Azure portal without:\n• Public IP on the VM\n• VPN client software\n• Opening port 3389 (RDP) or 22 (SSH) in NSGs\n• Jump servers or bastion hosts managed by you\n\nSetup:\n• Deploy Azure Bastion in a dedicated subnet named exactly 'AzureBastionSubnet' (/26 minimum)\n• Bastion requires a Standard SKU public IP for itself\n• VMs don't need any special configuration\n\nConnect: Azure portal → VM → Connect → Bastion → Enter credentials → Connect in browser\n\nJIT VM Access (comparison):\n• Temporarily opens RDP/SSH NSG rules for a specific source IP for a defined time\n• VMs MAY still need public IPs (or Bastion/VPN for connectivity)\n• More complex setup — requires Microsoft Defender for Servers\n\n• VPN Gateway requires VPN client software and configuration\n• Application Gateway is an HTTP/S load balancer — not for RDP/SSH\n• JIT opens NSG ports temporarily but doesn't provide browser-based access",
    reference: "https://learn.microsoft.com/azure/bastion/bastion-overview"
  },
  {
    id: 411,
    domain: 4,
    subdomain: "Azure Bastion",
    type: "yesno",
    scenario: "You need to deploy Azure Bastion to provide RDP and SSH access to VMs in VNet1. You create a subnet named 'BastionSubnet' with address prefix 10.0.1.0/27.",
    question: "You deploy Azure Bastion in the 'BastionSubnet' subnet.",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "No — this configuration has TWO errors that prevent Azure Bastion deployment:\n\nError 1 — Wrong subnet name:\n• Azure Bastion REQUIRES the subnet to be named exactly 'AzureBastionSubnet' (case-sensitive)\n• 'BastionSubnet' is NOT a valid name for the Bastion dedicated subnet\n\nError 2 — Subnet too small:\n• AzureBastionSubnet must be at MINIMUM /26 (64 addresses)\n• /27 provides only 32 addresses — too small\n• Why /26 minimum: Bastion uses multiple private IP addresses for its backend instances\n• Basic SKU: /26 minimum\n• Standard SKU: /26 minimum (but /25 or larger recommended for more instances)\n\nCorrect setup:\n1. Create subnet named exactly 'AzureBastionSubnet'\n2. Subnet prefix: /26 or larger (e.g., 10.0.1.0/26)\n3. Deploy Azure Bastion resource selecting this subnet\n4. Assign a Standard SKU public IP to Bastion",
    reference: "https://learn.microsoft.com/azure/bastion/configuration-settings#subnet"
  },
  {
    id: 412,
    domain: 4,
    subdomain: "Service Endpoints",
    type: "single",
    question: "You have VMs in Subnet1 of VNet1. You configure a service endpoint for Microsoft.Storage on Subnet1 and update the storage account firewall to allow VNet1/Subnet1. What is the effect on VM connectivity to the storage account?",
    options: [
      "VMs in Subnet1 communicate with the storage account over a private IP address from VNet1",
      "VMs in Subnet1 communicate with the storage account using the public endpoint, but traffic is routed over the Azure backbone network",
      "The storage account becomes inaccessible from the internet after the service endpoint is configured",
      "VMs can access the storage account but only using the account key, not SAS tokens"
    ],
    correct: [1],
    explanation: "Service endpoints route traffic to Azure PaaS services over the Azure backbone network, but the service's endpoint is STILL a public IP address.\n\nWith service endpoint configured:\n• Traffic path: VM → Azure backbone → Storage account public endpoint\n• Source IP seen by storage: VM's PRIVATE IP (identity presented as VNet subnet)\n• Public internet routing: NOT used\n• Storage account public endpoint: STILL EXISTS and is still a public IP\n\nKey distinction from Private Endpoints:\n• Service endpoint: Storage public IP remains; traffic routed via backbone; no private IP in VNet\n• Private endpoint: Storage gets a PRIVATE IP in your VNet; storage public endpoint can be disabled\n\nService endpoint benefits:\n• Traffic stays on Azure backbone (more reliable, lower latency than internet)\n• Source IP is the VM's private IP (not NAT'd)\n• Storage firewall can restrict access to only the specific VNet/subnet\n• Free to configure\n\n• Firewall rules can still allow internet access separately — storage is NOT automatically inaccessible from internet\n• Authentication (keys, SAS tokens, Entra ID) is not affected by service endpoints",
    reference: "https://learn.microsoft.com/azure/virtual-network/virtual-network-service-endpoints-overview"
  },
  {
    id: 413,
    domain: 4,
    subdomain: "Private Endpoints",
    type: "single",
    question: "You need to ensure that access to an Azure SQL Database from VMs in VNet1 uses a private IP address from VNet1's address space, and that no traffic traverses the public internet. What should you configure?",
    options: [
      "A service endpoint for Microsoft.Sql on the VM subnet",
      "A private endpoint for the Azure SQL Database in VNet1",
      "VNet peering between VNet1 and the SQL managed subnet",
      "An NSG rule blocking internet access on the VM subnet"
    ],
    correct: [1],
    explanation: "A private endpoint creates a network interface (NIC) in your VNet with a private IP address that maps to the Azure service (SQL Database in this case).\n\nHow private endpoints work:\n1. A NIC is provisioned in your VNet subnet with a private IP (e.g., 10.1.0.8)\n2. DNS configuration: SQL FQDN resolves to private IP via private DNS zone\n3. Traffic from VM to SQL: Uses private IP → stays in VNet → never touches public internet\n4. Azure SQL's public endpoint: Can be DISABLED completely\n\nPrivate DNS zone for Azure SQL:\n• Zone name: privatelink.database.windows.net\n• A record: sqlserver.privatelink.database.windows.net → 10.1.0.8\n• CNAME: sqlserver.database.windows.net → sqlserver.privatelink.database.windows.net\n\nPrivate endpoint advantages over service endpoint:\n• True private IP in your VNet address space\n• Can disable public network access completely\n• Works across VNet peering and ExpressRoute/VPN\n• Supports all Azure PaaS services\n\n• Service endpoint still uses public IP endpoint (traffic via backbone but public endpoint exists)\n• VNet peering connects VNets — doesn't create a private IP for SQL\n• NSG rules control traffic flow but don't create private IP endpoints",
    reference: "https://learn.microsoft.com/azure/private-link/private-endpoint-overview"
  },
  {
    id: 414,
    domain: 4,
    subdomain: "Private Endpoints",
    type: "multi",
    question: "You configure a private endpoint for an Azure Storage account in VNet1. You try to access the storage account from an on-premises network connected via ExpressRoute. Access fails. Which TWO actions should you take to resolve the issue?",
    options: [
      "Create a private DNS zone (privatelink.blob.core.windows.net) and link it to VNet1",
      "Enable service endpoint for Microsoft.Storage on the on-premises connected subnet",
      "Configure on-premises DNS with a conditional forwarder pointing to Azure DNS Private Resolver or a DNS forwarder VM in Azure",
      "Add the on-premises network CIDR to the storage account firewall IP rules",
      "Deploy an additional private endpoint for the storage account in the on-premises VNet"
    ],
    correct: [0, 2],
    explanation: "For on-premises access via private endpoints, the key challenge is DNS resolution:\n\nProblem: On-premises machines can't query Azure DNS (168.63.129.16) directly because it's only accessible within Azure VNets.\n\nSolution requires TWO components:\n\n1. Private DNS zone linked to VNet1:\n   • Create: privatelink.blob.core.windows.net\n   • Add A record: storageaccount → private endpoint IP\n   • Link zone to VNet1\n   • This enables Azure VMs to resolve the storage FQDN to the private IP\n\n2. On-premises DNS conditional forwarder:\n   • Configure on-premises DNS to forward *.blob.core.windows.net queries to Azure\n   • Use Azure DNS Private Resolver's inbound endpoint (private IP in VNet)\n   • Or: Use a DNS forwarder VM in Azure that forwards to 168.63.129.16\n   • This enables on-premises machines to resolve the storage FQDN to the private endpoint IP\n\nWithout option 2: On-premises machines resolve storage.blob.core.windows.net → public IP (bypasses private endpoint).\n\n• Service endpoints don't apply to on-premises networks\n• Adding on-premises CIDR to storage firewall won't help if DNS resolves to public IP\n• Private endpoints can't exist in on-premises networks",
    reference: "https://learn.microsoft.com/azure/private-link/private-endpoint-dns"
  },
  {
    id: 415,
    domain: 4,
    subdomain: "VPN Gateway",
    type: "single",
    question: "You need to configure a Site-to-Site VPN between your on-premises network and Azure VNet1. You have already created a VPN Gateway in Azure. What Azure resource must you create to represent your on-premises VPN device?",
    options: [
      "Virtual Network Gateway",
      "Local Network Gateway",
      "Connection resource",
      "VPN Profile"
    ],
    correct: [1],
    explanation: "A Local Network Gateway is the Azure resource that represents your on-premises VPN device (router, firewall, or VPN appliance).\n\nLocal Network Gateway contains:\n• Public IP address of the on-premises VPN device\n• On-premises address space(s) that should be accessible through the VPN (e.g., 192.168.0.0/16)\n• Optional: BGP settings (ASN and peer IP) if using BGP\n\nS2S VPN setup components:\n1. VNet + GatewaySubnet in Azure\n2. Virtual Network Gateway (Azure side of the VPN)\n3. Local Network Gateway (represents on-premises device)\n4. Connection resource (links VNet Gateway ↔ Local Network Gateway, defines pre-shared key)\n\nOn-premises:\n• Configure the VPN device with the Azure VPN Gateway's public IP\n• Configure IKE phase 1 and phase 2 parameters matching Azure's requirements\n\n• Virtual Network Gateway is the Azure-side gateway — already created in the question\n• Connection resource is the final link that establishes the tunnel\n• VPN Profile is used for Point-to-Site client configuration",
    reference: "https://learn.microsoft.com/azure/vpn-gateway/tutorial-site-to-site-portal"
  },
  {
    id: 416,
    domain: 4,
    subdomain: "VPN Gateway",
    type: "single",
    question: "You need to configure Point-to-Site (P2S) VPN so that remote users can securely connect to Azure VNet1 from their individual computers using their Microsoft Entra ID credentials. Which authentication method should you configure?",
    options: [
      "Certificate-based authentication with client certificates",
      "RADIUS authentication with on-premises NPS server",
      "Microsoft Entra ID authentication (Azure AD)",
      "IKEv2 with pre-shared key"
    ],
    correct: [2],
    explanation: "P2S VPN authentication methods:\n\n1. Certificate-based authentication:\n   • Client certificates issued from a root CA\n   • Clients authenticate with their certificate\n   • Protocol: IKEv2 or SSTP\n   • No Entra ID credentials\n\n2. RADIUS authentication:\n   • Delegates to on-premises NPS/RADIUS infrastructure\n   • Can authenticate against AD credentials through NPS\n   • More complex setup\n\n3. Microsoft Entra ID authentication:\n   • Users authenticate with their Entra ID (Azure AD) credentials\n   • Supports MFA and Conditional Access\n   • Protocol: OpenVPN ONLY (not IKEv2 or SSTP)\n   • Client: Azure VPN Client application\n   • Single sign-on: Users use the same credentials as Microsoft 365, Azure portal\n\nFor Entra ID credentials specifically: Microsoft Entra ID authentication is the correct choice.\n\nRequirements:\n• VPN Gateway SKU: VpnGw1 or higher (not Basic)\n• Protocol: OpenVPN (SSL/TLS)\n• Azure VPN Client app on the client machine\n\n• Certificate auth doesn't use Entra ID credentials\n• RADIUS can use AD but requires on-premises NPS setup\n• Pre-shared key is for S2S VPNs, not P2S",
    reference: "https://learn.microsoft.com/azure/vpn-gateway/openvpn-azure-ad-tenant"
  },
  {
    id: 417,
    domain: 4,
    subdomain: "VPN Gateway",
    type: "dragdrop",
    question: "Match each VPN Gateway SKU to its correct description.",
    dragItems: [
      "Basic SKU",
      "VpnGw1 SKU",
      "VpnGw2 SKU",
      "VpnGw1AZ SKU"
    ],
    dropZones: [
      "Legacy SKU: Maximum 10 S2S tunnels, no BGP support, no zone redundancy",
      "30 S2S tunnels, BGP support, P2S support, no zone redundancy, ~650 Mbps",
      "30 S2S tunnels, higher throughput than Gw1, BGP, P2S, no zone redundancy, ~1 Gbps",
      "Zone-redundant deployment using Standard SKU public IP, 30 S2S tunnels, BGP, P2S"
    ],
    correct: [[0,0],[1,1],[2,2],[3,3]],
    explanation: "VPN Gateway SKU comparison:\n\nBasic:\n• LEGACY SKU — not recommended for production\n• Max 10 S2S/VNet-to-VNet tunnels\n• NO BGP support\n• NO zone redundancy\n• Max P2S connections: 128\n• Basic public IP SKU (cannot be upgraded to Standard)\n\nVpnGw1:\n• 30 S2S tunnels\n• BGP support\n• P2S: 250 connections\n• ~650 Mbps aggregate throughput\n• NO zone redundancy\n\nVpnGw2:\n• 30 S2S tunnels\n• BGP support\n• P2S: 500 connections\n• ~1 Gbps aggregate throughput\n• NO zone redundancy\n\nVpnGw1AZ:\n• Zone-redundant (deployed across AZs)\n• Same capabilities as VpnGw1 but with AZ deployment\n• Requires Standard SKU public IP\n• 99.99% gateway SLA (vs 99.9% for non-AZ)\n\nAZ variants are available for all Gw1, Gw2, Gw3 SKUs.",
    reference: "https://learn.microsoft.com/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings#gwsku"
  },
  {
    id: 418,
    domain: 4,
    subdomain: "VPN Gateway",
    type: "yesno",
    scenario: "You have a Site-to-Site VPN between your on-premises network and Azure VNet1. You need to enable BGP to allow dynamic route exchange between on-premises and Azure.",
    question: "You configure BGP on the Virtual Network Gateway and set the BGP peer IP and ASN on the Local Network Gateway.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — this is the correct approach to enable BGP on a Site-to-Site VPN.\n\nBGP configuration for S2S VPN:\n\nAzure Virtual Network Gateway side:\n• Enable BGP: Yes\n• Azure BGP ASN: Assign an ASN (default: 65515; range: 65010-65534 for private)\n• Azure BGP peer IP: Automatically assigned from the GatewaySubnet\n\nLocal Network Gateway side (on-premises representation):\n• BGP peer IP: On-premises BGP peer IP address\n• ASN: On-premises BGP ASN\n• Address space: Can be left empty when using BGP (routes are exchanged dynamically)\n\nConnection resource: Enable BGP on the connection (both sides must have BGP enabled)\n\nBGP benefits over static routing:\n• Automatic route exchange — no manual route updates needed\n• Faster failover detection\n• Multi-site routing (multiple S2S with route preference)\n• Transit routing support\n\nNote: BGP is not supported on Basic VPN Gateway SKU.",
    reference: "https://learn.microsoft.com/azure/vpn-gateway/vpn-gateway-bgp-overview"
  },
  {
    id: 419,
    domain: 4,
    subdomain: "ExpressRoute",
    type: "single",
    question: "You are evaluating Azure ExpressRoute for connecting your on-premises datacenter to Azure. Which statement CORRECTLY describes ExpressRoute compared to Site-to-Site VPN?",
    options: [
      "ExpressRoute traffic travels over the public internet with encryption",
      "ExpressRoute provides dedicated private connectivity through a connectivity provider, not over the public internet",
      "ExpressRoute supports a maximum bandwidth of 1 Gbps",
      "ExpressRoute requires an Azure VPN Gateway to be deployed in the GatewaySubnet"
    ],
    correct: [1],
    explanation: "ExpressRoute provides dedicated private connectivity to Azure through a connectivity provider (e.g., AT&T, Equinix, BT, Verizon).\n\nExpressRoute vs Site-to-Site VPN:\n\nExpressRoute:\n• Traffic: Does NOT traverse public internet — private connectivity\n• Encryption: NOT encrypted by default (private circuit, but unencrypted)\n• Bandwidth: 50 Mbps to 100 Gbps\n• Latency: More predictable (dedicated circuit)\n• Reliability: Higher SLA (99.95% with redundant circuits)\n• Cost: Higher (circuit charges from provider)\n• Gateway: Uses ExpressRoute Gateway (not VPN Gateway)\n\nSite-to-Site VPN:\n• Traffic: Traverses public internet\n• Encryption: IPsec/IKE encrypted\n• Bandwidth: Limited by internet connection\n• Latency: Variable (dependent on internet)\n• Cost: Lower (just gateway cost)\n• Gateway: VPN Gateway\n\nExpressRoute encryption options:\n• MACsec: Layer 2 encryption (ExpressRoute Direct only)\n• VPN over ExpressRoute: IPsec tunnel over the private circuit for encryption\n\n• ExpressRoute traffic does NOT go over the internet\n• ExpressRoute supports up to 100 Gbps\n• ExpressRoute uses ExpressRoute Gateway, NOT VPN Gateway",
    reference: "https://learn.microsoft.com/azure/expressroute/expressroute-introduction"
  },
  {
    id: 420,
    domain: 4,
    subdomain: "ExpressRoute",
    type: "single",
    question: "You have an ExpressRoute circuit. You need to ensure that if the ExpressRoute connection fails, traffic can automatically fail over to a Site-to-Site VPN backup connection. What should you configure?",
    options: [
      "ExpressRoute Global Reach between two ExpressRoute circuits",
      "A coexisting Site-to-Site VPN with the VPN Gateway as the lower-priority backup path",
      "Azure Traffic Manager to distribute traffic between ExpressRoute and VPN endpoints",
      "ExpressRoute FastPath to bypass the gateway for failover traffic"
    ],
    correct: [1],
    explanation: "ExpressRoute + VPN coexistence provides automatic failover:\n\nSetup:\n1. Deploy BOTH an ExpressRoute Gateway and a VPN Gateway in the GatewaySubnet (or separate subnets)\n2. Create the ExpressRoute connection (primary path)\n3. Create a S2S VPN connection to the same on-premises network (backup path)\n4. Configure routing (BGP preferred for automatic failover):\n   • ExpressRoute BGP routes have higher preference (lower AS path) → primary\n   • VPN routes have lower preference (higher AS path or MED) → backup\n\nFailover:\n• When ExpressRoute fails, Azure removes its routes\n• BGP converges and traffic automatically routes through VPN\n• Recovery: When ExpressRoute comes back up, its routes are preferred again\n\nExpressRoute Global Reach:\n• Connects two on-premises networks through Azure — doesn't provide VPN failover\n\nExpressRoute FastPath:\n• Bypasses ExpressRoute Gateway for data plane traffic (performance optimization)\n• Not a failover mechanism\n\nTraffic Manager:\n• DNS-based routing — doesn't handle automatic real-time failover for VPN/ExpressRoute",
    reference: "https://learn.microsoft.com/azure/expressroute/expressroute-howto-coexist-resource-manager"
  },
  {
    id: 421,
    domain: 4,
    subdomain: "Azure DNS",
    type: "single",
    question: "You need to host the DNS zone 'contoso.com' in Azure so that you can manage DNS records using Azure tools without maintaining DNS server infrastructure. What should you create?",
    options: [
      "Azure Private DNS zone named contoso.com",
      "Azure Public DNS zone named contoso.com",
      "Azure DNS resolver with a forwarding ruleset",
      "An Azure VM running Windows Server DNS"
    ],
    correct: [1],
    explanation: "Azure Public DNS zones host publicly resolvable DNS zones, allowing you to manage DNS records for your domain in Azure without maintaining DNS server VMs.\n\nSetup:\n1. Create Azure DNS zone: 'contoso.com'\n2. Azure assigns 4 authoritative name servers (e.g., ns1-04.azure-dns.com)\n3. Update your domain registrar's NS records to point to Azure DNS name servers\n4. Azure becomes the authoritative DNS for contoso.com\n\nAzure Public DNS capabilities:\n• Manage A, AAAA, CNAME, MX, TXT, NS, SOA, SRV, PTR records\n• Alias records: CNAME-like behavior for root domains pointing to Azure resources\n• Supports geo-redundant DNS with 100% SLA (global anycast)\n• DNSSEC support\n\nAzure Private DNS zones:\n• For internal name resolution within VNets\n• NOT resolvable from the public internet\n• Used for private hostnames (e.g., vm1.internal.contoso.com within a VNet)\n\n• Private DNS zone: For VNet-internal names only\n• DNS Resolver: For hybrid DNS forwarding (not for hosting public zones)\n• DNS VM: Requires maintenance — use managed Azure DNS instead",
    reference: "https://learn.microsoft.com/azure/dns/dns-overview"
  },
  {
    id: 422,
    domain: 4,
    subdomain: "Azure DNS",
    type: "single",
    question: "You have VMs in VNet1 and VNet2. You need VMs in both VNets to resolve each other by hostname using a private DNS zone named 'internal.contoso.com'. VM hostnames should be automatically registered. What must you configure?",
    options: [
      "Link the private DNS zone to VNet1 and VNet2 with auto-registration disabled on both",
      "Link the private DNS zone to VNet1 and VNet2 with auto-registration enabled on both links",
      "Link the private DNS zone to VNet1 only; VNet2 will inherit the zone automatically",
      "Deploy a custom DNS server in each VNet and configure zone transfer"
    ],
    correct: [1],
    explanation: "Azure Private DNS zone configuration for multi-VNet hostname resolution:\n\nSteps:\n1. Create private DNS zone: internal.contoso.com\n2. Create VNet link for VNet1:\n   • Auto-registration: ENABLED\n   • Result: VMs in VNet1 auto-register as <vmname>.internal.contoso.com\n3. Create VNet link for VNet2:\n   • Auto-registration: ENABLED\n   • Result: VMs in VNet2 auto-register as <vmname>.internal.contoso.com\n4. Both VNets must use Azure-provided DNS (168.63.129.16) for private zone resolution to work\n\nAuto-registration behavior:\n• When a VM is created with a DHCP-assigned private IP → A record auto-added to the linked zone\n• When a VM is deleted or IP changes → Record is updated/removed\n• Only VMs (not other resources like App Services) are auto-registered\n• LIMITATION: Only ONE VNet per zone can have auto-registration enabled as the 'registration network'\n• OTHER VNets can still RESOLVE the zone (linked with auto-registration off)\n\nFor resolution from both VNets:\n• Link zone to both VNets (at minimum with resolution enabled)\n• Enable auto-registration on each VNet to register its VMs\n\n• Single VNet link doesn't allow other VNets to resolve — each VNet needs its own link\n• Custom DNS servers add unnecessary complexity for this use case",
    reference: "https://learn.microsoft.com/azure/dns/private-dns-autoregistration"
  },
  {
    id: 423,
    domain: 4,
    subdomain: "Azure DNS",
    type: "yesno",
    scenario: "You have VMs in VNet1. You create an Azure Private DNS zone named 'corp.internal' and link it to VNet1 with auto-registration enabled. VNet1 is configured to use Azure-provided DNS (168.63.129.16).",
    question: "VMs in VNet1 can resolve each other's hostnames using the corp.internal suffix (e.g., vm1.corp.internal resolves to VM1's private IP).",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — this is the correct and complete configuration for private hostname resolution.\n\nHow it works:\n1. Private DNS zone 'corp.internal' linked to VNet1 with auto-registration\n2. When VM1 is created: Azure auto-registers an A record:\n   • vm1.corp.internal → 10.0.0.4 (VM1's private IP)\n3. VNet1 uses Azure-provided DNS (168.63.129.16)\n4. When any VM queries 'vm1.corp.internal':\n   • Query goes to Azure DNS (168.63.129.16)\n   • Azure DNS checks linked private zones\n   • Returns vm1's private IP from the corp.internal zone\n\nRequirements (all met in this scenario):\n• ✓ Private DNS zone exists\n• ✓ Zone linked to VNet1\n• ✓ Auto-registration enabled (auto-adds VM A records)\n• ✓ VNet uses Azure DNS (168.63.129.16) — required for private zone resolution\n\nIf VNet used custom DNS server: Custom DNS must forward to 168.63.129.16 to resolve private zones.",
    reference: "https://learn.microsoft.com/azure/dns/private-dns-scenarios"
  },
  {
    id: 424,
    domain: 4,
    subdomain: "Azure Load Balancer",
    type: "single",
    question: "You have three VMs in an availability set behind an Azure Standard Load Balancer. You need to configure the load balancer so that a client from the same source IP address always reaches the same backend VM (session stickiness). Which load balancer setting should you configure?",
    options: [
      "Set session persistence to 'None' (5-tuple hash)",
      "Set session persistence to 'Client IP' (2-tuple hash)",
      "Enable floating IP on the load balancing rule",
      "Configure a health probe with HTTP protocol instead of TCP"
    ],
    correct: [1],
    explanation: "Azure Load Balancer session persistence controls which backend VM handles requests from the same client.\n\nSession persistence options:\n\nNone (default — 5-tuple hash):\n• Hash: Source IP + Source port + Destination IP + Destination port + Protocol\n• Same client can reach DIFFERENT backend VMs (source port changes per connection)\n• Best for stateless applications\n\nClient IP (2-tuple hash):\n• Hash: Source IP + Destination IP\n• Same source IP always reaches the SAME backend VM\n• Applies even if the client opens multiple connections\n• Best for: Applications requiring session affinity by source IP\n\nClient IP and Protocol (3-tuple hash):\n• Hash: Source IP + Destination IP + Protocol\n• Slightly more granular than 2-tuple\n\nConfiguration: Load Balancer → Load balancing rules → [rule] → Session persistence → Client IP\n\nFloating IP (Direct Server Return): Changes how the LB forwards packets to backend (destination IP not changed) — for SQL Always On, not for stickiness.\n\nHealth probe protocol: Affects health checking, not session distribution.",
    reference: "https://learn.microsoft.com/azure/load-balancer/load-balancer-distribution-mode"
  },
  {
    id: 425,
    domain: 4,
    subdomain: "Azure Load Balancer",
    type: "dragdrop",
    question: "You are deploying an internal load balancer for a SQL Server Always On Availability Group. Match each SQL AG requirement to the correct Load Balancer setting.",
    dragItems: [
      "Load balancer must have a private IP (not internet-facing)",
      "SQL listener health check must test port 59999",
      "The SQL listener IP must be hosted on the backend VM NIC, not just the LB",
      "All ports should be load balanced with a single rule"
    ],
    dropZones: [
      "Create an Internal Load Balancer (ILB) — not Public",
      "Configure health probe on port 59999 (custom SQL AG probe port)",
      "Enable Floating IP (Direct Server Return) on the load balancing rule",
      "Enable HA Ports on the load balancing rule (all ports, all protocols)"
    ],
    correct: [[0,0],[1,1],[2,2],[3,3]],
    explanation: "SQL Server Always On Availability Group requires specific ILB configuration:\n\n1. Internal Load Balancer (ILB):\n   • SQL AG listeners use private IPs for internal access\n   • ILB provides a private frontend IP (no public IP)\n\n2. Health probe on port 59999:\n   • SQL AG uses a custom PowerShell script that listens on port 59999\n   • The script returns HTTP 200 only on the PRIMARY replica\n   • LB routes traffic only to the primary replica based on this health probe\n\n3. Floating IP (Direct Server Return):\n   • The SQL listener IP (e.g., 10.0.0.20) is also configured on the backend VM's NIC (loopback adapter or secondary IP)\n   • LB forwards packets with the destination IP = listener IP to the backend VM\n   • The VM accepts the packet because the listener IP is locally configured\n   • WITHOUT floating IP: LB rewrites destination IP to VM's primary IP — SQL listener won't respond\n\n4. HA Ports:\n   • Used when you need to load balance ALL ports/protocols with one rule\n   • Useful for Network Virtual Appliances (NVAs)\n   • For SQL AG specifically, you'd normally use port 1433 rule, but HA Ports would also work",
    reference: "https://learn.microsoft.com/azure/load-balancer/load-balancer-ha-ports-overview"
  },
  {
    id: 426,
    domain: 4,
    subdomain: "Azure Load Balancer",
    type: "single",
    question: "You need to load balance HTTPS traffic (port 443) to a backend pool of web servers and require SSL/TLS termination at the load balancer level. Which Azure service should you use?",
    options: [
      "Azure Load Balancer Standard SKU",
      "Azure Application Gateway",
      "Azure Traffic Manager",
      "Azure Front Door"
    ],
    correct: [1],
    explanation: "Azure Application Gateway is a Layer 7 application delivery controller that supports SSL/TLS termination.\n\nSSL termination with Application Gateway:\n• Upload SSL certificate to App Gateway\n• App Gateway terminates HTTPS from clients (decrypts SSL)\n• Backend connections can be HTTP (plain) or HTTPS (re-encrypted)\n• Backend servers are offloaded from SSL processing overhead\n• App Gateway can inspect decrypted HTTP content for WAF rules\n\nApplication Gateway features:\n• SSL/TLS termination\n• WAF (Web Application Firewall)\n• URL path-based routing\n• Cookie-based session affinity\n• HTTP header rewriting\n• Redirection rules\n• Multi-site hosting\n\nAzure Load Balancer limitations:\n• Layer 4 only (TCP/UDP)\n• Cannot inspect or modify HTTP content\n• Cannot terminate SSL — passes through encrypted TCP\n• No WAF, no URL routing, no cookie affinity\n\nFor SSL TERMINATION specifically: Application Gateway is the correct answer.\n\nAzure Front Door: Also provides SSL termination but is a global service (not regional like App Gateway).\nAzure Traffic Manager: DNS-based — doesn't handle actual traffic, no SSL termination.",
    reference: "https://learn.microsoft.com/azure/application-gateway/ssl-overview"
  },
  {
    id: 427,
    domain: 4,
    subdomain: "Application Gateway",
    type: "single",
    question: "You have an Azure Application Gateway with a WAF policy. The WAF is blocking legitimate requests from a partner application due to a false positive. You need to allow these requests while keeping WAF protection active for other traffic. What should you configure?",
    options: [
      "Switch the WAF from Prevention mode to Detection mode for all traffic",
      "Create a WAF exclusion rule for the specific request attribute causing the false positive",
      "Disable the WAF policy entirely and rely on NSG rules",
      "Add the partner application's IP to the NSG allow list on the Application Gateway subnet"
    ],
    correct: [1],
    explanation: "WAF exclusion rules allow you to exclude specific request attributes from WAF inspection while keeping all other WAF rules active.\n\nExclusion rule configuration:\n• Scope: Select which WAF managed rule sets/rules to exclude from\n• Match variable: Choose the request element (e.g., request header name, request body)\n• Operator: Equals, starts with, ends with, contains\n• Selector: The specific value to match (e.g., header name 'X-Custom-Header')\n\nExample: If WAF blocks requests with header 'X-Partner-Auth' containing special characters:\n• Create exclusion: RequestHeaderNames Equals X-Partner-Auth\n• This header is excluded from WAF inspection\n• All other headers and request body elements are still inspected\n\nThis provides granular false positive remediation without broad security impact.\n\nWAF Modes:\n• Detection mode: Logs threats but does NOT block — too permissive for production\n• Prevention mode: Actively blocks matched requests — recommended for production\n\n• Switching to Detection mode allows ALL WAF-flagged traffic through — not selective\n• Disabling WAF removes all WAF protection\n• NSG rules control network-level access (Layer 4), not WAF inspection (Layer 7)",
    reference: "https://learn.microsoft.com/azure/web-application-firewall/ag/application-gateway-waf-configuration"
  },
  {
    id: 428,
    domain: 4,
    subdomain: "Traffic Manager",
    type: "single",
    question: "You have a web application deployed in East US and West Europe. You need to route users to the deployment with the lowest network latency based on their geographic location. Which Azure Traffic Manager routing method should you use?",
    options: [
      "Priority routing",
      "Weighted routing",
      "Performance routing",
      "Geographic routing"
    ],
    correct: [2],
    explanation: "Azure Traffic Manager routing methods:\n\nPerformance routing:\n• Routes DNS queries to the endpoint with the LOWEST NETWORK LATENCY for the client\n• Uses Azure's latency measurement table (periodically updated Internet latency map)\n• User in Europe → West Europe endpoint (lower latency)\n• User in New York → East US endpoint (lower latency)\n• Best for: Optimizing user experience with lowest-latency routing\n\nGeographic routing:\n• Routes based on GEOGRAPHIC ORIGIN of the DNS query (not latency)\n• Example: All users from Europe → West Europe endpoint (regardless of actual latency)\n• Use for: Data residency requirements, regulatory compliance\n• Not optimized for latency\n\nPriority routing:\n• Active/passive failover\n• Primary endpoint gets all traffic; secondary only used when primary is unhealthy\n\nWeighted routing:\n• Distributes traffic proportionally (e.g., 80% to v1, 20% to v2)\n• Use for: A/B testing, gradual migration\n\nFor lowest-latency routing based on user location: Performance routing is correct.",
    reference: "https://learn.microsoft.com/azure/traffic-manager/traffic-manager-routing-methods"
  },
  {
    id: 429,
    domain: 4,
    subdomain: "Traffic Manager",
    type: "yesno",
    scenario: "You use Azure Traffic Manager with Performance routing to direct users to the lowest-latency endpoint. One of your endpoints (West Europe) becomes unhealthy. You need users who would have been directed to West Europe to be automatically redirected to the next best healthy endpoint.",
    question: "You configure health probes on the Traffic Manager profile for each endpoint.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — Traffic Manager health probes are exactly what enables automatic failover when an endpoint becomes unhealthy.\n\nTraffic Manager health probes:\n• Probe types: HTTP, HTTPS, TCP\n• Interval: 10 seconds (fast) or 30 seconds (standard)\n• Timeout: 10 seconds\n• Failure threshold: Number of consecutive failures before marking endpoint degraded\n\nHow failover works:\n1. Traffic Manager sends probes to West Europe endpoint\n2. West Europe fails to respond (endpoint is down)\n3. After the failure threshold is met: Traffic Manager marks West Europe as 'Degraded'\n4. Traffic Manager stops routing DNS to West Europe\n5. Users who would have been routed to West Europe are now directed to the next best healthy endpoint (e.g., East US)\n6. When West Europe recovers: Health probes succeed → endpoint marked 'Online' → traffic resumes\n\nWithout health probes: Traffic Manager would continue routing users to the unhealthy endpoint, causing failures.\n\nHealth probes are ESSENTIAL for automatic failover with Traffic Manager regardless of routing method.",
    reference: "https://learn.microsoft.com/azure/traffic-manager/traffic-manager-monitoring"
  },
  {
    id: 430,
    domain: 4,
    subdomain: "Network Watcher",
    type: "multi",
    question: "You need to troubleshoot network connectivity issues in Azure. Which FOUR Network Watcher features should you use? (Select all correct features listed)",
    options: [
      "IP Flow Verify — test if an NSG rule blocks a specific packet between source and destination",
      "Connection Monitor — continuously monitor connectivity between two endpoints over time",
      "Next Hop — determine which route a packet takes from a VM to a destination IP",
      "Packet Capture — capture raw network packets to/from a VM for deep analysis",
      "VPN Diagnostics — check Azure DNS zone replication status"
    ],
    correct: [0, 1, 2, 3],
    explanation: "Network Watcher diagnostic tools:\n\nIP Flow Verify:\n• Tests if a specific flow (5-tuple) is allowed/denied by NSG rules\n• Returns: allowed/denied AND the specific NSG rule name that made the decision\n• Use when: 'Why can't VM1 reach VM2 on port 443?'\n\nConnection Monitor:\n• Continuously monitors connectivity between source (VM/IP) and destination\n• Measures: round-trip time, packet loss, hop count\n• Alerts when connectivity degrades\n• Use when: 'Is the connection stable over time?'\n\nNext Hop:\n• Shows the effective next hop for traffic from a VM to a destination IP\n• Returns: next hop type (Internet, VirtualAppliance, VirtualNetwork, etc.) and IP\n• Use when: 'Is traffic being routed through the firewall as expected?'\n\nPacket Capture:\n• Captures raw packets (pcap format) from/to a VM NIC\n• Saves to Azure Storage or VM local disk\n• Can filter by IP, port, protocol\n• Use when: 'I need to see exact packet content for deep analysis'\n\nVPN Diagnostics is for troubleshooting VPN gateway connections, NOT for DNS zone replication (which is not a Network Watcher feature).",
    reference: "https://learn.microsoft.com/azure/network-watcher/network-watcher-monitoring-overview"
  },
  {
    id: 431,
    domain: 4,
    subdomain: "Network Watcher",
    type: "single",
    question: "You want to capture all network traffic to and from a VM named VM1 for security forensic analysis. The capture should automatically stop after 30 minutes and save to an Azure Storage account in pcap format. What should you use?",
    options: [
      "Azure Monitor diagnostic settings on the VM",
      "NSG flow logs on the VM's subnet NSG",
      "Network Watcher Packet Capture",
      "Azure Firewall IDPS logs"
    ],
    correct: [2],
    explanation: "Network Watcher Packet Capture captures raw network packets (pcap/cap format) directly from a VM's network interface.\n\nPacket Capture features:\n• Capture raw packets: Full packet content (headers + payload)\n• Filters: By source/destination IP, port, and protocol\n• Storage: Azure Storage blob OR VM local disk\n• Time limit: Set maximum capture duration (e.g., 30 minutes)\n• Size limit: Set maximum file size\n• Format: Compatible with Wireshark and other pcap tools\n\nSetup: Azure portal → Network Watcher → Packet capture → New → Select VM, storage account, limits, filters → Start\n\nOr CLI:\naz network watcher packet-capture create --resource-group RG1 --vm VM1 --name capture1 --storage-account SA1 --time-limit 1800\n\nNSG flow logs: Record METADATA about flows (IPs, ports, allowed/denied, direction) — NOT raw packet content.\n\nAzure Monitor diagnostics: Collect OS-level metrics and logs — not raw network packets.\n\nAzure Firewall IDPS logs: Threat detection logs from Azure Firewall — not per-VM packet captures.",
    reference: "https://learn.microsoft.com/azure/network-watcher/packet-capture-overview"
  },
  {
    id: 432,
    domain: 4,
    subdomain: "NSG Flow Logs",
    type: "single",
    question: "You need to record information about all IP traffic flowing through an NSG, including source/destination IPs, ports, flow direction, and whether traffic was allowed or denied. You also want to query this data with KQL. What should you configure?",
    options: [
      "Azure Firewall diagnostic logs",
      "NSG flow logs version 2 sent to a Log Analytics workspace, with Traffic Analytics enabled",
      "Network Watcher Packet Capture on all VMs in the subnet",
      "Azure Monitor Activity Log on the NSG resource"
    ],
    correct: [1],
    explanation: "NSG flow logs capture flow-level metadata for all traffic processed by an NSG.\n\nNSG Flow Logs version 2 captures:\n• Source IP, Destination IP\n• Source port, Destination port\n• Protocol\n• Direction (inbound/outbound)\n• Allow/Deny decision\n• Flow state (beginning, end, continuing)\n• Byte and packet counts\n\nStorage and analysis options:\n1. Storage account: JSON format, low cost, archival — not easily queryable\n2. Traffic Analytics (Log Analytics workspace):\n   • Processes NSG flow logs and sends to Log Analytics\n   • Query with KQL in Log Analytics\n   • Visual dashboards in Azure Monitor Workbooks\n   • Identify top talkers, malicious flows, open ports\n\nKQL example:\nAzureNetworkAnalytics_CL\n| where FlowType_s == 'MaliciousFlow'\n| summarize count() by DestIP_s, SourcePort_d\n\nActivity Log: Records control-plane events (NSG rule changes, NSG creation/deletion) — not traffic data.\nPacket Capture: Raw packet content — not flow summary data.\nAzure Firewall logs: Only for traffic processed by Azure Firewall — not per-NSG.",
    reference: "https://learn.microsoft.com/azure/network-watcher/nsg-flow-logs-overview"
  },
  {
    id: 433,
    domain: 4,
    subdomain: "Azure Firewall",
    type: "single",
    question: "You deploy Azure Firewall in your hub VNet. You need to allow VMs in spoke VNets to access specific HTTPS URLs (e.g., *.microsoft.com) while blocking all other internet-bound HTTPS traffic. What type of Azure Firewall rule should you create?",
    options: [
      "Network rule allowing TCP port 443 from spoke VNets to the internet",
      "NAT rule for HTTPS traffic with destination translation",
      "Application rule with target FQDNs (*.microsoft.com) and protocol HTTPS:443",
      "Network rule using the 'MicrosoftActiveProtectionService' FQDN tag"
    ],
    correct: [2],
    explanation: "Azure Firewall Application Rules operate at Layer 7 and can filter by FQDN (Fully Qualified Domain Name), including wildcards.\n\nApplication rule for HTTPS URL filtering:\n• Source: Spoke VNet address ranges (e.g., 10.1.0.0/16)\n• Protocol: HTTPS:443\n• Target FQDNs: *.microsoft.com\n• Action: Allow\n\nHow FQDN filtering works for HTTPS:\n• Azure Firewall uses SNI (Server Name Indication) inspection to see the hostname in the TLS ClientHello\n• Does NOT need to decrypt TLS to filter by FQDN\n• Alternatively, enable TLS inspection for full L7 inspection\n\nAzure Firewall rule types:\n• Network rules (L4): Filter by IP, port, protocol — no FQDN filtering\n• Application rules (L7): Filter by FQDN, protocol — for HTTP/HTTPS traffic\n• NAT rules: DNAT for inbound traffic\n• FQDN tags: Pre-defined groups of Microsoft service FQDNs (e.g., 'MicrosoftActiveProtectionService' for Windows Update)\n\nFor specific wildcard FQDN control (*.microsoft.com): Application rule is the correct type.\n\n• Network rule with TCP 443: Allows all HTTPS traffic to any destination — not URL-specific\n• FQDN tags are pre-defined groups — can't create custom wildcard FQDNs with them",
    reference: "https://learn.microsoft.com/azure/firewall/rule-processing"
  },
  {
    id: 434,
    domain: 4,
    subdomain: "Azure Firewall",
    type: "yesno",
    scenario: "You have Azure Firewall deployed with a Firewall Policy. You need to allow VMs in VNet1 to access Azure Storage accounts using their FQDNs (*.blob.core.windows.net). You consider creating a network rule allowing TCP 443 to the storage account's current public IP range.",
    question: "Creating a network rule collection allowing TCP port 443 to a specific Azure Storage IP range (e.g., 52.230.0.0/15) meets the goal.",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "No — using hardcoded IP ranges for Azure Storage is NOT the recommended approach.\n\nProblems with IP-based rules for Azure Storage:\n• Azure periodically updates and changes its IP address ranges for services\n• Hardcoded IP ranges become stale quickly\n• Maintenance burden: Must monitor Azure IP range changes and update rules\n• Risk: Storage access breaks when Azure updates IPs\n\nBetter approaches:\n\n1. Application Rule with FQDN:\n   • Target FQDN: *.blob.core.windows.net\n   • Protocol: HTTPS:443\n   • Azure Firewall resolves the FQDN dynamically using Azure's DNS\n   • Always routes to current IP regardless of changes\n\n2. Network Rule with Service Tag:\n   • Source: VNet1 address space\n   • Destination: Service tag 'Storage' or 'Storage.EastUS'\n   • Protocol: TCP, Port: 443\n   • Azure maintains service tags with current IP ranges automatically\n   • No manual IP range management needed\n\nService tags are dynamically maintained by Microsoft — they update automatically when Azure service IPs change.",
    reference: "https://learn.microsoft.com/azure/firewall/service-tags"
  },
  {
    id: 435,
    domain: 4,
    subdomain: "DDoS Protection",
    type: "single",
    question: "You need to protect your Azure public IP addresses from DDoS attacks and require access to real-time attack metrics, alerts, and the DDoS Rapid Response (DRR) team during an active attack. Which DDoS Protection tier should you enable?",
    options: [
      "DDoS Infrastructure Protection (automatically applied to all Azure resources)",
      "Azure DDoS Network Protection plan (Standard tier)",
      "Azure Firewall Premium with IDPS enabled",
      "Azure Front Door with WAF in Prevention mode"
    ],
    correct: [1],
    explanation: "Azure DDoS Protection tiers:\n\nDDoS Infrastructure Protection (Basic):\n• Automatically enabled for all Azure resources at NO COST\n• Always-on traffic monitoring\n• Real-time mitigation of common network attacks\n• NO: Custom attack metrics, NO: Customizable alerts, NO: DRR team access, NO: SLA\n• Protects Azure platform infrastructure (not customer-specific protection)\n\nDDoS Network Protection (Standard):\n• Paid plan applied per VNet\n• Adaptive tuning per protected resource's traffic patterns\n• Real-time attack metrics and diagnostic logging\n• Azure Monitor alerts on DDoS attacks\n• DDoS Rapid Response (DRR) team: 24/7 access during active attacks\n• Cost protection: Credits for scale-out costs during attacks\n• SLA: Guaranteed protection\n• Telemetry: Attack start/stop, traffic vectors, dropped packets\n\nFor real-time metrics AND DRR team access: DDoS Network Protection is required.\n\nNote: In 2023, Azure rebranded 'DDoS Standard' to 'DDoS Network Protection'.\n\n• Firewall Premium IDPS detects intrusions within your traffic — doesn't specifically protect against volumetric DDoS\n• Azure Front Door WAF protects web applications at Layer 7 — doesn't protect network-level DDoS on all public IPs",
    reference: "https://learn.microsoft.com/azure/ddos-protection/ddos-protection-overview"
  },
  {
    id: 436,
    domain: 4,
    subdomain: "VNet Peering",
    type: "single",
    question: "You have a hub-spoke topology: HubVNet (with VPN Gateway), Spoke1VNet, and Spoke2VNet. Both spokes are peered with HubVNet with 'Allow gateway transit' on Hub side and 'Use remote gateways' on spoke sides. On-premises users connect via VPN to HubVNet. Can on-premises users reach VMs in Spoke1VNet and Spoke2VNet?",
    options: [
      "No — on-premises users can only reach VMs directly in HubVNet",
      "Yes — gateway transit propagates on-premises routes to spoke VNets through the hub gateway",
      "Yes — but only if Spoke1VNet and Spoke2VNet are also peered with each other",
      "No — each spoke VNet requires its own VPN Gateway for on-premises access"
    ],
    correct: [1],
    explanation: "Yes — gateway transit in hub-spoke topology enables on-premises to spoke connectivity.\n\nHow gateway transit works:\n1. On-premises → VPN → VPN Gateway in HubVNet\n2. VPN Gateway learns on-premises routes via VPN/BGP\n3. Gateway transit propagates these routes TO the spoke VNets:\n   • HubVNet peering: 'Allow gateway transit' = YES → Hub shares its gateway with spokes\n   • Spoke peering: 'Use remote gateways' = YES → Spokes route through Hub's gateway\n4. Spoke VNets learn on-premises routes → Spoke VMs can route to on-premises\n5. On-premises learns spoke VNet address spaces → On-premises can reach spoke VMs\n\nThis is the classic hub-spoke pattern:\n• Centralized gateway in hub (cost savings — one gateway serves multiple spokes)\n• No per-spoke VPN gateways needed\n• All spoke-to-on-premises traffic flows through hub\n\nSpoke-to-spoke communication:\n• Spokes cannot communicate DIRECTLY with each other by default (peering not transitive)\n• For spoke-to-spoke: Either direct peering or UDR through Azure Firewall/NVA in hub",
    reference: "https://learn.microsoft.com/azure/architecture/reference-architectures/hybrid-networking/hub-spoke"
  },
  {
    id: 437,
    domain: 4,
    subdomain: "Application Gateway",
    type: "single",
    question: "You have an Azure Application Gateway v2. You need to route requests to different backend pools based on URL path: requests to /api/* go to API servers (Pool1) and /images/* go to image servers (Pool2). What must you configure?",
    options: [
      "Multiple listeners on different port numbers",
      "URL path-based routing rules with a path map",
      "Multiple frontend IP addresses with different DNS names",
      "Cookie-based session affinity on each backend pool"
    ],
    correct: [1],
    explanation: "Application Gateway URL path-based routing:\n\nConfiguration components:\n1. Listener: Single HTTP/HTTPS listener on port 80/443\n2. Routing rule: Type = 'Path-based' (not 'Basic')\n3. URL path map with path rules:\n   • Path: /api/* → Backend pool: Pool1 + HTTP settings: ApiSettings\n   • Path: /images/* → Backend pool: Pool2 + HTTP settings: ImageSettings\n   • Default: → Default backend pool (catches all non-matched paths)\n\nResult:\nhttp://www.contoso.com/api/users → Pool1 (API servers)\nhttp://www.contoso.com/images/logo.png → Pool2 (Image servers)\nhttp://www.contoso.com/about → Default pool\n\nMulti-site hosting (different option):\n• Routes based on HOSTNAME (e.g., api.contoso.com vs images.contoso.com)\n• Uses multiple listeners with different host names\n• Different from path-based which uses the same hostname/listener\n\n• Multiple port listeners: For different ports (e.g., port 80 vs 8080) — not path-based\n• Multiple frontend IPs: For different IP-based listeners\n• Cookie affinity: For stickiness to backend instances — not path routing",
    reference: "https://learn.microsoft.com/azure/application-gateway/url-route-overview"
  },
  {
    id: 438,
    domain: 4,
    subdomain: "Azure Front Door",
    type: "single",
    question: "You have a globally distributed web application with backends in East US, West Europe, and Southeast Asia. You need a single service that provides: global load balancing, SSL termination at the edge, WAF protection, edge caching, and automatic failover. Which Azure service should you use?",
    options: [
      "Azure Traffic Manager with an Application Gateway in each region",
      "Azure Front Door",
      "Azure Standard Load Balancer in multiple regions with geo-routing",
      "Azure CDN (Akamai) with custom routing rules"
    ],
    correct: [1],
    explanation: "Azure Front Door is a global application delivery network (ADN) that combines multiple services in one:\n\nFront Door capabilities:\n• Global load balancing: Anycast-based routing to nearest healthy backend\n• SSL/TLS termination: At Azure's global edge PoPs (Points of Presence)\n• WAF: Integrated Web Application Firewall with DRS (OWASP) and custom rules\n• Edge caching: Content cached at PoPs for static content\n• URL rewriting and redirection\n• HTTP/2 and WebSocket support\n• Automatic failover: Health probes → routes to next healthy backend if primary fails\n• Custom domains with free managed TLS certificates\n\nFront Door vs Traffic Manager + Application Gateway:\n• Front Door: Single service, global by design, edge caching, WAF at edge\n• TM + AppGW: DNS-based global + regional L7 LB — no edge caching, complex setup\n\nFront Door vs CDN:\n• Front Door: Dynamic AND static content, global load balancing, WAF, SSL termination\n• CDN: Primarily static content caching — no load balancing, no WAF\n\nStandard Load Balancer: Layer 4 regional only — no SSL termination, no WAF, no caching.",
    reference: "https://learn.microsoft.com/azure/frontdoor/front-door-overview"
  },
  {
    id: 439,
    domain: 4,
    subdomain: "Network Security Groups",
    type: "single",
    question: "An NSG on Subnet1 has these outbound rules: Priority 100 – Allow TCP 443 to Internet; Priority 200 – Deny All to Internet. Default rules: Priority 65000 – AllowVnetOutBound; Priority 65001 – AllowInternetOutBound; Priority 65500 – DenyAllOutBound. A VM tries to access http://contoso.com on port 80. What happens?",
    options: [
      "Traffic is allowed because AllowInternetOutBound default rule allows all internet traffic",
      "Traffic is allowed because there is no explicit deny for port 80",
      "Traffic is denied because priority 200 'Deny All to Internet' matches port 80 traffic",
      "Traffic is denied because there is no explicit Allow rule for port 80"
    ],
    correct: [2],
    explanation: "NSG rules are evaluated in PRIORITY ORDER (lowest number = highest priority) and stop at the first match.\n\nFor outbound TCP port 80 to the internet:\n\n1. Priority 100 — Allow TCP 443 to Internet:\n   • Port 80 ≠ Port 443 → Does NOT match → Continue to next rule\n\n2. Priority 200 — Deny All to Internet:\n   • Any protocol, any port, destination = Internet → MATCHES\n   • Action: Deny → Traffic is DENIED here\n   • Rule evaluation STOPS — no further rules checked\n\n3. Priority 65001 — AllowInternetOutBound (default):\n   • Would allow all internet traffic, but NEVER REACHED because rule 200 already matched\n\nKey principle:\n• The FIRST matching rule wins\n• Custom rules (priorities < 65000) are always evaluated before default rules (65000+)\n• Having a custom Deny rule at priority 200 overrides the default Allow at 65001\n• Deny at 200 is NOT about which action 'wins' — it's about which rule MATCHES FIRST\n\nTo allow port 80: Add a rule with priority < 200 that allows TCP 80 to Internet.",
    reference: "https://learn.microsoft.com/azure/virtual-network/network-security-groups-overview#security-rules"
  },
  {
    id: 440,
    domain: 4,
    subdomain: "Virtual Networks",
    type: "single",
    question: "You have VNet1 with address space 10.10.0.0/16. You need to add a second non-contiguous address space (192.168.0.0/24) to VNet1 without recreating the VNet. What should you do?",
    options: [
      "Delete VNet1 and recreate it with both address spaces",
      "Add 192.168.0.0/24 as an additional address space to VNet1 in the Azure portal",
      "Create a second VNet with 192.168.0.0/24 and peer it with VNet1",
      "Expand VNet1's address space using supernetting to include both ranges"
    ],
    correct: [1],
    explanation: "Azure VNets support multiple non-contiguous address spaces. You can add additional CIDR ranges without recreating the VNet.\n\nSteps:\n1. Azure portal → VNet1 → Address space\n2. Click '+ Add' → Enter 192.168.0.0/24\n3. Save\n\nOr CLI:\naz network vnet update --resource-group RG1 --name VNet1 --add addressSpace.addressPrefixes '192.168.0.0/24'\n\nAfter adding:\n• Create subnets in the new 192.168.0.0/24 range\n• Existing subnets in 10.10.0.0/16 are unaffected\n• No downtime for existing VMs\n\nConstraints:\n• New address space must NOT overlap with existing subnets in the VNet\n• New address space must NOT overlap with peered VNet address spaces\n• If the VNet is peered, you may need to resync the peering after adding the new range\n\nSupernetting: Would require a contiguous address range — 10.x.x.x and 192.168.x.x are not contiguous and can't be superneted into a single prefix.\n\nPeering alternative: Works but adds network complexity unnecessarily when a simple address space addition suffices.",
    reference: "https://learn.microsoft.com/azure/virtual-network/manage-virtual-network"
  },
  {
    id: 441,
    domain: 4,
    subdomain: "VPN Gateway",
    type: "single",
    question: "You have a Site-to-Site VPN Gateway connection that goes down intermittently. Your on-premises firewall shows IKE packets are being received but the tunnel is not establishing. Which TWO ports must be open on the on-premises firewall for IKEv2 IPsec VPN to work?",
    options: [
      "UDP 500 (IKE) and UDP 4500 (NAT-T)",
      "TCP 443 and UDP 1194 (OpenVPN)",
      "UDP 500 and TCP 8080",
      "TCP 1723 (PPTP) and GRE Protocol 47"
    ],
    correct: [0],
    explanation: "Azure VPN Gateways use IKEv1/IKEv2 with IPsec for S2S VPN tunnels. Required firewall ports:\n\nUDP 500 — IKE (Internet Key Exchange):\n• Used for IKE phase 1 (SA negotiation) and phase 2 (IPsec SA)\n• Main mode (IKEv1) or IKE_SA_INIT / IKE_AUTH (IKEv2)\n\nUDP 4500 — NAT Traversal (NAT-T):\n• Required when either endpoint is behind NAT\n• Most on-premises environments have NAT between VPN device and internet\n• After NAT-T detection, all subsequent IKE and ESP traffic uses UDP 4500\n• Azure VPN Gateway always sends to UDP 4500 by default\n\nIP Protocol 50 — ESP (Encapsulating Security Payload):\n• The actual encrypted VPN data traffic\n• Not a TCP/UDP port — it's an IP protocol number\n• When NAT-T is used, ESP is encapsulated in UDP 4500 (so protocol 50 may not need explicit firewall rule)\n\nOpenVPN ports: TCP 443 / UDP 1194 — for P2S VPN with OpenVPN protocol, not S2S IKEv2\nPPTP/GRE: Legacy VPN — not used by Azure VPN Gateway\n\nCheck on-premises firewall for:\n• UDP 500 inbound and outbound\n• UDP 4500 inbound and outbound",
    reference: "https://learn.microsoft.com/azure/vpn-gateway/vpn-gateway-about-vpn-devices#firewall"
  },
  {
    id: 442,
    domain: 4,
    subdomain: "Azure DNS",
    type: "single",
    question: "Your company uses Azure Private DNS zones for internal name resolution. On-premises DNS servers need to resolve Azure private DNS zone names (e.g., vm1.corp.internal). On-premises DNS cannot query 168.63.129.16 directly. What should you deploy to resolve this?",
    options: [
      "Azure DNS Private Resolver with an inbound endpoint in the VNet",
      "Configure split-horizon DNS on all on-premises DNS servers",
      "Deploy a custom DNS forwarder VM in Azure that proxies queries to 168.63.129.16",
      "Both Azure DNS Private Resolver and a custom DNS forwarder VM are valid solutions"
    ],
    correct: [3],
    explanation: "Both solutions solve the same problem — enabling on-premises DNS to resolve Azure private DNS zone names.\n\nOption A — Azure DNS Private Resolver:\n• Deploy an inbound endpoint with a private IP in your VNet (e.g., 10.0.0.10)\n• Configure on-premises DNS conditional forwarder:\n  corp.internal → 10.0.0.10 (Private Resolver inbound endpoint)\n• Private Resolver forwards to 168.63.129.16 internally\n• Fully managed — no VM to maintain\n• Supports: Inbound resolution (on-prem → Azure) and Outbound resolution (Azure → on-prem)\n\nOption C — Custom DNS Forwarder VM:\n• Deploy a Windows Server or Linux VM with DNS role in Azure VNet\n• Configure it to forward corp.internal queries to 168.63.129.16 (Azure DNS)\n• Configure on-premises DNS conditional forwarder → VM's private IP\n• Works but requires VM management, patching, high availability planning\n\nBoth are valid approaches:\n• DNS Private Resolver: Newer, managed, recommended for new deployments\n• Custom forwarder VM: Older approach, still widely used, requires maintenance\n\nSplit-horizon DNS is a different concept — serving different DNS responses for internal vs external queries from the same server.",
    reference: "https://learn.microsoft.com/azure/dns/dns-private-resolver-overview"
  },
  {
    id: 443,
    domain: 4,
    subdomain: "Network Security Groups",
    type: "single",
    question: "You have an NSG with these outbound rules: Priority 100 – Allow TCP 443 to Internet; Priority 200 – Deny All to Internet. Default outbound rules also include AllowInternetOutBound at priority 65001. A VM tries to access http://www.contoso.com on port 80. What happens?",
    options: [
      "Traffic is allowed because AllowInternetOutBound default rule covers all internet traffic",
      "Traffic is allowed because port 80 is not explicitly denied by any rule",
      "Traffic is denied because priority 200 'Deny All to Internet' matches first",
      "Traffic is denied because there is no explicit allow for port 80"
    ],
    correct: [2],
    explanation: "NSG evaluation: rules are processed in PRIORITY ORDER (lower number = higher priority). First matching rule wins.\n\nFor TCP port 80 outbound to the internet:\n1. Priority 100 — Allow TCP 443 to Internet: Port 80 ≠ 443 → No match → continue\n2. Priority 200 — Deny All to Internet: Any port, any protocol, destination=Internet → MATCH → DENY\n   (Rule evaluation stops here)\n3. Priority 65001 — AllowInternetOutBound: Never reached\n\nThe custom 'Deny All' at priority 200 overrides the default 'AllowInternetOutBound' at 65001 because:\n• 200 < 65001 (lower priority number = higher precedence)\n• The custom deny rule matches first\n\nTo allow port 80 as well: Add a rule with priority < 200 that allows TCP 80 to Internet.\n\nCommon misconception: 'Allow' doesn't override 'Deny' — PRIORITY ORDER decides which rule applies first. The first matching rule is the only one that matters.",
    reference: "https://learn.microsoft.com/azure/virtual-network/network-security-groups-overview#security-rules"
  },
  {
    id: 444,
    domain: 4,
    subdomain: "Azure Load Balancer",
    type: "single",
    question: "You have an Azure Standard Load Balancer with a backend pool of 5 VMs. You notice some VMs are receiving traffic even when they are unhealthy and their application is not responding. What is the most likely cause?",
    options: [
      "The health probe protocol is TCP instead of HTTP",
      "No health probe is configured on the load balancing rule",
      "Session persistence is set to 'Client IP'",
      "The load balancer is Basic SKU which doesn't enforce health probes"
    ],
    correct: [1],
    explanation: "If no health probe is configured on a load balancing rule, Azure Load Balancer considers ALL backend instances as healthy by default and distributes traffic to all instances regardless of their actual state.\n\nHow health probes work:\n• Configured: LB sends probe requests to each backend VM on the specified port/path\n• If probe succeeds: Backend is considered healthy — receives traffic\n• If probe fails (N times): Backend is removed from rotation — no traffic sent\n• 'No probe': LB assumes all backends are always healthy\n\nProbe types:\n• TCP probe: Checks if TCP port is open (not application health)\n  - Limitation: Port might be open even if application is crashed/unresponsive\n• HTTP/HTTPS probe: Sends GET request to path, checks for HTTP 200 response\n  - Better for true application health (checks actual app is responding)\n\nRecommendation: Always configure health probes that test APPLICATION health (HTTP 200 on /health endpoint), not just TCP connectivity.\n\nStandard LB vs Basic LB:\n• Both support health probes\n• Standard LB is required for availability zones, HTTPS probes, SLA guarantees\n• Basic LB is free but feature-limited",
    reference: "https://learn.microsoft.com/azure/load-balancer/load-balancer-custom-probe-overview"
  },
  {
    id: 445,
    domain: 4,
    subdomain: "Private Endpoints",
    type: "yesno",
    scenario: "You configure a private endpoint for an Azure Key Vault in VNet1. The private endpoint NIC has private IP 10.1.0.5. VMs in VNet1 need to resolve 'myvault.vault.azure.net' to the private endpoint IP automatically.",
    question: "You create a private DNS zone named 'privatelink.vaultcore.azure.net', add an A record 'myvault' pointing to 10.1.0.5, and link the zone to VNet1.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — this is the correct and complete DNS configuration for Key Vault private endpoints.\n\nDNS resolution chain:\n1. VM queries: myvault.vault.azure.net\n2. Azure DNS returns CNAME: myvault.privatelink.vaultcore.azure.net\n   (This CNAME is automatically returned by Azure when a private endpoint exists)\n3. Azure DNS resolves: myvault.privatelink.vaultcore.azure.net\n4. Checks linked private DNS zone: privatelink.vaultcore.azure.net\n5. A record 'myvault' → 10.1.0.5 found\n6. VM connects to Key Vault via private endpoint IP 10.1.0.5\n\nPrivate DNS zone names for common Azure services:\n• Key Vault: privatelink.vaultcore.azure.net\n• Blob Storage: privatelink.blob.core.windows.net\n• SQL Database: privatelink.database.windows.net\n• App Service: privatelink.azurewebsites.net\n\nThis configuration ensures:\n• VMs in VNet1 resolve Key Vault FQDN to private IP (stays in VNet)\n• Key Vault public access can be disabled after this configuration\n• On-premises (ExpressRoute/VPN): Needs additional DNS forwarding configuration",
    reference: "https://learn.microsoft.com/azure/private-link/private-endpoint-dns#azure-services-dns-zone-configuration"
  },
  {
    id: 446,
    domain: 4,
    subdomain: "ExpressRoute",
    type: "single",
    question: "You have an ExpressRoute circuit with 1 Gbps bandwidth. You need to connect multiple Azure VNets to this circuit. What is the Azure resource that links a VNet to an ExpressRoute circuit?",
    options: [
      "Local Network Gateway with ExpressRoute configuration",
      "VNet peering connection to the ExpressRoute circuit VNet",
      "ExpressRoute Gateway deployed in the GatewaySubnet, with a connection resource linking it to the ExpressRoute circuit",
      "ExpressRoute Direct with virtual cross-connect per VNet"
    ],
    correct: [2],
    explanation: "To connect a VNet to an ExpressRoute circuit:\n\nStep 1 — Create GatewaySubnet in the VNet:\n• Subnet must be named exactly 'GatewaySubnet'\n• /27 or larger recommended\n\nStep 2 — Deploy ExpressRoute Gateway:\n• Create a virtual network gateway with type 'ExpressRoute'\n• Select a gateway SKU: ErGw1AZ, ErGw2AZ, ErGw3AZ (zone-redundant)\n• Or non-AZ: Standard, HighPerformance, UltraPerformance\n\nStep 3 — Create Connection resource:\n• Links the ExpressRoute Gateway to the ExpressRoute circuit\n• Requires the circuit's Authorization Key (if circuit is in different subscription)\n• Connection type: ExpressRoute\n\nMultiple VNets on same circuit:\n• Deploy an ExpressRoute Gateway in each VNet\n• Create a separate connection from each gateway to the same circuit\n• Bandwidth is SHARED across all VNets connected to the circuit\n\nExpressRoute Gateway SKU comparison:\n• ErGw1AZ: Up to 1 Gbps, zone-redundant\n• ErGw2AZ: Up to 2 Gbps, zone-redundant\n• ErGw3AZ: Up to 10 Gbps, zone-redundant\n\n• Local Network Gateway is for VPN connections — NOT for ExpressRoute\n• VNet peering doesn't connect to ExpressRoute circuits\n• ExpressRoute Direct is for provisioning your own circuit capacity at 10/100 Gbps",
    reference: "https://learn.microsoft.com/azure/expressroute/expressroute-howto-linkvnet-arm"
  }
]);
