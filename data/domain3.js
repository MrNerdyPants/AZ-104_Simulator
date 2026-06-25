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


// ─── Microsoft Practice Assessment — Domain 3 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 351,
    domain: 3,
    subdomain: "ARM Templates",
    type: "single",
    source: "MS Practice Assessment",
    question: "Your company has a set of resources deployed to an Azure subscription. The resources are deployed to a resource group named app-grp1 by using Azure Resource Manager (ARM) templates.\nYou need to verify the date and the time that the resources in app-grp1 were created.\nWhich blade should you review for app-grp1 in the Azure portal?",
    options: [
      "Deployments",
      "Diagnostics setting",
      "Deployment stacks",
      "Policy"
    ],
    correct: [0],
    explanation: "On the Deployments blade for the resource group (app-grp1), all the details related to a deployment, such as the name, status, date last modified, and duration, are visible.\n\nNavigating to the Diagnostics settings blade provides the ability to diagnose errors or review warnings. Navigating to the Policy blade only provides information related to the policies enforced on the resource group."
  },
  {
    id: 352,
    domain: 3,
    subdomain: "ARM Templates",
    type: "single",
    source: "MS Practice Assessment",
    question: "You are an Azure Administrator for Best For You Organics Company.\nThe company uses ARM templates for deploying resources.\nYou need to pass an array as an inline parameter during the deployment of the ARM template.\nWhat should you do?",
    options: [
      "Modify the template to include the array values.",
      "Use the --template-file switch to pass the array values.",
      "Provide the array values in the --parameters switch in the deployment command.",
      "Create a separate parameters file that includes the array values."
    ],
    correct: [2],
    explanation: "To pass an array as an inline parameter during the deployment of a local template, you should provide the array values in the --parameters switch in the deployment command. The other options are not correct methods for passing an array as an inline parameter."
  },
  {
    id: 353,
    domain: 3,
    subdomain: "VM Availability",
    type: "single",
    source: "MS Practice Assessment",
    question: "You are deploying a virtual machine by using an availability set in the East US Azure region.\nYou have deployed 18 virtual machines in two fault domains and 10 update domains.\nMicrosoft performed planned physical hardware maintenance in the East US region.\nWhat is the maximum number of virtual machines that will be unavailable?",
    options: [
      "2",
      "8",
      "9",
      "18"
    ],
    correct: [0],
    explanation: "18 virtual machines are shared across 10 update domains. The first 10 virtual machines go to 10 update domains, so eight update domains will have two virtual machines. When there is physical hardware maintenance, some virtual machines will be unavailable based on their configuration (one update domain is rebooted at a time, so a maximum of two virtual machines are affected). If there was a rack failure, then 18 virtual machines would be distributed to two fault domains with nine virtual machines each."
  },
  {
    id: 354,
    domain: 3,
    subdomain: "Virtual Machines",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You plan to deploy an Azure virtual machine.\nYou are evaluating whether to use an Azure Spot instance.\nWhich two factors can cause an Azure Spot instance to be evicted? Each correct answer presents a complete solution.",
    options: [
      "the average CPU usages of the instance",
      "the Azure capacity needs",
      "the current price of the instance",
      "the time of day"
    ],
    correct: [1, 2],
    explanation: "Azure Spot instances allow you to provision virtual machines at a reduced cost, but these virtual machines can be stopped by Azure when Azure needs the capacity for other pay-as-you-go workloads, or when the price of the spot instance exceeds the maximum price that you have set. These virtual machines are good for dev, testing, or for workloads that do not require any specific SLA."
  },
  {
    id: 355,
    domain: 3,
    subdomain: "Containers",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains an Azure Storage account named vmstorageaccount1.\nYou create an Azure container instance named container1.\nYou need to configure persistent storage for container1.\nWhat should you create in vmstorageaccount1?",
    options: [
      "a blob container",
      "a file share",
      "a queue",
      "a table"
    ],
    correct: [1],
    explanation: "An Azure container instance (Docker container) can mount Azure File Storage shares as directories and use them as persistent storage. An Azure container instance cannot mount and use as persistent storage blob containers, queues and tables."
  },
  {
    id: 356,
    domain: 3,
    subdomain: "Containers",
    type: "multi",
    source: "MS Practice Assessment",
    question: "Your company has an Azure subscription that is linked to a Microsoft Entra tenant.\nYou have been asked to limit the access to the Kubernetes API server.\nWhich two options should you choose? Each correct answer presents a complete solution.",
    options: [
      "API server authorized IP ranges",
      "public cluster",
      "private cluster",
      "Azure tags"
    ],
    correct: [0, 2],
    explanation: "You can use API server authorized IP ranges if you want to maintain a public endpoint for the API server but restrict access to a set of trusted IP ranges. You can use a private cluster if you want to limit the API server to only be accessible from within your virtual network."
  },
  {
    id: 357,
    domain: 3,
    subdomain: "App Service",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a Docker container image named container1.\nYou plan to create a new Azure App Service web app named WebApp1.\nYou need to ensure that you can use container1 for WebApp1.\nWhich WebApp1 setting should you configure?",
    options: [
      "Continuous deployment",
      "Pricing plan",
      "Publish",
      "Runtime stack"
    ],
    correct: [2],
    explanation: "If you want to run a Docker container as an Azure web service, you must configure the Publish option and select Docker container.\n\nRuntime stack specifies the stack that you want to use for the web app. If you want to deploy a Docker container as web app, the runtime stack option is unavailable. Pricing plan specifies the location, features, and costs of the web app. Continuous deployment is a strategy for software releases. This option is unavailable when you publish a Docker container as an Azure web app."
  },
  {
    id: 358,
    domain: 3,
    subdomain: "Containers",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains an Azure container app named cont1.\nYou plan to add scaling rules to cont1.\nYou need to ensure that cont1 replicas are created based on received messages in Azure Service Bus.\nWhich scale trigger should you use?",
    options: [
      "CPU usage",
      "event-driven",
      "HTTP traffic",
      "memory usage"
    ],
    correct: [1],
    explanation: "Azure Container Apps allows a set of triggers to create new instances, called replicas. For Azure Service Bus, an event-driven trigger can be used to run the scaling method. The remaining scale triggers cannot use a scale rule based on messages in an Azure Service Bus."
  },
  {
    id: 359,
    domain: 3,
    subdomain: "Containers",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a container app named App1. App1 is configured to use cached data.\nYou plan to create a new container.\nYou need to ensure that the new container automatically refreshes the cache used by App1.\nWhich type of container should you configure?",
    options: [
      "blob",
      "init",
      "privileged",
      "sidecar"
    ],
    correct: [3],
    explanation: "Azure Container Apps manages the details of Kubernetes and container orchestration. Containers in Azure Container Apps can use any runtime, programming language, or development stack of your choice. You can define multiple containers in a single container app to implement the sidecar pattern, for example, an agent that reads logs from the primary app container in a shared volume and forwards them to a logging service. A sidecar container can also be used to refresh a cache used by the main app container."
  },
  {
    id: 360,
    domain: 3,
    subdomain: "App Service",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains multiple resource groups and Azure App Service web apps. A resource group named RG1 hosts a web app named appservice1.\nThe App Service uses an SSL certificate.\nYou create a resource group named RG2.\nYou plan to move all the resources in RG1 to RG2.\nWhich two actions should you perform? Each correct answer presents part of the solution.",
    options: [
      "Create a new App Service plan in RG2.",
      "Create a new web app in RG2.",
      "Delete the SSL certificate from RG1 and upload it to RG2.",
      "Move all the resources from RG1 to RG2."
    ],
    correct: [2, 3],
    explanation: "App Service SSL certificates cannot be moved between resource groups together with the other App Service resources. The SSL certificate must be deleted from RG1 and uploaded again to RG2. You then move all the other resources from RG1 to RG2."
  },
  {
    id: 361,
    domain: 3,
    subdomain: "App Service",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have a Basic Azure App Service plan that contains a web app.\nYou need to ensure that the web app can scale automatically when the CPU usage is over 80% for a duration of 15 minutes.\nWhich two actions should you perform? Each correct answer presents part of the solution.",
    options: [
      "Configure a deployment slot.",
      "Configure a scaling condition to scale based on a metric, and then add the rules.",
      "Configure a scaling condition to scale based on an instance count, and then set the instance count.",
      "Scale out the App Service plan.",
      "Scale up the App Service plan."
    ],
    correct: [1, 4],
    explanation: "The Basic App Service plan does not support automatic scaling - you must scale up the plan to Premium (or higher) to support automatic scaling. After that you must configure a scaling condition, based on a metric (CPU), which will automatically trigger scaling (out) of the App Service web app."
  },
  {
    id: 362,
    domain: 3,
    subdomain: "App Service",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains an App Service web app named App1.\nYou configure App1 with a custom domain name of webapp1.contoso.com.\nYou need to create a DNS record for App1. The solution must ensure that App1 remains accessible if the IP address changes.\nWhich type of DNS record should you create?",
    options: [
      "A",
      "CNAME",
      "SOA",
      "SRV",
      "TXT"
    ],
    correct: [1],
    explanation: "For web apps, you create either an A (Address) record or a CNAME (Canonical Name) record. An A record maps a domain name to an IP address. A CNAME record maps a domain name to another domain name. DNS uses the second name to look up the address. Users still see the first domain name in their browser. If the IP address changes, a CNAME entry is still valid, whereas an A record must be updated."
  },
  {
    id: 363,
    domain: 3,
    subdomain: "ARM Templates",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a resource group named RG1.\nYou have an Azure Resource Manager (ARM) template for an Azure virtual machine.\nYou need to use PowerShell to provision a virtual machine in RG1 by using the template.\nWhich PowerShell cmdlet should you run?",
    options: [
      "New-AzResourceGroupDeployment",
      "New-AzSubscriptionDeployment",
      "New-AzManagementGroupDeployment",
      "New-AzVM"
    ],
    correct: [0],
    explanation: "Virtual machines are deployed to resource groups, so you must run the New-AzResourceGroupDeployment cmdlet. You cannot deploy virtual machines to subscriptions or management groups directly, therefore, New-AzManagementGroupDeployment and New-AzSubscriptionDeployment cannot be used. New-AzVM can be used to provision a new virtual machine, but without using a template."
  },
  {
    id: 364,
    domain: 3,
    subdomain: "VM Availability",
    type: "single",
    source: "MS Practice Assessment",
    question: "Your company plans to host an application on four Azure virtual machines.\nYou need to ensure that at least two virtual machines are available if a single Azure datacenter fails.\nWhich availability option should you select for the virtual machine?",
    options: [
      "an availability zone",
      "an availability set",
      "a scale set with a single placement group",
      "a proximity placement group"
    ],
    correct: [0],
    explanation: "To protect against datacenter level failures, and if you want connectivity to multiple machines, you must ensure that the virtual machines are deployed across various availability zones. An availability zone is a physically separate datacenter within an Azure region, so distributing the virtual machines across zones keeps machines available even if one datacenter fails. Availability sets only protect against rack/hardware failures within a single datacenter, and proximity placement groups are used to reduce latency by keeping resources close together."
  },
  {
    id: 365,
    domain: 3,
    subdomain: "Virtual Machines",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure virtual machine.\nYou receive a notification that the virtual machine is going to be affected by an underlying maintenance activity on the physical infrastructure.\nYou need to move the virtual machine to a different host to avoid a service interruption.\nWhat should you do?",
    options: [
      "Redeploy the virtual machine.",
      "Resize the virtual machine.",
      "Reapply the virtual machine.",
      "Restart the virtual machine."
    ],
    correct: [0],
    explanation: "You must redeploy the virtual machine, which can move the virtual machine to a different host. Azure will shut down the virtual machine and move the virtual machine to a new node within the Azure infrastructure. Restarting or reapplying the virtual machine keeps it on the same host, and resizing changes the VM size rather than guaranteeing a move to a new host."
  },
  {
    id: 366,
    domain: 3,
    subdomain: "App Service",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains an Azure App Service web app named App1.\nYou have the following diagnostic logging configurations:\nApplication Logging (FileSystem): Error\nApplication Logging (Blob): Information\nDetailed Error Message: Warning\nWeb Server Logging: Verbose\nYou need to configure diagnostic logging to store all warnings or higher.\nWhich types of diagnostic logging and severity should you enable?",
    options: [
      "Application Logging (Blob)",
      "Application Logging (FileSystem)",
      "Web Server Logging",
      "Warning",
      "Information"
    ],
    correct: [0, 3],
    explanation: "You must enable the Application Logging (Blob) diagnostic, which can be stored for more than a week. You must also set the severity level to Warning, to store warning, error, and critical log messages. Application Logging (FileSystem) is intended for short-term, temporary debugging and is automatically turned off after 12 hours, so it is not suitable for storing logs over time."
  },
  {
    id: 367,
    domain: 3,
    subdomain: "ARM Templates",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure Resource Manager (ARM) template named deploy.json that is stored in an Azure Blob storage container.\nYou plan to deploy the template by running the New-AzDeployment cmdlet.\nWhich parameter should you use to reference the template?",
    options: [
      "-TemplateUri",
      "-TemplateFile",
      "-TemplateSpecId",
      "-TemplateParameterFile"
    ],
    correct: [0],
    explanation: "The PowerShell deployment cmdlets can be used to deploy JSON templates that are stored locally, in a resource group as a template spec, or from a web-based location. You can use the -TemplateUri parameter to specify a web-based location, such as GitHub or an Azure Blob Storage account. You can use -TemplateFile to specify a local file. You can use -TemplateSpecId to specify a template that was saved to Azure as a template spec."
  },
  {
    id: 368,
    domain: 3,
    subdomain: "ARM Templates",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure Resource Manager (ARM) template named Template1 that is used to deploy Azure virtual machines.\nTemplate1 contains the following text.\n\"resources\": [ { \"type\": \"Microsoft.Compute/virtualMachines\", \"apiVersion\": \"2025-04-01\", \"name\": \"[parameters('vmName')]\", \"location\": \"[resourceGroup().location]\", \"properties\": { <text removed> } } ]\nYou need to deploy two Azure virtual machines by using Template1.\nWhat should you add to Template1?",
    options: [
      "a copy element",
      "a newer apiVersion value",
      "a hardcoded subscription ID",
      "a second location property"
    ],
    correct: [0],
    explanation: "The correct solution is to add a copy element, because ARM templates use the copy property to deploy multiple instances of a resource, such as two virtual machines, in a single deployment. The API version is already specified in the template and does not control the number of resources deployed. The subscription ID is never hardcoded in ARM templates since deployments are scoped to a subscription, and the resource group location is already provided through \"[resourceGroup().location]\". Therefore, only the copy element enables the template to create two virtual machines from a single resource definition."
  },
  {
    id: 369,
    domain: 3,
    subdomain: "App Service",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription.\nYou plan to deploy a web app in a Linux-based Docker container.\nYou need to recommend a solution for the deployment of the web app that meets the following requirements:\nSupports a custom domain name\nProvides the ability to scale out automatically based on demand\nMinimizes administrative effort\nMinimizes costs\nWhich solution should you recommend?",
    options: [
      "Azure App Service",
      "Azure Virtual Machine Scale Sets",
      "Azure Kubernetes Service (AKS)",
      "Azure Container Instances"
    ],
    correct: [0],
    explanation: "Azure App Service fulfills all the stated requirements: it supports custom domain names, provides automatic scale out based on demand, minimizes administrative effort as a fully managed platform, and minimizes costs. Azure Virtual Machine Scale Sets, Azure Kubernetes Service (AKS), and Azure Container Instances are more difficult to administer and more costly."
  }
]);


// ─── Original Practice Questions — Domain 3 ───
QUESTIONS.push.apply(QUESTIONS, [

  {
    id: 370,
    domain: 3,
    subdomain: "Custom Images and Shared Image Gallery",
    type: "single",
    source: "Original Practice",
    question: "You have configured a Windows VM with applications and settings that you want to reuse as a template for deploying many identical VMs. Before capturing the VM as a managed image, which tool must you run inside the guest OS to remove machine-specific information?",
    options: [
      "Disk Cleanup (cleanmgr.exe)",
      "Sysprep with the /generalize option",
      "DiskPart with the 'clean all' command",
      "waagent -deprovision"
    ],
    correct: [1],
    explanation: "Before capturing a Windows VM as a generalized image, you must run Sysprep (System Preparation Tool) with the /generalize option from inside the VM.\n\nSysprep removes machine-specific information so the image can be reused safely:\n• Removes the computer SID (Security Identifier)\n• Removes the computer name\n• Removes other unique identifiers\n• Resets Windows activation\n\nTypical command:\n%WINDIR%\\system32\\sysprep\\sysprep.exe /oobe /generalize /shutdown\n\nThen in Azure:\n1. Deallocate the VM\n2. Mark the VM as generalized (az vm generalize / Set-AzVm -Generalized)\n3. Capture the managed image or create an image version in a Shared Image Gallery (Azure Compute Gallery)\n\nLinux equivalent: waagent -deprovision+user removes machine-specific data on Linux VMs.\n\n• Disk Cleanup only removes temporary files — it does not generalize the OS\n• DiskPart 'clean all' wipes a disk — destructive and unrelated to image capture\n• waagent is the Linux VM agent tool, not used on Windows VMs",
    reference: "https://learn.microsoft.com/azure/virtual-machines/windows/capture-image-resource"
  },

  {
    id: 371,
    domain: 3,
    subdomain: "Custom Images and Shared Image Gallery",
    type: "single",
    source: "Original Practice",
    question: "Your team manages a custom VM image used across East US, West Europe, and Southeast Asia. You need to store the image once, replicate it to all three regions, and keep multiple versions for rollback. Which Azure service should you use?",
    options: [
      "A standalone managed image resource",
      "Azure Compute Gallery (Shared Image Gallery)",
      "Azure Container Registry with geo-replication",
      "An Azure Storage account with a generalized VHD"
    ],
    correct: [1],
    explanation: "Azure Compute Gallery (formerly Shared Image Gallery) is purpose-built for managing, sharing, and distributing custom VM images at scale.\n\nKey features:\n• Image definitions: Logical grouping (publisher/offer/SKU, OS type, generation)\n• Image versions: Multiple immutable versions (e.g., 1.0.0, 1.0.1) for rollback\n• Global replication: Replicate each version to multiple regions automatically\n• Replica scaling: Set the number of replicas per region for high-volume deployments\n• Sharing: Share across subscriptions, tenants, or with RBAC / community galleries\n• Supports both specialized and generalized images, plus VM applications\n\nHierarchy: Gallery → Image Definition → Image Version\n\n• A standalone managed image lives in a single region and has no versioning or built-in multi-region replication\n• Azure Container Registry geo-replicates container images, not VM images\n• A Storage account with a VHD has no versioning, replication management, or definition structure",
    reference: "https://learn.microsoft.com/azure/virtual-machines/azure-compute-gallery"
  },

  {
    id: 372,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    source: "Original Practice",
    question: "You are deploying stateless VMs from a Shared Image Gallery image. The VMs are frequently re-imaged and you want to avoid the cost of a separate managed OS disk and reduce reimage/boot time. Which OS disk option should you select?",
    options: [
      "Premium SSD managed OS disk with read/write host caching",
      "Ephemeral OS disk stored on the local VM host",
      "Ultra Disk for the OS disk",
      "Standard HDD managed OS disk with no caching"
    ],
    correct: [1],
    explanation: "Ephemeral OS disks are created on the local VM host storage (not saved to Azure Storage as a managed disk).\n\nBenefits:\n• No storage cost for the OS disk — it uses the VM's local/cache disk\n• Lower read/write latency (local storage)\n• Very fast reset/reimage to the original boot image\n• Ideal for stateless workloads, scale sets, and frequently re-imaged VMs\n\nLimitations:\n• Data is LOST if the VM is stopped/deallocated, fails, or is moved to another host\n• Cannot be detached or used for OS disk snapshots/backup\n• Disk size limited by the VM's cache or temp disk size\n• Not suitable for stateful workloads needing OS-disk persistence\n\n• A Premium SSD managed OS disk persists data but incurs storage cost and is slower to reimage\n• Ultra Disk is high-performance but cannot be used as an OS disk and is expensive\n• Standard HDD managed OS disk also incurs cost and offers low performance",
    reference: "https://learn.microsoft.com/azure/virtual-machines/ephemeral-os-disks"
  },

  {
    id: 373,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    source: "Original Practice",
    question: "A high-performance computing application requires the lowest possible network latency between a group of VMs that must communicate with each other intensively. The VMs are in the same region. Which feature should you configure to colocate the VMs as close together as possible in the datacenter?",
    options: [
      "Availability Zones spanning the region",
      "A Proximity Placement Group (PPG)",
      "Accelerated networking on each NIC",
      "An Availability Set with 3 fault domains"
    ],
    correct: [1],
    explanation: "A Proximity Placement Group (PPG) is a logical grouping that ensures Azure compute resources are physically located close to each other, minimizing network latency between them.\n\nUse cases:\n• High-performance computing (HPC) clusters\n• Latency-sensitive multi-tier applications (app tier close to database tier)\n• Workloads requiring tight VM-to-VM communication\n\nHow it works:\n• The first VM placed in the PPG anchors the physical location\n• Subsequent VMs are placed in the same datacenter/network proximity\n• Best practice: deploy all VMs/the anchor at the same time to avoid allocation failures\n\nNote: Tighter colocation reduces availability options (fewer zones/fault domains available together), so there is a latency-vs-resiliency tradeoff.\n\n• Availability Zones spread VMs across separate datacenters — this INCREASES latency (up to ~2ms), the opposite of the goal\n• Accelerated networking reduces per-packet overhead on a NIC but does not control physical placement\n• An Availability Set spreads VMs across racks for resiliency, not for minimal latency colocation",
    reference: "https://learn.microsoft.com/azure/virtual-machines/co-location"
  },

  {
    id: 374,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "yesno",
    source: "Original Practice",
    scenario: "You have a Generation 1 Windows VM running in Azure. A new workload requires features that are only supported on Generation 2 VMs, such as larger OS disks (>2 TB) and UEFI-based boot needed for Trusted Launch.",
    question: "You can convert the existing Generation 1 VM to Generation 2 in place by changing a setting in the Azure portal VM blade.",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "No — you cannot directly change a VM's generation in the Azure portal as a simple setting.\n\nGeneration facts:\n• Generation 1 (Gen1): BIOS-based boot, broad OS support\n• Generation 2 (Gen2): UEFI-based boot, supports OS disks larger than 2 TB, Trusted Launch (Secure Boot + vTPM), Confidential VMs\n\nAzure does support a Gen1-to-Gen2 conversion, but it is performed via a guided process/tooling (for example, the Hyper-V Gen Conversion guidance or upgrading the image), not a one-click region/portal property on the running VM. The VM generation is fundamentally tied to the image the VM was deployed from.\n\nThe common, supported approach is:\n• Deploy a NEW VM from a Generation 2 image (or a Gen2 image version in the Compute Gallery), then migrate the workload/data\n\nBecause the statement claims an in-place portal toggle exists, the correct answer is No.\n\nTrusted Launch (Secure Boot + vTPM) requires Generation 2 VMs — another reason new Gen2 deployments are recommended.",
    reference: "https://learn.microsoft.com/azure/virtual-machines/generation-2"
  },

  {
    id: 375,
    domain: 3,
    subdomain: "Create and Configure Virtual Machines",
    type: "single",
    source: "Original Practice",
    question: "You run a critical production VM that must be guaranteed compute capacity in the East US region so that a future stop/start or scale event never fails due to a capacity shortage. The VM is NOT a Spot VM and you do not want a long-term price discount commitment. What should you create?",
    options: [
      "A Reserved VM Instance for 1 year",
      "An On-demand Capacity Reservation in East US for the required VM size",
      "An Availability Set with the maximum fault domain count",
      "A Dedicated Host in East US"
    ],
    correct: [1],
    explanation: "On-demand Capacity Reservations reserve compute capacity for a specific VM size in a specific region (and optionally a zone) for as long as you keep the reservation, with no long-term term commitment.\n\nKey points:\n• Guarantees capacity is available so allocation (start, autoscale, redeploy) does not fail due to regional shortages\n• Billed at the pay-as-you-go rate for the reserved capacity whether or not VMs are using it\n• No 1- or 3-year term commitment (unlike Reserved Instances)\n• Can be associated/disassociated with VMs and scale sets\n• Can be combined with Reserved Instances for cost savings on guaranteed capacity\n\n• A Reserved VM Instance gives a price discount for a 1- or 3-year commitment — the scenario explicitly rules out a long-term commitment, and an RI alone does not strictly guarantee capacity unless paired with a capacity reservation\n• An Availability Set provides fault isolation, not guaranteed allocation capacity\n• A Dedicated Host gives physical isolation but is expensive and overkill for a single VM's capacity guarantee",
    reference: "https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-overview"
  },

  {
    id: 376,
    domain: 3,
    subdomain: "ARM Templates and Bicep",
    type: "single",
    source: "Original Practice",
    question: "You want to package an ARM/Bicep template as a versioned, shareable resource in your Azure subscription so that team members can deploy a standardized VM configuration via RBAC without needing access to the raw template files. Which Azure feature should you use?",
    options: [
      "A Bicep module stored in a local folder",
      "A Template Spec",
      "An Azure DevOps artifact feed",
      "A deployment script resource"
    ],
    correct: [1],
    explanation: "A Template Spec is an Azure resource that stores an ARM/Bicep template in your subscription for controlled, versioned, RBAC-governed reuse.\n\nBenefits:\n• Stored as a first-class Azure resource (Microsoft.Resources/templateSpecs)\n• Versioning: multiple versions can be kept (e.g., 1.0, 2.0)\n• RBAC: grant users 'Reader' to deploy without giving access to the underlying template text/files\n• Deployment: az deployment group create --template-spec <resourceId>\n• Keeps a single, governed source of truth for standardized deployments\n\nCreate example:\naz ts create --name vmSpec --version 1.0 --resource-group RG1 --location eastus --template-file vm.bicep\n\n• A Bicep module in a local folder is reusable code, but it is not a centrally stored, RBAC-controlled, versioned Azure resource\n• An Azure DevOps artifact feed stores build packages, not Azure-native deployable templates with RBAC\n• A deployment script resource runs scripts during deployment — it does not package/share a template",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/templates/template-specs"
  },

  {
    id: 377,
    domain: 3,
    subdomain: "ARM Templates and Bicep",
    type: "single",
    source: "Original Practice",
    question: "In a Bicep file you want to deploy a reusable networking component defined in a separate file named 'network.bicep' and pass it parameters. Which Bicep construct references and deploys that separate file?",
    options: [
      "An 'import' statement",
      "A 'module' declaration that points to './network.bicep'",
      "A 'resource' declaration with type 'Microsoft.Resources/deployments'",
      "An 'existing' resource reference"
    ],
    correct: [1],
    explanation: "Bicep uses the 'module' keyword to deploy a separate Bicep file as a reusable component and to pass parameters into it.\n\nSyntax:\nmodule net './network.bicep' = {\n  name: 'networkDeploy'\n  params: {\n    vnetName: 'vnet1'\n    addressPrefix: '10.0.0.0/16'\n  }\n}\n\nBenefits:\n• Encapsulation and reuse of common infrastructure\n• Each module becomes a nested deployment under the parent\n• Outputs from a module can be consumed: net.outputs.subnetId\n\n• 'import' is used to bring in shared types/functions or namespaces (e.g., user-defined types), not to deploy another template file\n• Writing a raw Microsoft.Resources/deployments resource is the verbose ARM-JSON nested-template approach — Bicep's 'module' is the idiomatic, cleaner construct\n• 'existing' references an already-deployed resource to read its properties — it does not deploy a separate file",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/bicep/modules"
  },

  {
    id: 378,
    domain: 3,
    subdomain: "Provision and Manage Containers",
    type: "single",
    source: "Original Practice",
    question: "You deploy an Azure Container Instances (ACI) container group that pulls an image from a private Azure Container Registry. The deployment fails with an authentication error when pulling the image. What is the most appropriate way to allow ACI to authenticate to the private ACR?",
    options: [
      "Make the ACR repository publicly anonymous-pull enabled",
      "Provide registry credentials (the ACR login server, username, and password) or use a managed identity when creating the container group",
      "Place the ACI and ACR in the same resource group so authentication is automatic",
      "Open inbound port 443 on the ACR firewall for the ACI public IP"
    ],
    correct: [1],
    explanation: "When ACI pulls an image from a private registry, it must authenticate. You supply registry credentials or use a managed identity at container-group creation time.\n\nUsing credentials (CLI):\naz container create --resource-group RG1 --name app1 --image myacr.azurecr.io/app:v1 \\\n  --registry-login-server myacr.azurecr.io \\\n  --registry-username <user> --registry-password <password>\n\nRecommended (managed identity): assign the container group a managed identity and grant it the AcrPull role on the registry, avoiding stored passwords. (Note: ACI managed-identity image pull has specific support requirements; service principal/admin credentials are the broadly supported method.)\n\n• Enabling anonymous pull works technically but exposes images publicly — a security risk and not appropriate for a private registry\n• Being in the same resource group does NOT grant automatic image-pull authentication\n• ACR access is controlled by RBAC/credentials, not by opening a port for the ACI public IP",
    reference: "https://learn.microsoft.com/azure/container-instances/container-instances-using-azure-container-registry"
  },

  {
    id: 379,
    domain: 3,
    subdomain: "Provision and Manage Containers",
    type: "multi",
    source: "Original Practice",
    question: "You are deploying a multi-container application to a single Azure Container Instances (ACI) container group. Which TWO statements about ACI container groups are correct? Each correct answer presents a complete solution.",
    options: [
      "All containers in the group share the same lifecycle, local network, and (optionally) mounted volumes",
      "Containers in the same group share a single public IP address and DNS name label",
      "Each container in the group is automatically assigned its own separate public IP address",
      "A container group can automatically scale out to multiple replicas based on CPU usage",
      "Containers in the group are scheduled on different physical hosts for high availability"
    ],
    correct: [0, 1],
    explanation: "An ACI container group is the top-level resource in ACI and is analogous to a Kubernetes pod: a collection of containers scheduled on the same host machine.\n\nTrue statements:\n• Shared lifecycle, local network, and storage: All containers in the group start/stop together, can reach each other over localhost, and can mount the same Azure Files volumes\n• Shared networking identity: The group exposes a single public IP address and an optional DNS name label; containers expose different ports behind that one IP\n\nWhy the others are wrong:\n• Containers do NOT each get their own separate public IP — the IP belongs to the group\n• ACI does NOT provide built-in autoscaling/replica management based on CPU — use Azure Container Apps or AKS for autoscaling\n• Containers in a group are co-scheduled on the SAME host (not spread for HA) — that co-location is what enables shared localhost networking and volumes",
    reference: "https://learn.microsoft.com/azure/container-instances/container-instances-container-groups"
  },

  {
    id: 380,
    domain: 3,
    subdomain: "Provision and Manage Containers",
    type: "single",
    source: "Original Practice",
    question: "You have deployed an application to Azure Container Apps with two revisions. You released a new revision and want to send 20% of incoming HTTP traffic to it while keeping 80% on the previous stable revision, to validate the change gradually. What must you configure?",
    options: [
      "Set the container app to single revision mode and restart it",
      "Enable multiple revision mode and configure traffic splitting weights across the two revisions",
      "Create a deployment slot and perform a slot swap",
      "Scale the new revision to 0 replicas and the old revision to maximum replicas"
    ],
    correct: [1],
    explanation: "Azure Container Apps supports revisions — immutable snapshots of a container app version. To split traffic between revisions you must use multiple revision mode and assign traffic weights.\n\nSteps:\n• Set the app to 'Multiple' revision mode (Single mode keeps only one active revision serving 100%)\n• Configure ingress traffic weights, e.g., revision-1 = 80, revision-2 = 20\n• This enables canary / blue-green / A-B testing patterns\n\nExample (CLI):\naz containerapp ingress traffic set --name app1 --resource-group RG1 \\\n  --revision-weight <revision1>=80 <revision2>=20\n\n• Single revision mode allows only one active revision, so traffic cannot be split\n• Deployment slots and slot swaps are an Azure App Service feature, not Container Apps — Container Apps uses revisions for this\n• Manipulating replica counts changes scale, not the percentage of HTTP traffic routed to each revision",
    reference: "https://learn.microsoft.com/azure/container-apps/revisions"
  },

  {
    id: 381,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "single",
    source: "Original Practice",
    question: "Your App Service web app on a Premium v3 plan must read database connection strings and API keys from Azure Key Vault without storing any secrets in the app's application settings or code. What is the recommended way to achieve this?",
    options: [
      "Copy the secret values into the app's Application settings and mark them as slot settings",
      "Use a Key Vault reference in app settings combined with a managed identity that has 'get' permission on the Key Vault secrets",
      "Embed the Key Vault access key in the application's web.config file",
      "Grant the App Service plan a service principal password stored in code"
    ],
    correct: [1],
    explanation: "App Service supports Key Vault references in application settings and connection strings. The value is stored in Key Vault, and App Service resolves it at runtime.\n\nHow it works:\n1. Enable a managed identity (system-assigned or user-assigned) on the web app\n2. Grant that identity access to read secrets (Key Vault access policy 'Get' for secrets, or 'Key Vault Secrets User' RBAC role)\n3. Set an app setting value to a reference:\n   @Microsoft.KeyVault(SecretUri=https://myvault.vault.azure.net/secrets/DbConn/)\n4. App Service fetches the secret using the managed identity — no secret value is stored in the app config or code\n\nBenefits:\n• No secrets in source control or plain app settings\n• Centralized secret rotation in Key Vault\n• Identity-based access (no passwords/keys to manage)\n\n• Copying raw secret values into app settings stores the secret in the app — exactly what must be avoided\n• Embedding a Key Vault access key in web.config stores a credential in code — insecure\n• Storing a service principal password in code is also an exposed credential",
    reference: "https://learn.microsoft.com/azure/app-service/app-service-key-vault-references"
  },

  {
    id: 382,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "multi",
    source: "Original Practice",
    question: "You need to choose an App Service pricing tier for a production web app that requires VNet Integration, private endpoints, and zone-redundant high availability. Which TWO statements are correct? Each correct answer presents part of the solution.",
    options: [
      "Premium v3 (Pv3) supports zone redundancy when 3 or more instances are deployed in a supporting region",
      "Regional VNet Integration and private endpoints are supported on Premium v3 plans",
      "The Basic (B1) tier supports zone redundancy and private endpoints",
      "The Free (F1) tier supports VNet Integration for production isolation",
      "Zone redundancy requires deploying the app to an Isolated tier only"
    ],
    correct: [0, 1],
    explanation: "Premium v3 (Pv3) is the recommended tier for production apps needing advanced networking and resiliency.\n\nCorrect statements:\n• Zone redundancy on Pv3: When you enable zone redundancy in a supporting region and run 3+ instances, the platform distributes instances across availability zones for higher resiliency\n• Networking on Pv3: Regional VNet Integration (outbound to VNet) and private endpoints (inbound private access) are supported on Standard/Premium tiers, including Pv3\n\nWhy the others are wrong:\n• Basic (B1) does NOT support zone redundancy or private endpoints; it offers only manual scaling and basic features\n• Free (F1) supports no custom networking, scaling, or production isolation\n• Zone redundancy is NOT limited to Isolated — it is available on Premium v3 (and the Isolated v2 tier also supports it), so it is not 'Isolated only'",
    reference: "https://learn.microsoft.com/azure/app-service/overview-zone-redundancy"
  },

  {
    id: 383,
    domain: 3,
    subdomain: "Create and Configure Azure App Service",
    type: "yesno",
    source: "Original Practice",
    scenario: "You have two App Service apps, AppA and AppB, that must run in the same Azure region. AppA is CPU-intensive and AppB is memory-intensive. You place both apps in the same App Service plan to simplify management.",
    question: "Placing both apps in the same App Service plan means they share the same underlying compute instances and their resource consumption affects each other.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — apps in the SAME App Service plan run on the SAME set of underlying compute instances (VMs), and they share that compute capacity.\n\nKey points:\n• An App Service plan defines the region, instance size (CPU/RAM), and number of instances\n• Every app assigned to the plan runs on all instances of the plan\n• Apps in the same plan compete for the same CPU, memory, and other resources\n• Scaling (up or out) applies to the whole plan and all apps in it\n\nBest practice / implication for this scenario:\n• Because AppA (CPU-heavy) and AppB (memory-heavy) would contend for the same resources and could starve each other, it is generally better to isolate resource-intensive apps in SEPARATE App Service plans\n• You only pay for the plan, so consolidating low-traffic apps in one plan saves cost — but resource-intensive apps should be separated\n\nThe statement accurately describes the shared-compute behavior, so the answer is Yes.",
    reference: "https://learn.microsoft.com/azure/app-service/overview-hosting-plans"
  },

  {
    id: 384,
    domain: 3,
    subdomain: "Provision and Manage Containers",
    type: "dragdrop",
    source: "Original Practice",
    question: "Match each Azure compute/container service to the scenario it best fits.",
    dragItems: [
      "Azure Container Instances (ACI)",
      "Azure Container Apps",
      "Azure App Service",
      "Azure Virtual Machine Scale Sets (VMSS)"
    ],
    dropZones: [
      "Run a single short-lived containerized batch job quickly with per-second billing and no orchestrator",
      "Run serverless microservices that scale to zero and use KEDA event-driven autoscaling",
      "Host a managed web application with deployment slots and built-in custom domain/TLS",
      "Run a large fleet of identical IaaS VMs with autoscaling and rolling OS upgrades"
    ],
    correct: [[0, 0], [1, 1], [2, 2], [3, 3]],
    explanation: "Matching compute services to their ideal scenarios:\n\n• Azure Container Instances (ACI) → Single short-lived containerized job: ACI runs containers fast with per-second billing and no cluster/orchestrator to manage. Great for simple, isolated, or burst jobs.\n\n• Azure Container Apps → Serverless microservices with scale-to-zero: Built on Kubernetes + KEDA, it provides event-driven autoscaling (HTTP, queues, custom metrics), scale to zero, revisions, and Dapr — without managing infrastructure.\n\n• Azure App Service → Managed web app with slots and custom domain/TLS: A PaaS for web apps/APIs with deployment slots, autoscale, custom domains, managed certificates, and easy CI/CD.\n\n• Azure Virtual Machine Scale Sets (VMSS) → Large fleet of identical IaaS VMs: Provides autoscaling of identical VMs, zone spanning, and rolling upgrades for OS/image updates — full IaaS control.\n\nChoosing the right service: ACI = simplest containers/jobs; Container Apps = serverless microservices; App Service = managed web apps; VMSS = scalable IaaS VMs.",
    reference: "https://learn.microsoft.com/azure/container-apps/compare-options"
  }

]);


// ─── Microsoft Practice Assessment (Attempt 2 additions) — Domain 3 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 385,
    domain: 3,
    subdomain: "ARM Templates",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a resource group named RG1. RG1 contains an Azure virtual machine named VM1.\nYou need to use VM1 as a template to create a new Azure virtual machine.\nWhich three methods can you use to complete the task? Each correct answer presents a complete solution.",
    options: [
      "From Azure Cloud Shell, run the Save-AzDeploymentTemplate and New-AzResourceGroupDeployment cmdlets.",
      "From RG1, select Export template, select Download, and then from Azure Cloud Shell run the New-AzResourceGroupDeployment cmdlet.",
      "From VM1, select Export template, and then select Deploy.",
      "From Azure Cloud Shell, run the Save-AzDeploymentScriptLog cmdlet.",
      "From Azure Cloud Shell, run the Get-AzVM cmdlet."
    ],
    correct: [0, 1, 2],
    explanation: "All three correct methods produce/deploy an ARM template based on the existing configuration:\n• Save-AzDeploymentTemplate saves the resource ARM template; you then deploy it with New-AzResourceGroupDeployment.\n• Export template > Download from RG1 exports the ARM template from the resource group; you then deploy it with New-AzResourceGroupDeployment.\n• Export template > Deploy from VM1 lets you deploy a new VM using VM1's configuration as the template.\n\nWhy the others are wrong:\n• Save-AzDeploymentScriptLog saves the log of a deployment script execution — it does not export a template.\n• Get-AzVM only lists virtual machines in the subscription; it does not create or template a VM.",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/templates/export-template-portal"
  },
  {
    id: 386,
    domain: 3,
    subdomain: "VM Scale Sets",
    type: "single",
    source: "MS Practice Assessment",
    question: "You are creating an Azure virtual machine that will run Windows Server.\nYou need to ensure that VM1 will be part of a virtual machine scale set.\nWhich setting should you configure during the creation of the virtual machine?",
    options: ["Availability options", "Azure Spot instance", "Region", "Management"],
    correct: [0],
    explanation: "During VM creation, the scale set membership is selected from the Availability options setting (alongside availability sets and availability zones).\n\nWhy the others are wrong:\n• Azure Spot instance adds VMs at a discounted, evictable price — it does not place a VM in a scale set.\n• Region selects the datacenter location and does not affect availability/scale-set configuration.\n• The Management tab configures monitoring and management options, not availability.",
    reference: "https://learn.microsoft.com/azure/virtual-machines/availability"
  },
  {
    id: 387,
    domain: 3,
    subdomain: "Managed Disks",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have two Azure virtual machines named VM1 and VM2 that run Windows Server.\nVM1 has a single data disk that stores backup files.\nYou need to move the data disk from VM1 to VM2 as quickly as possible.\nWhat should you do first?",
    options: [
      "Detach the data disk from VM1.",
      "Stop (deallocate) VM1.",
      "Stop (deallocate) VM2.",
      "Create a snapshot of the data disk and create a new disk from it."
    ],
    correct: [0],
    explanation: "You can detach a data disk from a running VM (hot removal) and then attach it to VM2 — this is the fastest approach. You do not need to stop VM1 or VM2, and you do not need to copy the disk.\n\nWhy the others are wrong:\n• Stopping VM1 or VM2 is unnecessary because hot detach/attach is supported, and stopping would be slower.\n• Creating a snapshot and a new disk copies the data (slow) rather than moving the existing disk.",
    reference: "https://learn.microsoft.com/azure/virtual-machines/windows/detach-disk"
  },
  {
    id: 388,
    domain: 3,
    subdomain: "App Service",
    type: "single",
    source: "MS Practice Assessment",
    question: "You need to create an Azure App Service web app that runs on Windows. The web app requires scaling to five instances, 45 GB of storage, and a custom domain name. The solution must minimize costs.\nWhich App Service plan should you use?",
    options: ["Standard", "Basic", "Premium", "Free"],
    correct: [0],
    explanation: "The Standard plan meets all requirements at the lowest cost: it supports custom domains, up to 50 GB of disk space, and scaling out to 10 instances (covering the required five). It costs roughly $0.10/hour.\n\nWhy the others are wrong:\n• Free offers only 1 GB of storage and cannot scale out (0 instances), and does not support custom domains.\n• Basic offers 10 GB and up to 3 instances — insufficient for 45 GB and 5 instances.\n• Premium meets the requirements (250 GB, up to 30 instances) but costs about twice as much (~$0.20/hour), so it does not minimize cost.",
    reference: "https://azure.microsoft.com/pricing/details/app-service/windows/"
  }
]);
