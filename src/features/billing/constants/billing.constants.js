/**
 * Navix Billing — Constantes métier du module Facturation
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les statuts de facture et de paiement, la
 * devise (XAF / FCFA), les taux de taxe fictifs, les moyens de
 * paiement simulés, les statuts de crédit / types de remise et la
 * numérotation des documents (NAVIX-AAAA-NNNNNN / PAY-AAAA-NNNNNN).
 * Contient aussi les règles de formatage (dates, montants) et les getters
 * associés. Consommé par les composants, les pages, les filtres, les tables,
 * les schémas et le service.
 */

/* --------------------------------------------------------------------------
   Statuts de facture
   -------------------------------------------------------------------------- */

export const INVOICE_STATUSES = {
  draft: { label: 'Brouillon', variant: 'secondary', icon: 'bi-file-earmark' },
  issued: { label: 'Émise', variant: 'info', icon: 'bi-send' },
  paid: { label: 'Payée', variant: 'success', icon: 'bi-check-circle' },
  partially_paid: { label: 'Partiellement payée', variant: 'warning', icon: 'bi-pie-chart' },
  overdue: { label: 'En retard', variant: 'danger', icon: 'bi-exclamation-triangle' },
  cancelled: { label: 'Annulée', variant: 'secondary', icon: 'bi-x-circle' },
  refunded: { label: 'Remboursée', variant: 'dark', icon: 'bi-arrow-counterclockwise' },
};

export const INVOICE_STATUS_VALUES = Object.keys(INVOICE_STATUSES);

export const getInvoiceStatus = (value) =>
  INVOICE_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Statuts de paiement
   -------------------------------------------------------------------------- */

export const PAYMENT_STATUSES = {
  pending: { label: 'En attente', variant: 'secondary', icon: 'bi-hourglass-split' },
  processing: { label: 'En cours', variant: 'info', icon: 'bi-arrow-repeat' },
  successful: { label: 'Réussi', variant: 'success', icon: 'bi-check-circle' },
  failed: { label: 'Échoué', variant: 'danger', icon: 'bi-x-octagon' },
  cancelled: { label: 'Annulé', variant: 'secondary', icon: 'bi-x-circle' },
  refunded: { label: 'Remboursé', variant: 'warning', icon: 'bi-arrow-counterclockwise' },
};

export const PAYMENT_STATUS_VALUES = Object.keys(PAYMENT_STATUSES);

export const getPaymentStatus = (value) =>
  PAYMENT_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Moyens de paiement (simulés — aucun traitement réel)
   -------------------------------------------------------------------------- */

export const PAYMENT_METHODS = {
  bank_transfer: { label: 'Virement bancaire', variant: 'primary', icon: 'bi-bank' },
  mobile_money: { label: 'Mobile Money', variant: 'success', icon: 'bi-phone' },
  card: { label: 'Carte bancaire', variant: 'info', icon: 'bi-credit-card' },
  cash: { label: 'Espèces', variant: 'warning', icon: 'bi-cash-stack' },
  other: { label: 'Autre', variant: 'secondary', icon: 'bi-three-dots' },
};

export const PAYMENT_METHOD_VALUES = Object.keys(PAYMENT_METHODS);

export const getPaymentMethod = (value) =>
  PAYMENT_METHODS[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Devises (liées à l'entreprise, montants simulés)
   -------------------------------------------------------------------------- */

export const CURRENCIES = {
  XAF: { label: 'Franc CFA (XAF)', symbol: 'FCFA', code: 'XAF' },
};

export const CURRENCY_VALUES = Object.keys(CURRENCIES);

export const getCurrency = (value) =>
  CURRENCIES[value] || { label: value, symbol: value, code: value };

/** Monnaie par défaut de la facturation (Cameroun — FCFA / XAF). */
export const DEFAULT_CURRENCY = 'XAF';

/** Monnaie par défaut pour les entreprises de la zone CEMAC (simulée). */
export const DEFAULT_XAF_CURRENCY = 'XAF';

/* --------------------------------------------------------------------------
   Taxes (taux fictifs — validation réelle par le futur backend)
   -------------------------------------------------------------------------- */

export const TAX_RATES = {
  0: { label: 'Sans taxe', rate: 0 },
  0.18: { label: 'TVA 18 %', rate: 0.18 },
  0.2: { label: 'TVA 20 %', rate: 0.2 },
};

export const TAX_RATE_VALUES = Object.keys(TAX_RATES).map(Number);

/** Taux de TVA par défaut appliqué aux nouvelles factures (simulé). */
export const DEFAULT_TAX_RATE = 0.18;

export const getTaxRate = (value) => {
  const numeric = Number(value) || 0;
  return TAX_RATES[numeric] || { label: `Taxe ${numeric * 100} %`, rate: numeric };
};

export const getTaxRateLabel = (value) => getTaxRate(value).label;

/* --------------------------------------------------------------------------
   Crédits de facturation et remises
   -------------------------------------------------------------------------- */

export const CREDIT_STATUSES = {
  available: { label: 'Disponible', variant: 'success', icon: 'bi-wallet2' },
  used: { label: 'Utilisé', variant: 'secondary', icon: 'bi-check-circle' },
  expired: { label: 'Expiré', variant: 'danger', icon: 'bi-clock-history' },
};

export const CREDIT_STATUS_VALUES = Object.keys(CREDIT_STATUSES);

export const getCreditStatus = (value) =>
  CREDIT_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const DISCOUNT_TYPES = {
  percentage: { label: 'Pourcentage', icon: 'bi-percent' },
  fixed: { label: 'Montant fixe', icon: 'bi-cash' },
};

export const DISCOUNT_TYPE_VALUES = Object.keys(DISCOUNT_TYPES);

export const getDiscountType = (value) =>
  DISCOUNT_TYPES[value] || { label: value, icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Types de ligne de facture
   -------------------------------------------------------------------------- */

export const ITEM_KINDS = {
  subscription_renewal: { label: 'Renouvellement', icon: 'bi-arrow-clockwise' },
  setup: { label: 'Mise en place', icon: 'bi-tools' },
  usage: { label: 'Consommation', icon: 'bi-graph-up' },
  addon: { label: 'Option', icon: 'bi-plus-square' },
  credit_note: { label: 'Avoir', icon: 'bi-arrow-return-left' },
};

export const ITEM_KIND_VALUES = Object.keys(ITEM_KINDS);

export const getItemKind = (value) =>
  ITEM_KINDS[value] || { label: value, icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Types d'événements du journal de facturation
   -------------------------------------------------------------------------- */

export const BILLING_HISTORY_TYPES = {
  invoice_issued: { label: 'Facture émise', variant: 'info', icon: 'bi-send' },
  invoice_cancelled: { label: 'Facture annulée', variant: 'secondary', icon: 'bi-x-circle' },
  invoice_overdue: { label: 'Facture en retard', variant: 'danger', icon: 'bi-exclamation-triangle' },
  payment_pending: { label: 'Paiement en attente', variant: 'secondary', icon: 'bi-hourglass-split' },
  payment_processing: { label: 'Paiement en cours', variant: 'info', icon: 'bi-arrow-repeat' },
  payment_received: { label: 'Paiement reçu', variant: 'success', icon: 'bi-check-circle' },
  payment_failed: { label: 'Paiement échoué', variant: 'danger', icon: 'bi-x-octagon' },
  credit_applied: { label: 'Avoir appliqué', variant: 'primary', icon: 'bi-wallet2' },
  discount_applied: { label: 'Remise appliquée', variant: 'warning', icon: 'bi-percent' },
  refund_issued: { label: 'Remboursement émis', variant: 'warning', icon: 'bi-arrow-counterclockwise' },
};

export const BILLING_HISTORY_TYPE_VALUES = Object.keys(BILLING_HISTORY_TYPES);

export const getHistoryType = (value) =>
  BILLING_HISTORY_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Numérotation des documents
   -------------------------------------------------------------------------- */

export const INVOICE_NUMBER_PREFIX = 'NAVIX';

export const PAYMENT_NUMBER_PREFIX = 'PAY';

export const CREDIT_NUMBER_PREFIX = 'CRD';

/** Construit un numéro de facture : NAVIX-2026-000001. */
export const formatInvoiceNumber = (year = new Date().getFullYear(), sequence = 1) =>
  `${INVOICE_NUMBER_PREFIX}-${year}-${String(sequence).padStart(6, '0')}`;

/** Construit un numéro de paiement : PAY-2026-000001. */
export const formatPaymentNumber = (year = new Date().getFullYear(), sequence = 1) =>
  `${PAYMENT_NUMBER_PREFIX}-${year}-${String(sequence).padStart(6, '0')}`;

/** Construit un numéro de crédit : CRD-2026-000001. */
export const formatCreditNumber = (year = new Date().getFullYear(), sequence = 1) =>
  `${CREDIT_NUMBER_PREFIX}-${year}-${String(sequence).padStart(6, '0')}`;

/* --------------------------------------------------------------------------
   Conditions de paiement (délai par défaut en jours)
   -------------------------------------------------------------------------- */

export const DEFAULT_PAYMENT_TERMS_DAYS = 15;

/* --------------------------------------------------------------------------
   Config générale
   -------------------------------------------------------------------------- */

export const BILLING_ICON = 'bi-receipt';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const INVOICE_SORT_OPTIONS = [
  { value: 'number', label: 'Numéro' },
  { value: 'companyName', label: 'Entreprise' },
  { value: 'status', label: 'Statut' },
  { value: 'total', label: 'Montant' },
  { value: 'issuedDate', label: 'Émise le' },
  { value: 'dueDate', label: 'Échéance' },
];

export const PAYMENT_SORT_OPTIONS = [
  { value: 'paymentDate', label: 'Date' },
  { value: 'companyName', label: 'Entreprise' },
  { value: 'method', label: 'Moyen de paiement' },
  { value: 'status', label: 'Statut' },
  { value: 'amount', label: 'Montant' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

/* --------------------------------------------------------------------------
   Formatage (dates, montants)
   -------------------------------------------------------------------------- */

/** Construit une Date valide à partir d'une date simple ou d'un ISO. */
const toDate = (value) => {
  const candidate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Formate une date courte (ex. 12 août 2026). */
export const formatBillingDate = (value) => {
  const date = toDate(value);
  return date
    ? date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';
};

/** Formate une date avec l'heure (ex. 12 août 2026, 14:05). */
export const formatBillingDateTime = (value) => {
  const date = toDate(value);
  return date
    ? date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
};

/** Formate un nombre avec les décimales demandées (ex. 1 750 000). */
export const formatBillingNumber = (value, decimals = 2) =>
  Number.isFinite(Number(value))
    ? Number(value).toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : '—';

/**
 * Formate un montant selon sa devise.
 * XAF : entier suivi de « FCFA ».
 */
export const formatBillingMoney = (value, currency = DEFAULT_CURRENCY) => {
  if (!Number.isFinite(Number(value)) || Number(value) === 0) return '—';
  const meta = getCurrency(currency);
  if (currency === 'XAF') {
    return `${Math.round(Number(value)).toLocaleString('fr-FR')} ${meta.symbol}`;
  }
  return `${formatBillingNumber(value, 2)} ${meta.symbol}`;
};

/**
 * Formate une période de facturation (ex. 1 juil. 2026 → 31 juil. 2026).
 * Retourne « — » si l'une des bornes manque.
 */
export const formatBillingPeriod = (start, end) => {
  const from = toDate(start);
  const to = toDate(end);
  if (!from || !to) return '—';
  const sameYear = from.getFullYear() === to.getFullYear();
  const startLabel = from.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  const endLabel = to.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return `${startLabel} → ${endLabel}`;
};

/** Montant restant dû d'une facture (jamais négatif). */
export const getInvoiceAmountDue = (invoice = {}) =>
  Math.max(
    0,
    Number(invoice.total || 0) - Number(invoice.amountPaid || 0) - Number(invoice.creditApplied || 0),
  );
