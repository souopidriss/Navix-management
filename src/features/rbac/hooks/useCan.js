/**
 * Navix RBAC — Hook `can`.
 * Retourne une fonction de contrôle d'accès liée au contexte courant.
 *
 * @returns {(required: string|string[]|undefined, options?: { mode?: 'all'|'any' }) => boolean}
 *   required : permission(s) requise(s) — undefined autorise tout.
 *   options.mode : 'all' (défaut) | 'any' — combinaison des permissions.
 *
 * Exemples :
 *   const can = useCan();
 *   can('vehicles.update');
 *   can(['vehicles.read', 'drivers.read'], { mode: 'any' });
 */
import { useCallback } from 'react';
import { useRbacStore } from '../store';
import { can as canAccess } from '../utils';

export const useCan = () => {
  const permissions = useRbacStore((state) => state.permissions);

  return useCallback((required, options) => canAccess(permissions, required, options), [permissions]);
};
