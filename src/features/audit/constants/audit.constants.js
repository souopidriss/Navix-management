/**
 * Navix Audit — Constantes métier du module Journal des actions
 * --------------------------------------------------------------------------
 * Source unique de vérité pour :
 *   - les actions (CREATE, UPDATE, PAYMENT, …)        → AUDIT_ACTIONS
 *   - les familles d'actions (crud, billing, security) → AUDIT_ACTION_TYPES
 *   - les ressources ciblées (vehicle, invoice, …)      → AUDIT_RESOURCES
 *   - les statuts (success, failed, warning, info)      → AUDIT_STATUSES
 *   - les sévérités (low, medium, high, critical)       → AUDIT_SEVERITIES
 *   - les périodes de filtrage (aujourd'hui, hier, …)   → AUDIT_PERIODS
 *   - les utilisateurs simulés (qui a agi)              → AUDIT_USERS
 *   - le tri, la pagination et le formatage des dates
 *
 * Aucune couleur codée en dur : variantes sémantiques qui mappent les tokens
 * CSS existants (--navix-* / --bs-*). Consommé par les composants, les
 * filtres, le store, le service et le mock.
 */

import {
  companyDetailPath,
  agencyDetailPath,
  vehicleDetailPath,
  driverDetailPath,
  assignmentDetailPath,
  tripDetailPath,
  fuelDetailPath,
  maintenanceDetailPath,
  documentDetailPath,
  subscriptionDetailPath,
  invoiceDetailPath,
  paymentDetailPath,
  notificationDetailPath,
} from '@/routes/route.constants';

/* --------------------------------------------------------------------------
   Actions (que s'est-il passé ?)
   -------------------------------------------------------------------------- */

export const AUDIT_ACTIONS = {
  CREATE: { label: 'Création', variant: 'success', icon: 'bi-plus-circle' },
  READ: { label: 'Lecture', variant: 'info', icon: 'bi-eye' },
  UPDATE: { label: 'Modification', variant: 'primary', icon: 'bi-pencil-square' },
  DELETE: { label: 'Suppression', variant: 'danger', icon: 'bi-trash3' },
  LOGIN: { label: 'Connexion', variant: 'primary', icon: 'bi-box-arrow-in-right' },
  LOGOUT: { label: 'Déconnexion', variant: 'secondary', icon: 'bi-box-arrow-right' },
  EXPORT: { label: 'Export', variant: 'info', icon: 'bi-download' },
  IMPORT: { label: 'Import', variant: 'warning', icon: 'bi-upload' },
  DOWNLOAD: { label: 'Téléchargement', variant: 'info', icon: 'bi-cloud-arrow-down' },
  UPLOAD: { label: 'Dépôt', variant: 'warning', icon: 'bi-cloud-arrow-up' },
  ASSIGN: { label: 'Affectation', variant: 'info', icon: 'bi-shuffle' },
  UNASSIGN: { label: 'Fin d’affectation', variant: 'secondary', icon: 'bi-shuffle' },
  ACTIVATE: { label: 'Activation', variant: 'success', icon: 'bi-toggle-on' },
  DEACTIVATE: { label: 'Désactivation', variant: 'warning', icon: 'bi-toggle-off' },
  APPROVE: { label: 'Validation', variant: 'success', icon: 'bi-check2-circle' },
  REJECT: { label: 'Rejet', variant: 'danger', icon: 'bi-x-circle' },
  ARCHIVE: { label: 'Archivage', variant: 'dark', icon: 'bi-archive' },
  RESTORE: { label: 'Restauration', variant: 'success', icon: 'bi-arrow-counterclockwise' },
  PAYMENT: { label: 'Paiement', variant: 'success', icon: 'bi-cash-coin' },
  REFUND: { label: 'Remboursement', variant: 'warning', icon: 'bi-cash' },
  SUBSCRIBE: { label: 'Souscription', variant: 'primary', icon: 'bi-credit-card' },
  UNSUBSCRIBE: { label: 'Résiliation', variant: 'secondary', icon: 'bi-credit-card' },
  UPGRADE: { label: 'Passage au plan supérieur', variant: 'primary', icon: 'bi-arrow-up-circle' },
  DOWNGRADE: { label: 'Passage au plan inférieur', variant: 'warning', icon: 'bi-arrow-down-circle' },
  SUSPEND: { label: 'Suspension', variant: 'danger', icon: 'bi-slash-circle' },
  PASSWORD_RESET: { label: 'Réinitialisation du mot de passe', variant: 'warning', icon: 'bi-key' },
  ROLE_CHANGED: { label: 'Changement de rôle', variant: 'danger', icon: 'bi-person-gear' },
  PERMISSION_CHANGED: { label: 'Changement de permission', variant: 'danger', icon: 'bi-shield-lock' },
  SETTINGS_CHANGED: { label: 'Modification des paramètres', variant: 'warning', icon: 'bi-gear' },
};

export const AUDIT_ACTION_VALUES = Object.keys(AUDIT_ACTIONS);

/** @returns {{ label, variant, icon }} méta d'une action (défauts sûrs). */
export const getAuditAction = (value) =>
  AUDIT_ACTIONS[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Familles d'actions (domaine métier)
   -------------------------------------------------------------------------- */

export const AUDIT_ACTION_TYPES = {
  authentication: { label: 'Authentification', variant: 'primary', icon: 'bi-shield-lock' },
  authorization: { label: 'Autorisation', variant: 'danger', icon: 'bi-shield-check' },
  crud: { label: 'CRUD', variant: 'info', icon: 'bi-pencil-square' },
  assignment: { label: 'Affectation', variant: 'info', icon: 'bi-shuffle' },
  maintenance: { label: 'Entretien', variant: 'warning', icon: 'bi-wrench-adjustable' },
  fuel: { label: 'Carburant', variant: 'warning', icon: 'bi-fuel-pump' },
  trip: { label: 'Trajet', variant: 'info', icon: 'bi-signpost-split' },
  document: { label: 'Document', variant: 'warning', icon: 'bi-file-earmark' },
  billing: { label: 'Facturation', variant: 'success', icon: 'bi-receipt' },
  subscription: { label: 'Abonnement', variant: 'primary', icon: 'bi-credit-card' },
  system: { label: 'Système', variant: 'secondary', icon: 'bi-cpu' },
  security: { label: 'Sécurité', variant: 'danger', icon: 'bi-shield-exclamation' },
};

export const AUDIT_ACTION_TYPE_VALUES = Object.keys(AUDIT_ACTION_TYPES);

/** @returns {{ label, variant, icon }} méta d'une famille (défauts sûrs). */
export const getAuditActionType = (value) =>
  AUDIT_ACTION_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Ressources (sur quoi l'action a-t-elle été effectuée ?)
   -------------------------------------------------------------------------- */

export const AUDIT_RESOURCES = {
  company: { label: 'Entreprise', icon: 'bi-buildings' },
  agency: { label: 'Agence', icon: 'bi-diagram-3' },
  vehicle: { label: 'Véhicule', icon: 'bi-truck' },
  driver: { label: 'Chauffeur', icon: 'bi-person-badge' },
  assignment: { label: 'Affectation', icon: 'bi-shuffle' },
  trip: { label: 'Trajet', icon: 'bi-signpost-split' },
  fuel: { label: 'Carburant', icon: 'bi-fuel-pump' },
  maintenance: { label: 'Entretien', icon: 'bi-wrench-adjustable' },
  document: { label: 'Document', icon: 'bi-file-earmark-text' },
  subscription: { label: 'Abonnement', icon: 'bi-credit-card' },
  invoice: { label: 'Facture', icon: 'bi-receipt' },
  payment: { label: 'Paiement', icon: 'bi-cash-coin' },
  user: { label: 'Utilisateur', icon: 'bi-person' },
  role: { label: 'Rôle', icon: 'bi-person-gear' },
  permission: { label: 'Permission', icon: 'bi-shield-lock' },
  notification: { label: 'Notification', icon: 'bi-bell' },
  report: { label: 'Rapport', icon: 'bi-file-earmark-bar-graph' },
  settings: { label: 'Paramètres', icon: 'bi-gear' },
};

export const AUDIT_RESOURCE_VALUES = Object.keys(AUDIT_RESOURCES);

/** @returns {{ label, icon }} méta d'une ressource (défauts sûrs). */
export const getAuditResource = (value) =>
  AUDIT_RESOURCES[value] || { label: value, icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Statuts (avec quel résultat ?)
   -------------------------------------------------------------------------- */

export const AUDIT_STATUSES = {
  success: { label: 'Réussi', variant: 'success', icon: 'bi-check-circle' },
  failed: { label: 'Échoué', variant: 'danger', icon: 'bi-x-octagon' },
  warning: { label: 'Avertissement', variant: 'warning', icon: 'bi-exclamation-triangle' },
  info: { label: 'Information', variant: 'info', icon: 'bi-info-circle' },
};

export const AUDIT_STATUS_VALUES = Object.keys(AUDIT_STATUSES);

/** @returns {{ label, variant, icon }} méta d'un statut (défauts sûrs). */
export const getAuditStatus = (value) =>
  AUDIT_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Sévérités
   -------------------------------------------------------------------------- */

export const AUDIT_SEVERITIES = {
  low: { label: 'Basse', variant: 'secondary', icon: 'bi-circle' },
  medium: { label: 'Moyenne', variant: 'info', icon: 'bi-dot' },
  high: { label: 'Haute', variant: 'warning', icon: 'bi-exclamation-diamond' },
  critical: { label: 'Critique', variant: 'danger', icon: 'bi-exclamation-octagon' },
};

export const AUDIT_SEVERITY_VALUES = Object.keys(AUDIT_SEVERITIES);

/** Ordre de gravité décroissante, utile pour les tris et le triage. */
export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

/** @returns {{ label, variant, icon }} méta d'une sévérité (défauts sûrs). */
export const getAuditSeverity = (value) =>
  AUDIT_SEVERITIES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Périodes de filtrage
   -------------------------------------------------------------------------- */

export const AUDIT_PERIODS = {
  today: { label: 'Aujourd’hui' },
  yesterday: { label: 'Hier' },
  last7: { label: '7 derniers jours' },
  last30: { label: '30 derniers jours' },
  thisMonth: { label: 'Ce mois' },
  lastMonth: { label: 'Mois précédent' },
  custom: { label: 'Personnalisé' },
};

export const AUDIT_PERIOD_VALUES = Object.keys(AUDIT_PERIODS);

export const getAuditPeriod = (value) =>
  AUDIT_PERIODS[value] || { label: value };

/* --------------------------------------------------------------------------
   Utilisateurs simulés (qui a agi ?)
   -------------------------------------------------------------------------- */

export const AUDIT_USERS = [
  { id: 'usr_001', name: 'Awa Kouamé', role: 'Super Admin', companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2' },
  { id: 'usr_002', name: 'Ibrahim Traoré', role: 'Propriétaire', companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2' },
  { id: 'usr_003', name: 'Mariam Koné', role: 'Administrateur', companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2' },
  { id: 'usr_004', name: 'Ousmane Diallo', role: 'Propriétaire', companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2' },
  { id: 'usr_005', name: 'Seydou Coulibaly', role: 'Propriétaire', companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2' },
  { id: 'usr_006', name: 'Fatou Sawadogo', role: 'Propriétaire', companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2' },
  { id: 'usr_007', name: 'Koffi Ahouansou', role: 'Propriétaire', companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2' },
  { id: 'usr_008', name: 'Abla Mensah', role: 'Propriétaire', companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2' },
  { id: 'usr_009', name: 'Estelle Ngono', role: 'Propriétaire', companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2' },
  { id: 'usr_010', name: 'Charles Mba', role: 'Propriétaire', companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2' },
  { id: 'usr_011', name: 'Yao N’Guessan', role: 'Gestionnaire de flotte', companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2' },
  { id: 'usr_012', name: 'Jean Kouassi', role: 'Comptable', companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2' },
  { id: 'usr_013', name: 'Moussa Kone', role: 'Gestionnaire de flotte', companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2' },
  { id: 'usr_014', name: 'Rasmata Ouédraogo', role: 'Administrateur', companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2' },
  { id: 'usr_015', name: 'Aïcha Diallo', role: 'Comptable', companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2' },
];

export const AUDIT_USER_VALUES = AUDIT_USERS.map((user) => user.id);

export const getUser = (value) =>
  AUDIT_USERS.find((user) => user.id === value) || { id: value, name: value };

export const AUDIT_USER_OPTIONS = AUDIT_USERS.map((user) => ({
  value: user.id,
  label: user.name,
}));

/** Adresses e-mail simulées des utilisateurs du journal (jamais affichées sans `audit.viewSensitive`). */
const AUDIT_USER_EMAILS = {
  usr_001: 'awa.kouame@navix.com',
  usr_002: 'ibrahim.traore@trans-express.ci',
  usr_003: 'mariam.kone@logisud.ci',
  usr_004: 'ousmane.diallo@sentrans.sn',
  usr_005: 'seydou.coulibaly@bamakotrans.ml',
  usr_006: 'fatou.sawadogo@ouagalogistics.bf',
  usr_007: 'koffi.ahouansou@beninexpress.bj',
  usr_008: 'abla.mensah@lometrans.tg',
  usr_009: 'estelle.ngono@doualacars.cm',
  usr_010: 'charles.mba@librevillemoves.ga',
  usr_011: 'yao.nguessan@navix.com',
  usr_012: 'jean.kouassi@navix.com',
  usr_013: 'moussa.kone@trans-express.ci',
  usr_014: 'rasmata.ouedraogo@ouagalogistics.bf',
  usr_015: 'aicha.diallo@sentrans.sn',
};

/** Adresse e-mail d'un utilisateur (vide si inconnu). */
export const getUserEmail = (value) => AUDIT_USER_EMAILS[value] ?? '';

/**
 * Extrait navigateur, OS et appareil d'un User-Agent.
 * Simplifié à des fins de démonstration — le parsing fiable est serveur.
 * @param {string} [userAgent]
 * @returns {{ browser: string, os: string, device: string }}
 */
export const parseUserAgent = (userAgent = '') => {
  const ua = userAgent.toLowerCase();

  let browser = 'Inconnu';
  if (ua.includes('curl')) browser = 'curl';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';

  let os = 'Inconnu';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('iphone') || ua.includes('ios')) os = 'iOS';
  else if (ua.includes('ipad')) os = 'iPadOS';
  else if (ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('linux')) os = 'Linux';

  const device = ua.includes('ipad') || ua.includes('tablet')
    ? 'Tablette'
    : ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')
      ? 'Mobile'
      : 'Desktop';

  return { browser, os, device };
};

/* --------------------------------------------------------------------------
   Vues et regroupement
   -------------------------------------------------------------------------- */

/** Vues disponibles du journal (liste, regroupée, chronologie). */
export const AUDIT_VIEWS = [
  { value: 'list', label: 'Liste', icon: 'bi-list-ul' },
  { value: 'grouped', label: 'Regroupé', icon: 'bi-diagram-3' },
  { value: 'timeline', label: 'Chronologie', icon: 'bi-clock-history' },
];

export const AUDIT_VIEW_VALUES = AUDIT_VIEWS.map((view) => view.value);

/** Critères de regroupement des entrées. */
export const AUDIT_GROUPING_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'user', label: 'Utilisateur' },
  { value: 'module', label: 'Module' },
  { value: 'action', label: 'Action' },
  { value: 'resource', label: 'Ressource' },
  { value: 'severity', label: 'Sévérité' },
];

export const AUDIT_GROUPING_VALUES = AUDIT_GROUPING_OPTIONS.map((option) => option.value);

/* --------------------------------------------------------------------------
   Navigation vers la ressource liée
   -------------------------------------------------------------------------- */

const AUDIT_RESOURCE_ROUTES = {
  company: companyDetailPath,
  agency: agencyDetailPath,
  vehicle: vehicleDetailPath,
  driver: driverDetailPath,
  assignment: assignmentDetailPath,
  trip: tripDetailPath,
  fuel: fuelDetailPath,
  maintenance: maintenanceDetailPath,
  document: documentDetailPath,
  subscription: subscriptionDetailPath,
  invoice: invoiceDetailPath,
  payment: paymentDetailPath,
  notification: notificationDetailPath,
};

/** Ressources audit pour lesquelles une route de détail existe. */
export const AUDIT_LINKABLE_RESOURCES = Object.keys(AUDIT_RESOURCE_ROUTES);

/**
 * Construit le chemin de la ressource liée à une entrée d'audit.
 * @param {string} resourceType — type de ressource (vehicle, invoice, …)
 * @param {string} resourceId   — identifiant ULID de la ressource
 * @returns {string}            — chemin interne (ou '/' si inconnu)
 */
export const getAuditResourcePath = (resourceType, resourceId) => {
  const builder = AUDIT_RESOURCE_ROUTES[resourceType];
  return builder && resourceId ? builder(resourceId) : '/';
};

/* --------------------------------------------------------------------------
   Tri, pagination, formatage
   -------------------------------------------------------------------------- */

export const AUDIT_ICON = 'bi-journal-text';

export const DEFAULT_PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const AUDIT_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'userName', label: 'Utilisateur' },
  { value: 'action', label: 'Action' },
  { value: 'resourceType', label: 'Ressource' },
  { value: 'companyName', label: 'Entreprise' },
  { value: 'severity', label: 'Sévérité' },
  { value: 'status', label: 'Statut' },
];

export const SORT_DIRECTIONS = [
  { value: 'desc', label: 'Plus récents d’abord' },
  { value: 'asc', label: 'Plus anciens d’abord' },
];

/** Formate une date en date courte locale. */
export const formatAuditDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/** Formate une date en date + heure courtes locales. */
export const formatAuditDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Formate une valeur brute pour l'affichage des diffs (objets → JSON). */
export const formatAuditValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};
