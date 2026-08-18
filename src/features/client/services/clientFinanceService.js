/**
 * Navix Client — Service Finance (Portefeuille & Transactions) — PROMPT 059
 * --------------------------------------------------------------------------
 * Centre financier du Client Entreprise : wallet (fonds FCFA) et transactions
 * (dépôt, retrait, transfert, paiement, remboursement, ajustement), avec un
 * ledger strictement cohérent (solde avant / après, jamais négatif).
 *
 * Conventions du projet :
 *   - Monnaie unique : FCFA (XAF). Aucune autre devise n'est acceptée.
 *   - La Finance est indépendante des coûts métier : les coûts de carburant,
 *     de maintenance ou les documents ne créent JAMAIS de transaction wallet.
 *   - Seules les transactions clôturées (statut `success`, équivalent
 *     COMPLETED) modifient le solde. Aucun découvert : une sortie est refusée
 *     si `montant > solde disponible` (ApiError 422 « Solde insuffisant »).
 *   - Multi-tenant : les données sont strictement bornées au `companyId`
 *     « Transports Express Cameroun » ; le Client Particulier n'a aucune
 *     donnée financière (espace réservé : Super Admin / Client-Entreprise /
 *     Partenaire).
 *   - Références auto-générées (ex. TRX-2026-0815-023), réutilisables par
 *     les composants de confirmation et l'historique.
 *   - Historique reconstituable : une transaction réussie peut être annulée
 *     (remboursement compensatoire `refund`) — jamais supprimée en silence.
 *   - Les opérations créent des notifications via le moteur existant
 *     (NOTIFICATION_KINDS : finance_deposit / finance_withdrawal / …).
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { getNotificationKind } from '@/features/notifications/constants';
import {
  CLIENT_TYPES,
  TRANSACTION_REFERENCE_PREFIX,
  DEFAULT_CURRENCY,
  transactionDirectionOf,
  isTransactionEffective,
} from '../constants/client.constants';
import { MOCK_CLIENT_WALLET, MOCK_CLIENT_TRANSACTIONS } from '../mocks/client.mock';
import { getNotificationCache } from './clientNotificationService';

const TEC_COMPANY_ID = '01J8A2B3C4D5E6F7G8H9J0K1L2';
const DEMO_USER_ID = 'usr_001';

const isEnterprise = (clientType) => clientType === CLIENT_TYPES.ENTERPRISE;

const inScope = (transaction) => transaction.companyId === TEC_COMPANY_ID;

/* ── Caches privés (cohérence ledger + multi-tenant) ─────────────────────── */

let walletCache = null;
let transactionCache = null;

const getWalletCache = () => {
  if (!walletCache) walletCache = { ...MOCK_CLIENT_WALLET };
  return walletCache;
};

const getTransactionCache = () => {
  if (!transactionCache) transactionCache = MOCK_CLIENT_TRANSACTIONS.map((item) => ({ ...item }));
  return transactionCache;
};

/** Export lecture pour le Dashboard (services Data/UI découplés). */
export const getWalletRecordsCache = () => ({ ...getWalletCache() });

/** Export lecture pour le Dashboard (services Data/UI découplés). */
export const getTransactionRecordsCache = () => getTransactionCache().map((item) => ({ ...item }));

/* ── Outils internes ─────────────────────────────────────────────────────── */

const sortDesc = (items) =>
  [...items].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

const amountOf = (transaction) => Number(transaction.amount) || 0;

/** Convertit une valeur en nombre sûr (null si non numérique). */
const safeNumber = (value) => {
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
};

const monthKey = (value) => (value ? String(value).slice(0, 7) : '');

const pad = (value, length = 3) => String(value).padStart(length, '0');

const toReferenceDate = (date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/** Prochain identifiant de transaction (TRX-0023…). */
const nextTransactionId = () => {
  const numbers = getTransactionCache().map((item) => Number(String(item.id || '').replace('TRX-', '')) || 0);
  return `TRX-${pad(Math.max(0, ...numbers) + 1)}`;
};

/** Prochaine référence de transaction (TRX-2026-0815-023…). */
const buildTransactionReference = (date = new Date()) => {
  const numbers = getTransactionCache().map((item) => {
    const match = String(item.reference || '').match(/-(\d{3,})$/);
    return match ? Number(match[1]) : 0;
  });
  const next = Math.max(0, ...numbers) + 1;
  return `${TRANSACTION_REFERENCE_PREFIX}-${toReferenceDate(date)}-${pad(next)}`;
};

/** Prochain identifiant de notification (CLTNF-xxxx). */
const nextNotificationId = () => {
  const numbers = getNotificationCache().map((item) => Number(String(item.id || '').replace('CLTNF-', '')) || 0);
  return `CLTNF-${pad(Math.max(0, ...numbers) + 1, 4)}`;
};

/** Notifications du moteur existant (aucun nouveau moteur créé). */
const pushFinanceNotification = ({ kind, title, message, resourceId, metadata = {} }) => {
  const kindMeta = getNotificationKind(kind);
  const now = new Date().toISOString();
  const record = {
    id: nextNotificationId(),
    companyId: TEC_COMPANY_ID,
    userId: DEMO_USER_ID,
    kind,
    title,
    message,
    status: 'unread',
    isRead: false,
    readAt: null,
    type: kindMeta.type,
    category: kindMeta.category,
    severity: kindMeta.severity,
    resourceType: 'transaction',
    resourceId,
    createdAt: now,
    updatedAt: now,
    metadata,
  };
  getNotificationCache().unshift(record);
  return record;
};

const KIND_BY_TYPE = {
  deposit: 'finance_deposit',
  withdrawal: 'finance_withdrawal',
  transfer: 'finance_transfer',
  payment: 'finance_payment',
  refund: 'finance_refund',
};

const TITLE_BY_TYPE = {
  deposit: 'Dépôt effectué',
  withdrawal: 'Retrait effectué',
  transfer: 'Transfert effectué',
  payment: 'Transaction sortante effectuée',
  refund: 'Transaction annulée / remboursée',
};

const assertEnterprise = (clientType) => {
  if (!isEnterprise(clientType)) {
    throw ApiError.forbidden('Les opérations financières sont réservées aux clients entreprise.');
  }
};

const assertPositiveAmount = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw ApiError.badRequest('Le montant doit être supérieur à zéro.');
  }
  return value;
};

/**
 * Crée une transaction wallet et met à jour le ledger de façon atomique
 * (insertion + solde + notification dans le même appel).
 */
const createTransaction = async ({ type, amount, method, source, destination, description }, clientType) => {
  assertEnterprise(clientType);

  const value = assertPositiveAmount(amount);
  const direction = transactionDirectionOf({ type, direction: null });
  const wallet = getWalletCache();
  const balance = Number(wallet.balance) || 0;

  if (direction === 'out' && value > balance) {
    pushFinanceNotification({
      kind: 'finance_insufficient',
      title: 'Solde insuffisant',
      message: `Le solde disponible (${balance.toLocaleString('fr-FR')} FCFA) ne permet pas cette opération de ${value.toLocaleString('fr-FR')} FCFA.`,
      resourceId: 'WAL-TEC-0001',
      metadata: { available: balance, required: value },
    });
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
    type,
    label: description,
    description,
    amount: value,
    currency: wallet.currency || DEFAULT_CURRENCY,
    direction,
    status: 'success',
    createdAt: now.toISOString(),
    source: direction === 'in' ? source : 'Wallet — Transports Express Cameroun',
    destination: direction === 'out' ? destination : null,
    counterparty: direction === 'out' ? destination : source,
    method: method || 'other',
    balanceBefore: balance,
    balanceAfter: direction === 'out' ? balance - value : balance + value,
    companyId: TEC_COMPANY_ID,
  };

  wallet.balance = record.balanceAfter;
  wallet.updatedAt = now.toISOString();
  getTransactionCache().unshift(record);

  pushFinanceNotification({
    kind: KIND_BY_TYPE[type] || 'finance_payment',
    title: TITLE_BY_TYPE[type] || 'Opération financière',
    message: `${record.reference} — ${value.toLocaleString('fr-FR')} FCFA.`,
    resourceId: record.id,
    metadata: { amount: value, reference: record.reference, type },
  });

  return mockResponse({ ...record }, { latency: 700 });
};

/** Statistiques du portefeuille (totaux, mois courant, évolution mensuelle). */
const buildStatistics = () => {
  const wallet = getWalletCache();
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

  const monthlyEvolution = buildMonthlyEvolution(transactions, 6);

  return {
    walletId: wallet.walletId,
    balance: Number(wallet.balance) || 0,
    currency: wallet.currency || DEFAULT_CURRENCY,
    updatedAt: wallet.updatedAt,
    incomeMonth,
    expenseMonth,
    variationMonth: incomeMonth - expenseMonth,
    totalIncome,
    totalExpense,
    transactionsCount: transactions.length,
    transactionsMonth: transactions.filter((item) => monthKey(item.createdAt) === currentMonthKey).length,
    pendingCount: transactions.filter((item) => item.status === 'pending').length,
    monthlyEvolution,
  };
};

/** Évolution mensuelle (entrées / sorties / solde de fin de mois). */
const buildMonthlyEvolution = (transactions, months = 6) => {
  const effectiveAsc = transactions
    .filter(isTransactionEffective)
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const keys = Array.from({ length: months }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  const buckets = keys.reduce((acc, key) => {
    acc[key] = { entrees: 0, sorties: 0, solde: null };
    return acc;
  }, {});

  effectiveAsc.forEach((item) => {
    const key = monthKey(item.createdAt);
    if (!buckets[key]) return;
    if (transactionDirectionOf(item) === 'in') {
      buckets[key].entrees += amountOf(item);
    } else {
      buckets[key].sorties += amountOf(item);
    }
    buckets[key].solde = safeNumber(item.balanceAfter) ?? safeNumber(item.balanceBefore);
  });

  const monthLabel = (key) => {
    const date = new Date(`${key}-01T00:00:00`);
    return Number.isNaN(date.getTime()) ? key : date.toLocaleDateString('fr-FR', { month: 'short' });
  };

  let carry = effectiveAsc.length
    ? Number(effectiveAsc[0].balanceBefore) || 0
    : Number(getWalletCache().balance) || 0;

  return keys.map((key) => {
    const bucket = buckets[key];
    const solde = bucket.solde ?? carry;
    carry = solde;
    return {
      month: key,
      label: monthLabel(key),
      entrees: bucket.entrees,
      sorties: bucket.sorties,
      solde,
    };
  });
};

/* ── Wallet (Fonds) ──────────────────────────────────────────────────────── */

export const clientWalletService = {
  /** Portefeuille du Client (null pour le Particulier). */
  async getWallet(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) return mockResponse(null, { latency: 300 });
    return mockResponse({ ...getWalletCache() }, { latency: 350 });
  },

  /** Solde disponible en FCFA. */
  async getBalance(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) return mockResponse(0, { latency: 250 });
    return mockResponse(Number(getWalletCache().balance) || 0, { latency: 250 });
  },

  /** Statistiques complètes (totaux, mois courant, évolution mensuelle). */
  async statistics(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) return mockResponse(null, { latency: 300 });
    return mockResponse(buildStatistics(), { latency: 400 });
  },
};

/* ── Transactions ────────────────────────────────────────────────────────── */

export const clientTransactionService = {
  /** Historique complet du Client (ordre antichronologique). */
  async getAll(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) return mockResponse([], { latency: 300 });
    return mockResponse(sortDesc(getTransactionCache().filter(inScope).map((item) => ({ ...item }))), {
      latency: 400,
    });
  },

  /** Détail d'une transaction (404 hors portée / introuvable). */
  async getById(id, clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse(null, { error: ApiError.notFound('Transaction introuvable.'), latency: 350 });
    }
    const record = getTransactionCache().find((item) => item.id === id && inScope(item));
    if (!record) {
      return mockResponse(null, { error: ApiError.notFound('Transaction introuvable.'), latency: 350 });
    }
    return mockResponse({ ...record }, { latency: 350 });
  },

  /** Aperçu de la prochaine référence (affichage en lecture seule). */
  async previewReference(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) return mockResponse(null, { latency: 150 });
    return mockResponse(buildTransactionReference(), { latency: 150 });
  },

  createDeposit: (payload, clientType) =>
    createTransaction({ ...payload, type: 'deposit' }, clientType),

  createWithdrawal: (payload, clientType) =>
    createTransaction({ ...payload, type: 'withdrawal' }, clientType),

  createTransfer: (payload, clientType) =>
    createTransaction({ ...payload, type: 'transfer' }, clientType),

  createPayment: (payload, clientType) =>
    createTransaction({ ...payload, type: 'payment' }, clientType),

  /**
   * Annule une transaction réussie par un remboursement compensatoire
   * (l'historique reste intact — jamais de suppression silencieuse).
   */
  async reverse(id, clientType = CLIENT_TYPES.ENTERPRISE) {
    assertEnterprise(clientType);

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
    const wallet = getWalletCache();
    const balance = Number(wallet.balance) || 0;

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
      type: 'refund',
      label: `Annulation de ${target.reference}`,
      description: `Annulation / remboursement de la transaction ${target.reference}`,
      amount,
      currency: DEFAULT_CURRENCY,
      direction,
      status: 'success',
      createdAt: now.toISOString(),
      source: target.destination || target.counterparty || 'Wallet',
      destination: null,
      counterparty: target.source || 'Wallet',
      method: target.method || 'other',
      balanceBefore: balance,
      balanceAfter: direction === 'out' ? balance - amount : balance + amount,
      companyId: TEC_COMPANY_ID,
      reversalOf: target.id,
    };

    target.reversedRef = record.reference;
    wallet.balance = record.balanceAfter;
    wallet.updatedAt = now.toISOString();
    cache.unshift(record);

    pushFinanceNotification({
      kind: 'finance_refund',
      title: 'Transaction annulée / remboursée',
      message: `${record.reference} — remboursement de la transaction ${target.reference} (${amount.toLocaleString('fr-FR')} FCFA).`,
      resourceId: record.id,
      metadata: { amount, reference: record.reference, reversalOf: target.reference },
    });

    return mockResponse({ ...record }, { latency: 700 });
  },

  /** Synthèse financière pour le Dashboard (mêmes caches que la page). */
  async getFinancialSummary(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) return mockResponse(null, { latency: 300 });
    const stats = buildStatistics();
    return mockResponse(
      {
        balance: stats.balance,
        incomeMonth: stats.incomeMonth,
        expenseMonth: stats.expenseMonth,
        currency: stats.currency,
        transactionsCount: stats.transactionsCount,
        transactionsMonth: stats.transactionsMonth,
        variationMonth: stats.variationMonth,
        recentTransactions: sortDesc(getTransactionCache().filter(inScope)).slice(0, 5),
      },
      { latency: 400 },
    );
  },
};
