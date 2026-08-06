/**
 * Navix Users — Mocks du module Utilisateurs / Rôles / Permissions.
 * --------------------------------------------------------------------------
 * Les mocks sont importés cross-modules via `@/features/users/mocks`.
 */
export { MOCK_PERMISSIONS, getPermissionByCode, getPermissionsByModule } from './permissions.mock';
export {
  MOCK_ROLES,
  SYSTEM_ROLE_CODES,
  PROTECTED_ROLE_CODES,
  getRoleById,
} from './roles.mock';
export {
  MOCK_USERS,
  getUserById,
  getUsersByCompany,
  getActiveUsers,
} from './users.mock';
