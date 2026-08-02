/**
 * Navix RBAC — Barrels des utilitaires de la feature.
 */
export {
  getRole,
  getPermissionsForRole,
  normalizeRequired,
  hasPermission,
  hasAllPermissions,
  can,
  hasAnyRole,
} from './access';
export { getMenuMeta, isItemVisible, filterSidebarSections } from './menu';
