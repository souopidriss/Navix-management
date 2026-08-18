/**
 * Navix Client — Constantes métier du module Espace Client
 * --------------------------------------------------------------------------
 * Types de clients, statuts des demandes, catégories de services et
 * options de filtrage pour l'espace Client.
 */
export const CLIENT_TYPES = {
  ENTERPRISE: 'enterprise',
  INDIVIDUAL: 'individual',
};

export const CLIENT_TYPE_LABELS = {
  [CLIENT_TYPES.ENTERPRISE]: 'Client Entreprise',
  [CLIENT_TYPES.INDIVIDUAL]: 'Client Particulier',
};

export const REQUEST_STATUSES = {
  PENDING: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  APPROVED: { label: 'Approuvée', variant: 'info', icon: 'bi-check-circle' },
  IN_PROGRESS: { label: 'En cours', variant: 'primary', icon: 'bi-arrow-repeat' },
  COMPLETED: { label: 'Terminée', variant: 'success', icon: 'bi-check2-all' },
  CANCELLED: { label: 'Annulée', variant: 'danger', icon: 'bi-x-circle' },
};

export const SERVICE_CATEGORIES = [
  { id: 'fleet_rental', label: 'Location de flotte', icon: 'bi-truck' },
  { id: 'vip_transport', label: 'Transport VIP / Personnel', icon: 'bi-person-badge' },
  { id: 'logistics_freight', label: 'Fret & Logistique', icon: 'bi-box-seam' },
  { id: 'maintenance_contract', label: 'Contrat de maintenance', icon: 'bi-wrench' },
];

export const DEFAULT_CURRENCY = 'XAF';

export const CAMEROON_CITIES = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Bamenda',
  'Garoua',
  'Maroua',
  'Ngaoundéré',
  'Bertoua',
  'Ebolowa',
  'Kribi',
  'Limbe',
  'Buea',
  'Kumba',
  'Dschang',
  'Nkongsamba',
];

/* ─── Finance — Fondations (Espace Client / Entreprise) ─────────────────────
   Développement complet prévu au PROMPT 059. Ici : contrat de données
   (Wallet / Fonds, Transaction, Balance, statuts, référence) en FCFA (XAF).
   Aucune logique financière — simple préparation d'architecture.            */

/** Libellés FCFA affichés (espace réservé au détail financier). */
export const FCFA_LABEL = 'FCFA';

/** Statuts du portefeuille (Wallet / Fonds). */
export const WALLET_STATUSES = {
  ACTIVE: { label: 'Actif', variant: 'success', icon: 'bi-check-circle' },
  SUSPENDED: { label: 'Suspendu', variant: 'danger', icon: 'bi-x-circle' },
  PENDING: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
};

/** Types de transactions (PROMPT 059 — catalogue complet FCFA). */
export const TRANSACTION_TYPES = {
  DEPOSIT: { key: 'deposit', label: 'Dépôt', icon: 'bi-arrow-down-circle', variant: 'success', direction: 'in' },
  WITHDRAWAL: { key: 'withdrawal', label: 'Retrait', icon: 'bi-arrow-up-circle', variant: 'danger', direction: 'out' },
  TRANSFER: { key: 'transfer', label: 'Transfert', icon: 'bi-arrow-left-right', variant: 'info', direction: 'out' },
  PAYMENT: { key: 'payment', label: 'Paiement', icon: 'bi-cash-coin', variant: 'primary', direction: 'out' },
  REFUND: { key: 'refund', label: 'Remboursement', icon: 'bi-arrow-counterclockwise', variant: 'warning', direction: 'in' },
  ADJUSTMENT: { key: 'adjustment', label: 'Ajustement', icon: 'bi-sliders', variant: 'dark', direction: 'out' },
};

/** Valeurs ordonnées des types de transactions (filtres, selects). */
export const TRANSACTION_TYPE_VALUES = Object.values(TRANSACTION_TYPES).map((type) => type.key);

/**
 * Statuts de transactions (PROMPT 059).
 * Le catalogue métier utilise `success` comme équivalent fonctionnel du
 * statut « COMPLETED » du contrat (PENDING / COMPLETED / FAILED / CANCELLED) :
 * une transaction réussie est une transaction clôturée qui impacte le solde.
 */
export const TRANSACTION_STATUSES = {
  PENDING: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  SUCCESS: { label: 'Réussie', variant: 'success', icon: 'bi-check-circle' },
  FAILED: { label: 'Échouée', variant: 'danger', icon: 'bi-x-circle' },
  CANCELLED: { label: 'Annulée', variant: 'secondary', icon: 'bi-ban' },
};

/** Valeurs ordonnées des statuts de transactions (filtres, selects). */
export const TRANSACTION_STATUS_VALUES = Object.keys(TRANSACTION_STATUSES);

/** Sens d'une opération (entrée / sortie d'argent). */
export const TRANSACTION_DIRECTIONS = {
  IN: { key: 'in', label: 'Entrée', icon: 'bi-arrow-down-circle', variant: 'success' },
  OUT: { key: 'out', label: 'Sortie', icon: 'bi-arrow-up-circle', variant: 'danger' },
};

export const TRANSACTION_DIRECTION_VALUES = [TRANSACTION_DIRECTIONS.IN.key, TRANSACTION_DIRECTIONS.OUT.key];

/** Présets de période (filtre historique + évolution). */
export const TRANSACTION_PERIODS = [
  { value: 'today', label: "Aujourd'hui", days: 1 },
  { value: '7d', label: '7 derniers jours', days: 7 },
  { value: '30d', label: '30 derniers jours', days: 30 },
  { value: '90d', label: '90 derniers jours', days: 90 },
  { value: 'custom', label: 'Personnalisée', days: 0 },
];

/** Préfixe des références de transaction (PROMPT 059). */
export const TRANSACTION_REFERENCE_PREFIX = 'TRX';

/** Pagination — paramètres par défaut de l'historique des transactions. */
export const DEFAULT_TRANSACTION_PAGE_SIZE = 10;

export const TRANSACTION_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const directionOfType = (value) => (['deposit', 'refund'].includes(value) ? 'in' : 'out');

/** Résout la configuration d'un type de transaction (fallback générique). */
export const getTransactionType = (value) =>
  TRANSACTION_TYPES[value] || {
    key: value,
    label: value,
    icon: 'bi-circle',
    variant: 'secondary',
    direction: directionOfType(value),
  };

/** Résout la configuration d'un statut de transaction (fallback générique). */
export const getTransactionStatus = (value) =>
  TRANSACTION_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/** Résout la configuration d'un sens d'opération (fallback générique). */
export const getTransactionDirection = (value) =>
  TRANSACTION_DIRECTIONS[value] || { key: value, label: value, icon: 'bi-circle', variant: 'secondary' };

/** Sens d'une transaction à partir de son type. */
export const transactionDirectionOf = (transaction) =>
  transaction.direction || directionOfType(transaction.type);

/** Une transaction clôturée (COMPLETED) modifie le solde. */
export const isTransactionEffective = (transaction) => transaction.status === 'success';

/** Finances — espaces autorisés (règle projet). Le Chauffeur n'y figure pas. */
export const FINANCIAL_SPACES = ['super_admin', 'client_enterprise', 'partner'];
