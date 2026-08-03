/**
 * Navix Vehicles — Store du module Véhicules (Zustand)
 * --------------------------------------------------------------------------
 * État : vehicles (liste brute), selectedVehicle, search, filters
 *        (companyId, group, brand, status, fuelType, transmission, year),
 *        sort, pagination (page, pageSize), isLoading, isSaving, error.
 *
 * Actions : fetchVehicles, fetchVehicle, createVehicle, updateVehicle,
 *           deleteVehicle, setSearch, setFilter, resetFilters, setSort,
 *           setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useVehicleListData` — le store ne stocke que l'état source et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { vehicleService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  vehicles: [],
  selectedVehicle: null,
  search: '',
  filters: {
    companyId: '',
    group: '',
    brand: '',
    status: '',
    fuelType: '',
    transmission: '',
    year: '',
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

const useVehiclesStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des véhicules.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchVehicles: async () => {
    set({ isLoading: true, error: null });

    try {
      const vehicles = await vehicleService.getAll();
      set({ vehicles, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les véhicules.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un véhicule.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchVehicle: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const vehicle = await vehicleService.getById(id);
      set({ selectedVehicle: vehicle, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le véhicule.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un véhicule (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createVehicle: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const vehicle = await vehicleService.create(payload);
      set((state) => ({ vehicles: [vehicle, ...state.vehicles], isSaving: false }));
      return { success: true, data: vehicle };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer le véhicule.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour un véhicule (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateVehicle: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const vehicle = await vehicleService.update(id, payload);
      set((state) => ({
        vehicles: state.vehicles.map((item) => (item.id === id ? vehicle : item)),
        selectedVehicle: state.selectedVehicle?.id === id ? vehicle : state.selectedVehicle,
        isSaving: false,
      }));
      return { success: true, data: vehicle };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour le véhicule.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un véhicule (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteVehicle: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await vehicleService.remove(id);
      set((state) => ({
        vehicles: state.vehicles.filter((item) => item.id !== id),
        selectedVehicle: state.selectedVehicle?.id === id ? null : state.selectedVehicle,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer le véhicule.');
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

export default useVehiclesStore;
