/**
 * Navix Drivers — Store du module Chauffeurs (Zustand)
 * --------------------------------------------------------------------------
 * État : drivers (liste brute), selectedDriver, search, filters
 *        (companyId, agencyId, availability, status, licenseCategory),
 *        sort, pagination (page, pageSize), isLoading, isSaving, error.
 *
 * Actions : fetchDrivers, fetchDriver, createDriver, updateDriver,
 *           deleteDriver, setSearch, setFilter, resetFilters, setSort,
 *           setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useDriverListData` — le store ne stocke que l'état source et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { driverService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  drivers: [],
  selectedDriver: null,
  agencies: [],
  search: '',
  filters: {
    companyId: '',
    agencyId: '',
    availability: '',
    status: '',
    licenseCategory: '',
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

const useDriversStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des chauffeurs.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchDrivers: async () => {
    set({ isLoading: true, error: null });

    try {
      const drivers = await driverService.getAll();
      set({ drivers, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les chauffeurs.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge la liste des agences de référence (mock).
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchAgencies: async () => {
    try {
      const agencies = await driverService.getAgencies();
      set({ agencies });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les agences.');
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un chauffeur.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchDriver: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const driver = await driverService.getById(id);
      set({ selectedDriver: driver, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le chauffeur.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un chauffeur (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createDriver: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const driver = await driverService.create(payload);
      set((state) => ({ drivers: [driver, ...state.drivers], isSaving: false }));
      return { success: true, data: driver };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer le chauffeur.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour un chauffeur (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateDriver: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const driver = await driverService.update(id, payload);
      set((state) => ({
        drivers: state.drivers.map((item) => (item.id === id ? driver : item)),
        selectedDriver: state.selectedDriver?.id === id ? driver : state.selectedDriver,
        isSaving: false,
      }));
      return { success: true, data: driver };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour le chauffeur.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un chauffeur (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteDriver: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await driverService.remove(id);
      set((state) => ({
        drivers: state.drivers.filter((item) => item.id !== id),
        selectedDriver: state.selectedDriver?.id === id ? null : state.selectedDriver,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer le chauffeur.');
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

export default useDriversStore;
