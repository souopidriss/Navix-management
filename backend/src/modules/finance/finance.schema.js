import { z } from 'zod';
import {
  TRANSACTION_TYPES, TRANSACTION_STATUSES, TRANSACTION_DIRECTIONS,
  PAYMENT_METHODS, INVOICE_STATUSES, PAYMENT_STATUSES,
} from './index.js';

const amountSchema = z.coerce
  .number({ invalid_type_error: 'Le montant est requis.' })
  .positive('Le montant doit être supérieur à zéro.')
  .max(99999999999, 'Montant trop élevé.');

const descriptionSchema = z.string().trim().min(1, 'La description est requise.').max(500, 'Description trop longue.');

export const createTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES, { errorMap: () => ({ message: 'Type de transaction invalide.' }) }),
  amount: amountSchema,
  direction: z.enum(TRANSACTION_DIRECTIONS).optional(),
  method: z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: 'Moyen de paiement invalide.' }) }).optional(),
  description: descriptionSchema,
  label: z.string().trim().max(255).optional(),
  source: z.string().trim().max(255).optional(),
  destination: z.string().trim().max(255).optional(),
  counterparty: z.string().trim().max(255).optional(),
  category: z.string().trim().max(100).optional(),
  entityType: z.string().trim().max(100).optional(),
  entityId: z.string().trim().max(26).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const transactionIdParamSchema = z.object({
  id: z.string().min(1, 'ID requis.'),
});

export const financeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['id', 'amount', 'created_at', 'updated_at', 'transaction_date', 'status', 'transaction_type', 'direction']).default('transaction_date'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  search: z.string().trim().max(200).optional(),
  transaction_type: z.enum(TRANSACTION_TYPES).optional(),
  status: z.enum(TRANSACTION_STATUSES).optional(),
  direction: z.enum(TRANSACTION_DIRECTIONS).optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  category: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().optional(),
  partnerId: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(1).optional(),
  dueAt: z.string().optional(),
  notes: z.string().trim().max(1000).optional(),
  items: z.array(z.object({
    description: z.string().trim().min(1, 'Description requise.').max(500),
    quantity: z.coerce.number().positive().default(1),
    unit_price: z.coerce.number().min(0),
    amount: z.coerce.number().min(0).optional(),
    item_kind: z.enum(['subscription_renewal', 'setup', 'usage', 'addon', 'credit_note']).default('usage'),
  })).min(1, 'Au moins un article requis.').max(50),
});

export const updateInvoiceSchema = z.object({
  clientId: z.string().optional(),
  partnerId: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(1).optional(),
  dueAt: z.string().optional(),
  notes: z.string().trim().max(1000).optional(),
  items: z.array(z.object({
    description: z.string().trim().min(1).max(500),
    quantity: z.coerce.number().positive().default(1),
    unit_price: z.coerce.number().min(0),
    amount: z.coerce.number().min(0).optional(),
    item_kind: z.enum(['subscription_renewal', 'setup', 'usage', 'addon', 'credit_note']).default('usage'),
  })).min(1).max(50).optional(),
});

export const invoiceStatusSchema = z.object({
  status: z.enum(INVOICE_STATUSES, { errorMap: () => ({ message: 'Statut invalide.' }) }),
});

export const invoiceIdParamSchema = z.object({
  id: z.string().min(1, 'ID requis.'),
});

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['id', 'total', 'amount_paid', 'created_at', 'updated_at', 'issued_at', 'due_at', 'status', 'reference']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  search: z.string().trim().max(200).optional(),
  status: z.enum(INVOICE_STATUSES).optional(),
  clientId: z.string().optional(),
  partnerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Facture requise.'),
  amount: amountSchema,
  method: z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: 'Moyen de paiement invalide.' }) }),
  reference: z.string().trim().max(100).optional(),
  transactionReference: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const paymentIdParamSchema = z.object({
  id: z.string().min(1, 'ID requis.'),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['id', 'amount', 'created_at', 'updated_at', 'paid_at', 'status']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  search: z.string().trim().max(200).optional(),
  status: z.enum(PAYMENT_STATUSES).optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  invoiceId: z.string().optional(),
});

export const statsQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  period: z.enum(['today', 'week', 'month', 'quarter', 'year']).optional(),
});
