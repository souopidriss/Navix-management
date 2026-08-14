/**
 * Navix Billing — Schémas de validation Zod
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate).
 *   - paymentSimulationSchema : simulation de paiement (aucun traitement réel)
 *   - billingSettingsSchema   : paramètres de facturation de la plateforme
 */
import { z } from 'zod';
import { PAYMENT_METHOD_VALUES, CURRENCY_VALUES } from '../constants';

/* --------------------------------------------------------------------------
   Simulation de paiement
   -------------------------------------------------------------------------- */

export const paymentSimulationSchema = z.object({
  invoiceId: z.string().trim().min(1, 'La facture est requise.'),
  method: z.enum(PAYMENT_METHOD_VALUES, {
    errorMap: () => ({ message: 'Moyen de paiement invalide.' }),
  }),
  amount: z.coerce.number().positive('Le montant doit être positif.'),
  currency: z.enum(CURRENCY_VALUES, {
    errorMap: () => ({ message: 'Devise invalide.' }),
  }),
  transactionReference: z.string().trim().min(1, 'La référence de transaction est requise.'),
  paymentDate: z.string().min(1, 'La date de paiement est requise.'),
});

export const paymentDefaultValues = {
  invoiceId: '',
  method: 'bank_transfer',
  amount: 0,
  currency: 'XAF',
  transactionReference: '',
  paymentDate: new Date().toISOString().slice(0, 10),
};

/**
 * Construit les valeurs de formulaire à partir du modèle métier.
 * @param {object} payment
 * @returns {object}
 */
export const toPaymentFormValues = (payment = {}) => ({
  invoiceId: payment.invoiceId ?? '',
  method: payment.method ?? 'bank_transfer',
  amount: Number(payment.amount || 0),
  currency: payment.currency ?? 'XAF',
  transactionReference: payment.transactionReference ?? '',
  paymentDate: (payment.paymentDate || new Date().toISOString()).slice(0, 10),
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toPaymentPayload = (values) => ({
  invoiceId: values.invoiceId,
  method: values.method,
  amount: Number(values.amount),
  currency: values.currency,
  transactionReference: values.transactionReference,
  paymentDate: values.paymentDate,
});

/* --------------------------------------------------------------------------
   Paramètres de facturation
   -------------------------------------------------------------------------- */

export const billingSettingsSchema = z.object({
  defaultCurrency: z.enum(CURRENCY_VALUES, {
    errorMap: () => ({ message: 'Devise invalide.' }),
  }),
  paymentTermsDays: z.coerce.number().int().min(1, 'Le délai doit être d’au moins 1 jour.'),
  defaultTaxRate: z.coerce.number().min(0).max(1, 'Le taux doit être compris entre 0 et 1.'),
  allowPartialPayments: z.boolean(),
  invoicePrefix: z.string().trim().min(2, 'Le préfixe de facture est requis.'),
  autoRemindersEnabled: z.boolean(),
  autoRemindersDaysBeforeDue: z.coerce.number().int().min(0, 'Délai invalide.'),
});

export const billingSettingsDefaultValues = {
  defaultCurrency: 'XAF',
  paymentTermsDays: 15,
  defaultTaxRate: 0.18,
  allowPartialPayments: true,
  invoicePrefix: 'NAVIX',
  autoRemindersEnabled: true,
  autoRemindersDaysBeforeDue: 3,
};

/**
 * Aplatit les paramètres métier en valeurs de formulaire.
 * @param {object} settings
 * @returns {object}
 */
export const toBillingSettingsFormValues = (settings = {}) => ({
  defaultCurrency: settings.defaultCurrency ?? 'XAF',
  paymentTermsDays: settings.paymentTermsDays ?? 15,
  defaultTaxRate: Number(settings.defaultTaxRate ?? 0.18),
  allowPartialPayments: Boolean(settings.allowPartialPayments),
  invoicePrefix: settings.invoicePrefix ?? 'NAVIX',
  autoRemindersEnabled: Boolean(settings.autoReminders?.enabled),
  autoRemindersDaysBeforeDue: Number(settings.autoReminders?.daysBeforeDue ?? 3),
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toBillingSettingsPayload = (values) => ({
  defaultCurrency: values.defaultCurrency,
  paymentTermsDays: Number(values.paymentTermsDays),
  defaultTaxRate: Number(values.defaultTaxRate),
  allowPartialPayments: Boolean(values.allowPartialPayments),
  invoicePrefix: values.invoicePrefix,
  autoReminders: {
    enabled: Boolean(values.autoRemindersEnabled),
    daysBeforeDue: Number(values.autoRemindersDaysBeforeDue),
  },
});
