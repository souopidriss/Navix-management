/**
 * Navix Reports — Store du module Rapports & analytics (Zustand)
 * --------------------------------------------------------------------------
 * État : reportType (catégorie active), filters (filtres globaux + période),
 * report (résultat du rapport courant), savedReports, isLoading, isSaving,
 * isExporting, error.
 *
 * Actions : fetchReport, fetchSavedReports, saveReport, deleteReport,
 * exportReport, refresh, setReportType, setFilter, resetFilters, clearError,
 * reset.
 *
 * Le calcul des statistiques est délégué au service (report.aggregate) — le
 * store ne contient ni logique métier, ni duplication. Le multi-tenant est
 * simulé via `getReportsCompanyScopeId` (borné à l'entreprise courante, sauf
 * super_admin).
 */
import { create } from 'zustand';
import { DEFAULT_REPORT_PERIOD } from '../constants';
import { reportFilterDefaultValues } from '../schemas';
import { useAuthStore } from '@/features/auth';
import { reportService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

/** Entreprise du contexte courant (simulation tenant). */
export const getReportsCompanyScopeId = () => {
  const { user, company } = useAuthStore.getState();
  if (!user) return '';
  if (user.role === 'super_admin') return '';
  return company?.id ?? '';
};

const initialState = {
  reportType: 'fleet',
  filters: {
    ...reportFilterDefaultValues,
    period: DEFAULT_REPORT_PERIOD,
  },
  report: null,
  savedReports: [],
  isLoading: false,
  isSaving: false,
  isExporting: false,
  error: null,
};

const useReportStore = create((set) => ({
  ...initialState,

  /**
   * Charge le rapport de la catégorie active selon les filtres courants.
   * @param {string} [reportType] — catégorie (défaut : catégorie active)
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchReport: async (reportType) => {
    const type = reportType ?? useReportStore.getState().reportType;
    set({ isLoading: true, error: null });

    try {
      const state = useReportStore.getState();
      const companyScopeId = getReportsCompanyScopeId();
      const report = await reportService.getReport(type, {
        companyScopeId,
        filters: state.filters,
      });
      if (!report) {
        const message = 'Rapport indisponible pour cette catégorie.';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }
      set({ report, reportType: type, isLoading: false });
      return { success: true, data: report };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de générer le rapport.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge la liste des rapports enregistrés (bornée à l'entreprise courante).
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchSavedReports: async () => {
    try {
      const companyScopeId = getReportsCompanyScopeId();
      const result = await reportService.getReports({ companyScopeId });
      set({ savedReports: result?.items ?? [] });
      return { success: true };
    } catch (error) {
      return { success: false, error: toErrorMessage(error, 'Rapports enregistrés indisponibles.') };
    }
  },

  /**
   * Enregistre (crée ou met à jour) un rapport.
   * @param {object} payload — { id?, name, description, reportType, status, configuration }
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  saveReport: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const result = await reportService.saveReport(payload, {
        companyScopeId: getReportsCompanyScopeId(),
        userId: useAuthStore.getState().user?.id ?? 'usr_001',
      });
      if (!result) {
        const message = 'Impossible d’enregistrer le rapport.';
        set({ isSaving: false, error: message });
        return { success: false, error: message };
      }
      await useReportStore.getState().fetchSavedReports();
      set({ isSaving: false });
      return { success: true, data: result };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’enregistrer le rapport.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un rapport enregistré.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteReport: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const result = await reportService.deleteReport(id);
      if (!result) {
        const message = 'Impossible de supprimer le rapport.';
        set({ isSaving: false, error: message });
        return { success: false, error: message };
      }
      await useReportStore.getState().fetchSavedReports();
      set({ isSaving: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer le rapport.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Export simulé du rapport courant (CSV/Excel/PDF — architecture uniquement).
   * @param {string} format
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  exportReport: async (format = 'csv') => {
    set({ isExporting: true, error: null });

    try {
      const state = useReportStore.getState();
      const result = await reportService.exportReport({
        reportType: state.reportType,
        companyScopeId: getReportsCompanyScopeId(),
        filters: state.filters,
        format,
      });
      set({ isExporting: false });
      return { success: true, data: result };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de générer l’export.');
      set({ isExporting: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Recharge le rapport courant et les rapports enregistrés. */
  refresh: async () => {
    await useReportStore.getState().fetchReport();
    await useReportStore.getState().fetchSavedReports();
  },

  /** Change la catégorie active et charge le rapport correspondant. */
  setReportType: (reportType) => {
    set({ reportType });
    return useReportStore.getState().fetchReport(reportType);
  },

  /** Applique un filtre global (le rapport est recalculé). */
  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }));
    return useReportStore.getState().fetchReport();
  },

  /** Réinitialise les filtres globaux (période par défaut). */
  resetFilters: () => {
    set((state) => ({
      filters: { ...initialState.filters, period: state.filters.period },
    }));
    return useReportStore.getState().fetchReport();
  },

  /** Efface l'erreur courante. */
  clearError: () => set({ error: null }),

  /** Réinitialise entièrement le store. */
  reset: () => set({ ...initialState }),
}));

export default useReportStore;
