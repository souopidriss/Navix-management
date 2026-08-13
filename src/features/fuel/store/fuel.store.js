/**
 * Navix Fuel — Store du module Carburant (Zustand)
 * --------------------------------------------------------------------------
 * État : fuelRecords (liste brute), selectedFuel, statistics (synthèse),
 *        search, filters (companyId, vehicleId, driverId, fuelType,
 *        stationName, period, status), sort, pagination (page, pageSize),
 *        isLoading, isSaving, error.
 *
 * Actions : fetchFuelRecords, fetchFuel, fetchStatistics, createFuel,
 *           updateFuel, deleteFuel, setSearch, setFilter, resetFilters,
 *           setSort, setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useFuelListData` — le store ne stocke que l'état source et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { getTenantScopeCompanyId } from '@/utils/tenantScope';
import { fuelService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  fuelRecords: [],
  selectedFuel: null,
  statistics: null,
  search: '',
  filters: {
    companyId: '',
    vehicleId: '',
    driverId: '',
    fuelType: '',
    stationName: '',
    period: '',
    status: '',
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

const useFuelStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des pleins.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchFuelRecords: async () => {
    set({ isLoading: true, error: null });

    try {
      const fuelRecords = await fuelService.getAll({ companyScopeId: getTenantScopeCompanyId() });
      set({ fuelRecords, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les pleins de carburant.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un plein.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchFuel: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const selectedFuel = await fuelService.getById(id);
      set({ selectedFuel, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le plein de carburant.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge la synthèse statistique de consommation.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchStatistics: async () => {
    set({ isLoading: true, error: null });

    try {
      const statistics = await fuelService.statistics(getTenantScopeCompanyId());
      set({ statistics, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les statistiques de carburant.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un plein (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createFuel: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const fuel = await fuelService.create(payload);
      set((state) => ({ fuelRecords: [fuel, ...state.fuelRecords], isSaving: false }));
      return { success: true, data: fuel };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer le plein de carburant.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour un plein (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateFuel: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const fuel = await fuelService.update(id, payload);
      set((state) => ({
        fuelRecords: state.fuelRecords.map((item) => (item.id === id ? fuel : item)),
        selectedFuel: state.selectedFuel?.id === id ? fuel : state.selectedFuel,
        isSaving: false,
      }));
      return { success: true, data: fuel };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour le plein de carburant.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un plein (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteFuel: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await fuelService.delete(id);
      set((state) => ({
        fuelRecords: state.fuelRecords.filter((item) => item.id !== id),
        selectedFuel: state.selectedFuel?.id === id ? null : state.selectedFuel,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer le plein de carburant.');
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

export default useFuelStore;
