/**
 * Navix Maintenance — Store du module Entretiens (Zustand)
 * --------------------------------------------------------------------------
 * État : maintenanceRecords (liste brute), selectedMaintenance, statistics
 *        (synthèse), calendarEvents (calendrier), search, filters (companyId,
 *        vehicleId, maintenanceType, priority, status, period), sort,
 *        pagination (page, pageSize), isLoading, isSaving, error.
 *
 * Actions : fetchMaintenanceRecords, fetchMaintenance, fetchStatistics,
 *           fetchCalendar, createMaintenance, updateMaintenance,
 *           deleteMaintenance, setSearch, setFilter, resetFilters, setSort,
 *           setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useMaintenanceListData` — le store ne stocke que l'état source et les
 * critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { getTenantScopeCompanyId } from '@/utils/tenantScope';
import { maintenanceService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  maintenanceRecords: [],
  selectedMaintenance: null,
  statistics: null,
  calendarEvents: [],
  search: '',
  filters: {
    companyId: '',
    vehicleId: '',
    maintenanceType: '',
    priority: '',
    status: '',
    period: '',
  },
  sort: {
    by: 'scheduledDate',
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

const useMaintenanceStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des entretiens.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchMaintenanceRecords: async () => {
    set({ isLoading: true, error: null });

    try {
      const maintenanceRecords = await maintenanceService.getAll({
        companyScopeId: getTenantScopeCompanyId(),
      });
      set({ maintenanceRecords, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les entretiens.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un entretien.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchMaintenance: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const selectedMaintenance = await maintenanceService.getById(id);
      set({ selectedMaintenance, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’entretien.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge la synthèse statistique des entretiens.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchStatistics: async () => {
    set({ isLoading: true, error: null });

    try {
      const statistics = await maintenanceService.statistics(getTenantScopeCompanyId());
      set({ statistics, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les statistiques des entretiens.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge les événements calendrier sur la fenêtre [from, to].
   * @param {string} from
   * @param {string} to
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchCalendar: async (from, to) => {
    set({ isLoading: true, error: null });

    try {
      const calendarEvents = await maintenanceService.calendar(from, to);
      set({ calendarEvents, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le calendrier des entretiens.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un entretien (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createMaintenance: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const maintenance = await maintenanceService.create(payload);
      set((state) => ({
        maintenanceRecords: [maintenance, ...state.maintenanceRecords],
        isSaving: false,
      }));
      return { success: true, data: maintenance };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer l’entretien.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour un entretien (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateMaintenance: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const maintenance = await maintenanceService.update(id, payload);
      set((state) => ({
        maintenanceRecords: state.maintenanceRecords.map((item) => (item.id === id ? maintenance : item)),
        selectedMaintenance: state.selectedMaintenance?.id === id ? maintenance : state.selectedMaintenance,
        isSaving: false,
      }));
      return { success: true, data: maintenance };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour l’entretien.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un entretien (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteMaintenance: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await maintenanceService.delete(id);
      set((state) => ({
        maintenanceRecords: state.maintenanceRecords.filter((item) => item.id !== id),
        selectedMaintenance: state.selectedMaintenance?.id === id ? null : state.selectedMaintenance,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer l’entretien.');
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

export default useMaintenanceStore;
