/**
 * Navix Audit — Store du module Journal des actions (Zustand)
 * --------------------------------------------------------------------------
 * État : logs (liste source de l'entreprise courante), logsLoaded (vrai dès
 * que le journal a été chargé une fois, même vide), selectedLog, stats,
 * search, filters (companyId, agencyId, userId, action, actionType,
 * resourceType, status, severity, period, dateFrom, dateTo), sort
 * (by, direction), pagination (page, pageSize), isLoading, isGenerating,
 * error.
 *
 * Actions : fetchLogs, fetchLog, fetchStatistics, exportLogs, refresh,
 * setSearch, setFilter, resetFilters, setSort, setPage, setPageSize,
 * clearError, reset.
 *
 * Lecture seule : le journal est immuable — aucune action de création,
 * modification ou suppression n'existe.
 *
 * Multi-tenant simulé : à la récupération, la liste est bornée à
 * l'entreprise de l'utilisateur courant, sauf `super_admin` (permission
 * `audit.viewAllCompanies` simulée — la sécurité réelle sera appliquée par
 * Express.js).
 *
 * Non persisté : les données proviennent du service mocké (mémoire de
 * session). La liste affichée (filtre + tri + pagination) est dérivée par le
 * hook `useAuditLogs` — le store ne stocke que l'état source et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { getTenantScopeCompanyId } from '@/utils/tenantScope';
import { auditService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

/** Entreprise du contexte courant (simulation tenant) — source canonique. */
export const getAuditCompanyScopeId = () => getTenantScopeCompanyId();

const initialState = {
  logs: [],
  logsLoaded: false,
  selectedLog: null,
  stats: null,
  search: '',
  filters: {
    companyId: '',
    agencyId: '',
    userId: '',
    action: '',
    actionType: '',
    resourceType: '',
    status: '',
    severity: '',
    period: '',
    dateFrom: '',
    dateTo: '',
  },
  sort: {
    by: 'createdAt',
    direction: 'desc',
  },
  view: 'list',
  groupBy: 'date',
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  isLoading: false,
  isGenerating: false,
  error: null,
};

const useAuditStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste source du journal (bornée à l'entreprise courante) et
   * les indicateurs.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchLogs: async () => {
    set({ isLoading: true, error: null });

    try {
      const companyScopeId = getAuditCompanyScopeId();
      const [result, stats] = await Promise.all([
        auditService.getAll({
          page: 1,
          pageSize: 1000,
          companyScopeId,
        }),
        auditService.getStatistics(companyScopeId),
      ]);
      set({ logs: result?.items ?? [], stats, isLoading: false, logsLoaded: true });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le journal des actions.');
      set({ isLoading: false, error: message, logsLoaded: true });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'une entrée d'audit.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchLog: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const log = await auditService.getById(id);
      if (!log) {
        const message = 'Entrée du journal introuvable.';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }
      set({ selectedLog: log, isLoading: false });
      return { success: true, data: log };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’entrée du journal.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Recharge les indicateurs uniquement.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchStatistics: async () => {
    try {
      const stats = await auditService.getStatistics(getAuditCompanyScopeId());
      set({ stats });
      return { success: true };
    } catch (error) {
      return { success: false, error: toErrorMessage(error, 'Statistiques indisponibles.') };
    }
  },

  /**
   * Export simulé (CSV/Excel/PDF) du journal selon les critères courants.
   * Aucune bibliothèque d'export : architecture uniquement (Express.js le
   * génèrera réellement côté serveur).
   * @param {string} format — 'csv' | 'excel' | 'pdf'
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  exportLogs: async (format = 'csv') => {
    set({ isGenerating: true, error: null });

    try {
      const state = useAuditStore.getState();
      const result = await auditService.exportLogs(
        {
          ...state.filters,
          search: state.search,
        },
        format,
      );
      set({ isGenerating: false });
      return { success: true, data: result };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de générer l’export.');
      set({ isGenerating: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Recharge liste et indicateurs (bouton « Rafraîchir »). */
  refresh: async () => useAuditStore.getState().fetchLogs(),

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

  /** Change la vue courante (liste, regroupée, chronologie). */
  setView: (view) => set({ view }),

  /** Change le critère de regroupement de la vue regroupée. */
  setGroupBy: (groupBy) => set({ groupBy }),

  /** Change de page. */
  setPage: (page) => set((state) => ({ pagination: { ...state.pagination, page } })),

  /** Change la taille de page. */
  setPageSize: (pageSize) => set({ pagination: { page: 1, pageSize } }),

  /** Efface l'erreur courante. */
  clearError: () => set({ error: null }),

  /** Réinitialise entièrement le store. */
  reset: () => set({ ...initialState }),
}));

export default useAuditStore;
