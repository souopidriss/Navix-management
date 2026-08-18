/**
 * Navix Partner Portal — Contrat Service (PROMPT 073)
 * ──────────────────────────────────────────────────────
 * Opérations CRUD sur les contrats du partenaire.
 * Multi-tenant strict : lecture/seulement PARTNER_COMPANY_ID.
 */

import { useAuthStore } from '@/features/auth/store';
import { MOCK_PARTNER_CONTRACTS } from '../mocks/partnerContract.mock';
import {
  PARTNER_COMPANY_ID,
  PARTNER_PARTNER_ID,
} from '../constants/partner.constants';

/**
 * Vérifie que l'utilisateur a le rôle partenaire.
 */
const assertPartnerRole = () => {
  const state = useAuthStore.getState();
  if (state.currentRole !== 'partner' && state.currentRole !== 'super_admin') {
    throw new Error('Accès réservé au rôle Partenaire');
  }
};

// ─── READ ────────────────────────────────────────────────────────────

/**
 * Liste des contrats avec filtres, recherche, tri, pagination.
 */
export const listContracts = async (
  {
    search = '',
    status = 'all',
    type = 'all',
    category = 'all',
    billingFrequency = 'all',
    expiringWithin = null,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    page = 1,
    pageSize = 10,
  } = {}
) => {
  await new Promise((r) => setTimeout(r, 300));
  assertPartnerRole();

  let result = [...MOCK_PARTNER_CONTRACTS];

  // Multi-tenant
  result = result.filter((c) => (!c.companyId || c.companyId === PARTNER_COMPANY_ID) && (!c.partnerId || c.partnerId === PARTNER_PARTNER_ID));

  // Filtres exacts
  if (status !== 'all') result = result.filter((c) => c.status === status);
  if (type !== 'all') result = result.filter((c) => c.type === type);
  if (category !== 'all') result = result.filter((c) => c.category === category);
  if (billingFrequency !== 'all') result = result.filter((c) => c.billingFrequency === billingFrequency);

  // Filtre expiration
  if (expiringWithin) {
    const now = Date.now();
    const threshold = now + expiringWithin * 24 * 60 * 60 * 1000;
    result = result.filter((c) => {
      if (!c.endDate) return false;
      const end = new Date(c.endDate).getTime();
      return end >= now && end <= threshold;
    });
  }

  // Recherche
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.reference?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.clientName?.toLowerCase().includes(q) ||
        c.vehicleName?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }

  // Tri
  result.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (sortBy === 'value' || sortBy === 'monthlyAmount') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    }
    if (sortBy === 'startDate' || sortBy === 'endDate' || sortBy === 'createdAt') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const total = result.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paged = result.slice(start, start + pageSize);

  return { contracts: paged, total, totalPages, page, pageSize };
};

/**
 * Statistiques des contrats.
 */
export const getContractStats = async () => {
  await new Promise((r) => setTimeout(r, 200));
  assertPartnerRole();

  const contracts = MOCK_PARTNER_CONTRACTS.filter(
    (c) => (!c.companyId || c.companyId === PARTNER_COMPANY_ID) && (!c.partnerId || c.partnerId === PARTNER_PARTNER_ID)
  );

  const total = contracts.length;
  const active = contracts.filter((c) => c.status === 'active').length;
  const pending = contracts.filter((c) => c.status === 'pending').length;
  const expiring = contracts.filter((c) => c.status === 'expiring').length;
  const expired = contracts.filter((c) => c.status === 'expired').length;
  const terminated = contracts.filter((c) => c.status === 'terminated').length;
  const suspended = contracts.filter((c) => c.status === 'suspended').length;

  const totalValue = contracts.reduce((s, c) => s + (c.value || 0), 0);
  const activeValue = contracts
    .filter((c) => c.status === 'active')
    .reduce((s, c) => s + (c.value || 0), 0);
  const totalMissions = contracts.reduce((s, c) => s + (c.missionsCount || 0), 0);
  const totalInvoices = contracts.reduce((s, c) => s + (c.invoicesCount || 0), 0);
  const autoRenewCount = contracts.filter((c) => c.autoRenew).length;

  return {
    total, active, pending, expiring, expired, terminated, suspended,
    totalValue, activeValue, totalMissions, totalInvoices, autoRenewCount,
  };
};

/**
 * Détail d'un contrat.
 */
export const getContractDetail = async (contractId) => {
  await new Promise((r) => setTimeout(r, 200));
  assertPartnerRole();

  const contract = MOCK_PARTNER_CONTRACTS.find((c) => c.id === contractId && (!c.companyId || c.companyId === PARTNER_COMPANY_ID) && (!c.partnerId || c.partnerId === PARTNER_PARTNER_ID));
  if (!contract) throw new Error('Contrat introuvable');

  return { ...contract };
};

/**
 * Contrats expirant dans N jours.
 */
export const getExpiringContracts = async (days = 30) => {
  await new Promise((r) => setTimeout(r, 200));
  assertPartnerRole();

  const now = Date.now();
  const threshold = now + days * 24 * 60 * 60 * 1000;
  return MOCK_PARTNER_CONTRACTS.filter((c) => {
    if (!c.endDate) return false;
    if (c.companyId && c.companyId !== PARTNER_COMPANY_ID) return false;
    if (c.partnerId && c.partnerId !== PARTNER_PARTNER_ID) return false;
    const end = new Date(c.endDate).getTime();
    return end >= now && end <= threshold && c.status === 'active';
  });
};

// ─── WRITE ───────────────────────────────────────────────────────────

/**
 * Créer un contrat.
 */
export const createContract = async (data) => {
  await new Promise((r) => setTimeout(r, 400));
  assertPartnerRole();

  const newContract = {
    id: `ctr_prt_${String(MOCK_PARTNER_CONTRACTS.length + 1).padStart(3, '0')}`,
    reference: `CTR-2026-${String(MOCK_PARTNER_CONTRACTS.length + 1).padStart(3, '0')}`,
    ...data,
    status: 'pending',
    missionsCount: 0,
    invoicesCount: 0,
    documentsCount: 0,
    companyId: PARTNER_COMPANY_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_PARTNER_CONTRACTS.push(newContract);
  return { ...newContract };
};

/**
 * Mettre à jour un contrat.
 */
export const updateContract = async (contractId, data) => {
  await new Promise((r) => setTimeout(r, 400));
  assertPartnerRole();

  const scopeCheck = (c) => (!c.companyId || c.companyId === PARTNER_COMPANY_ID) && (!c.partnerId || c.partnerId === PARTNER_PARTNER_ID);
  const idx = MOCK_PARTNER_CONTRACTS.findIndex((c) => c.id === contractId && scopeCheck(c));
  if (idx === -1) throw new Error('Contrat introuvable');

  MOCK_PARTNER_CONTRACTS[idx] = {
    ...MOCK_PARTNER_CONTRACTS[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return { ...MOCK_PARTNER_CONTRACTS[idx] };
};

/**
 * Renouveler un contrat.
 */
export const renewContract = async (contractId, { endDate, autoRenew } = {}) => {
  await new Promise((r) => setTimeout(r, 400));
  assertPartnerRole();

  const scopeCheck2 = (c) => (!c.companyId || c.companyId === PARTNER_COMPANY_ID) && (!c.partnerId || c.partnerId === PARTNER_PARTNER_ID);
  const idx = MOCK_PARTNER_CONTRACTS.findIndex((c) => c.id === contractId && scopeCheck2(c));
  if (idx === -1) throw new Error('Contrat introuvable');

  const contract = MOCK_PARTNER_CONTRACTS[idx];
  const currentEnd = new Date(contract.endDate);
  const newEnd = endDate
    ? new Date(endDate)
    : new Date(currentEnd.setFullYear(currentEnd.getFullYear() + 1));

  MOCK_PARTNER_CONTRACTS[idx] = {
    ...contract,
    endDate: newEnd.toISOString().split('T')[0],
    status: 'active',
    autoRenew: autoRenew ?? contract.autoRenew,
    updatedAt: new Date().toISOString(),
  };

  return { ...MOCK_PARTNER_CONTRACTS[idx] };
};

/**
 * Résilier un contrat.
 */
export const terminateContract = async (contractId, { reason } = {}) => {
  await new Promise((r) => setTimeout(r, 400));
  assertPartnerRole();

  const scopeCheck3 = (c) => (!c.companyId || c.companyId === PARTNER_COMPANY_ID) && (!c.partnerId || c.partnerId === PARTNER_PARTNER_ID);
  const idx = MOCK_PARTNER_CONTRACTS.findIndex((c) => c.id === contractId && scopeCheck3(c));
  if (idx === -1) throw new Error('Contrat introuvable');

  MOCK_PARTNER_CONTRACTS[idx] = {
    ...MOCK_PARTNER_CONTRACTS[idx],
    status: 'terminated',
    terminationReason: reason || 'Non spécifié',
    terminatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { ...MOCK_PARTNER_CONTRACTS[idx] };
};

/**
 * Suspendre / réactiver un contrat.
 */
export const toggleSuspendContract = async (contractId) => {
  await new Promise((r) => setTimeout(r, 400));
  assertPartnerRole();

  const scopeCheck4 = (c) => (!c.companyId || c.companyId === PARTNER_COMPANY_ID) && (!c.partnerId || c.partnerId === PARTNER_PARTNER_ID);
  const idx = MOCK_PARTNER_CONTRACTS.findIndex((c) => c.id === contractId && scopeCheck4(c));
  if (idx === -1) throw new Error('Contrat introuvable');

  const contract = MOCK_PARTNER_CONTRACTS[idx];
  const newStatus = contract.status === 'suspended' ? 'active' : 'suspended';

  MOCK_PARTNER_CONTRACTS[idx] = {
    ...contract,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  return { ...MOCK_PARTNER_CONTRACTS[idx] };
};
