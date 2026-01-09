/**
 * User roles definition matching Keycloak realm roles
 * These roles are used for role-based access control (RBAC) throughout the application
 */
export const UserRoles = {
  /**
   * Global Administrator - Has access to all features and can manage the entire system
   */
  GLOBAL_ADMINISTRATOR: 'GlobalAdministrator',

  /**
   * Datacenter Technician - Can manage datacenter infrastructure and resources
   */
  DATACENTER_TECHNICIAN: 'DatacenterTechnician',

  /**
   * Workspace Manager - Can create and manage workspaces and their resources
   */
  WORKSPACE_MANAGER: 'WorkspaceManager',

  /**
   * Workspace Tenant - Basic user role with access to assigned workspaces
   */
  WORKSPACE_TENANT: 'WorkspaceTenant',
} as const;

/**
 * Type for user role values
 */
export type UserRole = typeof UserRoles[keyof typeof UserRoles];

/**
 * Role hierarchy for permission checking
 * Higher roles inherit permissions from lower roles
 */
export const RoleHierarchy: Record<UserRole, UserRole[]> = {
  [UserRoles.GLOBAL_ADMINISTRATOR]: [
    UserRoles.GLOBAL_ADMINISTRATOR,
    UserRoles.DATACENTER_TECHNICIAN,
    UserRoles.WORKSPACE_MANAGER,
    UserRoles.WORKSPACE_TENANT,
  ],
  [UserRoles.DATACENTER_TECHNICIAN]: [
    UserRoles.DATACENTER_TECHNICIAN,
    UserRoles.WORKSPACE_MANAGER,
    UserRoles.WORKSPACE_TENANT,
  ],
  [UserRoles.WORKSPACE_MANAGER]: [
    UserRoles.WORKSPACE_MANAGER,
    UserRoles.WORKSPACE_TENANT,
  ],
  [UserRoles.WORKSPACE_TENANT]: [UserRoles.WORKSPACE_TENANT],
};

/**
 * Check if a user role has permission for a required role
 * @param userRole - The user's role
 * @param requiredRole - The role required for the operation
 * @returns true if the user has permission, false otherwise
 */
export const hasRolePermission = (
  userRole: UserRole,
  requiredRole: UserRole
): boolean => {
  const allowedRoles = RoleHierarchy[requiredRole] || [];
  return allowedRoles.includes(userRole);
};

/**
 * Get user-friendly display name for a role
 * @param role - The role constant
 * @returns Human-readable role name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    [UserRoles.GLOBAL_ADMINISTRATOR]: 'Global Administrator',
    [UserRoles.DATACENTER_TECHNICIAN]: 'Datacenter Technician',
    [UserRoles.WORKSPACE_MANAGER]: 'Workspace Manager',
    [UserRoles.WORKSPACE_TENANT]: 'Workspace Tenant',
  };
  return roleNames[role] || role;
};

/**
 * Role descriptions for UI display
 */
export const RoleDescriptions: Record<UserRole, string> = {
  [UserRoles.GLOBAL_ADMINISTRATOR]:
    'Full system access with all administrative privileges',
  [UserRoles.DATACENTER_TECHNICIAN]:
    'Manage datacenter infrastructure, switches, ports, and physical resources',
  [UserRoles.WORKSPACE_MANAGER]:
    'Create and manage workspaces, assign resources, and manage team members',
  [UserRoles.WORKSPACE_TENANT]:
    'Access assigned workspaces and use allocated resources',
};
