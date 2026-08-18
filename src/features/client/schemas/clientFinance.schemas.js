/**
 * Navix Client — Schémas de validation Zod des opérations financières
 * --------------------------------------------------------------------------
 * PROMPT 059 — Validation exclusive Zod (formulaires en noValidate).
 * Toutes les opérations portent un montant en FCFA strictement positif et
 * une description. Le moyen de paiement réutilise le catalogue existant
 * (PAYMENT_METHODS du module Billing). Le sens (entrée / sortie) est piloté
 * par le type d'opération (dépôt = entrée ; retrait / transfert / paiement =
 * sortie). La référence est générée côté service et affichée en lecture seule.
 */
import { z } from 'zod';
import { PAYMENT_METHOD_VALUES } from '@/features/billing/constants';

const amountSchema = z.coerce
  .number({ invalid_type_error: 'Le montant est requis.' })
  .positive('Le montant doit être supérieur à zéro.')
  .max(99999999999, 'Montant trop élevé.');

const descriptionSchema = z.string().trim().min(1, 'La description est requise.').max(300, 'Description trop longue.');

/** Dépôt (entrée de fonds) — source = provenance des fonds. */
export const depositSchema = z.object({
  amount: amountSchema,
  method: z.enum(PAYMENT_METHOD_VALUES, { errorMap: () => ({ message: 'Moyen de paiement invalide.' }) }),
  source: z.string().trim().max(120, 'Source trop longue.').optional(),
  description: descriptionSchema,
});

/** Transaction sortante — destinataire = caisse / agence / tiers. */
export const outgoingSchema = z.object({
  type: z.enum(['withdrawal', 'transfer', 'payment'], { errorMap: () => ({ message: 'Type d’opération invalide.' }) }),
  amount: amountSchema,
  method: z.enum(PAYMENT_METHOD_VALUES, { errorMap: () => ({ message: 'Moyen de paiement invalide.' }) }),
  recipient: z.string().trim().min(1, 'Le destinataire est requis.').max(120, 'Destinataire trop long.'),
  description: descriptionSchema,
});

export const depositDefaultValues = {
  amount: '',
  method: 'bank_transfer',
  source: '',
  description: '',
};

export const outgoingDefaultValues = {
  type: 'transfer',
  amount: '',
  method: 'bank_transfer',
  recipient: '',
  description: '',
};
