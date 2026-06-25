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


// ─── Microsoft Practice Assessment — Domain 4 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 451,
    domain: 4,
    subdomain: "Virtual Networks",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure virtual network that contains two subnets named Subnet1 and Subnet2. You have a virtual machine named VM1 that is connected to Subnet1. VM1 runs Windows Server.\nYou need to ensure that VM1 is connected directly to both subnets.\nWhat should you do first?",
    options: [
      "From the Azure portal, add a network interface.",
      "From the Azure portal, create an IP group.",
      "From the Azure portal, modify the IP configurations of an existing network interface.",
      "Sign in to Windows Server and create a network bridge."
    ],
    correct: [0],
    explanation: "A network interface is used to connect a virtual machine to a subnet. Since VM1 is connected to Subnet1, VM1 already has a network interface attached that is connected to Subnet1. To connect VM1 directly to Subnet2, you must create a new network interface that is connected to Subnet2. Next, you must attach the new network interface to VM1.\nAn IP group is a user-defined collection of static IP addresses, ranges, and subnets. A network bridge allows you to connect multiple existing network connections in Windows together. Changing the IP configurations of the existing network interface results in VM1 being connected to Subnet2 but not to Subnet1."
  },
  {
    id: 452,
    domain: 4,
    subdomain: "Network Monitoring",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains virtual machines, virtual networks, application gateways, and load balancers.\nYou need to monitor the network health of the resources.\nWhich Azure service should you use?",
    options: [
      "Azure Monitor",
      "Azure Network Watcher",
      "Azure Resource Manager",
      "network security groups (NSGs)"
    ],
    correct: [1],
    explanation: "Azure Network Watcher provides tools to monitor, diagnose, view metrics, and enable or disable logs for resources on an Azure virtual network. Azure Resource Manager is the deployment and management service for Azure. Network security groups (NSGs) are used only for security, not monitoring. Azure Monitor is used for the HTTP Data Collector API to send log data to Log Analytics."
  },
  {
    id: 453,
    domain: 4,
    subdomain: "VPN Gateway",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a virtual network named VNet1.\nYou plan to enable VNet1 connectivity to on-premises resources by using an encrypted connection.\nWhat should you configure for VNet1?",
    options: [
      "a private endpoint connection",
      "a public IP address",
      "a virtual network gateway",
      "internet routing"
    ],
    correct: [2],
    explanation: "A VPN gateway is a type of virtual network gateway that sends encrypted traffic between a virtual network and an on-premises location across a public connection. You can also use a VPN gateway to send traffic between virtual networks across the Azure backbone. A VPN gateway connection relies on the configuration of multiple resources, each of which contains configurable settings."
  },
  {
    id: 454,
    domain: 4,
    subdomain: "Azure Bastion",
    type: "single",
    source: "MS Practice Assessment",
    question: "You create several Azure virtual machines that run Windows Server.\nYou need to connect to the virtual machines without exposing RDP ports over the internet.\nWhich Azure service should you deploy?",
    options: [
      "Azure Bastion",
      "Azure Front Door",
      "Azure Network Watcher",
      "Azure Virtual Desktop"
    ],
    correct: [0],
    explanation: "Azure Bastion is a service that lets you connect to a virtual machine by using a browser, without exposing RDP and SSH ports. Azure Monitor helps you maximize the availability and performance of applications and services. Azure Network Watcher provides tools to monitor, diagnose, view metrics, and enable or disable logs for resources in an Azure virtual network. Remote Desktop is a feature of the operating system, which exposes the RDP port to connect to a server from the internet."
  },
  {
    id: 455,
    domain: 4,
    subdomain: "NSG",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have three network security groups (NSGs) named NSG1, NSG2, and NSG3. Port 80 is blocked in NSG3 and allowed in NSG1 and NSG2.\nYou have four Azure virtual machines that have the following configurations:\nVM1: Subnet1, Network card NIC1. NIC1 is associated with NSG2.\nVM2: Subnet1, Network card NIC2. NIC2 is associated with NSG3.\nVM3: Subnet3, Network card NIC3. NIC3 is associated with NSG3.\nVM4: Subnet2.\nYou have the following subnets:\nSubnet1 is associated with NSG1.\nSubnet2 is associated with NSG3.\nSubnet3 does not have an NSG associated.\nWhich virtual machine can be accessed over the internet on port 80?",
    options: [
      "VM1",
      "VM2",
      "VM3",
      "VM4"
    ],
    correct: [0],
    explanation: "On VM1, both NSGs assigned to Subnet1 (NSG1) and the NIC1 card (NSG2) allow traffic on port 80. On VM2, NSG1 allows traffic, but NSG3 blocks traffic for the network interface. On VM3 and VM4, NSG3 blocks traffic."
  },
  {
    id: 456,
    domain: 4,
    subdomain: "NSG",
    type: "single",
    source: "MS Practice Assessment",
    question: "Your company plans to migrate servers from on-premises to Azure. There will be dev, test, and production virtual machines on a single virtual network.\nYou need to restrict traffic between the dev, test, and production virtual machines to specific ports.\nWhat should you use?",
    options: [
      "a network security group (NSG)",
      "an Azure firewall",
      "an Azure load balancer",
      "an Azure virtual network"
    ],
    correct: [0],
    explanation: "You must configure network security group (NSG) rules to allow TCP or ICMP traffic for specific ports. Azure Firewall is a managed service that protects your Azure services across multiple virtual networks. Load balancers are used to distribute incoming traffic to available backend servers. Azure VPN is used to establish a connection between on-premises and Azure."
  },
  {
    id: 457,
    domain: 4,
    subdomain: "NSG",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a resource group named RG1.\nYou plan to create and configure a network security group (NSG) named NSG1 for the following types of traffic:\nRemote Desktop Management\nHTTP\nNSG1 will be used on the subnets of multiple virtual networks.\nWhich two cmdlets should you run? Each correct answer presents part of the solution.",
    options: [
      "Add-AzLoadBalancerFrontendIpConfig",
      "Add-AzNetworkInterfaceTapConfig",
      "New-AzNetworkSecurityGroup",
      "New-AzNetworkSecurityRuleConfig"
    ],
    correct: [2, 3],
    explanation: "New-AzNetworkSecurityRuleConfig allows you to create a rule and provide the type, protocol, direction, and port number. New-AzNetworkSecurityGroup creates a network security group (NSG). The -SecurityRules parameter specifies a list of network security rule objects to create in an NSG."
  },
  {
    id: 458,
    domain: 4,
    subdomain: "Load Balancer",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains an ASP.NET application. The application is hosted on four Azure virtual machines that run Windows Server.\nYou have a load balancer named LB1 that load balances requests to the virtual machines.\nYou need to ensure that site users connect to the same web server for all requests made to the application.\nWhich two actions should you perform? Each correct answer presents part of the solution.",
    options: [
      "Configure an inbound NAT rule.",
      "Set Session persistence to Client IP.",
      "Set Session persistence to None.",
      "Set Session persistence to Protocol."
    ],
    correct: [1, 3],
    explanation: "By setting Session persistence to Client IP and Protocol, you ensure that site users connect to the same web server for all requests made to the application. Setting Session persistence to None disables sticky sessions, and an inbound NAT rule is used to forward traffic from a load balancer frontend to a backend pool."
  },
  {
    id: 459,
    domain: 4,
    subdomain: "Azure DNS",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription.\nYou plan to implement four Azure virtual networks that will be peered. All virtual machines will use a DNS suffix of contoso.com.\nYou need to configure name resolution for the virtual networks to ensure that all the virtual machines can communicate by using their FQDNs. The solution must minimize administrative effort.\nWhat should you use?",
    options: [
      "a DNS server on an Azure virtual machine",
      "an Azure Private DNS zone",
      "an Azure public DNS zone",
      "Azure-provided name resolution"
    ],
    correct: [1],
    explanation: "Azure Private DNS allows for private name resolution between Azure virtual networks. Azure public DNS provides DNS for public access, such as name resolution for a publicly accessible website. Azure-provided name resolution does not support user-defined domain names and only supports a single virtual network. A DNS server on a virtual machine can also be used to achieve the goal but involves much more administrative effort to implement and maintain than using Azure Private DNS."
  },
  {
    id: 460,
    domain: 4,
    subdomain: "Azure DNS",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains an Azure DNS zone named contoso.com.\nYou add a new subdomain named test.contoso.com.\nYou plan to delegate test.contoso.com to a different DNS server.\nHow should you configure the domain delegation?",
    options: [
      "Add an A record for test.contoso.com.",
      "Add an NS record set named test to the contoso.com zone.",
      "Create the SOA record for test.contoso.com.",
      "Modify the A record for contoso.com."
    ],
    correct: [1],
    explanation: "You must create a DNS NS record set named test in the contoso.com zone. An NS record set must be created at the apex of the zone named contoso.com. You do not need to create the SOA record set in test.contoso.com. It is only created automatically in contoso.com. You do not need to create or modify the DNS A record."
  },
  {
    id: 461,
    domain: 4,
    subdomain: "VNet Peering",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains four virtual machines. Each virtual machine is connected to a subnet on a different virtual network.\nYou install the DNS Server role on a virtual machine named VM1.\nYou configure each virtual network to use the IP address of VM1 as the DNS server.\nYou need to ensure that all four virtual machines can resolve IP addresses by using VM1.\nWhat should you do?",
    options: [
      "Configure a DNS server on all four virtual machines.",
      "Configure network peering.",
      "Create and associate a route table to all four subnets.",
      "Create Site-to-Site (S2S) VPNs."
    ],
    correct: [1],
    explanation: "By default, Azure virtual machines can communicate only with other virtual machines that are connected to the same virtual network. If you want a virtual machine to communicate with other virtual machines that are connected to other virtual networks, you must configure network peering.\nA route table controls how network traffic is routed. But without network peering, network traffic is still limited to a single virtual network.\nConfiguring a Site-to-Site (S2S) VPN is incorrect because you are not connecting on-premises virtual machines to the cloud."
  },
  {
    id: 462,
    domain: 4,
    subdomain: "Azure DNS",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure virtual network named VNet1.\nYou create an Azure Private DNS zone named contoso.com.\nYou need to ensure that the virtual machines on VNet1 register in the contoso.com private DNS zone.\nWhat should you do?",
    options: [
      "Add a virtual network link to contoso.com.",
      "Add Azure DNS Private Resolver to VNet1.",
      "Configure each virtual machine to use a custom DNS server.",
      "Configure VNet1 to use a custom DNS server."
    ],
    correct: [0],
    explanation: "To associate a virtual network to a private DNS zone, you add the virtual network to the zone by creating a virtual network link. To enable autoregistration, you create the link with autoregistration enabled. Azure DNS Private Resolver is used to proxy DNS queries between on-premises environments and Azure DNS. A custom DNS server will work if you deploy a DNS server as a virtual machine or an appliance; however, this configuration does not work with a private DNS zone."
  },
  {
    id: 463,
    domain: 4,
    subdomain: "VNet Peering",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains two virtual networks named VNet1 and VNet2.\nYou need to ensure that the resources on both VNet1 and VNet2 can communicate seamlessly between both networks.\nWhat should you configure from the Azure portal?",
    options: [
      "peerings",
      "service endpoints",
      "private endpoints",
      "route tables"
    ],
    correct: [0],
    explanation: "You can connect virtual networks to each other with virtual network peering. Once the virtual networks are peered, the resources on both virtual networks can communicate with each other with the same latency and bandwidth as though the resources were on the same virtual network. Service endpoints and private endpoints secure access to Azure PaaS services, and route tables control traffic routing within a subnet — none of these connect two virtual networks together."
  },
  {
    id: 464,
    domain: 4,
    subdomain: "Network Routing",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains the following virtual networks:\nVNet1: Has an IP address space of 10.10.0.0/16 and contains a subnet named Subnet1 (10.10.1.0/24) that hosts a virtual machine named VM1 that runs Windows Server.\nVNet2: Has an IP address space of 10.20.0.0/16 and contains a subnet named Subnet2 (10.20.1.0/24) that hosts a virtual machine named VM2 that runs Windows Server.\nVNet1 and VNet2 are connected by using virtual network peering.\nUsers report that VM1 cannot connect to VM2.\nYou need to verify whether the traffic from VM1 to the 10.20.0.0/16 subnet uses virtual network peering as the next hop.\nWhat should you use?",
    options: [
      "the effective routes for the network interface of VM1",
      "Connection troubleshoot in Azure Network Watcher",
      "Azure Network Watcher next hop",
      "the Network Controller role in Windows Server"
    ],
    correct: [0],
    explanation: "Viewing the effective routes on the network interface of VM1 shows all the system, peering, and user-defined routes that Azure applies to outbound traffic, including the next hop type for the 10.20.0.0/16 prefix.\nConnection troubleshoot validates reachability but does not display routing decisions.\nAzure Network Watcher next hop is a diagnostic tool that identifies the next routing hop (type, IP address, and route table ID) for traffic leaving a virtual machine, but it does not display the full set of routing decisions for the prefix.\nThe Network Controller role in Windows Server is a centralized, programmable management point for Software Defined Networking (SDN)."
  },
  {
    id: 465,
    domain: 4,
    subdomain: "NSG",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains network security groups (NSGs).\nWhich two resources can be associated with an NSG? Each correct answer presents a complete solution.",
    options: [
      "network interfaces",
      "subnets",
      "virtual networks",
      "resource groups"
    ],
    correct: [0, 1],
    explanation: "You can associate a network security group (NSG) with a network interface or with a subnet. When an NSG is associated with a subnet, the access control list (ACL) rules apply to all virtual machine instances in that subnet. You cannot associate an NSG directly with a virtual network or with a resource group."
  },
  {
    id: 466,
    domain: 4,
    subdomain: "NSG",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have a virtual machine named VM1 that is assigned to a network security group (NSG) named NSG1.\nNSG1 has the following outbound security rules:\nRule1: Priority 900, Name BlockInternet, Port 80, Protocol TCP, Source Any, Destination Any, Action Block.\nRule2: Priority 1000, Name AllowInternet, Port 80, Protocol TCP, Source Any, Destination Any, Action Allow.\nYou need to ensure that internet access to VM1 on port 80 is allowed.\nWhat should you do?",
    options: [
      "Change the priority of Rule2.",
      "Add a new deny rule with priority 4096.",
      "Associate NSG1 with the subnet instead of the network interface.",
      "Add a service tag to Rule2."
    ],
    correct: [0],
    explanation: "NSG rules are processed in priority order, with lower numbers processed first. Rule1 (priority 900) has a higher priority than Rule2 (priority 1000), so traffic on port 80 is blocked. To allow the traffic, you can increase the priority of Rule2 (give it a lower number than Rule1), decrease the priority of Rule1, or change the action of Rule1. Changing the priority of Rule2 so it is processed before Rule1 achieves the goal."
  },
  {
    id: 467,
    domain: 4,
    subdomain: "Load Balancer",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have a web app that is running in four Windows Server Azure virtual machines behind a load balancer.\nUsers experience issues when accessing the web app. You suspect an issue with the web server and must check whether the server is listening on port 80.\nWhich command should you run?",
    options: [
      "netstat -an",
      "Test-NetConnection",
      "Nbtstat -c",
      "Get-AzVirtualNetwork"
    ],
    correct: [0],
    explanation: "Using netstat -an will list the ports that the server is listening on. Test-NetConnection will perform a ping/ICMP test. Nbtstat -c checks the NBT cache. Get-AzVirtualNetwork gets the virtual networks in a resource group."
  },
  {
    id: 468,
    domain: 4,
    subdomain: "Load Balancer",
    type: "single",
    source: "MS Practice Assessment",
    question: "Your organization uses an Azure Load Balancer to manage traffic for VMs hosting a web application. Users experience uneven traffic distribution, with some VMs receiving more traffic than others.\nYou need to configure the load balancer to ensure even traffic distribution across all VMs in the backend pool.\nWhat should you do?",
    options: [
      "Disable session persistence.",
      "Enable source IP affinity.",
      "Add more VMs to the backend pool.",
      "Adjust the load balancing rule settings."
    ],
    correct: [0],
    explanation: "Disabling session persistence ensures even traffic distribution by removing any affinity that directs traffic to the same VM. Adjusting the load balancing rule settings might seem like a solution but does not address the root cause of uneven distribution. Enabling source IP affinity maintains session persistence, potentially exacerbating the uneven distribution of traffic. Adding more VMs does not solve the distribution issue caused by session persistence settings."
  },
  {
    id: 469,
    domain: 4,
    subdomain: "Network Monitoring",
    type: "single",
    source: "MS Practice Assessment",
    question: "You plan to provision an Azure subscription that will contain the following virtual networks:\nVNet1 in the East US Azure region with two subnets\nVNet2 in the East US region with four subnets\nVNet3 in the West Europe Azure region with four subnets\nVNet4 in the West Europe region with two subnets\nHow many Azure Network Watcher instances will be provisioned as part of the deployment?",
    options: [
      "2",
      "4",
      "12",
      "1"
    ],
    correct: [0],
    explanation: "Azure Network Watcher is a regional service that allows you to monitor and diagnose conditions at a network scenario level in, to, and from Azure. When you create or update a virtual network in a subscription, Network Watcher is enabled automatically in the virtual network's region. Because the virtual networks span two regions (East US and West Europe), two Network Watcher instances are provisioned. There is no impact on resources or associated charges for automatically enabling Network Watcher."
  },
  {
    id: 470,
    domain: 4,
    subdomain: "Network Monitoring",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains 20 virtual networks and 500 virtual machines.\nYou deploy a new virtual machine named VM501.\nYou discover that VM501 is unable to communicate with a virtual machine named VM20 in the subscription. You suspect that a network security group (NSG) is the cause of the issue.\nYou need to identify whether an NSG is blocking communications. The solution must minimize administrative effort.\nWhat should you use?",
    options: [
      "IP flow verify",
      "NSG flow logs",
      "Packet capture",
      "Connection monitor"
    ],
    correct: [0],
    explanation: "IP flow verify lets you specify a source and destination IPv4 address, port, protocol (TCP or UDP), and traffic direction (inbound or outbound). IP flow verify can identify the specific network security group (NSG) that prevents communication. NSG flow logs is a feature of Azure Network Watcher that allows you to log information about IP traffic flowing through an NSG. Although the logs may help you identify the source of the issue, it requires much more configuration and manual evaluation. Packet capture allows you to create packet capture sessions to track traffic to and from a virtual machine. Packet capture may help narrow down the scope of the issue, but it will not identify the specific NSG that prevents communication."
  },
  {
    id: 471,
    domain: 4,
    subdomain: "Network Routing",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a virtual network named VNet1.\nYou plan to deploy a virtual machine named VM1 to be used as a network inspection appliance.\nYou need to ensure that all network traffic passes through VM1.\nWhat should you do?",
    options: [
      "Configure a user-defined route.",
      "Configure a network security group.",
      "Configure a service endpoint.",
      "Configure virtual network peering."
    ],
    correct: [0],
    explanation: "Azure automatically creates a route table for each subnet on an Azure virtual network and adds system default routes to the table. You can override some of the Azure system routes with custom user-defined routes and add more custom routes to route tables. Azure routes outbound traffic from a subnet based on the routes on a subnet's route table. By creating a user-defined route that sets the next hop to a virtual appliance (VM1), you can force traffic through VM1."
  },
  {
    id: 472,
    domain: 4,
    subdomain: "VPN Gateway",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have two Azure subscriptions named Sub1 and Sub2.\nSub1 contains a virtual network named VNet1 and a VPN gateway. Sub2 contains a virtual network named VNet2.\nYou have an on-premises device named Device1 that runs Windows and has a Point-to-Site (P2S) VPN client installed.\nYou configure network peering between VNet1 and VNet2.\nYou need to ensure that Device1 can access VNet2 when a VPN connection is established.\nWhat should you do?",
    options: [
      "Download and reinstall the P2S VPN client on Device1.",
      "Create a private endpoint in VNet2.",
      "Deploy Azure Front Door.",
      "Create a new client certificate on Device1."
    ],
    correct: [0],
    explanation: "Point-to-Site (P2S) VPN clients must be downloaded and reinstalled again after virtual network peering is successfully configured to ensure that the new routes are downloaded to the client.\nA private endpoint and Azure Front Door are not required nor used to be able to access VNet2 from VNet1.\nDevice1 already has a digital certificate when you install the P2S VPN client, so you do not need to create a new certificate manually."
  },
  {
    id: 473,
    domain: 4,
    subdomain: "NSG",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains two resource groups named RG1 and RG2.\nRG1 contains the following resources:\nA virtual network named VNet1 located in the East US Azure region\nA network security group (NSG) named NSG1 located in the West US Azure region\nRG2 contains the following resources:\nA virtual network named VNet2 located in the East US Azure region\nA virtual network named VNet3 located in the West US Azure region\nYou need to associate NSG1.\nTo which subnets can you associate NSG1?",
    options: [
      "the subnets of VNet3 only",
      "the subnets of VNet1 only",
      "the subnets of VNet1 and VNet2 only",
      "the subnets of VNet1, VNet2, and VNet3"
    ],
    correct: [0],
    explanation: "You can assign an NSG only to a subnet of a virtual network that is in the same region as the NSG. NSG1 is in the West US region, and VNet3 is the only virtual network located in the West US region. Therefore, NSG1 can be associated only with the subnets of VNet3. VNet1 and VNet2 are both in East US and cannot use NSG1."
  },
  {
    id: 474,
    domain: 4,
    subdomain: "NSG",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a network security group (NSG) named NSG1.\nYou plan to configure NSG1 to allow the following types of traffic:\nRemote Desktop Management\nSecured HTTPS\nWhich two ports should you allow in NSG1? Each correct answer presents part of the solution.",
    options: [
      "443",
      "3389",
      "80",
      "25"
    ],
    correct: [0, 1],
    explanation: "You must open port 443 for secured HTTPS traffic and port 3389 for Remote Desktop. Port 80 is used for unsecured HTTP traffic. Port 25 is used by mail (SMTP) traffic."
  },
  {
    id: 475,
    domain: 4,
    subdomain: "Load Balancer",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have deployed a web application in Microsoft Azure using a public Microsoft Load Balancer to distribute traffic across virtual machines. Users report intermittent connectivity issues.\nYou need to troubleshoot the connectivity issues for consistent application access.\nEach correct answer presents part of the solution. Which two actions should you take?",
    options: [
      "Check the health probe configuration.",
      "Verify matching SKUs for the load balancer and public IP.",
      "Check the network security group rules.",
      "Change the load balancer's distribution mode."
    ],
    correct: [0, 1],
    explanation: "Checking the health probe configuration is crucial because an inactive or incorrectly configured probe can lead to traffic being routed to unhealthy instances, causing connectivity issues. Verifying matching SKUs for the load balancer and public IP is also essential, as mismatched SKUs can disrupt proper operation and lead to connectivity problems. Checking the network security group rules might seem relevant but does not address the root cause of the connectivity issues. Changing the load balancer's distribution mode might seem like it could improve session persistence but does not resolve the underlying configuration problems causing the connectivity issues."
  }
]);


// ─── Original Practice Questions — Domain 4 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 476,
    domain: 4,
    subdomain: "NAT Gateway",
    type: "single",
    source: "Original Practice",
    question: "You have a subnet named Subnet1 that contains 40 VMs with no public IP addresses. The VMs make frequent outbound connections to a third-party API over the internet, and you are experiencing SNAT port exhaustion. You need a scalable, managed way to provide outbound internet connectivity with a large pool of SNAT ports. What should you deploy and associate with Subnet1?",
    options: [
      "An Azure NAT Gateway with one or more Standard SKU public IP addresses",
      "A Basic public Load Balancer with outbound load balancing rules",
      "A user-defined route sending 0.0.0.0/0 to the Internet next hop",
      "An Azure Application Gateway with outbound rules enabled"
    ],
    correct: [0],
    explanation: "Azure NAT Gateway is a fully managed, highly scalable outbound-only SNAT service. It is the recommended solution for outbound internet connectivity and for avoiding SNAT port exhaustion.\n\nWhy NAT Gateway:\n• Provides 64,512 SNAT ports per attached public IP address (you can attach up to 16 IPs or use a public IP prefix)\n• Ports are allocated on demand across the whole subnet — no fixed per-VM allocation\n• Takes precedence over load balancer outbound rules and instance-level public IPs for outbound traffic\n• Zonal, no maintenance, scales automatically\n\nHow to deploy:\n1. Create a NAT gateway resource\n2. Attach one or more Standard SKU public IPs (or a public IP prefix)\n3. Associate it with Subnet1\n\nWhy the others are wrong:\n• Basic Load Balancer outbound rules: Basic SKU is being retired and gives limited, manually-allocated SNAT ports — prone to the same exhaustion\n• UDR to Internet: Just routing; it does not change SNAT behavior or add ports\n• Application Gateway: An inbound L7 service — it does not provide subnet outbound SNAT",
    reference: "https://learn.microsoft.com/azure/nat-gateway/nat-overview"
  },
  {
    id: 477,
    domain: 4,
    subdomain: "Azure Firewall",
    type: "single",
    source: "Original Practice",
    question: "You publish an internal web server (private IP 10.0.2.10, port 80) to the internet through Azure Firewall. External users must reach it using the firewall's public IP on port 8080. Which type of Azure Firewall rule should you create, and how should it be configured?",
    options: [
      "An application rule with target FQDN of the web server and protocol HTTP:80",
      "A DNAT rule translating the firewall public IP:8080 to 10.0.2.10:80",
      "A network rule allowing TCP 8080 from the Internet to 10.0.2.10",
      "An SNAT rule translating outbound traffic from 10.0.2.10 to the firewall public IP"
    ],
    correct: [1],
    explanation: "DNAT (Destination Network Address Translation) rules in Azure Firewall translate and filter inbound internet traffic to a private IP address. This is how you publish an internal service through the firewall.\n\nDNAT rule configuration:\n• Source: Internet (or specific source IPs)\n• Destination: Firewall public IP address\n• Destination port: 8080 (the port users connect to)\n• Translated address: 10.0.2.10 (the internal server's private IP)\n• Translated port: 80 (the port the server listens on)\n\nWhen a DNAT rule is created, Azure Firewall automatically adds a matching network rule to allow the translated traffic. You must also ensure the route from the server's subnet back to the firewall exists (typically a UDR) so return traffic is symmetric.\n\nWhy the others are wrong:\n• Application rules filter OUTBOUND HTTP/S by FQDN — they do not publish inbound services\n• A plain network rule allowing 8080 to a private IP does not perform the address/port translation from the public IP\n• SNAT handles outbound source translation, not inbound publishing",
    reference: "https://learn.microsoft.com/azure/firewall/tutorial-firewall-dnat"
  },
  {
    id: 478,
    domain: 4,
    subdomain: "Azure Load Balancer",
    type: "single",
    source: "Original Practice",
    question: "You have a Standard public Load Balancer fronting a backend pool of VMs that have no public IP addresses. The VMs need to initiate outbound connections to the internet. After deployment, the VMs cannot reach the internet at all. Which configuration provides explicit, predictable outbound connectivity for the backend VMs?",
    options: [
      "Enable session persistence set to Client IP on the load balancing rule",
      "Configure an outbound rule on the Load Balancer that maps the backend pool to the frontend public IP",
      "Add an inbound NAT rule for each VM in the backend pool",
      "Change the health probe from TCP to HTTP"
    ],
    correct: [1],
    explanation: "With Standard Load Balancer, outbound connectivity is 'secure by default' — it is NOT implicit. VMs with no public IP behind a Standard LB cannot reach the internet unless you explicitly define outbound connectivity.\n\nThe recommended explicit method is an outbound rule:\n• Frontend IP: the LB's public IP (or a dedicated outbound public IP)\n• Backend pool: the pool of VMs\n• Protocol/ports: define SNAT port allocation per instance\n• This gives predictable, configurable SNAT for outbound flows\n\n(Note: a NAT Gateway on the subnet is actually the preferred modern approach and takes precedence, but among the listed options the outbound rule is the LB-native way to grant outbound access.)\n\nWhy the others are wrong:\n• Session persistence affects how INBOUND flows map to backends — nothing to do with outbound\n• Inbound NAT rules forward specific inbound ports to specific VMs (e.g., RDP) — they do not enable general outbound internet access\n• Changing the health probe affects backend health detection, not outbound connectivity\n\nKey difference from Basic LB: Basic Load Balancer granted implicit outbound SNAT automatically; Standard requires it to be explicitly defined.",
    reference: "https://learn.microsoft.com/azure/load-balancer/load-balancer-outbound-connections"
  },
  {
    id: 479,
    domain: 4,
    subdomain: "User Defined Routes",
    type: "single",
    source: "Original Practice",
    question: "A subnet's route table contains, for the same destination prefix 10.0.0.0/8, all of the following: a system route, a route learned over BGP from a VPN/ExpressRoute gateway, and a user-defined route (UDR). Which route does Azure use to forward traffic to 10.0.0.0/8?",
    options: [
      "The system route, because Azure always trusts platform routes first",
      "The BGP-learned route, because dynamic routes are always preferred",
      "The user-defined route, because UDRs have the highest priority among routes with equal address prefixes",
      "Azure load-balances traffic across all three routes equally"
    ],
    correct: [2],
    explanation: "When multiple routes have the SAME address prefix, Azure selects the route based on route type priority (not longest-prefix, since the prefixes are identical here):\n\nRoute selection priority (highest to lowest):\n1. User-defined route (UDR)\n2. BGP route (learned from VPN Gateway / ExpressRoute / Route Server)\n3. System route\n\nSo for identical prefixes, a UDR beats a BGP route, which beats a system route.\n\nImportant nuance — longest prefix match comes FIRST:\n• Azure first chooses the route with the most specific (longest) matching prefix\n• Only when prefixes are EQUAL does the route-type priority above break the tie\n• Example: a UDR for 10.0.1.0/24 would beat a BGP route for 10.0.0.0/8 because /24 is more specific — regardless of type\n\nIn this question all three routes share the identical 10.0.0.0/8 prefix, so the UDR wins by type priority.\n\nWhy the others are wrong:\n• System routes are the LOWEST priority, not the highest\n• BGP routes are preferred over system routes but lose to UDRs\n• Azure does not ECMP-balance across different route types for the same prefix here",
    reference: "https://learn.microsoft.com/azure/virtual-network/virtual-networks-udr-overview#how-azure-selects-a-route"
  },
  {
    id: 480,
    domain: 4,
    subdomain: "Azure Firewall",
    type: "single",
    source: "Original Practice",
    question: "Your security team requires that all internet-bound traffic from Azure VNets be inspected by an on-premises security stack rather than egressing directly from Azure. You have Azure Firewall deployed in a hub VNet connected to on-premises via ExpressRoute. What Azure Firewall feature should you enable to force all internet traffic back to on-premises?",
    options: [
      "Threat intelligence-based filtering in Alert and Deny mode",
      "Forced tunneling, which routes the firewall's internet traffic to an on-premises next hop",
      "DNS proxy with custom DNS servers",
      "SNAT with a public IP prefix"
    ],
    correct: [1],
    explanation: "Forced tunneling configures Azure Firewall to route all (or selected) internet-bound traffic to a designated next hop (such as an on-premises device reachable over ExpressRoute or VPN) instead of egressing directly to the internet from Azure.\n\nHow forced tunneling works with Azure Firewall:\n• Requires a dedicated subnet named 'AzureFirewallManagementSubnet' (in addition to AzureFirewallSubnet)\n• The management subnet handles the firewall's own management/health traffic so the service stays operational\n• You apply a UDR (0.0.0.0/0) on the AzureFirewallSubnet with the next hop pointing to your on-premises edge (e.g., the gateway / NVA)\n• Customer internet traffic is then sent on-premises for inspection\n\nWhy the others are wrong:\n• Threat intelligence filtering alerts/blocks known malicious IPs/domains — it does not redirect egress to on-premises\n• DNS proxy makes the firewall a DNS forwarder — unrelated to egress routing\n• SNAT with a public IP prefix changes outbound source IPs but still egresses directly from Azure",
    reference: "https://learn.microsoft.com/azure/firewall/forced-tunneling"
  },
  {
    id: 481,
    domain: 4,
    subdomain: "Network Security Groups",
    type: "multi",
    source: "Original Practice",
    question: "You need to create a single NSG inbound rule that allows HTTPS (443) from your two office locations (203.0.113.0/24 and 198.51.100.10) to two destination subnets (10.0.1.0/24 and 10.0.2.0/24). You want to avoid creating four separate rules. Which TWO statements about augmented security rules are correct? Each correct answer presents part of the solution.",
    options: [
      "You can specify multiple source IP ranges in a single rule using a comma-separated list or multiple CIDR entries",
      "You can specify multiple destination address prefixes and multiple port ranges in the same rule",
      "Augmented rules require the Basic SKU NSG and are not available on Standard",
      "Each augmented rule can reference at most one IP address and one port",
      "Augmented rules are only supported for outbound traffic"
    ],
    correct: [0, 1],
    explanation: "Augmented security rules let you consolidate what would otherwise be many discrete NSG rules into a single rule by allowing multiple values in the source, destination, and port fields.\n\nWith augmented rules you can specify:\n• Multiple source IP addresses / CIDR ranges (e.g., 203.0.113.0/24 and 198.51.100.10)\n• Multiple destination IP addresses / CIDR ranges (e.g., 10.0.1.0/24 and 10.0.2.0/24)\n• Multiple ports / port ranges (e.g., 443, 8443)\n• Service tags and Application Security Groups in the source/destination\n\nSo one rule can express 'Allow 443 from {office1, office2} to {subnet1, subnet2}', replacing four rules.\n\nWhy the others are wrong:\n• There is no separate 'Basic' vs 'Standard' SKU for NSGs — augmented rules are a standard capability\n• A rule referencing only one IP and one port is the opposite of augmented rules\n• Augmented rules work for BOTH inbound and outbound directions",
    reference: "https://learn.microsoft.com/azure/virtual-network/network-security-groups-overview#augmented-security-rules"
  },
  {
    id: 482,
    domain: 4,
    subdomain: "Private Endpoints",
    type: "yesno",
    source: "Original Practice",
    scenario: "You create a private endpoint for an Azure Storage account in Subnet1 of VNet1. By default, network policies (NSG and UDR enforcement) on private endpoints are disabled at the subnet level. Your security team requires that an NSG associated with Subnet1 also filter traffic destined to the private endpoint.",
    question: "You must enable the 'PrivateEndpointNetworkPolicies' setting on Subnet1 so that NSG rules are applied to traffic going to the private endpoint.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes. Historically, NSGs and UDRs did NOT apply to traffic destined for a private endpoint because network policies for private endpoints were disabled on the subnet by default.\n\nTo make NSGs (and/or route tables) take effect for private endpoint traffic, you enable network policies on the subnet:\n• Setting: privateEndpointNetworkPolicies\n• Values: 'Enabled' (apply NSGs and route tables), 'NetworkSecurityGroupEnabled', 'RouteTableEnabled', or 'Disabled'\n• When enabled, the NSG rules on Subnet1 are evaluated against traffic flowing to the private endpoint\n\nWhy this matters:\n• Without it, an NSG on the subnet would silently NOT filter private endpoint traffic\n• Enabling network policies gives you granular control (e.g., only allow specific subnets to reach the private endpoint)\n\nThis is the correct action to meet the security team's requirement, so the answer is Yes.",
    reference: "https://learn.microsoft.com/azure/private-link/disable-private-endpoint-network-policy"
  },
  {
    id: 483,
    domain: 4,
    subdomain: "Application Gateway",
    type: "single",
    source: "Original Practice",
    question: "You deploy an Azure Application Gateway v2 in front of a backend pool of VMs. The application gateway reports the backend pool as Unhealthy, and clients receive HTTP 502 errors, even though the web servers are running and serving pages locally. Which configuration is the MOST likely cause of the unhealthy backend?",
    options: [
      "The backend health probe expects an HTTP 200 response, but the backend default page returns a redirect or a non-matching status/host",
      "The Application Gateway is using a Standard_v2 SKU instead of Standard_v1",
      "Cookie-based session affinity is disabled on the HTTP settings",
      "The frontend listener is configured for HTTPS instead of HTTP"
    ],
    correct: [0],
    explanation: "HTTP 502 (Bad Gateway) from Application Gateway almost always means the backend is being marked unhealthy by the health probe, so the gateway has no healthy server to forward to.\n\nCommon health probe causes of an unhealthy backend:\n• The probe path returns a status code outside the expected match range (default expects 200-399; custom probes can specify a match)\n• Host header mismatch: the probe sends a host the backend does not recognize, returning an error or redirect (302)\n• The backend NSG blocks the Application Gateway subnet from reaching the probe port\n• Backend server is listening on a different port than the HTTP settings specify\n• TLS/certificate issues when the backend is HTTPS and the probe cannot validate the cert\n\nTo diagnose: use the Application Gateway 'Backend health' view, which shows each backend server's status and the probe failure reason.\n\nWhy the others are wrong:\n• Standard_v2 is a fully supported (recommended) SKU — it is not a cause of 502s\n• Session affinity being disabled does not cause backends to be unhealthy\n• An HTTPS frontend listener is a normal configuration and does not by itself cause backend 502s",
    reference: "https://learn.microsoft.com/azure/application-gateway/application-gateway-troubleshooting-502"
  },
  {
    id: 484,
    domain: 4,
    subdomain: "Azure DNS",
    type: "single",
    source: "Original Practice",
    question: "You host the public DNS zone contoso.com in Azure DNS. You need the apex (root) record contoso.com to point to a public-facing Azure resource (an Azure Traffic Manager profile) and to automatically update if the resource's IP changes. A standard CNAME cannot be used at the zone apex. What should you create?",
    options: [
      "A CNAME record at the apex pointing to the Traffic Manager FQDN",
      "An alias record set (A/AAAA) at the apex referencing the Traffic Manager profile",
      "An MX record pointing to the Traffic Manager profile",
      "A delegation (NS) record for the apex"
    ],
    correct: [1],
    explanation: "Azure DNS alias record sets let you point a record (including at the zone apex) directly to an Azure resource such as a Traffic Manager profile, an Azure public IP, or a Front Door endpoint.\n\nWhy alias records solve this:\n• DNS standards forbid a CNAME at the zone apex (the apex must hold SOA/NS records, which conflict with CNAME)\n• Alias records are of type A/AAAA but reference the Azure resource dynamically\n• If the underlying resource's IP changes, the alias record automatically reflects it — no manual updates\n• Supported targets: Public IP address, Traffic Manager profile, Azure Front Door, or another record set in the same zone\n• Lifecycle protection: if the target resource is deleted, the alias prevents dangling DNS pointers\n\nWhy the others are wrong:\n• A CNAME at the apex is not allowed by DNS standards — this is exactly the problem alias records fix\n• MX records are for mail routing, not for pointing the apex to a web endpoint\n• An NS delegation record hands the subdomain to other name servers — it does not resolve the apex to the resource",
    reference: "https://learn.microsoft.com/azure/dns/dns-alias"
  },
  {
    id: 485,
    domain: 4,
    subdomain: "VPN Gateway",
    type: "single",
    source: "Original Practice",
    question: "You have a Site-to-Site VPN connecting on-premises to Azure VNet1 using a single VPN gateway instance. The business requires higher resiliency so that a planned maintenance event or instance failure on the Azure side does not drop the tunnel. Which VPN Gateway configuration provides built-in redundancy on the Azure side with two gateway instances?",
    options: [
      "Configure the gateway in active-active mode so it uses two gateway instances, each with its own public IP",
      "Deploy a second VPN gateway in a peered VNet and rely on VNet peering for failover",
      "Increase the gateway SKU to a higher throughput tier such as VpnGw3",
      "Enable point-to-site configuration alongside the site-to-site connection"
    ],
    correct: [0],
    explanation: "Active-active mode is the Azure-side redundancy design for VPN Gateway. In active-active mode the gateway runs TWO instances, each with its own public IP and its own IPsec tunnel to the on-premises device.\n\nActive-active benefits:\n• Both tunnels are up simultaneously; if one instance fails (or during maintenance), traffic continues on the other with minimal disruption\n• Best resiliency requires the on-premises device to also support two tunnels (and BGP is recommended for automatic convergence)\n• Distinct from active-standby (the default), where only one instance is active and failover causes a brief tunnel re-establishment\n\nWhy the others are wrong:\n• A second gateway in a peered VNet does not provide failover for VNet1's own S2S tunnel — a VNet can have only one VPN gateway, and peering does not make another VNet's gateway redundant for this connection\n• A higher SKU (VpnGw3) increases throughput and tunnel counts but a single active-standby instance still re-establishes on failure — throughput is not the same as instance redundancy\n• Point-to-site is for individual client VPN access, not for S2S tunnel resiliency",
    reference: "https://learn.microsoft.com/azure/vpn-gateway/vpn-gateway-highlyavailable"
  },
  {
    id: 486,
    domain: 4,
    subdomain: "Service Endpoints",
    type: "yesno",
    source: "Original Practice",
    scenario: "You enable a service endpoint for Microsoft.Storage on Subnet1 in VNet1 (East US). You then set the storage account firewall to 'Selected networks' and add Subnet1. A developer claims that on-premises servers connected via ExpressRoute will now also be able to reach the storage account through this service endpoint.",
    question: "Service endpoints extend to on-premises networks, so the on-premises servers can use the Subnet1 service endpoint to access the storage account.",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "No. Service endpoints apply only to traffic originating from the configured VNet/subnet inside Azure. They do NOT extend to on-premises networks.\n\nKey facts:\n• A service endpoint changes the route and source identity for traffic from VMs IN the subnet — it presents the VM's private IP and routes over the Azure backbone\n• On-premises machines are not in the Azure VNet, so they cannot benefit from the Subnet1 service endpoint\n• If the storage firewall is set to 'Selected networks' allowing only Subnet1, on-premises traffic (arriving with its public/NAT IP) will be blocked unless you also add an IP rule or use a private endpoint\n\nTo reach storage privately from on-premises:\n• Use a PRIVATE ENDPOINT for the storage account (creates a private IP in the VNet reachable over ExpressRoute/VPN), combined with appropriate DNS forwarding\n• Private endpoints, unlike service endpoints, DO extend access to on-premises networks\n\nBecause the developer's claim is false, the answer is No.",
    reference: "https://learn.microsoft.com/azure/virtual-network/virtual-network-service-endpoints-overview#limitations"
  },
  {
    id: 487,
    domain: 4,
    subdomain: "Network Watcher",
    type: "single",
    source: "Original Practice",
    question: "After deploying a UDR that should force traffic from Subnet1 through an NVA, you want to confirm that packets leaving a VM in Subnet1 destined for 10.0.2.4 are actually being routed to the NVA's IP rather than directly within the VNet. Which Network Watcher tool gives you the next hop type and IP for that specific destination?",
    options: [
      "IP Flow Verify",
      "Next Hop",
      "Connection Troubleshoot",
      "NSG Diagnostics"
    ],
    correct: [1],
    explanation: "Network Watcher Next Hop tells you exactly where traffic from a specific VM to a specific destination IP will be routed.\n\nNext Hop:\n• Inputs: source VM (and its NIC/IP) and a destination IP address\n• Output: the next hop TYPE (e.g., VirtualAppliance, VirtualNetwork, VnetLocal, Internet, VirtualNetworkGateway, None) and the next hop IP address, plus the route table ID responsible\n• Perfect for validating that a UDR is steering traffic to the NVA — you would expect next hop type 'VirtualAppliance' and the NVA's IP\n\nWhy the others are wrong:\n• IP Flow Verify checks whether NSG rules ALLOW or DENY a flow and names the matching rule — it is about security filtering, not routing/next hop\n• Connection Troubleshoot tests end-to-end reachability (latency, hops, whether a connection succeeds) but does not isolate the next hop for a destination prefix as its primary output\n• NSG Diagnostics evaluates NSG rule outcomes for a flow — again filtering, not routing\n\nFor routing validation specifically, Next Hop is the right tool.",
    reference: "https://learn.microsoft.com/azure/network-watcher/network-watcher-next-hop-overview"
  },
  {
    id: 488,
    domain: 4,
    subdomain: "Azure Virtual Network Manager",
    type: "single",
    source: "Original Practice",
    question: "Your organization has more than 50 virtual networks and you need to manage their connectivity (such as a mesh or hub-and-spoke topology) and apply baseline security rules consistently at scale, with new VNets automatically joining the right configuration based on conditions. Which Azure service is designed for this centralized, scalable network management?",
    options: [
      "Azure Virtual Network Manager (AVNM) with network groups and connectivity/security admin configurations",
      "Manually creating VNet peerings between every pair of virtual networks",
      "Azure Policy with a deny effect on VNet creation",
      "Azure Firewall Manager policies applied per VNet"
    ],
    correct: [0],
    explanation: "Azure Virtual Network Manager (AVNM) is the service built to centrally manage connectivity and security across many VNets at scale.\n\nAVNM core concepts:\n• Network groups: logical groupings of VNets; membership can be STATIC (manually added) or DYNAMIC (defined by Azure Policy conditions, so new VNets matching the criteria are auto-included)\n• Connectivity configurations: create mesh or hub-and-spoke topologies automatically across the group (including 'connected group' for direct connectivity without per-pair peerings)\n• Security admin configurations: enforce baseline NSG-like rules that take precedence over and cannot be overridden by individual NSG rules\n• Deployments: changes are committed to specific regions in a controlled rollout\n\nWhy the others are wrong:\n• Manual pairwise peering does not scale to 50+ VNets and has no centralized governance or auto-onboarding\n• Azure Policy can govern resource configuration/compliance but does not build topologies or push baseline traffic rules the way AVNM does (though AVNM uses Policy for dynamic membership)\n• Azure Firewall Manager centrally manages firewall policies, not VNet topology/connectivity",
    reference: "https://learn.microsoft.com/azure/virtual-network-manager/overview"
  },
  {
    id: 489,
    domain: 4,
    subdomain: "Azure Firewall",
    type: "multi",
    source: "Original Practice",
    question: "You are reviewing the rule processing logic of Azure Firewall (with classic rule collections). For a packet that could match different rule types, which TWO statements correctly describe how Azure Firewall processes its rules? Each correct answer presents part of the solution.",
    options: [
      "DNAT rules are processed first, then network rules, and application rules are processed last",
      "Network rules and application rules are processed strictly in random order",
      "If a network rule matches and allows the traffic, application rules are not evaluated for that packet",
      "Application rules are always evaluated before network rules regardless of protocol",
      "Threat intelligence filtering, when set to Deny, is applied before any rule collections"
    ],
    correct: [0, 4],
    explanation: "Azure Firewall processes rules in a defined order, and understanding it is key to predicting whether traffic is allowed.\n\nCorrect statements:\n• DNAT rules first, then network rules, then application rules. Inbound DNAT is evaluated first; the resulting translated traffic is then matched against network rules. Network rule collections are evaluated before application rule collections.\n• Threat intelligence-based filtering, when configured in 'Alert and deny' mode, is applied BEFORE the rule collections. If a packet matches a known-malicious IP/FQDN, it is denied regardless of any allow rule.\n\nWhy the others are wrong:\n• Rules are NOT processed in random order — the order is deterministic (DNAT, then network, then application). With Firewall Policy, rule collection GROUPS are ordered by priority, then collections within them, but the type hierarchy still applies.\n• It is NOT true that a matched network rule causes application rules to be skipped in a way that allows otherwise; rather, because network rules are evaluated before application rules, if a network rule ALLOWS the traffic, application rules are not also required. But the phrasing implies network-rule allow short-circuits application filtering universally, which oversimplifies — the precise, always-true ordering facts are the DNAT/network/application sequence and TI precedence.\n• Application rules are NOT evaluated before network rules.",
    reference: "https://learn.microsoft.com/azure/firewall/rule-processing"
  },
  {
    id: 490,
    domain: 4,
    subdomain: "Name Resolution",
    type: "dragdrop",
    source: "Original Practice",
    question: "Match each Azure private DNS zone name to the Azure PaaS service whose private endpoint uses it.",
    dragItems: [
      "privatelink.blob.core.windows.net",
      "privatelink.database.windows.net",
      "privatelink.vaultcore.azure.net",
      "privatelink.azurewebsites.net"
    ],
    dropZones: [
      "Azure Storage (Blob)",
      "Azure SQL Database",
      "Azure Key Vault",
      "Azure App Service / Web App"
    ],
    correct: [[0,0],[1,1],[2,2],[3,3]],
    explanation: "When you create a private endpoint for an Azure PaaS service, you pair it with a service-specific private DNS zone so that the public FQDN resolves to the private endpoint IP.\n\nCorrect mappings:\n• Azure Storage (Blob): privatelink.blob.core.windows.net (other storage services have their own: file → privatelink.file.core.windows.net, queue → privatelink.queue.core.windows.net, etc.)\n• Azure SQL Database: privatelink.database.windows.net\n• Azure Key Vault: privatelink.vaultcore.azure.net (note: the public FQDN is *.vault.azure.net, but the private link zone is vaultcore)\n• Azure App Service / Web App: privatelink.azurewebsites.net\n\nHow resolution works:\n1. Client queries the service's public FQDN (e.g., myacct.blob.core.windows.net)\n2. Azure returns a CNAME to the privatelink subdomain (myacct.privatelink.blob.core.windows.net)\n3. The linked private DNS zone resolves that name to the private endpoint's private IP\n4. Traffic stays within the VNet / over private connectivity\n\nUsing the correct zone name is essential — a mismatched zone means the FQDN will not resolve to the private IP and traffic falls back to the public endpoint.",
    reference: "https://learn.microsoft.com/azure/private-link/private-endpoint-dns#azure-services-dns-zone-configuration"
  }
]);


// ─── Microsoft Practice Assessment (Attempt 2 additions) — Domain 4 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 491,
    domain: 4,
    subdomain: "Public IP / VM Connectivity",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a virtual network named VNet1 and a virtual machine named VM1.\nVM1 can only be accessed from the internal network.\nAn external contractor needs access to VM1. The solution must minimize administrative effort.\nWhat should you configure?",
    options: [
      "Add a public IP address to VM1.",
      "Add an additional private IP address to VM1.",
      "Configure a Site-to-Site (S2S) VPN.",
      "Deploy Azure Firewall and configure a DNAT rule."
    ],
    correct: [0],
    explanation: "To make VM1 reachable by an external user with minimal effort, add a public IP address to the VM (and allow the required inbound port in the NSG).\n\nWhy the others are wrong:\n• An additional private IP address stays inside the virtual network and is not reachable externally.\n• A Site-to-Site VPN connects whole networks and is far more administrative effort for a single external contractor.\n• Azure Firewall with a DNAT rule works but adds cost and configuration overhead beyond the minimal-effort requirement.",
    reference: "https://learn.microsoft.com/azure/virtual-network/ip-services/public-ip-addresses"
  },
  {
    id: 492,
    domain: 4,
    subdomain: "VNet Peering",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains the following virtual networks:\n- VNet1 has an IP address range of 192.168.0.0/24.\n- VNet2 has an IP address range of 10.10.0.0/24.\n- VNet3 has an IP address range of 192.168.0.0/16.\nYou need to configure virtual network peering.\nWhich two peerings can you create? Each correct answer presents a complete solution.",
    options: [
      "VNet1 can be peered with VNet2.",
      "VNet2 can be peered with VNet3.",
      "VNet1 can be peered with VNet3.",
      "None of the virtual networks can be peered."
    ],
    correct: [0, 1],
    explanation: "Virtual network peering requires non-overlapping IP address spaces.\n• VNet1 (192.168.0.0/24) and VNet2 (10.10.0.0/24) do not overlap — peering is allowed.\n• VNet2 (10.10.0.0/24) and VNet3 (192.168.0.0/16) do not overlap — peering is allowed.\n\nWhy the other option is wrong:\n• VNet1 (192.168.0.0/24) is contained within VNet3 (192.168.0.0/16), so their address spaces overlap and they cannot be peered.",
    reference: "https://learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview"
  },
  {
    id: 493,
    domain: 4,
    subdomain: "Application Security Groups",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure virtual network that contains four subnets. Each subnet contains 10 virtual machines.\nYou plan to configure a network security group (NSG) that will allow inbound traffic over TCP port 8080 to two virtual machines on each subnet. The NSG will be associated to each subnet.\nYou need to recommend a solution to configure the inbound access by using the fewest number of NSG rules possible.\nWhat should you use as the destination in the NSG?",
    options: [
      "an application security group (ASG)",
      "the IP address of each virtual machine",
      "the subnet address ranges",
      "a service tag"
    ],
    correct: [0],
    explanation: "Application security groups (ASGs) let you group the network interfaces of multiple VMs and use that group as the source or destination in an NSG rule. You place the two target VMs from each subnet into a single ASG and write ONE rule allowing TCP 8080 to that ASG — the fewest rules possible. (The NICs must be in the same virtual network.)\n\nWhy the others are wrong:\n• Using each VM's IP address requires a separate rule per VM (eight rules).\n• Using the subnets requires multiple rules and would allow the traffic to ALL VMs on those subnets, not just two.\n• Service tags represent specific Azure services (e.g., AzureBackup, Storage), not your own VMs.",
    reference: "https://learn.microsoft.com/azure/virtual-network/application-security-groups"
  },
  {
    id: 494,
    domain: 4,
    subdomain: "Load Balancer",
    type: "single",
    source: "MS Practice Assessment",
    question: "Your company has deployed an Azure Load Balancer to distribute traffic across multiple VMs in a web farm. Users report intermittent connection timeouts when accessing the web app.\nYou need to resolve the connection timeout issues and ensure even traffic distribution by the load balancer.\nWhat should you do?",
    options: [
      "Change the distribution mode to five-tuple hash.",
      "Configure a health probe for the load balancer.",
      "Enable session persistence with source IP affinity.",
      "Upgrade the load balancer to a higher SKU."
    ],
    correct: [0],
    explanation: "The default five-tuple hash distribution (source IP, source port, destination IP, destination port, protocol) spreads connections evenly across healthy backend instances, resolving uneven distribution and the resulting intermittent timeouts.\n\nWhy the others are wrong:\n• A health probe detects unhealthy instances but does not change how traffic is distributed across healthy ones.\n• Session persistence with source IP affinity (2-tuple/3-tuple) pins a client to one VM, which can worsen uneven distribution.\n• Upgrading the SKU without changing the distribution mode does not fix the distribution behavior.",
    reference: "https://learn.microsoft.com/azure/load-balancer/distribution-mode-concepts"
  }
]);
