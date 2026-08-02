/**
 * Navix RBAC — Hook de rôle(s) autorisé(s).
 * Vérifie que le rôle courant appartient à la liste autorisée.
 * @param {string|string[]} roles — rôle(s) autorisé(s) (ex. 'super_admin')
 * @returns {boolean}
 */
import { useRole } from './useRole';
import { hasAnyRole } from '../utils';

export const useHasAnyRole = (roles) => {
  const currentRole = useRole();
  return hasAnyRole(currentRole, roles);
};
