// ============================================================
// DOMAIN 3: Deploy and Manage Azure Compute Resources (20-25%)
// Question IDs: 301 - 355
// 2026 Skills: ARM/Bicep, VMs, Containers, App Service
// ============================================================

var QUESTIONS = typeof QUESTIONS !== 'undefined' ? QUESTIONS : [];

QUESTIONS.push.apply(QUESTIONS, [

  // ====================================================
  // TOPIC: ARM Templates and Bicep
  // ====================================================

  {
    id: 301,
    domain: 3,
    subdomain: "ARM Templates and Bicep",
    type: "multi",
    question: "You have an ARM template that deploys multiple virtual machines. The template requires an administrative password. You need to ensure the password is NOT stored in plain text in the template or parameters file. Which TWO components must you create?",
    options: [
      "An Azure Key Vault to securely store the password as a secret",
      "An Azure Storage account to store the password file",
      "An access policy (or RBAC role) that grants Azure Resource Manager permission to read secrets from the Key Vault",
      "An Azure Active Directory Identity Protection policy",
      "An Azure Policy initiative for password complexity"
    ],
    correct: [0, 2],
    explanation: "To reference a Key Vault secret in an ARM template parameters file securely:\n\n1. Azure Key Vault: Store the admin password as a Key Vault secret\n\n2. Access Policy (or RBAC role): Grant Azure Resource Manager the ability to retrieve secrets from the Key Vault during deployment\n   • Key Vault must have 'Enable Azure Resource Manager for template deployment' enabled\n   • Or: Grant the deployment identity 'Key Vault Secrets User' role\n\nARM parameters file with Key Vault reference:\n{\n  '$schema': '...',\n  'parameters': {\n    'adminPassword': {\n      'reference': {\n        'keyVault': { 'id': '/subscriptions/.../vaults/MyVault' },\n        'secretName': 'vmAdminPassword'\n      }\n    }\n  }\n}\n\nDuring deployment, ARM retrieves the secret value from Key Vault and passes it to the template — the password is NEVER stored in the template or parameters file.\n\n• Storage accounts store data but are not secret management services — use Key Vault\n• Identity Protection is for risk-based Entra ID sign-in policies\n• Azure Policy is for resource governance/compliance",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/templates/key-vault-parameter"
  },

  {
    id: 302,
    domain: 3,
    subdomain: "ARM Templates and Bicep",
    type: "yesno",
    scenario: "You need to deploy a new ARM template to a resource group. Before committing the deployment, you want to preview what changes the template will make to your existing resources without actually deploying anything.",
    question: "You run the ARM template deployment with the '--what-if' flag using Azure CLI to preview changes without deploying.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — the ARM template What-If operation previews all changes a deployment would make without applying them.\n\nAzure CLI:\naz deployment group what-if --resource-group RG1 --template-file template.json --parameters @params.json\n\nPowerShell:\nNew-AzResourceGroupDeployment -WhatIf -ResourceGroupName RG1 -TemplateFile template.json\n\nWhat-If output shows each resource change type:\n• Create: Resource will be newly created\n• Modify: Existing resource will be changed (with before/after property values)\n• Delete: Resource will be deleted (only in Complete mode)\n• Ignore: Resource exists but template won't change it\n• NoChange: Resource matches template — no action needed\n\nUseful before production deployments to prevent unintended changes.\n\nPortal equivalent: Create a deployment → Review + create tab shows a visual diff before deploying.",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/templates/deploy-what-if"
  },

  {
    id: 303,
    domain: 3,
    subdomain: "ARM Templates and Bicep",
    type: "single",
    question: "Your team has existing ARM templates in JSON format and wants to convert them to Bicep for better readability. Which command converts an existing ARM JSON template to a Bicep file?",
    options: [
      "az bicep build --file template.json",
      "az bicep decompile --file template.json",
      "az deployment group export --template-file template.json",
      "az bicep convert --source template.json --target template.bicep"
    ],
    correct: [1],
    explanation: "Bicep CLI commands for template conversion:\n\n• Bicep → ARM JSON (compile/build):\n  az bicep build --file template.bicep\n  Creates: template.json\n\n• ARM JSON → Bicep (decompile):\n  az bicep decompile --file template.json\n  Creates: template.bicep\n\nDecompile considerations:\n• The decompiled Bicep is a best-effort conversion — manual review is required\n• Complex expressions, nested templates, and certain ARM functions may not decompile cleanly\n• Output may use unfriendly variable names\n• Always validate the decompiled Bicep before using in production\n\nBicep advantages over ARM JSON:\n• Concise syntax (no verbose JSON structure)\n• Type safety and IntelliSense in VS Code\n• Modules for reusable components\n• Cleaner parameter/variable declarations\n• Automatic dependency detection\n• All Bicep compiles to ARM JSON for deployment — fully backward compatible\n\n• az bicep build compiles FROM Bicep TO ARM JSON (opposite direction)\n• az deployment group export exports current deployed state as a template (not the same as converting)\n• 'az bicep convert' is not a valid command",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/bicep/decompile"
  },

  {
    id: 304,
    domain: 3,
    subdomain: "ARM Templates and Bicep",
    type: "single",
    question: "You are deploying an ARM template with two resources: a Virtual Network and a Virtual Machine. The VM must be deployed only after the VNet is created. How do you enforce this deployment order?",
    options: [
      "List the VNet resource before the VM in the 'resources' array",
      "Add a 'dependsOn' property to the VM resource referencing the VNet resource ID",
      "Deploy them in two separate ARM templates in sequence",
      "Add 'priority: 1' to the VNet resource and 'priority: 2' to the VM resource"
    ],
    correct: [1],
    explanation: "ARM templates use the 'dependsOn' property to define explicit dependencies. When the VM has a dependsOn pointing to the VNet, ARM will:\n1. Deploy the VNet first\n2. Wait for VNet deployment to succeed\n3. Then deploy the VM\n\nExample:\n{\n  'type': 'Microsoft.Compute/virtualMachines',\n  'name': 'VM1',\n  'dependsOn': [\n    '[resourceId(\"Microsoft.Network/virtualNetworks\", \"VNet1\")]'\n  ]\n}\n\nImplicit dependencies (detected automatically):\nIf the VM resource references the VNet using reference() or resourceId() within its properties, ARM automatically detects the dependency — explicit dependsOn may not be needed.\n\nARM deployment parallelism:\n• Resources WITHOUT dependencies are deployed in PARALLEL\n• Resources WITH dependsOn are deployed sequentially after their dependencies\n• This parallelism makes ARM deployments fast\n\n• Resource array order does NOT determine deployment order — ARM deploys all independent resources in parallel\n• Separate templates work but are more complex to manage\n• 'priority' is not an ARM resource property",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/templates/resource-dependency"
  },

  {
    id: 305,
    domain: 3,
    subdomain: "ARM Templates and Bicep",
    type: "single",
    question: "You are deploying VMs with an ARM template and need to understand the deployment modes. Your team wants to ensure that resources present in the resource group but NOT in the ARM template will be deleted. Which deployment mode should you use?",
    options: [
      "Incremental mode — adds or updates resources in the template but doesn't delete resources not in the template",
      "Complete mode — deploys all resources in the template and deletes any resource group resources NOT in the template",
      "Validate mode — checks template syntax and resource provider API versions",
      "Preview mode — shows changes but doesn't delete resources"
    ],
    correct: [1],
    explanation: "ARM template deployment modes:\n\nIncremental mode (DEFAULT):\n• Adds or updates resources defined in the template\n• Resources in the resource group that are NOT in the template: LEFT UNCHANGED (not deleted)\n• Safe for most updates\n• Order matters for updates\n\nComplete mode:\n• Deploys resources defined in the template\n• Resources in the resource group NOT in the template: DELETED\n• Use when you want the resource group to contain ONLY what's in the template\n• WARNING: Can unintentionally delete resources — use What-If preview first\n\nCLI:\naz deployment group create --mode Complete ...\n\nPowerShell:\nNew-AzResourceGroupDeployment -Mode Complete ...\n\nBest practice:\n• Default to Incremental for safety\n• Use Complete for 'desired state' deployments\n• Always run --what-if first before Complete mode deployments\n\n• Validate mode checks template validity but doesn't deploy or delete anything\n• 'Preview mode' is the What-If operation — it doesn't make changes",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/templates/deployment-modes"
  },

  {
    id: 306,
    domain: 3,
    subdomain: "ARM Templates and Bicep",
    type: "single",
    question: "You have an ARM template that deploys 3 VMs using a copy loop. You want to use the loop index to assign unique names like 'vm-0', 'vm-1', 'vm-2'. Which ARM function should you use within the copy loop?",
    options: [
      "indexOf()",
      "copyIndex()",
      "loopIndex()",
      "createArray()"
    ],
    correct: [1],
    explanation: "copyIndex() returns the current iteration index within an ARM template copy loop. It starts at 0 by default.\n\nExample ARM template with copy loop:\n{\n  'copy': {\n    'name': 'vmCopy',\n    'count': 3\n  },\n  'type': 'Microsoft.Compute/virtualMachines',\n  'name': \"[concat('vm-', copyIndex())]\"\n}\n\nThis creates: vm-0, vm-1, vm-2\n\ncopyIndex(offset): Use an offset to start numbering from a different value:\n\"[concat('vm-', copyIndex(1))]\" creates: vm-1, vm-2, vm-3\n\nCopy loops can be applied to:\n• Resources: Create N copies of a resource\n• Properties: Create arrays within a resource (e.g., array of data disks)\n• Variables: Create arrays of values\n• Outputs: Create arrays of output values\n\nBicep equivalent (for loop):\n[for i in range(0, 3): {\n  name: 'vm-${i}'\n}]\n\n• indexOf() is for string/array operations, not loop iteration\n• loopIndex() is not a valid ARM function\n• createArray() creates a new array from arguments",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/templates/copy-resources"
  },

  // ====================================================
  // TOPIC: Create and Configure Virtual Machines
  // ====================================================

  {
    id: 307,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "Your company has three virtual machines in an Availability Set. You try to resize one VM to a larger size and receive an allocation failure error. The resize must succeed. What should you do?",
    options: [
      "Stop only the VM you want to resize",
      "Stop two of the three VMs in the Availability Set",
      "Stop (deallocate) ALL three VMs in the Availability Set, then resize",
      "Remove the VM from the Availability Set, resize it, then re-add it"
    ],
    correct: [2],
    explanation: "When VMs are in an Availability Set, they are placed on the same underlying hardware cluster. When you request a resize to a size not available in the current cluster, an allocation failure occurs.\n\nResolution for allocation failure in Availability Set:\n1. STOP (deallocate) ALL VMs in the Availability Set\n2. Azure releases the cluster reservation for the entire Availability Set\n3. Resize the target VM to the desired size\n4. Start all VMs\n\nWhy all VMs must be stopped:\n• Azure must find a new cluster that has capacity for ALL VMs in the AS with the new configuration\n• If other VMs remain running on the old cluster, the resized VM can't be reallocated to a compatible cluster\n• Stopping all VMs allows Azure to place the entire AS on a cluster supporting the new size\n\nThis is different from standalone VMs:\n• Standalone VM: Stop just that VM → resize → start\n• Availability Set VMs: Must stop ALL VMs in the set\n\n• Stopping only the target VM doesn't free the cluster constraint imposed by the remaining running VMs\n• Stopping 2 of 3 is not sufficient\n• Removing from AS loses the HA configuration permanently",
    reference: "https://learn.microsoft.com/azure/virtual-machines/resize-vm"
  },

  {
    id: 308,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You need to deploy Azure VMs using an ARM template into an Availability Set. To maximize the number of VMs that remain available during a hardware failure (power, network, or cooling failure), what should you set 'platformFaultDomainCount' to?",
    options: [
      "1",
      "2",
      "5",
      "3 (the maximum in most regions)"
    ],
    correct: [3],
    explanation: "Fault domains represent separate physical hardware infrastructure (independent power, network, and cooling). Spreading VMs across more fault domains means fewer VMs go down during a single hardware failure.\n\nplatformFaultDomainCount:\n• Minimum: 1\n• Default: 2\n• Maximum: 3 in most Azure regions (some regions support only 2)\n• For maximum fault resilience: Set to 3 (or maximum supported in your region)\n\nplatformUpdateDomainCount:\n• Default: 5\n• Maximum: 20\n• More update domains = fewer VMs updated simultaneously during planned maintenance\n\nAvailability Set ARM template example:\n'properties': {\n  'platformFaultDomainCount': 3,\n  'platformUpdateDomainCount': 20\n}\n\nSLA:\n• With 2+ VMs in an Availability Set: 99.95% uptime SLA\n• Availability Zones (different DCs): 99.99% SLA\n\n• platformFaultDomainCount: 1 — all VMs on same hardware rack, no fault protection\n• platformFaultDomainCount: 2 — default, spreads across 2 hardware groups\n• platformFaultDomainCount: 3 — maximum protection, spreads across 3 hardware groups",
    reference: "https://learn.microsoft.com/azure/virtual-machines/availability-set-overview"
  },

  {
    id: 309,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You need to deploy VMs in a region that supports 3 Availability Zones. The VMs must have the highest SLA possible. Which deployment configuration achieves this?",
    options: [
      "Deploy all VMs in the same Availability Set with 3 fault domains",
      "Deploy each VM in a different Availability Zone (Zone 1, 2, and 3)",
      "Deploy VMs with Proximity Placement Groups for low latency",
      "Enable accelerated networking on all VMs"
    ],
    correct: [1],
    explanation: "Azure VM SLA comparison:\n\n• Single VM (Premium SSD): 99.9%\n• Availability Set (2+ VMs): 99.95%\n• Availability Zones (2+ VMs in different zones): 99.99% — highest SLA\n\nAvailability Zones:\n• Physically separate datacenters within the same Azure region\n• Independent power, cooling, and networking\n• Network latency: < 2ms round-trip between zones\n• Protection: Against datacenter-level failures\n• Deployment: Specify zone per VM — VM1 in Zone 1, VM2 in Zone 2, VM3 in Zone 3\n\nAvailability Sets:\n• Within a single datacenter — protect against rack-level failures only\n• 3 fault domains, up to 20 update domains\n• SLA: 99.95%\n\nFor maximum SLA in a 3-AZ region:\n• Deploy at least 2 VMs in different zones (2-zone: 99.99%)\n• 3 zones provides protection from any single zone failure\n\nCLI example:\naz vm create --zone 1 ...\naz vm create --zone 2 ...\naz vm create --zone 3 ...\n\n• Availability Set provides 99.95% — lower than AZ's 99.99%\n• Proximity Placement Groups optimize latency between VMs, not availability SLA\n• Accelerated networking improves network performance, not VM availability",
    reference: "https://learn.microsoft.com/azure/virtual-machines/availability"
  },

  {
    id: 310,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You have a Virtual Machine Scale Set (VMSS) with 5 instances. You need to configure the VMSS to automatically add instances when CPU > 75% and remove instances when CPU < 25%. What should you configure?",
    options: [
      "Availability Set with auto-restart policy",
      "Custom autoscale rules on the VMSS with scale-out and scale-in metric conditions",
      "A Log Analytics alert that triggers a runbook",
      "Azure Load Balancer health probe with automatic instance management"
    ],
    correct: [1],
    explanation: "VMSS autoscaling is configured via the Scale (Autoscale) settings on the VMSS resource:\n\nScale-out rule:\n• Metric: Percentage CPU\n• Condition: Average CPU > 75%\n• Duration: 5 minutes (time aggregation window)\n• Action: Add 1 instance\n• Cool down: 5 minutes (wait before evaluating again)\n\nScale-in rule:\n• Metric: Percentage CPU\n• Condition: Average CPU < 25%\n• Duration: 10 minutes\n• Action: Remove 1 instance\n\nMin/Max capacity:\n• Minimum instances: 2 (for HA)\n• Maximum instances: 10 (cost control)\n\nAdditional autoscale capabilities:\n• Schedule-based: Scale to X instances at specific times\n• KEDA-based scaling: Event-driven (queue depth, HTTP requests) — via Container Apps or AKS\n• Predictive autoscaling: ML-based forecasting\n\nConfigured in: VMSS → Scaling → Custom autoscale\n\n• Availability Set is a separate HA mechanism — doesn't provide autoscaling\n• Log Analytics + runbook works but is complex — native VMSS autoscaling is the right tool\n• Load Balancer health probes detect unhealthy instances but don't scale the VMSS",
    reference: "https://learn.microsoft.com/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-autoscale-overview"
  },

  {
    id: 311,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You need to configure Azure Disk Encryption (ADE) on a Windows VM to encrypt both the OS disk and data disks. Which Azure service must be configured as a prerequisite?",
    options: [
      "Azure Backup Recovery Services vault with encryption enabled",
      "Azure Key Vault with soft-delete and purge protection enabled",
      "Azure Storage account with customer-managed keys",
      "Azure Defender for Servers with disk encryption enforcement"
    ],
    correct: [1],
    explanation: "Azure Disk Encryption (ADE) uses BitLocker (Windows) or dm-crypt (Linux) to encrypt VM disks at the guest OS level. The encryption keys are stored in Azure Key Vault.\n\nKey Vault prerequisites for ADE:\n• Soft-delete: MUST be enabled\n• Purge protection: MUST be enabled\n• These requirements prevent accidental key deletion that would permanently lock encrypted disks\n• ADE requires permission to store and retrieve keys: Key Vault access policy with key/secret permissions (or Key Vault Crypto Service Encryption User role)\n\nEnable Key Vault for disk encryption:\naz keyvault update --name KV1 --resource-group RG1 --enable-for-disk-encryption true\n\nEnable ADE on a VM:\naz vm encryption enable --resource-group RG1 --name VM1 --disk-encryption-keyvault KV1\n\nADE vs Server-Side Encryption (SSE):\n• SSE: Platform-level — always on, transparent, no configuration, managed by Azure\n• ADE: Guest OS level — BitLocker/dm-crypt, keys in Key Vault, encrypts OS and data disks\n• Encryption at host: Platform-level but also covers temp disk and VM host cache\n\n• Azure Backup vault is for backup, not encryption key management\n• Storage CMK is for SSE, not ADE\n• Azure Defender detects threats but doesn't configure disk encryption",
    reference: "https://learn.microsoft.com/azure/virtual-machines/windows/disk-encryption-overview"
  },

  {
    id: 312,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You have a VM with a data disk attached. You need to detach the data disk and attach it to a different VM. What is the correct order of operations to minimize risk of data corruption?",
    options: [
      "In the Azure portal, directly detach the disk from the source VM without any preparation",
      "Within the VM guest OS, offline/unmount the disk first, then detach in Azure portal, then attach to the destination VM",
      "Delete the source VM, then attach the disk to the destination VM",
      "Create a snapshot of the disk, then delete the original disk and create a new disk from the snapshot on the destination VM"
    ],
    correct: [1],
    explanation: "Safe disk detachment procedure:\n\nStep 1 (Guest OS): Unmount/Offline the disk within the operating system\n• Windows: Disk Management → Right-click disk → Offline\n• Linux: umount /dev/sdc → or echo 1 > /sys/block/sdc/device/delete\n• This ensures all pending writes are flushed and the file system is cleanly unmounted\n\nStep 2 (Azure portal/CLI): Detach the disk from the source VM\n• Azure portal: VM → Disks → Click disk → Detach → Save\n• CLI: az vm disk detach --resource-group RG1 --vm-name VM1 --name disk1\n\nStep 3: Attach the disk to the destination VM\n• Azure portal: Destination VM → Disks → + Add existing disk → Select detached disk\n• CLI: az vm disk attach --resource-group RG1 --vm-name VM2 --name disk1\n\nAzure Managed Disks:\n• After detachment, the disk is a standalone resource in Azure\n• Can be attached to any VM in the same region\n• Same Availability Zone requirement: If VM is zone-pinned, disk must be in the same zone\n\n• Detaching without unmounting can cause file system corruption\n• Deleting the source VM is destructive and unnecessary\n• Creating a snapshot creates a COPY — does not move the original disk",
    reference: "https://learn.microsoft.com/azure/virtual-machines/detach-disk"
  },

  {
    id: 313,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You need to move an Azure VM named VM1 from the East US region to West Europe. The VM has an OS disk and one data disk. Which approach correctly accomplishes this cross-region move?",
    options: [
      "Use the 'Move' button in the Azure portal on the VM resource",
      "Use the Move-AzResource PowerShell cmdlet with the target region parameter",
      "Use Azure Resource Mover to analyze dependencies and migrate the VM and its associated resources to the target region",
      "Stop the VM, change the region in the VM properties, and restart"
    ],
    correct: [2],
    explanation: "Azure Resource Mover is the recommended tool for moving Azure resources between regions.\n\nProcess:\n1. Add VM1 (and optionally its dependencies) to Azure Resource Mover\n2. Analyze dependencies (automatically identifies: NIC, public IP, NSG, VNet, disk, etc.)\n3. Prepare: Resource Mover uses Azure Site Recovery to replicate the VM to the target region\n4. Initiate move: Resources are moved/created in the target region\n5. Validate: Test the VM in the target region\n6. Commit: Finalize the move and delete source resources\n\nAlternative manual approach:\n1. Create a snapshot of OS and data disks\n2. Copy snapshots to target region (az snapshot create → az snapshot copy)\n3. Create managed disks from copied snapshots in target region\n4. Create new VM in target region from the disks\n5. Reconfigure networking, public IPs, NSGs\n6. Delete source VM and resources\n\n• Azure portal 'Move' button moves resources between RESOURCE GROUPS or SUBSCRIPTIONS within the same region — NOT between regions\n• Move-AzResource also moves between resource groups/subscriptions within same region, NOT cross-region\n• You cannot change a VM's region via properties — the VM would need to be redeployed",
    reference: "https://learn.microsoft.com/azure/resource-mover/overview"
  },

  {
    id: 314,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You need to provide browser-based RDP and SSH access to Azure VMs without exposing the VMs to the public internet and without requiring any VPN client software. Which Azure service should you deploy?",
    options: [
      "Just-in-Time (JIT) VM Access via Microsoft Defender for Servers",
      "Azure Bastion in the AzureBastionSubnet of the virtual network",
      "Azure VPN Gateway with Point-to-Site VPN",
      "Azure Application Gateway with TLS termination"
    ],
    correct: [1],
    explanation: "Azure Bastion provides browser-based, fully managed RDP and SSH access to VMs:\n• No public IP required on the VMs\n• No VPN client software needed\n• No open RDP (3389) or SSH (22) ports on NSGs\n• Access directly from the Azure portal browser\n\nSetup requirements:\n• Deploy Bastion in a dedicated subnet named 'AzureBastionSubnet' (/26 minimum)\n• Bastion itself requires a Standard SKU public IP\n• VMs must be in the same VNet (or peered VNet for Standard tier)\n\nAzure Bastion tiers:\n• Basic: Browser-based RDP/SSH from Azure portal\n• Standard: Adds native client support, file transfer, audio, shareable links, IP-based connections, VNet peering support\n\nJIT VM Access (comparison):\n• Temporarily opens RDP/SSH ports on the NSG when requested\n• VMs still need public IPs for direct access, or jump host\n• More complex for true zero-public-IP scenarios\n\n• JIT opens ports but still exposes the VM's management ports temporarily\n• VPN Gateway requires client software and VPN configuration\n• Application Gateway is an HTTP/S load balancer — not for RDP/SSH admin access",
    reference: "https://learn.microsoft.com/azure/bastion/bastion-overview"
  },

  {
    id: 315,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You need to run a PowerShell script on a running Azure Windows VM without logging into the VM via RDP. The script takes less than 5 minutes to complete. Which feature should you use?",
    options: [
      "Custom Script Extension — add a new extension to the VM",
      "Run Command feature in the Azure portal or CLI",
      "Azure Automation Update Management",
      "Azure Policy guest configuration"
    ],
    correct: [1],
    explanation: "Run Command allows you to execute scripts directly on a running VM without RDP/SSH access, through the Azure control plane.\n\nUsage:\n• Azure portal: VM → Operations → Run command → Select script type → Enter script → Run\n• CLI: az vm run-command invoke --resource-group RG1 --name VM1 --command-id RunPowerShellScript --scripts 'Get-Process'\n• PowerShell: Invoke-AzVMRunCommand -ResourceGroupName RG1 -VMName VM1 -CommandId 'RunPowerShellScript' -ScriptString 'Get-Process'\n\nRun Command vs Custom Script Extension:\n• Run Command: Interactive, on-demand, immediate execution, temporary (not persisted), ideal for troubleshooting, 90-minute timeout\n• Custom Script Extension: Persistent extension installed on VM, downloads and runs scripts from URI, for provisioning/configuration\n\nAvailable Run Command IDs:\n• Windows: RunPowerShellScript, RunShellScript, EnableRemotePS, etc.\n• Linux: RunShellScript, ifconfig, etc.\n\nRequirements:\n• VM must be running\n• VM agent must be installed and responsive\n\n• Custom Script Extension is for deployment-time configuration — adding another extension for a one-off script is heavier than Run Command\n• Azure Automation Update Management handles OS patching, not arbitrary script execution\n• Azure Policy guest configuration enforces compliance states, not one-time script execution",
    reference: "https://learn.microsoft.com/azure/virtual-machines/run-command-overview"
  },

  {
    id: 316,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You want to deploy VMs for batch processing workloads that can tolerate interruption. The cost must be minimized, and you accept that Azure may reclaim the VM capacity with a 30-second warning. Which VM type should you use?",
    options: [
      "Azure Reserved VM Instance with a 3-year commitment",
      "Azure Spot VM with Deallocate eviction policy",
      "Azure Dedicated Host VM",
      "Standard pay-as-you-go VM with auto-shutdown"
    ],
    correct: [1],
    explanation: "Azure Spot VMs use Azure's unused compute capacity at significant discounts (up to 90% off pay-as-you-go pricing).\n\nSpot VM characteristics:\n• Price: Up to 90% discount vs pay-as-you-go\n• Eviction: Azure can reclaim capacity at any time (or when spot price exceeds your max bid)\n• Warning: 30-second notification via Azure Instance Metadata Service (IMDS) before eviction\n• Eviction policy options:\n  - Deallocate: VM is stopped and deallocated (disk retained, can restart when capacity available)\n  - Delete: VM and associated resources are deleted on eviction\n\nBest use cases:\n• Batch processing\n• CI/CD workloads\n• Dev/test environments\n• Rendering and simulation\n• Data analytics\n• Any workload designed to checkpoint and resume\n\nNOT suitable for:\n• Production web applications\n• Databases\n• Critical workloads that cannot tolerate interruption\n\nSpot VMs cannot be used in Availability Sets.\n\n• Reserved Instances offer discounts for committed usage but are NOT interruptible — guaranteed capacity\n• Dedicated Hosts are for compliance/licensing isolation — expensive, no discount\n• Pay-as-you-go with auto-shutdown saves money by turning off idle VMs, but at full price when running",
    reference: "https://learn.microsoft.com/azure/virtual-machines/spot-vms"
  },

  {
    id: 317,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "Your organization needs dedicated physical servers in Azure for compliance reasons. All VMs running in your Azure subscription must be isolated from other customers at the hardware level. Which Azure service provides physical server-level isolation?",
    options: [
      "Azure Virtual Machine Scale Sets with Uniform orchestration",
      "Azure Dedicated Hosts",
      "Azure Availability Zones",
      "Azure Confidential Computing VMs"
    ],
    correct: [1],
    explanation: "Azure Dedicated Hosts provide physical server-level isolation — you get an entire physical host dedicated exclusively to your organization.\n\nAzure Dedicated Host features:\n• Physical isolation: No other customer's VMs on the same physical hardware\n• Compliance: Meets requirements for regulatory isolation (financial, healthcare, government)\n• Maintenance control: Choose maintenance windows for host updates\n• Visibility: Know the physical host your VMs run on\n• BYOL (Bring Your Own License): Azure Hybrid Benefit for Windows Server and SQL Server\n• Host groups: Organize multiple hosts for availability\n\nPricing:\n• Billed per host (regardless of how many VMs you deploy on it)\n• VM compute costs are included in the host price\n• Most expensive option but provides maximum isolation\n\nDedicated Host families:\n• Each host family corresponds to a VM series (e.g., Dsv3-Type4 for D-series VMs)\n• A host can hold multiple VMs of the same series up to its capacity\n\nConfidential Computing VMs:\n• Protects data IN USE (during computation) using hardware-level encryption\n• Different from physical isolation — still runs on shared hardware\n\n• VMSS with Uniform orchestration doesn't provide physical isolation\n• Availability Zones distribute VMs across datacenters — no physical isolation guarantee\n• Confidential Computing is about encrypting data in use, not physical server isolation",
    reference: "https://learn.microsoft.com/azure/virtual-machines/dedicated-hosts"
  },

  {
    id: 318,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You are deploying Azure Virtual Machine Scale Sets (VMSS). You want all instances in the VMSS to use the same VM image and size but need to deploy them across Availability Zones 1, 2, and 3 for high availability. Which VMSS orchestration mode supports deployment across multiple Availability Zones?",
    options: [
      "Uniform orchestration only — Flexible orchestration doesn't support zones",
      "Both Uniform and Flexible orchestration modes support Availability Zone deployment",
      "Flexible orchestration only — Uniform orchestration is single-zone only",
      "Neither orchestration mode; use individual VMs in different zones instead"
    ],
    correct: [1],
    explanation: "Both VMSS orchestration modes support Availability Zone deployment:\n\nUniform orchestration:\n• All VMs are identical (same size, same image)\n• Supports zone spanning (spread instances across multiple AZs)\n• Automatically manages instance count\n• Ideal for stateless, identical workloads\n• Max 1,000 instances (100 with custom images)\n\nFlexible orchestration:\n• VMs can have different sizes and configurations\n• Supports zone spanning\n• Integrates with Azure Load Balancer and Application Gateway\n• Supports mixing of VM sizes\n• Better for stateful workloads requiring individual VM management\n• Max 1,000 instances\n\nFor zone-spanning deployment (both modes):\n• VMSS zone configuration: Specify zones ['1', '2', '3']\n• Azure evenly distributes instances across zones\n• Zone-redundant deployment provides 99.99% SLA\n\nCLI example:\naz vmss create --zones 1 2 3 ...\n\n• Both Uniform and Flexible support zone deployment — not one or the other\n• Using individual VMs in zones is possible but doesn't have the scale-out benefits of VMSS",
    reference: "https://learn.microsoft.com/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-use-availability-zones"
  },

  {
    id: 319,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You need to configure the upgrade policy for a VMSS so that when you update the VM image (OS), the update is applied to instances one at a time (or in small batches) to maintain availability. Which upgrade mode should you select?",
    options: [
      "Automatic upgrade mode — Azure applies updates immediately to all instances simultaneously",
      "Manual upgrade mode — you must manually trigger upgrades on each instance",
      "Rolling upgrade mode — updates are applied gradually in configurable batches with health checks",
      "Blue-green upgrade mode — creates a new VMSS with the new image and swaps traffic"
    ],
    correct: [2],
    explanation: "VMSS Upgrade Policy modes:\n\nAutomatic:\n• Updates applied to ALL instances simultaneously as soon as new image is available\n• No control over timing; all instances updated at once\n• Risk: If update is bad, all instances are affected simultaneously\n• Use for: Non-critical dev/test environments\n\nManual:\n• You must explicitly trigger upgrades on each instance (or the entire VMSS)\n• Full control — you decide when and which instances to upgrade\n• Use for: Production with complex upgrade coordination\n\nRolling (recommended for production):\n• Updates applied to instances in batches\n• Configurable: max batch size, max unhealthy instances, pause time between batches\n• Health checks determine if a batch is healthy before proceeding to next batch\n• Provides zero-downtime or near-zero-downtime upgrades\n• Requires VMSS health extension or Application Health extension\n\nConfigured in: VMSS → Upgrade policy → Rolling\n\nRolling upgrade configuration:\n• Max batch instance percent: % of instances in each batch (e.g., 20%)\n• Max unhealthy instance percent: Max % of unhealthy instances tolerated\n• Pause time between batches: Wait time to monitor health after each batch\n\n• Automatic is all-at-once — not 'one at a time'\n• Manual requires explicit per-instance action\n• 'Blue-green' is not a native VMSS upgrade mode",
    reference: "https://learn.microsoft.com/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-upgrade-policy"
  },

  {
    id: 320,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    question: "You need to configure Azure VMs so that all traffic between VM instances in the same subnet is encrypted at the network level, and the VM OS disk is also encrypted. Which combination of features achieves this?",
    options: [
      "Azure Disk Encryption for OS disk + Network Security Group for VM-to-VM traffic",
      "Server-side storage encryption (SSE) for OS disk + VNet encryption for VM-to-VM traffic",
      "Azure Disk Encryption (ADE) for OS disk + Azure VNet encryption for same-subnet traffic encryption",
      "Encryption at host for OS disk + TLS certificates on each VM's network interface"
    ],
    correct: [2],
    explanation: "To meet both requirements:\n\n1. OS Disk Encryption — Azure Disk Encryption (ADE):\n   • Uses BitLocker (Windows) or dm-crypt (Linux)\n   • Encrypts OS and data disks at the guest OS level\n   • Keys stored in Azure Key Vault\n   • Different from SSE (platform-level) — ADE is guest-level\n\n2. VM-to-VM traffic encryption — Azure Virtual Network Encryption:\n   • Encrypts traffic between VMs in the same VNet (or peered VNets)\n   • Uses DTLS (Datagram TLS) transparently at the network layer\n   • No application changes needed\n   • Supported on specific VM sizes and regions\n   • Enable: VNet → Settings → Encryption → Enabled\n\nNote: These are complementary encryption layers:\n• ADE: Data at rest on disk\n• VNet Encryption: Data in transit between VMs\n\nOther encryption options:\n• SSE: Platform-level disk encryption (always on, transparent)\n• Encryption at host: Encrypts OS disk cache and temp disk on the physical host\n\n• NSG doesn't encrypt traffic — it filters it\n• SSE is platform-level disk encryption; VNet encryption is for traffic between VMs\n• TLS certificates on NICs is not how Azure VNet encryption works",
    reference: "https://learn.microsoft.com/azure/virtual-network/virtual-network-encryption-overview"
  },

  // ====================================================
  // TOPIC: Provision and Manage Containers
  // ====================================================

  {
    id: 321,
    domain: 3,
    subdomain: "Provision and Manage Containers",
    type: "single",
    question: "You need to build and push Docker container images to Azure Container Registry (ACR). You need geo-replication so that images are available in multiple Azure regions with low latency. Which ACR tier supports geo-replication?",
    options: [
      "Basic",
      "Standard",
      "Premium",
      "Enterprise"
    ],
    correct: [2],
    explanation: "Azure Container Registry tiers:\n\nBasic:\n• Development and testing use\n• 10 GB storage, 2 webhooks\n• No geo-replication, no private link\n• No content trust, no customer-managed keys\n\nStandard:\n• Production workloads\n• 100 GB storage, 10 webhooks\n• No geo-replication, no private link\n• Supports tasks and automated builds\n\nPremium:\n• Enterprise-grade with all features\n• 500 GB storage, 500 webhooks\n• Geo-replication: Replicate the registry to multiple regions\n• Private Link / private endpoint support\n• Customer-managed encryption keys\n• Dedicated data endpoints (reduce latency)\n• Concurrent layer pulling with faster image pulls\n• Retention policies for untagged manifests\n\nGeo-replication (Premium): Replicas are created in each configured region. When a client pulls an image, ACR routes the request to the nearest replica — reducing latency and network egress costs.\n\nSetup: ACR → Replications → Add location\n\n• Basic and Standard don't support geo-replication\n• 'Enterprise' is not an ACR tier",
    reference: "https://learn.microsoft.com/azure/container-registry/container-registry-skus"
  },

  {
    id: 322,
    domain: 3,
    subdomain: "Provision and Manage Containers",
    type: "single",
    question: "You are deploying a containerized batch processing job using Azure Container Instances (ACI). The job runs once and exits when processing completes. You want the container to restart if it crashes, but NOT restart after a successful completion. Which restart policy should you configure?",
    options: [
      "Always",
      "OnFailure",
      "Never",
      "OnSuccess"
    ],
    correct: [1],
    explanation: "ACI restart policies control the container restart behavior:\n\nAlways (default):\n• Container always restarts after stopping, regardless of exit code\n• Use for: Long-running services (web servers, APIs) that should always be running\n\nOnFailure:\n• Container restarts ONLY if it exits with a non-zero exit code (indicating failure)\n• If it exits with 0 (success): Container STOPS and does NOT restart\n• Use for: Batch jobs, data processing — should complete and exit on success, restart on failure\n\nNever:\n• Container NEVER restarts after stopping\n• Use for: One-time jobs where you want to examine the exit state\n\nFor this scenario (restart on crash, not on success): OnFailure is correct.\n\nConfigure via CLI:\naz container create --resource-group RG1 --name mycontainer --image myimage --restart-policy OnFailure\n\nACI billing: Billed only while the container is running — stopped containers don't incur compute charges.\n\n• 'Always' would restart the container even after successful completion — not desired\n• 'Never' would not restart on crash either\n• 'OnSuccess' is not a valid ACI restart policy",
    reference: "https://learn.microsoft.com/azure/container-instances/container-instances-restart-policy"
  },

  {
    id: 323,
    domain: 3,
    subdomain: "Provision and Manage Containers",
    type: "single",
    question: "You need to deploy a containerized microservice that scales automatically to zero when there is no HTTP traffic and scales up when traffic arrives, without managing any underlying infrastructure. Which Azure service best meets this requirement?",
    options: [
      "Azure Kubernetes Service (AKS)",
      "Azure Container Instances (ACI)",
      "Azure Container Apps",
      "Azure App Service (with container deployment)"
    ],
    correct: [2],
    explanation: "Azure Container Apps is built for serverless, event-driven, and HTTP-driven containerized applications:\n\n• Scale to zero: When no HTTP requests → replicas scale to 0 (no compute cost)\n• Scale on demand: When traffic arrives → Container Apps spins up instances automatically\n• Event-driven scaling via KEDA (Kubernetes Event-Driven Autoscaling): HTTP, queue depth, Dapr bindings, custom metrics\n• No infrastructure to manage: Fully managed (built on Kubernetes internally)\n• Built-in Dapr support: Service-to-service calls, state management, pub/sub\n• Revisions: Canary deployments, traffic splitting between revisions\n• Ingress: Built-in HTTPS routing\n\nContainer Apps vs other services:\n• AKS: Full Kubernetes control, but you manage clusters — complex, expensive\n• ACI: Simple container groups, no HTTP autoscaling, no scale-to-zero based on traffic\n• App Service: Traditional web app hosting, limited scale-to-zero (only on Consumption plan)\n• Container Apps: Serverless containers with KEDA-based autoscaling — the right choice\n\nScale-to-zero: When enabled, during idle periods:\n• 0 replicas = 0 compute cost\n• First request may have slight cold-start latency\n\n• AKS requires cluster management (node pools, upgrades, networking)\n• ACI doesn't have built-in HTTP autoscaling or traffic-based scale-to-zero\n• App Service Consumption plan has limited scale-to-zero for web apps",
    reference: "https://learn.microsoft.com/azure/container-apps/overview"
  },

  {
    id: 324,
    domain: 3,
    subdomain: "Provision and Manage Containers",
    type: "single",
    question: "You need to build a Docker image directly in Azure Container Registry from source code in a GitHub repository, without requiring a local Docker installation. Which ACR feature enables this?",
    options: [
      "ACR Webhook — triggers a build when code is pushed to GitHub",
      "ACR Task — builds, tests, and pushes container images directly in Azure",
      "Azure DevOps pipeline with ACR connection",
      "ACR Import — imports images from GitHub Container Registry"
    ],
    correct: [1],
    explanation: "ACR Tasks enable building, testing, and pushing container images directly in Azure without a local Docker installation.\n\nACR Task types:\n\n1. Quick task (on-demand build):\n   az acr build --registry MyACR --image myapp:v1 .\n   (Builds from local context or URL)\n\n2. Triggered task (automated builds):\n   • Triggers: Source code commit (GitHub, Azure Repos), base image update, schedule\n   • For GitHub: Attach webhook to trigger builds on git push\n\n3. Multi-step task (YAML-based):\n   • Build → Test → Push in a YAML task file\n   • Example: Build image → Run unit tests → Push if tests pass\n\nGitHub integration:\naz acr task create --registry MyACR --name build-task --image myapp:{{.Run.ID}} --context https://github.com/org/repo.git --branch main --git-access-token <token>\n\nThis automatically builds a new image on every git push to main branch.\n\nBenefits:\n• No local Docker required\n• Multi-architecture builds\n• Faster builds (ACR infrastructure)\n• Automatic base image update tracking\n\n• ACR Webhooks notify external services when events occur in ACR — they don't build images\n• Azure DevOps pipeline works but requires separate pipeline infrastructure\n• ACR Import copies images from external registries — doesn't build from source",
    reference: "https://learn.microsoft.com/azure/container-registry/container-registry-tasks-overview"
  },

  {
    id: 325,
    domain: 3,
    subdomain: "Provision and Manage Containers",
    type: "single",
    question: "You are deploying multiple microservices as Azure Container Apps in the same environment. You need to configure container app 'api' so it can communicate with container app 'database' using an internal hostname. What is the correct hostname format for the 'database' app?",
    options: [
      "database.internal.azurecontainerapps.io",
      "database.<environment-name>.<region>.azurecontainerapps.io",
      "database — just the app name as the hostname for same-environment communication",
      "10.0.0.x — use the private IP address of the container app"
    ],
    correct: [1],
    explanation: "In an Azure Container Apps Environment, each Container App is accessible from other apps in the same environment using its internal FQDN:\n\nInternal FQDN format:\nhttps://<app-name>.<unique-identifier>.<region>.azurecontainerapps.io\n\nExample:\nhttps://database.brightpool-abc123.eastus.azurecontainerapps.io\n\nFor same-environment communication:\n• Apps within the same environment share an internal DNS namespace\n• Internal ingress (not exposed publicly) allows app-to-app communication within the environment\n• The unique-identifier is the environment's unique suffix\n\nIngress configuration for internal service:\naz containerapp ingress enable --name database --resource-group RG1 --environment env1 --type internal --target-port 5432\n\nDapr service invocation (alternative):\n• Using Dapr: http://localhost:3500/v1.0/invoke/database/method/query\n• Dapr handles service discovery by app name\n\n• 'database.internal.azurecontainerapps.io' is not the correct format\n• Just 'database' as hostname doesn't work without Dapr's sidecar proxy\n• Container Apps use dynamic, ephemeral IPs — not fixed private IPs",
    reference: "https://learn.microsoft.com/azure/container-apps/connect-apps"
  },

  // ====================================================
  // TOPIC: Create and Configure Azure App Service
  // ====================================================

  {
    id: 326,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "You need to deploy a web application to Azure App Service. The app must support deployment slots (staging slot) for blue-green deployments AND auto-scaling. What is the minimum App Service plan tier required?",
    options: [
      "Free (F1)",
      "Basic (B1)",
      "Standard (S1)",
      "Premium v3 (P1v3)"
    ],
    correct: [2],
    explanation: "App Service plan tier features:\n\nFree (F1):\n• 60 CPU minutes/day, 1 GB RAM, 1 GB storage\n• No custom domains, no SSL, no scaling, no slots\n• Development only\n\nShared (D1):\n• Custom domains, no SSL, no scaling, no slots\n\nBasic (B1-B3):\n• Custom domains, SSL, manual scaling (up to 3 instances)\n• NO deployment slots\n• No auto-scaling\n\nStandard (S1-S3) — MINIMUM for both features:\n• Deployment slots: Up to 5 slots\n• Auto-scaling: Yes (up to 10 instances)\n• Custom domain + SSL\n• Azure Traffic Manager integration\n• Daily backups (10 per day)\n\nPremium (P0v3-P3v3):\n• All Standard features\n• Up to 20 deployment slots\n• More instances and compute power\n• VNet Integration\n• Private endpoints\n\nIsolated (I1v2-I3v2):\n• Dedicated infrastructure in App Service Environment\n\nFor BOTH deployment slots AND auto-scaling: Standard (S1) is the minimum.\n\n• Free: No slots, no scaling\n• Basic: Manual scaling only, no slots\n• Premium works but Standard is the minimum required",
    reference: "https://learn.microsoft.com/azure/app-service/overview-hosting-plans"
  },

  {
    id: 327,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "You have an App Service web app with a production slot and a staging slot. You have deployed and tested new code in the staging slot and want to promote it to production with zero downtime. What happens during a slot swap?",
    options: [
      "App Service stops the production slot, replaces its code with staging code, then restarts",
      "App Service warms up the staging slot with production settings, then atomically swaps HTTP routing so traffic that went to production now goes to the warmed staging slot; old production code is now in staging",
      "Users are temporarily redirected to staging for 5 minutes while the swap completes",
      "App Service copies all files from staging to production without modifying routing"
    ],
    correct: [1],
    explanation: "App Service slot swap process (zero-downtime):\n\nPhase 1 — Preparation:\n• Azure applies the TARGET slot's (production) app settings to the SOURCE slot (staging)\n• Slot-specific settings stay with their slot\n• Staging restarts with production configuration\n• Azure sends warm-up HTTP requests to staging to pre-warm instances\n\nPhase 2 — Swap:\n• Once staging is healthy and warm, Azure atomically swaps the virtual IP (VIP) routing\n• All new HTTP requests to production URL → now served by the old staging instances (which have new code)\n• Old production instances → now accessible at the staging URL\n\nAfter swap:\n• Production URL: Serves NEW code (from old staging)\n• Staging URL: Serves OLD code (from old production)\n• Instant rollback: Swap again to revert to old code\n\nSlot-specific settings (NOT swapped — stay with the slot):\n• App settings/connection strings with 'Deployment slot setting' checkbox enabled\n• These typically point to slot-appropriate databases/resources\n\nSettings that ARE swapped:\n• General settings (framework, bitness, WebSockets)\n• Handler mappings\n• Non-slot-specific app settings and connection strings\n\n• No production downtime — swap is atomic from user perspective\n• No file copying — slots have their own file systems; routing is swapped\n• No redirect — routing changes are transparent to users",
    reference: "https://learn.microsoft.com/azure/app-service/deploy-staging-slots"
  },

  {
    id: 328,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "You need to configure a custom TLS/SSL certificate for your App Service app at the domain 'www.contoso.com'. The app is on the Standard tier. What is required to bind a certificate to the custom domain?",
    options: [
      "Upload a PFX certificate file and bind it to the custom domain in App Service TLS/SSL settings",
      "Configure the App Service managed certificate (free) and it will automatically provision and renew",
      "Both A and B are valid approaches for binding TLS to a custom domain in App Service",
      "TLS is not supported on Standard tier; you need Premium tier"
    ],
    correct: [2],
    explanation: "Azure App Service supports multiple TLS/SSL certificate options:\n\n1. App Service Managed Certificate (free):\n   • Available for: Standard tier and above\n   • Automatically provisioned and renewed (90-day certs, auto-renewed at 30 days)\n   • Requirements: Custom domain must resolve to App Service (A or CNAME record)\n   • Limitations: Only for subdomains (www.contoso.com), not apex/root (contoso.com) without Azure Front Door\n\n2. Upload your own certificate:\n   • Upload PFX certificate (private key + certificate chain)\n   • App Service → TLS/SSL settings → Private Key Certificates (.pfx) → + Upload Certificate\n   • Bind to custom domain: Custom domains → click the domain → Add binding → Select certificate → SNI SSL\n\n3. App Service Certificate (purchase from Azure):\n   • Purchase wildcard or standard certificate from Azure\n   • Stored in Azure Key Vault\n   • Auto-renewal available\n\nBinding types:\n• SNI SSL: Server Name Indication — recommended for modern browsers; free to use; multiple certs per IP\n• IP SSL: One dedicated IP address per certificate; costs extra\n\nBoth option A (uploading a PFX) and option B (managed certificate) are valid and supported on Standard tier.\n\n• TLS IS supported on Standard tier — TLS requires Basic or above for uploads, Standard for managed certs",
    reference: "https://learn.microsoft.com/azure/app-service/configure-ssl-certificate"
  },

  {
    id: 329,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "You need to map the custom domain 'www.contoso.com' to your Azure App Service app. Which DNS records are required?",
    options: [
      "MX record pointing to the App Service default domain",
      "CNAME record for 'www' pointing to '<appname>.azurewebsites.net', plus a TXT record with the domain verification ID",
      "A record pointing to the App Service managed IP address, plus an MX record",
      "NS record delegating the entire contoso.com zone to Azure DNS"
    ],
    correct: [1],
    explanation: "To map www.contoso.com to App Service:\n\nStep 1 — Create DNS records:\n1. CNAME record: www → <appname>.azurewebsites.net\n   • Routes www.contoso.com traffic to App Service\n   • Azure Load Balancer handles IP changes automatically\n\n2. TXT record: asuid.www → <Custom-Domain-Verification-ID>\n   • Proves ownership of the domain\n   • Verification ID found in: App Service → Custom domains → + Add custom domain → View the ID\n\nStep 2 — Add domain in App Service:\n• App Service → Custom domains → + Add custom domain\n• Enter: www.contoso.com → Validate → Add\n\nApex/Root domain (contoso.com without www) — different approach:\n• Cannot use CNAME for root domain (RFC limitation)\n• Use: A record → App Service's outbound IP address + TXT record (asuid.contoso.com)\n• OR: Azure DNS Alias record (supports CNAME-like behavior for root in Azure DNS)\n\nNote: The custom domain must be added AND validated in App Service settings before TLS certificate can be bound.\n\n• MX records are for email routing — not for web hosting\n• App Service IPs can change over time — CNAME is better than A record for subdomains\n• NS delegation would hand control of the entire domain to Azure DNS — more than necessary",
    reference: "https://learn.microsoft.com/azure/app-service/app-service-web-tutorial-custom-domain"
  },

  {
    id: 330,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "Your App Service web application needs to access resources in an Azure Virtual Network, including a private Azure SQL Database and a private Redis Cache. The app should NOT be reachable from within the VNet. Which feature should you configure on the App Service?",
    options: [
      "App Service private endpoint — allows inbound traffic from VNet to the app",
      "App Service VNet Integration — allows outbound traffic from the app to VNet resources",
      "App Service Hybrid Connections — connects to on-premises TCP endpoints",
      "App Service Environment (ASE) — deploys the app inside the VNet"
    ],
    correct: [1],
    explanation: "App Service networking features:\n\nVNet Integration (outbound, App → VNet):\n• Allows the App Service to initiate connections TO resources in the integrated VNet\n• The app gets a subnet delegation and can reach private IPs in the VNet\n• Resources in VNet are accessible: private SQL, private Redis, private APIs\n• VMs, private endpoints, and other VNet resources are reachable\n• App is NOT exposed to VNet inbound traffic by this feature alone\n• Available from Standard tier and above (Regional VNet Integration)\n\nPrivate Endpoint (inbound, VNet → App):\n• Creates a private IP for the App Service IN the VNet\n• VNet resources can reach the app via private IP\n• Enables removing the app from the public internet\n• Does NOT help the app reach VNet resources\n\nFor this scenario:\n• Need: App → private SQL, App → private Redis (OUTBOUND from app to VNet)\n• NOT needed: VNet → App (inbound)\n→ VNet Integration is correct\n\n• Private endpoint is for INBOUND connections from VNet to the app\n• Hybrid Connections uses Azure Relay to connect to on-premises TCP endpoints over port 443 — not for Azure VNet\n• ASE deploys the app inside the VNet entirely — much more expensive, overkill for this scenario",
    reference: "https://learn.microsoft.com/azure/app-service/overview-vnet-integration"
  },

  {
    id: 331,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "You need to configure your App Service to scale out automatically based on CPU utilization. CPU > 70% for 5 minutes should trigger scale-out, and CPU < 25% for 10 minutes should trigger scale-in. Where do you configure this autoscale rule?",
    options: [
      "The individual App Service app → Scale out (App Service plan)",
      "The App Service plan → Scale out → Custom autoscale",
      "Azure Monitor → Alerts → Create rule",
      "The App Service app → Configuration → Application settings"
    ],
    correct: [1],
    explanation: "Autoscaling in App Service is configured on the APP SERVICE PLAN (not the individual app). All apps in the same plan share the autoscale configuration.\n\nConfiguration path: App Service Plan → Scale out (App Service plan) → Custom autoscale\n\nCreating autoscale rules:\n1. Scale out rule: When Percentage CPU > 70% for 5 minutes → Increase count by 1\n2. Scale in rule: When Percentage CPU < 25% for 10 minutes → Decrease count by 1\n3. Set instance limits: Minimum 1, Maximum 10, Default 2\n\nAutoscale concepts:\n• Cool-down period: Wait time after scaling before evaluating again (avoid thrashing)\n• Scale-out cool-down: Shorter (e.g., 5 min) to respond quickly to load\n• Scale-in cool-down: Longer (e.g., 20 min) to avoid premature scale-in\n\nAvailable metrics:\n• CPU Percentage, Memory Percentage, Disk Queue Length, HTTP Queue Length, Data In/Out\n• Custom Application Insights metrics\n\nScale UP vs Scale OUT:\n• Scale UP (vertical): Move to larger App Service plan tier (more CPU/RAM per instance)\n• Scale OUT (horizontal): Add more instances of the same plan — autoscale does this\n\n• The app blade doesn't have scale-out settings — it's on the plan\n• Azure Monitor alerts generate notifications but don't configure App Service autoscaling\n• Application settings are environment variables for the app — not for scaling",
    reference: "https://learn.microsoft.com/azure/azure-monitor/autoscale/autoscale-get-started"
  },

  {
    id: 332,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "You need to configure App Service backups for a web app that also uses an Azure SQL Database. Backups should run daily and be retained for 30 days. What are the requirements for configuring this?",
    options: [
      "The App Service plan must be Free tier or higher; backup is automatic once you specify a storage account",
      "The App Service plan must be Standard or Premium tier; configure a storage account and optionally include database connection strings for database backup",
      "App Service backup is only available through Azure Backup Recovery Services vault",
      "Backups run automatically and can only be enabled by Microsoft Support"
    ],
    correct: [1],
    explanation: "App Service Backup requirements:\n\nPlan tier requirement:\n• Standard or Premium tier ONLY (Basic and Free don't support backup)\n\nConfiguration:\n• App Service → Backups → Configure backup\n• Select storage account and container for backup storage\n• Set schedule (manual, hourly, daily)\n• Set retention (up to 10 years)\n\nWhat gets backed up:\n• App configuration\n• File content (everything in /home/site)\n• Database content (if configured)\n\nDatabase backup:\n• SQL Server (Azure SQL): Add connection string under 'Databases'\n• MySQL: Supported\n• PostgreSQL: Supported\n• Connection string type must be set to 'Custom'\n\nLimitations:\n• Total backup size: 10 GB (including linked databases)\n• Database backup max: 4 GB per database\n• App files max: ~10 GB\n\nRestore: App Service → Backups → Select backup → Restore\n\n• Free and Basic plans don't support backups\n• Backup is NOT automatic — requires explicit configuration\n• Azure Backup (Recovery Services vault) doesn't backup App Service apps\n• Microsoft Support doesn't need to be involved for backup configuration",
    reference: "https://learn.microsoft.com/azure/app-service/manage-backup"
  },

  {
    id: 333,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "You have an App Service web application running on the Standard S1 plan. The app experiences intermittent memory issues and crashes. You want to automatically restart the app process when it detects memory usage exceeds 1.5 GB, without requiring manual intervention. Which App Service feature handles automatic recovery from unhealthy states?",
    options: [
      "App Service autoscale — scales out when memory is high",
      "App Service auto-heal — monitors health and automatically triggers mitigation actions",
      "App Service health check — marks the instance as unhealthy",
      "Azure Monitor metric alert with Action Group to restart the app"
    ],
    correct: [1],
    explanation: "App Service Auto-Heal is a built-in mitigation feature that automatically takes actions when an app enters an unhealthy state.\n\nConfiguration: App Service → Diagnose and solve problems → Auto-Heal\nOr: App Service → Configuration → General settings → Auto Heal → On\n\nTrigger conditions:\n• Request count: Too many requests in a time window\n• Slow requests: Requests exceeding a latency threshold\n• HTTP error count: Too many 4xx or 5xx errors\n• Memory limit: Process private bytes exceeding a threshold (e.g., 1.5 GB)\n• Custom: Specific HTTP status codes or time durations\n\nMitigation actions:\n• Recycle: Restart the app process (most common)\n• Log event: Write to event log\n• Custom action: Run a custom executable or script\n• Slow link logging: Collect dumps for analysis\n\nFor memory > 1.5 GB → Recycle:\nThis automatically restarts the w3wp.exe process when private bytes exceed 1.5 GB.\n\n• Autoscale adds more instances but doesn't fix the memory issue on the current instance\n• Health check detects unhealthy instances for load balancer routing — can remove them, but doesn't fix memory issues\n• Azure Monitor alert + Action Group works but has more latency than built-in Auto-Heal",
    reference: "https://learn.microsoft.com/azure/app-service/configure-auto-heal"
  },

  {
    id: 334,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "You are deploying an App Service web application that must remain running 24/7. You notice the app is going to sleep when not accessed and takes 30+ seconds to respond to the first request. Which setting should you enable?",
    options: [
      "Scale up to a Premium tier plan to prevent idle shutdowns",
      "Enable 'Always On' in the App Service General settings",
      "Configure a CRON job to ping the app every 5 minutes",
      "Enable Application Insights continuous monitoring"
    ],
    correct: [1],
    explanation: "The 'Always On' setting prevents App Service from unloading the app's worker process during periods of inactivity.\n\nWithout Always On:\n• After 20 minutes of no requests, the w3wp.exe worker process is unloaded\n• Next request triggers a cold start: App restarts, initializes, then responds\n• Cold start can take 30+ seconds for .NET/Java apps\n• This is the default behavior on Basic tier and above\n\nWith Always On enabled:\n• App Service pings the app root URL (/) every 5 minutes to keep it warm\n• Worker process remains loaded\n• No cold starts\n\nConfiguration: App Service → Configuration → General settings → Always On → On\n\nAvailability:\n• Basic tier (B1) and above: Always On is available\n• Free (F1) and Shared (D1): Always On is NOT available\n\nAlternatives for warm-up:\n• Pre-warmed instances (Premium plan)\n• Minimum instance count set to 1+ on Consumption plan\n\n• Scale up doesn't prevent idle shutdowns — Always On must be explicitly enabled\n• CRON job pinging works but is a workaround; Always On is the native solution\n• Application Insights provides telemetry — doesn't prevent idle shutdowns",
    reference: "https://learn.microsoft.com/azure/app-service/configure-common"
  },

  {
    id: 335,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "You need to deploy a web application to App Service using a ZIP file containing your application code. Which deployment method directly deploys from a ZIP file without needing to configure deployment source credentials?",
    options: [
      "FTP deployment from the Azure portal",
      "ZIP deploy using the Kudu REST API or Azure CLI 'az webapp deploy'",
      "GitHub Actions deployment using a workflow file",
      "Visual Studio Publish wizard"
    ],
    correct: [1],
    explanation: "ZIP deployment is the simplest and most common deployment method for App Service:\n\nAzure CLI:\naz webapp deploy --resource-group RG1 --name myapp --src-path app.zip --type zip\n\nKudu REST API (direct):\ncurl -X POST 'https://myapp.scm.azurewebsites.net/api/zipdeploy' --user 'user:password' --data-binary @app.zip\n\nBenefits of ZIP deploy:\n• Simple: Just package your app as a ZIP and deploy\n• Fast: Direct deployment without build steps\n• No persistent deployment source needed\n• Works with CI/CD pipelines\n• Overwrites all files atomically\n\nZIP deploy behavior:\n• Uses Run-From-Package (WEBSITE_RUN_FROM_PACKAGE=1) by default on Windows — app runs directly from the ZIP\n• Or extracts to /home/site/wwwroot\n• Restarts the app after deployment\n\nOther deployment methods:\n• FTP: Upload files directly; requires FTP credentials; less secure\n• GitHub Actions: CI/CD pipeline — more complex setup but provides build + test + deploy\n• Visual Studio Publish: Good for development but requires Visual Studio installation\n\n• FTP is available but requires configuring deployment credentials and is slower/less secure\n• GitHub Actions is for CI/CD pipeline — requires GitHub repository and workflow setup\n• Visual Studio is a full IDE deployment — not a lightweight ZIP deployment method",
    reference: "https://learn.microsoft.com/azure/app-service/deploy-zip"
  },

  {
    id: 336,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    question: "You have a mission-critical application that must run in a fully isolated App Service Environment (ASE) with no shared infrastructure. The ASE should be completely private with no inbound internet access. Which ASE type should you deploy?",
    options: [
      "External ASE — provides isolation with a public load balancer for inbound traffic",
      "Internal Load Balancer (ILB) ASE — all inbound traffic uses a private IP within your VNet",
      "Standard App Service with private endpoint and VNet integration",
      "App Service Premium v3 plan with zone redundancy"
    ],
    correct: [1],
    explanation: "App Service Environment (ASE) types:\n\nExternal ASE:\n• Internet-facing load balancer with public IP\n• App Service apps accessible from the internet (and from VNet)\n• DNS: <appname>.<ase-name>.p.azurewebsites.net\n• Inbound traffic: From internet + VNet\n\nInternal Load Balancer (ILB) ASE:\n• Uses an internal private IP from your VNet for the load balancer\n• NO public internet access to apps\n• All inbound traffic: Only from VNet or connected networks (ExpressRoute, VPN)\n• DNS: Requires custom DNS configuration (private DNS zone)\n• Complete network isolation — ideal for compliance requirements\n• Can use WAF/Azure Firewall in front for controlled external access\n\nASEv3 (current version):\n• Supports both External and ILB modes\n• Zone redundancy supported\n• Isolated v2 (Iv2) plans: I1v2, I2v2, I3v2\n• No ingress/egress stamp fee (unlike ASEv2)\n\nFor completely private with no inbound internet:\n• ILB ASE is the correct choice\n\n• External ASE has a public IP — not fully private\n• Standard App Service with private endpoint restricts inbound but still runs on shared infrastructure\n• Premium v3 plan with zone redundancy provides HA but on shared infrastructure",
    reference: "https://learn.microsoft.com/azure/app-service/environment/networking"
  }

]); // end QUESTIONS.push
