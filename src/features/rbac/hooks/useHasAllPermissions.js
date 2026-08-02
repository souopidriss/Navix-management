/**
 * Navix RBAC — Hook de permissions requises.
 * Vérifie que le contexte courant dispose de toutes les permissions demandées.
 * @param {string|string[]} permissions — permission(s) requise(s)
 * @returns {boolean}
 */
import { useRbacStore } from '../store';
import { hasAllPermissions } from '../utils';

export const useHasAllPermissions = (permissions) => {
  const userPermissions = useRbacStore((state) => state.permissions);
  return hasAllPermissions(userPermissions, permissions);
};
