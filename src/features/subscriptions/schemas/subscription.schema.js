/**
 * Navix Subscriptions — Schéma de validation Zod du formulaire d'abonnement
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Champs obligatoires :
 * entreprise (companyId), plan (planId) et intervalle de facturation
 * (billingInterval). Les autres champs de la période (début, fin,
 * renouvellement, prix, statut) sont calculés par le service à la création.
 */
import { z } from 'zod';
import { BILLING_INTERVAL_VALUES } from '../constants';

export const subscriptionSchema = z.object({
  companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
  planId: z.string().trim().min(1, 'Le plan est requis.'),
  billingInterval: z.enum(BILLING_INTERVAL_VALUES, {
    errorMap: () => ({ message: 'Intervalle de facturation invalide.' }),
  }),
});

export const subscriptionDefaultValues = {
  companyId: '',
  planId: '',
  billingInterval: 'monthly',
};

/**
 * Aplatit le modèle métier en valeurs de formulaire.
 * @param {object} subscription
 * @returns {object}
 */
export const toSubscriptionFormValues = (subscription = {}) => ({
  companyId: subscription.companyId ?? '',
  planId: subscription.planId ?? '',
  billingInterval: subscription.billingInterval ?? 'monthly',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toSubscriptionPayload = (values) => ({
  companyId: values.companyId,
  planId: values.planId,
  billingInterval: values.billingInterval,
});
