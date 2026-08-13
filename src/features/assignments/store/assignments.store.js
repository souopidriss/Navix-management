/**
 * Navix Assignments — Store du module Affectations (Zustand)
 * --------------------------------------------------------------------------
 * État : assignments (liste brute), selectedAssignment, history (affectations
 *        passées), search, filters (companyId, agencyId, status,
 *        assignmentType, period), sort, pagination (page, pageSize),
 *        isLoading, isSaving, error.
 *
 * Actions : fetchAssignments, fetchAssignment, fetchHistory,
 *           createAssignment, updateAssignment, finishAssignment,
 *           deleteAssignment, setSearch, setFilter, resetFilters, setSort,
 *           setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useAssignmentListData` — le store ne stocke que l'état source et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { getTenantScopeCompanyId } from '@/utils/tenantScope';
import { assignmentService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  assignments: [],
  selectedAssignment: null,
  history: [],
  search: '',
  filters: {
    companyId: '',
    agencyId: '',
    status: '',
    assignmentType: '',
    period: '',
  },
  sort: {
    by: 'startDate',
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

const useAssignmentsStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des affectations.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchAssignments: async () => {
    set({ isLoading: true, error: null });

    try {
      const assignments = await assignmentService.getAll({ companyScopeId: getTenantScopeCompanyId() });
      set({ assignments, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les affectations.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'une affectation.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchAssignment: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const assignment = await assignmentService.getById(id);
      set({ selectedAssignment: assignment, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’affectation.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge l'historique des affectations passées.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchHistory: async () => {
    set({ isLoading: true, error: null });

    try {
      const history = await assignmentService.history({ companyScopeId: getTenantScopeCompanyId() });
      set({ history, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’historique des affectations.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée une affectation (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createAssignment: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const assignment = await assignmentService.create(payload);
      set((state) => ({ assignments: [assignment, ...state.assignments], isSaving: false }));
      return { success: true, data: assignment };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer l’affectation.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour une affectation (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateAssignment: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const assignment = await assignmentService.update(id, payload);
      set((state) => ({
        assignments: state.assignments.map((item) => (item.id === id ? assignment : item)),
        history: state.history.map((item) => (item.id === id ? assignment : item)),
        selectedAssignment: state.selectedAssignment?.id === id ? assignment : state.selectedAssignment,
        isSaving: false,
      }));
      return { success: true, data: assignment };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour l’affectation.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Clôture une affectation (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  finishAssignment: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const assignment = await assignmentService.finish(id, payload);
      set((state) => ({
        assignments: state.assignments.map((item) => (item.id === id ? assignment : item)),
        history: state.history.some((item) => item.id === id)
          ? state.history.map((item) => (item.id === id ? assignment : item))
          : [assignment, ...state.history],
        selectedAssignment: state.selectedAssignment?.id === id ? assignment : state.selectedAssignment,
        isSaving: false,
      }));
      return { success: true, data: assignment };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de clôturer l’affectation.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime une affectation (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteAssignment: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await assignmentService.remove(id);
      set((state) => ({
        assignments: state.assignments.filter((item) => item.id !== id),
        history: state.history.filter((item) => item.id !== id),
        selectedAssignment: state.selectedAssignment?.id === id ? null : state.selectedAssignment,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer l’affectation.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

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

export default useAssignmentsStore;
