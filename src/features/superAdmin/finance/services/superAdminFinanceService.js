/**
 * Navix Super Admin — Service Finance Plateforme
 * --------------------------------------------------------------------------
 * Centre financier Super Admin : fonds plateforme (wallet) et transactions
 * (dépôt, retrait, transfert, paiement, commission, frais, ajustement)
 * avec un ledger strictement cohérent (solde avant / après, jamais négatif).
 *
 * Le Super Admin a une vue GLOBALE de la plateforme :
 *   - Toutes les opérations financières (clients, partenaires, abonnements)
 *   - Commissions perçues sur les opérations
 *   - Frais de fonctionnement
 *   - Ajustements administratifs
 *
 * Conventions du projet :
 *   - Monnaie unique : FCFA (XAF). Aucune autre devise.
 *   - Seules les transactions clôturées (statut `success`) modifient le solde.
 *   - Aucun découvert : une sortie refusée si montant > solde.
 *   - Multi-tenant : le Super Admin voit TOUT (pas de filtre companyId).
 *   - Historique reconstituable : annulation par remboursement compensatoire.
 *   - Références auto-générées : TRX-S-YYYYMMDD-NNN.
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { useAuthStore } from '@/features/auth';
import { ROLES } from '@/features/rbac/constants';
import {
  SA_TRANSACTION_PREFIX,
  SA_TRANSACTION_REFERENCE_PREFIX,
  DEFAULT_CURRENCY,
  PLATFORM_FUND_ID,
  getSaTransactionType,
  transactionDirectionOf,
  isTransactionEffective,
} from '../constants/superAdminFinance.constants';
import { MOCK_PLATFORM_FUND, MOCK_SUPER_ADMIN_TRANSACTIONS } from '../mocks/superAdminFinance.mock';

const DEMO_USER_ID = 'usr_001';

/* ─── Garde de rôle ──────────────────────────────────────────────────────── */

const assertSuperAdminRole = () => {
  const role = useAuthStore.getState().currentRole;
  if (role !== ROLES.SUPER_ADMIN) {
    throw ApiError.forbidden('Les opérations financières plateforme sont réservées au Super Admin.');
  }
};

/* ─── Caches privés ──────────────────────────────────────────────────────── */

let fundCache = null;
let transactionCache = null;

const getFundCache = () => {
  if (!fundCache) fundCache = { ...MOCK_PLATFORM_FUND };
  return fundCache;
};

const getTransactionCache = () => {
  if (!transactionCache) transactionCache = MOCK_SUPER_ADMIN_TRANSACTIONS.map((item) => ({ ...item }));
  return transactionCache;
};

/** Export lecture pour le Dashboard (services Data/UI découplés). */
export const getPlatformFundRecordsCache = () => ({ ...getFundCache() });

/** Export lecture pour le Dashboard (services Data/UI découplés). */
export const getSuperAdminTransactionRecordsCache = () => getTransactionCache().map((item) => ({ ...item }));

/* ─── Outils internes ─────────────────────────────────────────────────────── */

const sortDesc = (items) =>
  [...items].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

const amountOf = (transaction) => Number(transaction.amount) || 0;

const monthKey = (value) => (value ? String(value).slice(0, 7) : '');

const pad = (value, length = 3) => String(value).padStart(length, '0');

const toReferenceDate = (date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const nextTransactionId = () => {
  const numbers = getTransactionCache().map((item) => Number(String(item.id || '').replace('TRX-S-', '')) || 0);
  return `TRX-S-${pad(Math.max(0, ...numbers) + 1)}`;
};

const buildTransactionReference = (date = new Date()) => {
  const numbers = getTransactionCache().map((item) => {
    const match = String(item.reference || '').match(/-(\d{3,})$/);
    return match ? Number(match[1]) : 0;
  });
  const next = Math.max(0, ...numbers) + 1;
  return `${SA_TRANSACTION_REFERENCE_PREFIX}-${toReferenceDate(date)}-${pad(next)}`;
};

const assertPositiveAmount = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw ApiError.badRequest('Le montant doit être supérieur à zéro.');
  }
  return value;
};

const inScope = () => true;

/* ─── Création de transaction interne ────────────────────────────────────── */

const createTransaction = async ({ type, amount, source, destination, description, sourceType }) => {
  assertSuperAdminRole();

  const value = assertPositiveAmount(amount);
  const direction = getSaTransactionType(type).direction;
  const fund = getFundCache();
  const balance = Number(fund.balance) || 0;

  if (direction === 'out' && value > balance) {
    return mockResponse(null, {
      error: ApiError.badRequest('Solde insuffisant pour effectuer cette opération.', {
        available: balance,
        required: value,
      }),
      latency: 500,
    });
  }

  const now = new Date();
  const record = {
    id: nextTransactionId(),
    reference: buildTransactionReference(now),
    fundId: PLATFORM_FUND_ID,
    type,
    direction,
    status: 'success',
    amount: value,
    currency: DEFAULT_CURRENCY,
    balanceBefore: balance,
    balanceAfter: direction === 'out' ? balance - value : balance + value,
    description,
    source: direction === 'in' ? (source || 'Source inconnue') : 'Fonds plateforme',
    destination: direction === 'out' ? (destination || 'Destination inconnue') : null,
    sourceType: sourceType || null,
    relatedEntityType: null,
    relatedEntityId: null,
    metadata: {},
    createdBy: DEMO_USER_ID,
    createdByRole: 'super_admin',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  fund.balance = record.balanceAfter;
  fund.updatedAt = now.toISOString();
  fund.totalIn = Number(fund.totalIn) + (direction === 'in' ? value : 0);
  fund.totalOut = Number(fund.totalOut) + (direction === 'out' ? value : 0);
  fund.availableBalance = fund.balance - Number(fund.pendingBalance || 0);

  getTransactionCache().unshift(record);

  return mockResponse({ ...record }, { latency: 700 });
};

/* ─── Statistiques ────────────────────────────────────────────────────────── */

const buildStatistics = () => {
  const fund = getFundCache();
  const transactions = getTransactionCache().filter(inScope);
  const effective = transactions.filter(isTransactionEffective);
  const now = new Date();
  const currentMonthKey = monthKey(now.toISOString());

  const monthItems = effective.filter((item) => monthKey(item.createdAt) === currentMonthKey);
  const incomeMonth = monthItems
    .filter((item) => transactionDirectionOf(item) === 'in')
    .reduce((sum, item) => sum + amountOf(item), 0);
  const expenseMonth = monthItems
    .filter((item) => transactionDirectionOf(item) === 'out')
    .reduce((sum, item) => sum + amountOf(item), 0);

  const totalIncome = effective
    .filter((item) => transactionDirectionOf(item) === 'in')
    .reduce((sum, item) => sum + amountOf(item), 0);
  const totalExpense = effective
    .filter((item) => transactionDirectionOf(item) === 'out')
    .reduce((sum, item) => sum + amountOf(item), 0);

  const totalCommission = effective
    .filter((item) => item.type === 'commission')
    .reduce((sum, item) => sum + amountOf(item), 0);
  const totalFees = effective
    .filter((item) => item.type === 'fee')
    .reduce((sum, item) => sum + amountOf(item), 0);
  const totalRefunds = effective
    .filter((item) => item.type === 'refund')
    .reduce((sum, item) => sum + amountOf(item), 0);

  return {
    fundId: fund.fundId,
    balance: Number(fund.balance) || 0,
    availableBalance: Number(fund.availableBalance) || 0,
    pendingBalance: Number(fund.pendingBalance) || 0,
    currency: fund.currency || DEFAULT_CURRENCY,
    totalIn: Number(fund.totalIn) || 0,
    totalOut: Number(fund.totalOut) || 0,
    updatedAt: fund.updatedAt,
    incomeMonth,
    expenseMonth,
    variationMonth: incomeMonth - expenseMonth,
    totalIncome,
    totalExpense,
    totalCommission,
    totalFees,
    totalRefunds,
    transactionCount: transactions.length,
    pendingCount: transactions.filter((item) => item.status === 'pending').length,
    completedCount: transactions.filter((item) => item.status === 'success').length,
    failedCount: transactions.filter((item) => item.status === 'failed').length,
    cancelledCount: transactions.filter((item) => item.status === 'cancelled').length,
    transactionsMonth: monthItems.length,
  };
};

/* ── Fonds (Wallet plateforme) ────────────────────────────────────────────── */

export const platformFundService = {
  /** Fonds plateforme — en FCFA. */
  async getFund() {
    assertSuperAdminRole();
    return mockResponse({ ...getFundCache() }, { latency: 350 });
  },

  /** Solde disponible en FCFA. */
  async getBalance() {
    assertSuperAdminRole();
    return mockResponse(Number(getFundCache().balance) || 0, { latency: 250 });
  },

  /** Statistiques complètes. */
  async statistics() {
    assertSuperAdminRole();
    return mockResponse(buildStatistics(), { latency: 400 });
  },

  /** Synthèse financière pour le Dashboard futur. */
  async getFinancialSummary() {
    assertSuperAdminRole();
    const stats = buildStatistics();
    return mockResponse(
      {
        balance: stats.balance,
        availableBalance: stats.availableBalance,
        pendingBalance: stats.pendingBalance,
        incomeMonth: stats.incomeMonth,
        expenseMonth: stats.expenseMonth,
        currency: stats.currency,
        transactionCount: stats.transactionCount,
        transactionsMonth: stats.transactionsMonth,
        variationMonth: stats.variationMonth,
        totalCommission: stats.totalCommission,
        totalFees: stats.totalFees,
        totalRefunds: stats.totalRefunds,
        recentTransactions: sortDesc(getTransactionCache().filter(inScope)).slice(0, 5),
      },
      { latency: 400 },
    );
  },
};

/* ── Transactions ────────────────────────────────────────────────────────── */

export const superAdminTransactionService = {
  /** Historique complet (ordre antichronologique). */
  async getAll() {
    assertSuperAdminRole();
    return mockResponse(sortDesc(getTransactionCache().filter(inScope).map((item) => ({ ...item }))), {
      latency: 400,
    });
  },

  /** Détail d'une transaction. */
  async getById(id) {
    assertSuperAdminRole();
    const record = getTransactionCache().find((item) => item.id === id && inScope(item));
    if (!record) {
      return mockResponse(null, { error: ApiError.notFound('Transaction introuvable.'), latency: 350 });
    }
    return mockResponse({ ...record }, { latency: 350 });
  },

  /** Aperçu de la prochaine référence. */
  async previewReference() {
    assertSuperAdminRole();
    return mockResponse(buildTransactionReference(), { latency: 150 });
  },

  createDeposit: (payload) => createTransaction({ ...payload, type: 'deposit' }),

  createWithdrawal: (payload) => createTransaction({ ...payload, type: 'withdrawal' }),

  createTransferIn: (payload) => createTransaction({ ...payload, type: 'transfer_in' }),

  createTransferOut: (payload) => createTransaction({ ...payload, type: 'transfer_out' }),

  createPayment: (payload) => createTransaction({ ...payload, type: 'payment' }),

  createCommission: (payload) => createTransaction({ ...payload, type: 'commission' }),

  createFee: (payload) => createTransaction({ ...payload, type: 'fee' }),

  createAdjustment: (payload) => createTransaction({ ...payload, type: 'adjustment' }),

  /**
   * Annule une transaction réussie par un remboursement compensatoire.
   */
  async reverse(id) {
    assertSuperAdminRole();

    const cache = getTransactionCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Transaction introuvable.'), latency: 350 });
    }

    const target = cache[index];
    if (!isTransactionEffective(target)) {
      return mockResponse(null, {
        error: ApiError.badRequest('Seules les transactions réussies peuvent être annulées.'),
        latency: 350,
      });
    }
    if (target.reversedRef) {
      return mockResponse(null, {
        error: ApiError.conflict('Cette transaction a déjà été annulée.'),
        latency: 350,
      });
    }

    const amount = amountOf(target);
    const direction = transactionDirectionOf(target) === 'out' ? 'in' : 'out';
    const fund = getFundCache();
    const balance = Number(fund.balance) || 0;

    if (direction === 'out' && amount > balance) {
      return mockResponse(null, {
        error: ApiError.badRequest('Solde insuffisant pour effectuer cette opération.', {
          available: balance,
          required: amount,
        }),
        latency: 350,
      });
    }

    const now = new Date();
    const record = {
      id: nextTransactionId(),
      reference: buildTransactionReference(now),
      fundId: PLATFORM_FUND_ID,
      type: 'refund',
      direction,
      status: 'success',
      amount,
      currency: DEFAULT_CURRENCY,
      balanceBefore: balance,
      balanceAfter: direction === 'out' ? balance - amount : balance + amount,
      description: `Annulation de ${target.reference}`,
      source: target.destination || target.source || 'Fonds plateforme',
      destination: null,
      sourceType: target.sourceType || 'platform',
      relatedEntityType: 'transaction',
      relatedEntityId: target.id,
      metadata: { reversalOf: target.reference },
      createdBy: DEMO_USER_ID,
      createdByRole: 'super_admin',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    target.reversedRef = record.reference;
    fund.balance = record.balanceAfter;
    fund.updatedAt = now.toISOString();
    fund.totalIn = Number(fund.totalIn) + (direction === 'in' ? amount : 0);
    fund.totalOut = Number(fund.totalOut) + (direction === 'out' ? amount : 0);
    fund.availableBalance = fund.balance - Number(fund.pendingBalance || 0);
    cache.unshift(record);

    return mockResponse({ ...record }, { latency: 700 });
  },
};

/* --- Rapports & Contrôle financier --- */

const PERIOD_RANGES = {
  today: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from: start.toISOString(), to: now.toISOString() };
  },
  '7d': () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return { from: start.toISOString(), to: now.toISOString() };
  },
  month: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: start.toISOString(), to: now.toISOString() };
  },
  prev_month: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  },
  '3m': () => {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);
    return { from: start.toISOString(), to: now.toISOString() };
  },
  '6m': () => {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(start.getMonth() - 6);
    return { from: start.toISOString(), to: now.toISOString() };
  },
  '12m': () => {
    const now = new Date();
    const start = new Date(now);
    start.setFullYear(start.getFullYear() - 1);
    return { from: start.toISOString(), to: now.toISOString() };
  },
};

const shiftPeriodRange = (range, _period) => {
  if (!range) return null;
  const from = new Date(range.from);
  const to = new Date(range.to);
  const duration = to.getTime() - from.getTime();
  return { from: new Date(from.getTime() - duration).toISOString(), to: from.toISOString() };
};

const resolveFilterRange = (filters) => {
  if (filters.period && PERIOD_RANGES[filters.period]) {
    return PERIOD_RANGES[filters.period]();
  }
  if (filters.dateFrom || filters.dateTo) {
    return {
      from: filters.dateFrom || '2000-01-01T00:00:00.000Z',
      to: filters.dateTo || '2099-12-31T23:59:59.999Z',
    };
  }
  return null;
};

const filterByAttributes = (items, filters) =>
  items.filter((tx) => {
    if (filters.type && tx.type !== filters.type) return false;
    if (filters.direction && transactionDirectionOf(tx) !== filters.direction) return false;
    if (filters.status && tx.status !== filters.status) return false;
    return true;
  });

const filterByDateRange = (items, range) => {
  if (!range) return items;
  return items.filter((tx) => {
    const d = String(tx.createdAt || '');
    return d >= range.from && d <= range.to;
  });
};

const filterTransactions = (items, filters) => {
  const range = resolveFilterRange(filters);
  return filterByAttributes(filterByDateRange(items, range), filters);
};

const computeAggregates = (items) => {
  let totalIncome = 0;
  let totalExpense = 0;
  let commissions = 0;
  let refunds = 0;
  const byType = {};
  const byTypeAmounts = {};
  const byStatus = {};
  const byDirection = { in: 0, out: 0 };
  const byMonth = {};

  items.forEach((tx) => {
    const amt = amountOf(tx);
    const dir = transactionDirectionOf(tx);
    const status = tx.status || 'unknown';
    const mk = String(tx.createdAt || '').slice(0, 7);

    if (tx.status === 'success') {
      if (dir === 'in') totalIncome += amt;
      else totalExpense += amt;
    }

    if (tx.type === 'commission' && tx.status === 'success') commissions += amt;
    if (tx.type === 'refund' && tx.status === 'success') refunds += amt;

    byType[tx.type] = (byType[tx.type] || 0) + 1;
    if (!byTypeAmounts[tx.type]) byTypeAmounts[tx.type] = { in: 0, out: 0 };
    if (tx.status === 'success') byTypeAmounts[tx.type][dir] += amt;
    byStatus[status] = (byStatus[status] || 0) + 1;
    byDirection[dir] = (byDirection[dir] || 0) + amt;

    if (!byMonth[mk]) byMonth[mk] = { income: 0, outcome: 0 };
    if (tx.status === 'success') {
      if (dir === 'in') byMonth[mk].income += amt;
      else byMonth[mk].outcome += amt;
    }
  });

  return { totalIncome, totalExpense, commissions, refunds, byType, byTypeAmounts, byStatus, byDirection, byMonth };
};

const runControl = (items) => {
  const anomalies = [];
  let conformCount = 0;
  let anomalyAmount = 0;

  items.forEach((tx) => {
    const amt = amountOf(tx);
    let hasAnomaly = false;

    if (amt <= 0 && tx.status === 'success') {
      anomalies.push({ id: tx.id, reference: tx.reference, type: tx.type, issue: 'Montant invalide (<= 0)', expected: '> 0', actual: amt });
      hasAnomaly = true;
      anomalyAmount += amt;
    }
    if (tx.currency && tx.currency !== 'XAF') {
      anomalies.push({ id: tx.id, reference: tx.reference, type: tx.type, issue: `Devise inattendue: ${tx.currency}`, expected: 'XAF', actual: tx.currency });
      hasAnomaly = true;
    }
    if (tx.status === 'success') {
      const dir = transactionDirectionOf(tx);
      const expectedBalance = dir === 'in'
        ? Number(tx.balanceBefore) + amt
        : Number(tx.balanceBefore) - amt;
      if (Math.abs(Number(tx.balanceAfter) - expectedBalance) > 0.01) {
        anomalies.push({ id: tx.id, reference: tx.reference, type: tx.type, issue: 'Incohérence de solde', expected: expectedBalance, actual: tx.balanceAfter });
        hasAnomaly = true;
        anomalyAmount += Math.abs(Number(tx.balanceAfter) - expectedBalance);
      }
    }
    if (!tx.reference) {
      anomalies.push({ id: tx.id, reference: '—', type: tx.type, issue: 'Référence manquante', expected: 'Présente', actual: 'Absente' });
      hasAnomaly = true;
    }

    if (!hasAnomaly) conformCount += 1;
  });

  return { totalChecked: items.length, conformCount, anomalyCount: anomalies.length, anomalyAmount, anomalies };
};

export const computeReportData = (allTransactions, filters = {}) => {
  const filtered = filterTransactions(allTransactions, filters);

  const range = resolveFilterRange(filters);
  let previousFiltered = [];
  if (range && filters.period && PERIOD_RANGES[filters.period]) {
    const prevRange = shiftPeriodRange(range, filters.period);
    if (prevRange) {
      previousFiltered = filterByAttributes(
        filterByDateRange(allTransactions, prevRange),
        filters,
      );
    }
  }

  const current = computeAggregates(filtered);
  const previous = computeAggregates(previousFiltered);

  const netRevenue = current.totalIncome - current.totalExpense;

  const sortMonths = (byMonth) => {
    const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sorted.map(([k]) => k),
      incomeValues: sorted.map(([, v]) => v.income),
      outcomeValues: sorted.map(([, v]) => v.outcome),
    };
  };

  const evolution = sortMonths(current.byMonth);

  const typeEntries = Object.entries(current.byType).sort(([, a], [, b]) => b - a);
  const byType = {
    labels: typeEntries.map(([k]) => k),
    values: typeEntries.map(([, v]) => v),
  };

  const flowTypeEntries = Object.entries(current.byTypeAmounts)
    .sort(([, a], [, b]) => (b.in + b.out) - (a.in + a.out));
  const flowByType = {
    labels: flowTypeEntries.map(([k]) => k),
    inValues: flowTypeEntries.map(([, v]) => v.in),
    outValues: flowTypeEntries.map(([, v]) => v.out),
  };

  const STATUS_VARIANTS = { success: 'success', pending: 'warning', failed: 'danger', cancelled: 'secondary' };
  const statusEntries = Object.entries(current.byStatus).sort(([, a], [, b]) => b - a);
  const byStatus = {
    labels: statusEntries.map(([k]) => k),
    values: statusEntries.map(([, v]) => v),
    variants: statusEntries.map(([k]) => STATUS_VARIANTS[k] || 'secondary'),
  };

  const DIR_VARIANTS = { in: 'success', out: 'danger' };
  const byDirection = {
    labels: Object.keys(current.byDirection),
    values: Object.values(current.byDirection),
    variants: Object.keys(current.byDirection).map((k) => DIR_VARIANTS[k] || 'secondary'),
  };

  const allMonths = new Set([...Object.keys(current.byMonth), ...Object.keys(previous.byMonth)]);
  const reportRows = [...allMonths].sort().map((month) => ({
    period: month,
    income: current.byMonth[month]?.income || 0,
    expense: current.byMonth[month]?.outcome || 0,
    revenue: (current.byMonth[month]?.income || 0) - (current.byMonth[month]?.outcome || 0),
    transactions: filtered.filter((tx) => String(tx.createdAt || '').slice(0, 7) === month).length,
    balance: (current.byMonth[month]?.income || 0) - (current.byMonth[month]?.outcome || 0),
  }));

  const control = runControl(filtered);

  return {
    filteredCount: filtered.length,
    kpis: {
      totalIncome: current.totalIncome,
      totalExpense: current.totalExpense,
      netRevenue,
      commissions: current.commissions,
      refunds: current.refunds,
      transactionCount: filtered.length,
    },
    previous: {
      totalIncome: previous.totalIncome,
      totalExpense: previous.totalExpense,
      netRevenue: previous.totalIncome - previous.totalExpense,
      commissions: previous.commissions,
      refunds: previous.refunds,
      transactionCount: previousFiltered.length,
    },
    evolution,
    byType,
    flowByType,
    byStatus,
    byDirection,
    reportRows,
    control,
  };
};
