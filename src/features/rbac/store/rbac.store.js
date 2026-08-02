/**
 * Navix RBAC — Store (Zustand + persistance)
 * --------------------------------------------------------------------------
 * État : currentRole, companyRole, tenantRole, permissions, isLoading, error.
 *
 * - `permissions` est dérivé de `currentRole` via getPermissionsForRole, sauf
 *   s'il est explicitement remplacé via `setPermissions` (permissions
 *   dynamiques servies par une future API).
 * - `companyRole` / `tenantRole` permettent d'exprimer un contexte multi-tenant
 *   (rôle dans l'entreprise vs rôle plateforme) sans affecter la permission
 *   de session courante.
 * - Persistance : seuls les rôles sont stockés dans STORAGE_KEYS.RBAC ;
 *   `permissions` est recalculé à la réhydratation pour ne jamais dériver.
 * - Le remplacement par une API consistera à initialiser ce store depuis la
 *   réponse serveur (aucun changement dans les hooks/guards).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/config';
import { MOCK_RBAC } from '../constants/mock';
import { getPermissionsForRole } from '../utils/access';

const initialRbac = {
  currentRole: MOCK_RBAC.defaultRole,
  companyRole: MOCK_RBAC.defaultRole,
  tenantRole: MOCK_RBAC.defaultRole,
  permissions: getPermissionsForRole(MOCK_RBAC.defaultRole),
  isLoading: false,
  error: null,
};

const useRbacStore = create(
  persist(
    (set) => ({
      ...initialRbac,

      /**
       * Change le rôle de session courant et recalcule les permissions.
       * @param {string} currentRole — clé de rôle (voir constants/roles.js)
       */
      setCurrentRole: (currentRole) =>
        set((state) => ({
          currentRole,
          permissions: getPermissionsForRole(currentRole ?? state.currentRole),
        })),

      /** Rôle de l'utilisateur dans l'entreprise (contexte multi-tenant). */
      setCompanyRole: (companyRole) => set({ companyRole }),

      /** Rôle de l'utilisateur au niveau de la plateforme (multi-tenant). */
      setTenantRole: (tenantRole) => set({ tenantRole }),

      /**
       * Remplace explicitement les permissions effectives (permissions
       * dynamiques servies par le backend, cas ABAC personnalisé).
       * @param {string[]} permissions
       */
      setPermissions: (permissions) => set({ permissions }),

      /** Réinitialise le store à ses valeurs initiales (mock). */
      reset: () => set({ ...initialRbac }),

      /** Efface l'erreur courante. */
      clearError: () => set({ error: null }),
    }),
    {
      name: STORAGE_KEYS.RBAC,
      partialize: (state) => ({
        currentRole: state.currentRole,
        companyRole: state.companyRole,
        tenantRole: state.tenantRole,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        permissions: getPermissionsForRole(persisted?.currentRole ?? current.currentRole),
        isLoading: false,
        error: null,
      }),
    },
  ),
);

export default useRbacStore;
