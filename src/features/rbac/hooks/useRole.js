/**
 * Navix RBAC — Hook du rôle courant.
 * Retourne la clé du rôle de session courant (ex. 'super_admin').
 * Pour le descripteur complet (label, permissions), utiliser `getRole(role)`.
 */
import { useRbacStore } from '../store';

export const useRole = () => useRbacStore((state) => state.currentRole);
