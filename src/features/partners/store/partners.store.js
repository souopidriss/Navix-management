/**
 * Navix Partners — Store du module Partenaires (Zustand)
 * --------------------------------------------------------------------------
 * État : partnerRecords (liste brute), selectedPartner, search, filters
 *        (companyId, type, status, country), sort, pagination (page,
 *        pageSize), isLoading, isSaving, error.
 *
 * Actions : fetchPartnerRecords, fetchPartner, createPartner,
 *           updatePartner, deletePartner, setSearch, setFilter,
 *           resetFilters, setSort, setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `usePartnerListData` — le store ne stocke que l'état source et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { getTenantScopeCompanyId } from '@/utils/tenantScope';
import { partnerService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  partnerRecords: [],
  selectedPartner: null,
  search: '',
  filters: {
    companyId: '',
    type: '',
    status: '',
    country: '',
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

const usePartnersStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des partenaires.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchPartnerRecords: async () => {
    set({ isLoading: true, error: null });

    try {
      const partnerRecords = await partnerService.getAll({ companyScopeId: getTenantScopeCompanyId() });
      set({ partnerRecords, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les partenaires.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un partenaire.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchPartner: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const selectedPartner = await partnerService.getById(id);
      set({ selectedPartner, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le partenaire.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un partenaire (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createPartner: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const partner = await partnerService.create(payload);
      set((state) => ({
        partnerRecords: [partner, ...state.partnerRecords],
        isSaving: false,
      }));
      return { success: true, data: partner };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer le partenaire.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour un partenaire (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updatePartner: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const partner = await partnerService.update(id, payload);
      set((state) => ({
        partnerRecords: state.partnerRecords.map((item) => (item.id === id ? partner : item)),
        selectedPartner: state.selectedPartner?.id === id ? partner : state.selectedPartner,
        isSaving: false,
      }));
      return { success: true, data: partner };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour le partenaire.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un partenaire (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deletePartner: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await partnerService.delete(id);
      set((state) => ({
        partnerRecords: state.partnerRecords.filter((item) => item.id !== id),
        selectedPartner: state.selectedPartner?.id === id ? null : state.selectedPartner,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer le partenaire.');
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

export default usePartnersStore;
