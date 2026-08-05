/**
 * Navix Subscriptions — Gating des fonctionnalités (simulé) + lignes d'usage
 * --------------------------------------------------------------------------
 * `useFeatureGating` lie les vérifications du service au contexte courant de
 * l'abonnement (plan + utilisation) : hasFeature, canUse, isLimitReached et
 * hasPlan. La fonction pure `buildUsageRows` produit les lignes de
 * consommation affichées par SubscriptionUsage / SubscriptionUsagePage
 * (usage utilisé, limite, ratio et niveau normal / attention / critique).
 */
import { useMemo } from 'react';
import { MOCK_PLANS_BY_ID } from '../mocks';
import {
  USAGE_LIMIT_MAP,
  LIMIT_VALUES,
  getLimit,
  getUsageLevel,
} from '../constants';
import { subscriptionService } from '../services';

const planCodeOf = (plan) => {
  if (!plan) return null;
  if (typeof plan === 'string') return plan;
  if (typeof plan.code === 'string') return plan.code;
  return MOCK_PLANS_BY_ID[plan.id]?.code ?? null;
};

/**
 * Construit les lignes d'utilisation à partir de l'usage et des limites.
 * @param {object} options — { plan, usage, limits }
 * @returns {Array<object>}
 *   [{ usageKey, limitKey, label, unit, icon, used, limit, ratio, level }]
 */
export const buildUsageRows = ({ plan, usage = {}, limits = {} } = {}) => {
  const planCode = planCodeOf(plan);
  const rows = LIMIT_VALUES.map((limitKey) => {
    const usageKey = Object.keys(USAGE_LIMIT_MAP).find(
      (key) => USAGE_LIMIT_MAP[key] === limitKey,
    );
    const meta = getLimit(limitKey);
    const limit = limits[limitKey];
    const used = usageKey ? Number(usage[usageKey] || 0) : 0;
    const ratio =
      Number.isFinite(Number(limit)) && Number(limit) > 0 ? used / Number(limit) : null;
    const level = ratio === null ? getUsageLevel(0) : getUsageLevel(ratio);

    return {
      usageKey,
      limitKey,
      label: meta.label,
      unit: meta.unit,
      icon: meta.icon,
      used,
      limit,
      ratio,
      level,
      planCode,
    };
  });

  return rows;
};

/**
 * Hook de gating lié à l'abonnement courant (simulation uniquement).
 * @param {object|string|null} plan — plan (objet, code ou id) de l'abonnement
 * @param {object|null} usage — utilisation de l'entreprise
 * @returns {{ hasFeature, canUse, isLimitReached, hasPlan }}
 */
export const useFeatureGating = (plan, usage = {}) =>
  useMemo(() => {
    const planCode = planCodeOf(plan);

    return {
      hasFeature: (featureCode) => subscriptionService.hasFeature(featureCode, planCode),
      canUse: (resource) => subscriptionService.canUse(resource, { plan: planCode, usage }),
      isLimitReached: (resource) =>
        subscriptionService.isLimitReached(resource, { plan: planCode, usage }),
      hasPlan: (targetCode) => subscriptionService.hasPlan(targetCode, planCode),
    };
  }, [plan, usage]);
