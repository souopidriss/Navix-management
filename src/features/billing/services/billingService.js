/**
 * Navix Billing — BillingService
 * --------------------------------------------------------------------------
 * Description : facturation SaaS simulée — factures, lignes, paiements,
 * échéances, crédits, remises, taxes, historique, renouvellements.
 * Aucun paiement réel : aucun traitement Stripe / PayPal / Mobile Money /
 * MTN MoMo / Orange Money. Les montants, devises (XAF / EUR / USD), taxes
 * et transactions sont fictifs ; la validation financière réelle sera faite
 * plus tard par le backend Express.js / MySQL.
 * Responsabilité : fournir les données de facturation aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getInvoices()                 → liste des factures
 *   getInvoiceById(id)            → détail d'une facture (404 si absente)
 *   getInvoiceItems(invoiceId)    → lignes d'une facture
 *   createInvoice(payload)        → création (numérotation automatique)
 *   issueInvoice(id)              → passage brouillon → émise
 *   cancelInvoice(id)             → annulation (simulée)
 *   downloadInvoice(id)           → placeholder PDF (aucune librairie PDF)
 *   getPayments()                 → liste des paiements
 *   getPaymentById(id)            → détail d'un paiement
 *   simulatePayment(payload)      → paiement simulé (jamais réel)
 *   refundPayment(id)             → remboursement (simulé)
 *   getBillingHistory()           → journal de facturation
 *   getStatistics()               → indicateurs financiers simulés
 *   getBillingSettings()          → paramètres de facturation
 *   updateBillingSettings(payload)→ mise à jour des paramètres
 *   getCredits() / getDiscounts() → avoirs et remises
 *
 * Règles métier simulées :
 *   - numérotation NAVIX-AAAA-NNNNNN (factures) et PAY-AAAA-NNNNNN (paiements)
 *   - 1 paiement par transaction, montants cohérents avec le solde dû
 *   - statuts de facture : draft, issued, paid, partially_paid, overdue,
 *     cancelled, refunded
 *
 * Exemple d'utilisation :
 *   import { billingService } from '../services';
 *   const invoices = await billingService.getInvoices();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import {
  MOCK_INVOICES,
  MOCK_INVOICE_ITEMS,
  MOCK_PAYMENTS,
  MOCK_BILLING_CREDITS,
  MOCK_BILLING_DISCOUNTS,
  MOCK_BILLING_HISTORY,
  MOCK_BILLING_SETTINGS,
} from '../mocks';
import { getInvoiceAmountDue } from '../constants';

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

/** Ajoute un nombre de jours à une date (ISO). */
const addDays = (value, days) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const now = () => new Date().toISOString();

let invoicesCache = null;
let paymentsCache = null;
let settingsCache = null;

const getInvoicesCache = () => {
  if (!invoicesCache) {
    invoicesCache = MOCK_INVOICES.map((invoice) => ({ ...invoice }));
  }
  return invoicesCache;
};

const getPaymentsCache = () => {
  if (!paymentsCache) {
    paymentsCache = MOCK_PAYMENTS.map((payment) => ({ ...payment }));
  }
  return paymentsCache;
};

const getSettingsCache = () => {
  if (!settingsCache) {
    settingsCache = { ...MOCK_BILLING_SETTINGS };
  }
  return settingsCache;
};

const findInvoice = (id) => getInvoicesCache().find((invoice) => invoice.id === id);

export const billingService = {
  /**
   * Liste de toutes les factures (copie — les mutations ultérieures du cache
   * n'affectent pas les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getInvoices() {
    if (apiConfig.mock) {
      return mockResponse([...getInvoicesCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.INVOICES);
    return data;
  },

  /**
   * Détail d'une facture.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getInvoiceById(id) {
    if (apiConfig.mock) {
      const invoice = findInvoice(id);
      if (!invoice) {
        return mockResponse(null, { error: ApiError.notFound('Facture introuvable.') });
      }
      return mockResponse({ ...invoice });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.INVOICE_DETAIL(id));
    return data;
  },

  /**
   * Lignes d'une facture (résolues).
   * @param {string} invoiceId
   * @returns {Promise<Array<object>>}
   */
  async getInvoiceItems(invoiceId) {
    if (apiConfig.mock) {
      const items = MOCK_INVOICE_ITEMS.filter((item) => item.invoiceId === invoiceId);
      return mockResponse(items.map((item) => ({ ...item })));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.INVOICE_ITEMS(invoiceId));
    return data;
  },

  /**
   * Création d'une facture (simulée). Numérotation automatique, calcul des
   * totaux (sous-total, remise, taxe, total) à partir des lignes fournies.
   * @param {object} payload — { companyId, subscriptionId, currency, taxRate,
   *                            periodStart, periodEnd, items, discountId?,
   *                            discountAmount?, note?, status? }
   * @returns {Promise<object>}
   */
  async createInvoice(payload) {
    if (apiConfig.mock) {
      const settings = getSettingsCache();
      const currency = payload.currency || settings.defaultCurrency;
      const taxRate = Number(payload.taxRate ?? settings.defaultTaxRate) || 0;

      const subtotal = (payload.items || []).reduce(
        (total, item) => total + Number(item.amount ?? (item.quantity || 1) * (item.unitPrice || 0)),
        0,
      );
      const discountAmount = Number(payload.discountAmount || 0);
      const taxable = subtotal - discountAmount;
      const taxAmount = taxable * taxRate;
      const total = taxable + taxAmount;

      const invoice = {
        id: generateUlid(),
        number: `NAVIX-${new Date().getFullYear()}-${String(settings.nextInvoiceNumber).padStart(6, '0')}`,
        companyId: payload.companyId,
        subscriptionId: payload.subscriptionId ?? null,
        status: payload.status || 'draft',
        currency,
        issuedDate: null,
        dueDate: null,
        paidDate: null,
        periodStart: payload.periodStart ?? null,
        periodEnd: payload.periodEnd ?? null,
        subtotal,
        discountId: payload.discountId ?? null,
        discountAmount,
        taxRate,
        taxAmount,
        total,
        creditId: null,
        creditApplied: 0,
        amountPaid: 0,
        amountDue: total,
        note: payload.note ?? '',
        createdAt: now(),
        updatedAt: now(),
      };

      settings.nextInvoiceNumber += 1;
      getInvoicesCache().unshift(invoice);
      return mockResponse({ ...invoice });
    }

    const { data } = await apiClient.post(API_ENDPOINTS.BILLING.INVOICES, payload);
    return data;
  },

  /**
   * Passe une facture brouillon à « émise » (simulé). La date d'émission est
   * la date du jour ; l'échéance = émission + conditions de paiement.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async issueInvoice(id) {
    if (apiConfig.mock) {
      const invoice = findInvoice(id);
      if (!invoice) {
        return mockResponse(null, { error: ApiError.notFound('Facture introuvable.') });
      }
      if (invoice.status !== 'draft') {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'NOT_DRAFT',
            message: 'Seule une facture brouillon peut être émise.',
          }),
        });
      }

      const issuedDate = now();
      const settings = getSettingsCache();
      const dueDate = addDays(issuedDate, settings.paymentTermsDays);
      invoice.status = 'issued';
      invoice.issuedDate = issuedDate;
      invoice.dueDate = dueDate;
      invoice.updatedAt = issuedDate;
      return mockResponse({ ...invoice });
    }

    const { data } = await apiClient.post(API_ENDPOINTS.BILLING.INVOICE_ISSUE(id));
    return data;
  },

  /**
   * Annulation d'une facture (simulée). Le solde dû passe à zéro ; aucun
   * montant n'est prélevé.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async cancelInvoice(id) {
    if (apiConfig.mock) {
      const invoice = findInvoice(id);
      if (!invoice) {
        return mockResponse(null, { error: ApiError.notFound('Facture introuvable.') });
      }
      if (['paid', 'cancelled', 'refunded'].includes(invoice.status)) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'NOT_CANCELLABLE',
            message: 'Cette facture ne peut plus être annulée.',
          }),
        });
      }

      invoice.status = 'cancelled';
      invoice.amountDue = 0;
      invoice.note = invoice.note ? `${invoice.note} — Annulée.` : 'Annulée.';
      invoice.updatedAt = now();
      return mockResponse({ ...invoice });
    }

    const { data } = await apiClient.post(API_ENDPOINTS.BILLING.INVOICE_CANCEL(id));
    return data;
  },

  /**
   * Téléchargement PDF (placeholder). Aucune librairie PDF n'est utilisée :
   * la méthode retourne les métadonnées du fichier simulé.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async downloadInvoice(id) {
    if (apiConfig.mock) {
      const invoice = findInvoice(id);
      if (!invoice) {
        return mockResponse(null, { error: ApiError.notFound('Facture introuvable.') });
      }
      return mockResponse({
        id: invoice.id,
        number: invoice.number,
        fileName: `${invoice.number}.pdf`,
        contentType: 'application/pdf',
        simulated: true,
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.INVOICE_DOWNLOAD(id));
    return data;
  },

  /**
   * Liste de tous les paiements (copie).
   * @returns {Promise<Array<object>>}
   */
  async getPayments() {
    if (apiConfig.mock) {
      return mockResponse([...getPaymentsCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.PAYMENTS);
    return data;
  },

  /**
   * Détail d'un paiement.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getPaymentById(id) {
    if (apiConfig.mock) {
      const payment = getPaymentsCache().find((item) => item.id === id);
      if (!payment) {
        return mockResponse(null, { error: ApiError.notFound('Paiement introuvable.') });
      }
      return mockResponse({ ...payment });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.PAYMENT_DETAIL(id));
    return data;
  },

  /**
   * Simulation d'un paiement (jamais réel). Enregistre le paiement et met à
   * jour la facture (payée ou partiellement payée). Le frontend n'est jamais
   * une source de vérité financière : la validation réelle viendra du backend.
   * @param {object} payload — { invoiceId, method, amount, currency,
   *                            transactionReference, paymentDate }
   * @returns {Promise<object>}
   */
  async simulatePayment(payload) {
    if (apiConfig.mock) {
      const invoice = findInvoice(payload.invoiceId);
      if (!invoice) {
        return mockResponse(null, { error: ApiError.notFound('Facture introuvable.') });
      }
      if (['paid', 'cancelled', 'refunded'].includes(invoice.status)) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'NOT_PAYABLE',
            message: 'Cette facture ne peut plus être payée.',
          }),
        });
      }
      if (invoice.status === 'draft') {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'DRAFT_INVOICE',
            message: 'La facture doit être émise avant d’être payée.',
          }),
        });
      }

      const amount = Number(payload.amount || 0);
      const due = getInvoiceAmountDue(invoice);
      if (amount <= 0) {
        return mockResponse(null, {
          error: new ApiError({
            status: 400,
            code: 'INVALID_AMOUNT',
            message: 'Le montant du paiement est invalide.',
          }),
        });
      }
      if (amount > due) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'AMOUNT_EXCEEDS_DUE',
            message: 'Le montant dépasse le solde restant dû.',
          }),
        });
      }

      const settings = getSettingsCache();
      const payment = {
        id: generateUlid(),
        number: `PAY-${new Date().getFullYear()}-${String(settings.nextPaymentNumber).padStart(6, '0')}`,
        invoiceId: invoice.id,
        companyId: invoice.companyId,
        status: 'successful',
        method: payload.method,
        amount,
        currency: payload.currency || invoice.currency,
        transactionReference: payload.transactionReference,
        paymentDate: payload.paymentDate,
        receivedDate: now(),
        failureReason: null,
        createdAt: now(),
        updatedAt: now(),
      };
      settings.nextPaymentNumber += 1;

      invoice.amountPaid = Number(invoice.amountPaid || 0) + amount;
      invoice.amountDue = Math.max(0, due - amount);
      if (invoice.amountPaid >= Number(invoice.total || 0)) {
        invoice.status = 'paid';
        invoice.paidDate = now();
      } else {
        invoice.status = 'partially_paid';
        invoice.paidDate = invoice.paidDate ?? now();
      }
      invoice.updatedAt = now();

      getPaymentsCache().unshift(payment);
      return mockResponse({ ...payment });
    }

    const { data } = await apiClient.post(API_ENDPOINTS.BILLING.PAYMENT_SIMULATE, payload);
    return data;
  },

  /**
   * Remboursement (simulé). Seul un paiement réussi peut être remboursé ; la
   * facture associée repasse à « remboursée » si le paiement couvrait tout le
   * montant, sinon « partiellement payée ».
   * @param {string} id
   * @returns {Promise<object>}
   */
  async refundPayment(id) {
    if (apiConfig.mock) {
      const payment = getPaymentsCache().find((item) => item.id === id);
      if (!payment) {
        return mockResponse(null, { error: ApiError.notFound('Paiement introuvable.') });
      }
      if (payment.status !== 'successful') {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'NOT_REFUNDABLE',
            message: 'Seul un paiement réussi peut être remboursé.',
          }),
        });
      }

      payment.status = 'refunded';
      payment.refundReason = 'Remboursement demandé (simulation).';
      payment.updatedAt = now();

      const invoice = findInvoice(payment.invoiceId);
      if (invoice) {
        invoice.amountPaid = Math.max(0, Number(invoice.amountPaid || 0) - Number(payment.amount || 0));
        invoice.amountDue = getInvoiceAmountDue(invoice);
        if (invoice.amountPaid <= 0) {
          invoice.status = 'refunded';
          invoice.paidDate = null;
        } else {
          invoice.status = 'partially_paid';
        }
        invoice.updatedAt = now();
      }

      return mockResponse({ ...payment });
    }

    const { data } = await apiClient.post(API_ENDPOINTS.BILLING.PAYMENT_REFUND(id));
    return data;
  },

  /**
   * Journal de facturation (trié du plus récent au plus ancien).
   * @returns {Promise<Array<object>>}
   */
  async getBillingHistory() {
    if (apiConfig.mock) {
      const history = [...MOCK_BILLING_HISTORY].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return mockResponse(history.map((entry) => ({ ...entry })));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.HISTORY);
    return data;
  },

  /**
   * Indicateurs financiers simulés (dérivés de la liste des factures).
   * @returns {Promise<object>}
   */
  async getStatistics() {
    if (apiConfig.mock) {
      const invoices = getInvoicesCache();
      const billedStatuses = new Set(['issued', 'paid', 'partially_paid', 'overdue']);
      const billedInvoices = invoices.filter((invoice) => billedStatuses.has(invoice.status));

      const totalBilled = billedInvoices.reduce(
        (total, invoice) => total + Number(invoice.total || 0),
        0,
      );
      const collected = billedInvoices.reduce(
        (total, invoice) => total + Number(invoice.amountPaid || 0),
        0,
      );
      const outstandingInvoices = invoices.filter((invoice) =>
        ['issued', 'partially_paid', 'overdue'].includes(invoice.status),
      );
      const outstanding = outstandingInvoices.reduce(
        (total, invoice) => total + Number(invoice.amountDue || 0),
        0,
      );
      const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue');
      const overdue = overdueInvoices.reduce(
        (total, invoice) => total + Number(invoice.amountDue || 0),
        0,
      );

      const stats = {
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter((invoice) => invoice.status === 'paid').length,
        unpaidInvoices: outstandingInvoices.length,
        overdueInvoices: overdueInvoices.length,
        draftInvoices: invoices.filter((invoice) => invoice.status === 'draft').length,
        cancelledInvoices: invoices.filter((invoice) => invoice.status === 'cancelled').length,
        refundedInvoices: invoices.filter((invoice) => invoice.status === 'refunded').length,
        totalBilled,
        collected,
        outstanding,
        overdue,
        collectionRate: totalBilled > 0 ? collected / totalBilled : 0,
        currency: getSettingsCache().defaultCurrency,
      };
      return mockResponse(stats);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.STATISTICS);
    return data;
  },

  /**
   * Paramètres de facturation de la plateforme.
   * @returns {Promise<object>}
   */
  async getBillingSettings() {
    if (apiConfig.mock) {
      return mockResponse({ ...getSettingsCache() });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.SETTINGS);
    return data;
  },

  /**
   * Met à jour les paramètres de facturation (simulé).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async updateBillingSettings(payload) {
    if (apiConfig.mock) {
      const settings = getSettingsCache();
      Object.keys(payload).forEach((key) => {
        if (key !== 'id') settings[key] = payload[key];
      });
      settings.updatedAt = now();
      return mockResponse({ ...settings });
    }

    const { data } = await apiClient.patch(API_ENDPOINTS.BILLING.SETTINGS, payload);
    return data;
  },

  /**
   * Avoirs de facturation (copie).
   * @returns {Promise<Array<object>>}
   */
  async getCredits() {
    if (apiConfig.mock) {
      return mockResponse(MOCK_BILLING_CREDITS.map((credit) => ({ ...credit })));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.CREDITS);
    return data;
  },

  /**
   * Remises disponibles (copie).
   * @returns {Promise<Array<object>>}
   */
  async getDiscounts() {
    if (apiConfig.mock) {
      return mockResponse(MOCK_BILLING_DISCOUNTS.map((discount) => ({ ...discount })));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.BILLING.DISCOUNTS);
    return data;
  },
};
