const translation = {
  spaceNameExists: 'Space name already exists',
  createSuccess: 'Space created successfully!',
  updateSuccess: 'Space updated successfully!',
  createFailed: 'Failed to create space',
  cancel: 'Cancel',
  createLimitReached: 'Creation limit reached',
  confirm: 'Confirm',
  save: 'Save',
  createSpace: 'Create New Space',
  editSpace: 'Edit Space',
  bannerText:
    'Collaborate and share projects, agents, plugins, workflows, and knowledge bases in a space',
  spaceName: 'Space Name',
  pleaseEnterSpaceName: 'Please enter space name',
  spaceNameMaxLength: 'Space name cannot exceed 50 characters',
  description: 'Description',
  descriptionMaxLength: 'Description cannot exceed 2000 characters',
  describeSpace: 'Describe the space',
  goUpgrade: 'Upgrade',
  spaceManagement: 'Space Management',
  allSpaces: 'All Spaces',
  myCreated: 'My Created',
  createSpaceButton: 'Create Space',
  searchSpacePlaceholder: 'Search for spaces',
  personalSpace: 'Personal Space',
  mySpace: 'My Space',
  queryFailed: 'Query failed',

  // EnterpriseSpaceEmptyMenu
  createTeamSharedSpace: 'Create team shared space',
  createNewSpace: 'Create New Space',
  joinTeamSpace: 'Join team space',
  enterSpaceManagement: 'Enter Space Management',

  // BaseLayout & Common
  enterpriseSpaceAvatar: 'Enterprise space avatar',
  noData: 'No data',

  // OrderTypeDisplay
  useCustomEditionForMore: 'Please use custom edition for more features',
  customEdition: 'Custom',

  // MemberManage
  memberList: 'Member List',
  invitationManagement: 'Invitation Management',
  batchImportSuccess: 'Batch import successful: {count} members',
  addMember: 'Add Member',
  selectRole: 'Select role',
  pleaseEnterUsername: 'Please enter username',
  selectStatus: 'Select status',
  memberManagement: 'Member Management',

  // TeamSettings
  leaveTeamEnterprise: 'Leave Team/Enterprise',
  basicInfo: 'Basic Info',
  teamSettings: 'Team Settings',

  // InfoHeader
  teamNameCannotBeEmpty: 'Team name cannot be empty',
  modifySuccess: 'Modified successfully',
  teamAvatar: 'Team avatar',
  pleaseEnterTeamName: 'Please enter team name',
  authorAvatar: 'Author avatar',
  avatarUploaded: 'Avatar uploaded!',
  uploadFailedOrExpired: 'Upload failed or package expired',

  // TeamInfo
  enterpriseCertificationUpgradeSuccess:
    'Enterprise certification upgraded successfully!',
  teamId: 'Team ID',
  organizationId: 'Organization ID',
  currentPackage: 'Current Package',
  creationTime: 'Creation Time',
  expirationTime: 'Expiration Time',
  renewNow: 'Renew Now',

  // SpaceSearch
  searchUsername: 'Search username',
  search: 'Search',

  // EnterpriseCertificationCard
  upgradeToEnterpriseCertification: 'Upgrade to Enterprise Certification',
  importLogoAsEnterpriseLogo: 'Import logo badge as enterprise logo',
  enableEnterpriseCertification:
    'Enable enterprise certification, all team members enjoy enterprise benefits',
  upgradedToEnterpriseCertification: 'Upgraded to Enterprise Certification',
  replace: 'Replace',
  logoUploaded: 'Logo uploaded!',

  // LeaveTeamModal
  enterprise: 'Enterprise',
  team: 'Team',
  leaveTeam: 'Leave Team',
  leaveEnterprise: 'Leave Enterprise',
  leaveTeamConfirmContent:
    'Are you sure you want to leave the team? After leaving, all resources will belong to the team, and ownership of spaces you created will be transferred to the team super admin.',
  leaveEnterpriseConfirmContent:
    'Are you sure you want to leave the enterprise? After leaving, all resources will belong to the enterprise, and ownership of spaces you created will be transferred to the enterprise super admin.',
  checkSuperAdminErrorTeam: 'Failed to check if team has another super admin',
  checkSuperAdminErrorEnterprise:
    'Failed to check if enterprise has another super admin',
  onlySuperAdminTeam:
    'You are the only super admin of the team, leaving is not supported',
  onlySuperAdminEnterprise:
    'You are the only super admin of the enterprise, leaving is not supported',
  leaveTeamError: 'Failed to leave team',
  leaveEnterpriseError: 'Failed to leave enterprise',
  leaveTeamSuccess: 'Left team successfully',
  leaveEnterpriseSuccess: 'Left enterprise successfully',

  // DeleteSpaceModal
  deleteSpaceTitle: 'Delete Space',
  deleteSpaceSuccess: 'Space deleted successfully',
  deleteSpaceWarning:
    'Please be cautious! After deletion, all data in the space will be lost, and allocated quotas will be deducted.',
  deleteSpaceConfirm:
    'Confirm deletion of space? This operation cannot be undone, and all data in the space will be permanently lost.',

  // LeaveSpaceModal
  leaveSpaceTitle: 'Leave Space',
  leaveSpaceSuccess: 'Successfully left space',
  leaveSpaceConfirm: 'Confirm leaving {name}?',

  // TransferOwnershipModal
  transferOwnershipTitle: 'Transfer Space Ownership',
  transferOwnershipSuccess: 'Transfer successful',
  transferOwnershipWarning:
    'After transferring ownership, your status will change to administrator',
  transferOwnershipLabel: 'Transfer ownership to',
  transferOwnershipPlaceholder: 'Please select member',
  transferOwnershipSelectMember: 'Please select the member to transfer to',

  // AddMemberModal
  addNewMember: 'Add New Member',
  enterUsername: 'Please enter username',
  memberLimitReached: 'Member limit reached: {count}',
  selectAtLeastOneUser: 'Please select at least one user',
  searchToAddMembers: 'Search username to add new members',
  userNotFound: 'No users found for "{keyword}"',
  selectAll: 'All',
  searching: 'Searching...',
  selected: 'Selected: ',
  maxValue: '(Max {count})',

  // SpaceList
  applySuccess: 'Application successful',
  accessSpaceFailed: 'Failed to access space',
  noSpaceYet: 'No spaces yet, please create one',

  // PersonSpace error messages
  getSpaceListFailed: 'Failed to get space list',
  getRecentVisitFailed: 'Failed to get recent visit list',

  // SpaceTable
  totalDataCount: 'Total {total} items',
  operation: 'Actions',

  // Enterprise page
  personalVersionNoAccess:
    'You are currently on a personal plan and do not have access to enterprise spaces',

  // Member management
  confirmDelete: 'Confirm Delete',
  confirmDeleteMember: 'Are you sure you want to delete member "{username}"?',
  deleteSuccess: 'Deleted successfully',
  roleUpdateSuccess: 'Role updated successfully',
  delete: 'Delete',
  username: 'Username',
  role: 'Role',
};

export default translation;
