/**
 * Navix Subscriptions — SubscriptionService
 * --------------------------------------------------------------------------
 * Description : gestion du SaaS (plans, fonctionnalités, limites, abonnements,
 * essai, changement de plan, annulation / reprise / renouvellement), mock
 * uniquement. Aucune facturation réelle : prix, renouvellement, période et
 * statuts sont simulés.
 * Responsabilité : fournir les données d'abonnement aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getPlans()                     → liste des plans (triés par sortOrder)
 *   getPlanById(id)                → détail d'un plan (404 si absent)
 *   getFeatures()                  → liste des fonctionnalités
 *   getFeaturesByPlan(planId)      → fonctionnalités incluses dans un plan
 *   getPlanLimits(planId)          → limites d'un plan
 *   getSubscriptions()             → liste des abonnements (multi-tenant)
 *   getSubscriptionById(id)        → détail d'un abonnement (404 si absent)
 *   getUsage(companyId)            → utilisation d'une entreprise (404 si absente)
 *   createSubscription(payload)    → création (409 si l'entreprise a déjà un abonnement)
 *   changePlan(id, planId)         → changement de plan (upgrade / downgrade)
 *   cancelSubscription(id)         → annulation (simulée, à l'échéance)
 *   deleteSubscription(id)         → suppression définitive (simulée)
 *   resumeSubscription(id)         → reprise d'un abonnement suspendu
 *   renewSubscription(id)          → renouvellement (simulé)
 *   hasFeature / canUse / isLimitReached / hasPlan → gating simulé
 *
 * Règles métier simulées :
 *   - 1 abonnement par entreprise (multi-tenant, clé companyId)
 *   - identifiant ULID et horodatages automatiques à la création
 *   - prix annuel = 10 × prix mensuel (2 mois offerts)
 *   - essai gratuit simulé via trialDays (14 jours par défaut)
 *   - aucun paiement réel (ni Stripe, ni Mobile Money, etc.)
 *
 * Exemple d'utilisation :
 *   import { subscriptionService } from '../services';
 *   const plans = await subscriptionService.getPlans();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_PLANS, MOCK_PLANS_BY_ID, MOCK_FEATURES, MOCK_PLAN_FEATURES, MOCK_PLAN_LIMITS, MOCK_SUBSCRIPTIONS, MOCK_USAGE } from '../mocks';
import { USAGE_LIMIT_MAP, DEFAULT_TRIAL_DAYS } from '../constants';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Génère un identifiant ULID plausible (horodatage + aléa Crockford). */
const generateUlid = () => {
  const time = Date.now().toString(36).toUpperCase().padStart(10, '0').slice(0, 10);
  let random = '';
  for (let i = 0; i < 16; i += 1) {
    random += CROCKFORD[Math.floor(Math.random() * CROCKFORD.length)];
  }
  return `${time}${random}`;
};

let subscriptionsCache = null;

const getSubscriptionsCache = () => {
  if (!subscriptionsCache) {
    subscriptionsCache = MOCK_SUBSCRIPTIONS.map((subscription) => ({ ...subscription }));
  }
  return subscriptionsCache;
};

/** Ajoute un nombre de mois à une date (ISO ou simple). */
const addMonths = (value, months) => {
  const date = new Date(value);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
};

/** Ajoute un nombre de jours à une date. */
const addDays = (value, days) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

/** Prix de l'abonnement selon le plan et l'intervalle (annuel = 10 × mensuel). */
const computePrice = (plan, billingInterval) =>
  billingInterval === 'yearly' ? Number(plan.price) * 10 : Number(plan.price);

const isPlanCode = (value) => typeof value === 'string' && Object.prototype.hasOwnProperty.call(MOCK_PLAN_LIMITS, value);

const planIdToCode = (planId) => MOCK_PLANS_BY_ID[planId]?.code ?? null;

export const subscriptionService = {
  /**
   * Liste des plans (triés par sortOrder).
   * @returns {Promise<Array<object>>}
   */
  async getPlans() {
    if (apiConfig.mock) {
      const plans = [...MOCK_PLANS].sort((a, b) => a.sortOrder - b.sortOrder);
      return mockResponse(plans.map((plan) => ({ ...plan })));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.LIST);
    return data;
  },

  /**
   * Détail d'un plan.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getPlanById(id) {
    if (apiConfig.mock) {
      const plan = MOCK_PLANS_BY_ID[id];
      if (!plan) {
        return mockResponse(null, { error: ApiError.notFound('Plan introuvable.') });
      }
      return mockResponse({ ...plan });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.DETAIL(id));
    return data;
  },

  /**
   * Liste des fonctionnalités SaaS.
   * @returns {Promise<Array<object>>}
   */
  async getFeatures() {
    if (apiConfig.mock) {
      return mockResponse(MOCK_FEATURES.map((feature) => ({ ...feature })));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.FEATURES);
    return data;
  },

  /**
   * Fonctionnalités incluses dans un plan (résolues).
   * @param {string} planId — id du plan
   * @returns {Promise<Array<object>>}
   */
  async getFeaturesByPlan(planId) {
    if (apiConfig.mock) {
      const plan = MOCK_PLANS_BY_ID[planId];
      if (!plan) {
        return mockResponse([], { error: ApiError.notFound('Plan introuvable.') });
      }
      const codes = MOCK_PLAN_FEATURES[plan.code] || [];
      const features = MOCK_FEATURES.filter((feature) => codes.includes(feature.code));
      return mockResponse(features.map((feature) => ({ ...feature })));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.PLAN_FEATURES(planId));
    return data;
  },

  /**
   * Limites d'usage d'un plan.
   * @param {string} planId — id du plan
   * @returns {Promise<object>}
   */
  async getPlanLimits(planId) {
    if (apiConfig.mock) {
      const plan = MOCK_PLANS_BY_ID[planId];
      if (!plan) {
        return mockResponse(null, { error: ApiError.notFound('Plan introuvable.') });
      }
      return mockResponse({ ...MOCK_PLAN_LIMITS[plan.code] });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.PLAN_LIMITS(planId));
    return data;
  },

  /**
   * Liste de tous les abonnements (copie — les mutations ultérieures du cache
   * n'affectent pas les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getSubscriptions() {
    if (apiConfig.mock) {
      return mockResponse([...getSubscriptionsCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.LIST);
    return data;
  },

  /**
   * Détail d'un abonnement.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getSubscriptionById(id) {
    if (apiConfig.mock) {
      const subscription = getSubscriptionsCache().find((item) => item.id === id);
      if (!subscription) {
        return mockResponse(null, { error: ApiError.notFound('Abonnement introuvable.') });
      }
      return mockResponse({ ...subscription });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.DETAIL(id));
    return data;
  },

  /**
   * Utilisation d'une entreprise (multi-tenant).
   * @param {string} companyId
   * @returns {Promise<object>}
   */
  async getUsage(companyId) {
    if (apiConfig.mock) {
      const usage = MOCK_USAGE[companyId];
      if (!usage) {
        return mockResponse(null, { error: ApiError.notFound('Aucune utilisation trouvée.') });
      }
      return mockResponse({ ...usage });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.USAGE(companyId));
    return data;
  },

  /**
   * Création d'un abonnement (simulé). Une entreprise ne peut avoir qu'un seul
   * abonnement actif ; si le plan comporte un essai, l'abonnement démarre en
   * statut « trialing ».
   * @param {object} payload — { companyId, planId, billingInterval }
   * @returns {Promise<object>}
   */
  async createSubscription(payload) {
    if (apiConfig.mock) {
      const exists = getSubscriptionsCache().some(
        (subscription) => subscription.companyId === payload.companyId,
      );
      if (exists) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'SUBSCRIPTION_EXISTS',
            message: 'Cette entreprise possède déjà un abonnement.',
          }),
        });
      }

      const plan = MOCK_PLANS_BY_ID[payload.planId];
      if (!plan) {
        return mockResponse(null, { error: ApiError.notFound('Plan introuvable.') });
      }

      const now = new Date().toISOString();
      const trialDays = Number(plan.trialDays) || 0;
      const isTrialing = trialDays > 0;

      const subscription = {
        id: generateUlid(),
        companyId: payload.companyId,
        planId: plan.id,
        status: isTrialing ? 'trialing' : 'active',
        startDate: now,
        trialStartDate: isTrialing ? now : null,
        trialEndDate: isTrialing ? addDays(now, trialDays || DEFAULT_TRIAL_DAYS) : null,
        currentPeriodStart: now,
        currentPeriodEnd: isTrialing ? addDays(now, trialDays || DEFAULT_TRIAL_DAYS) : addMonths(now, 1),
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        renewalDate: isTrialing ? addDays(now, trialDays || DEFAULT_TRIAL_DAYS) : addMonths(now, 1),
        price: computePrice(plan, payload.billingInterval),
        currency: plan.currency,
        billingInterval: payload.billingInterval,
        createdAt: now,
        updatedAt: now,
      };

      getSubscriptionsCache().unshift(subscription);
      return mockResponse({ ...subscription });
    }

    const { data } = await apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.LIST, payload);
    return data;
  },

  /**
   * Changement de plan (upgrade / downgrade) simulé. Met à jour le plan, le
   * prix et l'horodatage ; un abonnement en essai conserve son essai.
   * @param {string} id
   * @param {string} planId
   * @returns {Promise<object>}
   */
  async changePlan(id, planId) {
    if (apiConfig.mock) {
      const index = getSubscriptionsCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Abonnement introuvable.') });
      }
      const plan = MOCK_PLANS_BY_ID[planId];
      if (!plan) {
        return mockResponse(null, { error: ApiError.notFound('Plan introuvable.') });
      }

      const current = getSubscriptionsCache()[index];
      if (current.planId === plan.id) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'PLAN_UNCHANGED',
            message: 'L’entreprise est déjà abonnée à ce plan.',
          }),
        });
      }

      const updated = {
        ...current,
        planId: plan.id,
        price: computePrice(plan, current.billingInterval),
        currency: plan.currency,
        status: current.status === 'trialing' ? 'trialing' : 'active',
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        planChangedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      getSubscriptionsCache()[index] = updated;
      return mockResponse({ ...updated });
    }

    const { data } = await apiClient.patch(API_ENDPOINTS.SUBSCRIPTIONS.DETAIL(id), { planId });
    return data;
  },

  /**
   * Annulation d'un abonnement (simulée). L'abonnement passe en « cancelled »
   * avec cancelAtPeriodEnd : le service reste actif jusqu'à l'échéance.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async cancelSubscription(id) {
    if (apiConfig.mock) {
      const index = getSubscriptionsCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Abonnement introuvable.') });
      }
      const current = getSubscriptionsCache()[index];
      if (current.status === 'cancelled') {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'ALREADY_CANCELLED',
            message: 'Cet abonnement est déjà annulé.',
          }),
        });
      }

      const updated = {
        ...current,
        status: 'cancelled',
        cancelAtPeriodEnd: true,
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      getSubscriptionsCache()[index] = updated;
      return mockResponse({ ...updated });
    }

    const { data } = await apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(id));
    return data;
  },

  /**
   * Suppression définitive d'un abonnement (simulée). L'entreprise se retrouve
   * sans abonnement actif.
   * @param {string} id
   * @returns {Promise<{ success: boolean }>}
   */
  async deleteSubscription(id) {
    if (apiConfig.mock) {
      const index = getSubscriptionsCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Abonnement introuvable.') });
      }
      getSubscriptionsCache().splice(index, 1);
      return mockResponse({ success: true });
    }

    await apiClient.delete(API_ENDPOINTS.SUBSCRIPTIONS.DELETE(id));
    return { success: true };
  },

  /**
   * Reprise d'un abonnement suspendu (simulée).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async resumeSubscription(id) {
    if (apiConfig.mock) {
      const index = getSubscriptionsCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Abonnement introuvable.') });
      }
      const current = getSubscriptionsCache()[index];
      if (current.status !== 'paused') {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'NOT_PAUSED',
            message: 'Seul un abonnement suspendu peut être repris.',
          }),
        });
      }

      const updated = {
        ...current,
        status: 'active',
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        pausedAt: undefined,
        updatedAt: new Date().toISOString(),
      };
      getSubscriptionsCache()[index] = updated;
      return mockResponse({ ...updated });
    }

    const { data } = await apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.RESUME(id));
    return data;
  },

  /**
   * Renouvellement (simulé) d'un abonnement annulé ou expiré. Prolonge la
   * période courante d'un intervalle et réactive l'abonnement.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async renewSubscription(id) {
    if (apiConfig.mock) {
      const index = getSubscriptionsCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Abonnement introuvable.') });
      }
      const current = getSubscriptionsCache()[index];
      if (!['cancelled', 'expired'].includes(current.status)) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'NOT_RENEWABLE',
            message: 'Seul un abonnement annulé ou expiré peut être renouvelé.',
          }),
        });
      }

      const now = new Date().toISOString();
      const months = current.billingInterval === 'yearly' ? 12 : 1;
      const periodStart = current.currentPeriodStart || now;
      const periodEnd = addMonths(periodStart, months);

      const updated = {
        ...current,
        status: 'active',
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        renewalDate: periodEnd,
        updatedAt: now,
      };
      getSubscriptionsCache()[index] = updated;
      return mockResponse({ ...updated });
    }

    const { data } = await apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.RENEW(id));
    return data;
  },

  /* ------------------------------------------------------------------------
     Gating simulé (aucune sécurité réelle côté frontend)
     ------------------------------------------------------------------------ */

  /**
   * Vérifie si un plan inclut une fonctionnalité.
   * @param {string} featureCode — code de la fonctionnalité
   * @param {string} plan — code ou id du plan
   * @returns {boolean}
   */
  hasFeature(featureCode, plan) {
    const planCode = isPlanCode(plan) ? plan : planIdToCode(plan);
    return Boolean(planCode && (MOCK_PLAN_FEATURES[planCode] || []).includes(featureCode));
  },

  /** Limite du plan pour un champ d'usage (ex. vehiclesUsed → maxVehicles). */
  getLimitValue(resource, plan) {
    const planCode = isPlanCode(plan) ? plan : planIdToCode(plan);
    const limitKey = USAGE_LIMIT_MAP[resource] || resource;
    return planCode ? MOCK_PLAN_LIMITS[planCode]?.[limitKey] ?? null : null;
  },

  /**
   * Indique si l'entreprise peut encore utiliser une ressource.
   * @param {string} resource — champ d'usage (ex. vehiclesUsed)
   * @param {object} context — { plan, usage }
   * @returns {boolean}
   */
  canUse(resource, { plan, usage } = {}) {
    const limit = this.getLimitValue(resource, plan);
    if (limit === null) return true;
    const used = Number(usage?.[resource] || 0);
    return used < Number(limit);
  },

  /**
   * Indique si une limite est atteinte (ou dépassée).
   * @param {string} resource — champ d'usage (ex. vehiclesUsed)
   * @param {object} context — { plan, usage }
   * @returns {boolean}
   */
  isLimitReached(resource, { plan, usage } = {}) {
    const limit = this.getLimitValue(resource, plan);
    if (limit === null) return false;
    const used = Number(usage?.[resource] || 0);
    return used >= Number(limit);
  },

  /**
   * Vérifie si un abonnement est sur un plan donné.
   * @param {string} planCode
   * @param {string} currentPlan — code ou id du plan actuel
   * @returns {boolean}
   */
  hasPlan(planCode, currentPlan) {
    if (!currentPlan) return false;
    const currentCode = isPlanCode(currentPlan) ? currentPlan : planIdToCode(currentPlan);
    return currentCode === planCode;
  },
};
