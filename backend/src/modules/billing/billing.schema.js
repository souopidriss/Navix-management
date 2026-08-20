import { z } from 'zod';
import {
  BILLING_INVOICE_STATUSES, BILLING_PAYMENT_STATUSES,
  BILLING_PAYMENT_METHODS, BILLING_ITEM_KINDS,
} from './index.js';

export const createBillingInvoiceSchema = z.object({
  companyId: z.string().min(1, 'Entreprise requise.').optional(),
  subscriptionId: z.string().optional(),
  currency: z.string().trim().max(10).optional(),
  taxRate: z.coerce.number().min(0).max(1).optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  status: z.enum(BILLING_INVOICE_STATUSES).optional(),
  notes: z.string().trim().max(1000).optional(),
  items: z.array(z.object({
    kind: z.enum(BILLING_ITEM_KINDS).default('usage'),
    label: z.string().trim().min(1).max(255),
    description: z.string().trim().max(500).optional(),
    quantity: z.coerce.number().positive().default(1),
    unitPrice: z.coerce.number().min(0),
    taxRate: z.coerce.number().min(0).max(1).optional(),
  })).min(1, 'Au moins un article requis.').max(50).optional(),
});

export const billingInvoiceIdParamSchema = z.object({
  id: z.string().min(1, 'ID requis.'),
});

export const billingInvoiceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['created_at', 'updated_at', 'issued_date', 'due_date', 'total', 'status', 'number']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  status: z.enum(BILLING_INVOICE_STATUSES).optional(),
});

export const billingPaymentIdParamSchema = z.object({
  id: z.string().min(1, 'ID requis.'),
});

export const simulatePaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Facture requise.'),
  method: z.enum(BILLING_PAYMENT_METHODS, { errorMap: () => ({ message: 'Moyen de paiement invalide.' }) }).default('bank_transfer'),
  amount: z.coerce.number().positive('Le montant doit être supérieur à zéro.').optional(),
  currency: z.string().trim().max(10).optional(),
  transactionReference: z.string().trim().max(100).optional(),
  paymentDate: z.string().optional(),
});

export const billingPaymentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['created_at', 'updated_at', 'amount', 'status', 'payment_date', 'number']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  status: z.enum(BILLING_PAYMENT_STATUSES).optional(),
  method: z.enum(BILLING_PAYMENT_METHODS).optional(),
});

export const updateBillingSettingsSchema = z.object({
  defaultCurrency: z.string().trim().max(10).optional(),
  paymentTermsDays: z.coerce.number().int().min(1).max(365).optional(),
  defaultTaxRate: z.coerce.number().min(0).max(1).optional(),
  allowPartialPayments: z.coerce.boolean().optional(),
  invoicePrefix: z.string().trim().max(20).optional(),
  autoReminders: z.coerce.boolean().optional(),
  defaultPaymentMethods: z.array(z.enum(BILLING_PAYMENT_METHODS)).optional(),
  companyInfo: z.record(z.unknown()).optional(),
});

export const billingHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const statisticsQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
