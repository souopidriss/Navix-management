/**
 * Navix Partner Portal — partnerInvoiceService (PROMPT 071)
 * --------------------------------------------------------------------------
 * Service de données pour le module Facturation & Paiements Partenaire.
 * Réutilise l'infrastructure existante (mockResponse, ApiError, inScope,
 * assertPartnerRole) — NE PAS créer un deuxième système financier.
 *
 * Toutes les données sont filtrées par companyId (multi-tenant).
 */
import { useAuthStore } from '@/features/auth/store';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_PARTNER_INVOICES } from '../mocks/partner.mock';
import { PARTNER_COMPANY_ID, PARTNER_PARTNER_ID, isInvoiceOverdue } from '../constants/partner.constants';

const invoiceCache = [...MOCK_PARTNER_INVOICES];

const getInvoiceCache = () => invoiceCache;

const inScope = (item) => item.companyId === PARTNER_COMPANY_ID && (!item.partnerId || item.partnerId === PARTNER_PARTNER_ID);

const assertPartnerRole = () => {
  const state = useAuthStore.getState();
  if (state.currentRole !== 'partner' && state.currentRole !== 'super_admin') {
    throw new Error('Accès réservé au rôle Partenaire.');
  }
};

/**
 * Applique le statut overdue automatiquement (PROMPT 071 §25).
 */
const normalizeStatus = (invoice) => {
  if (invoice.status === 'overdue' || invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'draft') {
    return invoice;
  }
  if (isInvoiceOverdue(invoice.dueDate, invoice.status)) {
    return { ...invoice, status: 'overdue' };
  }
  return invoice;
};

const getFilteredInvoices = (query = {}) => {
  let items = getInvoiceCache().filter(inScope).map(normalizeStatus);

  if (query.status && query.status !== 'all') {
    items = items.filter((inv) => inv.status === query.status);
  }
  if (query.paymentStatus && query.paymentStatus !== 'all') {
    items = items.filter((inv) => inv.paymentStatus === query.paymentStatus);
  }
  if (query.client) {
    const q = query.client.toLowerCase();
    items = items.filter((inv) => inv.clientName.toLowerCase().includes(q));
  }
  if (query.serviceType && query.serviceType !== 'all') {
    items = items.filter((inv) => inv.serviceType === query.serviceType);
  }
  if (query.period && query.period !== 'all' && query.period !== 'custom') {
    const now = Date.now();
    const periodMap = { today: 1, last7: 7, month: 30, lastMonth: 60, last3: 90 };
    const days = periodMap[query.period];
    if (days) {
      const from = now - days * 86_400_000;
      items = items.filter((inv) => new Date(inv.issueDate).getTime() >= from);
    }
  }
  if (query.fromDate) {
    const from = new Date(query.fromDate).getTime();
    items = items.filter((inv) => new Date(inv.issueDate).getTime() >= from);
  }
  if (query.toDate) {
    const to = new Date(query.toDate).getTime() + 86_400_000;
    items = items.filter((inv) => new Date(inv.issueDate).getTime() <= to);
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    items = items.filter((inv) =>
      inv.reference.toLowerCase().includes(s) ||
      inv.clientName.toLowerCase().includes(s) ||
      inv.missionReference.toLowerCase().includes(s) ||
      (inv.description && inv.description.toLowerCase().includes(s))
    );
  }
  return items;
};

const sortInvoices = (items, sort = { by: 'issueDate', direction: 'desc' }) => {
  const dir = sort.direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const aVal = a[sort.by];
    const bVal = b[sort.by];
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    if (typeof aVal === 'string') return aVal.localeCompare(bVal) * dir;
    return 0;
  });
};

const computeStats = (invoices) => {
  const active = invoices.filter((inv) => inv.status !== 'cancelled');
  const paid = invoices.filter((inv) => inv.status === 'paid');
  const pending = invoices.filter((inv) => inv.status === 'pending' || inv.status === 'issued');
  const overdue = invoices.filter((inv) => inv.status === 'overdue');

  const totalBilled = active.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = paid.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPending = pending.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalOverdue = overdue.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return {
    totalBilled,
    totalPaid,
    totalPending,
    totalOverdue,
    totalCount: active.length,
    paidCount: paid.length,
    pendingCount: pending.length,
    overdueCount: overdue.length,
  };
};

const generateId = () => `INV-P-${String(getInvoiceCache().length + 1).padStart(3, '0')}`;
const generateReference = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(getInvoiceCache().length + 1).padStart(3, '0');
  return `FAC-P-${y}${m}${d}-${seq}`;
};

export const partnerInvoiceService = {
  async getInvoiceStats(query = {}) {
    assertPartnerRole();
    const items = getFilteredInvoices(query);
    return mockResponse(computeStats(items), { latency: 250 });
  },

  async getInvoices(query = {}) {
    assertPartnerRole();
    const filtered = getFilteredInvoices(query);
    const sort = query.sort || { by: 'issueDate', direction: 'desc' };
    const sorted = sortInvoices(filtered, sort);
    return mockResponse(sorted, { latency: 300 });
  },

  async getInvoiceById(id) {
    assertPartnerRole();
    const record = getInvoiceCache().find((inv) => inv.id === id && inScope(inv));
    if (!record) {
      return mockResponse(null, { error: ApiError.notFound('Facture introuvable.'), latency: 250 });
    }
    return mockResponse({ ...normalizeStatus(record) }, { latency: 250 });
  },

  async createInvoice(payload) {
    assertPartnerRole();
    const newInvoice = {
      id: generateId(),
      companyId: PARTNER_COMPANY_ID,
      partnerId: PARTNER_PARTNER_ID,
      reference: generateReference(),
      clientId: payload.clientId,
      clientName: payload.clientName || '',
      clientContact: payload.clientContact || '',
      missionId: payload.missionId,
      missionReference: payload.missionReference || '',
      serviceType: payload.serviceType || 'autre',
      serviceLabel: payload.serviceLabel || '',
      grossAmount: Number(payload.grossAmount) || 0,
      commissionRate: 0.10,
      commissionAmount: Math.round((Number(payload.grossAmount) || 0) * 0.10),
      taxRate: 0,
      taxAmount: 0,
      netAmount: Math.round((Number(payload.grossAmount) || 0) * 0.90),
      totalAmount: Math.round((Number(payload.grossAmount) || 0) * 0.90),
      description: payload.description || '',
      issueDate: payload.issueDate || new Date().toISOString().split('T')[0],
      dueDate: payload.dueDate || '',
      paidAt: null,
      status: 'draft',
      paymentStatus: 'none',
      paymentMethod: null,
      paymentReference: null,
      transactionId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    invoiceCache.push(newInvoice);
    return mockResponse({ ...newInvoice }, { latency: 400 });
  },

  async cancelInvoice(id) {
    assertPartnerRole();
    const idx = invoiceCache.findIndex((inv) => inv.id === id && inScope(inv));
    if (idx === -1) {
      return mockResponse(null, { error: ApiError.notFound('Facture introuvable.'), latency: 250 });
    }
    invoiceCache[idx] = { ...invoiceCache[idx], status: 'cancelled', updatedAt: new Date().toISOString() };
    return mockResponse({ ...invoiceCache[idx] }, { latency: 300 });
  },

  async getOverdueInvoices() {
    assertPartnerRole();
    const items = getInvoiceCache()
      .filter(inScope)
      .map(normalizeStatus)
      .filter((inv) => inv.status === 'overdue');
    return mockResponse(items, { latency: 200 });
  },

  async getDueSoonInvoices(days = 7) {
    assertPartnerRole();
    const now = Date.now();
    const limit = now + days * 86_400_000;
    const items = getInvoiceCache()
      .filter(inScope)
      .map(normalizeStatus)
      .filter((inv) => {
        if (inv.status === 'paid' || inv.status === 'cancelled' || inv.status === 'overdue') return false;
        const due = new Date(inv.dueDate).getTime();
        return due >= now && due <= limit;
      });
    return mockResponse(items, { latency: 200 });
  },
};
