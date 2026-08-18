/**
 * Navix Super Admin — Schémas Zod Finance Plateforme
 * --------------------------------------------------------------------------
 * Validation Zod des opérations financières Super Admin :
 * dépôt, retrait, transfert, paiement, commission, frais, ajustement.
 *
 * Montants strictement positifs, devise XAF, dates valides.
 */
import { z } from 'zod';
import { SA_TRANSACTION_TYPE_VALUES, TRANSACTION_SOURCE_VALUES } from '../constants/superAdminFinance.constants';

/* ─── Schéma commun — montant & devise ───────────────────────────────────── */

const amountField = z.coerce
  .number()
  .positive('Le montant doit être supérieur à zéro.')
  .max(99_999_999_999, 'Montant trop élevé.');

const descriptionField = z
  .string()
  .trim()
  .min(1, 'La description est requise.')
  .max(300, 'Description trop longue.');

const optionalTrimmed = (max = 120) =>
  z.string().trim().max(max, `Texte trop long (max ${max} caractères).`).optional();

/* ─── Dépôt entrant ──────────────────────────────────────────────────────── */

export const saDepositSchema = z.object({
  amount: amountField,
  source: optionalTrimmed(),
  sourceType: z.enum(TRANSACTION_SOURCE_VALUES).optional(),
  description: descriptionField,
});

export const saDepositDefaultValues = {
  amount: '',
  source: '',
  sourceType: '',
  description: '',
};

/* ─── Transaction sortante (retrait / transfert / paiement / frais) ──────── */

export const saOutgoingSchema = z.object({
  type: z.enum(['withdrawal', 'transfer_out', 'payment', 'fee']),
  amount: amountField,
  destination: z.string().trim().min(1, 'Le destinataire est requis.').max(120, 'Destinataire trop long.'),
  sourceType: z.enum(TRANSACTION_SOURCE_VALUES).optional(),
  description: descriptionField,
});

export const saOutgoingDefaultValues = {
  type: 'transfer_out',
  amount: '',
  destination: '',
  sourceType: '',
  description: '',
};

/* ─── Ajustement ─────────────────────────────────────────────────────────── */

export const saAdjustmentSchema = z.object({
  amount: amountField,
  direction: z.enum(['in', 'out']),
  destination: optionalTrimmed(),
  sourceType: z.enum(TRANSACTION_SOURCE_VALUES).optional(),
  description: descriptionField,
});

export const saAdjustmentDefaultValues = {
  amount: '',
  direction: 'in',
  destination: '',
  sourceType: '',
  description: '',
};

/* ─── Filtres de recherche ───────────────────────────────────────────────── */

export const saTransactionFilterSchema = z.object({
  search: z.string().trim().optional().default(''),
  type: z.string().optional().default(''),
  direction: z.string().optional().default(''),
  status: z.string().optional().default(''),
  source: z.string().optional().default(''),
  period: z.string().optional().default(''),
  dateFrom: z.string().optional().default(''),
  dateTo: z.string().optional().default(''),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(10),
  sort: z.string().optional().default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const saTransactionFilterDefaults = {
  search: '',
  type: '',
  direction: '',
  status: '',
  source: '',
  period: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 10,
  sort: 'createdAt',
  sortDirection: 'desc',
};
