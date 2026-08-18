/**
 * Navix Partner — Service Finance Partenaire (Fonds & Transactions FCFA)
 * --------------------------------------------------------------------------
 * Centre financier de l'Espace Partenaire : wallet (fonds FCFA) et
 * transactions (dépôt, retrait, transfert, paiement, remboursement,
 * ajustement) avec un ledger strictement cohérent (solde avant / après,
 * jamais négatif).
 *
 * Conventions du projet :
 *   - Monnaie unique : FCFA (XAF). Aucune autre devise (EUR/USD/GBP) acceptée.
 *   - Seules les transactions clôturées (statut `success`, équivalent
 *     COMPLETED) modifient le solde. Aucun découvert : une sortie est refusée
 *     si `montant > solde disponible` (ApiError 422 « Solde insuffisant »).
 *   - Multi-tenant : les données sont strictement bornées au `companyId`
 *     partenaire (`cmp_partner_navix`). Le Chauffeur n'a JAMAIS d'accès
 *     transactionnel : garde de rôle en profondeur (route guard + service).
 *   - Références auto-générées (ex. TRX-2026-0815-023).
 *   - Historique reconstituable : une transaction réussie peut être annulée
 *     (remboursement compensatoire `refund`) — jamais supprimée en silence.
 *   - Les opérations créent des notifications via le moteur existant
 *     (NOTIFICATION_KINDS : finance_deposit / finance_withdrawal / …).
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { useAuthStore } from '@/features/auth';
import { ROLES } from '@/features/rbac/constants';
import { getNotificationKind } from '@/features/notifications/constants';
import {
  TRANSACTION_REFERENCE_PREFIX,
  DEFAULT_CURRENCY,
  transactionDirectionOf,
  isTransactionEffective,
} from '../constants/partner.constants';
import { MOCK_PARTNER_WALLET, MOCK_PARTNER_TRANSACTIONS } from '../mocks/partner.mock';
import { PARTNER_COMPANY_ID, PARTNER_PARTNER_ID, PARTNER_WALLET_ID } from '../constants/partner.constants';
import { getPartnerNotificationRecordsCache, pushPartnerNotification } from './partnerNotificationService';

const DEMO_USER_ID = 'usr_partner_001';

const inScope = (transaction) => transaction.companyId === PARTNER_COMPANY_ID && (!transaction.partnerId || transaction.partnerId === PARTNER_PARTNER_ID);

/** Garde de rôle en profondeur : le chauffeur n'a aucun accès transactionnel. */
const assertPartnerRole = () => {
  const role = useAuthStore.getState().currentRole;
  if (role !== ROLES.PARTNER) {
    throw ApiError.forbidden(
      'Les opérations financières partenaire sont réservées au rôle Partenaire.',
    );
  }
};

/* ── Caches privés (cohérence ledger + multi-tenant) ─────────────────────── */

let walletCache = null;
let transactionCache = null;

const getWalletCache = () => {
  if (!walletCache) walletCache = { ...MOCK_PARTNER_WALLET };
  return walletCache;
};

const getTransactionCache = () => {
  if (!transactionCache) transactionCache = MOCK_PARTNER_TRANSACTIONS.map((item) => ({ ...item }));
  return transactionCache;
};

/** Export lecture pour le Dashboard (services Data/UI découplés). */
export const getPartnerWalletRecordsCache = () => ({ ...getWalletCache() });

/** Export lecture pour le Dashboard (services Data/UI découplés). */
export const getPartnerTransactionRecordsCache = () => getTransactionCache().map((item) => ({ ...item }));

/* ── Outils internes ─────────────────────────────────────────────────────── */

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
  const numbers = getTransactionCache().map((item) => Number(String(item.id || '').replace('TRX-P-', '')) || 0);
  return `TRX-P-${pad(Math.max(0, ...numbers) + 1)}`;
};

const buildTransactionReference = (date = new Date()) => {
  const numbers = getTransactionCache().map((item) => {
    const match = String(item.reference || '').match(/-(\d{3,})$/);
    return match ? Number(match[1]) : 0;
  });
  const next = Math.max(0, ...numbers) + 1;
  return `${TRANSACTION_REFERENCE_PREFIX}-${toReferenceDate(date)}-${pad(next)}`;
};

const nextNotificationId = () => {
  const numbers = getPartnerNotificationRecordsCache().map(
    (item) => Number(String(item.id || '').replace('PTRNF-', '')) || 0,
  );
  return `PTRNF-${pad(Math.max(0, ...numbers) + 1, 4)}`;
};

const pushFinanceNotification = ({ kind, title, message, resourceId, metadata = {} }) => {
  const kindMeta = getNotificationKind(kind);
  const now = new Date().toISOString();
  const record = {
    id: nextNotificationId(),
    companyId: PARTNER_COMPANY_ID,
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
  pushPartnerNotification(record);
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

const assertPositiveAmount = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw ApiError.badRequest('Le montant doit être supérieur à zéro.');
  }
  return value;
};

const createTransaction = async ({ type, amount, method, source, destination, description }) => {
  assertPartnerRole();

  const value = assertPositiveAmount(amount);
  const direction = transactionDirectionOf({ type, direction: null });
  const wallet = getWalletCache();
  const balance = Number(wallet.balance) || 0;

  if (direction === 'out' && value > balance) {
    pushFinanceNotification({
      kind: 'finance_insufficient',
      title: 'Solde insuffisant',
      message: `Le solde disponible (${balance.toLocaleString('fr-FR')} FCFA) ne permet pas cette opération de ${value.toLocaleString('fr-FR')} FCFA.`,
      resourceId: PARTNER_WALLET_ID,
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
    source: direction === 'in' ? source : 'Wallet — Cameroon Logistics Partners',
    destination: direction === 'out' ? destination : null,
    counterparty: direction === 'out' ? destination : source,
    method: method || 'other',
    balanceBefore: balance,
    balanceAfter: direction === 'out' ? balance - value : balance + value,
    companyId: PARTNER_COMPANY_ID,
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

/* ── Statistiques & évolution ────────────────────────────────────────────── */

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
  };
};

/* ── Wallet (Fonds) ──────────────────────────────────────────────────────── */

export const partnerWalletService = {
  /** Portefeuille (Fonds) du Partenaire — en FCFA. */
  async getWallet() {
    return mockResponse({ ...getWalletCache() }, { latency: 350 });
  },

  /** Solde disponible en FCFA. */
  async getBalance() {
    return mockResponse(Number(getWalletCache().balance) || 0, { latency: 250 });
  },

  /** Statistiques complètes (totaux, mois courant, variation). */
  async statistics() {
    return mockResponse(buildStatistics(), { latency: 400 });
  },
};

/* ── Transactions ────────────────────────────────────────────────────────── */

export const partnerTransactionService = {
  /** Historique complet du Partenaire (ordre antichronologique). */
  async getAll() {
    return mockResponse(sortDesc(getTransactionCache().filter(inScope).map((item) => ({ ...item }))), {
      latency: 400,
    });
  },

  /** Détail d'une transaction (404 hors portée / introuvable). */
  async getById(id) {
    const record = getTransactionCache().find((item) => item.id === id && inScope(item));
    if (!record) {
      return mockResponse(null, { error: ApiError.notFound('Transaction introuvable.'), latency: 350 });
    }
    return mockResponse({ ...record }, { latency: 350 });
  },

  /** Aperçu de la prochaine référence (affichage en lecture seule). */
  async previewReference() {
    return mockResponse(buildTransactionReference(), { latency: 150 });
  },

  createDeposit: (payload) => createTransaction({ ...payload, type: 'deposit' }),

  createWithdrawal: (payload) => createTransaction({ ...payload, type: 'withdrawal' }),

  createTransfer: (payload) => createTransaction({ ...payload, type: 'transfer' }),

  createPayment: (payload) => createTransaction({ ...payload, type: 'payment' }),

  /**
   * Annule une transaction réussie par un remboursement compensatoire
   * (l'historique reste intact — jamais de suppression silencieuse).
   */
  async reverse(id) {
    assertPartnerRole();

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
      companyId: PARTNER_COMPANY_ID,
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
  async getFinancialSummary() {
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
