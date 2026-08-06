/**
 * Navix Users — Store du module Utilisateurs (Zustand)
 * --------------------------------------------------------------------------
 * État : users (liste source de l'entreprise courante), selectedUser, stats,
 * search, filters (companyId, agencyId, roleId, status, createdAtFrom/To,
 * lastLoginFrom/To), sort (by, direction), pagination (page, pageSize),
 * isLoading, isSaving, error.
 *
 * Actions : fetchUsers, fetchUser, createUser, updateUser, activateUser,
 * deactivateUser, suspendUser, reactivateUser, inviteUser, resetPassword
 * (placeholder), removeUser, refresh, setSearch, setFilter, resetFilters,
 * setSort, setPage, setPageSize, clearError, reset.
 *
 * Multi-tenant simulé : à la récupération, la liste est bornée à l'entreprise
 * de l'utilisateur courant, sauf `super_admin` (voir tout — la sécurité réelle
 * sera appliquée par Express.js).
 *
 * Non persisté : les données proviennent du service mocké (mémoire de
 * session). La liste affichée (enrichie + filtrée + triée + paginée) est
 * dérivée par le hook `useUserListData` — le store ne stocke que l'état source
 * et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { useAuthStore } from '@/features/auth';
import { userService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

/** Entreprise du contexte courant (simulation tenant). */
export const getUsersCompanyScopeId = () => {
  const { user, company } = useAuthStore.getState();
  if (!user) return '';
  if (user.role === 'super_admin') return '';
  return company?.id ?? '';
};

/** Remplace un utilisateur dans la liste source (par id). */
const replaceUser = (users, user) =>
  users.map((item) => (item.id === user.id ? user : item));

const initialState = {
  users: [],
  selectedUser: null,
  stats: null,
  search: '',
  filters: {
    companyId: '',
    agencyId: '',
    roleId: '',
    status: '',
    createdAtFrom: '',
    createdAtTo: '',
    lastLoginFrom: '',
    lastLoginTo: '',
  },
  sort: {
    by: 'createdAt',
    direction: 'desc',
  },
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  isLoading: false,
  isSaving: false,
  error: null,
};

const useUserStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste source des utilisateurs (bornée à l'entreprise courante)
   * et les indicateurs.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchUsers: async () => {
    set({ isLoading: true, error: null });

    try {
      const companyScopeId = getUsersCompanyScopeId();
      const [result, stats] = await Promise.all([
        userService.getAll({ page: 1, pageSize: 1000, companyScopeId }),
        userService.statistics(companyScopeId),
      ]);
      set({ users: result?.items ?? [], stats, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les utilisateurs.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un utilisateur.
   * @param {string} id
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  fetchUser: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const user = await userService.getById(id);
      if (!user) {
        const message = 'Utilisateur introuvable.';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }
      set({ selectedUser: user, isLoading: false });
      return { success: true, data: user };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’utilisateur.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un utilisateur.
   * @param {object} payload — données normalisées (toUserPayload)
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  createUser: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const user = await userService.create(payload);
      if (!user) {
        const message = 'Impossible de créer l’utilisateur.';
        set({ isSaving: false, error: message });
        return { success: false, error: message };
      }
      set((state) => ({ users: [...state.users, user], isSaving: false }));
      return { success: true, data: user };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer l’utilisateur.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour un utilisateur.
   * @param {string} id
   * @param {object} payload — données normalisées (toUserPayload)
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  updateUser: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const user = await userService.update(id, payload);
      if (!user) {
        const message = 'Utilisateur introuvable.';
        set({ isSaving: false, error: message });
        return { success: false, error: message };
      }
      set((state) => ({
        users: replaceUser(state.users, user),
        selectedUser: state.selectedUser?.id === user.id ? user : state.selectedUser,
        isSaving: false,
      }));
      return { success: true, data: user };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour l’utilisateur.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Applique un changement de statut via le service. */
  applyStatus: async (action, id) => {
    set({ isSaving: true, error: null });

    try {
      const user = await action(id);
      if (!user) {
        const message = 'Utilisateur introuvable.';
        set({ isSaving: false, error: message });
        return { success: false, error: message };
      }
      set((state) => ({
        users: replaceUser(state.users, user),
        selectedUser: state.selectedUser?.id === user.id ? user : state.selectedUser,
        isSaving: false,
      }));
      return { success: true, data: user };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de modifier le statut de l’utilisateur.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Active un utilisateur. */
  activateUser: (id) => useUserStore.getState().applyStatus(userService.activate, id),

  /** Désactive un utilisateur. */
  deactivateUser: (id) => useUserStore.getState().applyStatus(userService.deactivate, id),

  /** Suspend un utilisateur. */
  suspendUser: (id) => useUserStore.getState().applyStatus(userService.suspend, id),

  /** Réactive un utilisateur suspendu ou inactif. */
  reactivateUser: (id) => useUserStore.getState().applyStatus(userService.reactivate, id),

  /** Invite un utilisateur (passe au statut « invité »). */
  inviteUser: (id) => useUserStore.getState().applyStatus(userService.invite, id),

  /**
   * Réinitialisation du mot de passe — PLACEHOLDER d'interface uniquement.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  resetPassword: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await userService.resetPassword(id);
      set({ isSaving: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de réinitialiser le mot de passe.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un utilisateur.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  removeUser: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await userService.remove(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer l’utilisateur.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Recharge liste et indicateurs (bouton « Rafraîchir »). */
  refresh: async () => useUserStore.getState().fetchUsers(),

  /** Recherche instantanée (réinitialise la page courante). */
  setSearch: (search) =>
    set((state) => ({ search, pagination: { ...state.pagination, page: 1 } })),

  /** Applique un filtre (réinitialise la page courante). */
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, page: 1 },
    })),

  /** Réinitialise la recherche et les filtres. */
  resetFilters: () =>
    set((state) => ({
      search: '',
      filters: initialState.filters,
      pagination: { ...state.pagination, page: 1 },
    })),

  /** Applique le tri (réinitialise la page courante). */
  setSort: (by, direction) =>
    set((state) => ({ sort: { by, direction }, pagination: { ...state.pagination, page: 1 } })),

  /** Change de page. */
  setPage: (page) => set((state) => ({ pagination: { ...state.pagination, page } })),

  /** Change la taille de page. */
  setPageSize: (pageSize) => set({ pagination: { page: 1, pageSize } }),

  /** Efface l'erreur courante. */
  clearError: () => set({ error: null }),

  /** Réinitialise entièrement le store. */
  reset: () => set({ ...initialState }),
}));

export default useUserStore;
