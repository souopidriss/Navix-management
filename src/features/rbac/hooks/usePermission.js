/**
 * Navix RBAC — Hook de permission.
 * Vérifie que le contexte courant dispose d'une permission donnée.
 * @param {string} permission — ex. 'vehicles.update'
 * @returns {boolean}
 */
import { useRbacStore } from '../store';
import { hasPermission } from '../utils';

export const usePermission = (permission) => {
  const permissions = useRbacStore((state) => state.permissions);
  return hasPermission(permissions, permission);
};
