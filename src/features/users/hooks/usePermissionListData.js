/**
 * Navix Users — Catalogue des permissions (lecture seule)
 * --------------------------------------------------------------------------
 * Expose l'état du store Permissions (catalogue, groupes par module, modules,
 * indicateurs). La page Permissions et l'éditeur de rôle consomment ce hook.
 */
import { usePermissionStore } from '../store';

/**
 * @returns {object} { permissions, groups, modules, sensitive, stats, isLoading, error, refresh }
 */
export const usePermissionListData = () => {
  const permissions = usePermissionStore((state) => state.permissions);
  const groups = usePermissionStore((state) => state.groups);
  const modules = usePermissionStore((state) => state.modules);
  const sensitive = usePermissionStore((state) => state.sensitive);
  const stats = usePermissionStore((state) => state.stats);
  const isLoading = usePermissionStore((state) => state.isLoading);
  const error = usePermissionStore((state) => state.error);
  const refresh = usePermissionStore((state) => state.refresh);

  return { permissions, groups, modules, sensitive, stats, isLoading, error, refresh };
};
