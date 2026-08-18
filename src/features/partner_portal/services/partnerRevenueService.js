/**
 * Navix Partner Portal — partnerRevenueService (PROMPT 070)
 * --------------------------------------------------------------------------
 * Service de données pour le module Revenus & Commissions Partenaire.
 * Réutilise l'infrastructure financière existante (mockResponse, ApiError,
 * inScope, assertPartnerRole) — NE PAS créer un deuxième système financier.
 *
 * Toutes les données sont filtrées par companyId (multi-tenant).
 */
import { useAuthStore } from '@/features/auth/store';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_PARTNER_REVENUES } from '../mocks/partner.mock';
import { PARTNER_COMPANY_ID, PARTNER_PARTNER_ID } from '../constants/partner.constants';

const DEMO_USER_ID = 'usr_partner_001';

const revenueCache = [...MOCK_PARTNER_REVENUES];

const getRevenueCache = () => revenueCache;

const inScope = (item) => item.companyId === PARTNER_COMPANY_ID && (!item.partnerId || item.partnerId === PARTNER_PARTNER_ID);

const assertPartnerRole = () => {
  const state = useAuthStore.getState();
  if (state.currentRole !== 'partner' && state.currentRole !== 'super_admin') {
    throw new Error('Accès réservé au rôle Partenaire.');
  }
};

const getFilteredRevenues = (query = {}) => {
  let items = getRevenueCache().filter(inScope);

  if (query.status && query.status !== 'all') {
    items = items.filter((r) => r.status === query.status);
  }
  if (query.client) {
    const q = query.client.toLowerCase();
    items = items.filter((r) => r.clientName.toLowerCase().includes(q));
  }
  if (query.serviceType && query.serviceType !== 'all') {
    items = items.filter((r) => r.serviceType === query.serviceType);
  }
  if (query.period && query.period !== 'all' && query.period !== 'custom') {
    const now = Date.now();
    const periodMap = { today: 1, last7: 7, month: 30, lastMonth: 60, last3: 90, last6: 180, year: 365 };
    const days = periodMap[query.period];
    if (days) {
      const from = now - days * 86_400_000;
      items = items.filter((r) => new Date(r.createdAt).getTime() >= from);
    }
  }
  if (query.fromDate) {
    const from = new Date(query.fromDate).getTime();
    items = items.filter((r) => new Date(r.createdAt).getTime() >= from);
  }
  if (query.toDate) {
    const to = new Date(query.toDate).getTime() + 86_400_000;
    items = items.filter((r) => new Date(r.createdAt).getTime() <= to);
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    items = items.filter((r) =>
      r.reference.toLowerCase().includes(s) ||
      r.missionReference.toLowerCase().includes(s) ||
      r.clientName.toLowerCase().includes(s) ||
      r.serviceLabel.toLowerCase().includes(s)
    );
  }
  return items;
};

const sortRevenues = (items, sort = { by: 'createdAt', direction: 'desc' }) => {
  const dir = sort.direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const aVal = a[sort.by];
    const bVal = b[sort.by];
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    if (typeof aVal === 'string') return aVal.localeCompare(bVal) * dir;
    return 0;
  });
};

const computeStats = (revenues) => {
  const active = revenues.filter((r) => r.status !== 'cancelled');
  const paid = revenues.filter((r) => r.status === 'paid');
  const validated = revenues.filter((r) => r.status === 'validated');
  const pending = revenues.filter((r) => r.status === 'pending');

  const grossTotal = active.reduce((sum, r) => sum + r.grossAmount, 0);
  const commissionTotal = active.reduce((sum, r) => sum + r.commissionAmount, 0);
  const netTotal = active.reduce((sum, r) => sum + r.netAmount, 0);
  const pendingAmount = [...validated, ...pending].reduce((sum, r) => sum + r.netAmount, 0);
  const availableAmount = paid.reduce((sum, r) => sum + r.netAmount, 0);

  return {
    grossTotal,
    commissionTotal,
    netTotal,
    pendingAmount,
    availableAmount,
    totalCount: active.length,
    paidCount: paid.length,
    validatedCount: validated.length,
    pendingCount: pending.length,
    cancelledCount: revenues.filter((r) => r.status === 'cancelled').length,
  };
};

const buildEvolution = () => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû'];
  const now = new Date();
  const currentMonth = now.getMonth();
  const labels = [];
  const grossValues = [];
  const commissionValues = [];
  const netValues = [];

  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    labels.push(months[monthIndex]);
    const yearOffset = currentMonth - i < 0 ? -1 : 0;
    const year = now.getFullYear() + yearOffset;

    const monthRevenues = getRevenueCache().filter((r) => {
      if (r.status === 'cancelled') return false;
      const d = new Date(r.createdAt);
      return d.getMonth() === monthIndex && d.getFullYear() === year;
    });

    grossValues.push(monthRevenues.reduce((s, r) => s + r.grossAmount, 0));
    commissionValues.push(monthRevenues.reduce((s, r) => s + r.commissionAmount, 0));
    netValues.push(monthRevenues.reduce((s, r) => s + r.netAmount, 0));
  }

  return { labels, grossValues, commissionValues, netValues };
};

export const partnerRevenueService = {
  async getRevenueStats(query = {}) {
    assertPartnerRole();
    const items = getFilteredRevenues(query);
    return mockResponse(computeStats(items), { latency: 250 });
  },

  async getRevenueEvolution() {
    assertPartnerRole();
    return mockResponse(buildEvolution(), { latency: 200 });
  },

  async getRevenues(query = {}) {
    assertPartnerRole();
    const filtered = getFilteredRevenues(query);
    const sort = query.sort || { by: 'createdAt', direction: 'desc' };
    const sorted = sortRevenues(filtered, sort);
    return mockResponse(sorted, { latency: 300 });
  },

  async getRevenueById(id) {
    assertPartnerRole();
    const record = getRevenueCache().find((r) => r.id === id && inScope(r));
    if (!record) return mockResponse(null, { error: ApiError.notFound('Revenu introuvable.'), latency: 250 });
    return mockResponse({ ...record }, { latency: 250 });
  },

  async getRevenueByMissionId(missionId) {
    assertPartnerRole();
    const records = getRevenueCache().filter((r) => r.missionId === missionId && inScope(r));
    return mockResponse(records.map((r) => ({ ...r })), { latency: 200 });
  },
};
