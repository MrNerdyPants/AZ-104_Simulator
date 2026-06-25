// ============================================================
// DOMAIN 2: Implement and Manage Storage (15-20%)
// Question IDs: 201 - 250
// 2026 Skills: Configure access, storage accounts, Files & Blob
// ============================================================

var QUESTIONS = typeof QUESTIONS !== 'undefined' ? QUESTIONS : [];

QUESTIONS.push.apply(QUESTIONS, [

  // ====================================================
  // TOPIC: Configure Access to Storage
  // ====================================================

  {
    id: 201,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "Your company has datacenters in Los Angeles and New York. You are configuring geo-clustered sites for site resiliency. You need to recommend an Azure Storage redundancy option.\n\nRequirements:\n• Data must be stored on multiple nodes.\n• Data must be stored on nodes in separate geographic locations.\n• Data can be read from the secondary location as well as from the primary location.\n\nWhich redundancy option should you recommend?",
    options: [
      "Geo-redundant storage (GRS)",
      "Read-access geo-redundant storage (RA-GRS)",
      "Zone-redundant storage (ZRS)",
      "Locally redundant storage (LRS)"
    ],
    correct: [1],
    explanation: "Read-access geo-redundant storage (RA-GRS) satisfies all three requirements:\n• Multiple nodes: 6 copies total (3 in primary region, 3 in secondary region)\n• Separate geographic locations: Secondary region is hundreds of miles from primary\n• Readable from secondary: RA-GRS provides a -secondary endpoint for READ access\n\nRedundancy comparison:\n• LRS: 3 copies in 1 datacenter — fails the geo-separation requirement\n• ZRS: 3 copies across 3 AZs in same region — fails the geo-separation requirement\n• GRS: 3+3 copies in 2 regions — meets geo requirement but secondary is NOT readable\n• RA-GRS: 3+3 copies in 2 regions + readable secondary — meets ALL requirements\n• GZRS: ZRS primary + geo replication — secondary is not readable by default\n• RA-GZRS: ZRS primary + geo + readable secondary — also meets all, but adds zone redundancy in primary (not required here)\n\nRA-GRS is the direct match because the question asks for geo-separate + readable secondary without requiring zone redundancy in primary.",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-redundancy"
  },

  {
    id: 202,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "You need the highest level of resilience for your Azure storage. You want zone-redundant storage within the primary region AND geo-redundant replication to a secondary region, with the ability to read from the secondary. Which redundancy option should you choose?",
    options: [
      "Geo-redundant storage (GRS)",
      "Zone-redundant storage (ZRS)",
      "Read-access geo-zone-redundant storage (RA-GZRS)",
      "Read-access geo-redundant storage (RA-GRS)"
    ],
    correct: [2],
    explanation: "RA-GZRS (Read-Access Geo-Zone-Redundant Storage) provides the maximum durability and availability:\n• Primary region: Replicated across 3 availability zones (zone-redundant like ZRS)\n• Secondary region: Replicated to a geo-paired region (with LRS in secondary)\n• Secondary readable: Yes — read access via secondary endpoint\n• Durability: 16 nines (99.99999999999999%)\n\nRedundancy durability comparison:\n• LRS: 11 nines (1 region, 1 AZ)\n• ZRS: 12 nines (1 region, 3 AZs)\n• GRS / RA-GRS: 16 nines (2 regions, LRS in primary)\n• GZRS / RA-GZRS: 16 nines (2 regions, ZRS in primary — highest resilience within region)\n\nRA-GZRS = Best of ZRS (zone resilience) + Best of RA-GRS (geo + readable secondary).\n\n• GRS: No zone redundancy, secondary not readable\n• ZRS: No geo-replication to secondary region\n• RA-GRS: Uses LRS (not ZRS) in the primary region — no zone resilience",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-redundancy#read-access-geo-zone-redundant-storage"
  },

  {
    id: 203,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "You have an Azure storage account named SA1. You need to create a Shared Access Signature (SAS) that grants time-limited read access to a specific blob container. The SAS must use Azure AD credentials for signing — NOT the storage account key. Which type of SAS should you create?",
    options: [
      "Account SAS signed with the storage account key",
      "Service SAS signed with the storage account key",
      "User delegation SAS signed with Microsoft Entra ID credentials",
      "Stored access policy SAS signed with the account key"
    ],
    correct: [2],
    explanation: "A User Delegation SAS is signed using a user delegation key obtained from Microsoft Entra ID (Azure AD) credentials instead of the storage account key. This is the most secure SAS type because:\n• Storage account keys are never exposed to the signing party\n• The SAS is tied to a specific Azure AD identity and permissions\n• The SAS can be revoked by revoking the user delegation key (POST to revoke endpoint)\n• Requires the caller to have the 'Microsoft.Storage/storageAccounts/blobServices/generateUserDelegationKey' permission\n\nSAS types summary:\n• Account SAS: Access to service-level operations and data across Blob, File, Queue, Table — signed with account key\n• Service SAS: Access to specific resource in one service — signed with account key\n• User Delegation SAS: Access to blob or Data Lake Gen2 resources — signed with Entra ID user delegation key (most secure, recommended)\n\nNote: User Delegation SAS is only available for Blob storage and Azure Data Lake Storage Gen2, not for Azure Files, Queue, or Table.\n\n• Account SAS and Service SAS both use the storage account key, not Entra credentials\n• Stored access policy is server-side permissions definition, still signed with account key",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-sas-overview#user-delegation-sas"
  },

  {
    id: 204,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "You have generated a SAS token for a blob container with a 7-day expiry. You discover that the SAS token has been compromised and must be immediately invalidated. The SAS was created by signing with the storage account key (not a user delegation SAS). What is the QUICKEST way to invalidate all SAS tokens for this storage account?",
    options: [
      "Delete the blob container referenced by the SAS",
      "Regenerate the storage account key that was used to sign the SAS",
      "Wait for the SAS expiry time (7 days) to pass",
      "Change the storage account firewall settings to block all public access"
    ],
    correct: [1],
    explanation: "SAS tokens signed with a storage account key are cryptographically derived from that key. When the key is regenerated, all existing SAS tokens signed with the old key immediately become invalid because the signature verification fails.\n\nSteps to invalidate:\n1. Storage Account → Security + networking → Access keys\n2. Rotate (regenerate) the key used to sign the SAS (Key1 or Key2)\n3. Update all applications, services, and connection strings using the old key\n\nImportant consideration:\n• Key rotation breaks ALL applications using that key (not just the compromised SAS)\n• Plan key rotation carefully to update dependent services\n• Azure Key Vault can help manage storage account key rotation automatically\n\nFor User Delegation SAS (Entra-signed): Revoke with PowerShell:\nRevoke-AzStorageAccountUserDelegationKeys -ResourceGroupName RG1 -StorageAccountName SA1\n\n• Deleting the container removes data — destructive and doesn't just invalidate the SAS\n• Waiting 7 days allows continued unauthorized access for the full duration\n• Firewall changes block network access but the SAS token itself is still cryptographically valid",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-account-keys-manage"
  },

  {
    id: 205,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "You need to provide a vendor with temporary upload access to a specific Azure Blob container for 48 hours. The vendor should NOT be able to delete or read existing blobs. What is the most appropriate least-privilege approach?",
    options: [
      "Share the storage account access key with the vendor",
      "Create a Service SAS token with Write and Create permissions on the container, expiring in 48 hours",
      "Assign the Storage Blob Data Contributor role to the vendor's account at the subscription scope",
      "Create a User Delegation SAS with full control permissions on the container"
    ],
    correct: [1],
    explanation: "A Service SAS with Write and Create permissions (without Read or Delete) on a specific container is the minimum necessary access for upload-only access with a time limit.\n\nSAS permissions available:\n• r (Read), a (Add), c (Create), w (Write), d (Delete), x (Delete Version), l (List), t (Tag)\n• For upload-only: Grant w (Write) + c (Create) — no r, d, or l\n\nThe SAS URL format includes:\n• Resource URI (the specific container)\n• Permissions: wc\n• Expiry: current time + 48 hours\n• Signature\n\nThe vendor uses the SAS token URL to upload blobs but cannot read existing blobs, list the container, or delete anything.\n\n• Sharing access keys grants FULL control of the entire storage account — never share keys externally\n• Storage Blob Data Contributor grants read, write, AND delete on ALL blobs in the account — too broad and permanent\n• User Delegation SAS requires the vendor to have an Entra ID account in your tenant — not practical for external vendors",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-sas-overview"
  },

  {
    id: 206,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "An application accesses Azure Blob Storage using a SAS token that was generated from a stored access policy. You need to revoke access for this specific application without rotating the storage account key (which would break other applications). What should you do?",
    options: [
      "Delete the SAS token string from the application configuration file",
      "Modify the stored access policy to set its expiry date in the past, or delete the stored access policy",
      "Change the storage account firewall to block the application server's IP address",
      "Regenerate the storage account access key"
    ],
    correct: [1],
    explanation: "Stored access policies provide server-side control over SAS tokens. Modifying the policy (setting its expiry to a past time) or deleting it immediately invalidates all SAS tokens derived from that policy — without affecting other SAS tokens or rotating the account key.\n\nThis is the primary advantage of stored access policies:\n• Raw SAS token: Cannot be revoked early — must rotate account key or wait for SAS expiry\n• Stored access policy SAS: Revoke by modifying/deleting the policy on the server\n\nStored access policies can be attached to:\n• Blob containers\n• Azure File shares\n• Queues\n• Tables\n\nUp to 5 stored access policies per resource.\n\nTo revoke: Storage Account → Containers → [container] → Access policy → Modify or delete the policy → Save\n\n• Deleting the token from the application config only prevents that specific app instance from using it — the token URL itself is still valid\n• Firewall IP blocks are network-level controls; the SAS token remains cryptographically valid\n• Key rotation works but affects ALL SAS tokens and any key-based connections",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-stored-access-policy-define-dotnet"
  },

  {
    id: 207,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "Your organization has on-premises Windows clients joined to your corporate Active Directory domain. Users need to mount Azure file shares using their domain credentials (SMB). What must you configure to enable identity-based authentication for Azure Files?",
    options: [
      "Configure the storage account firewall to allow all networks",
      "Enable on-premises Active Directory Domain Services (AD DS) authentication on the storage account and join the storage account to your domain",
      "Create a SAS token for each user and distribute it as a mapped drive credential",
      "Set the file share access tier to Premium and enable encryption in transit"
    ],
    correct: [1],
    explanation: "Azure Files supports identity-based authentication over SMB. For on-premises AD DS domain-joined clients, you must enable AD DS authentication on the storage account.\n\nConfiguration steps:\n1. Enable AD DS authentication on the storage account (creates a computer/service account in AD representing the storage account)\n2. Assign share-level permissions using Azure RBAC (e.g., Storage File Data SMB Share Contributor)\n3. Assign directory/file-level permissions using NTFS ACLs (Windows ACLs)\n4. Clients mount the share: net use Z: \\\\<account>.file.core.windows.net\\<share> /user:DOMAIN\\username\n\nIdentity sources supported by Azure Files:\n• On-premises AD DS: For domain-joined on-premises or hybrid clients\n• Microsoft Entra Domain Services: For Entra DS joined cloud VMs\n• Microsoft Entra Kerberos: For hybrid Entra joined (Windows 11 / Azure AD-joined) devices — no on-prem DC required\n\nPrerequisites:\n• TCP port 445 must be open between clients and Azure\n• Microsoft Entra Connect (to sync identities if using AD DS)\n\n• Firewall settings control network access, not identity authentication\n• SAS tokens are for REST API access, not for SMB drive mapping with domain credentials\n• Access tier and encryption settings don't affect the authentication mechanism",
    reference: "https://learn.microsoft.com/azure/storage/files/storage-files-identity-auth-active-directory-enable"
  },

  {
    id: 208,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "You have a storage account with public network access disabled and a private endpoint configured. Azure Backup needs to access this storage account to store backup data. How should you allow Azure Backup to access the storage account without re-enabling public access?",
    options: [
      "Enable 'Allow Azure services on the trusted services list to access this storage account' in the firewall settings",
      "Add the Azure Backup service IP ranges to the firewall allowed IP list",
      "Create a new SAS token for Azure Backup with all permissions",
      "Change the storage account to allow access from all networks"
    ],
    correct: [0],
    explanation: "Azure Storage firewall has a 'Trusted Microsoft Services' exception that allows specific Azure platform services to bypass network rules — even when public access is disabled.\n\nTo enable: Storage Account → Networking → Firewalls and virtual networks → Check 'Allow Azure services on the trusted services list to access this storage account'\n\nServices that can bypass the firewall via this exception:\n• Azure Backup\n• Azure Site Recovery\n• Azure Data Factory\n• Azure Event Grid\n• Azure Monitor\n• Azure DevTest Labs\n• Azure Cognitive Services\n• Azure Machine Learning\n• Many other first-party Azure services\n\nThese services use managed identities and Azure's internal backbone, so they don't need a public IP path — the exception grants them access through internal Azure infrastructure.\n\n• Azure Backup uses managed identities, not fixed IP ranges; IP-based rules won't reliably work\n• SAS tokens are still subject to network rules — they don't bypass network restrictions\n• Re-enabling public access defeats the purpose of having a private endpoint",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-network-security#trusted-access-for-resources-registered-in-your-tenant"
  },

  {
    id: 209,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "You are designing network access to an Azure Storage account. What is the key architectural difference between a Service Endpoint and a Private Endpoint for Azure Storage?",
    options: [
      "Service endpoints are more secure because they use private IP addresses within the VNet",
      "Private endpoints give the storage account a private IP address inside your VNet; service endpoints route traffic over the Azure backbone but the storage account retains its public IP",
      "Service endpoints work across VNet peerings automatically; private endpoints do not propagate across peerings",
      "Private endpoints are only available for blob storage; service endpoints support all storage types including Files and Queues"
    ],
    correct: [1],
    explanation: "Service Endpoint vs Private Endpoint for Azure Storage:\n\nService Endpoint:\n• Storage account RETAINS its public IP address\n• Traffic from your VNet subnet to storage is routed over Azure backbone (not the public internet)\n• Storage firewall can restrict access to only the specified VNet/subnet\n• The storage account is still technically reachable from the internet (if firewall allows)\n• Free — no per-hour cost\n• Does NOT give storage a private IP in your VNet\n\nPrivate Endpoint:\n• Storage account gets a PRIVATE IP address (e.g., 10.1.2.5) inside your VNet via a network interface\n• Traffic never leaves your VNet — fully private, no public internet exposure\n• Can (and should) disable public network access completely\n• Requires DNS configuration (private DNS zone or custom DNS)\n• Requires a private endpoint resource (incurs cost per hour + data processing)\n• More secure: storage account fully removed from public internet\n\nPrivate endpoints propagate through VNet peerings and Express Route/VPN connections via DNS.\n\n• Service endpoints don't use private IPs — the storage endpoint is still a public IP\n• Private endpoints work across peered VNets when DNS is configured correctly\n• Both service and private endpoints support all storage services",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-private-endpoints"
  },

  {
    id: 210,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "You need to restrict a storage account to accept traffic only from a specific subnet in your virtual network (VNet-Prod, Subnet-App). The storage account currently allows access from all networks. What must you configure?",
    options: [
      "Add a service endpoint for Microsoft.Storage on Subnet-App, then add a VNet rule on the storage account for VNet-Prod/Subnet-App",
      "Create a private endpoint for the storage account in Subnet-App",
      "Add the subnet's CIDR range to the storage account firewall IP rules",
      "Create a network security group rule on Subnet-App to allow storage traffic"
    ],
    correct: [0],
    explanation: "To restrict a storage account to accept traffic only from a specific subnet using service endpoints:\n\nStep 1 — Enable the service endpoint on the subnet:\n• VNet → Subnets → Subnet-App → Service endpoints → Add 'Microsoft.Storage'\n• This routes traffic from that subnet to Azure Storage over the Azure backbone\n\nStep 2 — Add the VNet rule on the storage account:\n• Storage Account → Networking → Firewalls and virtual networks\n• Change 'Allow access from' to 'Selected networks'\n• Add virtual network → Select VNet-Prod / Subnet-App\n• Save\n\nAfter this, only traffic from Subnet-App (and any explicitly allowed IPs) can reach the storage account.\n\nService endpoint vs subnet CIDR:\n• Subnets don't have static public IPs — you can't put subnet ranges in IP firewall rules\n• Service endpoints give the subnet a way to identify itself to the storage firewall\n\n• Private endpoints are an alternative approach, but they require DNS configuration and create a private IP; this question is about VNet rules (service endpoint approach)\n• NSG rules control traffic flow but don't restrict what the storage account itself accepts — you need storage-side firewall rules",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-network-security#grant-access-from-a-virtual-network"
  },

  {
    id: 211,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "yesno",
    scenario: "Your organization's security policy requires that all Azure Storage access keys must be rotated every 90 days. You have a storage account named SA-Prod with two access keys: Key1 and Key2. Applications are currently using Key1 in their connection strings.",
    question: "You can rotate Key1 without any application downtime by first updating all applications to use Key2, then regenerating Key1.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — Azure Storage provides two access keys (Key1 and Key2) specifically to enable zero-downtime key rotation.\n\nZero-downtime rotation procedure:\n1. Update all applications to use Key2 (instead of Key1)\n2. Verify applications are working with Key2\n3. Regenerate Key1 (now safe — no applications are using it)\n4. (Next rotation cycle: switch apps to Key1, then regenerate Key2)\n\nBest practices for key management:\n• Store keys in Azure Key Vault, not in application config files\n• Use managed identities instead of access keys where possible (more secure — no key to rotate)\n• Enable Azure Key Vault automatic key rotation for storage accounts\n• Monitor key usage with Azure Monitor/Defender for Storage\n\nThe two-key design is intentional — it allows rotation without service interruption, unlike a single-key model.",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-account-keys-manage#rotate-access-keys"
  },

  // ====================================================
  // TOPIC: Configure and Manage Storage Accounts
  // ====================================================

  {
    id: 212,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    question: "You need to create a new Azure Storage account. Which naming constraint applies to storage account names?",
    options: [
      "Must be 3-63 characters, globally unique across all Azure storage accounts, lowercase letters and numbers only (no hyphens)",
      "Must be 3-24 characters, globally unique across all Azure storage accounts, lowercase letters and numbers only (no hyphens)",
      "Must be 3-24 characters, unique within the Azure region, can contain uppercase letters, lowercase letters, and numbers",
      "Must be 1-15 characters, unique within the subscription, can contain letters, numbers, and hyphens"
    ],
    correct: [1],
    explanation: "Azure Storage account names have specific requirements:\n• Length: 3 to 24 characters\n• Characters: lowercase letters and numbers only — NO uppercase, hyphens, underscores, or special characters\n• Uniqueness: Must be globally unique across ALL Azure storage accounts in ALL tenants worldwide\n• The name becomes part of the storage endpoint URL: https://<name>.blob.core.windows.net\n\nExamples:\n• Valid: mystorage2026, companylogsa01\n• Invalid: MyStorage (uppercase), my-storage (hyphen), my_storage (underscore), mystoragethatiswaytoolongnameexceedinglimit (>24 chars)\n\nStorage account types:\n• General Purpose v2 (GPv2): Recommended for most workloads; supports all storage services\n• General Purpose v1 (GPv1): Legacy, doesn't support all tiers\n• BlockBlobStorage: Premium performance for block blobs\n• FileStorage: Premium performance for file shares\n• BlobStorage: Legacy blob-only accounts (use GPv2 instead)\n\nLonger DNS names (up to 63 chars) are for containers and blobs, not the storage account itself.",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-account-create"
  },

  {
    id: 213,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    question: "You need to store petabytes of data for Azure Data Lake Storage Gen2 analytics workloads. Which storage account type and configuration is required?",
    options: [
      "General Purpose v1 (GPv1) with LRS redundancy",
      "General Purpose v2 (GPv2) with hierarchical namespace (HNS) enabled",
      "BlockBlobStorage premium account with hierarchical namespace enabled",
      "FileStorage premium account with NFS enabled"
    ],
    correct: [1],
    explanation: "Azure Data Lake Storage Gen2 (ADLS Gen2) is implemented by enabling the Hierarchical Namespace (HNS) feature on a General Purpose v2 (GPv2) storage account.\n\nHierarchical Namespace enables:\n• True directory and subdirectory structure (unlike flat namespace of regular Blob)\n• Atomic directory operations: rename/delete a directory in O(1) — not O(n)\n• Improved analytics performance for Hadoop, Databricks, Azure Synapse Analytics\n• Compatible with both Azure Blob Storage APIs and Azure Data Lake Storage APIs\n• Supports POSIX-compliant access control (ACLs per file/folder)\n\nKey requirements:\n• Must be General Purpose v2 (GPv2) storage account\n• Enable 'Hierarchical Namespace' during creation (CANNOT be disabled or enabled after creation on existing accounts — you must create a new account)\n\nADLS Gen2 is used by:\n• Azure Synapse Analytics\n• Azure HDInsight\n• Azure Databricks\n• Azure Data Factory\n\n• GPv1 is legacy and doesn't support ADLS Gen2\n• BlockBlobStorage premium can have HNS but GPv2 is the standard for ADLS Gen2\n• FileStorage is for Azure Files SMB/NFS shares, not data lake workloads",
    reference: "https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction"
  },

  {
    id: 214,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    question: "You need to configure object replication for Azure Blob Storage between two storage accounts in different regions. Which prerequisites must be met? (Choose the MINIMUM set of requirements.)",
    options: [
      "Both storage accounts must be in the same Azure region and have LRS redundancy",
      "Both storage accounts must have blob versioning enabled; the source must also have change feed enabled",
      "Both storage accounts must have soft delete enabled and be of type BlockBlobStorage",
      "Both storage accounts must be in the same Azure subscription with the same access tier"
    ],
    correct: [1],
    explanation: "Azure Blob Object Replication prerequisites:\n• Source storage account: Blob versioning ENABLED + Change feed ENABLED\n• Destination storage account: Blob versioning ENABLED\n• Both accounts must be GPv2 or BlockBlobStorage type\n\nWhat object replication does:\n• Asynchronously copies block blobs from source to destination container\n• Replicates new blobs created after the replication policy is configured\n• Replicates blob content, metadata, and blob index tags\n• Does NOT replicate blob snapshots, append blobs, or page blobs\n• Latency is typically minutes to hours (asynchronous)\n\nFlexibility:\n• Accounts can be in DIFFERENT regions (cross-region is the primary use case)\n• Accounts can be in DIFFERENT subscriptions (and even different tenants with cross-tenant replication)\n• One source can replicate to multiple destinations\n• One destination can receive from multiple sources\n\nNOT required:\n• Same region (accounts can be in any region)\n• Same subscription\n• Soft delete (separate feature)\n• Hierarchical namespace accounts: NOT supported for object replication",
    reference: "https://learn.microsoft.com/azure/storage/blobs/object-replication-overview"
  },

  {
    id: 215,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    question: "You need to configure Azure Storage to use a customer-managed key (CMK) stored in Azure Key Vault for encryption of blob data. What must be true about the Key Vault for this configuration to work?",
    options: [
      "The Key Vault must be in the same region as the storage account and have public access disabled",
      "The Key Vault must have soft-delete and purge protection enabled, and the storage account's managed identity must have key permissions on the vault",
      "Customer-managed keys can only be set at storage account creation time and cannot be changed afterward",
      "The Key Vault must be in the same resource group as the storage account"
    ],
    correct: [1],
    explanation: "To configure Customer-Managed Key (CMK) encryption on a storage account:\n\nKey Vault requirements:\n• Soft-delete: MUST be enabled (prevents accidental key deletion that would lock data)\n• Purge protection: MUST be enabled (prevents permanent deletion of soft-deleted keys)\n• These protect against losing access to encrypted data\n\nPermissions:\n• The storage account must have a managed identity (system-assigned or user-assigned)\n• The managed identity must be assigned the 'Key Vault Crypto Service Encryption User' role on the Key Vault\n• Alternatively: assign Get, Wrap, and Unwrap key permissions in Key Vault access policy\n\nConfiguration steps:\n1. Storage Account → Encryption → Select 'Customer-managed keys'\n2. Choose Key Vault and key version (or latest)\n3. Save\n\nIMPORTANT distinctions:\n• CMK: Encrypts storage with your own key in Key Vault — can be configured after creation\n• Infrastructure encryption (double encryption): Second layer of encryption using platform-managed keys — MUST be enabled at account creation time, cannot be changed after\n\n• Key Vault can be in a different region and resource group from the storage account\n• CMK CAN be configured after creation — it is not limited to creation time\n• Purge protection is the specific Key Vault requirement (not just soft-delete alone)",
    reference: "https://learn.microsoft.com/azure/storage/common/customer-managed-keys-overview"
  },

  {
    id: 216,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    question: "You need to copy 2 TB of data from an on-premises Windows Server to Azure Blob Storage quickly over the network. Which tool is the most appropriate for this high-performance bulk transfer?",
    options: [
      "Azure Storage Explorer (GUI drag-and-drop upload)",
      "AzCopy command-line utility with recursive flag and parallel transfer optimization",
      "Azure portal direct file upload from the container blade",
      "PowerShell Set-AzStorageBlobContent cmdlet in a foreach loop"
    ],
    correct: [1],
    explanation: "AzCopy is a command-line utility specifically optimized for high-throughput data transfers to and from Azure Storage.\n\nAzCopy advantages:\n• Parallel transfers: Multiple concurrent connections saturate available bandwidth\n• Automatic retry: Resumes failed transfers without restarting from scratch\n• Incremental sync: Copies only changed files (azcopy sync)\n• Server-side copy: Transfers directly between storage accounts without local download\n• Authentication: Supports SAS tokens, managed identities, service principals, and interactive Entra login\n\nKey commands:\nazcopy copy 'C:\\data\\*' 'https://SA1.blob.core.windows.net/container?SAS' --recursive\nazcopy sync 'C:\\data' 'https://SA1.blob.core.windows.net/container?SAS' --recursive\n\nFor very large datasets (100+ TB) where network is not feasible:\n• Azure Data Box (physical device shipped by Microsoft) — offline transfer\n• Azure Import/Export service (ship your own drives)\n\n• Azure Storage Explorer is a GUI tool — suitable for small transfers but not optimized for 2TB\n• Azure portal upload is limited to individual files and small datasets\n• PowerShell foreach loop is single-threaded by default — significantly slower for 2TB without explicit parallelism",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-use-azcopy-v10"
  },

  {
    id: 217,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    question: "You need to authenticate AzCopy to copy blobs between two different storage accounts without storing account keys. Which authentication approach should you use?",
    options: [
      "Use a SAS token appended to each storage URL",
      "Log in with Microsoft Entra ID using 'azcopy login', then use account URLs without SAS tokens",
      "Pass the account name and account key as command-line flags --account-name and --account-key",
      "Store the connection string in the AZURE_STORAGE_CONNECTION_STRING environment variable"
    ],
    correct: [1],
    explanation: "AzCopy supports multiple authentication methods. Using Entra ID login is the most secure because no keys are stored:\n\nazcopy login\n(Opens browser for interactive authentication)\n\nazcopy copy 'https://source.blob.core.windows.net/container' 'https://dest.blob.core.windows.net/container' --recursive\n\nAzCopy authentication options:\n1. Microsoft Entra ID (recommended): azcopy login → uses OAuth token\n   • No keys or SAS tokens needed\n   • Requires: Storage Blob Data Contributor role (or Reader for source + Contributor for dest)\n   • Supports: service principals with --service-principal flag\n   • Supports: managed identity with --identity flag (on Azure VMs)\n\n2. SAS token: Append ?SAS to each URL\n   • Time-limited, no need for RBAC assignment\n   • Risk: SAS can be logged in command history\n\n3. Account key: --account-key flag or environment variable\n   • Grants full access — avoid in scripts\n\nFor automation (CI/CD, scripts): Use service principal or managed identity login.\n\n• SAS tokens work but expose credentials in command history/logs\n• Account key grants overly broad permissions\n• Connection string includes the account key — same security concern",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-use-azcopy-authorize-azure-active-directory"
  },

  {
    id: 218,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    question: "You have a General Purpose v2 storage account using LRS redundancy. Due to a new DR policy, you need to upgrade to GRS. Which statement is TRUE about changing redundancy after account creation?",
    options: [
      "Changing from LRS to GRS requires creating a new storage account and using AzCopy to migrate data",
      "You can change redundancy from LRS to GRS in the Azure portal or via PowerShell/CLI without creating a new account or causing downtime",
      "Changing from LRS to GRS requires submitting a Microsoft support request for live migration",
      "Redundancy can only be changed at storage account creation time"
    ],
    correct: [1],
    explanation: "Azure Storage redundancy can be changed in-place after account creation for most transitions.\n\nChanges allowed without a support request:\n• LRS ↔ GRS ↔ RA-GRS (no data movement between regions needed — Azure just starts/stops geo-replication)\n• LRS ↔ ZRS is NOT automatic — requires live migration (support request) or manual data migration\n\nChanges requiring a Microsoft support request (live migration):\n• LRS → ZRS: Data must physically move between availability zones in the same region\n• Other zone-to-zone conversions\n\nHow to change: Storage Account → Data management → Redundancy → Select new tier → Save\n\nOr via CLI:\naz storage account update --name SA1 --resource-group RG1 --sku Standard_GRS\n\nAllowed SKU values:\n• Standard_LRS, Standard_ZRS, Standard_GRS, Standard_RAGRS, Standard_GZRS, Standard_RAGZRS\n\n• LRS to GRS does NOT require data migration — Azure handles replication setup automatically\n• Support request is only needed for zone-migration (LRS→ZRS)\n• Redundancy changes are allowed post-creation",
    reference: "https://learn.microsoft.com/azure/storage/common/redundancy-migration"
  },

  {
    id: 219,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    question: "You need to review the ARM template that was used to deploy a storage account last week. A colleague ran the deployment from the Azure portal. Where can you find the original deployment template?",
    options: [
      "Storage Account blade → Properties → Export template",
      "Storage Account blade → Settings → Locks",
      "Resource Group → Deployments → Select the specific deployment → Template tab",
      "Azure Monitor → Activity Log → Filter by 'Create or Update Storage Account'"
    ],
    correct: [2],
    explanation: "ARM deployment templates are stored in the deployment history of the Resource Group. Each time resources are deployed through Azure Resource Manager, the template and parameters are saved.\n\nNavigation: Resource Group → Deployments → [Select the deployment] → Template\n\nFrom the deployment view, you can:\n• View the original ARM template JSON\n• View the input parameters used\n• Download the template and parameters\n• Redeploy with the same or modified parameters\n\nAzure stores up to 800 deployments per resource group in history.\n\nAlternative — Export current state:\n• Storage Account → Export template: This exports the CURRENT state of the resource as a template, not the original deployment template. It may have different structure and includes current configuration (not the original intent).\n\nActivity Log: Shows the operation metadata (who, when, what resource) but not the full template used.\n\n• Storage Account Properties shows account settings (location, redundancy, etc.) — not the deployment template\n• Storage Locks shows CanNotDelete/ReadOnly lock configuration\n• Activity Log shows operation history but not template content",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/templates/deployment-history"
  },

  // ====================================================
  // TOPIC: Configure Azure Files and Azure Blob Storage
  // ====================================================

  {
    id: 220,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You have a blob in Azure Storage currently in the Archive access tier. A business application needs to read the blob data within the next 30 minutes. What must you do?",
    options: [
      "Copy the blob to a new storage account; archive blobs cannot be accessed in-place",
      "Rehydrate the blob by changing its tier to Hot using High priority rehydration, which can complete in under 1 hour for blobs under 10 GB",
      "Enable read access on the archive tier directly in the Azure portal",
      "Download the blob using AzCopy with the --from-archive flag"
    ],
    correct: [1],
    explanation: "Blobs in the Archive tier are stored offline and are NOT directly readable. To access the data, you must first REHYDRATE the blob to an online tier.\n\nRehydration options:\n1. In-place rehydration (change tier of the same blob):\n   • Set tier to Hot or Cool on the existing blob\n   • Standard priority: Up to 15 hours\n   • High priority: Typically under 1 hour for blobs < 10 GB (higher cost)\n\n2. Copy rehydration:\n   • Copy the archived blob to a NEW blob with a Hot/Cool destination tier\n   • Original blob stays in Archive\n   • Same priority options apply\n\nFor urgent 30-minute requirement: Use High priority rehydration to Hot tier.\n\nEarly deletion fees for blobs deleted/tiered before minimum storage duration:\n• Cool: 30-day minimum\n• Cold: 90-day minimum\n• Archive: 180-day minimum\n\n• Archive blobs CAN be rehydrated — copy to new account is unnecessary\n• You cannot read Archive tier blobs directly — this option doesn't exist\n• AzCopy has no --from-archive flag; the blob must be rehydrated first",
    reference: "https://learn.microsoft.com/azure/storage/blobs/archive-rehydrate-overview"
  },

  {
    id: 221,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You need to automatically move blobs that haven't been accessed in 90 days to the Cool tier, move them to Archive after 180 days of no access, and permanently delete them after 365 days. Which native Azure Storage feature handles this automatically?",
    options: [
      "Azure Storage Explorer scheduled rules",
      "Blob lifecycle management policy with tier transition and delete actions",
      "An Azure Function with a timer trigger that scans the container daily",
      "Azure Automation runbook with a storage account connection"
    ],
    correct: [1],
    explanation: "Azure Blob Storage Lifecycle Management policies allow you to define rules that automatically transition blobs between tiers and delete them based on age or last access time.\n\nExample policy for this scenario:\n{\n  'rules': [{\n    'name': 'auto-tier-delete',\n    'type': 'Lifecycle',\n    'definition': {\n      'filters': { 'blobTypes': ['blockBlob'] },\n      'actions': {\n        'baseBlob': {\n          'tierToCool': { 'daysAfterLastAccessTimeGreaterThan': 90 },\n          'tierToArchive': { 'daysAfterLastAccessTimeGreaterThan': 180 },\n          'delete': { 'daysAfterLastAccessTimeGreaterThan': 365 }\n        }\n      }\n    }\n  }]\n}\n\nNote: 'daysAfterLastAccessTimeGreaterThan' requires enabling 'Last access time tracking' on the storage account.\nAlternative: 'daysAfterModificationGreaterThan' (based on modification date, no extra setting needed)\n\nLifecycle policies can also:\n• Apply to specific containers using prefix match\n• Apply only to blobs with specific tags (blobIndexMatch)\n• Target snapshots and versions separately\n\n• Storage Explorer is a GUI management tool, not for automated policy enforcement\n• Azure Functions and Automation Runbooks work but are complex to maintain; lifecycle management is the native solution",
    reference: "https://learn.microsoft.com/azure/storage/blobs/lifecycle-management-overview"
  },

  {
    id: 222,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You have blob versioning enabled on a storage account. A developer overwrites a blob named 'config.json'. What happens to the previous version of the blob?",
    options: [
      "The previous version is permanently deleted immediately when the blob is overwritten",
      "The previous version is automatically moved to the Archive tier to reduce cost",
      "The previous version becomes an immutable, read-only prior version accessible by its version ID",
      "The previous version is stored in a separate backup vault for 30 days"
    ],
    correct: [2],
    explanation: "Blob Versioning automatically maintains previous versions of a blob when it is modified, overwritten, or deleted.\n\nHow versioning works:\n• Each version has a unique version ID in the format: YYYY-MM-DDThh:mm:ss.fffffffZ\n• When a blob is overwritten: the old content becomes a previous version (read-only)\n• When a blob is deleted: the current version becomes a previous version, and the blob 'disappears' from normal listing but can be restored\n• Current version: the most recent state — writable\n• Previous versions: all older states — read-only (immutable)\n\nAccessing a specific version:\nGET https://<account>.blob.core.windows.net/<container>/<blob>?versionId=<versionId>\n\nRestoring a previous version:\nCopy the desired previous version over the current blob (in-place copy)\n\nCost management:\n• Previous versions incur storage costs just like regular blobs\n• Use lifecycle management policies to automatically delete versions older than N days:\n  'version': { 'delete': { 'daysAfterCreationGreaterThan': 90 } }\n\nVersioning vs Snapshots:\n• Versioning: Automatic, Azure-managed, triggered by any write operation\n• Snapshots: Manual, user-initiated point-in-time copies\n\n• Previous versions are NOT deleted when the blob is overwritten — they persist until explicitly deleted or lifecycle policy removes them\n• Previous versions remain in the same container, same storage account — not moved to Archive",
    reference: "https://learn.microsoft.com/azure/storage/blobs/versioning-overview"
  },

  {
    id: 223,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You have soft delete enabled for blobs on a storage account. A developer accidentally deletes a blob named 'report-2026.pdf'. How do you recover it within the retention period?",
    options: [
      "The blob is permanently deleted and cannot be recovered once deleted",
      "Run the Undelete Blob operation on the soft-deleted blob from the portal or SDK/CLI",
      "Restore the blob from an Azure Backup Recovery Services vault",
      "Use AzCopy to restore from the secondary RA-GRS replica"
    ],
    correct: [1],
    explanation: "Blob Soft Delete retains deleted blobs for a configurable retention period (1-365 days, default 7 days). The blob is not immediately removed — it is marked as 'soft deleted' and hidden from normal listing.\n\nRecovery steps:\n1. Azure portal: Storage Account → Container → Show deleted blobs (toggle) → Select blob → Undelete\n2. Azure CLI: az storage blob undelete --account-name SA1 --container-name container1 --name 'report-2026.pdf'\n3. PowerShell: Restore-AzStorageBlob -Container container1 -Blob 'report-2026.pdf' -Context $ctx\n4. REST API: Call the Undelete Blob operation\n\nSoft delete also applies to:\n• Blob snapshots (soft-deleted snapshots are retained)\n• Blob versions (with versioning enabled, deleted versions are also soft-deleted)\n• Containers: Separate soft delete for containers must be configured\n\nAfter the retention period: The blob is permanently deleted and CANNOT be recovered via soft delete.\n\n• Blobs ARE recoverable within the retention period via undelete\n• Azure Backup for blobs is a separate operational backup feature (requires vault configuration)\n• RA-GRS secondary is a replica of the CURRENT state — deleted blobs are replicated as deleted; secondary is not a backup",
    reference: "https://learn.microsoft.com/azure/storage/blobs/soft-delete-blob-overview"
  },

  {
    id: 224,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "Your organization requires that audit log data stored in Azure Blob Storage cannot be modified or deleted for 7 years (2,555 days) for regulatory compliance. Even storage administrators must not be able to bypass this requirement. Which feature should you implement?",
    options: [
      "Enable blob soft delete with a 2,555-day retention period",
      "Apply a LOCKED time-based immutability retention policy of 2,555 days on the blob container",
      "Apply a ReadOnly resource lock on the storage account",
      "Configure Azure Backup with a 7-year retention policy"
    ],
    correct: [1],
    explanation: "Azure Blob Storage Immutability (WORM — Write Once, Read Many) with a LOCKED policy is the correct solution for compliance-grade tamper-proof storage.\n\nTwo types of immutability policies:\n1. Time-based retention policy:\n   • Blobs cannot be modified or deleted until retention expires\n   • UNLOCKED state: Admins can still modify the policy (extend retention, delete policy)\n   • LOCKED state: Once locked, the policy CANNOT be shortened or deleted — even by subscription owners\n   • After locking: Only allowed operation is extending the retention period\n\n2. Legal hold:\n   • No fixed time limit — remains until explicitly removed\n   • Useful for active litigation\n\nFor regulatory compliance: Always LOCK the policy to prevent tampering.\n\nConfiguration: Container → Access policy → Immutability policies → Add → Set 2,555 days → Save → Lock\n\nVersion-level immutability (requires blob versioning): Apply per-blob version policies.\n\n• Soft delete only retains DELETED blobs (max 365 days) — does not prevent overwriting\n• ReadOnly resource lock prevents changes to the storage account resource itself (in Azure Resource Manager), not individual blob data\n• Azure Backup takes snapshots for recovery purposes but doesn't prevent modification of the original data",
    reference: "https://learn.microsoft.com/azure/storage/blobs/immutable-storage-overview"
  },

  {
    id: 225,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You are managing an Azure storage account. An application appends log records continuously to a blob and never modifies existing records. Which blob type is optimized for this pattern?",
    options: [
      "Block blob — supports up to 4.75 TB per blob with parallel block uploads",
      "Page blob — optimized for random read/write operations used by Azure VM disks",
      "Append blob — optimized for append-only workloads like log streaming and telemetry",
      "Flat blob — stores key-value pairs for NoSQL-style access"
    ],
    correct: [2],
    explanation: "Azure Blob Storage supports three blob types, each optimized for different access patterns:\n\n1. Block Blob (default):\n   • Composed of individually addressed blocks (up to 50,000 blocks × 100 MB = ~4.75 TB max)\n   • Best for: text files, images, videos, documents, general files\n   • Supports parallel uploads of blocks\n   • Once committed, blocks cannot be modified without rewriting the whole blob\n\n2. Append Blob:\n   • Can ONLY add blocks to the end — cannot modify or delete existing blocks\n   • Best for: log files, audit records, telemetry, streaming data\n   • Maximum size: ~195 GB\n   • Each append operation adds a new block at the tail\n\n3. Page Blob:\n   • Composed of 512-byte aligned pages\n   • Optimized for RANDOM read/write (can update individual 512-byte segments)\n   • Best for: Azure VM disks (VHD/VHDX), databases with random I/O\n   • Maximum size: 8 TB\n\nFor continuous log appending: Append Blob is the correct choice — the append-only constraint matches the application pattern exactly.\n\n• Block blobs support modification which is unnecessary for this pattern\n• Page blobs are for random I/O (VM disks), not sequential appending\n• 'Flat blob' is not an Azure Storage blob type",
    reference: "https://learn.microsoft.com/azure/storage/blobs/storage-blob-pageblob-overview"
  },

  {
    id: 226,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You need to create an Azure file share for an SAP application that requires sub-millisecond latency, high IOPS, and SMB protocol support. Which storage account type and tier should you use?",
    options: [
      "General Purpose v2 with transaction-optimized file share tier",
      "General Purpose v2 with Hot blob access tier",
      "FileStorage account with Premium performance (SSD-backed)",
      "BlockBlobStorage account with Premium performance"
    ],
    correct: [2],
    explanation: "For high-performance Azure File Shares requiring sub-millisecond latency, you need a FileStorage account with Premium performance.\n\nFileStorage Premium:\n• Storage medium: SSD-backed\n• Latency: Sub-millisecond (single-digit microsecond) for most operations\n• Performance model: Provisioned (pay for provisioned GiB capacity; IOPS and throughput scale with provisioned size)\n• Minimum share size: 100 GiB\n• Protocols: SMB (2.1, 3.0, 3.1.1) and NFS 4.1\n• Best for: SAP, SQL Server, ERP systems, CAD/CAM, high-IOPS databases\n\nAzure Files Tiers on Standard (GPv2) accounts:\n• Transaction optimized: Highest transaction throughput, pay-per-transaction\n• Hot: General-purpose file sharing\n• Cool: Archival, infrequently accessed\n• Standard uses HDD storage — millisecond range latency\n\nProvisioned IOPS formula for Premium:\nBase IOPS = 400 + 1 IOPS per GiB provisioned\nBurst IOPS = max(4,000, 3 × Base IOPS)\n\n• GPv2 with transaction-optimized or Hot tier uses HDD — cannot provide sub-millisecond latency\n• BlockBlobStorage is for high-performance blob operations, not file shares",
    reference: "https://learn.microsoft.com/azure/storage/files/storage-files-planning"
  },

  {
    id: 227,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You have an Azure Files file share with soft delete enabled. A user accidentally deletes a file named 'budget.xlsx'. The soft delete retention period is 14 days. How do you restore the deleted file?",
    options: [
      "Storage Account → File Shares → Show deleted shares → Restore",
      "Storage Account → File Shares → [Select share] → Show deleted files → Restore",
      "Azure Backup → Recovery Services Vault → File Recovery",
      "AzCopy sync from the secondary region endpoint"
    ],
    correct: [1],
    explanation: "Azure Files soft delete operates at two levels:\n\n1. File-level soft delete (within a share):\n   • When individual files/directories are deleted, they enter a soft-deleted state\n   • Navigation: Storage Account → File shares → [click on share] → Browse → Show deleted files → Select file → Restore\n   • Default retention: 7 days (configurable 1-365 days)\n\n2. Share-level soft delete:\n   • When an entire file SHARE is deleted, it enters a soft-deleted state\n   • Navigation: Storage Account → File shares → Show deleted shares → Restore\n\nFor this scenario (a specific file deleted within a share): Option B — navigate INTO the share and show deleted files.\n\nSoft delete configuration:\nStorage Account → Data protection → Enable soft delete for file shares → Set retention period\n\nAzure Files soft delete vs Azure Backup:\n• Soft delete: Short-term protection (max 365 days), automatic, no vault setup\n• Azure Backup for Files: Longer retention (months/years), scheduled snapshots, requires Recovery Services vault\n\n• 'Show deleted shares' is for restoring an entire deleted file share, not a file within a share\n• Azure Backup recovery is a separate, more complex process requiring vault configuration\n• AzCopy secondary is not a backup — deleted files are also deleted in the replica",
    reference: "https://learn.microsoft.com/azure/storage/files/storage-files-enable-soft-delete"
  },

  {
    id: 228,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You need to set up Azure File Sync to synchronize files from an on-premises Windows Server 2022 file server to an Azure file share. Which component must you install on the on-premises Windows Server?",
    options: [
      "Azure Data Box Gateway",
      "Microsoft Entra Connect (Azure AD Connect)",
      "Azure File Sync agent (StorageSyncAgent.msi)",
      "Azure Monitor Agent (AMA)"
    ],
    correct: [2],
    explanation: "Azure File Sync requires the Azure File Sync agent installed on each Windows Server that participates in sync.\n\nAzure File Sync architecture components:\n1. Storage Sync Service: Azure resource that coordinates sync (create in Azure portal)\n2. Sync group: Defines the relationship between cloud endpoint (Azure file share) and server endpoints\n3. Cloud endpoint: The Azure file share\n4. Server endpoint: A specific folder path on the registered Windows Server\n5. Azure File Sync agent: Software installed on Windows Server — download from Microsoft Download Center\n\nAgent installation: Installs the FileSyncSvc Windows service and the StorageSync filter driver.\n\nSupported operating systems:\n• Windows Server 2012 R2, 2016, 2019, 2022\n• Windows 10 and 11 (for workstations)\n\nKey feature — Cloud Tiering:\n• Files not recently accessed are replaced with reparse points (stubs)\n• Data lives in Azure; stub shows in File Explorer with cloud icon\n• Accessing a tiered file triggers automatic download\n• Volume free space policy: Maintain X% free on the server volume\n\n• Azure Data Box Gateway is a virtual appliance for online data ingestion to Azure Storage — not for ongoing sync\n• Entra Connect syncs Active Directory identities to Entra ID — not for file sync\n• Azure Monitor Agent collects monitoring data — not for file sync",
    reference: "https://learn.microsoft.com/azure/storage/file-sync/file-sync-deployment-guide"
  },

  {
    id: 229,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You are configuring Azure File Sync with cloud tiering on a server with a 1 TB volume. You enable cloud tiering with a 'Volume free space' policy of 20%. What is the expected behavior?",
    options: [
      "Files larger than 200 GB (20% of 1 TB) will be automatically tiered to the cloud",
      "Azure File Sync will automatically tier the least recently accessed files to ensure at least 200 GB (20% of 1 TB) remains free on the server volume",
      "20% of all files (by count) will always remain on the server; the remaining 80% will be in the cloud",
      "Sync will pause and generate an alert when the volume falls below 20% free space"
    ],
    correct: [1],
    explanation: "Cloud tiering 'Volume free space policy' means: Azure File Sync ensures that at least the specified percentage of the server volume remains free by tiering (uploading and replacing with stubs) the least recently accessed files.\n\nFor 1 TB volume with 20% policy:\n• Target: Keep ≥ 200 GB free on the server\n• When free space drops below 200 GB: File Sync starts tiering LRU (least recently used) files\n• Tiered files: Replaced by tiny reparse points (stubs) — only a few KB\n• Full file content: Stored in the Azure file share\n• User access to tiered file: Azure File Sync automatically downloads the file on demand\n\nCloud tiering policies:\n• Volume free space policy: Minimum % free space to maintain (triggers tiering when violated)\n• Date policy: Tier files not accessed within the last N days (optional, can combine with volume policy)\n\nBehavior when both policies are set: File Sync honors whichever policy causes more tiering.\n\nTiered file indicators in Windows Explorer:\n• Blue cloud icon overlay\n• 'Offline' attribute set\n• 0 bytes on disk (in properties)\n\n• The 20% refers to volume FREE SPACE, not file size\n• There's no fixed percentage of files that stays local — it depends on access patterns\n• Sync doesn't pause when space is low — it tiers aggressively to free up space",
    reference: "https://learn.microsoft.com/azure/storage/file-sync/file-sync-cloud-tiering-overview"
  },

  {
    id: 230,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You have an Azure Blob container that needs to serve static content (images, JavaScript files) to a public website. Users should be able to access blobs without authentication using just the URL. What configuration is required?",
    options: [
      "Generate a long-lived SAS token for each blob and embed it in the website",
      "Enable static website hosting on the storage account",
      "Set the container access level to 'Blob' and ensure the storage account allows blob public access",
      "Configure CORS on the storage account to allow all origins"
    ],
    correct: [2],
    explanation: "To allow anonymous (unauthenticated) access to blobs via public URL:\n\nStep 1: Enable 'Allow blob public access' at the storage account level.\n• Storage Account → Configuration → Allow Blob public access → Enabled\n• This is a switch that enables the ABILITY to make containers public (it doesn't automatically make them public)\n\nStep 2: Set the container access level:\n• Private (default): No anonymous access\n• Blob: Anonymous read access for individual blobs only (users need the full blob URL)\n• Container: Anonymous read access for blobs AND directory listing\n\nFor serving static web content where users know the blob URLs: Use 'Blob' access level.\n\nURL format after configuration:\nhttps://<account>.blob.core.windows.net/<container>/<blobname>\n\nAdditional considerations:\n• Microsoft recommends disabling public blob access for security (use Azure CDN + managed identity or SAS instead)\n• Static website hosting creates a special '$web' container with its own endpoint\n\n• SAS tokens require appending the token to each URL — not truly anonymous access, and maintenance overhead\n• Static website hosting provides a web endpoint with index.html support — a different use case (hosting HTML apps)\n• CORS allows web browsers to make cross-origin requests but doesn't grant anonymous blob access — still need the access level set",
    reference: "https://learn.microsoft.com/azure/storage/blobs/anonymous-read-access-configure"
  },

  {
    id: 231,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You need to host a single-page application (SPA) with React directly from Azure Blob Storage. Users should access the application at a URL like https://myapp.z13.web.core.windows.net. Which feature should you enable?",
    options: [
      "Create a blob container named 'web' and set its access level to Container",
      "Enable 'Static website' hosting on the storage account and upload files to the '$web' container",
      "Enable Azure CDN and configure an origin for the storage account",
      "Create a blob container with CORS enabled and set anonymous read access"
    ],
    correct: [1],
    explanation: "Azure Blob Storage Static Website hosting enables you to serve static web applications directly from storage.\n\nConfiguration:\n1. Storage Account → Data management → Static website → Enabled\n2. Set Index document name: index.html\n3. Set Error document path: 404.html (or index.html for SPA client-side routing)\n4. A '$web' container is automatically created\n5. Upload your application files to the '$web' container\n\nEndpoints:\n• Primary: https://<account>.z13.web.core.windows.net (the 'zone' number varies by region)\n• Secondary (if RA-GRS): https://<account>-secondary.z13.web.core.windows.net\n\nFor SPA client-side routing:\n• Set Error document to index.html (so React Router handles routing, not Azure returning 404)\n\nFor custom domain with HTTPS:\n• Map a custom domain to the static website endpoint\n• Use Azure CDN or Azure Front Door to add HTTPS/TLS with the custom domain\n\n• Container named 'web' with public access does NOT provide a proper index document — just blob access\n• Azure CDN improves performance but static website must be enabled first\n• CORS with anonymous read access enables cross-origin access to blobs but doesn't serve HTML as a web app with index document support",
    reference: "https://learn.microsoft.com/azure/storage/blobs/storage-blob-static-website"
  },

  {
    id: 232,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You need to configure a lifecycle management policy to apply ONLY to blobs with the tag 'Environment=Production' in the 'logs' container. Which filter combination should you use?",
    options: [
      "Prefix match: 'logs/' — this filters to the logs container",
      "Blob index match: 'Environment' = 'Production' — this filters by tag",
      "Prefix match: 'logs/' AND blob index match: 'Environment' = 'Production' — this filters by both container and tag",
      "Container filter: 'logs' AND blob type: 'blockBlob'"
    ],
    correct: [2],
    explanation: "Lifecycle management policies support combining multiple filter conditions to precisely target blobs:\n\n1. Prefix match: Filters by blob name prefix\n   • 'logs/' matches all blobs in the 'logs' container (container name is part of the blob path)\n   • Can include subdirectory prefixes: 'logs/2026/01/'\n\n2. Blob index match: Filters by blob index tags (key=value pairs)\n   • Tags are searchable metadata stored WITH the blob\n   • Filter: { 'name': 'Environment', 'op': '==', 'value': 'Production' }\n\n3. Blob type filter: Filters by blob type (blockBlob, appendBlob, pageBlob)\n\nCombining prefix + tag match:\n{\n  'filters': {\n    'blobTypes': ['blockBlob'],\n    'prefixMatch': ['logs/'],\n    'blobIndexMatch': [{ 'name': 'Environment', 'op': '==', 'value': 'Production' }]\n  }\n}\n\nNote: Blob index tags require 'Storage Blob Data Owner' role to set, and the blob index store must be populated (tags set on blobs).\n\n• Prefix match alone (just 'logs/') would apply to ALL blobs in the logs container, not just Production-tagged ones\n• Blob index match alone would apply to ALL Production-tagged blobs across all containers in the account\n• 'Container filter' is not a valid lifecycle policy filter type — use prefix match with container name as prefix",
    reference: "https://learn.microsoft.com/azure/storage/blobs/lifecycle-management-policy-configure"
  },

  {
    id: 233,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You need to take a point-in-time snapshot of a blob named 'database-backup.vhd' (a page blob used for a VM disk). The snapshot should capture the blob's exact state at a specific moment for backup purposes. Which feature should you use?",
    options: [
      "Blob versioning — automatically creates a version whenever the blob is modified",
      "Manual blob snapshot — creates a read-only copy of the blob at the specific moment you initiate it",
      "Blob soft delete — protects against accidental deletion for the retention period",
      "Lifecycle management policy — moves the blob to Archive tier after 30 days"
    ],
    correct: [1],
    explanation: "Blob Snapshots are user-initiated, point-in-time read-only copies of a blob. They capture the exact state of the blob at the moment the snapshot is created.\n\nSnapshot characteristics:\n• Read-only: Snapshot content cannot be modified\n• Stored in the same container as the base blob\n• Identified by a datetime timestamp (snapshot time)\n• URL format: https://<account>.blob.core.windows.net/<container>/<blob>?snapshot=2026-05-07T10:00:00.0000000Z\n• Incremental storage: Snapshots only store the CHANGED pages/blocks since the previous snapshot (efficient for page blobs like VHDs)\n\nFor VM disk backups using page blob snapshots:\n• Azure VM Backup uses incremental snapshots for efficient disk backup\n• Only changed pages are stored in subsequent snapshots\n• Can restore by copying snapshot back to a page blob\n\nSnapshot vs Versioning:\n• Snapshots: User-initiated, explicit, available for all blob types, used for VHD backups\n• Versioning: Automatic, triggered by any write operation, primarily for block blobs in GPv2 accounts\n\n• Blob versioning is designed for block blobs and is automatic — you can't initiate a 'version' on demand for a VHD\n• Soft delete protects against deletion but doesn't capture pre-modification state\n• Lifecycle management manages blob tiers and deletion — not for point-in-time backup captures",
    reference: "https://learn.microsoft.com/azure/storage/blobs/snapshots-overview"
  },

  {
    id: 234,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You need to copy blobs from a source storage account to a destination storage account in a different Azure region. Both accounts use SAS tokens for authentication. Which AzCopy command performs a server-to-server (cloud-to-cloud) copy without downloading data locally?",
    options: [
      "azcopy copy 'https://source.blob.core.windows.net/container?SAS' 'https://dest.blob.core.windows.net/container?SAS' --recursive",
      "azcopy sync 'https://source.blob.core.windows.net/container?SAS' 'https://dest.blob.core.windows.net/container?SAS' --delete-destination=true",
      "azcopy make 'https://dest.blob.core.windows.net/container?SAS'",
      "azcopy login && azcopy transfer 'source-URL' 'dest-URL'"
    ],
    correct: [0],
    explanation: "When both source and destination URLs point to Azure Storage, AzCopy performs a server-side copy using Azure's internal APIs — data never flows through your local machine.\n\nCommand:\nazcopy copy 'https://source.blob.core.windows.net/container?SAS' 'https://dest.blob.core.windows.net/container?SAS' --recursive\n\nAzCopy uses 'Put Block from URL' (block blobs) or 'Put Page from URL' (page blobs) APIs internally — the transfer happens entirely within Azure's infrastructure.\n\nAzCopy key commands:\n• copy: One-way copy — copies source to destination (destination may have extra files not removed)\n• sync: Mirrors source to destination — optionally deletes files at destination not in source\n  --delete-destination=true removes extra files at destination (use carefully)\n• make: Creates a new container or file share\n• remove: Deletes blobs or files\n• list: Lists blobs, files, or shares\n• login: Authenticates with Microsoft Entra ID (alternative to SAS)\n\nFor cross-account sync (keep both in sync, remove extras from dest):\nazcopy sync 'sourceURL' 'destURL' --delete-destination=true\n\n• sync with --delete-destination=true would delete files at destination that don't exist in source — potentially destructive\n• make only creates a container, doesn't copy data\n• 'azcopy transfer' is not a valid AzCopy command — the command is 'copy'",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-use-azcopy-blobs-copy"
  },

  {
    id: 235,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "yesno",
    scenario: "You have an Azure Files file share using transaction-optimized tier in a GPv2 storage account. You want to migrate it to a Premium (SSD-backed) FileStorage account for lower latency.",
    question: "You can change the performance tier of an existing Azure file share from Standard to Premium in-place, without creating a new FileStorage account.",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "No — you CANNOT change an existing Azure file share from Standard to Premium in-place. Standard file shares are in a General Purpose v2 (GPv2) account, while Premium file shares require a FileStorage account — these are different storage account types.\n\nMigration procedure:\n1. Create a new FileStorage account (Premium performance)\n2. Create a new Premium file share in the new account\n3. Use Robocopy or Azure File Sync to copy data from the Standard share to the Premium share\n4. Update application connection strings to point to the new Premium share\n5. Validate the migration, then delete the old Standard share\n\nAlternatively, use Azure File Sync to perform an online migration:\n1. Configure File Sync on the Standard share\n2. Register both old and new servers/shares to the same sync group\n3. Allow sync to complete\n4. Remove the old endpoint\n\nTier changes WITHIN Standard (GPv2) shares are supported in-place:\n• Transaction-optimized ↔ Hot ↔ Cool can be changed without data migration\n\n• Standard to Premium requires creating a new FileStorage account — fundamentally different account type",
    reference: "https://learn.microsoft.com/azure/storage/files/storage-how-to-create-file-share"
  },

  {
    id: 236,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You have blobs in a storage account that need to be classified by their data classification level. You want to filter and manage these blobs based on the classification tag (e.g., 'DataClass=Confidential'). Which Azure Storage feature enables storing searchable metadata tags directly on individual blobs?",
    options: [
      "Azure resource tags applied to the storage account",
      "Blob metadata (custom key-value pairs stored with each blob)",
      "Blob index tags stored in the blob index store",
      "Container metadata applied at the container level"
    ],
    correct: [2],
    explanation: "Blob index tags are searchable key-value pairs stored in a secondary index alongside the blob. Unlike regular blob metadata, blob index tags support server-side filtering and searching.\n\nBlob index tags:\n• Stored in the blob index store (secondary index)\n• Queryable: You can SEARCH across all blobs in an account by tag (without knowing blob names)\n• Supported in: Lifecycle management policies (blobIndexMatch filter), blob listing filters\n• Up to 10 index tags per blob\n• Tag key: 1-128 characters; Tag value: 0-256 characters\n• Cost: Indexed tag storage and query operations\n• RBAC: 'Storage Blob Data Owner' or custom role with blob tag permissions\n\nQuery example:\naz storage blob list --account-name SA1 --container-name container1 --query \"[?tags.DataClass=='Confidential']\"\n\nBlob metadata vs Index tags:\n• Blob metadata: Not indexed, not searchable server-side, returned with blob properties\n• Blob index tags: Indexed, searchable across all containers/blobs in an account\n\nAzure resource tags: Applied to Azure resources (storage accounts, VMs) — not to individual blobs\nContainer metadata: Applied at container level — cannot filter individual blobs\n\nBlob index tags are also supported in lifecycle management policies to tier/delete specific blobs.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/storage-manage-find-blobs"
  },

  {
    id: 237,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "multi",
    question: "You are configuring a lifecycle management policy for a blob container. Which TWO actions can a lifecycle management policy perform on base blobs?",
    options: [
      "Tier blobs to Cool after a specified number of days since last modification",
      "Automatically enable blob versioning when blobs are modified",
      "Delete blobs after a specified number of days",
      "Convert append blobs to block blobs after 30 days",
      "Enable soft delete on blobs that are about to be tiered"
    ],
    correct: [0, 2],
    explanation: "Lifecycle management policies can perform the following actions on base blobs:\n\nTier transitions:\n• tierToCool: Move to Cool tier after N days since modification/last access\n• tierToCold: Move to Cold tier after N days\n• tierToArchive: Move to Archive tier after N days\n• enableAutoTierToHotFromCool: Automatically promote back to Hot when accessed (requires last-access tracking)\n\nDeletion:\n• delete: Permanently delete the blob after N days\n\nNot supported by lifecycle management policies:\n• Enabling blob versioning — versioning is enabled at account level, not via lifecycle policy\n• Converting blob types (append → block) — blob types are fixed at creation and cannot be changed\n• Enabling soft delete — soft delete is a storage account setting, not a lifecycle action\n\nPolicy also supports actions on:\n• Snapshots: tier or delete snapshots older than N days\n• Versions: tier or delete blob versions older than N days",
    reference: "https://learn.microsoft.com/azure/storage/blobs/lifecycle-management-overview"
  },

  {
    id: 238,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You have enabled blob soft delete with a 14-day retention period and blob versioning on a storage account. A user deletes a blob that has 3 previous versions. What happens to the deleted blob and its versions?",
    options: [
      "The current version and all previous versions are permanently deleted immediately",
      "The current version becomes a previous version (soft-deleted); the 3 existing previous versions are unaffected and remain accessible by version ID",
      "All 4 versions (current + 3 previous) are soft-deleted and become inaccessible for 14 days",
      "The current version is soft-deleted; the 3 previous versions are also soft-deleted with their own 14-day retention timers"
    ],
    correct: [1],
    explanation: "When blob versioning is enabled and a blob is deleted:\n\nBefore deletion:\n• Current version: the active blob\n• 3 previous versions: read-only older versions\n\nAfter deletion:\n• The DELETE operation: Azure promotes the current version to become a previous version\n• The blob disappears from normal listing (no current version exists)\n• The 3 existing previous versions: Remain UNCHANGED — still accessible by their version IDs\n• The just-promoted version: Also accessible by its version ID\n• The blob can be restored by copying any previous version back as the current version\n\nWith versioning enabled:\n• Blob soft delete adds extra protection for versions — if a version is 'soft-deleted', it's retained for the soft delete period\n• Without versioning: soft delete marks the blob as soft-deleted, still accessible in 'show deleted' view\n• With versioning: deletion creates a 'delete marker' (a new version with no content) — previous versions remain\n\nRestore a deleted blob with versioning:\naz storage blob copy start --source-if-match ... (copy previous version to current)\nOr use the 'Promote version' option in Azure portal\n\n• Deletion with versioning doesn't permanently delete anything immediately\n• Previous versions are unaffected by the deletion of the current version",
    reference: "https://learn.microsoft.com/azure/storage/blobs/versioning-overview#how-deleting-a-blob-works"
  },

  {
    id: 239,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You need to monitor all read, write, and delete operations against an Azure Storage account for a security audit. Which diagnostic setting destination provides the best capability for querying logs using KQL?",
    options: [
      "Archive to a storage account",
      "Send to an Event Hub",
      "Send to a Log Analytics workspace",
      "Enable Azure Storage metrics in Azure Monitor"
    ],
    correct: [2],
    explanation: "Sending diagnostic logs to a Log Analytics workspace enables querying with Kusto Query Language (KQL), which is the most powerful option for security analysis and investigation.\n\nConfiguration:\n1. Storage Account → Monitoring → Diagnostic settings\n2. Add diagnostic setting\n3. Select categories: StorageRead, StorageWrite, StorageDelete\n4. Destination: Log Analytics workspace\n\nUseful KQL queries:\n\n// All failed requests in last 24h\nStorageBlobLogs\n| where TimeGenerated > ago(24h)\n| where StatusCode >= 400\n| project TimeGenerated, CallerIpAddress, OperationName, StatusCode, Uri\n\n// Top callers by operation count\nStorageBlobLogs\n| summarize Count=count() by CallerIpAddress, OperationName\n| order by Count desc\n\nDiagnostic destination comparison:\n• Log Analytics workspace: Interactive KQL queries, dashboards, alerts, long-term retention — BEST for security audit\n• Storage account: Archival/compliance, low cost, JSON format, not interactive\n• Event Hub: Real-time streaming to SIEM tools (Splunk, Sentinel) — good for real-time alerting\n\nAzure Storage Metrics:\n• Shows aggregate performance data (requests/sec, latency, capacity)\n• NOT per-request audit logs — wrong tool for security audit",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-analytics-logging"
  },

  {
    id: 240,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "dragdrop",
    question: "Match each Azure Storage redundancy option to its correct description.",
    dragItems: [
      "LRS",
      "ZRS",
      "GRS",
      "RA-GRS",
      "GZRS"
    ],
    dropZones: [
      "3 synchronous copies within a single datacenter. No zone or geo-redundancy.",
      "3 synchronous copies across 3 availability zones in the same region.",
      "3 copies in primary region (LRS) + 3 copies asynchronously replicated to a secondary region. Secondary is NOT readable.",
      "3 copies in primary region (LRS) + 3 copies in secondary region. Secondary endpoint IS readable.",
      "3 copies across 3 AZs in primary (ZRS) + 3 copies asynchronously in a secondary region. Secondary NOT readable."
    ],
    correct: [[0,0],[1,1],[2,2],[3,3],[4,4]],
    explanation: "Azure Storage redundancy options:\n\nLRS (Locally Redundant Storage):\n• 3 synchronous copies within ONE datacenter in the primary region\n• Lowest cost, no geo or zone redundancy\n• Protects against: server/rack failures\n• Does NOT protect against: datacenter or regional outages\n\nZRS (Zone-Redundant Storage):\n• 3 synchronous copies across 3 different availability zones in the primary region\n• Protects against: zone failures\n• Does NOT protect against: regional outages\n\nGRS (Geo-Redundant Storage):\n• LRS in primary (3 copies) + asynchronous replication to secondary region (3 copies with LRS)\n• Secondary is NOT readable — failover only\n• 16 nines durability\n\nRA-GRS (Read-Access Geo-Redundant Storage):\n• Same as GRS but with READ access to the secondary endpoint\n• Secondary endpoint: https://<account>-secondary.blob.core.windows.net\n• Read RPO: Typically < 15 minutes\n\nGZRS (Geo-Zone-Redundant Storage):\n• ZRS in primary (3 AZs) + asynchronous replication to secondary (LRS)\n• Secondary is NOT readable (use RA-GZRS for read access)\n• Maximum resilience within primary region + geo-protection",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-redundancy"
  },

  {
    id: 241,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "You need to assign read-only access to a specific blob container to a developer. The developer has an Entra ID account. Which role provides the minimum permissions needed to read blobs in that container?",
    options: [
      "Storage Account Contributor — manages the storage account and its configuration",
      "Storage Blob Data Reader — read and list blobs in the container",
      "Reader — provides read access to all Azure resources in the scope",
      "Storage File Data SMB Share Reader — read files in Azure Files shares"
    ],
    correct: [1],
    explanation: "Azure Storage has a separate set of data-plane RBAC roles distinct from the management-plane roles:\n\nData-plane roles for Blob Storage:\n• Storage Blob Data Owner: Full access including ACL management and special operations\n• Storage Blob Data Contributor: Read, write, and delete blobs and containers\n• Storage Blob Data Reader: READ and LIST blobs only — minimum for read-only access\n• Storage Blob Delegator: Allows getting a user delegation key (needed to create user delegation SAS)\n\nManagement-plane roles (WRONG for data access):\n• Storage Account Contributor: Manage the storage account resource in Azure Resource Manager; can access keys but has no direct data-plane permissions\n• Reader: View Azure resources but no data access\n\nScope assignment:\n• Assign Storage Blob Data Reader at the CONTAINER scope for minimum privilege\n• Navigate to: Storage Account → Containers → [container] → Access Control (IAM) → Add role assignment\n\nAuthentication for data access:\n• Entra ID roles: Use 'Azure Active Directory' authorization in portal\n• Account keys / SAS: For applications without Entra ID identity\n\n• Storage Account Contributor grants key access but NOT direct Entra data-plane permissions\n• Reader role grants Azure Resource Manager read access, not blob data access\n• Storage File Data SMB Share Reader is for Azure Files, not Blob Storage",
    reference: "https://learn.microsoft.com/azure/storage/blobs/assign-azure-role-data-access"
  },

  {
    id: 242,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You have an Azure Files share on a Standard (GPv2) storage account in the 'transaction-optimized' tier. The share is accessed infrequently and you want to reduce storage costs. Which tier should you move it to?",
    options: [
      "Hot tier — provides lower per-GB cost than transaction-optimized",
      "Cool tier — provides the lowest per-GB storage cost but higher transaction costs",
      "Archive tier — provides the lowest cost for long-term archival",
      "Premium tier — provides higher performance with predictable pricing"
    ],
    correct: [1],
    explanation: "Azure Files Standard tier options (in a GPv2 storage account):\n\n• Transaction-optimized: Highest per-transaction throughput, moderate per-GB and transaction costs. Best for: high-churn workloads, many small I/O operations.\n\n• Hot: Balanced storage and transaction costs. Best for: general-purpose file sharing, team collaboration.\n\n• Cool: Lowest per-GB storage cost, but higher per-transaction costs. Best for: infrequently accessed data, archival file shares.\n\nFor infrequent access → Cool tier minimizes storage costs:\n• Per-GB cost: Cool < Hot < Transaction-optimized\n• Per-transaction cost: Cool > Hot > Transaction-optimized\n\nTier change: In-place within GPv2 — no data migration needed:\nStorage Account → File Shares → [share] → Change tier\n\nNote: You CANNOT tier Azure Files to Archive (Archive is only for Blob Storage).\n\nFor very infrequent access with no real-time needs:\n• Azure File Sync with cloud tiering is another option (keep stubs on-premises)\n\n• Hot tier has lower per-GB cost than transaction-optimized but Cool is lower still\n• Archive is not available for Azure Files — only for Blob Storage\n• Premium is a different storage account type (FileStorage), not a tier change option from Standard",
    reference: "https://learn.microsoft.com/azure/storage/files/understanding-billing"
  },

  {
    id: 243,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "yesno",
    scenario: "Your organization is implementing a storage account for a web application. The application uses Azure Managed Identity to authenticate to Azure Storage. You have assigned the 'Storage Blob Data Contributor' role to the managed identity at the storage account scope.",
    question: "The application will be able to read, write, and delete blobs in ALL containers in the storage account without needing a connection string or access key.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — when a managed identity is assigned the 'Storage Blob Data Contributor' role at the STORAGE ACCOUNT scope, it has read, write, and delete access to blobs in ALL containers in that storage account.\n\nStorage Blob Data Contributor permissions:\n• Read blobs and containers (GET)\n• Write/upload blobs (PUT)\n• Delete blobs (DELETE)\n• List containers and blobs\n\nManaged Identity + RBAC is the recommended approach for application authentication because:\n• No credentials to manage (no connection strings, no keys, no SAS tokens in code)\n• Identity is automatically rotated by Azure\n• Access can be audited via Microsoft Entra ID sign-in logs\n• Supports principle of least privilege (scope assignment to specific container if needed)\n\nCode example (Python):\nfrom azure.identity import DefaultAzureCredential\nfrom azure.storage.blob import BlobServiceClient\n\ncredential = DefaultAzureCredential()\nclient = BlobServiceClient(account_url='https://SA1.blob.core.windows.net', credential=credential)\n\nNote: Scope assignment at storage account level means ALL containers. For least privilege, assign at container scope instead.\n\nManaged identities are available for:\n• Azure VMs, VMSS\n• Azure App Service, Functions, Container Apps, AKS\n• Azure Logic Apps, Data Factory\n• And many other Azure services",
    reference: "https://learn.microsoft.com/azure/storage/blobs/authorize-managed-identity"
  },

  {
    id: 244,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    question: "You need to enable infrastructure encryption (double encryption) on a storage account where all data should be encrypted with TWO layers of encryption using different algorithms and keys. When must this be configured?",
    options: [
      "It can be enabled at any time in the storage account Encryption settings",
      "It must be enabled at storage account creation time; it cannot be enabled on an existing account",
      "It requires a separate Azure Disk Encryption configuration and Key Vault",
      "It is automatically enabled for all storage accounts using customer-managed keys"
    ],
    correct: [1],
    explanation: "Infrastructure encryption (also called 'double encryption') adds a second layer of encryption at the infrastructure level on top of the standard storage service encryption.\n\nKey facts:\n• Standard Azure Storage encryption: All data is encrypted at rest using AES-256 (service encryption)\n• Infrastructure encryption: Adds a SECOND layer of AES-256 encryption at the infrastructure level\n• Two independent encryption keys and algorithms\n\nCRITICAL: Infrastructure encryption MUST be enabled at storage account CREATION time.\n• It CANNOT be enabled on an existing storage account\n• Once set during creation, it cannot be disabled\n\nHow to enable:\n• Azure portal: During account creation → Advanced tab → Enable infrastructure encryption\n• CLI: az storage account create ... --require-infrastructure-encryption true\n• ARM template: 'requireInfrastructureEncryption': true\n\nUse cases: Regulatory compliance requiring double encryption (e.g., healthcare, government, financial).\n\nCombinations possible:\n• Microsoft-managed keys (MMK) + infrastructure encryption\n• Customer-managed keys (CMK) + infrastructure encryption\n• CMK can be configured after creation; infrastructure encryption cannot\n\n• Standard service encryption (AES-256) is always on and cannot be disabled\n• Infrastructure encryption is separate from Azure Disk Encryption (for VM OS/data disks)\n• CMK does not automatically enable infrastructure encryption",
    reference: "https://learn.microsoft.com/azure/storage/common/infrastructure-encryption-enable"
  },

  {
    id: 245,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You have a storage account with blob versioning enabled. You want to automatically delete blob versions that are older than 90 days to control storage costs. Which feature should you configure?",
    options: [
      "Blob soft delete with a 90-day retention period",
      "A lifecycle management policy with a 'delete' action targeting previous versions older than 90 days",
      "An Azure Function that queries versioned blobs daily and deletes old ones",
      "Object replication policy to replicate old versions to a cheaper storage account"
    ],
    correct: [1],
    explanation: "Lifecycle management policies support managing blob versions separately from base blobs. You can define rules that delete previous versions after a specified number of days.\n\nPolicy rule for version management:\n{\n  'rules': [{\n    'name': 'delete-old-versions',\n    'type': 'Lifecycle',\n    'definition': {\n      'filters': { 'blobTypes': ['blockBlob'] },\n      'actions': {\n        'version': {\n          'delete': { 'daysAfterCreationGreaterThan': 90 }\n        }\n      }\n    }\n  }]\n}\n\nThis deletes blob versions where the version creation date is older than 90 days.\n\nLifecycle management version actions:\n• version.delete: Delete versions older than N days\n• version.tierToCool: Move versions to Cool after N days\n• version.tierToArchive: Move versions to Archive after N days\n\nLife cycle management snapshot actions:\n• snapshot.delete: Delete snapshots older than N days\n• snapshot.tierToCool / tierToArchive: Similar for snapshots\n\n• Soft delete protects DELETED blobs temporarily — it doesn't manage version retention\n• Azure Function approach works but requires maintenance and adds complexity\n• Object replication copies data to another account — doesn't delete old versions from source",
    reference: "https://learn.microsoft.com/azure/storage/blobs/lifecycle-management-overview#manage-versions"
  },

  {
    id: 246,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "multi",
    question: "You are configuring Azure Storage network access controls. Which TWO statements about storage account firewall rules are correct?",
    options: [
      "IP firewall rules can specify individual IP addresses or CIDR ranges for IPv4 addresses",
      "VNet rules (service endpoints) grant access based on the private IP of the resource within the VNet",
      "You can add a VNet subnet to storage firewall rules without enabling a service endpoint on the subnet",
      "When 'Allow Azure services on the trusted services list' is enabled, all Azure resources automatically bypass the firewall",
      "Firewall rules apply to all storage services (Blob, Files, Queues, Tables) on the storage account"
    ],
    correct: [0, 4],
    explanation: "Azure Storage firewall rule facts:\n\nCORRECT:\n• IP firewall rules: Accept individual IPv4 addresses (e.g., 203.0.113.5) or CIDR ranges (e.g., 10.0.0.0/24). IPv6 is NOT supported.\n• Firewall rules apply to ALL storage services on the account: Blob, Files, Queues, and Tables — you cannot restrict by service type at the firewall level.\n\nINCORRECT explanations:\n• VNet rules (service endpoints): Grant access based on the SUBNET identity (not private IP). Service endpoints allow the subnet's traffic to be identified by Azure as coming from that specific VNet/subnet — the traffic still uses private routing but originates from the subnet's identity.\n• You CANNOT add a VNet subnet to storage firewall rules without first enabling the Microsoft.Storage service endpoint on that subnet.\n• 'Allow trusted services' does NOT grant access to ALL Azure resources — only specific first-party Microsoft services on the trusted list (e.g., Azure Backup, Azure Data Factory). A generic Azure VM is NOT on the trusted list.\n\nPrivate endpoints bypass firewall rules entirely — traffic through private endpoints is always allowed (the firewall rules apply to the public endpoint only).",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-network-security"
  },

  {
    id: 247,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You need to create an Azure file share that can be accessed by Linux clients using the NFS 4.1 protocol. Which storage account type is required?",
    options: [
      "General Purpose v2 (GPv2) with hot tier — NFS 4.1 is supported on all standard accounts",
      "FileStorage premium account — NFS 4.1 is only supported on premium file shares",
      "BlockBlobStorage premium account with NFS enabled",
      "General Purpose v2 (GPv2) with ZRS redundancy"
    ],
    correct: [1],
    explanation: "NFS 4.1 for Azure Files is only supported on Premium (FileStorage) accounts, not Standard (GPv2) accounts.\n\nAzure Files protocol support:\n\nSMB (Server Message Block):\n• Available on: Standard (GPv2) and Premium (FileStorage) accounts\n• SMB versions: 2.1, 3.0, 3.1.1\n• Clients: Windows, Linux (samba/cifs), macOS\n• Authentication: Storage account key, Kerberos (AD DS, Entra DS, Entra Kerberos)\n\nNFS 4.1:\n• Available on: Premium (FileStorage) ONLY\n• Clients: Linux (kernel 4.4+), macOS\n• Authentication: Network-level (VNet/private endpoint required — no public access for NFS)\n• Identity: Root squash support\n• Requirements: Premium FileStorage account, VNet integration (service endpoint or private endpoint), NFS enabled on the share\n\nConfiguration:\n1. Create FileStorage (Premium) storage account\n2. Create file share → Enable NFS protocol\n3. Configure VNet access (NFS is not supported over public internet)\n4. Mount on Linux: sudo mount -t nfs <account>.file.core.windows.net:/<account>/<share> /mnt/mount\n\n• Standard (GPv2) accounts do NOT support NFS 4.1\n• BlockBlobStorage is for blob operations, not file shares\n• Redundancy type (ZRS) doesn't affect protocol support",
    reference: "https://learn.microsoft.com/azure/storage/files/storage-files-how-to-create-nfs-shares"
  },

  {
    id: 248,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    question: "You are using Azure Storage Explorer to manage storage accounts across multiple Azure subscriptions. A storage account in a different tenant is not appearing in your Explorer. How can you add this cross-tenant storage account to Azure Storage Explorer?",
    options: [
      "You cannot access storage accounts in a different tenant with Storage Explorer",
      "Attach to the storage account using a SAS URL, a connection string, or a storage account name and key",
      "Add the storage account's subscription to your Azure account in Storage Explorer",
      "Enable VNet peering between the two tenants to allow cross-tenant Storage Explorer access"
    ],
    correct: [1],
    explanation: "Azure Storage Explorer supports connecting to storage accounts across different tenants, subscriptions, and even without an Azure account, by using:\n\n1. Connection string: Contains account name + key, enables full access\n2. SAS URL: Grants scoped, time-limited access (blob container, file share, queue, or table level)\n3. Storage account name and key: Direct authentication with account credentials\n4. Blob container or share URI with SAS: Access a specific container without account-level access\n\nTo attach via SAS or connection string in Storage Explorer:\n• Open Storage Explorer → Right-click 'Storage Accounts' → 'Connect to Azure Storage' → Choose connection method\n\nWhy cross-tenant access works:\n• SAS tokens and connection strings are credentials that don't require being in the same Entra tenant\n• Storage Explorer authenticates directly to the storage account endpoint\n\nRecommended for security: Use SAS with minimum permissions and limited expiry rather than sharing account keys.\n\n• Cross-tenant access IS possible via Storage Explorer using credentials\n• Adding a subscription to Storage Explorer requires signing in with that subscription's credentials — only works if you have access to THAT tenant\n• VNet peering is a network feature — doesn't affect Storage Explorer's authentication capability",
    reference: "https://learn.microsoft.com/azure/vs-azure-tools-storage-manage-with-storage-explorer"
  },

  {
    id: 249,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    question: "You have enabled Azure Files snapshots on a file share. A snapshot was taken yesterday. A user has accidentally overwritten a critical file 'project-plan.docx'. How do you restore only that specific file from yesterday's snapshot without restoring the entire share?",
    options: [
      "You must restore the entire file share from the snapshot to recover the file",
      "Select the snapshot in Azure portal → Browse to the file → Restore (overwrites current file) or Download (save locally)",
      "Use Azure Backup File Recovery to download the snapshot as a .tar.gz archive",
      "Roll back the file share to the previous snapshot using AzCopy"
    ],
    correct: [1],
    explanation: "Azure Files snapshots support granular file-level restoration without requiring a full share restore.\n\nFile-level restore from snapshot:\n1. Azure portal: Storage Account → File shares → [share] → Snapshots → Select snapshot → Browse files → Navigate to file → Restore or Download\n   • Restore: Overwrites the current file with the snapshot version\n   • Download: Saves the snapshot version locally (then you can manually copy it back)\n\n2. Windows Explorer (on a Windows machine with the share mounted):\n   • Right-click on the file → Properties → Previous Versions tab → Select snapshot date → Restore or Copy\n\n3. PowerShell:\n   az storage file copy start --source-share <share> --source-path <file-path> --source-snapshot <snapshot-time> --destination-share <share> --destination-path <file-path>\n\nWhat Azure Files snapshots are:\n• Read-only, incremental copies of the file share at a point in time\n• Only changed data is stored in each subsequent snapshot (incremental, delta-based)\n• Maximum: 200 snapshots per file share\n• Manual or automated (Azure Backup for Files creates scheduled snapshots)\n\n• Full share restore from snapshot is possible but unnecessary for single file recovery\n• Azure Backup File Recovery mounts the snapshot as a network share — doesn't produce a tar.gz\n• AzCopy cannot roll back from snapshots directly",
    reference: "https://learn.microsoft.com/azure/storage/files/storage-snapshots-files"
  },

  {
    id: 250,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    question: "Your organization stores financial data in Azure Blob Storage. A recent security audit found that the 'Allow storage account key access' setting is enabled, which means any user with the account key can access all data. Your security team wants to enforce Entra ID-only authentication and disable key-based access. Which setting should you configure?",
    options: [
      "Disable the storage account in the Azure portal to prevent all access",
      "Set 'Allow storage account key access' to Disabled on the storage account",
      "Rotate both storage account keys to random values and discard them",
      "Enable Azure Defender for Storage to block key-based access attempts"
    ],
    correct: [1],
    explanation: "Azure Storage accounts have an option to disable shared key authorization. When disabled, all requests to the storage account MUST use Microsoft Entra ID (OAuth 2.0) authentication.\n\nConfiguration:\nStorage Account → Configuration → Allow storage account key access → Disabled → Save\n\nOr via CLI:\naz storage account update --name SA1 --resource-group RG1 --allow-shared-key-access false\n\nEffects when disabled:\n• Storage account keys are still GENERATED but CANNOT be used to authorize requests\n• SAS tokens (which are signed with account keys) are also BLOCKED\n• Only Entra ID (Azure AD) authentication works: managed identities, service principals, Entra users\n• Azure Storage Explorer, AzCopy, and SDKs must use Entra authentication\n• Azure Key Vault references (if any) using account key will break\n\nBefore disabling:\n• Ensure all applications are migrated to use managed identities or service principals\n• Update any SAS-based integrations\n• Test thoroughly in non-production first\n\n• Disabling the storage account blocks ALL access — too drastic\n• Rotating keys to random values is not a valid strategy as keys can be regenerated\n• Azure Defender for Storage (Defender for Cloud) provides threat detection but doesn't enforce Entra-only auth",
    reference: "https://learn.microsoft.com/azure/storage/common/shared-key-authorization-prevent"
  }

]); // end QUESTIONS.push


// ─── Microsoft Practice Assessment — Domain 2 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 251,
    domain: 2,
    subdomain: "Storage Security",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a storage account named storage1 and is linked to a Microsoft Entra tenant named contoso.com.\nYou plan to provide identity-based access to storage1.\nWhich storage1 data service can be configured to use identity-based access?",
    options: [
      "containers",
      "file shares",
      "queues",
      "tables"
    ],
    correct: [1],
    explanation: "File shares can be configured to use Microsoft Entra Kerberos to provide identity-based access to data storage. Containers, queues, and tables do not support identity-based access in the same way Azure Files does."
  },
  {
    id: 252,
    domain: 2,
    subdomain: "Storage Security",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a storage account named storage1.\nYou need to grant a third-party application access to storage1 for the next 30 days.\nWhat should you use?",
    options: [
      "a conditional access policy",
      "a shared access signature",
      "an access key",
      "an Azure role"
    ],
    correct: [1],
    explanation: "The correct solution is to use a shared access signature (SAS), because only SAS can specify time limited access to Azure storage. An Access key provides unlimited access to Azure storage account, an Azure role can provide access and/or management of Azure resource, which is not time limited and a conditional access policy acts as a zero-trust, \"if-then\" policy engine that evaluates signals like user identity, device compliance, location, and risk to make real-time access decisions."
  },
  {
    id: 253,
    domain: 2,
    subdomain: "Storage Redundancy",
    type: "single",
    source: "MS Practice Assessment",
    question: "Your need to create an Azure Storage account that meets the following requirements:\nStores data in a minimum of two availability zones\nProvides high availability\nWhich type of storage redundancy should you use?",
    options: [
      "geo-redundant storage (GRS)",
      "locally-redundant storage (LRS)",
      "read-access geo-redundant storage (RA-GRS)",
      "zone-redundant storage (ZRS)"
    ],
    correct: [3],
    explanation: "Zone-redundant storage (ZRS) replicates a storage account synchronously across three Azure availability zones in the primary region. For ensuring high availability, Microsoft recommends using ZRS in the primary region and also replicating to a secondary region."
  },
  {
    id: 254,
    domain: 2,
    subdomain: "Storage Tools",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure Storage account named corpimages and an on-premises shared folder named \\\\server1\\images.\nYou need to migrate all the contents from \\\\server1\\images to corpimages.\nWhich two commands can you use? Each correct answer presents a complete solution.",
    options: [
      "Azcopy copy \\\\server1\\images https://corpimages.blob.core.windows.net/public -recursive",
      "Azcopy sync \\\\server1\\images https://corpimages.blob.core.windows.net/public -recursive",
      "Get-ChildItem -Path \\\\server1\\images -Recurse | Set-AzStorageBlobContent -Container \"corpimages\"",
      "Set-AzStorageBlobContent -Container \"ContosoUpload\" -File \"\\\\server1\\images\" -Blob \"corporateimages \""
    ],
    correct: [0, 2],
    explanation: "The AzCopy command allows you to copy all files to a storage account. You then use Get-ChildItem with the path parameter, recurse to select everything, and then use the Set-AzStorageBlobContent cmdlet."
  },
  {
    id: 255,
    domain: 2,
    subdomain: "Blob Storage",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have two premium block blob Azure Storage accounts named storage1 and storage2.\nYou need to configure object replication from storage1 to storage2.\nWhich three features should be enabled before configuring object replication? Each correct answer presents part of the solution.",
    options: [
      "blob versioning for storage1",
      "blob versioning for storage2",
      "change feed for storage1",
      "change feed for storage2",
      "point-in-time restore for the containers on storage1",
      "point-in-time restore for the containers on storage2"
    ],
    correct: [0, 1, 2],
    explanation: "Object replication can be used to replicate blobs between storage accounts. Before configuring object replication, you must enable blob versioning for both storage accounts, and you must enable the change feed for the source account."
  },
  {
    id: 256,
    domain: 2,
    subdomain: "Storage Accounts",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription.\nYou plan to create a storage account named storage1.\nYou need to ensure that storage1 provides POSIX-compliant access control lists (ACLs).\nWhich option should you configure when creating storage1?",
    options: [
      "access tier",
      "hierarchical namespace",
      "SFTP",
      "version-level immutable support"
    ],
    correct: [1],
    explanation: "To enable POSIX-compliant access control lists (ACLs), the hierarchical namespace must be used. The remaining options are valid for a storage account, but do not provide the POSIX-compliant feature."
  },
  {
    id: 257,
    domain: 2,
    subdomain: "Blob Storage",
    type: "single",
    source: "MS Practice Assessment",
    question: "A company is using Azure Blob Storage to store large amounts of unstructured data that is accessed infrequently but requires fast retrieval when needed.\nYou need to minimize storage costs while ensuring data retrieval performance is not compromised.\nWhat should you do?",
    options: [
      "Configure the access tier of the Azure Blob Storage account to Cold.",
      "Configure the access tier of the Azure Blob Storage account to Hot.",
      "Enable Azure Storage account object replication.",
      "Configure the access tier of the Azure Blob Storage account to Cool."
    ],
    correct: [0],
    explanation: "The Cold access tier is cost-effective for storing large amounts of data that is infrequently accessed. The Hot access tier is more expensive and is optimized for data that is accessed frequently. Object replication is not related to cost optimization but rather to data availability and redundancy."
  },
  {
    id: 258,
    domain: 2,
    subdomain: "Azure Files",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains multiple storage accounts.\nA storage account named storage1 has a file share named share1 that stores marketing videos. Users reported that 99 percent of the assigned storage is used.\nYou need to ensure that share1 can support large files and store up to 100 TiB.\nWhich two PowerShell commands should you run? Each correct answer presents part of the solution.",
    options: [
      "New-AzRmStorageShare -ResourceGroupName RG1 -Name -StorageAccountName storage1 -Name share1 -QuotaGiB 100GB",
      "Set-AzStorageAccount -ResourceGroupName RG1 -Name storage1 -EnableLargeFileShare",
      "Set-AzStorageAccount -ResourceGroupName RG1 -Name storage1 -Type \"Standard_RAGRS\"",
      "Update-AzRmStorageShare -ResourceGroupName RG1 -Name -StorageAccountName storage1 -Name share1 -QuotaGiB 102400"
    ],
    correct: [1, 3],
    explanation: "You must enable the storage account to support large files and update the storage account quota to 102,400 GB. You do not need to change the type of storage account, and you are updating the existing share."
  },
  {
    id: 259,
    domain: 2,
    subdomain: "Blob Storage",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a storage account.\nYou need to recommend a storage solution for storing infrequently accessed data. The solution must meet the following requirements:\nThe data must be stored for at least 90 days.\nThe data must be available within seconds.\nStorage costs must be minimized.\nWhich tier should you recommend?",
    options: [
      "Cold",
      "Cool",
      "Hot",
      "Premium"
    ],
    correct: [0],
    explanation: "The correct solution is the Cold tier, because it is an online storage tier in Azure designed for infrequently accessed data that must remain available within seconds. The Cold tier has a recommended minimum retention period of 90 days, aligning directly with the scenario, and offers lower storage costs than Hot or Cool tiers while still supporting immediate access. The Cool tier requires only 30 days of retention and has higher costs than Cold for long-term storage, the Hot tier is optimized for frequently accessed data at higher storage prices, and the Premium tier is intended for high-performance workloads, not for cost efficiency. Therefore, Cold best satisfies the requirements for cost savings, online availability, and the 90-day storage requirement."
  },
  {
    id: 260,
    domain: 2,
    subdomain: "Storage Security",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a storage account named storage1.\nYou need to provide a partner organization with access to storage1. Access to storage1 must automatically expire after 24 hours.\nWhat should you configure?",
    options: [
      "a shared access signature (SAS)",
      "an access key",
      "Azure CDN",
      "a lifecycle management policy"
    ],
    correct: [0],
    explanation: "A SAS provides secure delegated access to resources in a storage account. With a SAS, you have granular control over how a client can access data, including time restrictions.\nAccess keys and Azure CDN provide permanent access to resources. They will require manual steps to remove access. Lifecycle management is not needed."
  },
  {
    id: 261,
    domain: 2,
    subdomain: "Storage Security",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a storage account named storage1.\nYou need to ensure that access to storage1 is prevented from the internet.\nWhat should you configure on storage1?",
    options: [
      "Networking",
      "Access keys",
      "Shared access signature",
      "Encryption"
    ],
    correct: [0],
    explanation: "The Networking node of a storage account provides settings to configure public network access and network routing. To disable public network access, you can disable public network access, or configure the access to only allow specific virtual networks and IP addresses."
  },
  {
    id: 262,
    domain: 2,
    subdomain: "Storage Redundancy",
    type: "single",
    source: "MS Practice Assessment",
    question: "You need to create an Azure Storage account that meets the following requirements:\nStores data in multiple Azure regions\nSupports reading the data from primary and secondary regions\nWhich type of storage redundancy should you use?",
    options: [
      "read-access geo-redundant storage (RA-GRS)",
      "geo-redundant storage (GRS)",
      "zone-redundant storage (ZRS)",
      "locally-redundant storage (LRS)"
    ],
    correct: [0],
    explanation: "Since you must ensure that data can be read from a secondary region, you must choose read-access geo-redundant storage (RA-GRS). Geo-redundant storage (GRS) replicates to a secondary region but does not allow read access to the secondary region unless read-access is enabled. ZRS and LRS replicate data only within a single region, so they do not store data in multiple Azure regions."
  },
  {
    id: 263,
    domain: 2,
    subdomain: "Blob Storage",
    type: "single",
    source: "MS Practice Assessment",
    question: "You plan to configure object replication between two Azure Storage accounts.\nThe Blob service of the source storage account has the following settings:\nHierarchical namespace: Disabled\nDefault access tier: Hot\nBlob public access: Enabled\nBlob soft delete: Enabled (7 days)\nContainer soft delete: Enabled (7 days)\nVersioning: Disabled\nChange feed: Enabled\nNFS v3: Disabled\nAllow cross-tenant replication: Enabled\nWhich setting should be modified on the source storage account to support object replication?",
    options: [
      "Versioning",
      "Change feed",
      "Hierarchical namespace",
      "Blob public access"
    ],
    correct: [0],
    explanation: "Versioning must be enabled for both the source and destination accounts. In this scenario, versioning is currently disabled. The change feed is already enabled on the source account, which is the other prerequisite. Hierarchical namespace and blob public access are not requirements for object replication."
  },
  {
    id: 264,
    domain: 2,
    subdomain: "Blob Storage",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure Storage account named storageaccount1 with a blob container named container1 that stores confidential information.\nYou need to ensure that content in container1 is not modified or deleted for six months after the last modification date.\nWhat should you configure?",
    options: [
      "the immutability policy",
      "a shared access signature (SAS)",
      "a lifecycle management policy",
      "soft delete"
    ],
    correct: [0],
    explanation: "A time-based retention policy or legal hold policies can be applied to block deletion. Immutability policies can be scoped to a blob version or to a container. A SAS, lifecycle management, and soft delete do not prevent modification or deletion for a fixed retention period."
  },
  {
    id: 265,
    domain: 2,
    subdomain: "Azure Files",
    type: "single",
    source: "MS Practice Assessment",
    question: "Your development team plans to deploy an Azure container instance. The container needs a persistent storage layer.\nWhich service should you use?",
    options: [
      "Azure Files",
      "Azure Blob Storage",
      "Azure Queue Storage",
      "Azure Table Storage"
    ],
    correct: [0],
    explanation: "You can persist data for Azure Container Instances with the use of Azure Files. Azure Files offers fully managed file shares hosted in Azure Storage that are accessible via the industry standard Server Message Block (SMB) protocol."
  },
  {
    id: 266,
    domain: 2,
    subdomain: "Azure Files",
    type: "single",
    source: "MS Practice Assessment",
    question: "Your network contains an on-premises Active Directory Services Domain (AD DS) domain named contoso.com. The domain contains a server named Server1 that runs Windows Server.\nThe domain syncs with a Microsoft Entra tenant named contoso.com.\nYou have an Azure subscription that contains a storage account named storage1. The subscription is linked to contoso.com.\nYou plan to use Server1 to access a file share in storage1.\nWhat should you do first?",
    options: [
      "From File share settings, configure identity-based access for storage1.",
      "Modify the group memberships on Server1.",
      "Change the security settings on the file share.",
      "Create a shared access signature (SAS) for the file share."
    ],
    correct: [0],
    explanation: "The correct solution is to first configure identity-based access for Azure file shares on storage1, because this enables authentication and authorization through Microsoft Entra ID (synchronized from on-premises AD DS). Without enabling identity-based access, Server1 cannot use domain credentials to access the share. Modifying group memberships on Server1 or changing security settings on the file share are relevant only after identity-based access is configured. A shared access signature (SAS) provides token-based access but does not integrate with AD DS/Entra identities, so it would not allow seamless domain authentication. Therefore, enabling identity-based access for the file share is the required first step."
  },
  {
    id: 267,
    domain: 2,
    subdomain: "Storage Security",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure subscription that contains a storage account named storage1. storage1 contains an Azure Files share named share1.\nYou need to ensure that users can authenticate to share1 by using Microsoft Entra and access the file share by using SMB.\nWhat should you do?",
    options: [
      "Configure identity-based access.",
      "Generate a shared access signature (SAS) token.",
      "Regenerate the storage account access keys.",
      "Enable public network access."
    ],
    correct: [0],
    explanation: "Correct - Identity-based access for an Azure Storage account is a security model that uses Microsoft Entra ID or Active Directory to authorize requests to storage data, rather than relying on a static storage account key or SAS.\nIncorrect - SAS tokens and access keys provide key-based access, rather than identity-based access, and enabling public network access does not configure authentication or authorization."
  },
  {
    id: 268,
    domain: 2,
    subdomain: "Storage Accounts",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You need to create an Azure Storage account that supports the Azure Data Lake Storage Gen2 capabilities.\nWhich two types of storage accounts can you use? Each correct answer presents a complete solution.",
    options: [
      "premium block blobs",
      "standard general-purpose v2",
      "standard general-purpose v1",
      "premium file shares"
    ],
    correct: [0, 1],
    explanation: "To support Data Lake Storage, the storage account must support blob storage, which is available as standard general-purpose v2 and premium block blobs. Additionally, when you create the storage account, you must enable the hierarchical namespace. Standard general-purpose v1 and premium file shares do not support Data Lake Storage Gen2."
  },
  {
    id: 269,
    domain: 2,
    subdomain: "Blob Storage",
    type: "single",
    source: "MS Practice Assessment",
    question: "You create an Azure Storage account.\nYou need to create a lifecycle management rule to move blobs to Cool storage if the blobs have not been accessed for 30 days.\nWhat should you do first?",
    options: [
      "Enable access tracking.",
      "Enable blob versioning.",
      "Enable soft delete.",
      "Enable the change feed."
    ],
    correct: [0],
    explanation: "A lifecycle management rule can be used to move or delete blobs automatically. The rule can be based on the time the blob was last modified or the time the blob was last accessed (read or write). To perform an action based on the access time, access tracking must be enabled. This can incur additional storage costs."
  }
]);


// ─── Original Practice Questions — Domain 2 ───
QUESTIONS.push.apply(QUESTIONS, [

  {
    id: 270,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    source: "Original Practice",
    question: "A development team needs to upload and download files to an Azure Blob container using SFTP clients (such as WinSCP and FileZilla) over port 22. The storage account is a General Purpose v2 account. What must be configured to support native SFTP access to Blob Storage?",
    options: [
      "Deploy an Azure VM running an SFTP server and mount the blob container as a disk",
      "Enable the hierarchical namespace (HNS) on the storage account and turn on the SFTP feature, then create local users with credentials",
      "Create a User Delegation SAS and configure the SFTP clients to use it as the password",
      "Enable static website hosting and point the SFTP clients to the $web container"
    ],
    correct: [1],
    explanation: "Azure Blob Storage supports the SSH File Transfer Protocol (SFTP) natively, but it has specific prerequisites:\n• Hierarchical namespace (HNS) MUST be enabled on the storage account (the SFTP feature is built on Azure Data Lake Storage Gen2)\n• The SFTP feature must be explicitly enabled (Settings → SFTP, or 'isSftpEnabled' = true)\n• You create LOCAL USERS specific to SFTP — these are not Entra ID identities\n• Local users authenticate with a password OR an SSH key pair\n• Each local user is granted container-scoped permissions (Read, Write, List, Delete, Create)\n\nConfiguration:\n1. Enable hierarchical namespace (at creation, or upgrade an existing GPv2 account)\n2. Storage Account → Settings → SFTP → Enable SFTP\n3. Add local user → set home directory (container) and permissions → generate password/SSH key\n4. Connect: sftp myaccount.myuser@myaccount.blob.core.windows.net\n\n• Running an SFTP server VM is the legacy workaround — native SFTP removes that need\n• A User Delegation SAS is for REST/HTTPS access, not the SFTP protocol\n• Static website hosting serves HTTP content; it is unrelated to SFTP",
    reference: "https://learn.microsoft.com/azure/storage/blobs/secure-file-transfer-protocol-support"
  },

  {
    id: 271,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    source: "Original Practice",
    question: "You need a daily report listing every blob in a storage account along with its size, access tier, last-modified date, and blob index tags, written automatically to a container as a CSV or Parquet file. Which native Azure Storage feature provides this?",
    options: [
      "Azure Storage metrics in Azure Monitor",
      "Blob inventory (Blob inventory policy)",
      "Storage Analytics logging ($logs container)",
      "Change feed"
    ],
    correct: [1],
    explanation: "Azure Blob Inventory generates a scheduled flat-file report of the blobs and containers in a storage account.\n\nBlob inventory characteristics:\n• Runs daily or weekly based on a configured policy\n• Output format: CSV or Apache Parquet\n• Output is written to a destination container you specify in the same account\n• Captures: blob name, size, access tier, last-modified time, blob type, content type, blob index tags, metadata, and more (selectable fields)\n• Two rule types: 'Inventory' lists blobs; you can also list containers\n• Filters by blob type, prefix, and whether to include snapshots/versions/deleted blobs\n\nConfiguration: Storage Account → Data management → Blob inventory → Add rule.\n\nCommon use cases: reporting/auditing, cost analysis by tier, compliance reporting, and feeding analytics pipelines.\n\n• Storage metrics give aggregate counts and capacity, not a per-blob listing\n• Storage Analytics logging records request-level operations (who did what), not an object inventory\n• Change feed is an ordered log of CHANGES to blobs, not a full point-in-time inventory",
    reference: "https://learn.microsoft.com/azure/storage/blobs/blob-inventory"
  },

  {
    id: 272,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "single",
    source: "Original Practice",
    question: "Your security team requires that blobs in a single container be encrypted with a customer-managed key that is DIFFERENT from the key used by the rest of the storage account, without creating a separate storage account. Which feature lets you assign a distinct encryption key at the container or blob level?",
    options: [
      "Infrastructure encryption (double encryption)",
      "Encryption scopes",
      "Azure Disk Encryption",
      "A storage account-level customer-managed key (CMK)"
    ],
    correct: [1],
    explanation: "Encryption scopes let you manage encryption at the level of an individual container or blob, isolating it from the account-wide encryption settings.\n\nEncryption scopes:\n• Define a scope that uses either a Microsoft-managed key OR a customer-managed key (in Azure Key Vault)\n• Assign a default encryption scope to a container — all blobs uploaded inherit it\n• Or specify a scope per blob upload request\n• Useful for multi-tenant scenarios: each tenant's data uses its own key, in one storage account\n• Can be enabled or disabled; data in a disabled scope is inaccessible until re-enabled\n\nConfiguration: Storage Account → Security + networking → Encryption → Encryption Scopes → Add.\n\n• Infrastructure encryption adds a second platform-managed layer for the WHOLE account — it does not give per-container keys\n• Azure Disk Encryption encrypts VM OS/data disks (BitLocker/dm-crypt), not blob containers\n• An account-level CMK applies ONE key to the entire account, not a distinct key per container",
    reference: "https://learn.microsoft.com/azure/storage/blobs/encryption-scope-overview"
  },

  {
    id: 273,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    source: "Original Practice",
    question: "You want to recover blob data to its state at any point within the last 14 days to protect against accidental bulk overwrites and deletions across a container. Which Azure Blob Storage data protection feature provides this continuous, point-in-time recovery, and what are its prerequisites?",
    options: [
      "Blob snapshots — take a manual snapshot before each bulk operation",
      "Point-in-time restore for block blobs — requires versioning, change feed, and blob soft delete to be enabled",
      "Object replication — replicate to a backup account and restore from it",
      "A LOCKED immutability policy on the container"
    ],
    correct: [1],
    explanation: "Point-in-time restore (PITR) for block blobs lets you restore one or more containers (or a subset of blobs) to a state at a specified earlier time, within a configured retention period (maximum 365 days, but always less than the soft delete retention period).\n\nPITR prerequisites (all must be enabled on the account):\n• Blob versioning\n• Change feed\n• Blob soft delete (soft delete retention must be GREATER than the PITR retention period)\n• Account type: General Purpose v2 (standard) — NOT supported with hierarchical namespace, NFS 3.0, or SFTP\n\nHow it works:\n• Uses the change feed to identify changes and blob versions to revert\n• Restores block blobs only (not append/page blobs, not snapshots)\n• Restore operations are themselves write operations and cannot be undone\n\nConfiguration: Storage Account → Data protection → Enable point-in-time restore for containers.\n\n• Snapshots are manual and per-blob — they do not provide automatic continuous recovery across a container\n• Object replication copies data forward; it is not a time-travel restore mechanism\n• A LOCKED immutability policy PREVENTS changes but offers no 'restore to earlier time' capability",
    reference: "https://learn.microsoft.com/azure/storage/blobs/point-in-time-restore-overview"
  },

  {
    id: 274,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    source: "Original Practice",
    question: "An application running on an Azure VM with a system-assigned managed identity needs to create a User Delegation SAS for blobs so it can hand short-lived tokens to clients. The app already has 'Storage Blob Data Reader'. Generating the user delegation key fails. Which additional role grants the specific permission to obtain a user delegation key?",
    options: [
      "Storage Account Contributor",
      "Storage Blob Delegator",
      "Storage Blob Data Owner",
      "Reader and Data Access"
    ],
    correct: [1],
    explanation: "Creating a User Delegation SAS requires first obtaining a USER DELEGATION KEY from Microsoft Entra ID. The action that authorizes this is 'Microsoft.Storage/storageAccounts/blobServices/generateUserDelegationKey', which is granted by the built-in role Storage Blob Delegator.\n\nTypical assignment for the scenario:\n• Storage Blob Delegator → allows the identity to request the user delegation key\n• Plus a data role (e.g., Storage Blob Data Reader/Contributor) → determines what the SAS itself can be scoped to grant\n\nThe security identity that creates the SAS must have at least the permissions being granted in the SAS, in addition to the delegation key permission.\n\n• Storage Account Contributor is a management-plane role; it can read account keys but does NOT include the generateUserDelegationKey data action\n• Storage Blob Data Owner grants full blob data access and can also generate the key, but it is far broader than needed — Storage Blob Delegator is the minimal, purpose-built role for the delegation key\n• Reader and Data Access grants read on the resource plus list-keys; it is not the delegation-key role",
    reference: "https://learn.microsoft.com/azure/storage/blobs/authorize-access-azure-active-directory"
  },

  {
    id: 275,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    source: "Original Practice",
    question: "Windows 11 devices that are Microsoft Entra joined (no line-of-sight to an on-premises domain controller) must mount an Azure file share over SMB using the signed-in user's Entra identity. The identities are synchronized from on-premises AD DS via Microsoft Entra Connect. Which authentication method should you enable on the storage account?",
    options: [
      "On-premises Active Directory Domain Services (AD DS) authentication",
      "Microsoft Entra Domain Services (Entra DS) authentication",
      "Microsoft Entra Kerberos authentication for hybrid identities",
      "Storage account key authentication"
    ],
    correct: [2],
    explanation: "Microsoft Entra Kerberos authentication for Azure Files allows Microsoft Entra joined (and hybrid Entra joined) Windows devices to access SMB file shares using the user's Entra credentials WITHOUT requiring network line-of-sight to a domain controller.\n\nKey points:\n• Designed for HYBRID identities (synced from AD DS via Microsoft Entra Connect)\n• No domain controller connectivity needed at mount time — Kerberos tickets are issued by Microsoft Entra ID\n• Ideal for remote Windows 11 / Windows 10 Entra joined endpoints (e.g., Azure Virtual Desktop FSLogix profiles)\n• Share-level access via Azure RBAC roles (e.g., Storage File Data SMB Share Contributor); directory/file ACLs still come from Windows ACLs\n\nIdentity source comparison for Azure Files SMB:\n• On-premises AD DS auth: Best when clients are domain-joined and CAN reach a DC\n• Microsoft Entra DS auth: For machines joined to a managed Entra Domain Services domain\n• Microsoft Entra Kerberos: For Entra joined devices, hybrid identities, no on-prem DC line-of-sight required\n\n• AD DS auth requires the client to reach a domain controller — not guaranteed for Entra joined remote devices\n• Entra DS would require an Entra Domain Services managed domain, which is not implied here\n• The storage account key is not an identity and provides no per-user authentication",
    reference: "https://learn.microsoft.com/azure/storage/files/storage-files-identity-auth-hybrid-identities-enable"
  },

  {
    id: 276,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "multi",
    source: "Original Practice",
    question: "You must transfer 600 TB of archival data from an on-premises datacenter to Azure Blob Storage. The site has a 100 Mbps internet uplink, making an online transfer impractical within the project timeline. Which TWO Azure offline (physical) data transfer products are appropriate for moving data of this scale into Azure Storage? Each correct answer presents part of the solution.",
    options: [
      "Azure Data Box (a ruggedized appliance offering roughly 100 TB usable capacity per order)",
      "Azure Data Box Heavy (a high-capacity appliance offering roughly 1 PB usable capacity per order)",
      "AzCopy run with maximum parallel concurrency over the existing 100 Mbps internet link",
      "Azure File Sync with cloud tiering on a branch file server",
      "Azure Import/Export using a single 1 TB USB drive"
    ],
    correct: [0, 1],
    explanation: "For large datasets where available network bandwidth makes an online transfer impractical, Azure offers physical (offline) transfer via the Azure Data Box family.\n\nData Box options by capacity:\n• Data Box Disk: Up to 8 TB per order (set of SSDs) — small datasets\n• Data Box: ~100 TB usable per appliance — mid-size (order several to cover 600 TB)\n• Data Box Heavy: ~1 PB usable per appliance — very large datasets, fits 600 TB in one device\n\nWorkflow: Microsoft ships the device, you copy data locally over SMB/NFS, ship it back, and Azure ingests it into your storage account.\n\nWhy not online: At 100 Mbps, transferring 600 TB would take well over a year of continuous transfer — far beyond a practical project timeline.\n\n• AzCopy is excellent for online transfers but is constrained by the 100 Mbps uplink here\n• Azure File Sync keeps file servers in sync with Azure Files; it is not a bulk one-time blob migration tool for 600 TB\n• Azure Import/Export with a single 1 TB drive cannot hold 600 TB; the modern recommended service for this scale is the Data Box family",
    reference: "https://learn.microsoft.com/azure/databox/data-box-overview"
  },

  {
    id: 277,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "yesno",
    source: "Original Practice",
    scenario: "You configure a blob lifecycle management rule that uses the 'daysAfterLastAccessTimeGreaterThan' condition to tier blobs to Cool after 30 days with no access. After 45 days the rule has not moved any blobs, even though their last-modified dates are very old. The 'last access time tracking' feature was never enabled on the storage account.",
    question: "Enabling last access time tracking on the storage account is required for the 'daysAfterLastAccessTimeGreaterThan' lifecycle condition to evaluate and move the blobs.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — lifecycle policy conditions based on 'daysAfterLastAccessTimeGreaterThan' depend on the last access time being tracked. This requires the 'last access time tracking' feature to be ENABLED on the storage account; otherwise the blobs have no recorded last-access timestamp for the policy to evaluate, and the action never fires.\n\nTo enable:\n• Storage Account → Data management → Lifecycle management (or via 'az storage account blob-service-properties update --enable-last-access-tracking true')\n• Once enabled, read/write operations update the blob's last-access time (writes always update it; reads update it at most once per 24 hours to limit overhead)\n\nKey distinction in lifecycle conditions:\n• daysAfterModificationGreaterThan → based on last-modified time, no extra setting needed\n• daysAfterLastAccessTimeGreaterThan → REQUIRES last access time tracking enabled\n• daysAfterCreationGreaterThan → used for versions/snapshots\n\nSince tracking was never enabled in this scenario, no last-access timestamp exists for the rule to act on — enabling it is exactly what is required.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/lifecycle-management-overview"
  },

  {
    id: 278,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    source: "Original Practice",
    question: "Using Azure File Sync, you register three Windows Servers in different branch offices to the SAME sync group, each with a server endpoint pointing to its local folder, and one cloud endpoint (an Azure file share). A file created on the server in Branch A is expected to appear on the servers in Branch B and Branch C. Which statement best describes this topology?",
    options: [
      "A sync group can contain only one server endpoint, so this topology is invalid",
      "Multiple server endpoints in one sync group keep all servers and the Azure file share synchronized with each other (a hub-and-spoke model via the cloud endpoint)",
      "Files sync only from servers up to the cloud endpoint, never back down to other servers",
      "Cloud tiering must be disabled for multiple server endpoints to work in one sync group"
    ],
    correct: [1],
    explanation: "An Azure File Sync sync group can contain one cloud endpoint (the Azure file share) and MULTIPLE server endpoints. All endpoints in a sync group are kept in sync with each other through the cloud endpoint, enabling a hub-and-spoke (or multi-site) topology.\n\nHow it works:\n• A change on any server endpoint syncs UP to the cloud endpoint\n• The change then syncs DOWN to every other server endpoint in the same sync group\n• This makes a file created in Branch A propagate to Branch B and Branch C\n• Each server can independently use cloud tiering to manage local disk usage\n\nConstraints / notes:\n• A given server volume can have multiple server endpoints, but you cannot nest server endpoints (one inside another's path)\n• A server can be registered to one Storage Sync Service at a time\n• Conflicting edits are resolved with conflict files (both versions kept)\n\n• A sync group explicitly supports MULTIPLE server endpoints — that is the basis for multi-site sync\n• Sync is bidirectional — changes flow both up to and down from the cloud endpoint\n• Cloud tiering is an independent, per-server-endpoint setting and does not need to be disabled for multi-server sync",
    reference: "https://learn.microsoft.com/azure/storage/file-sync/file-sync-planning"
  },

  {
    id: 279,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "single",
    source: "Original Practice",
    question: "You have configured a storage account firewall set to 'Selected networks' and enabled a private endpoint for the Blob service. Clients on the corporate VNet resolve the blob endpoint to the storage account's PUBLIC IP instead of the private endpoint's private IP, so traffic is blocked by the firewall. What is the most likely missing configuration?",
    options: [
      "The storage account access keys need to be regenerated",
      "The Private DNS zone (privatelink.blob.core.windows.net) is not configured or not linked to the VNet, so the blob FQDN does not resolve to the private IP",
      "A service endpoint for Microsoft.Storage must also be added to the subnet",
      "The firewall must be switched to 'Disabled' to allow private endpoint traffic"
    ],
    correct: [1],
    explanation: "A private endpoint works correctly only when DNS resolves the storage account's public FQDN (e.g., myaccount.blob.core.windows.net) to the private endpoint's PRIVATE IP. This is achieved through the Private DNS zone 'privatelink.blob.core.windows.net' linked to the VNet.\n\nHow private endpoint DNS works:\n• The public FQDN is a CNAME to myaccount.privatelink.blob.core.windows.net\n• The private DNS zone resolves that privatelink name to the private endpoint's private IP (e.g., 10.x.x.x)\n• Without the zone (or a custom DNS forwarder configured), clients fall back to the public IP and are blocked by the 'Selected networks' firewall\n\nFix: Create/associate the Private DNS zone privatelink.blob.core.windows.net, add an A record for the private endpoint, and link the zone to the VNet (the portal can do this automatically when creating the private endpoint with 'Integrate with private DNS zone').\n\n• Access keys are unrelated to DNS resolution / network path\n• A service endpoint is a different connectivity model and is not required (and would not fix the DNS resolution problem)\n• Disabling the firewall would expose the account publicly — the correct fix is DNS, not removing protection",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-private-endpoints"
  },

  {
    id: 280,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "single",
    source: "Original Practice",
    question: "An administrator accidentally DELETES an entire blob container that held production data. Blob soft delete (7 days) was enabled on the account, but the container still does not appear under 'Show deleted blobs'. Which setting must have been enabled BEFORE the deletion to recover the whole container intact?",
    options: [
      "Blob versioning",
      "Container soft delete",
      "Point-in-time restore",
      "Object replication"
    ],
    correct: [1],
    explanation: "Blob soft delete and CONTAINER soft delete are separate features. Blob soft delete protects individual blobs that are deleted; it does NOT protect against deletion of an entire container. To recover a deleted container, Container soft delete must be enabled.\n\nContainer soft delete:\n• Retains a deleted container (and its contents) for a configurable period (1–365 days)\n• Recover via: Storage Account → Containers → Show deleted containers → Undelete\n• Restores the container to its state at deletion, with the same name (the name must not already be in use)\n• Enable under: Storage Account → Data protection → Enable soft delete for containers\n\nLayered data protection in Azure Blob Storage:\n• Container soft delete → recover deleted containers\n• Blob soft delete → recover deleted blobs/snapshots\n• Versioning → recover overwritten blob content\n• Point-in-time restore → roll a set of blobs back to an earlier time\n\n• Blob versioning preserves prior blob versions but does not bring back a deleted container as a whole\n• Point-in-time restore operates on existing containers' block blobs, not on a container that has been deleted\n• Object replication is a forward copy mechanism, not container-level recovery",
    reference: "https://learn.microsoft.com/azure/storage/blobs/soft-delete-container-overview"
  },

  {
    id: 281,
    domain: 2,
    subdomain: "Configure Access to Storage",
    type: "multi",
    source: "Original Practice",
    question: "You want to grant a partner application time-limited, read-only access to a single blob container using the MOST secure SAS option and standard hardening practices. Which TWO actions should you take? Each correct answer presents part of the solution.",
    options: [
      "Create a User Delegation SAS signed with Microsoft Entra ID credentials instead of the storage account key",
      "Set a short expiry time and restrict the SAS to specific permitted IP address ranges",
      "Embed the storage account key in the partner application's configuration as a fallback",
      "Grant the SAS account-wide permissions across Blob, File, Queue, and Table to simplify integration",
      "Set the SAS protocol restriction to HTTP and HTTPS to maximize client compatibility"
    ],
    correct: [0, 1],
    explanation: "Two SAS hardening best practices apply here:\n\n• Use a User Delegation SAS (signed with Entra ID credentials via a user delegation key) rather than an account-key-signed SAS. It is the most secure SAS type for Blob/Data Lake Gen2 because the account key is never used and the SAS can be revoked by revoking the delegation key.\n• Apply least privilege and scope reduction: a SHORT expiry and an allowed IP range (sip) sharply limit the blast radius if the token leaks; granting only Read (r) keeps it read-only.\n\nWhy the others are wrong:\n• Embedding the storage account key as a fallback defeats the purpose — keys grant full control and are the thing you are trying to avoid exposing\n• Account-wide permissions across all services violate least privilege; scope the SAS to the one container with read only\n• Restricting the SAS protocol to HTTPS only (spr=https) is the secure choice; allowing HTTP would expose the token in cleartext, so 'HTTP and HTTPS' is a weakening, not a hardening, step",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-sas-overview#best-practices-when-using-sas"
  },

  {
    id: 282,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "multi",
    source: "Original Practice",
    question: "You are enabling threat protection for an Azure storage account using Microsoft Defender for Storage. Which TWO capabilities does Defender for Storage provide? Each correct answer presents part of the solution.",
    options: [
      "Security alerts for suspicious activity such as access from anomalous locations and potential data exfiltration",
      "Malware scanning of uploaded blobs (on-upload scanning) when the malware scanning add-on is enabled",
      "Automatic encryption of data at rest using customer-managed keys",
      "Automatic rotation of the storage account access keys every 90 days",
      "Enforcement of immutable WORM retention on all containers"
    ],
    correct: [0, 1],
    explanation: "Microsoft Defender for Storage is a threat-detection and protection layer (part of Microsoft Defender for Cloud) for Azure Storage accounts.\n\nWhat it provides:\n• Security alerts: Detects and alerts on suspicious activities — access from unusual/anomalous locations or Tor exit nodes, unusual data extraction/exfiltration patterns, anonymous access spikes, and credential-based anomalies\n• Malware scanning: An add-on capability that scans blobs on upload (near real-time) and tags or alerts on detected malware; also supports sensitive data threat detection\n\nWhat it does NOT do:\n• It does not perform encryption — encryption at rest (service encryption, CMK) is a separate storage feature\n• It does not rotate access keys (key rotation is handled manually or via Azure Key Vault)\n• It does not enforce immutability/WORM retention (that is the blob immutability feature)\n\nDefender for Storage is enabled per subscription or per account in Microsoft Defender for Cloud.",
    reference: "https://learn.microsoft.com/azure/defender-for-cloud/defender-for-storage-introduction"
  },

  {
    id: 283,
    domain: 2,
    subdomain: "Configure Azure Files and Blob Storage",
    type: "yesno",
    source: "Original Practice",
    scenario: "You have a General Purpose v2 storage account. You enable blob versioning. You then attempt to apply a version-level immutability (WORM) time-based retention policy so that each individual blob version is protected independently.",
    question: "Blob versioning is a prerequisite for configuring version-level immutability policies on a storage account.",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — version-level immutability support is built on blob versioning. To apply immutability (time-based retention or legal hold) at the level of individual blob VERSIONS, the storage account (or container) must have blob versioning enabled first.\n\nImmutability scopes in Azure Blob Storage:\n• Container-level immutability: Apply a WORM policy to a container; all current blobs in it are governed by the policy. Versioning is not required for container-scoped policies.\n• Version-level immutability: Apply WORM policies to individual blob versions independently. This REQUIRES blob versioning to be enabled (you can enable version-level immutability support at the account or container level).\n\nWhy version-level matters: It lets you protect a specific version of a blob (e.g., a finalized record) while allowing other versions to be managed normally, which is essential for granular compliance and records management.\n\nBoth time-based retention policies can be LOCKED to prevent shortening/removal, and legal holds can be applied — at the version level once versioning is enabled.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/immutable-version-level-worm-policies"
  },

  {
    id: 284,
    domain: 2,
    subdomain: "Configure and Manage Storage Accounts",
    type: "dragdrop",
    source: "Original Practice",
    question: "Match each Azure Storage account type to the workload it is the best fit for.",
    dragItems: [
      "Standard general-purpose v2 (GPv2)",
      "Premium block blob (BlockBlobStorage)",
      "Premium file shares (FileStorage)",
      "Premium page blob"
    ],
    dropZones: [
      "Most common, cost-effective account supporting blobs, files, queues, and tables for general workloads.",
      "High-transaction, low-latency block blob workloads such as small objects, analytics, and AI/IoT ingestion.",
      "SMB and NFS 4.1 file shares requiring sub-millisecond latency, such as databases and enterprise apps.",
      "Page blob storage optimized for unmanaged VM disks (VHDs) and random read/write I/O."
    ],
    correct: [[0,0],[1,1],[2,2],[3,3]],
    explanation: "Azure Storage account types and their ideal workloads:\n\nStandard general-purpose v2 (GPv2):\n• Supports ALL services: Blob, File, Queue, Table, and Data Lake Gen2 (with HNS)\n• HDD-backed standard performance; supports all access tiers (Hot/Cool/Cold/Archive)\n• The recommended default for most general-purpose workloads at the lowest cost\n\nPremium block blob (BlockBlobStorage):\n• SSD-backed, very low and consistent latency, high transaction rates\n• Best for: many small objects, interactive/analytics workloads, AI/IoT data ingestion\n\nPremium file shares (FileStorage):\n• SSD-backed Azure Files; supports SMB and NFS 4.1\n• Sub-millisecond latency, provisioned IOPS/throughput\n• Best for: databases, enterprise line-of-business apps, high-IOPS file workloads\n\nPremium page blob:\n• SSD-backed page blobs optimized for random read/write\n• Best for: unmanaged VM disks (VHDs) and other random-I/O page-blob scenarios\n\nChoosing the right account type aligns performance tier and supported services with the workload's latency, throughput, and protocol requirements.",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-account-overview"
  }

]);


// ─── Microsoft Practice Assessment (Attempt 2 additions) — Domain 2 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 285,
    domain: 2,
    subdomain: "Storage Security",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an on-premises network.\nYou have an Azure subscription that contains a virtual network named VNet1. VNet1 is connected to the on-premises network by using ExpressRoute.\nYou perform the following actions:\n- Create a storage account named storage1\n- Associate VNet1 to storage1 and configure network routing to use Microsoft network routing\nYou need to ensure that only connections from the on-premises network are allowed to access storage1. The solution must minimize administrative effort.\nWhat should you do?",
    options: [
      "Configure the network settings (firewall and virtual network rules) of storage1.",
      "Create a route table with filter rules and associate it with VNet1.",
      "Generate a shared access signature (SAS) token for storage1.",
      "Create a second ExpressRoute circuit and configure route filters."
    ],
    correct: [0],
    explanation: "Azure Storage lets you restrict access from the Networking blade by enabling the storage firewall and virtual network rules, so only traffic from specific VNets or on-premises networks (over ExpressRoute or VPN) is allowed. This satisfies the requirement directly with the least effort because it uses built-in network settings.\n\nWhy the others are wrong:\n• A route table with filter rules only influences packet routing — it does not block access to the storage account.\n• A SAS token controls authentication/permissions, not the network source of requests.\n• A second ExpressRoute circuit with route filters adds unnecessary complexity when storage network rules already provide the control.",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-network-security"
  },
  {
    id: 286,
    domain: 2,
    subdomain: "Azure Files",
    type: "single",
    source: "MS Practice Assessment",
    question: "You have an Azure Storage account that contains a file share.\nSeveral users work from a secure location that limits outbound traffic to the internet.\nYou need to ensure that the users at the secure location can access the file share in Azure by using the SMB protocol.\nWhich outbound port should you allow from the secure location?",
    options: ["445", "443", "80", "5671"],
    correct: [0],
    explanation: "Azure Files over SMB uses TCP port 445, so that outbound port must be open from the secure location. Many ISPs and corporate networks block 445, which is the most common cause of SMB connectivity failures to Azure Files.\n\nWhy the others are wrong:\n• Port 443 is used for HTTPS (e.g., REST access and directory sync), not SMB file access.\n• Port 80 is used to download certificate revocation lists (CRLs) for TLS/SSL certificate validation.\n• Port 5671 is used to send health information to Microsoft Entra (recommended, not required in recent versions).",
    reference: "https://learn.microsoft.com/azure/storage/files/storage-troubleshoot-windows-file-connection-problems"
  }
]);


// ─── Microsoft Practice Assessment (Attempt 2b additions) — Domain 2 ───
QUESTIONS.push.apply(QUESTIONS, [
  {
    id: 287,
    domain: 2,
    subdomain: "Storage Tools",
    type: "multi",
    source: "MS Practice Assessment",
    question: "You have an Azure Storage account.\nYou need to copy data to the storage account by using the AzCopy tool.\nWhich two types of data storage are supported by AzCopy? Each correct answer presents a complete solution.",
    options: ["blob", "file", "queue", "table"],
    correct: [0, 1],
    explanation: "AzCopy is a command-line utility that copies data to and from Azure Storage. It supports Blob storage and Azure Files (file shares). You can authorize AzCopy by using Microsoft Entra ID or a shared access signature (SAS) token.\n\nWhy the others are wrong:\n• AzCopy does not operate on Queue storage.\n• AzCopy does not operate on Table storage.\nFor queues and tables, use other tools/SDKs or AzCopy is simply not applicable.",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-use-azcopy-v10"
  }
]);
