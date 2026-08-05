/**
 * Navix Billing — Store du module Facturation (Zustand)
 * --------------------------------------------------------------------------
 * État : invoices, invoiceItems, selectedInvoice, payments, selectedPayment,
 * credits, discounts, history, settings, statistics, search, filters
 * (status, companyId, currency, method), sort, pagination (page, pageSize),
 * isLoading, isSaving, error.
 *
 * Actions : fetchInvoices, fetchInvoice, createInvoice, issueInvoice,
 * cancelInvoice, fetchPayments, fetchPayment, simulatePayment,
 * refundPayment, fetchHistory, fetchStatistics, fetchSettings,
 * updateSettings, fetchCredits, fetchDiscounts, setSearch, setFilter,
 * resetFilters, setSort, setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useBillingListData` — le store ne stocke que l'état source et les critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { billingService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  invoices: [],
  invoiceItems: [],
  selectedInvoice: null,
  payments: [],
  selectedPayment: null,
  credits: [],
  discounts: [],
  history: [],
  settings: null,
  statistics: null,
  search: '',
  filters: {
    status: '',
    companyId: '',
    currency: '',
    method: '',
  },
  sort: {
    by: 'issuedDate',
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

const useBillingStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des factures.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchInvoices: async () => {
    set({ isLoading: true, error: null });

    try {
      const invoices = await billingService.getInvoices();
      set({ invoices, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les factures.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'une facture et ses lignes.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchInvoice: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const invoice = await billingService.getInvoiceById(id);
      if (!invoice) {
        const message = 'Facture introuvable.';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }

      const items = await billingService.getInvoiceItems(id);
      set({
        selectedInvoice: invoice,
        invoiceItems: items,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger la facture.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée une facture (simulée).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createInvoice: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const invoice = await billingService.createInvoice(payload);
      set((state) => ({
        invoices: [invoice, ...state.invoices],
        isSaving: false,
      }));
      return { success: true, data: invoice };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer la facture.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Émet une facture brouillon (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  issueInvoice: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const invoice = await billingService.issueInvoice(id);
      set((state) => ({
        invoices: state.invoices.map((item) => (item.id === id ? invoice : item)),
        selectedInvoice: state.selectedInvoice?.id === id ? invoice : state.selectedInvoice,
        isSaving: false,
      }));
      return { success: true, data: invoice };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’émettre la facture.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Annule une facture (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  cancelInvoice: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const invoice = await billingService.cancelInvoice(id);
      set((state) => ({
        invoices: state.invoices.map((item) => (item.id === id ? invoice : item)),
        selectedInvoice: state.selectedInvoice?.id === id ? invoice : state.selectedInvoice,
        isSaving: false,
      }));
      return { success: true, data: invoice };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’annuler la facture.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge la liste des paiements.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchPayments: async () => {
    set({ isLoading: true, error: null });

    try {
      const payments = await billingService.getPayments();
      set({ payments, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les paiements.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un paiement.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchPayment: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const payment = await billingService.getPaymentById(id);
      if (!payment) {
        const message = 'Paiement introuvable.';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }

      set({ selectedPayment: payment, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le paiement.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Simule un paiement (jamais réel).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  simulatePayment: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const payment = await billingService.simulatePayment(payload);
      const invoice = await billingService.getInvoiceById(payment.invoiceId);
      set((state) => ({
        payments: [payment, ...state.payments],
        invoices: invoice
          ? state.invoices.map((item) => (item.id === invoice.id ? invoice : item))
          : state.invoices,
        selectedInvoice:
          state.selectedInvoice?.id === payment.invoiceId ? invoice : state.selectedInvoice,
        isSaving: false,
      }));
      return { success: true, data: payment };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’enregistrer le paiement.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Rembourse un paiement (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  refundPayment: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const payment = await billingService.refundPayment(id);
      const invoice = payment.invoiceId
        ? await billingService.getInvoiceById(payment.invoiceId)
        : null;
      set((state) => ({
        payments: state.payments.map((item) => (item.id === id ? payment : item)),
        selectedPayment: state.selectedPayment?.id === id ? payment : state.selectedPayment,
        invoices: invoice
          ? state.invoices.map((item) => (item.id === invoice.id ? invoice : item))
          : state.invoices,
        selectedInvoice:
          invoice && state.selectedInvoice?.id === invoice.id
            ? invoice
            : state.selectedInvoice,
        isSaving: false,
      }));
      return { success: true, data: payment };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de rembourser le paiement.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le journal de facturation.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchHistory: async () => {
    set({ isLoading: true, error: null });

    try {
      const history = await billingService.getBillingHistory();
      set({ history, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’historique.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge les indicateurs financiers.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchStatistics: async () => {
    set({ isLoading: true, error: null });

    try {
      const statistics = await billingService.getStatistics();
      set({ statistics, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les statistiques.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge les paramètres de facturation.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      const settings = await billingService.getBillingSettings();
      set({ settings, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les paramètres.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour les paramètres de facturation (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateSettings: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const settings = await billingService.updateBillingSettings(payload);
      set({ settings, isSaving: false });
      return { success: true, data: settings };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’enregistrer les paramètres.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge les avoirs de facturation.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchCredits: async () => {
    set({ isLoading: true, error: null });

    try {
      const credits = await billingService.getCredits();
      set({ credits, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les avoirs.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge les remises.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchDiscounts: async () => {
    set({ isLoading: true, error: null });

    try {
      const discounts = await billingService.getDiscounts();
      set({ discounts, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les remises.');
      set({ isLoading: false, error: message });
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

export default useBillingStore;
