/**
 * Navix Partner Portal — partnerRequestService (PROMPT 072)
 * --------------------------------------------------------------------------
 * Service de données pour le module Demandes & Commandes Partenaire.
 * Réutilise l'infrastructure existante (mockResponse, ApiError, inScope,
 * assertPartnerRole) — NE PAS créer un deuxième système de gestion.
 *
 * Toutes les données sont filtrées par companyId (multi-tenant).
 */
import { useAuthStore } from '@/features/auth/store';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_PARTNER_REQUESTS } from '../mocks/partner.mock';
import { PARTNER_COMPANY_ID, PARTNER_PARTNER_ID } from '../constants/partner.constants';

const requestCache = [...MOCK_PARTNER_REQUESTS];

const getRequestCache = () => requestCache;

const inScope = (item) => item.companyId === PARTNER_COMPANY_ID && (!item.partnerId || item.partnerId === PARTNER_PARTNER_ID);

const assertPartnerRole = () => {
  const state = useAuthStore.getState();
  if (state.currentRole !== 'partner' && state.currentRole !== 'super_admin') {
    throw new Error('Accès réservé au rôle Partenaire.');
  }
};

const generateMissionId = () => `MIS-P-${String(getRequestCache().length + 1).padStart(3, '0')}`;

const generateMissionReference = () => {
  const now = new Date();
  const y = now.getFullYear();
  const seq = String(getRequestCache().length + 1).padStart(4, '0');
  return `MIS-${y}-${seq}`;
};

const getFilteredRequests = (query = {}) => {
  let items = getRequestCache().filter(inScope);

  if (query.status && query.status !== 'all') {
    items = items.filter((req) => req.status === query.status);
  }
  if (query.type && query.type !== 'all') {
    items = items.filter((req) => req.type === query.type);
  }
  if (query.priority && query.priority !== 'all') {
    items = items.filter((req) => req.priority === query.priority);
  }
  if (query.client) {
    const q = query.client.toLowerCase();
    items = items.filter((req) => req.clientName.toLowerCase().includes(q));
  }
  if (query.period && query.period !== 'all' && query.period !== 'custom') {
    const now = Date.now();
    const periodMap = { today: 1, last7: 7, month: 30, lastMonth: 60, last3: 90 };
    const days = periodMap[query.period];
    if (days) {
      const from = now - days * 86_400_000;
      items = items.filter((req) => new Date(req.createdAt).getTime() >= from);
    }
  }
  if (query.fromDate) {
    const from = new Date(query.fromDate).getTime();
    items = items.filter((req) => new Date(req.createdAt).getTime() >= from);
  }
  if (query.toDate) {
    const to = new Date(query.toDate).getTime() + 86_400_000;
    items = items.filter((req) => new Date(req.createdAt).getTime() <= to);
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    items = items.filter((req) =>
      req.reference.toLowerCase().includes(s) ||
      req.clientName.toLowerCase().includes(s) ||
      req.subject.toLowerCase().includes(s) ||
      (req.description && req.description.toLowerCase().includes(s))
    );
  }
  return items;
};

const sortRequests = (items, sort = { by: 'createdAt', direction: 'desc' }) => {
  const dir = sort.direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const aVal = a[sort.by];
    const bVal = b[sort.by];
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    if (typeof aVal === 'string') return aVal.localeCompare(bVal) * dir;
    return 0;
  });
};

const computeStats = (requests) => {
  const total = requests.length;
  const pending = requests.filter((r) => r.status === 'pending').length;
  const reviewing = requests.filter((r) => r.status === 'reviewing').length;
  const accepted = requests.filter((r) => r.status === 'accepted').length;
  const rejected = requests.filter((r) => r.status === 'rejected').length;
  const cancelled = requests.filter((r) => r.status === 'cancelled').length;
  const converted = requests.filter((r) => r.status === 'converted').length;
  const active = requests.filter((r) => r.status !== 'cancelled' && r.status !== 'rejected').length;

  return { total, pending, reviewing, accepted, rejected, cancelled, converted, active };
};

export const partnerRequestService = {
  async getRequestStats(query = {}) {
    assertPartnerRole();
    const items = getFilteredRequests(query);
    return mockResponse(computeStats(items), { latency: 250 });
  },

  async getRequests(query = {}) {
    assertPartnerRole();
    const filtered = getFilteredRequests(query);
    const sort = query.sort || { by: 'createdAt', direction: 'desc' };
    const sorted = sortRequests(filtered, sort);
    return mockResponse(sorted, { latency: 300 });
  },

  async getRequestById(id) {
    assertPartnerRole();
    const record = getRequestCache().find((req) => req.id === id && inScope(req));
    if (!record) {
      return mockResponse(null, { error: ApiError.notFound('Demande introuvable.'), latency: 250 });
    }
    return mockResponse({ ...record }, { latency: 250 });
  },

  async acceptRequest(id) {
    assertPartnerRole();
    const idx = getRequestCache().findIndex((req) => req.id === id && inScope(req));
    if (idx === -1) {
      return mockResponse(null, { error: ApiError.notFound('Demande introuvable.'), latency: 250 });
    }
    const record = getRequestCache()[idx];
    if (record.status !== 'pending' && record.status !== 'reviewing') {
      return mockResponse(null, { error: ApiError.badRequest("La demande ne peut être acceptée depuis ce statut."), latency: 250 });
    }
    const now = new Date().toISOString();
    const state = useAuthStore.getState();
    requestCache[idx] = {
      ...record,
      status: 'accepted',
      reviewedAt: record.reviewedAt || now,
      reviewedBy: record.reviewedBy || state.userId || 'usr_partner_001',
      acceptedAt: now,
      updatedAt: now,
    };
    return mockResponse({ ...requestCache[idx] }, { latency: 300 });
  },

  async rejectRequest(id, rejectionReason) {
    assertPartnerRole();
    const idx = getRequestCache().findIndex((req) => req.id === id && inScope(req));
    if (idx === -1) {
      return mockResponse(null, { error: ApiError.notFound('Demande introuvable.'), latency: 250 });
    }
    const record = getRequestCache()[idx];
    if (record.status !== 'pending' && record.status !== 'reviewing') {
      return mockResponse(null, { error: ApiError.badRequest("La demande ne peut être refusée depuis ce statut."), latency: 250 });
    }
    const now = new Date().toISOString();
    const state = useAuthStore.getState();
    requestCache[idx] = {
      ...record,
      status: 'rejected',
      reviewedAt: record.reviewedAt || now,
      reviewedBy: record.reviewedBy || state.userId || 'usr_partner_001',
      rejectionReason: rejectionReason || 'Autre',
      updatedAt: now,
    };
    return mockResponse({ ...requestCache[idx] }, { latency: 300 });
  },

  async startReview(id) {
    assertPartnerRole();
    const idx = getRequestCache().findIndex((req) => req.id === id && inScope(req));
    if (idx === -1) {
      return mockResponse(null, { error: ApiError.notFound('Demande introuvable.'), latency: 250 });
    }
    const record = getRequestCache()[idx];
    if (record.status !== 'pending') {
      return mockResponse(null, { error: ApiError.badRequest("Seules les demandes en attente peuvent être examinées."), latency: 250 });
    }
    const now = new Date().toISOString();
    requestCache[idx] = {
      ...record,
      status: 'reviewing',
      updatedAt: now,
    };
    return mockResponse({ ...requestCache[idx] }, { latency: 300 });
  },

  async cancelRequest(id) {
    assertPartnerRole();
    const idx = getRequestCache().findIndex((req) => req.id === id && inScope(req));
    if (idx === -1) {
      return mockResponse(null, { error: ApiError.notFound('Demande introuvable.'), latency: 250 });
    }
    const record = getRequestCache()[idx];
    if (record.status !== 'pending' && record.status !== 'reviewing') {
      return mockResponse(null, { error: ApiError.badRequest("La demande ne peut être annulée depuis ce statut."), latency: 250 });
    }
    const now = new Date().toISOString();
    requestCache[idx] = {
      ...record,
      status: 'cancelled',
      updatedAt: now,
    };
    return mockResponse({ ...requestCache[idx] }, { latency: 300 });
  },

  async convertToMission(id, missionData = {}) {
    assertPartnerRole();
    const idx = getRequestCache().findIndex((req) => req.id === id && inScope(req));
    if (idx === -1) {
      return mockResponse(null, { error: ApiError.notFound('Demande introuvable.'), latency: 250 });
    }
    const record = getRequestCache()[idx];
    if (record.status !== 'accepted') {
      return mockResponse(null, { error: ApiError.badRequest("Seules les demandes acceptées peuvent être converties en mission."), latency: 250 });
    }
    const now = new Date().toISOString();
    const missionId = generateMissionId();
    const missionReference = generateMissionReference();
    requestCache[idx] = {
      ...record,
      status: 'converted',
      missionId,
      missionReference,
      convertedAt: now,
      updatedAt: now,
    };
    return mockResponse({ ...requestCache[idx], missionData: { id: missionId, reference: missionReference, ...missionData } }, { latency: 400 });
  },
};
