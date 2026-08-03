/**
 * Navix Companies — Store du module Entreprises (Zustand)
 * --------------------------------------------------------------------------
 * État : companies (liste brute), selectedCompany, search, filters,
 *        sort, pagination (page, pageSize), isLoading, isSaving, error.
 *
 * Actions : fetchCompanies, fetchCompany, createCompany, updateCompany,
 *           deleteCompany, setSearch, setFilter, resetFilters, setSort,
 *           setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useCompanyListData` — le store ne stocke que l'état source et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { companyService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  companies: [],
  selectedCompany: null,
  search: '',
  filters: {
    country: '',
    status: '',
    plan: '',
    city: '',
  },
  sort: {
    by: 'name',
    direction: 'asc',
  },
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  isLoading: false,
  isSaving: false,
  error: null,
};

const useCompaniesStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des entreprises.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchCompanies: async () => {
    set({ isLoading: true, error: null });

    try {
      const companies = await companyService.getAll();
      set({ companies, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les entreprises.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'une entreprise.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchCompany: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const company = await companyService.getById(id);
      set({ selectedCompany: company, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’entreprise.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée une entreprise (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createCompany: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const company = await companyService.create(payload);
      set((state) => ({ companies: [company, ...state.companies], isSaving: false }));
      return { success: true, data: company };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer l’entreprise.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour une entreprise (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateCompany: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const company = await companyService.update(id, payload);
      set((state) => ({
        companies: state.companies.map((item) => (item.id === id ? company : item)),
        selectedCompany: state.selectedCompany?.id === id ? company : state.selectedCompany,
        isSaving: false,
      }));
      return { success: true, data: company };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour l’entreprise.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime une entreprise (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteCompany: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await companyService.remove(id);
      set((state) => ({
        companies: state.companies.filter((item) => item.id !== id),
        selectedCompany: state.selectedCompany?.id === id ? null : state.selectedCompany,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer l’entreprise.');
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

export default useCompaniesStore;
