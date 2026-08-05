/**
 * Navix Dashboard — Store du module Tableau de bord (Zustand)
 * --------------------------------------------------------------------------
 * État : filters (companyId, period, dateFrom, dateTo), overview, fleet,
 *        fuelStatistics, maintenanceStatistics, financialStatistics, alerts,
 *        recentActivities, topVehicles, topDrivers, isLoading, error.
 *
 * Actions : fetchAll, setFilter, resetFilters, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de
 * session). Les sections du tableau de bord sont toutes rechargées lorsque
 * les filtres globaux (période / entreprise) changent — voir le hook
 * `useDashboardData` qui orchestre le chargement.
 */
import { create } from 'zustand';
import { DEFAULT_PERIOD } from '../constants';
import { dashboardService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  filters: {
    companyId: '',
    period: DEFAULT_PERIOD,
    dateFrom: '',
    dateTo: '',
  },
  overview: null,
  fleetStatistics: null,
  fuelStatistics: null,
  maintenanceStatistics: null,
  financialStatistics: null,
  alerts: null,
  recentActivities: [],
  topVehicles: [],
  topDrivers: [],
  isLoading: false,
  error: null,
};

const useDashboardStore = create((set, get) => ({
  ...initialState,

  /**
   * Charge toutes les sections du tableau de bord en parallèle, avec les
   * filtres courants (entreprise + période).
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchAll: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });

    try {
      const params = { ...filters };

      const [
        overview,
        fleetStatistics,
        fuelStatistics,
        maintenanceStatistics,
        financialStatistics,
        alerts,
        recentActivities,
        topVehicles,
        topDrivers,
      ] = await Promise.all([
        dashboardService.getOverview(params),
        dashboardService.getFleetStatistics(params),
        dashboardService.getFuelStatistics(params),
        dashboardService.getMaintenanceStatistics(params),
        dashboardService.getFinancialStatistics(params),
        dashboardService.getAlerts(params),
        dashboardService.getRecentActivities(params),
        dashboardService.getTopVehicles(params),
        dashboardService.getTopDrivers(params),
      ]);

      set({
        overview,
        fleetStatistics,
        fuelStatistics,
        maintenanceStatistics,
        financialStatistics,
        alerts,
        recentActivities,
        topVehicles,
        topDrivers,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le tableau de bord.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Applique un filtre global (période, entreprise, dates). */
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  /** Réinitialise les filtres globaux. */
  resetFilters: () =>
    set({
      filters: { ...initialState.filters },
    }),

  /** Efface l'erreur courante. */
  clearError: () => set({ error: null }),

  /** Réinitialise entièrement le store. */
  reset: () => set({ ...initialState }),
}));

export default useDashboardStore;
