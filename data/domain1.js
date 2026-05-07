var QUESTIONS = typeof QUESTIONS !== 'undefined' ? QUESTIONS : [];

QUESTIONS.push.apply(QUESTIONS, [

  // ─── Manage Microsoft Entra Users and Groups ─────────────────────────────

  {
    id: 101, domain: 1, subdomain: "Entra Users & Groups", type: "single",
    scenario: "Your company has several departments. Each department has a number of virtual machines in a single resource group named RG1. You want to associate each VM with its respective department for reporting and cost allocation.",
    question: "What should you do?",
    options: [
      "Create a management group for each department",
      "Create a resource group for each department and move the VMs",
      "Assign tags to the virtual machines",
      "Modify the virtual machine settings to include a department property"
    ],
    correct: [2],
    explanation: "Tags are name/value pairs of metadata you can apply to Azure resources. Assigning a tag such as Department=Finance or Department=IT to each VM logically associates it with its department without changing resource group structure or requiring VM restarts.\n\nIncorrect options:\n• Management groups manage policies and RBAC across subscriptions — they don't label individual resources.\n• Moving VMs to per-department resource groups would disrupt existing governance, networking, and access control unnecessarily.\n• VM 'settings' don't include a metadata Department field that integrates with Cost Management or filtering.",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/management/tag-resources"
  },

  {
    id: 102, domain: 1, subdomain: "Entra Users & Groups", type: "yesno",
    scenario: "Your company has a Microsoft Entra ID tenant. You need to implement a Conditional Access policy requiring members of the Global Administrators group to use Multi-Factor Authentication AND a Microsoft Entra-joined device when connecting from untrusted locations.",
    question: "Solution: You navigate to the Microsoft Entra ID multi-factor authentication page and alter the user settings for the Global Administrators group.\n\nDoes this solution meet the goal?",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "The per-user MFA page (multi-factor authentication page) only enables or disables MFA for individual users globally. It cannot:\n• Scope MFA to specific locations (trusted vs untrusted)\n• Require device compliance or Entra-joined device status\n• Target specific groups (like Global Administrators) with conditional logic\n\nThe correct solution is a Conditional Access policy using the Grant control, configured with:\n• Require multi-factor authentication\n• Require Microsoft Entra hybrid joined device (or require compliant device)\n• Combined with: Conditions → Locations → 'Any location' excluding Named Locations (trusted IPs)\n• Assigned to: the Global Administrators group",
    reference: "https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-grant"
  },

  {
    id: 103, domain: 1, subdomain: "Entra Users & Groups", type: "yesno",
    scenario: "Your company has a Microsoft Entra ID tenant. You need to implement a Conditional Access policy requiring members of the Global Administrators group to use Multi-Factor Authentication AND a Microsoft Entra-joined device when connecting from untrusted locations.",
    question: "Solution: You access the Azure portal and configure the Session control of the Conditional Access policy.\n\nDoes this solution meet the goal?",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "Session controls in Conditional Access manage behaviour AFTER a user successfully authenticates. Session controls include:\n• Sign-in frequency (how often the user must re-authenticate)\n• Persistent browser session\n• Application-enforced restrictions\n• Continuous Access Evaluation\n\nSession controls do NOT enforce MFA requirements or device compliance at sign-in. Those are configured in the Grant control.\n\nTo require MFA + Entra-joined device, you must configure the Grant control with 'Require multi-factor authentication' and 'Require Microsoft Entra hybrid joined device'.",
    reference: "https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-session"
  },

  {
    id: 104, domain: 1, subdomain: "Entra Users & Groups", type: "yesno",
    scenario: "Your company has a Microsoft Entra ID tenant. You need to implement a Conditional Access policy requiring members of the Global Administrators group to use Multi-Factor Authentication AND a Microsoft Entra-joined device when connecting from untrusted locations.",
    question: "Solution: You access the Azure portal and configure the Grant control of the Conditional Access policy.\n\nDoes this solution meet the goal?",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — The Grant control is the correct place to enforce access requirements. You configure it to:\n• Require multi-factor authentication\n• Require Microsoft Entra hybrid joined device\n• Set 'Require all the selected controls' to enforce both simultaneously\n\nCombined with Conditions → Locations targeting untrusted locations, and the policy assigned to the Global Administrators group, this fully meets the goal. The Grant control is evaluated DURING sign-in, blocking or requiring additional steps before access is granted.",
    reference: "https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-grant"
  },

  {
    id: 105, domain: 1, subdomain: "Entra Users & Groups", type: "yesno",
    scenario: "Your company uses Azure Multi-Factor Authentication with 'Per Authentication' as the usage model. After acquiring a new company, the new employees must also use MFA. You need to change the usage model to 'Per Enabled User'.",
    question: "Solution: You reconfigure the existing usage model via the Azure portal.\n\nDoes this solution meet the goal?",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "The usage model of an Azure Multi-Factor Authentication provider CANNOT be changed after creation. This limitation applies regardless of the tool used (portal, CLI, PowerShell, or API). The billing model is immutable.\n\nThe only supported approach is to create a brand-new MFA provider with the 'Per Enabled User' model. Note: Azure MFA providers are a legacy concept — modern deployments use Microsoft Entra ID P1/P2 licensing with Conditional Access, which is Microsoft's recommended approach.",
    reference: "https://learn.microsoft.com/entra/identity/authentication/concept-mfa-licensing"
  },

  {
    id: 106, domain: 1, subdomain: "Entra Users & Groups", type: "yesno",
    scenario: "Your company uses Azure Multi-Factor Authentication with 'Per Authentication' as the usage model and needs to change it to 'Per Enabled User'.",
    question: "Solution: You create a new Multi-Factor Authentication provider with a backup from the existing provider data.\n\nDoes this solution meet the goal?",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "Creating a new MFA provider and restoring data from the existing provider does NOT work because:\n• The backup preserves the old provider's configuration including the 'Per Authentication' usage model\n• Restoring that data into a new provider would inherit the same billing model\n\nThe correct approach is to create a completely new MFA provider with 'Per Enabled User' selected at creation, without importing any backup from the old provider.",
    reference: "https://learn.microsoft.com/entra/identity/authentication/howto-mfa-mfasettings"
  },

  {
    id: 107, domain: 1, subdomain: "Entra Users & Groups", type: "single",
    question: "You are an administrator for a Microsoft Entra ID tenant. You need to create 500 new user accounts from a CSV file and ensure they are created in bulk with minimal effort. Which method should you use?",
    options: [
      "Use the Bulk create users option in the Azure portal and upload a formatted CSV file",
      "Create a PowerShell script using New-MgUser for each user in the CSV file",
      "Use Microsoft Entra Connect to sync the users from on-premises Active Directory",
      "Open the Azure Cloud Shell and run az ad user create for each row in the CSV"
    ],
    correct: [0],
    explanation: "The Bulk create users feature in the Microsoft Entra admin center (Users → Bulk operations → Bulk create) allows you to upload a CSV file with up to 50,000 user entries. The portal validates the CSV format, processes all rows, and creates accounts simultaneously — no scripting required.\n\nThe required CSV columns include: Name, User name, Initial password, Block sign in, First name, Last name, Job title, Department, Usage location, etc.\n\nWhile PowerShell (New-MgUser) is also valid for bulk creation via script, the portal's Bulk create is the purpose-built, no-code solution with built-in validation.\n\nEntra Connect is for syncing from on-premises AD, not creating cloud-only users from a CSV.",
    reference: "https://learn.microsoft.com/entra/identity/users/users-bulk-add"
  },

  {
    id: 108, domain: 1, subdomain: "Entra Users & Groups", type: "single",
    question: "You need to create a group in Microsoft Entra ID where membership is automatically managed based on user attributes such as department and job title. Users must be automatically added when their attributes match and automatically removed when they don't. What type of group should you create?",
    options: [
      "A Microsoft 365 group with a membership type of Assigned",
      "A Security group with a membership type of Assigned",
      "A Security group with a membership type of Dynamic User",
      "A Microsoft 365 group with a membership type of Dynamic Device"
    ],
    correct: [2],
    explanation: "Dynamic User groups use membership rules (written in the Membership rule syntax) to automatically add and remove users based on their Entra ID attributes. Example rule:\n(user.department -eq \"Finance\") and (user.jobTitle -contains \"Analyst\")\n\nWhen a user's department changes, they are automatically added or removed from the group — no manual management needed.\n\nRequirements:\n• The tenant must have Microsoft Entra ID P1 or P2 licensing\n• Dynamic Device groups track device attributes (OS version, device type) — not user attributes\n• 'Assigned' membership requires manual add/remove operations",
    reference: "https://learn.microsoft.com/entra/identity/users/groups-create-rule"
  },

  {
    id: 109, domain: 1, subdomain: "Entra Users & Groups", type: "multi",
    question: "Your organization uses Microsoft Entra ID. You need to configure Self-Service Password Reset (SSPR) so users can reset their passwords without calling the help desk. Which two requirements must be met before enabling SSPR for all users? (Choose two)",
    options: [
      "The tenant must have Microsoft Entra ID P1 or P2 licensing, or Microsoft 365 Business Premium",
      "Users must register at least one authentication method approved for SSPR",
      "The tenant must have a federated domain configured with ADFS",
      "Global Administrator approval must be obtained for each password reset request",
      "A Recovery Services vault must be created to store password reset audit logs"
    ],
    correct: [0, 1],
    explanation: "Two requirements for SSPR:\n\n1. LICENSING — SSPR for non-administrator accounts requires Microsoft Entra ID P1, P2, or Microsoft 365 Business Premium. (Global Administrators can always reset their own passwords regardless of license.)\n\n2. AUTHENTICATION METHOD REGISTRATION — Users must register at least one approved authentication method (e.g., email, phone, authenticator app, security questions). Without registered methods, SSPR cannot verify identity.\n\nIncorrect options:\n• ADFS federation is not required — SSPR works for cloud-only and synced accounts\n• SSPR is self-service by design — admin approval per reset would defeat the purpose\n• Password reset audits go to the Entra ID audit log, not a Recovery Services vault",
    reference: "https://learn.microsoft.com/entra/identity/authentication/concept-sspr-howitworks"
  },

  {
    id: 110, domain: 1, subdomain: "Entra Users & Groups", type: "single",
    question: "You have a Microsoft Entra ID tenant with a hybrid identity setup using Microsoft Entra Connect. On-premises users' passwords are synchronized to Entra ID using Password Hash Synchronization (PHS). You need to allow these synced users to reset their own passwords from the Entra ID login page and have the new password written back to on-premises Active Directory. What must you enable?",
    options: [
      "Microsoft Entra ID Pass-through Authentication (PTA)",
      "Password Writeback on Microsoft Entra Connect and enable SSPR with Writeback",
      "Microsoft Entra ID Seamless Single Sign-On",
      "Azure AD Password Protection on the on-premises domain controllers"
    ],
    correct: [1],
    explanation: "Password Writeback is the feature that enables SSPR to propagate password changes back to on-premises Active Directory in real time. Configuration steps:\n\n1. In Microsoft Entra Connect, on the Optional features page → enable 'Password writeback'\n2. In Microsoft Entra ID → Password reset → On-premises integration → enable 'Write back passwords to your on-premises directory'\n\nWithout Password Writeback, if a hybrid user resets their password in Entra ID, the new password applies only to the cloud account. The next on-premises AD sync would overwrite it with the old on-premises password.\n\nPTA and Seamless SSO are authentication methods, not password writeback mechanisms. Azure AD Password Protection blocks weak passwords but doesn't enable self-service reset.",
    reference: "https://learn.microsoft.com/entra/identity/authentication/tutorial-enable-sspr-writeback"
  },

  {
    id: 111, domain: 1, subdomain: "Entra Users & Groups", type: "single",
    question: "You need to assign Microsoft 365 E3 licenses to a group of 200 users. The users are members of an Entra ID security group named 'M365-E3-Users'. You want licenses to be assigned automatically when new users join the group and removed when they leave. What should you configure?",
    options: [
      "Create a PowerShell script that runs nightly to assign licenses to group members",
      "Configure group-based licensing by assigning the Microsoft 365 E3 license to the 'M365-E3-Users' group",
      "Assign the licenses manually to each user in the Microsoft 365 admin center",
      "Create an Azure Automation runbook to monitor group membership and assign licenses"
    ],
    correct: [1],
    explanation: "Group-based licensing (available with Microsoft Entra ID P1/P2 or Microsoft 365 E3) automatically assigns licenses to users based on group membership:\n• When a user joins the group → license is automatically assigned\n• When a user leaves the group → license is automatically removed\n\nSetup: Microsoft Entra admin center → Groups → M365-E3-Users → Licenses → Assign → Select Microsoft 365 E3.\n\nThis eliminates manual license management, ensures consistency, and scales automatically as users are added/removed from the group. Group-based licensing requires Microsoft Entra ID P1 or higher per user receiving the license.",
    reference: "https://learn.microsoft.com/entra/identity/users/licensing-groups-assign"
  },

  {
    id: 112, domain: 1, subdomain: "Entra Users & Groups", type: "single",
    question: "Your organization wants to allow users from a partner company (partnerco.com) to access specific SharePoint sites and Azure resources in your Entra ID tenant without creating full member accounts for them. What feature of Microsoft Entra ID should you use?",
    options: [
      "Create user accounts for each partner user with the userType set to Member",
      "Configure Microsoft Entra B2B collaboration and invite partner users as guests",
      "Create a federated identity provider for partnerco.com and set up trust",
      "Enable Microsoft Entra B2C and configure a customer identity flow"
    ],
    correct: [1],
    explanation: "Microsoft Entra B2B (Business-to-Business) collaboration allows you to invite external users as guest accounts (userType = Guest). Guest accounts:\n• Use the partner's existing identity (Microsoft account, Entra ID, Google, etc.)\n• Can be granted access to specific apps, groups, and resources via RBAC or app assignments\n• Do not require a separate password in your tenant\n• Are billed separately from member accounts\n\nTo invite: Entra ID → Users → New user → Invite external user → enter email from partnerco.com.\n\nEntra B2C is for customer-facing applications with consumer identities — not for partner collaboration. A full federation trust is overly complex for this scenario.",
    reference: "https://learn.microsoft.com/entra/external-id/what-is-b2b"
  },

  {
    id: 113, domain: 1, subdomain: "Entra Users & Groups", type: "single",
    question: "You manage a Microsoft Entra ID tenant. You need to review and remove users who have not signed in for the past 90 days. Which feature in the Azure portal should you use to identify these inactive users?",
    options: [
      "Microsoft Entra ID Audit Logs filtered by 'Sign-in' activity",
      "Microsoft Entra ID Sign-in Logs with the 'Last sign-in' column",
      "Microsoft Entra ID Access Reviews scoped to all users",
      "Microsoft Entra ID Identity Protection risky users report"
    ],
    correct: [1],
    explanation: "The Microsoft Entra ID Sign-in Logs (or the Users list with the 'Last sign-in date' column) shows when each user last authenticated. To find inactive users:\n\nMethod 1: Entra admin center → Users → All users → Add filter → Last sign-in → More than 90 days ago\n\nMethod 2: Microsoft Graph query for users where signInActivity.lastSignInDateTime is older than 90 days:\nGET /users?$select=displayName,userPrincipalName,signInActivity\n\nAccess Reviews can be used to periodically review and remediate inactive access, but they're more of a governance workflow than a discovery tool. Identity Protection risky users focuses on risk events, not inactivity. Audit Logs track administrative actions, not user sign-in frequency.",
    reference: "https://learn.microsoft.com/entra/identity/monitoring-health/howto-manage-inactive-user-accounts"
  },

  // ─── Manage Access to Azure Resources ────────────────────────────────────

  {
    id: 114, domain: 1, subdomain: "Azure RBAC", type: "single",
    question: "You have an Azure subscription. A developer named Dev1 needs to deploy virtual machines, storage accounts, and virtual networks in a resource group named Dev-RG, but must NOT be able to grant access to others or change subscription-level settings. Which built-in role should you assign Dev1?",
    options: [
      "Owner at the Dev-RG resource group scope",
      "Contributor at the Dev-RG resource group scope",
      "Reader at the subscription scope",
      "User Access Administrator at the Dev-RG resource group scope"
    ],
    correct: [1],
    explanation: "The Contributor role grants full access to create and manage all types of Azure resources, but does NOT allow granting access to others (no Microsoft.Authorization/*/write permissions). Assigning it at the Dev-RG resource group scope limits Dev1's permissions to only that resource group — they cannot affect other resource groups or subscription settings.\n\nRole comparison:\n• Owner — includes all Contributor permissions PLUS the ability to assign roles and manage blueprints. Too permissive here.\n• Contributor — create/manage resources, cannot assign roles. Correct for this scenario.\n• Reader — read-only, cannot deploy resources.\n• User Access Administrator — specifically for managing role assignments, not resource deployment.",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/built-in-roles"
  },

  {
    id: 115, domain: 1, subdomain: "Azure RBAC", type: "single",
    question: "You are assigning an Azure RBAC role to a user. The user needs to view all resources in a subscription but must not make any changes. At what scope should you assign the Reader role to minimize the number of assignments?",
    options: [
      "Assign Reader at the resource group scope for each resource group",
      "Assign Reader at the subscription scope",
      "Assign Reader at the management group scope",
      "Assign Reader at each resource's individual scope"
    ],
    correct: [1],
    explanation: "Azure RBAC uses scope inheritance — permissions assigned at a higher scope are inherited by all child scopes. Assigning Reader at the subscription scope means the user automatically has Reader access to all resource groups and resources within that subscription.\n\nAssigning at each resource group or individual resource would require multiple assignments and ongoing maintenance as new resource groups are created.\n\nManagement group scope would be even broader (across multiple subscriptions) — appropriate if you need cross-subscription read access but overly permissive if the requirement is just one subscription.",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/scope-overview"
  },

  {
    id: 116, domain: 1, subdomain: "Azure RBAC", type: "single",
    question: "You have the following Azure RBAC role assignments for a user:\n• Reader role at the Subscription scope\n• Contributor role at the Resource Group 'RG1' scope\n• Owner role at the Storage Account 'SA1' scope (SA1 is in RG1)\n\nWhat is the user's effective permission on the storage account SA1?",
    options: [
      "Reader — the most restrictive role at the highest scope takes precedence",
      "Contributor — the resource group scope overrides the subscription scope",
      "Owner — the most specific scope (resource level) takes precedence and all roles accumulate",
      "No access — conflicting role assignments result in denial"
    ],
    correct: [2],
    explanation: "Azure RBAC is ADDITIVE — all role assignments across all scopes are combined, and the user gets the union of all permissions. Role assignments do NOT conflict or cancel each other out.\n\nIn this scenario:\n• Reader (subscription) = read all resources\n• Contributor (RG1) = create/manage everything in RG1 (additive to Reader)\n• Owner (SA1) = full control including role assignments on SA1 (additive to both above)\n\nThe effective permission at SA1 = Reader + Contributor + Owner = Owner-level access.\n\nThe most specific scope does NOT 'win' over others — all assignments are cumulative. The only exception is explicit Deny assignments (Azure Policy deny effects are separate from RBAC).",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/overview#how-azure-rbac-works"
  },

  {
    id: 117, domain: 1, subdomain: "Azure RBAC", type: "single",
    question: "You need to create a custom RBAC role that allows users to start, stop, and restart virtual machines in a subscription, but prevents them from creating, deleting, or resizing VMs. Which approach is correct?",
    options: [
      "Clone the Virtual Machine Contributor built-in role and remove the write and delete actions",
      "Assign both the Virtual Machine Contributor and Reader roles simultaneously",
      "Create a custom role with Actions: Microsoft.Compute/virtualMachines/start/action, Microsoft.Compute/virtualMachines/powerOff/action, Microsoft.Compute/virtualMachines/restart/action",
      "Create a custom role with Actions: Microsoft.Compute/virtualMachines/* and NotActions: Microsoft.Compute/virtualMachines/write, Microsoft.Compute/virtualMachines/delete"
    ],
    correct: [2],
    explanation: "Custom RBAC roles allow you to define precise permissions. The role definition requires:\n\n{\n  \"Actions\": [\n    \"Microsoft.Compute/virtualMachines/start/action\",\n    \"Microsoft.Compute/virtualMachines/powerOff/action\",\n    \"Microsoft.Compute/virtualMachines/restart/action\",\n    \"Microsoft.Compute/virtualMachines/read\"\n  ],\n  \"NotActions\": [],\n  \"DataActions\": [],\n  \"AssignableScopes\": [\"/subscriptions/{id}\"]\n}\n\nOption D is also technically valid but overly broad — using wildcard * then subtracting with NotActions grants many unintended permissions (resize, capture, etc.). Option C is more precise and follows the principle of least privilege.",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/custom-roles"
  },

  {
    id: 118, domain: 1, subdomain: "Azure RBAC", type: "single",
    question: "After reviewing your Azure subscription, you notice that some RBAC role assignments show the user as 'Identity not found' with a red triangle icon. What does this indicate?",
    options: [
      "The user has been disabled in Microsoft Entra ID but the role assignment remains",
      "The security principal (user, group, or service principal) the role was assigned to has been deleted, but the role assignment was not cleaned up",
      "The role assignment is inherited from a parent management group and cannot be viewed",
      "The user's access has been blocked by an Azure Policy deny effect"
    ],
    correct: [1],
    explanation: "When a security principal (user, group, or service principal) is deleted from Entra ID, Azure RBAC does not automatically remove their role assignments. The orphaned role assignment remains in Azure Resource Manager with an unknown object ID — displayed as 'Identity not found' in the portal.\n\nOrphaned role assignments are harmless (deleted identities cannot authenticate) but create noise in access reviews and should be cleaned up:\n• Portal: Go to IAM → Role assignments → filter for 'Identity not found' → Delete\n• PowerShell: Get-AzRoleAssignment | Where-Object {$_.ObjectType -eq 'Unknown'}\n• CLI: az role assignment list | jq '.[] | select(.principalType == null)'\n\nThis does NOT indicate a disabled account — disabled accounts still show the user's name.",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/troubleshooting"
  },

  // ─── Manage Azure Subscriptions and Governance ───────────────────────────

  {
    id: 119, domain: 1, subdomain: "Azure Policy", type: "single",
    question: "You need to ensure that all new storage accounts created in a subscription are deployed only in the East US or West US 2 regions, and that existing non-compliant storage accounts are identified. Which Azure Policy effect should you use?",
    options: [
      "Deny — prevents any storage account from being created in disallowed regions",
      "Audit — logs non-compliant resources without blocking deployments",
      "Append — adds the allowed region field to storage account deployment requests",
      "DeployIfNotExists — automatically remediate non-compliant storage accounts"
    ],
    correct: [0],
    explanation: "The question says 'ensure all new storage accounts are deployed only in East US or West US 2' — this requires preventing non-compliant deployments, which is the Deny effect.\n\nPolicy effect behaviour:\n• Deny — blocks the deployment request at ARM evaluation time, returning a 403 Forbidden error. Existing resources are marked non-compliant in the compliance dashboard but are not automatically removed.\n• Audit — only logs/marks resources as non-compliant, does NOT block creation.\n• Append — adds fields or tags to deployment requests, cannot restrict location.\n• DeployIfNotExists — triggers a remediation deployment when non-compliance is detected; used for auto-remediation scenarios like deploying a Diagnostics extension.\n\nFor location restriction, the built-in 'Allowed locations' policy uses the Deny effect.",
    reference: "https://learn.microsoft.com/azure/governance/policy/concepts/effects"
  },

  {
    id: 120, domain: 1, subdomain: "Azure Policy", type: "single",
    question: "You assign an Azure Policy with the 'DeployIfNotExists' effect to automatically deploy a Log Analytics monitoring extension to all VMs in a subscription. After assignment, existing VMs are marked as non-compliant. What must you do to remediate existing non-compliant VMs?",
    options: [
      "Wait 24 hours — the policy automatically remediates non-compliant resources",
      "Create a remediation task in Azure Policy for the assignment",
      "Delete and redeploy the non-compliant VMs",
      "Change the policy effect from DeployIfNotExists to Modify"
    ],
    correct: [1],
    explanation: "DeployIfNotExists policies do NOT automatically remediate existing non-compliant resources after assignment — they only trigger for new or updated resources. To remediate existing resources, you must manually create a Remediation Task:\n\nPortal: Azure Policy → Remediation → New Remediation Task → select the policy assignment → select the scope and non-compliant resources → Remediate.\n\nThe remediation task uses a Managed Identity (which must have appropriate permissions, e.g., Contributor) to execute the deployments on non-compliant resources.\n\nNote: Modify effect policies also require remediation tasks for existing resources — they do not auto-remediate either.",
    reference: "https://learn.microsoft.com/azure/governance/policy/how-to/remediate-resources"
  },

  {
    id: 121, domain: 1, subdomain: "Azure Policy", type: "single",
    question: "You need to group multiple related Azure Policy definitions together so they can be assigned as a single unit. What is this called in Azure Policy?",
    options: [
      "A policy group",
      "A policy set (initiative)",
      "A policy blueprint",
      "A policy bundle"
    ],
    correct: [1],
    explanation: "An Azure Policy Initiative (also called a Policy Set) is a collection of policy definitions grouped together to achieve a specific goal. Initiatives simplify management because:\n• You assign one initiative instead of multiple individual policies\n• Compliance is reported at the initiative level (aggregated) as well as per policy\n• You can parameterize the initiative and pass different values per policy definition\n\nExample: The 'Azure Security Benchmark' initiative contains 200+ individual policy definitions covering security best practices.\n\nAssignment: Policy → Initiatives → Assign → select scope and parameters.\n\n'Blueprint' is a separate Azure service (now being replaced by Deployment Stacks) for packaging policies, role assignments, and ARM templates. There is no 'policy group' or 'policy bundle' concept in Azure Policy.",
    reference: "https://learn.microsoft.com/azure/governance/policy/concepts/initiative-definition-structure"
  },

  {
    id: 122, domain: 1, subdomain: "Azure Policy", type: "single",
    question: "You have an Azure Policy assignment at a management group scope that requires all resources to have a 'CostCenter' tag. A specific resource group named 'ExceptionRG' hosts resources that legitimately do not need the CostCenter tag. How do you exclude ExceptionRG from the policy without removing the policy assignment?",
    options: [
      "Delete and recreate the policy assignment with ExceptionRG excluded from the scope",
      "Add ExceptionRG as an exclusion in the policy assignment's Exclusions field",
      "Create a separate policy assignment with a Deny effect for ExceptionRG",
      "Assign a different initiative to ExceptionRG that overrides the management group policy"
    ],
    correct: [1],
    explanation: "Azure Policy assignments support exclusions — you can specify resource groups, subscriptions, or individual resources to be excluded from policy evaluation, even when the policy is assigned at a parent scope.\n\nPortal: Policy → Assignments → click the assignment → Edit assignment → Exclusions tab → Add the ExceptionRG resource group ID.\n\nPowerShell example:\nSet-AzPolicyAssignment -Id \"/providers/Microsoft.Management/...\" -NotScope @(\"/subscriptions/xxx/resourceGroups/ExceptionRG\")\n\nExclusions are available for individual assignments and are scoped precisely. There is no need to delete and recreate the assignment. Policy exemptions (Waiver or Mitigated) are another option when you want to document the reason for exclusion.",
    reference: "https://learn.microsoft.com/azure/governance/policy/concepts/exemption-structure"
  },

  {
    id: 123, domain: 1, subdomain: "Resource Locks", type: "single",
    question: "A resource group named 'Prod-RG' contains critical Azure VMs, storage accounts, and databases. You need to prevent any resources in Prod-RG from being accidentally deleted, while still allowing read and write operations (e.g., starting/stopping VMs, uploading blobs). Which lock should you apply?",
    options: [
      "Apply a ReadOnly lock to the Prod-RG resource group",
      "Apply a CanNotDelete (Delete) lock to the Prod-RG resource group",
      "Apply a ReadOnly lock to each individual resource within Prod-RG",
      "Assign the Reader role to all users instead of Contributor"
    ],
    correct: [1],
    explanation: "The CanNotDelete lock (also shown as 'Delete' in the portal) prevents deletion of the locked resource and all resources within its scope, while allowing all read and write operations.\n\n• CanNotDelete lock: prevents DELETE operations. Start/stop VM, upload blob, modify settings → all allowed.\n• ReadOnly lock: prevents both DELETE and PUT (create/update) operations. This would break operations like starting a VM (which requires a write to VM state) or uploading files.\n\nApplying CanNotDelete to the resource group propagates the lock to all resources within it — no need to lock each resource individually.\n\nNote: Locks are inherited by child resources. Even users with Owner role cannot delete locked resources without first removing the lock.",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/management/lock-resources"
  },

  {
    id: 124, domain: 1, subdomain: "Resource Locks", type: "yesno",
    scenario: "You have a resource group named 'Prod-RG' with a ReadOnly lock applied. A user with the Owner role on the resource group tries to add a new tag to a virtual machine in the resource group.",
    question: "Solution: The user can successfully add the tag because tags are metadata and not subject to ReadOnly locks.\n\nDoes this solution describe the correct behaviour?",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "No — this describes incorrect behaviour. A ReadOnly lock prevents all PUT and PATCH operations, including adding or modifying tags on resources within the locked scope. Tags are stored as properties of a resource's ARM representation, and modifying them requires a write operation.\n\nA ReadOnly lock blocks:\n• Adding, modifying, or removing tags\n• Creating new resources in the resource group\n• Modifying any resource properties (VM size, storage tier, etc.)\n• Starting or stopping VMs (these require a write to VM state)\n\nA ReadOnly lock effectively makes the resource group view-only for all users regardless of their RBAC role, including Owners. To modify tags, the lock must be removed first.",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/management/lock-resources#considerations-before-applying-your-locks"
  },

  {
    id: 125, domain: 1, subdomain: "Tags", type: "single",
    question: "You apply a tag 'Environment=Production' to a resource group named 'ProdRG'. The resource group contains five virtual machines. Which statement about the tag inheritance is correct?",
    options: [
      "All five VMs automatically inherit the 'Environment=Production' tag from the resource group",
      "Tags applied to a resource group are NOT automatically inherited by resources within it; each resource must be tagged separately",
      "Tags are inherited only by VMs, not by storage accounts or networking resources",
      "Tags are inherited only when applied at the subscription scope, not at the resource group scope"
    ],
    correct: [1],
    explanation: "Azure resource tags do NOT inherit from parent scopes. Applying a tag to a resource group does NOT automatically apply that tag to resources within the group. Each resource must be tagged individually, or you must use one of these methods to enforce/propagate tags:\n\n1. Azure Policy with the Inherit a tag from the resource group if missing (Modify effect) — copies the tag from the RG to resources that don't have it during deployment.\n\n2. Azure Policy with Require a tag on resources (Deny effect) — blocks resources that don't have the required tag.\n\n3. ARM template / Bicep — explicitly tag each resource during deployment.\n\nThis is a common exam trap: resources in a tagged resource group are NOT automatically tagged.",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/management/tag-resources"
  },

  {
    id: 126, domain: 1, subdomain: "Management Groups", type: "single",
    question: "Your company has a complex Azure environment with 15 subscriptions across 4 business units. You need to apply consistent security policies across ALL subscriptions simultaneously and manage RBAC assignments that span multiple subscriptions. What should you create?",
    options: [
      "A single management group containing all 15 subscriptions and assign policies at the management group scope",
      "An Azure Blueprint and deploy it to each subscription individually",
      "An Azure Policy initiative and assign it to each subscription separately",
      "A single Azure subscription containing all resources organized by resource groups"
    ],
    correct: [0],
    explanation: "Management Groups provide a governance scope ABOVE subscriptions. By creating a hierarchy:\n\nRoot Management Group\n└── Company-MG\n    ├── BusinessUnit1-MG (subscriptions for BU1)\n    ├── BusinessUnit2-MG (subscriptions for BU2)\n    └── ...\n\nPolicies and RBAC assigned at the Company-MG scope automatically apply to ALL subscriptions and resource groups beneath it. This is the most efficient approach for multi-subscription governance.\n\nKey facts:\n• Management groups can nest up to 6 levels deep (excluding root and subscription levels)\n• One subscription can only be in one management group at a time\n• All tenants have a Root Management Group that cannot be moved or deleted\n• Assignments at the management group scope inherit down to all subscriptions and resource groups",
    reference: "https://learn.microsoft.com/azure/governance/management-groups/overview"
  },

  {
    id: 127, domain: 1, subdomain: "Management Groups", type: "single",
    question: "You assign an Azure Policy at the Root Management Group to deny creation of certain resource types. A subscription owner wants to allow an exception for a specific resource group in their subscription. How can they override the policy for just that resource group?",
    options: [
      "Create a policy assignment with the Allow effect at the resource group scope to override the Deny",
      "Request a Policy Exemption for the resource group, specifying Waiver or Mitigated as the exemption category",
      "Remove the policy from the Root Management Group and reassign it to individual subscriptions",
      "Assign the subscription owner the Owner role at the Root Management Group to bypass policies"
    ],
    correct: [1],
    explanation: "Azure Policy Exemptions allow specific scopes (management groups, subscriptions, resource groups, or individual resources) to be excluded from a policy assignment without modifying the assignment itself.\n\nExemption categories:\n• Waiver — acknowledges that the scope is exempt and will not be brought into compliance (policy doesn't apply by design)\n• Mitigated — acknowledges the policy intent is met through alternative means\n\nImportant: Policy assignments cannot be 'overridden' by a lower-level Allow assignment — Azure Policy does not work like RBAC (no additive Allow/Deny interplay for policy effects). A Deny assignment at a higher scope cannot be overridden with a lower-level assignment; only an Exemption can exclude a scope.",
    reference: "https://learn.microsoft.com/azure/governance/policy/concepts/exemption-structure"
  },

  {
    id: 128, domain: 1, subdomain: "Cost Management", type: "single",
    question: "You need to receive an email alert when your Azure subscription spending reaches 80% of a $5,000 monthly budget. What should you configure?",
    options: [
      "Create a cost alert rule in Azure Monitor targeting the subscription's billing metric",
      "Create a budget in Azure Cost Management + Billing with an alert condition set to 80% of $5,000",
      "Configure an Azure Advisor recommendation alert for cost optimization",
      "Create a Log Analytics alert query for billing data"
    ],
    correct: [1],
    explanation: "Azure Cost Management + Billing Budgets allow you to set spending thresholds and configure alert conditions:\n\nSteps:\n1. Cost Management + Billing → Budgets → Add\n2. Set name, scope (subscription), period (monthly), reset period, amount ($5,000)\n3. Add alert condition: Type=Actual, % of budget=80, add email recipient\n\nBudget alerts can be:\n• Actual cost — triggers when actual spend reaches the threshold\n• Forecasted cost — triggers when projected spend is predicted to reach the threshold\n\nYou can configure multiple alert conditions (e.g., 80% actual, 100% actual, 100% forecast) with different email recipients. Azure Advisor provides recommendations but doesn't send threshold-based spending alerts.",
    reference: "https://learn.microsoft.com/azure/cost-management-billing/costs/tutorial-acm-create-budgets"
  },

  {
    id: 129, domain: 1, subdomain: "Cost Management", type: "multi",
    question: "You use Azure Advisor to optimize your Azure environment. Which three categories of recommendations does Azure Advisor provide? (Choose three)",
    options: [
      "Cost — identifies underutilized resources and reserved instance opportunities",
      "Security — powered by Microsoft Defender for Cloud security assessments",
      "Reliability (High Availability) — improves continuity of business-critical applications",
      "Networking — provides NSG rule optimization and VNet design recommendations",
      "Performance — identifies opportunities to improve the speed and responsiveness of applications",
      "Compliance — checks resources against regulatory compliance frameworks"
    ],
    correct: [0, 1, 2, 4],
    explanation: "Azure Advisor provides recommendations across five categories:\n1. Cost — right-sizing VMs, deleting unattached disks, reserved instances\n2. Security — powered by Microsoft Defender for Cloud (enable MFA, encrypt disks, etc.)\n3. Reliability (was 'High Availability') — VM in availability sets, geo-redundant backup, etc.\n4. Performance — SQL performance, CDN offloading, premium storage for high-IOPS workloads\n5. Operational Excellence — service health, resource health, ARM template best practices\n\nAzure Advisor does NOT have a 'Networking' category as a standalone section (networking items appear under other categories). Compliance checks are handled by Azure Policy and Microsoft Defender for Cloud compliance dashboard, not Advisor.\n\nNote: The fifth category is 'Operational Excellence', not listed in the options — this is a trick. All four selected options (Cost, Security, Reliability, Performance) are genuine Advisor categories.",
    reference: "https://learn.microsoft.com/azure/advisor/advisor-overview"
  },

  {
    id: 130, domain: 1, subdomain: "Subscriptions", type: "single",
    question: "You need to move a resource group from one Azure subscription to another. The resource group contains virtual machines, virtual networks, and storage accounts. Which statement is correct about moving resources between subscriptions?",
    options: [
      "Resources can be moved between subscriptions only if both subscriptions belong to the same Microsoft Entra ID tenant",
      "All Azure resource types support cross-subscription moves without any restrictions",
      "Resources can be moved between subscriptions in different Entra ID tenants, but VMs must be stopped first",
      "Subscription moves require creating a support ticket with Microsoft — they cannot be done self-service"
    ],
    correct: [0],
    explanation: "Moving resources between subscriptions has several requirements:\n\n1. Both subscriptions must be in the same Microsoft Entra ID tenant — cross-tenant subscription moves are not supported for most scenarios via the Move Resources API.\n\n2. Not all resource types support moves — check the 'Move support for resources' documentation. Some resources (e.g., certain networking configurations, ExpressRoute circuits) cannot be moved.\n\n3. Resources must be unlocked during the move — remove any CanNotDelete or ReadOnly locks.\n\n4. Some resources have additional prerequisites — e.g., moving VMs with managed disks requires the VM to be stopped, disks to be moved together.\n\n5. Move takes 4 hours — during the move, the source and destination resource groups are locked.\n\nSelf-service moves are available via the Azure portal (Resource group → Move), PowerShell (Move-AzResource), or CLI.",
    reference: "https://learn.microsoft.com/azure/azure-resource-manager/management/move-resource-group-and-subscription"
  },

  // ─── Additional Governance Topics ────────────────────────────────────────

  {
    id: 131, domain: 1, subdomain: "Azure Policy", type: "single",
    question: "You have an Azure Policy assignment with the Modify effect to add a tag to resources. The policy has a managed identity assigned for remediation. After assigning the policy, new resources created without the tag are automatically tagged. However, 200 existing resources are still non-compliant. What must you do?",
    options: [
      "Wait — the Modify effect automatically remediates existing resources within 24 hours",
      "Reassign the policy with DeployIfNotExists effect instead of Modify",
      "Create a remediation task for the policy assignment",
      "Grant the managed identity the Owner role so it can modify all resources"
    ],
    correct: [2],
    explanation: "Both Modify and DeployIfNotExists effects use managed identities for remediation, but they only trigger automatically for new or updated resources AFTER policy assignment. Existing non-compliant resources must be remediated manually by creating a Remediation Task.\n\nRemediation Task steps:\n1. Azure Policy → Remediation → New remediation task\n2. Select the policy assignment → set scope and filters\n3. The task iterates over non-compliant resources and applies the Modify effect (adds/modifies tags)\n\nThe managed identity needs appropriate permissions (usually Contributor or a specific tag-writing role) on the resources being remediated. The Modify effect specifically requires 'Microsoft.*/tags/write' permissions.",
    reference: "https://learn.microsoft.com/azure/governance/policy/how-to/remediate-resources"
  },

  {
    id: 132, domain: 1, subdomain: "Entra Users & Groups", type: "single",
    question: "Your company uses Microsoft Entra Connect to synchronize on-premises Active Directory users to Microsoft Entra ID using Password Hash Synchronization (PHS). The synchronization runs every 30 minutes by default. You need to trigger an immediate synchronization cycle without waiting 30 minutes. What PowerShell command should you run on the Microsoft Entra Connect server?",
    options: [
      "Sync-AzureADObject -Force",
      "Start-ADSyncSyncCycle -PolicyType Delta",
      "Invoke-ADSyncRunProfile -ConnectorName 'AAD Connector' -RunProfileName Export",
      "Update-MgUser -UserId all -Force"
    ],
    correct: [1],
    explanation: "Microsoft Entra Connect (formerly Azure AD Connect) provides PowerShell cmdlets to manage sync cycles:\n\n• Start-ADSyncSyncCycle -PolicyType Delta — triggers an immediate DELTA sync (only changed objects since last sync). Fastest option.\n• Start-ADSyncSyncCycle -PolicyType Initial — triggers a FULL sync of all objects. Takes longer.\n\nThe default sync interval is 30 minutes (changed from 3 hours in older versions).\n\nOther useful cmdlets:\n• Get-ADSyncConnectorStatistics — shows last sync statistics\n• Get-ADSyncScheduler — shows the scheduler status and next run time\n\n'Sync-AzureADObject' and 'Update-MgUser' do not exist as valid cmdlets for this purpose.",
    reference: "https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sync-feature-scheduler"
  },

  {
    id: 133, domain: 1, subdomain: "Azure RBAC", type: "dragdrop",
    question: "Match each Azure built-in RBAC role to its correct description.",
    dragItems: [
      "Owner",
      "Contributor",
      "Reader",
      "User Access Administrator"
    ],
    dropZones: [
      "Full access to all resources including the ability to assign roles and manage blueprints",
      "Create and manage all types of Azure resources, but cannot assign roles or manage access",
      "View all resources but cannot make any changes",
      "Manage user access to Azure resources — assign and remove role assignments — but cannot manage resources"
    ],
    correct: [[0, 0], [1, 1], [2, 2], [3, 3]],
    explanation: "Azure built-in roles:\n\n• Owner — Includes all Contributor permissions plus Microsoft.Authorization/*/write (can assign roles, create/delete blueprints). Full control.\n• Contributor — Create and manage all resource types. Does NOT have Microsoft.Authorization/*/write — cannot assign roles.\n• Reader — View (read) all resources. No create, modify, or delete permissions.\n• User Access Administrator — Specifically grants Microsoft.Authorization/*/write. Can assign roles but has no permissions to manage the resources themselves (no compute, storage, networking actions).\n\nCommon use case for User Access Administrator: granting someone the ability to set up RBAC for others without giving them Contributor-level resource access.",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/built-in-roles"
  },

  {
    id: 134, domain: 1, subdomain: "Azure Policy", type: "dragdrop",
    question: "Match each Azure Policy effect to the scenario where it should be used.",
    dragItems: [
      "Deny",
      "Audit",
      "DeployIfNotExists",
      "Modify"
    ],
    dropZones: [
      "Block creation of public IP addresses on all new subnets",
      "Log a compliance warning when VMs don't have the 'CostCenter' tag, without blocking deployment",
      "Automatically install the Azure Monitor Agent on VMs that don't have it",
      "Automatically add a required tag to resources that are created or updated without it"
    ],
    correct: [[0, 0], [1, 1], [2, 2], [3, 3]],
    explanation: "Azure Policy effects:\n\n• Deny — evaluated BEFORE the resource is created/updated. Blocks the ARM operation entirely. Used for hard compliance requirements (e.g., no public IPs, only allowed locations).\n\n• Audit — logs non-compliance to the policy compliance dashboard but does NOT block anything. Used for visibility and reporting without enforcing restrictions.\n\n• DeployIfNotExists — after a resource is created/updated, checks a related resource and deploys it if missing. Used for ensuring companion resources exist (VM extensions, diagnostic settings, backup configuration).\n\n• Modify — adds, updates, or removes properties (typically tags) on resources during create/update, or during remediation. Does not block — it corrects.",
    reference: "https://learn.microsoft.com/azure/governance/policy/concepts/effects"
  },

  {
    id: 135, domain: 1, subdomain: "Cost Management", type: "single",
    question: "You are reviewing your Azure costs and want to identify which Azure services are most costly and understand cost trends over the past 6 months. You also need to group costs by resource group. Which tool in the Azure portal should you use?",
    options: [
      "Azure Monitor → Metrics — filter billing metrics by service type",
      "Azure Cost Management + Billing → Cost analysis",
      "Azure Advisor → Cost recommendations",
      "Microsoft Entra ID → Usage and insights"
    ],
    correct: [1],
    explanation: "Azure Cost Management + Billing → Cost Analysis provides:\n• Flexible views of costs over custom date ranges (up to 13 months of billing history)\n• Grouping by: resource group, resource type, service name, location, subscription, tag, etc.\n• Filtering by: subscription, resource group, tag, meter, service\n• Chart types: accumulated cost, daily cost, monthly cost\n• Download to CSV or Excel\n• Ability to save views as 'saved views'\n\nAzure Advisor provides recommendations for cost optimization but shows suggestions, not historical cost analysis. Azure Monitor metrics include some billing metrics but don't provide the comprehensive cost breakdown and grouping available in Cost Analysis.",
    reference: "https://learn.microsoft.com/azure/cost-management-billing/costs/quick-acm-cost-analysis"
  },

  {
    id: 136, domain: 1, subdomain: "Azure RBAC", type: "single",
    question: "A security auditor needs to see all RBAC role assignments across all subscriptions in a management group hierarchy, including inherited assignments. They need this data in a queryable format. Which approach provides the most comprehensive view?",
    options: [
      "Run Get-AzRoleAssignment for each subscription separately and export to CSV",
      "Use Azure Resource Graph to query role assignments across all subscriptions with a single query",
      "Navigate to each subscription's IAM blade in the Azure portal and export assignments",
      "Use the Azure Cost Management export to get role assignment data"
    ],
    correct: [1],
    explanation: "Azure Resource Graph enables cross-subscription, cross-management group queries using KQL (Kusto Query Language). For role assignments:\n\nKQL query:\nAuthorizationResources\n| where type == 'microsoft.authorization/roleassignments'\n| project RoleDefinitionId=properties.roleDefinitionId, PrincipalId=properties.principalId, Scope=properties.scope, subscriptionId\n\nAdvantages:\n• Query spans ALL subscriptions in the management group simultaneously\n• Returns results in seconds regardless of subscription count\n• Exportable to CSV or used via REST API\n• No need to iterate subscription by subscription\n\nGet-AzRoleAssignment works but requires a loop over each subscription. Resource Graph is the enterprise-scale solution for cross-subscription queries.",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/role-assignments-list-rest"
  },
  {
    id: 137,
    domain: 1,
    subdomain: "Managed Identities",
    type: "single",
    scenario: "An Azure Function App needs to read secrets from Azure Key Vault. The development team wants to avoid storing any credentials in code or configuration files. The Function App is deployed to a Consumption plan.",
    question: "Which approach provides the most secure, operationally simple method for the Function App to authenticate to Key Vault?",
    options: [
      "Create a service principal with a client secret, store the secret in Application Settings (environment variable), and use it in code to get a token",
      "Enable a system-assigned managed identity on the Function App, then create a Key Vault access policy (or RBAC role assignment) granting the identity secret read permissions",
      "Store the Key Vault secrets directly in Azure App Configuration and reference them from the Function App settings",
      "Use a shared access signature (SAS) token generated from the Key Vault to authenticate the Function App"
    ],
    correct: [1],
    explanation: "System-assigned managed identity on the Function App:\n• Azure automatically creates and manages a service principal in Entra ID\n• No credentials to store, rotate, or manage\n• The Function App gets a token via the Azure Instance Metadata Service (IMDS) internally\n• Grant Key Vault RBAC role (e.g., 'Key Vault Secrets User') to the managed identity\n• In code: use DefaultAzureCredential() from Azure SDK — it automatically uses the managed identity token\n\nKey Vault does NOT use SAS tokens — SAS is a Storage concept.\nStoring client secrets in Application Settings is a credential in configuration (violates the requirement).\nApp Configuration can store Key Vault references, but the underlying auth still needs an identity — managed identity is still the right answer for the auth layer."
  },
  {
    id: 138,
    domain: 1,
    subdomain: "Entra ID External Identities",
    type: "single",
    scenario: "Contoso wants to invite partner users from Fabrikam (fabrikam.com) to collaborate on a project in Microsoft Teams and SharePoint. Fabrikam uses Microsoft 365. Contoso wants guests to sign in with their existing Fabrikam credentials without Contoso managing any passwords.",
    question: "Which Entra ID feature enables this and what sign-in method will Fabrikam users use?",
    options: [
      "Azure AD B2C — Fabrikam users create Contoso B2C local accounts and set a new password",
      "Entra ID B2B Collaboration — Fabrikam users receive an invitation email and sign in with their own Fabrikam (Microsoft 365) organizational credentials via federation",
      "Entra ID Guest Accounts with one-time passcode (OTP) — users receive a code by email each time they sign in",
      "Configure ADFS federation between Contoso and Fabrikam domains so users sign in via Fabrikam's ADFS"
    ],
    correct: [1],
    explanation: "Entra ID B2B (Business-to-Business) Collaboration:\n• Contoso invites partner users by sending an invitation to their corporate email\n• Fabrikam users redeem the invitation and authenticate using their own Fabrikam Microsoft 365 credentials (federation with Microsoft's identity platform)\n• Contoso never manages Fabrikam passwords — Fabrikam's IdP handles authentication\n• Guest user objects are created in Contoso's Entra ID tenant (userType = Guest)\n• Contoso can apply Conditional Access, MFA requirements, and Access Reviews to these guests\n\nB2C is for customer-facing applications (consumers), not enterprise B2B collaboration.\nOTP is a fallback for guests who don't have an organizational account (e.g., Gmail users) — not needed when Fabrikam is on M365.\nADFS federation requires on-premises infrastructure — not needed since both are on M365/cloud."
  },
  {
    id: 139,
    domain: 1,
    subdomain: "Azure Policy",
    type: "multi",
    scenario: "Your organization must enforce the following governance rules across all Azure subscriptions:\n1. All resources must have a 'CostCenter' tag\n2. Azure SQL databases must only be deployed in Australia East or Australia Southeast\n3. VMs must use approved VM SKUs only",
    question: "Which policy effects should you use for each rule respectively? Select THREE answers, one for each rule.",
    options: [
      "Rule 1 (CostCenter tag): Append — automatically adds the tag with a default value if missing",
      "Rule 1 (CostCenter tag): Deny — blocks resource creation if the tag is absent",
      "Rule 2 (SQL location): Deny — blocks SQL databases from being created outside allowed regions",
      "Rule 2 (SQL location): Audit — logs SQL databases created outside allowed regions but doesn't block",
      "Rule 3 (VM SKUs): Deny — prevents deployment of non-approved VM sizes",
      "Rule 3 (VM SKUs): Modify — changes the VM SKU to an approved one during deployment"
    ],
    correct: [0,2,4],
    explanation: "Policy effects for each rule:\n\nRule 1 — CostCenter tag:\n• 'Append' is the most appropriate: automatically adds the tag with a specified default value if the resource is created without it. Resources can still be created, and the tag gets populated automatically.\n• 'Deny' would block all resource creation without the tag — more disruptive; better after a grace period\n• (Note: 'Modify' can also add/modify tags but Append is more commonly used for tag requirements)\n\nRule 2 — SQL location:\n• 'Deny' is correct: prevents SQL databases from being deployed outside Australia East/Southeast. The built-in 'Allowed locations' policy uses Deny.\n• 'Audit' would just log violations — resources would still be created in the wrong region\n\nRule 3 — VM SKUs:\n• 'Deny' is correct: the built-in 'Allowed virtual machine size SKUs' policy uses Deny — non-approved SKU deployments are rejected\n• 'Modify' changes properties of existing resources during create/update (e.g., tags, properties) — it cannot change a VM SKU during deployment"
  },
  {
    id: 140,
    domain: 1,
    subdomain: "Entra ID — MFA & Authentication",
    type: "single",
    scenario: "An organization is enabling Microsoft Entra ID per-user MFA for 5,000 users. Some users report that they are not being prompted for MFA even though it is enabled for their account. The administrator checks and confirms MFA status shows 'Enabled' (not 'Enforced') for these users.",
    question: "Why are some users not being prompted for MFA, and what must the administrator do to ensure MFA is consistently required?",
    options: [
      "Users in 'Enabled' state have registered for MFA but are not yet required to use it. The administrator must change their status to 'Enforced' or switch to Conditional Access-based MFA",
      "The MFA service is only active during business hours. The administrator must configure a 24/7 MFA policy in the Conditional Access blade",
      "Per-user MFA doesn't work for users synced from on-premises Active Directory. Only cloud-only accounts support per-user MFA",
      "MFA is being bypassed because Trusted IPs are configured in legacy MFA settings. The administrator must remove the trusted IP ranges"
    ],
    correct: [0],
    explanation: "Per-user MFA has three states:\n\n• Disabled: MFA is off for the user (default)\n• Enabled: MFA is configured for the user, but the user hasn't completed registration yet AND is not yet being challenged. Once they register, they'll be prompted.\n• Enforced: MFA registration is complete AND the user is challenged on every sign-in (unless CA policy allows session persistence)\n\nUsers showing 'Enabled' have had MFA turned on but haven't been forced through registration. Until they complete registration, they may not be challenged (behavior depends on the app).\n\nThe administrator should:\n1. Move users to 'Enforced' state, which forces MFA on next sign-in\n2. OR — Microsoft's recommendation — migrate entirely to Conditional Access-based MFA (which is more flexible and supersedes per-user MFA)\n\nPer-user MFA works for synced (hybrid) users too. Trusted IPs are relevant but not the cause described here."
  },
  {
    id: 141,
    domain: 1,
    subdomain: "Azure RBAC",
    type: "yesno",
    scenario: "A user is assigned the 'Reader' role at the Resource Group scope. The user's manager wants them to be able to create and delete resources in that Resource Group. The administrator assigns the user the 'Contributor' role at the Subscription level (which contains this Resource Group).",
    question: "Will the user now be able to create and delete resources in the Resource Group?",
    options: ["Yes", "No"],
    correct: [0],
    explanation: "Yes — Azure RBAC uses additive permissions. A role assigned at a higher scope (Subscription) automatically applies to all child scopes (Resource Groups, Resources).\n\nThe user now has:\n• Contributor at Subscription level → applies to ALL resource groups and resources in that subscription\n• Reader at the specific Resource Group → Reader is less permissive than Contributor, but it doesn't restrict Contributor rights granted from above\n\nAzure RBAC is ADDITIVE — you get the union of all role permissions across all applicable scopes. There is no way to 'narrow' permissions at a lower scope using RBAC alone (unlike deny assignments, which are a separate concept).\n\nResult: The user has Contributor access to the Resource Group (from the subscription-level assignment) plus Reader (redundant but not harmful). They can create and delete resources."
  },
  {
    id: 142,
    domain: 1,
    subdomain: "Azure RBAC",
    type: "yesno",
    scenario: "A user is assigned the 'Owner' role at the Resource Group scope. An Azure Policy with 'Deny' effect is assigned at the Subscription level, blocking the creation of resources without a 'Department' tag. The user attempts to create a Storage Account in the Resource Group without adding a 'Department' tag.",
    question: "Will the Storage Account creation succeed?",
    options: ["Yes", "No"],
    correct: [1],
    explanation: "No — Azure Policy and RBAC are separate authorization layers. Azure Policy evaluates AFTER RBAC.\n\nEvaluation order:\n1. RBAC: Does the user have permission to create a Storage Account? YES (Owner at RG scope)\n2. Azure Policy: Does the request comply with all Deny policies? NO — the policy blocks resources without a 'Department' tag\n\nEven though the user has Owner rights (the most permissive RBAC role), the Azure Policy Deny effect is enforced regardless. Policy applies to ALL principals — including Owners and even subscription admins — unless the policy assignment explicitly excludes them.\n\nThe operation returns an error similar to:\n'Resource was disallowed by policy. Policy: Require Department tag on resources.'\n\nThis is why Azure Policy is used for governance guardrails — it operates orthogonally to RBAC permissions."
  },
  {
    id: 143,
    domain: 1,
    subdomain: "Entra ID — Service Principals",
    type: "single",
    scenario: "A developer needs to register a custom application in Entra ID so it can call Microsoft Graph API to read user profiles. The application will run as a background daemon (no user interaction).",
    question: "What type of permissions should be configured on the App Registration, and what must an administrator do before the app can access Graph?",
    options: [
      "Delegated permissions (acting as the signed-in user); the developer can grant these themselves in the app registration portal",
      "Application permissions (app-only, no signed-in user); an administrator with Global Admin or Application Admin role must grant admin consent for the Application permissions",
      "Delegated permissions with the 'offline_access' scope; an administrator must create a service principal separately",
      "Application permissions; the developer grants consent using their own account credentials if they have the Application Developer role"
    ],
    correct: [1],
    explanation: "Daemon/background apps with no user context use the OAuth 2.0 Client Credentials flow:\n• Permission type: Application permissions (not Delegated)\n• Delegated permissions require a signed-in user — not applicable for daemons\n\nFor Microsoft Graph 'User.Read.All' (Application permission):\n• An Entra ID administrator must grant admin consent — this is required for all Application permissions and for Delegated permissions with elevated scopes\n• Admin consent can be granted: in the Azure portal → App Registration → API permissions → Grant admin consent for [tenant]\n\nThe Application Developer role allows creating app registrations but CANNOT grant admin consent for Application permissions — that requires Global Admin or Privileged Role Administrator (or Cloud Application Administrator for non-admin consented apps).\n\nAfter consent: the app authenticates with its client_id + client_secret (or certificate), gets a token, and calls Graph without any user interaction."
  },
  {
    id: 144,
    domain: 1,
    subdomain: "Management Groups",
    type: "dragdrop",
    question: "Arrange the following Azure hierarchy levels in order from broadest scope (top) to narrowest scope (bottom).",
    dragItems: [
      "Azure Subscription",
      "Resource Group",
      "Management Group",
      "Individual Resource (e.g., VM, Storage Account)",
      "Tenant Root Group"
    ],
    dropZones: [
      "Level 1 — Broadest",
      "Level 2",
      "Level 3",
      "Level 4",
      "Level 5 — Narrowest"
    ],
    correct: [[4,0],[2,1],[0,2],[1,3],[3,4]],
    explanation: "Azure hierarchy from broadest to narrowest:\n\n1. Tenant Root Group (the top-level management group automatically created for each Entra ID tenant — contains all other management groups)\n2. Management Group (up to 6 levels of nesting below root; used for organizing subscriptions and applying governance at scale)\n3. Azure Subscription (billing and access boundary; contains resource groups)\n4. Resource Group (logical container for related resources; resources in one RG share a lifecycle)\n5. Individual Resource (VM, Storage Account, Key Vault, etc. — the leaf node)\n\nPolicy and RBAC assignments at higher levels cascade down to all child scopes."
  },
  {
    id: 145,
    domain: 1,
    subdomain: "Entra ID — Identity Protection",
    type: "single",
    scenario: "Northwind Traders wants to automatically block sign-ins where Entra ID detects a high risk level (e.g., sign-ins from anonymous IP addresses, impossible travel, leaked credentials). They want this to happen in real time without administrator review for every event. They have Entra ID P2 licenses.",
    question: "Which feature should be configured and what policy setting is needed?",
    options: [
      "Azure Monitor Log Analytics alerts — create an alert rule that triggers an Azure Automation runbook to disable the user account",
      "Entra ID Identity Protection — configure a Sign-in Risk Policy with risk level set to 'High' and access set to 'Block access'",
      "Entra ID Identity Protection — configure a User Risk Policy with risk level set to 'High' and require password reset",
      "Conditional Access — create a policy with Sign-in Risk = High and Grant = Block access (requires Entra ID P2)"
    ],
    correct: [3],
    explanation: "Both option B and D are partially correct, but the current Microsoft recommended approach uses Conditional Access with sign-in risk conditions (which requires P2 and integrates with Identity Protection signals):\n\nConditional Access + Identity Protection integration (recommended):\n• Assignments: All users\n• Conditions: Sign-in risk = High\n• Grant: Block access\n\nThis blocks high-risk sign-ins in real time. Entra ID evaluates risk signals (anonymous IP, impossible travel, malware-linked IPs, etc.) and the CA policy enforces the block immediately.\n\nSign-in Risk Policy (option B) vs Conditional Access (option D):\n• Microsoft has moved toward Conditional Access for new deployments — it gives more flexibility (you can require MFA for Medium risk and Block for High)\n• The legacy Identity Protection 'Sign-in Risk Policy' blade is being deprecated in favor of Conditional Access\n\nUser Risk Policy (option C) responds to user-level risk (leaked credentials) and requires MFA + password reset — different from blocking a specific risky sign-in session.\n\nOption A (Automation runbook) adds latency and is an anti-pattern — real-time blocking should use platform-native CA, not custom automation."
  },
  {
    id: 146,
    domain: 1,
    subdomain: "Cost Management",
    type: "single",
    scenario: "A team lead wants to receive an email alert when the actual cost for their Resource Group reaches 80% of the $10,000 monthly budget, and another alert when the forecasted cost is expected to exceed the budget for the month.",
    question: "How should you configure Azure Cost Management budgets to satisfy both requirements?",
    options: [
      "Create one budget of $10,000 at the Resource Group scope. Add two alert conditions: (1) Actual cost >= 80% ($8,000) and (2) Forecasted cost >= 100% ($10,000). Set the notification email to the team lead.",
      "Create two separate budgets: one for actual cost at $8,000 threshold and one for forecasted cost at $10,000 threshold",
      "Use Azure Monitor to create two metric alerts on the Microsoft.Billing/billingAccounts resource for actual and forecast thresholds",
      "Create one budget at the Subscription level with a 80% actual alert — Resource Group level budgets are not supported"
    ],
    correct: [0],
    explanation: "Azure Cost Management budgets support multiple alert conditions on a single budget:\n\nConfiguration:\n1. Go to Cost Management → Budgets → + Add\n2. Scope: Resource Group (resource group-level budgets ARE supported)\n3. Budget amount: $10,000 | Period: Monthly\n4. Alert conditions:\n   • Condition 1: Alert type = Actual | % of budget = 80 → notifies at $8,000 actual spend\n   • Condition 2: Alert type = Forecasted | % of budget = 100 → notifies when forecast predicts the full $10,000 will be consumed\n5. Email recipients: team lead email\n\nBoth conditions can be set on one budget — no need for two separate budgets.\n\nOption B works technically but is redundant — one budget with multiple thresholds is the correct approach.\nOption C: Azure Monitor metrics don't directly surface Cost Management budget thresholds — budgets have their own alerting mechanism.\nOption D is incorrect — Resource Group scope is fully supported for budgets."
  },
  {
    id: 147,
    domain: 1,
    subdomain: "Entra ID — Hybrid Identity",
    type: "single",
    scenario: "A company uses Azure AD Connect with Password Hash Sync (PHS). A security team requires that when an on-premises user account is disabled in Active Directory, the user should be immediately unable to sign in to cloud applications — without waiting for the next sync cycle (which runs every 30 minutes by default).",
    question: "How can the administrator ensure near-real-time account disablement propagates to Entra ID?",
    options: [
      "Switch from PHS to Pass-through Authentication (PTA) — with PTA, authentication checks happen against on-premises AD in real time, so a disabled account is immediately rejected",
      "Configure the Azure AD Connect sync cycle to run every 1 minute using Set-ADSyncScheduler -CustomizedSyncCycleInterval 00:01:00",
      "Use Microsoft Entra ID's 'Soft Delete' feature — when an account is soft-deleted in Entra ID it immediately blocks sign-in",
      "Enable Entra ID's 'Revoke Sign-in Sessions' button — click this after every on-premises account disable to forcefully sign out the user"
    ],
    correct: [0],
    explanation: "With Password Hash Sync (PHS):\n• User's password hash is synced to Entra ID — authentication happens in the cloud against the synced hash\n• Account disable in on-premises AD is synced at the next cycle (default: 30 minutes)\n• Until the sync runs, the user's Entra ID account remains enabled and they can sign in to cloud apps\n\nWith Pass-through Authentication (PTA):\n• Authentication requests are forwarded in real time to on-premises AD via PTA agents\n• When the user tries to sign in, Entra ID sends the credentials to the on-premises agent, which validates against on-premises AD\n• If the on-premises account is disabled → AD rejects the authentication → user is immediately blocked from cloud apps\n• No wait for a sync cycle\n\nThis is the key difference: PTA = real-time on-premises validation; PHS = synced state with sync-cycle latency.\n\nOption B: Minimum sync cycle via Azure AD Connect is 30 minutes (6 minutes for delta sync with the -Delta flag, but not 1 minute).\nOption C: Soft delete removes the object from the directory — not the same as account disable.\nOption D: Revoking sessions blocks current sessions but doesn't prevent new sign-ins with valid credentials."
  },
  {
    id: 148,
    domain: 1,
    subdomain: "Subscriptions",
    type: "single",
    scenario: "Your company has acquired a startup. The startup has Azure resources in their own subscription (Sub-B). Your company's existing resources are in Sub-A. You need to move Sub-B under your company's Management Group hierarchy for governance. The startup subscription uses a different Entra ID tenant.",
    question: "What must happen BEFORE you can associate Sub-B with your company's Management Group?",
    options: [
      "Move all resources from Sub-B into Sub-A, then delete Sub-B",
      "Transfer Sub-B's billing ownership to your company's billing account, then reassociate Sub-B with your company's Entra ID tenant. Only then can Sub-B be added to your Management Group",
      "Create a VNet peering between Sub-A and Sub-B to establish network trust before the management group association",
      "Assign your company's Global Admin role on Sub-B's tenant to yourself, which automatically moves the subscription under your tenant's management group"
    ],
    correct: [1],
    explanation: "A Management Group is scoped to an Entra ID tenant. To add a subscription to YOUR Management Group, the subscription must be associated with YOUR Entra ID tenant.\n\nProcess for acquiring a subscription from another tenant:\n\n1. Transfer billing ownership:\n   • In the startup's Azure portal: Cost Management + Billing → Transfer billing ownership → send to your billing account\n   • Or: your EA enrollment admin can transfer the subscription\n\n2. Change the Entra ID tenant (directory):\n   • In the startup's subscription: Settings → Directories → Transfer directory → select your company's Entra ID tenant\n   • Note: This re-creates RBAC assignments (they must be recreated) and some resources (Azure AD-integrated) require reconfiguration\n\n3. Once in your tenant: add the subscription to your Management Group\n   • Management Groups → Add subscription → select Sub-B\n\nVNet peering (Option C) is a networking concept — unrelated to Management Group or tenant association.\nA Global Admin role in Sub-B's tenant doesn't automatically transfer subscription ownership to your tenant (Option D)."
  },
  {
    id: 149,
    domain: 1,
    subdomain: "Azure Policy",
    type: "single",
    scenario: "An organization has a policy initiative (a set of policy definitions) assigned at the Management Group level. One subscription has a legacy application that cannot comply with one of the policies in the initiative (it requires an older TLS version). The policy has an 'Audit' effect. The security team wants to see compliance reports but needs this specific subscription to be excluded from that one policy without removing the entire initiative from it.",
    question: "What is the correct approach?",
    options: [
      "Remove the initiative assignment from the subscription and re-assign it with the non-compliant policy removed",
      "Create a Policy Exemption on the specific policy definition within the initiative, scoped to the subscription, with exemption category 'Waiver' and an expiry date",
      "Change the policy effect from 'Audit' to 'Disabled' for the entire initiative",
      "Add the subscription to the initiative assignment's 'Exclusion' scope — this removes the subscription from all policy evaluations in the initiative"
    ],
    correct: [1],
    explanation: "Azure Policy Exemptions allow you to exclude a specific resource, resource group, or subscription from a specific policy definition (even within an initiative) without modifying the initiative assignment.\n\nExemption types:\n• Waiver: The resource is non-compliant but exempted for a business reason (e.g., legacy app requirement)\n• Mitigated: An alternative control has been implemented to address the policy's intent\n\nConfiguration:\n1. Policy → Compliance → click the non-compliant policy → Create Exemption\n2. Scope: the subscription\n3. Policy definition: select only the TLS policy from the initiative\n4. Category: Waiver\n5. Expiration: set a date (e.g., when the legacy app will be upgraded)\n\nThis exemption:\n• Marks the subscription as 'Exempt' for that policy (appears in compliance reports as exempt, not non-compliant)\n• Does NOT affect other policies in the initiative\n• Has an expiry — automatically becomes non-compliant again after the date\n\nOption A: Reassigning the initiative without the policy would remove that policy for ALL subscriptions under the management group.\nOption C: Disabling the effect turns off auditing globally.\nOption D: Exclusion removes the scope from the ENTIRE initiative, not just one policy."
  },
  {
    id: 150,
    domain: 1,
    subdomain: "Entra ID — SSPR",
    type: "single",
    scenario: "An organization enables Self-Service Password Reset (SSPR) for all users. Users must authenticate using two methods before resetting their password. Available methods include mobile app notification, email, mobile phone, office phone, and security questions. An administrator wants to prevent users from using security questions alone (or combined with office phone) due to social engineering risks.",
    question: "How should the administrator configure SSPR to disallow security questions as a valid reset method?",
    options: [
      "In the SSPR Authentication Methods settings, uncheck 'Security Questions' from the list of allowed methods",
      "Create a Conditional Access policy that blocks SSPR when security questions are selected",
      "Set the number of security questions required for registration to 0",
      "Use Azure Monitor to alert when security questions are used and manually reset the account back"
    ],
    correct: [0],
    explanation: "SSPR Authentication Methods configuration:\n• In Entra ID → Password reset → Authentication methods\n• You can enable/disable individual methods: Mobile app notification, Mobile app code, Email, Mobile phone, Office phone, Security questions\n• Unchecking 'Security Questions' removes it from the available methods list entirely — users cannot select it during registration or password reset\n\nThis is the direct, purpose-built control.\n\nSecurity questions are generally considered weak for authentication because:\n• Answers are often publicly discoverable via social media or social engineering\n• Microsoft recommends using app-based methods (Authenticator app) or phone instead\n\nThe Microsoft Authenticator app, FIDO2 security keys, and phone-based OTP are considered stronger methods.\n\nConditional Access (option B) does not have granular control over which SSPR method a user selects.\nSetting questions required to 0 (option C) affects registration count, not whether the method is enabled.\nMonitoring and manual intervention (option D) is reactive and operationally unsustainable."
  }

]);
