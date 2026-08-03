/**
 * Navix Trips — Store du module Trajets (Zustand)
 * --------------------------------------------------------------------------
 * État : trips (liste brute), selectedTrip, history (trajets passés),
 *        search, filters (companyId, status, tripType, period, driverId,
 *        vehicleId), sort, pagination (page, pageSize), isLoading, isSaving,
 *        error.
 *
 * Actions : fetchTrips, fetchTrip, fetchHistory, createTrip, updateTrip,
 *           finishTrip, deleteTrip, setSearch, setFilter, resetFilters,
 *           setSort, setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useTripListData` — le store ne stocke que l'état source et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { tripService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  trips: [],
  selectedTrip: null,
  history: [],
  search: '',
  filters: {
    companyId: '',
    status: '',
    tripType: '',
    period: '',
    driverId: '',
    vehicleId: '',
  },
  sort: {
    by: 'departureDate',
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

const useTripsStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des trajets.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchTrips: async () => {
    set({ isLoading: true, error: null });

    try {
      const trips = await tripService.getAll();
      set({ trips, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les trajets.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un trajet.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchTrip: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const trip = await tripService.getById(id);
      set({ selectedTrip: trip, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le trajet.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge l'historique des trajets passés.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchHistory: async () => {
    set({ isLoading: true, error: null });

    try {
      const history = await tripService.history();
      set({ history, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’historique des trajets.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un trajet (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createTrip: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const trip = await tripService.create(payload);
      set((state) => ({ trips: [trip, ...state.trips], isSaving: false }));
      return { success: true, data: trip };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer le trajet.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour un trajet (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateTrip: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const trip = await tripService.update(id, payload);
      set((state) => ({
        trips: state.trips.map((item) => (item.id === id ? trip : item)),
        history: state.history.map((item) => (item.id === id ? trip : item)),
        selectedTrip: state.selectedTrip?.id === id ? trip : state.selectedTrip,
        isSaving: false,
      }));
      return { success: true, data: trip };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour le trajet.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Clôture un trajet (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  finishTrip: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const trip = await tripService.finish(id, payload);
      set((state) => ({
        trips: state.trips.map((item) => (item.id === id ? trip : item)),
        history: state.history.some((item) => item.id === id)
          ? state.history.map((item) => (item.id === id ? trip : item))
          : [trip, ...state.history],
        selectedTrip: state.selectedTrip?.id === id ? trip : state.selectedTrip,
        isSaving: false,
      }));
      return { success: true, data: trip };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de clôturer le trajet.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un trajet (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteTrip: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await tripService.remove(id);
      set((state) => ({
        trips: state.trips.filter((item) => item.id !== id),
        history: state.history.filter((item) => item.id !== id),
        selectedTrip: state.selectedTrip?.id === id ? null : state.selectedTrip,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer le trajet.');
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

export default useTripsStore;
