/**
 * Navix Super Admin — Constantes Finance Plateforme
 * --------------------------------------------------------------------------
 * Fondations financières de l'espace Super Admin : fonds plateforme,
 * types de transactions étendus (COMMISSION, FEE, TRANSFER_IN/OUT),
 * sources/destinations d'opérations, filtres et périodes.
 *
 * Réutilise les constantes Client/Partner (TRANSACTION_STATUSES,
 * TRANSACTION_DIRECTIONS, WALLET_STATUSES, FCFA_LABEL, DEFAULT_CURRENCY)
 * depuis client.constants.js — aucune duplication.
 *
 * Règle : monnaie unique FCFA (XAF). Le Chauffeur ne reçoit AUCUNE
 * permission financière Super Admin.
 */
import {
  TRANSACTION_STATUSES,
  TRANSACTION_DIRECTIONS,
  TRANSACTION_DIRECTION_VALUES,
  WALLET_STATUSES,
  FCFA_LABEL,
  DEFAULT_CURRENCY,
  TRANSACTION_PERIODS,
  getTransactionStatus,
  getTransactionDirection,
  transactionDirectionOf,
  isTransactionEffective,
} from '@/features/client/constants/client.constants';

/* ─── Types de transactions étendus (Super Admin) ────────────────────────── */

export const SA_TRANSACTION_TYPES = {
  DEPOSIT: { key: 'deposit', label: 'Dépôt', icon: 'bi-arrow-down-circle', variant: 'success', direction: 'in' },
  WITHDRAWAL: { key: 'withdrawal', label: 'Retrait', icon: 'bi-arrow-up-circle', variant: 'danger', direction: 'out' },
  TRANSFER_IN: { key: 'transfer_in', label: 'Transfert entrant', icon: 'bi-box-arrow-in-down', variant: 'info', direction: 'in' },
  TRANSFER_OUT: { key: 'transfer_out', label: 'Transfert sortant', icon: 'bi-box-arrow-up', variant: 'primary', direction: 'out' },
  PAYMENT: { key: 'payment', label: 'Paiement', icon: 'bi-cash-coin', variant: 'primary', direction: 'out' },
  REFUND: { key: 'refund', label: 'Remboursement', icon: 'bi-arrow-counterclockwise', variant: 'warning', direction: 'in' },
  COMMISSION: { key: 'commission', label: 'Commission', icon: 'bi-percent', variant: 'success', direction: 'in' },
  FEE: { key: 'fee', label: 'Frais', icon: 'bi-coin', variant: 'danger', direction: 'out' },
  ADJUSTMENT: { key: 'adjustment', label: 'Ajustement', icon: 'bi-sliders', variant: 'dark', direction: 'out' },
};

export const SA_TRANSACTION_TYPE_VALUES = Object.values(SA_TRANSACTION_TYPES).map((t) => t.key);

const saDirectionOfType = (value) => {
  const entry = Object.values(SA_TRANSACTION_TYPES).find((t) => t.key === value);
  return entry ? entry.direction : (['deposit', 'refund', 'commission', 'transfer_in'].includes(value) ? 'in' : 'out');
};

/** Résout la configuration d'un type de transaction Super Admin (fallback générique). */
export const getSaTransactionType = (value) =>
  SA_TRANSACTION_TYPES[value] || {
    key: value,
    label: value,
    icon: 'bi-circle',
    variant: 'secondary',
    direction: saDirectionOfType(value),
  };

/* ─── Statuts (réutilisation Client/Partner) ──────────────────────────────── */

export { TRANSACTION_STATUSES, TRANSACTION_DIRECTIONS, TRANSACTION_DIRECTION_VALUES };
export { getTransactionStatus, getTransactionDirection, transactionDirectionOf, isTransactionEffective };

export const SA_TRANSACTION_STATUS_VALUES = Object.keys(TRANSACTION_STATUSES);

/* ─── Devise (réutilisation) ──────────────────────────────────────────────── */

export { FCFA_LABEL, DEFAULT_CURRENCY };

/* ─── Sources / Destinations d'opérations ────────────────────────────────── */

export const TRANSACTION_SOURCES = {
  CLIENT: { key: 'client', label: 'Client', icon: 'bi-building', variant: 'info' },
  PARTNER: { key: 'partner', label: 'Partenaire', icon: 'bi-people', variant: 'primary' },
  SUBSCRIPTION: { key: 'subscription', label: 'Abonnement', icon: 'bi-card-checklist', variant: 'success' },
  INVOICE: { key: 'invoice', label: 'Facture', icon: 'bi-receipt', variant: 'warning' },
  PLATFORM: { key: 'platform', label: 'Plateforme', icon: 'bi-globe', variant: 'dark' },
  MANUAL: { key: 'manual', label: 'Manuel', icon: 'bi-hand-index', variant: 'secondary' },
};

export const TRANSACTION_SOURCE_VALUES = Object.values(TRANSACTION_SOURCES).map((s) => s.key);

export const getSourceLabel = (value) =>
  TRANSACTION_SOURCES[value]?.label || value || '—';

export const getSourceConfig = (value) =>
  TRANSACTION_SOURCES[value] || { key: value, label: value, icon: 'bi-circle', variant: 'secondary' };

/* ─── Portefeuille plateforme (Fonds Super Admin) ────────────────────────── */

export const PLATFORM_FUND_ID = 'FND-PLATFORM-001';
export const PLATFORM_OWNER_TYPE = 'platform';
export const PLATFORM_OWNER_ID = 'navix_management';

export { WALLET_STATUSES };

/* ─── Préfixes d'identification ──────────────────────────────────────────── */

export const SA_TRANSACTION_PREFIX = 'TRX-S';
export const SA_TRANSACTION_REFERENCE_PREFIX = 'TRX';

/* ─── Périodes (réutilisation Client/Partner) ────────────────────────────── */

export { TRANSACTION_PERIODS };

/* ─── Pagination ──────────────────────────────────────────────────────────── */

export const DEFAULT_SA_TRANSACTION_PAGE_SIZE = 10;
export const SA_TRANSACTION_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const SA_PERIOD_FILTER_OPTIONS = [
  { value: '', label: 'Toutes les périodes' },
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d', label: '7 derniers jours' },
  { value: 'month', label: 'Ce mois' },
  { value: 'prev_month', label: 'Mois précédent' },
  { value: '3m', label: '3 derniers mois' },
  { value: '6m', label: '6 derniers mois' },
  { value: '12m', label: '12 derniers mois' },
];

/* ─── Espaces financiers ─────────────────────────────────────────────────── */

export const FINANCIAL_SPACES = ['super_admin', 'client_enterprise', 'partner'];

/* ─── Filtres — helpers ──────────────────────────────────────────────────── */

export const SA_DIRECTION_FILTER_OPTIONS = [
  { value: '', label: 'Toutes les directions' },
  ...Object.values(TRANSACTION_DIRECTIONS).map((d) => ({ value: d.key, label: d.label })),
];

export const SA_TYPE_FILTER_OPTIONS = [
  { value: '', label: 'Tous les types' },
  ...Object.values(SA_TRANSACTION_TYPES).map((t) => ({ value: t.key, label: t.label })),
];

export const SA_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  ...Object.entries(TRANSACTION_STATUSES).map(([key, s]) => ({ value: key.toLowerCase(), label: s.label })),
];

export const SA_SOURCE_FILTER_OPTIONS = [
  { value: '', label: 'Toutes les sources' },
  ...Object.values(TRANSACTION_SOURCES).map((s) => ({ value: s.key, label: s.label })),
];
