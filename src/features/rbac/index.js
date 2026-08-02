/**
 * Navix RBAC — API publique de la feature.
 * Seuls les non-composants sont exportés ici ; les composants sont importés
 * via `@/features/rbac/components` (même convention que la feature auth).
 */
export { WILDCARD, PERMISSIONS, ALL_PERMISSIONS } from './constants/permissions';
export { ROLES, ROLE_DEFINITIONS } from './constants/roles';
export { ROUTE_META } from './constants/menu';
export { MOCK_RBAC } from './constants/mock';

export {
  getRole,
  getPermissionsForRole,
  normalizeRequired,
  hasPermission,
  hasAllPermissions,
  can,
  hasAnyRole,
} from './utils/access';
export { getMenuMeta, isItemVisible, filterSidebarSections } from './utils/menu';

export { useRbacStore } from './store';
export { useRole, usePermission, useCan, useHasAnyRole, useHasAllPermissions } from './hooks';
