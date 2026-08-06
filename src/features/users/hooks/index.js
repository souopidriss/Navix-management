/**
 * Navix Users — Hooks du module Utilisateurs / Rôles / Permissions.
 * --------------------------------------------------------------------------
 * Point d'entrée unique pour les composants et les pages du module.
 */
export { useTenantScope, getTenantScopeCompanyId, enrichUsers, enrichRoles } from './useTenantScope';
export { useUserListData } from './useUserListData';
export { useUserActions } from './useUserActions';
export { useUserForm, bindCompanyChange } from './useUserForm';
export { useRoleListData } from './useRoleListData';
export { useRoleActions } from './useRoleActions';
export { useRoleForm } from './useRoleForm';
export { usePermissionListData } from './usePermissionListData';
export { usePermissionsByModule } from './usePermissionsByModule';
