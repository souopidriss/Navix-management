/**
 * Navix Agencies — Store du module Agences / Sites (Zustand)
 * --------------------------------------------------------------------------
 * État : agencies (liste brute), selectedAgency, statistics, agencyVehicles,
 *        agencyDrivers, agencyActivity, search, filters (companyId, type,
 *        status, country, city, region), sort, pagination (page, pageSize),
 *        isLoading, isSaving, error.
 *
 * Actions : fetchAgencies, fetchAgency, fetchStatistics,
 *           fetchAgencyVehicles, fetchAgencyDrivers, fetchAgencyActivity,
 *           createAgency, updateAgency, deleteAgency, activateAgency,
 *           deactivateAgency, setSearch, setFilter, resetFilters, setSort,
 *           setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useAgencyListData` — le store ne stocke que l'état source et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { agencyService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  agencies: [],
  selectedAgency: null,
  statistics: null,
  agencyVehicles: [],
  agencyDrivers: [],
  agencyActivity: [],
  search: '',
  filters: {
    companyId: '',
    type: '',
    status: '',
    country: '',
    city: '',
    region: '',
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

const useAgenciesStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des agences.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchAgencies: async () => {
    set({ isLoading: true, error: null });

    try {
      const agencies = await agencyService.getAll();
      set({ agencies, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les agences.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'une agence.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchAgency: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const agency = await agencyService.getById(id);
      set({ selectedAgency: agency, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’agence.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge la synthèse statistique d'une agence.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchStatistics: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const statistics = await agencyService.statistics(id);
      set({ statistics, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les statistiques de l’agence.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge les véhicules rattachés à l'agence.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchAgencyVehicles: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const agencyVehicles = await agencyService.getVehicles(id);
      set({ agencyVehicles, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les véhicules de l’agence.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge les chauffeurs rattachés à l'agence.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchAgencyDrivers: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const agencyDrivers = await agencyService.getDrivers(id);
      set({ agencyDrivers, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les chauffeurs de l’agence.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le flux d'activité de l'agence.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchAgencyActivity: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const agencyActivity = await agencyService.getActivity(id);
      set({ agencyActivity, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’activité de l’agence.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée une agence (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createAgency: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const agency = await agencyService.create(payload);
      set((state) => ({ agencies: [agency, ...state.agencies], isSaving: false }));
      return { success: true, data: agency };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer l’agence.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour une agence (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateAgency: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const agency = await agencyService.update(id, payload);
      set((state) => ({
        agencies: state.agencies.map((item) => (item.id === id ? agency : item)),
        selectedAgency: state.selectedAgency?.id === id ? agency : state.selectedAgency,
        isSaving: false,
      }));
      return { success: true, data: agency };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour l’agence.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime une agence (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteAgency: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await agencyService.remove(id);
      set((state) => ({
        agencies: state.agencies.filter((item) => item.id !== id),
        selectedAgency: state.selectedAgency?.id === id ? null : state.selectedAgency,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer l’agence.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Active une agence (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  activateAgency: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const agency = await agencyService.activate(id);
      set((state) => ({
        agencies: state.agencies.map((item) => (item.id === id ? agency : item)),
        selectedAgency: state.selectedAgency?.id === id ? agency : state.selectedAgency,
        isSaving: false,
      }));
      return { success: true, data: agency };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’activer l’agence.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Désactive une agence (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  deactivateAgency: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const agency = await agencyService.deactivate(id);
      set((state) => ({
        agencies: state.agencies.map((item) => (item.id === id ? agency : item)),
        selectedAgency: state.selectedAgency?.id === id ? agency : state.selectedAgency,
        isSaving: false,
      }));
      return { success: true, data: agency };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de désactiver l’agence.');
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

export default useAgenciesStore;
