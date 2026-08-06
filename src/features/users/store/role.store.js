/**
 * Navix Users — Store du module Rôles (Zustand)
 * --------------------------------------------------------------------------
 * État : roles (système globaux + personnalisés de l'entreprise courante),
 * selectedRole, search, filters (companyId, type, status), sort (by,
 * direction), isLoading, isSaving, error.
 *
 * Actions : fetchRoles, fetchRole, createRole, updateRole, activateRole,
 * deactivateRole, assignPermissions, removeRole, refresh, setSearch,
 * setFilter, resetFilters, setSort, clearError, reset.
 *
 * Multi-tenant simulé : portée bornée à l'entreprise de l'utilisateur courant
 * (rôles personnalisés), sauf `super_admin` — les rôles système (globaux)
 * restent visibles pour tous (la sécurité réelle sera appliquée par Express.js).
 *
 * Non persisté : les données proviennent du service mocké (mémoire de
 * session). La liste affichée (enrichie + filtrée + triée) est dérivée par le
 * hook `useRoleListData`.
 */
import { create } from 'zustand';
import { roleService } from '../services';
import { getUsersCompanyScopeId } from './user.store';

const toErrorMessage = (error, fallback) => error?.message || fallback;

/** Remplace un rôle dans la liste source (par id). */
const replaceRole = (roles, role) =>
  roles.map((item) => (item.id === role.id ? role : item));

const initialState = {
  roles: [],
  selectedRole: null,
  search: '',
  filters: {
    companyId: '',
    type: '',
    status: '',
  },
  sort: {
    by: 'name',
    direction: 'asc',
  },
  isLoading: false,
  isSaving: false,
  error: null,
};

const useRoleStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste source des rôles (système globaux + personnalisés de
   * l'entreprise courante).
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchRoles: async () => {
    set({ isLoading: true, error: null });

    try {
      const companyScopeId = getUsersCompanyScopeId();
      const result = await roleService.getAll({ companyScopeId });
      set({ roles: result?.items ?? [], isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les rôles.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un rôle.
   * @param {string} id
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  fetchRole: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const role = await roleService.getById(id);
      if (!role) {
        const message = 'Rôle introuvable.';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }
      set({ selectedRole: role, isLoading: false });
      return { success: true, data: role };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le rôle.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un rôle personnalisé.
   * @param {object} payload — données normalisées (toRolePayload)
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  createRole: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const role = await roleService.create(payload);
      if (!role) {
        const message = 'Impossible de créer le rôle.';
        set({ isSaving: false, error: message });
        return { success: false, error: message };
      }
      set((state) => ({ roles: [...state.roles, role], isSaving: false }));
      return { success: true, data: role };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer le rôle.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour un rôle.
   * @param {string} id
   * @param {object} payload — données normalisées (toRolePayload)
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  updateRole: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const role = await roleService.update(id, payload);
      if (!role) {
        const message = 'Rôle introuvable.';
        set({ isSaving: false, error: message });
        return { success: false, error: message };
      }
      set((state) => ({
        roles: replaceRole(state.roles, role),
        selectedRole: state.selectedRole?.id === role.id ? role : state.selectedRole,
        isSaving: false,
      }));
      return { success: true, data: role };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour le rôle.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Active un rôle. */
  activateRole: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const role = await roleService.activate(id);
      if (!role) {
        const message = 'Rôle introuvable.';
        set({ isSaving: false, error: message });
        return { success: false, error: message };
      }
      set((state) => ({
        roles: replaceRole(state.roles, role),
        selectedRole: state.selectedRole?.id === role.id ? role : state.selectedRole,
        isSaving: false,
      }));
      return { success: true, data: role };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’activer le rôle.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Désactive un rôle (rôles système protégés côté service). */
  deactivateRole: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const role = await roleService.deactivate(id);
      if (!role) {
        const message = 'Rôle introuvable.';
        set({ isSaving: false, error: message });
        return { success: false, error: message };
      }
      set((state) => ({
        roles: replaceRole(state.roles, role),
        selectedRole: state.selectedRole?.id === role.id ? role : state.selectedRole,
        isSaving: false,
      }));
      return { success: true, data: role };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de désactiver le rôle.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Attribue les permissions d'un rôle.
   * @param {string} id
   * @param {string[]} permissionCodes
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  assignPermissions: async (id, permissionCodes) => {
    set({ isSaving: true, error: null });

    try {
      const role = await roleService.assignPermissions(id, permissionCodes);
      if (!role) {
        const message = 'Rôle introuvable.';
        set({ isSaving: false, error: message });
        return { success: false, error: message };
      }
      set((state) => ({
        roles: replaceRole(state.roles, role),
        selectedRole: state.selectedRole?.id === role.id ? role : state.selectedRole,
        isSaving: false,
      }));
      return { success: true, data: role };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’attribuer les permissions.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un rôle (rôles système protégés côté service).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  removeRole: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await roleService.remove(id);
      set((state) => ({
        roles: state.roles.filter((role) => role.id !== id),
        selectedRole: state.selectedRole?.id === id ? null : state.selectedRole,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer le rôle.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Recharge la liste des rôles. */
  refresh: async () => useRoleStore.getState().fetchRoles(),

  /** Recherche instantanée. */
  setSearch: (search) => set({ search }),

  /** Applique un filtre. */
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),

  /** Réinitialise la recherche et les filtres. */
  resetFilters: () => set({ search: '', filters: initialState.filters }),

  /** Applique le tri. */
  setSort: (by, direction) => set({ sort: { by, direction } }),

  /** Efface l'erreur courante. */
  clearError: () => set({ error: null }),

  /** Réinitialise entièrement le store. */
  reset: () => set({ ...initialState }),
}));

export default useRoleStore;
