/**
 * Navix Subscriptions — Store du module SaaS Abonnements (Zustand)
 * --------------------------------------------------------------------------
 * État : plans, features, subscriptions, selectedSubscription (avec plan,
 *        fonctionnalités, limites et usage rattachés), search, filters
 *        (companyId, status, planId, billingInterval), sort, pagination
 *        (page, pageSize), isLoading, isSaving, error.
 *
 * Actions : fetchPlans, fetchFeatures, fetchSubscriptions, fetchSubscription,
 *           createSubscription, changePlan, cancelSubscription,
 *           deleteSubscription, resumeSubscription, renewSubscription,
 *           setSearch, setFilter, resetFilters, setSort, setPage, setPageSize,
 *           clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useSubscriptionListData` — le store ne stocke que l'état source et les
 * critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { subscriptionService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  plans: [],
  features: [],
  subscriptions: [],
  selectedSubscription: null,
  selectedPlan: null,
  selectedPlanFeatures: [],
  selectedPlanLimits: {},
  selectedUsage: null,
  search: '',
  filters: {
    companyId: '',
    status: '',
    planId: '',
    billingInterval: '',
  },
  sort: {
    by: 'companyName',
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

const useSubscriptionsStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des plans.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchPlans: async () => {
    set({ isLoading: true, error: null });

    try {
      const plans = await subscriptionService.getPlans();
      set({ plans, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les plans.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge la liste des fonctionnalités SaaS.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchFeatures: async () => {
    set({ isLoading: true, error: null });

    try {
      const features = await subscriptionService.getFeatures();
      set({ features, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les fonctionnalités.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge la liste des abonnements.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchSubscriptions: async () => {
    set({ isLoading: true, error: null });

    try {
      const subscriptions = await subscriptionService.getSubscriptions();
      set({ subscriptions, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les abonnements.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un abonnement et ses données rattachées (plan,
   * fonctionnalités incluses, limites et utilisation de l'entreprise).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchSubscription: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const subscription = await subscriptionService.getSubscriptionById(id);
      if (!subscription) {
        const message = 'Abonnement introuvable.';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }

      const [plan, planFeatures, planLimits, usage] = await Promise.all([
        subscriptionService.getPlanById(subscription.planId),
        subscriptionService.getFeaturesByPlan(subscription.planId),
        subscriptionService.getPlanLimits(subscription.planId),
        subscriptionService.getUsage(subscription.companyId),
      ]);

      set({
        selectedSubscription: subscription,
        selectedPlan: plan,
        selectedPlanFeatures: planFeatures,
        selectedPlanLimits: planLimits,
        selectedUsage: usage,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger l’abonnement.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un abonnement (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createSubscription: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const subscription = await subscriptionService.createSubscription(payload);
      set((state) => ({
        subscriptions: [subscription, ...state.subscriptions],
        isSaving: false,
      }));
      return { success: true, data: subscription };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer l’abonnement.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Change le plan d'un abonnement (upgrade / downgrade simulé).
   * @param {string} id
   * @param {string} planId
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  changePlan: async (id, planId) => {
    set({ isSaving: true, error: null });

    try {
      const subscription = await subscriptionService.changePlan(id, planId);
      set((state) => ({
        subscriptions: state.subscriptions.map((item) => (item.id === id ? subscription : item)),
        selectedSubscription: state.selectedSubscription?.id === id ? subscription : state.selectedSubscription,
        isSaving: false,
      }));
      return { success: true, data: subscription };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de changer de plan.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Annule un abonnement (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  cancelSubscription: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const subscription = await subscriptionService.cancelSubscription(id);
      set((state) => ({
        subscriptions: state.subscriptions.map((item) => (item.id === id ? subscription : item)),
        selectedSubscription: state.selectedSubscription?.id === id ? subscription : state.selectedSubscription,
        isSaving: false,
      }));
      return { success: true, data: subscription };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’annuler l’abonnement.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime définitivement un abonnement (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteSubscription: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await subscriptionService.deleteSubscription(id);
      set((state) => ({
        subscriptions: state.subscriptions.filter((item) => item.id !== id),
        selectedSubscription:
          state.selectedSubscription?.id === id ? null : state.selectedSubscription,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer l’abonnement.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Reprend un abonnement suspendu (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  resumeSubscription: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const subscription = await subscriptionService.resumeSubscription(id);
      set((state) => ({
        subscriptions: state.subscriptions.map((item) => (item.id === id ? subscription : item)),
        selectedSubscription: state.selectedSubscription?.id === id ? subscription : state.selectedSubscription,
        isSaving: false,
      }));
      return { success: true, data: subscription };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de reprendre l’abonnement.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Renouvelle un abonnement annulé ou expiré (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  renewSubscription: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const subscription = await subscriptionService.renewSubscription(id);
      set((state) => ({
        subscriptions: state.subscriptions.map((item) => (item.id === id ? subscription : item)),
        selectedSubscription: state.selectedSubscription?.id === id ? subscription : state.selectedSubscription,
        isSaving: false,
      }));
      return { success: true, data: subscription };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de renouveler l’abonnement.');
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

export default useSubscriptionsStore;
