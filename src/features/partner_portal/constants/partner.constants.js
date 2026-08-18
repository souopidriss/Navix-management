/**
 * Navix Partner Portal — Constantes métier de l'Espace Partenaire
 * --------------------------------------------------------------------------
 * Source unique de vérité de l'Espace Partenaire : identité multi-tenant
 * (companyId / partnerId), statuts de missions partenaire, libellés de
 * l'espace, et réexport du modèle financier FCFA partagé avec l'espace
 * Client (PROMPT 059) — réutilisé ici, jamais dupliqué.
 *
 * Le modèle financier (TRANSACTION_TYPES, TRANSACTION_STATUSES,
 * TRANSACTION_DIRECTIONS, WALLET_STATUSES, getTransaction*...) est commun :
 * partenaire et client évoluent dans le même référentiel FCFA (XAF).
 * Le Chauffeur ne figure pas dans FINANCIAL_SPACES : aucun accès financier.
 */
import {
  DEFAULT_CURRENCY,
  FCFA_LABEL,
  WALLET_STATUSES,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_VALUES,
  TRANSACTION_STATUSES,
  TRANSACTION_STATUS_VALUES,
  TRANSACTION_DIRECTIONS,
  TRANSACTION_DIRECTION_VALUES,
  TRANSACTION_PERIODS,
  TRANSACTION_REFERENCE_PREFIX,
  DEFAULT_TRANSACTION_PAGE_SIZE,
  TRANSACTION_PAGE_SIZE_OPTIONS,
  getTransactionType,
  getTransactionStatus,
  getTransactionDirection,
  transactionDirectionOf,
  isTransactionEffective,
  FINANCIAL_SPACES,
} from '@/features/client/constants/client.constants';

export {
  DEFAULT_CURRENCY,
  FCFA_LABEL,
  WALLET_STATUSES,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_VALUES,
  TRANSACTION_STATUSES,
  TRANSACTION_STATUS_VALUES,
  TRANSACTION_DIRECTIONS,
  TRANSACTION_DIRECTION_VALUES,
  TRANSACTION_PERIODS,
  TRANSACTION_REFERENCE_PREFIX,
  DEFAULT_TRANSACTION_PAGE_SIZE,
  TRANSACTION_PAGE_SIZE_OPTIONS,
  getTransactionType,
  getTransactionStatus,
  getTransactionDirection,
  transactionDirectionOf,
  isTransactionEffective,
  FINANCIAL_SPACES,
};

/** Libellés de l'Espace Partenaire. */
export const PARTNER_LABEL = 'Espace Partenaire';
export const PARTNER_WALLET_LABEL = 'Fonds Partenaire';
export const PARTNER_ROLE_LABEL = 'Partenaire';

/** Identité multi-tenant de l'entreprise partenaire de démonstration. */
export const PARTNER_COMPANY_ID = 'cmp_partner_navix';
export const PARTNER_WALLET_ID = 'wal_partner_navix';

/** Limites d'affichage (dashboard partenaire). */
export const PARTNER_ACTIVITY_LIMIT = 6;
export const PARTNER_ALERT_LIMIT = 5;
export const PARTNER_TOP_LIMIT = 4;
export const PARTNER_TREND_MONTHS = 6;

/**
 * Statuts des missions de l'Espace Partenaire (PROMPT 064).
 * Planifiée → bleu, En cours → cyan, Terminée → vert, Annulée → rouge.
 */
export const PARTNER_MISSION_STATUSES = {
  scheduled: { label: 'Planifiée', variant: 'primary', icon: 'bi-calendar-check' },
  in_progress: { label: 'En cours', variant: 'info', icon: 'bi-play-circle' },
  completed: { label: 'Terminée', variant: 'success', icon: 'bi-check2-circle' },
  cancelled: { label: 'Annulée', variant: 'danger', icon: 'bi-x-circle' },
};

export const PARTNER_MISSION_STATUS_VALUES = Object.keys(PARTNER_MISSION_STATUSES);

/** Résout la configuration d'un statut de mission partenaire (fallback). */
export const getPartnerMissionStatus = (value) =>
  PARTNER_MISSION_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/**
 * Graphe des transitions de statut métier des missions partenaire (PROMPT 064).
 * Une mission planifiée démarre (en cours) ou s'annule ; une mission en cours
 * se termine ou s'annule. Les statuts terminés sont définitifs.
 */
export const PARTNER_MISSION_STATUS_TRANSITIONS = {
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/** Statuts atteignables depuis un statut donné (liste vide si aucun). */
export const getNextPartnerMissionStatuses = (status) => PARTNER_MISSION_STATUS_TRANSITIONS[status] ?? [];

/** Types de prestations des missions partenaire (PROMPT 064). */
export const PARTNER_MISSION_TYPES = {
  transport: { label: 'Transport', icon: 'bi-truck' },
  livraison: { label: 'Livraison', icon: 'bi-box-seam' },
  disponibilite: { label: 'Mise à disposition', icon: 'bi-person-check' },
  transfert: { label: 'Transfert', icon: 'bi-arrow-left-right' },
  location: { label: 'Location', icon: 'bi-sign-turn-right' },
  autre: { label: 'Autre', icon: 'bi-grid' },
};

export const PARTNER_MISSION_TYPE_VALUES = Object.keys(PARTNER_MISSION_TYPES);

/** Résout la configuration d'un type de mission partenaire (fallback). */
export const getPartnerMissionType = (value) =>
  PARTNER_MISSION_TYPES[value] || { label: value ?? 'Autre', icon: 'bi-grid' };

/** Périodes de filtre des missions partenaire (PROMPT 064). */
export const PARTNER_MISSION_PERIODS = {
  today: { label: "Aujourd'hui" },
  week: { label: 'Cette semaine' },
  month: { label: 'Ce mois' },
  quarter: { label: 'Ce trimestre' },
  custom: { label: 'Personnalisée' },
};

export const PARTNER_MISSION_PERIOD_VALUES = Object.keys(PARTNER_MISSION_PERIODS);

/** Résout la configuration d'une période de mission partenaire (fallback). */
export const getPartnerMissionPeriod = (value) =>
  PARTNER_MISSION_PERIODS[value] || { label: value ?? 'Personnalisée' };

/** Pagination des missions partenaire (PROMPT 064 — 5/10/25). */
export const DEFAULT_PARTNER_MISSION_PAGE_SIZE = 10;
export const PARTNER_MISSION_PAGE_SIZE_OPTIONS = [5, 10, 25];

/** Types de véhicules de la flotte partenaire (PROMPT 063). */
export const PARTNER_VEHICLE_TYPES = {
  berline: { label: 'Berline', icon: 'bi-car-front' },
  suv: { label: 'SUV', icon: 'bi-car-front' },
  pickup: { label: 'Pick-up', icon: 'bi-truck' },
  fourgon: { label: 'Fourgon', icon: 'bi-truck' },
  camion: { label: 'Camion', icon: 'bi-truck-front' },
  minibus: { label: 'Minibus', icon: 'bi-bus-front' },
  moto: { label: 'Moto', icon: 'bi-bicycle' },
  autre: { label: 'Autre', icon: 'bi-truck-flatbed' },
};

export const PARTNER_VEHICLE_TYPE_VALUES = Object.keys(PARTNER_VEHICLE_TYPES);

/** Résout la configuration d'un type de véhicule partenaire (fallback). */
export const getPartnerVehicleType = (value) =>
  PARTNER_VEHICLE_TYPES[value] || { label: value ?? 'Autre', icon: 'bi-truck' };

/** Agences de la flotte partenaire (réseau Cameroun). */
export const PARTNER_AGENCIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Garoua'];

/**
 * Graphe des transitions de statut métier de la flotte partenaire (PROMPT 063).
 * L'action « Mettre en maintenance » est disponible pour tout véhicule non
 * déjà en maintenance (y compris en mission — panne / immobilisation) ; un
 * véhicule en maintenance ne reçoit jamais cette action (gère la règle
 * d'affichage de la page via getNextPartnerVehicleStatuses).
 */
export const PARTNER_VEHICLE_STATUS_TRANSITIONS = {
  available: ['in_use', 'maintenance'],
  in_use: ['available', 'maintenance'],
  maintenance: ['available', 'out_of_service'],
  out_of_service: ['available'],
};

/** Statuts atteignables depuis un statut donné (liste vide si aucun). */
export const getNextPartnerVehicleStatuses = (status) => PARTNER_VEHICLE_STATUS_TRANSITIONS[status] ?? [];

/** Pagination de la flotte partenaire (PROMPT 063 — 10/25/50). */
export const DEFAULT_PARTNER_VEHICLE_PAGE_SIZE = 10;
export const PARTNER_VEHICLE_PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Statuts des clients de l'Espace Partenaire (PROMPT 065).
 * Actif → vert, Inactif → neutre, Archivé → sombre. L'archivage est une
 * désactivation douce : les données ne sont jamais supprimées définitivement.
 */
export const PARTNER_CLIENT_STATUSES = {
  active: { label: 'Actif', variant: 'success', icon: 'bi-check-circle' },
  inactive: { label: 'Inactif', variant: 'secondary', icon: 'bi-pause-circle' },
  archived: { label: 'Archivé', variant: 'dark', icon: 'bi-archive' },
};

export const PARTNER_CLIENT_STATUS_VALUES = Object.keys(PARTNER_CLIENT_STATUSES);

/** Résout la configuration d'un statut de client partenaire (fallback). */
export const getPartnerClientStatus = (value) =>
  PARTNER_CLIENT_STATUSES[value] || { label: value ?? 'Inconnu', variant: 'secondary', icon: 'bi-question-circle' };

/** Types de clients de l'Espace Partenaire (PROMPT 065). */
export const PARTNER_CLIENT_TYPES = {
  entreprise: { label: 'Entreprise', icon: 'bi-building' },
  particulier: { label: 'Particulier', icon: 'bi-person' },
};

export const PARTNER_CLIENT_TYPE_VALUES = Object.keys(PARTNER_CLIENT_TYPES);

/** Résout la configuration d'un type de client partenaire (fallback). */
export const getPartnerClientType = (value) =>
  PARTNER_CLIENT_TYPES[value] || { label: value ?? 'Entreprise', icon: 'bi-building' };

/** Villes du réseau partenaire (filtre Ville du module Clients — PROMPT 065). */
export const PARTNER_CLIENT_CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Garoua', 'Limbe'];

/** Pagination des clients partenaire (PROMPT 065 — 10/25/50). */
export const DEFAULT_PARTNER_CLIENT_PAGE_SIZE = 10;
export const PARTNER_CLIENT_PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Statuts d'expiration des documents partenaire (PROMPT 066).
 * Valide → vert, Expire bientôt → orange, Expiré → rouge, En attente → info.
 */
export const PARTNER_DOCUMENT_STATUSES = {
  valid: { label: 'Valide', variant: 'success', icon: 'bi-check2-circle' },
  expiring: { label: 'Expire bientôt', variant: 'warning', icon: 'bi-clock-history' },
  expired: { label: 'Expiré', variant: 'danger', icon: 'bi-x-octagon' },
  pending: { label: 'En attente', variant: 'info', icon: 'bi-hourglass-split' },
};

export const PARTNER_DOCUMENT_STATUS_VALUES = Object.keys(PARTNER_DOCUMENT_STATUSES);

/** Résout la configuration d'un statut de document partenaire (fallback). */
export const getPartnerDocumentStatus = (value) =>
  PARTNER_DOCUMENT_STATUSES[value] || { label: value ?? 'Inconnu', variant: 'secondary', icon: 'bi-file-earmark' };

/** Fenêtre « expire bientôt » : un document dont l'échéance est ≤ 30 jours. */
export const PARTNER_DOCUMENT_EXPIRY_WINDOW_DAYS = 30;

/** Millisecondes par jour (calcul d'expiration). */
export const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Types de documents partenaire (filtre « Type de document », PROMPT 066).
 * Administratif / Véhicule / Client / Mission / Financier / Contractuel / Autre.
 */
export const PARTNER_DOCUMENT_CATEGORIES = {
  administratif: { label: 'Administratif', icon: 'bi-briefcase', variant: 'primary' },
  vehicule: { label: 'Véhicule', icon: 'bi-truck', variant: 'info' },
  client: { label: 'Client', icon: 'bi-people', variant: 'success' },
  mission: { label: 'Mission', icon: 'bi-signpost-split', variant: 'secondary' },
  financier: { label: 'Financier', icon: 'bi-cash-stack', variant: 'warning' },
  contractuel: { label: 'Contractuel', icon: 'bi-file-earmark-text', variant: 'dark' },
  autre: { label: 'Autre', icon: 'bi-folder', variant: 'secondary' },
};

export const PARTNER_DOCUMENT_CATEGORY_VALUES = Object.keys(PARTNER_DOCUMENT_CATEGORIES);

/** Résout la configuration d'un type de document partenaire (fallback). */
export const getPartnerDocumentCategory = (value) =>
  PARTNER_DOCUMENT_CATEGORIES[value] || { label: value ?? 'Autre', icon: 'bi-file-earmark', variant: 'secondary' };

/**
 * Entités liées aux documents partenaire (filtre « Entité », PROMPT 066).
 * Le libellé d'entité est résolu dans le mock / le service (jamais côté UI).
 */
export const PARTNER_DOCUMENT_ENTITY_TYPES = {
  vehicle: { label: 'Véhicules', icon: 'bi-truck', variant: 'info' },
  client: { label: 'Clients', icon: 'bi-people', variant: 'success' },
  mission: { label: 'Missions', icon: 'bi-signpost-split', variant: 'secondary' },
  company: { label: 'Entreprise', icon: 'bi-buildings', variant: 'primary' },
};

export const PARTNER_DOCUMENT_ENTITY_VALUES = Object.keys(PARTNER_DOCUMENT_ENTITY_TYPES);

/** Résout la configuration d'un type d'entité de document (fallback). */
export const getPartnerDocumentEntity = (value) =>
  PARTNER_DOCUMENT_ENTITY_TYPES[value] || { label: value ?? '—', icon: 'bi-link', variant: 'secondary' };

/**
 * Périodes du filtre « Date d'ajout » (PROMPT 066).
 * Toutes / Aujourd'hui / 7 derniers jours / 30 derniers jours / Personnalisée.
 */
export const PARTNER_DOCUMENT_DATE_FILTERS = {
  today: { label: "Aujourd'hui" },
  week: { label: '7 derniers jours' },
  month: { label: '30 derniers jours' },
  custom: { label: 'Personnalisée' },
};

export const PARTNER_DOCUMENT_DATE_FILTER_VALUES = Object.keys(PARTNER_DOCUMENT_DATE_FILTERS);

/** Pagination des documents partenaire (PROMPT 066 — 10/25/50). */
export const DEFAULT_PARTNER_DOCUMENT_PAGE_SIZE = 10;
export const PARTNER_DOCUMENT_PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Espace de stockage partenaire (valeur de démonstration PROMPT 066 §5).
 * 1,8 Go affichés — le backend de stockage n'existe pas encore.
 */
export const PARTNER_DOCUMENT_DEMO_STORAGE_BYTES = Math.round(1.8 * 1024 * 1024 * 1024);

/**
 * Calcule le statut d'expiration d'un document depuis sa date d'expiration.
 *  - échéance passée         → 'expired'
 *  - échéance dans ≤ 30 jours → 'expiring'
 *  - sinon                   → 'valid'
 * Retourne null si la date est absente ou invalide (pas de statut calculable).
 * @param {string} expiresAt — date ISO ou 'YYYY-MM-DD'
 * @returns {'valid'|'expiring'|'expired'|null}
 */
export const getPartnerDocumentExpiryStatus = (expiresAt) => {
  if (!expiresAt) return null;
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return null;
  const now = Date.now();
  if (expiry < now) return 'expired';
  const remainingDays = Math.ceil((expiry - now) / DAY_IN_MS);
  if (remainingDays <= PARTNER_DOCUMENT_EXPIRY_WINDOW_DAYS) return 'expiring';
  return 'valid';
};

/**
 * Jours restants avant expiration (positif) ou depuis (négatif).
 * Retourne null si la date est absente ou invalide.
 * @param {string} expiresAt — date ISO ou 'YYYY-MM-DD'
 * @returns {number|null}
 */
export const getPartnerDocumentDaysLeft = (expiresAt) => {
  if (!expiresAt) return null;
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return null;
  return Math.ceil((expiry - Date.now()) / DAY_IN_MS);
};

/** Rôle Partenaire — identité multi-tenant du tenant de démonstration. */
export const PARTNER_PARTNER_ID = 'ptr_partner_tec';

/**
 * Types de notifications partenaire (filtre « Type », PROMPT 067).
 * Tous / Missions / Véhicules / Documents / Clients / Finance / Maintenance / Système.
 */
export const PARTNER_NOTIFICATION_TYPES = {
  mission: { label: 'Missions', icon: 'bi-signpost-split', variant: 'info' },
  vehicle: { label: 'Véhicules', icon: 'bi-truck', variant: 'primary' },
  document: { label: 'Documents', icon: 'bi-folder2-open', variant: 'warning' },
  client: { label: 'Clients', icon: 'bi-people', variant: 'success' },
  finance: { label: 'Finance', icon: 'bi-wallet2', variant: 'success' },
  maintenance: { label: 'Maintenance', icon: 'bi-wrench-adjustable', variant: 'info' },
  system: { label: 'Système', icon: 'bi-cpu', variant: 'dark' },
};

export const PARTNER_NOTIFICATION_TYPE_VALUES = Object.keys(PARTNER_NOTIFICATION_TYPES);

export const getPartnerNotificationType = (value) =>
  PARTNER_NOTIFICATION_TYPES[value] || { label: value ?? 'Autre', icon: 'bi-bell', variant: 'secondary' };

/**
 * Priorités de notifications partenaire (filtre « Priorité », PROMPT 067).
 * Toutes / Normale / Importante / Urgente.
 */
export const PARTNER_NOTIFICATION_SEVERITIES = {
  normal: { label: 'Normale', variant: 'secondary', icon: 'bi-circle' },
  important: { label: 'Importante', variant: 'warning', icon: 'bi-exclamation-diamond' },
  urgent: { label: 'Urgente', variant: 'danger', icon: 'bi-exclamation-octagon' },
};

export const PARTNER_NOTIFICATION_SEVERITY_VALUES = Object.keys(PARTNER_NOTIFICATION_SEVERITIES);

export const getPartnerNotificationSeverity = (value) =>
  PARTNER_NOTIFICATION_SEVERITIES[value] || { label: value ?? 'Normale', variant: 'secondary', icon: 'bi-circle' };

/**
 * Filtres de statut pour les notifications partenaire (PROMPT 067).
 */
export const PARTNER_NOTIFICATION_STATUS_FILTERS = {
  all: { label: 'Toutes' },
  unread: { label: 'Non lues' },
  read: { label: 'Lues' },
};

export const PARTNER_NOTIFICATION_STATUS_FILTER_VALUES = Object.keys(PARTNER_NOTIFICATION_STATUS_FILTERS);

/**
 * Filtres de période pour les notifications partenaire (PROMPT 067).
 * Toutes / Aujourd'hui / 7 derniers jours / 30 derniers jours.
 */
export const PARTNER_NOTIFICATION_PERIOD_FILTERS = {
  all: { label: 'Toutes' },
  today: { label: "Aujourd'hui" },
  last7: { label: '7 derniers jours' },
  last30: { label: '30 derniers jours' },
};

export const PARTNER_NOTIFICATION_PERIOD_FILTER_VALUES = Object.keys(PARTNER_NOTIFICATION_PERIOD_FILTERS);

/**
 * Types d'activités partenaire (timeline, PROMPT 067).
 */
export const PARTNER_ACTIVITY_TYPES = {
  mission_completed: { label: 'Mission terminée', icon: 'bi-check2-circle', variant: 'success' },
  mission_cancelled: { label: 'Mission annulée', icon: 'bi-x-circle', variant: 'danger' },
  mission_started: { label: 'Mission démarrée', icon: 'bi-play-circle', variant: 'info' },
  vehicle_added: { label: 'Véhicule ajouté', icon: 'bi-plus-circle', variant: 'primary' },
  vehicle_modified: { label: 'Véhicule modifié', icon: 'bi-pencil', variant: 'info' },
  vehicle_available: { label: 'Véhicule disponible', icon: 'bi-check-circle', variant: 'success' },
  vehicle_maintenance: { label: 'Entretien effectué', icon: 'bi-wrench', variant: 'info' },
  document_added: { label: 'Document ajouté', icon: 'bi-file-earmark-plus', variant: 'primary' },
  document_renewed: { label: 'Document renouvelé', icon: 'bi-arrow-repeat', variant: 'success' },
  client_created: { label: 'Client créé', icon: 'bi-person-plus', variant: 'success' },
  client_updated: { label: 'Client modifié', icon: 'bi-pencil-square', variant: 'info' },
  finance_payment: { label: 'Paiement enregistré', icon: 'bi-cash-coin', variant: 'success' },
  finance_deposit: { label: 'Dépôt effectué', icon: 'bi-arrow-down-circle', variant: 'success' },
  finance_transfer: { label: 'Transfert effectué', icon: 'bi-arrow-left-right', variant: 'info' },
};

export const PARTNER_ACTIVITY_TYPE_VALUES = Object.keys(PARTNER_ACTIVITY_TYPES);

export const getPartnerActivityType = (value) =>
  PARTNER_ACTIVITY_TYPES[value] || { label: value ?? 'Activité', icon: 'bi-circle', variant: 'secondary' };

/**
 * Pagination des notifications partenaire (PROMPT 067 — 8/16/32).
 */
export const DEFAULT_PARTNER_NOTIFICATION_PAGE_SIZE = 8;
export const PARTNER_NOTIFICATION_PAGE_SIZE_OPTIONS = [8, 16, 32];

/* ══════════════════════════════════════════════════════════════════════════
   REVENUS & COMMISSIONS (PROMPT 070)
   Statuts, périodes, taux de commission, pagination.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Statuts des revenus partenaire :
 *   pending    — prestation en cours, revenu non encore confirmé
 *   validated  — prestation terminée, revenu validé, en attente de paiement
 *   paid       — revenu effectivement versé (transaction associée)
 *   cancelled  — annulé (prestation annulée)
 */
export const PARTNER_REVENUE_STATUSES = {
  pending: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  validated: { label: 'Validé', variant: 'info', icon: 'bi-check-circle' },
  paid: { label: 'Payé', variant: 'success', icon: 'bi-cash-stack' },
  cancelled: { label: 'Annulé', variant: 'danger', icon: 'bi-x-circle' },
};

export const PARTNER_REVENUE_STATUS_VALUES = Object.keys(PARTNER_REVENUE_STATUSES);

export const getPartnerRevenueStatus = (value) =>
  PARTNER_REVENUE_STATUSES[value] || { label: value ?? 'Inconnu', variant: 'secondary', icon: 'bi-circle' };

/**
 * Périodes de filtre des revenus (PROMPT 070 §7).
 */
export const PARTNER_REVENUE_PERIODS = {
  today: { label: "Aujourd'hui", days: 1 },
  last7: { label: '7 derniers jours', days: 7 },
  month: { label: 'Ce mois', days: 30 },
  lastMonth: { label: 'Mois précédent', days: 60 },
  last3: { label: '3 derniers mois', days: 90 },
  last6: { label: '6 derniers mois', days: 180 },
  year: { label: 'Année', days: 365 },
  custom: { label: 'Personnalisée', days: null },
};

export const PARTNER_REVENUE_PERIOD_VALUES = Object.keys(PARTNER_REVENUE_PERIODS);

export const getPartnerRevenuePeriod = (value) =>
  PARTNER_REVENUE_PERIODS[value] || { label: value ?? 'Personnalisée', days: null };

/**
 * Taux de commission par défaut (PROMPT 070 §14).
 * 10 % — utilisé comme constante de démonstration.
 * Le backend pourra fournir une règle dynamique.
 */
export const PARTNER_DEFAULT_COMMISSION_RATE = 0.10;

/**
 * Calcul centralisé du revenu net (PROMPT 070 §15).
 * REVENU NET = MONTANT BRUT - COMMISSION
 */
export const computeNetAmount = (grossAmount, rate = PARTNER_DEFAULT_COMMISSION_RATE) => {
  const gross = Number(grossAmount) || 0;
  const commission = Math.round(gross * rate);
  return { commission, net: gross - commission };
};

/** Pagination des revenus partenaire (PROMPT 070 — 10/25/50). */
export const DEFAULT_PARTNER_REVENUE_PAGE_SIZE = 10;
export const PARTNER_REVENUE_PAGE_SIZE_OPTIONS = [10, 25, 50];

/* ══════════════════════════════════════════════════════════════════════════
   FACTURATION & PAIEMENTS (PROMPT 071)
   Statuts facture, statuts paiement, moyens de paiement, périodes, taxes.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Statuts des factures partenaire :
 *   draft    — brouillon, non émise
 *   issued   — émise, en attente de paiement
 *   pending  — paiement en cours
 *   paid     — intégralement payée
 *   overdue  — échéance dépassée, non payée
 *   cancelled — annulée
 */
export const PARTNER_INVOICE_STATUSES = {
  draft: { label: 'Brouillon', variant: 'secondary', icon: 'bi-file-earmark' },
  issued: { label: 'Émise', variant: 'info', icon: 'bi-send' },
  pending: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  paid: { label: 'Payée', variant: 'success', icon: 'bi-check-circle' },
  overdue: { label: 'En retard', variant: 'danger', icon: 'bi-exclamation-triangle' },
  cancelled: { label: 'Annulée', variant: 'secondary', icon: 'bi-x-circle' },
};

export const PARTNER_INVOICE_STATUS_VALUES = Object.keys(PARTNER_INVOICE_STATUSES);

export const getPartnerInvoiceStatus = (value) =>
  PARTNER_INVOICE_STATUSES[value] || { label: value ?? 'Inconnu', variant: 'secondary', icon: 'bi-circle' };

/**
 * Statuts de paiement d'une facture partenaire :
 *   none      — aucun paiement enregistré
 *   pending   — paiement initié, en attente de confirmation
 *   confirmed — paiement confirmé
 *   failed    — paiement échoué
 */
export const PARTNER_PAYMENT_STATUSES = {
  none: { label: 'Non payé', variant: 'secondary', icon: 'bi-x-circle' },
  pending: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  confirmed: { label: 'Confirmé', variant: 'success', icon: 'bi-check-circle' },
  failed: { label: 'Échoué', variant: 'danger', icon: 'bi-x-octagon' },
};

export const PARTNER_PAYMENT_STATUS_VALUES = Object.keys(PARTNER_PAYMENT_STATUSES);

export const getPartnerPaymentStatus = (value) =>
  PARTNER_PAYMENT_STATUSES[value] || { label: value ?? 'Inconnu', variant: 'secondary', icon: 'bi-circle' };

/**
 * Moyens de paiement (simulés — aucun traitement réel).
 * Réutilise le référentiel billing existant quand disponible.
 */
export const PARTNER_PAYMENT_METHODS = {
  bank_transfer: { label: 'Virement bancaire', icon: 'bi-bank' },
  mobile_money: { label: 'Mobile Money', icon: 'bi-phone' },
  card: { label: 'Carte bancaire', icon: 'bi-credit-card' },
  wallet: { label: 'Portefeuille Navix', icon: 'bi-wallet2' },
};

export const PARTNER_PAYMENT_METHOD_VALUES = Object.keys(PARTNER_PAYMENT_METHODS);

export const getPartnerPaymentMethod = (value) =>
  PARTNER_PAYMENT_METHODS[value] || { label: value ?? 'Inconnu', icon: 'bi-circle' };

/** Préfixe de référence facture partenaire : FAC-P- */
export const PARTNER_INVOICE_PREFIX = 'FAC-P';

/** Taux de TVA par défaut (0 % — pas de TVA simulée sauf si le backend l'exige). */
export const PARTNER_DEFAULT_TAX_RATE = 0;

/** Délai de paiement par défaut en jours (émission → échéance). */
export const PARTNER_DEFAULT_PAYMENT_TERMS_DAYS = 15;

/**
 * Périodes de filtre des factures.
 */
export const PARTNER_INVOICE_PERIODS = {
  today: { label: "Aujourd'hui", days: 1 },
  last7: { label: '7 derniers jours', days: 7 },
  month: { label: 'Ce mois', days: 30 },
  lastMonth: { label: 'Mois précédent', days: 60 },
  last3: { label: '3 derniers mois', days: 90 },
  custom: { label: 'Personnalisée', days: null },
};

export const PARTNER_INVOICE_PERIOD_VALUES = Object.keys(PARTNER_INVOICE_PERIODS);

export const getPartnerInvoicePeriod = (value) =>
  PARTNER_INVOICE_PERIODS[value] || { label: value ?? 'Personnalisée', days: null };

/** Pagination des factures partenaire (PROMPT 071 — 10/25/50). */
export const DEFAULT_PARTNER_INVOICE_PAGE_SIZE = 10;
export const PARTNER_INVOICE_PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Détermine si une facture est en retard (PROMPT 071 §25).
 * Une facture est en retard lorsque la date d'échéance est dépassée
 * ET que le statut n'est ni 'paid' ni 'cancelled'.
 */
export const isInvoiceOverdue = (dueDate, status) => {
  if (status === 'paid' || status === 'cancelled' || status === 'draft') return false;
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
};

/**
 * Nombre de jours restants avant échéance (positif) ou depuis (négatif).
 * Retourne null si la date est absente ou invalide.
 */
export const getInvoiceDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const due = new Date(dueDate).getTime();
  if (Number.isNaN(due)) return null;
  return Math.ceil((due - Date.now()) / (24 * 60 * 60 * 1000));
};

/**
 * Calcule le montant total TTC d'une facture (PROMPT 071 §17).
 * NET = BRUT - COMMISSION ; TOTAL = NET + TAXE
 */
export const computeInvoiceTotal = (grossAmount, commissionRate = PARTNER_DEFAULT_COMMISSION_RATE, taxRate = PARTNER_DEFAULT_TAX_RATE) => {
  const gross = Number(grossAmount) || 0;
  const commission = Math.round(gross * commissionRate);
  const net = gross - commission;
  const tax = Math.round(net * taxRate);
  return { commission, net, tax, total: net + tax };
};

/* ══════════════════════════════════════════════════════════════════════════
   DEMANDES & COMMANDES (PROMPT 072)
   Statuts, types, priorités, pagination.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Statuts des demandes partenaire :
 *   pending    — nouvelle demande reçue
 *   reviewing  — en cours d'examen
 *   accepted   — acceptée par le partenaire
 *   rejected   — refusée par le partenaire
 *   cancelled  — annulée par le client
 *   converted  — convertie en mission
 */
export const PARTNER_REQUEST_STATUSES = {
  pending: { label: 'Nouvelle', variant: 'primary', icon: 'bi-envelope-plus' },
  reviewing: { label: 'En cours', variant: 'info', icon: 'bi-eye' },
  accepted: { label: 'Acceptée', variant: 'success', icon: 'bi-check-circle' },
  rejected: { label: 'Refusée', variant: 'danger', icon: 'bi-x-circle' },
  cancelled: { label: 'Annulée', variant: 'secondary', icon: 'bi-slash-circle' },
  converted: { label: 'Convertie', variant: 'dark', icon: 'bi-arrow-right-circle' },
};

export const PARTNER_REQUEST_STATUS_VALUES = Object.keys(PARTNER_REQUEST_STATUSES);

export const getPartnerRequestStatus = (value) =>
  PARTNER_REQUEST_STATUSES[value] || { label: value ?? 'Inconnu', variant: 'secondary', icon: 'bi-circle' };

/**
 * Types de demandes partenaire (réutilise les types de mission existants).
 */
export const PARTNER_REQUEST_TYPES = {
  transport: { label: 'Transport', icon: 'bi-truck' },
  livraison: { label: 'Livraison', icon: 'bi-box-seam' },
  disponibilite: { label: 'Mise à disposition', icon: 'bi-person-check' },
  transfert: { label: 'Transfert', icon: 'bi-arrow-left-right' },
  location: { label: 'Location', icon: 'bi-sign-turn-right' },
  autre: { label: 'Autre', icon: 'bi-grid' },
};

export const PARTNER_REQUEST_TYPE_VALUES = Object.keys(PARTNER_REQUEST_TYPES);

export const getPartnerRequestType = (value) =>
  PARTNER_REQUEST_TYPES[value] || { label: value ?? 'Autre', icon: 'bi-grid' };

/**
 * Priorités des demandes partenaire.
 */
export const PARTNER_REQUEST_PRIORITIES = {
  low: { label: 'Basse', variant: 'secondary', icon: 'bi-arrow-down' },
  medium: { label: 'Moyenne', variant: 'info', icon: 'bi-dash' },
  high: { label: 'Haute', variant: 'warning', icon: 'bi-arrow-up' },
  urgent: { label: 'Urgente', variant: 'danger', icon: 'bi-lightning' },
};

export const PARTNER_REQUEST_PRIORITY_VALUES = Object.keys(PARTNER_REQUEST_PRIORITIES);

export const getPartnerRequestPriority = (value) =>
  PARTNER_REQUEST_PRIORITIES[value] || { label: value ?? 'Moyenne', variant: 'info', icon: 'bi-dash' };

/**
 * Motifs de refus (PROMPT 072 §15).
 */
export const PARTNER_REQUEST_REJECTION_REASONS = [
  'Véhicule indisponible',
  'Capacité insuffisante',
  'Demande hors périmètre',
  'Zone non desservie',
  'Autre',
];

/**
 * Périodes de filtre des demandes.
 */
export const PARTNER_REQUEST_PERIODS = {
  today: { label: "Aujourd'hui", days: 1 },
  last7: { label: '7 derniers jours', days: 7 },
  month: { label: 'Ce mois', days: 30 },
  lastMonth: { label: 'Mois précédent', days: 60 },
  last3: { label: '3 derniers mois', days: 90 },
  custom: { label: 'Personnalisée', days: null },
};

export const PARTNER_REQUEST_PERIOD_VALUES = Object.keys(PARTNER_REQUEST_PERIODS);

export const getPartnerRequestPeriod = (value) =>
  PARTNER_REQUEST_PERIODS[value] || { label: value ?? 'Personnalisée', days: null };

/** Pagination des demandes partenaire (PROMPT 072 — 10/25/50). */
export const DEFAULT_PARTNER_REQUEST_PAGE_SIZE = 10;
export const PARTNER_REQUEST_PAGE_SIZE_OPTIONS = [10, 25, 50];

// ─── Contrats & Engagements (PROMPT 073) ───────────────────────────────

/** Statuts de contrat partenaire. */
export const PARTNER_CONTRACT_STATUSES = {
  active: { label: 'Actif', variant: 'success', icon: 'bi-check-circle-fill' },
  pending: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  expiring: { label: 'Expiration proche', variant: 'warning', icon: 'bi-exclamation-triangle-fill' },
  expired: { label: 'Expiré', variant: 'danger', icon: 'bi-x-circle-fill' },
  terminated: { label: 'Résilié', variant: 'danger', icon: 'bi-slash-circle-fill' },
  suspended: { label: 'Suspendu', variant: 'secondary', icon: 'bi-pause-circle-fill' },
};

export const PARTNER_CONTRACT_STATUS_KEYS = Object.keys(PARTNER_CONTRACT_STATUSES);

/** Types de contrat partenaire. */
export const PARTNER_CONTRACT_TYPES = {
  transport: { label: 'Transport', icon: 'bi-truck' },
  location: { label: 'Location', icon: 'bi-key-fill' },
  maintenance: { label: 'Maintenance', icon: 'bi-tools' },
  assurance: { label: 'Assurance', icon: 'bi-shield-check' },
  forfait: { label: 'Forfait', icon: 'bi-box-seam' },
  autre: { label: 'Autre', icon: 'bi-file-earmark' },
};

export const PARTNER_CONTRACT_TYPE_KEYS = Object.keys(PARTNER_CONTRACT_TYPES);

/** Catégories de contrat (réutilise client.constants CONTRACT_CATEGORIES). */
export const PARTNER_CONTRACT_CATEGORIES = {
  transport: { label: 'Transport', color: '#0d6efd' },
  location: { label: 'Location', color: '#198754' },
  maintenance: { label: 'Maintenance', color: '#fd7e14' },
  assurance: { label: 'Assurance', color: '#6f42c1' },
  autre: { label: 'Autre', color: '#6c757d' },
};

/** Fréquences de facturation. */
export const PARTNER_BILLING_FREQUENCIES = {
  monthly: { label: 'Mensuelle', months: 1 },
  quarterly: { label: 'Trimestrielle', months: 3 },
  semiannual: { label: 'Semestrielle', months: 6 },
  annual: { label: 'Annuelle', months: 12 },
  unique: { label: 'Unique', months: null },
};

export const PARTNER_BILLING_FREQUENCY_KEYS = Object.keys(PARTNER_BILLING_FREQUENCIES);

/** Jours d'alerte avant expiration. */
export const PARTNER_CONTRACT_EXPIRY_WARNING_DAYS = [7, 14, 30, 60, 90];

/** Pagination des contrats partenaire. */
export const DEFAULT_PARTNER_CONTRACT_PAGE_SIZE = 10;
export const PARTNER_CONTRACT_PAGE_SIZE_OPTIONS = [10, 25, 50];

/** Périodes de filtre des contrats. */
export const PARTNER_CONTRACT_PERIODS = {
  today: { label: "Aujourd'hui", days: 1 },
  last7: { label: '7 derniers jours', days: 7 },
  month: { label: 'Ce mois', days: 30 },
  lastMonth: { label: 'Mois précédent', days: 60 },
  last3: { label: '3 derniers mois', days: 90 },
  last6: { label: '6 derniers mois', days: 180 },
  year: { label: 'Cette année', days: 365 },
};

export const PARTNER_CONTRACT_PERIOD_KEYS = Object.keys(PARTNER_CONTRACT_PERIODS);

/**
 * État d'expiration d'un contrat.
 * Réutilise la logique de getExpiryStatus (vehicle.constants) adaptée aux contrats.
 * @param {string} startDate
 * @param {string} endDate
 * @returns {{ label: string, variant: string }}
 */
export const getPartnerContractExpiryStatus = (startDate, endDate) => {
  if (!endDate) return { label: 'Sans date de fin', variant: 'secondary' };

  const now = Date.now();
  const expiry = new Date(endDate).getTime();
  const inMs = (days) => days * 24 * 60 * 60 * 1000;

  if (Number.isNaN(expiry)) return { label: 'Date invalide', variant: 'secondary' };
  if (expiry < now) return { label: 'Expiré', variant: 'danger' };
  if (expiry - now < inMs(30)) return { label: 'Expiration proche', variant: 'warning' };
  if (expiry - now < inMs(90)) return { label: 'À surveiller', variant: 'info' };
  return { label: 'En règle', variant: 'success' };
};

/** Raisons de résiliation. */
export const PARTNER_CONTRACT_TERMINATION_REASONS = [
  'Fin de contrat',
  'Non-respect des conditions',
  'Demande client',
  'Problème de paiement',
  'Résiliation anticipée',
  'Autre',
];
