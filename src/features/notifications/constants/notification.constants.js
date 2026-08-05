/**
 * Navix Notifications — Constantes métier du module Notifications & Alertes
 * --------------------------------------------------------------------------
 * Source unique de vérité pour :
 *   - les types de notifications (system, maintenance, vehicle, …)
 *   - les catégories (info, success, warning, danger, reminder)
 *   - les niveaux de sévérité (low, medium, high, critical)
 *   - les statuts (unread, read, archived, dismissed)
 *   - les scénarios prédéfinis (NOTIFICATION_KINDS)
 *   - les règles d'alerte automatiques (ALERT_RULES)
 *   - la navigation générique vers la ressource liée (getResourcePath)
 *   - le formatage des dates (relatif, absolu)
 *
 * Consommé par les composants, les filtres, le store, le service et les
 * règles d'alerte. Aucune couleur codée en dur : variantes sémantiques qui
 * mappent les tokens CSS existants (--navix-* / --bs-*).
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
} from '@/routes/route.constants';

/* --------------------------------------------------------------------------
   Types de notifications
   -------------------------------------------------------------------------- */

export const NOTIFICATION_TYPES = {
  system: { label: 'Système', variant: 'dark', icon: 'bi-cpu' },
  maintenance: { label: 'Entretien', variant: 'info', icon: 'bi-wrench-adjustable' },
  vehicle: { label: 'Véhicule', variant: 'primary', icon: 'bi-truck' },
  driver: { label: 'Chauffeur', variant: 'primary', icon: 'bi-person-badge' },
  assignment: { label: 'Affectation', variant: 'info', icon: 'bi-shuffle' },
  trip: { label: 'Trajet', variant: 'info', icon: 'bi-signpost-split' },
  fuel: { label: 'Carburant', variant: 'warning', icon: 'bi-fuel-pump' },
  document: { label: 'Document', variant: 'warning', icon: 'bi-folder2-open' },
  billing: { label: 'Facturation', variant: 'success', icon: 'bi-receipt' },
  subscription: { label: 'Abonnement', variant: 'primary', icon: 'bi-credit-card' },
  security: { label: 'Sécurité', variant: 'danger', icon: 'bi-shield-lock' },
  report: { label: 'Rapport', variant: 'secondary', icon: 'bi-file-earmark-bar-graph' },
};

export const NOTIFICATION_TYPE_VALUES = Object.keys(NOTIFICATION_TYPES);

export const getNotificationType = (value) =>
  NOTIFICATION_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Catégories de notifications
   -------------------------------------------------------------------------- */

export const NOTIFICATION_CATEGORIES = {
  info: { label: 'Information', variant: 'info', icon: 'bi-info-circle' },
  success: { label: 'Succès', variant: 'success', icon: 'bi-check-circle' },
  warning: { label: 'Avertissement', variant: 'warning', icon: 'bi-exclamation-triangle' },
  danger: { label: 'Urgence', variant: 'danger', icon: 'bi-x-octagon' },
  reminder: { label: 'Rappel', variant: 'secondary', icon: 'bi-bell' },
};

export const NOTIFICATION_CATEGORY_VALUES = Object.keys(NOTIFICATION_CATEGORIES);

export const getNotificationCategory = (value) =>
  NOTIFICATION_CATEGORIES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Niveaux de sévérité
   -------------------------------------------------------------------------- */

export const NOTIFICATION_SEVERITIES = {
  low: { label: 'Basse', variant: 'secondary', icon: 'bi-circle' },
  medium: { label: 'Moyenne', variant: 'info', icon: 'bi-dot' },
  high: { label: 'Haute', variant: 'warning', icon: 'bi-exclamation-diamond' },
  critical: { label: 'Critique', variant: 'danger', icon: 'bi-exclamation-octagon' },
};

export const NOTIFICATION_SEVERITY_VALUES = Object.keys(NOTIFICATION_SEVERITIES);

export const getNotificationSeverity = (value) =>
  NOTIFICATION_SEVERITIES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/** Ordre de gravité décroissante, utile pour les tris et le triage. */
export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

/* --------------------------------------------------------------------------
   Statuts de notification
   -------------------------------------------------------------------------- */

export const NOTIFICATION_STATUSES = {
  unread: { label: 'Non lue', variant: 'primary', icon: 'bi-envelope' },
  read: { label: 'Lue', variant: 'secondary', icon: 'bi-envelope-open' },
  archived: { label: 'Archivée', variant: 'dark', icon: 'bi-archive' },
  dismissed: { label: 'Ignorée', variant: 'secondary', icon: 'bi-eye-slash' },
};

export const NOTIFICATION_STATUS_VALUES = Object.keys(NOTIFICATION_STATUSES);

export const getNotificationStatus = (value) =>
  NOTIFICATION_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Scénarios prédéfinis (kind) — genre réaliste de chaque notification
   -------------------------------------------------------------------------- */

export const NOTIFICATION_KINDS = {
  maintenance_due_soon: {
    label: 'Entretien bientôt dû',
    type: 'maintenance',
    category: 'warning',
    severity: 'medium',
    icon: 'bi-tools',
  },
  maintenance_overdue: {
    label: 'Entretien en retard',
    type: 'maintenance',
    category: 'danger',
    severity: 'high',
    icon: 'bi-alarm',
  },
  vehicle_immobilized: {
    label: 'Véhicule immobilisé',
    type: 'vehicle',
    category: 'danger',
    severity: 'critical',
    icon: 'bi-pause-circle',
  },
  document_expiring: {
    label: 'Document expirant',
    type: 'document',
    category: 'warning',
    severity: 'medium',
    icon: 'bi-clock-history',
  },
  insurance_expiring: {
    label: 'Assurance bientôt expirée',
    type: 'document',
    category: 'warning',
    severity: 'medium',
    icon: 'bi-shield-check',
  },
  inspection_expiring: {
    label: 'Contrôle technique bientôt expiré',
    type: 'document',
    category: 'warning',
    severity: 'medium',
    icon: 'bi-clipboard-check',
  },
  license_expiring: {
    label: 'Permis chauffeur bientôt expiré',
    type: 'driver',
    category: 'warning',
    severity: 'medium',
    icon: 'bi-person-vcard',
  },
  abnormal_consumption: {
    label: 'Consommation anormale',
    type: 'fuel',
    category: 'warning',
    severity: 'high',
    icon: 'bi-graph-up-arrow',
  },
  assignment_created: {
    label: 'Affectation créée',
    type: 'assignment',
    category: 'info',
    severity: 'low',
    icon: 'bi-shuffle',
  },
  assignment_completed: {
    label: 'Affectation terminée',
    type: 'assignment',
    category: 'success',
    severity: 'low',
    icon: 'bi-check2-circle',
  },
  trip_completed: {
    label: 'Trajet terminé',
    type: 'trip',
    category: 'success',
    severity: 'low',
    icon: 'bi-flag',
  },
  trip_cancelled: {
    label: 'Trajet annulé',
    type: 'trip',
    category: 'warning',
    severity: 'medium',
    icon: 'bi-x-circle',
  },
  payment_success: {
    label: 'Paiement réussi',
    type: 'billing',
    category: 'success',
    severity: 'low',
    icon: 'bi-cash-coin',
  },
  payment_failed: {
    label: 'Paiement échoué',
    type: 'billing',
    category: 'danger',
    severity: 'high',
    icon: 'bi-cash',
  },
  invoice_overdue: {
    label: 'Facture en retard',
    type: 'billing',
    category: 'danger',
    severity: 'critical',
    icon: 'bi-receipt-cutoff',
  },
  subscription_expiring: {
    label: 'Abonnement bientôt expiré',
    type: 'subscription',
    category: 'warning',
    severity: 'high',
    icon: 'bi-hourglass-split',
  },
  plan_limit_reached: {
    label: 'Limite du plan atteinte',
    type: 'subscription',
    category: 'danger',
    severity: 'high',
    icon: 'bi-arrow-up-circle',
  },
  company_created: {
    label: 'Nouvelle entreprise créée',
    type: 'system',
    category: 'info',
    severity: 'low',
    icon: 'bi-building-add',
  },
  user_created: {
    label: 'Utilisateur créé',
    type: 'system',
    category: 'success',
    severity: 'low',
    icon: 'bi-person-plus',
  },
  maintenance_in_progress: {
    label: 'Entretien en cours',
    type: 'maintenance',
    category: 'info',
    severity: 'low',
    icon: 'bi-tools',
  },
  vehicle_in_maintenance: {
    label: 'Véhicule en entretien',
    type: 'vehicle',
    category: 'info',
    severity: 'low',
    icon: 'bi-wrench',
  },
  document_expired: {
    label: 'Document expiré',
    type: 'document',
    category: 'danger',
    severity: 'high',
    icon: 'bi-file-x',
  },
  security_login: {
    label: 'Connexion détectée',
    type: 'security',
    category: 'warning',
    severity: 'high',
    icon: 'bi-shield-exclamation',
  },
  report_generated: {
    label: 'Rapport généré',
    type: 'report',
    category: 'info',
    severity: 'low',
    icon: 'bi-file-earmark-bar-graph',
  },
  invoice_issued: {
    label: 'Facture émise',
    type: 'billing',
    category: 'info',
    severity: 'low',
    icon: 'bi-send',
  },
  subscription_renewed: {
    label: 'Abonnement renouvelé',
    type: 'subscription',
    category: 'success',
    severity: 'low',
    icon: 'bi-arrow-repeat',
  },
  license_expired: {
    label: 'Permis de conduire expiré',
    type: 'driver',
    category: 'danger',
    severity: 'high',
    icon: 'bi-person-exclamation',
  },
};

export const NOTIFICATION_KIND_VALUES = Object.keys(NOTIFICATION_KINDS);

export const getNotificationKind = (value) =>
  NOTIFICATION_KINDS[value] || { label: value, type: 'system', category: 'info', severity: 'low', icon: 'bi-bell' };

/* --------------------------------------------------------------------------
   Règles d'alerte automatiques (simulées)
   -------------------------------------------------------------------------- */

export const ALERT_RULES = [
  {
    id: 'RULE_MAINTENANCE_DUE_SOON',
    code: 'maintenance_due_soon',
    name: 'Entretien bientôt dû',
    description: 'Émet une alerte lorsque la date du prochain entretien approche du seuil.',
    type: 'maintenance',
    severity: 'medium',
    threshold: 15,
    isActive: true,
  },
  {
    id: 'RULE_MAINTENANCE_OVERDUE',
    code: 'maintenance_overdue',
    name: 'Entretien en retard',
    description: 'Émet une alerte lorsque la date d’entretien est dépassée.',
    type: 'maintenance',
    severity: 'high',
    threshold: 0,
    isActive: true,
  },
  {
    id: 'RULE_VEHICLE_IMMOBILIZED',
    code: 'vehicle_immobilized',
    name: 'Véhicule immobilisé',
    description: 'Émet une alerte critique lorsqu’un véhicule est immobilisé.',
    type: 'vehicle',
    severity: 'critical',
    threshold: null,
    isActive: true,
  },
  {
    id: 'RULE_DOCUMENT_EXPIRING',
    code: 'document_expiring',
    name: 'Document expirant',
    description: 'Émet une alerte lorsque la date d’expiration d’un document approche.',
    type: 'document',
    severity: 'medium',
    threshold: 30,
    isActive: true,
  },
  {
    id: 'RULE_INSURANCE_EXPIRING',
    code: 'insurance_expiring',
    name: 'Assurance bientôt expirée',
    description: 'Émet une alerte lorsque l’assurance d’un véhicule approche de son échéance.',
    type: 'document',
    severity: 'medium',
    threshold: 30,
    isActive: true,
  },
  {
    id: 'RULE_INSPECTION_EXPIRING',
    code: 'inspection_expiring',
    name: 'Contrôle technique bientôt expiré',
    description: 'Émet une alerte lorsque la visite technique approche de son échéance.',
    type: 'document',
    severity: 'medium',
    threshold: 30,
    isActive: true,
  },
  {
    id: 'RULE_LICENSE_EXPIRING',
    code: 'license_expiring',
    name: 'Permis chauffeur bientôt expiré',
    description: 'Émet une alerte lorsque le permis d’un chauffeur approche de son échéance.',
    type: 'driver',
    severity: 'medium',
    threshold: 30,
    isActive: true,
  },
  {
    id: 'RULE_ABNORMAL_CONSUMPTION',
    code: 'abnormal_consumption',
    name: 'Consommation anormale',
    description: 'Émet une alerte lorsque la consommation dépasse le seuil d’écart (%).',
    type: 'fuel',
    severity: 'high',
    threshold: 20,
    isActive: true,
  },
  {
    id: 'RULE_SUBSCRIPTION_EXPIRING',
    code: 'subscription_expiring',
    name: 'Abonnement bientôt expiré',
    description: 'Émet une alerte lorsque le renouvellement d’un abonnement approche.',
    type: 'subscription',
    severity: 'high',
    threshold: 7,
    isActive: true,
  },
  {
    id: 'RULE_PLAN_LIMIT_WARNING',
    code: 'plan_limit_warning',
    name: 'Limite du plan bientôt atteinte',
    description: 'Émet une alerte lorsque l’usage d’un plan atteint le seuil (%).',
    type: 'subscription',
    severity: 'high',
    threshold: 80,
    isActive: true,
  },
  {
    id: 'RULE_PLAN_LIMIT_REACHED',
    code: 'plan_limit_reached',
    name: 'Limite du plan atteinte',
    description: 'Émet une alerte critique lorsque l’usage d’un plan atteint 100 %.',
    type: 'subscription',
    severity: 'critical',
    threshold: 100,
    isActive: true,
  },
  {
    id: 'RULE_INVOICE_OVERDUE',
    code: 'invoice_overdue',
    name: 'Facture en retard',
    description: 'Émet une alerte critique lorsque la date d’échéance d’une facture est dépassée.',
    type: 'billing',
    severity: 'critical',
    threshold: 0,
    isActive: true,
  },
];

export const ALERT_RULE_VALUES = ALERT_RULES.map((rule) => rule.code);

export const getAlertRule = (code) => ALERT_RULES.find((rule) => rule.code === code);

/* --------------------------------------------------------------------------
   Ressources liées — navigation générique vers la ressource
   -------------------------------------------------------------------------- */

const RESOURCE_ROUTES = {
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
};

export const RESOURCE_TYPES = Object.keys(RESOURCE_ROUTES);

/**
 * Construit le chemin de la ressource liée à une notification.
 * @param {string} resourceType — type de ressource (vehicle, invoice, …)
 * @param {string} resourceId   — identifiant ULID de la ressource
 * @returns {string}            — chemin interne (ou '/' si inconnu)
 */
export const getResourcePath = (resourceType, resourceId) => {
  const builder = RESOURCE_ROUTES[resourceType];
  return builder && resourceId ? builder(resourceId) : '/';
};

/* --------------------------------------------------------------------------
   Pagination, tri, formatage
   -------------------------------------------------------------------------- */

export const NOTIFICATION_ICON = 'bi-bell';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const NOTIFICATION_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'severity', label: 'Sévérité' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Statut' },
  { value: 'companyName', label: 'Entreprise' },
];

export const SORT_DIRECTIONS = [
  { value: 'desc', label: 'Plus récentes d’abord' },
  { value: 'asc', label: 'Plus anciennes d’abord' },
];

/** Formate une date en date courte locale. */
export const formatNotificationDate = (value) => {
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
export const formatNotificationDateTime = (value) => {
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

/**
 * Formate une date en relatif (« il y a 5 min », « dans 3 jours », « hier »).
 * @returns {string}
 */
export const formatNotificationRelative = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const now = Date.now();
  const diff = date.getTime() - now;
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);

  if (abs < 60_000) return diff >= 0 ? 'à l’instant' : 'à l’instant';
  if (minutes < 60) return diff >= 0 ? `dans ${minutes} min` : `il y a ${minutes} min`;
  if (hours < 24) return diff >= 0 ? `dans ${hours} h` : `il y a ${hours} h`;
  if (days === 1) return diff >= 0 ? 'demain' : 'hier';
  if (days < 30) return diff >= 0 ? `dans ${days} j` : `il y a ${days} j`;
  return formatNotificationDate(value);
};

/** Nombre de notifications critiques/hautes non lues (pour les bannières). */
export const countUrgentNotifications = (notifications = []) =>
  notifications.filter(
    (notification) =>
      notification.status === 'unread' &&
      ['high', 'critical'].includes(notification.severity),
  ).length;
