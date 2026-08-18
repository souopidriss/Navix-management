/**
 * Navix Partner Portal — Contrat Schema (PROMPT 073)
 * ─────────────────────────────────────────────────────
 * Schémas Zod pour la validation des opérations sur les contrats.
 */

import { z } from 'zod';
import {
  PARTNER_CONTRACT_TYPE_KEYS,
  PARTNER_CONTRACT_CATEGORIES,
  PARTNER_BILLING_FREQUENCY_KEYS,
} from '../constants/partner.constants';

/** Schéma de création/édition d'un contrat. */
export const partnerContractSchema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  type: z.enum(PARTNER_CONTRACT_TYPE_KEYS, {
    errorMap: () => ({ message: 'Type de contrat invalide' }),
  }),
  category: z.enum(Object.keys(PARTNER_CONTRACT_CATEGORIES), {
    errorMap: () => ({ message: 'Catégorie invalide' }),
  }),
  title: z.string().min(3, 'Titre trop court (min. 3 caractères)').max(200, 'Titre trop long'),
  description: z.string().max(500, 'Description trop longue').optional(),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  signedDate: z.string().nullable().optional(),
  value: z.number().min(0, 'Montant invalide'),
  billingFrequency: z.enum(PARTNER_BILLING_FREQUENCY_KEYS, {
    errorMap: () => ({ message: 'Fréquence de facturation invalide' }),
  }),
  monthlyAmount: z.number().nullable().optional(),
  renewalType: z.enum(['automatic', 'manual'], {
    errorMap: () => ({ message: 'Type de renouvellement invalide' }),
  }),
  autoRenew: z.boolean(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  { message: 'La date de fin doit être postérieure à la date de début', path: ['endDate'] }
);

/** Schéma de résiliation d'un contrat. */
export const partnerContractTerminateSchema = z.object({
  reason: z.string().min(1, 'Raison de résiliation requise'),
  comment: z.string().max(500, 'Commentaire trop long').optional(),
});

/** Schéma de renouvellement d'un contrat. */
export const partnerContractRenewSchema = z.object({
  endDate: z.string().min(1, 'Nouvelle date de fin requise'),
  autoRenew: z.boolean().optional(),
  comment: z.string().max(500, 'Commentaire trop long').optional(),
});

/** Schéma de suspension d'un contrat. */
export const partnerContractSuspendSchema = z.object({
  reason: z.string().min(1, 'Raison de suspension requise'),
  comment: z.string().max(500, 'Commentaire trop long').optional(),
});
