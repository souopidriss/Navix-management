/**
 * Navix Users — Permissions par module (éditeur de rôle)
 * --------------------------------------------------------------------------
 * Fournit aux éditeurs (RolePermissionEditor, matrice) le catalogue groupé
 * par module, ordonné selon PERMISSION_MODULES, ainsi que la liste de tous
 * les codes de permission.
 */
import { useMemo } from 'react';
import { PERMISSION_MODULES } from '../constants';
import { usePermissionStore } from '../store';

/**
 * @returns {object} { modules, groups, allCodes }
 *   modules  : liste ordonnée des codes de module présents
 *   groups   : Record<module, Array<permission>>
 *   allCodes : tableau de tous les codes de permission
 */
export const usePermissionsByModule = () => {
  const groups = usePermissionStore((state) => state.groups);

  return useMemo(() => {
    const present = Object.keys(groups ?? {});
    const modules = PERMISSION_MODULES
      ? Object.keys(PERMISSION_MODULES).filter((module) => present.includes(module))
      : present;
    const allCodes = present.flatMap((module) => (groups[module] ?? []).map((p) => p.code));

    return { modules, groups: groups ?? {}, allCodes };
  }, [groups]);
};
