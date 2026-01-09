export const USER_ROLES = {
  GLOBAL_ADMINISTRATOR: 'GlobalAdministrator',
  DATACENTER_TECHNICIAN: 'DatacenterTechnician',
  WORKSPACE_MANAGER: 'WorkspaceManager',
  WORKSPACE_TENANT: 'WorkspaceTenant',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];