/**
 * Navix Subscriptions — Constantes métier du module SaaS Abonnements
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les plans (Starter / Business / Professional /
 * Enterprise), les statuts d'abonnement, les intervalles de facturation, les
 * fonctionnalités, les limites d'usage et les métadonnées d'affichage
 * (libellé, variante Badge, icône). Contient également les règles de
 * formatage (dates, montants, stockage), les seuils d'alerte de limites
 * (normal / attention / critique) et les getters correspondants.
 * Consommé par les composants, les pages, les filtres, la table et le service.
 */

/* --------------------------------------------------------------------------
   Plans d'abonnement (métadonnées d'affichage)
   -------------------------------------------------------------------------- */

export const PLANS = {
  starter: { label: 'Starter', variant: 'info', icon: 'bi-rocket-takeoff' },
  business: { label: 'Business', variant: 'primary', icon: 'bi-briefcase' },
  professional: { label: 'Professional', variant: 'warning', icon: 'bi-award' },
  enterprise: { label: 'Enterprise', variant: 'dark', icon: 'bi-buildings' },
};

export const PLAN_VALUES = Object.keys(PLANS);

/** Ordre de montée en gamme (Starter → Enterprise). */
export const PLAN_ORDER = PLAN_VALUES;

export const getPlan = (value) =>
  PLANS[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Statuts d'abonnement
   -------------------------------------------------------------------------- */

export const SUBSCRIPTION_STATUSES = {
  trialing: { label: 'Essai', variant: 'info', icon: 'bi-hourglass-split' },
  active: { label: 'Active', variant: 'success', icon: 'bi-check-circle' },
  past_due: { label: 'Paiement en retard', variant: 'warning', icon: 'bi-exclamation-triangle' },
  paused: { label: 'Suspendue', variant: 'secondary', icon: 'bi-pause-circle' },
  cancelled: { label: 'Annulée', variant: 'danger', icon: 'bi-x-circle' },
  expired: { label: 'Expirée', variant: 'secondary', icon: 'bi-calendar-x' },
};

export const SUBSCRIPTION_STATUS_VALUES = Object.keys(SUBSCRIPTION_STATUSES);

export const getSubscriptionStatus = (value) =>
  SUBSCRIPTION_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Intervalles de facturation
   -------------------------------------------------------------------------- */

export const BILLING_INTERVALS = {
  monthly: { label: 'Mensuel', variant: 'info', icon: 'bi-calendar-month' },
  yearly: { label: 'Annuel', variant: 'success', icon: 'bi-calendar-check' },
};

export const BILLING_INTERVAL_VALUES = Object.keys(BILLING_INTERVALS);

export const getBillingInterval = (value) =>
  BILLING_INTERVALS[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Fonctionnalités SaaS
   -------------------------------------------------------------------------- */

export const FEATURE_CATEGORIES = {
  fleet: { label: 'Flotte', icon: 'bi-truck' },
  operations: { label: 'Opérations', icon: 'bi-gear' },
  administration: { label: 'Administration', icon: 'bi-clipboard-check' },
  analytics: { label: 'Analytique', icon: 'bi-graph-up' },
  growth: { label: 'Développement', icon: 'bi-bar-chart-line' },
};

export const FEATURE_CATEGORY_VALUES = Object.keys(FEATURE_CATEGORIES);

export const FEATURES = {
  vehicles: { label: 'Véhicules', category: 'fleet', icon: 'bi-truck' },
  drivers: { label: 'Chauffeurs', category: 'fleet', icon: 'bi-person-badge' },
  assignments: { label: 'Affectations', category: 'operations', icon: 'bi-person-check' },
  trips: { label: 'Trajets', category: 'operations', icon: 'bi-sign-turn-right' },
  fuel: { label: 'Carburant', category: 'operations', icon: 'bi-fuel-pump' },
  maintenance: { label: 'Maintenance', category: 'operations', icon: 'bi-wrench-adjustable' },
  documents: { label: 'Documents', category: 'administration', icon: 'bi-file-earmark-text' },
  agencies: { label: 'Agences & sites', category: 'administration', icon: 'bi-diagram-3' },
  notifications: { label: 'Notifications', category: 'administration', icon: 'bi-bell' },
  auditLog: { label: 'Journal d’audit', category: 'administration', icon: 'bi-journal-text' },
  reports: { label: 'Rapports', category: 'analytics', icon: 'bi-file-earmark-bar-graph' },
  analytics: { label: 'Analytiques', category: 'analytics', icon: 'bi-graph-up' },
  financialManagement: { label: 'Gestion financière', category: 'analytics', icon: 'bi-cash-stack' },
  multiAgency: { label: 'Multi-agences', category: 'growth', icon: 'bi-buildings' },
  apiAccess: { label: 'Accès API', category: 'growth', icon: 'bi-code-square' },
  advancedExport: { label: 'Export avancé', category: 'growth', icon: 'bi-file-arrow-down' },
  advancedPermissions: { label: 'Permissions avancées', category: 'growth', icon: 'bi-shield-lock' },
};

export const FEATURE_VALUES = Object.keys(FEATURES);

export const getFeature = (value) =>
  FEATURES[value] || { label: value, category: '', icon: 'bi-circle' };

export const getFeatureCategory = (value) =>
  FEATURE_CATEGORIES[value] || { label: value, icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Limites des plans (10 ressources comptabilisées)
   -------------------------------------------------------------------------- */

export const LIMITS = {
  maxVehicles: { label: 'Véhicules', unit: 'véhicules', icon: 'bi-truck' },
  maxDrivers: { label: 'Chauffeurs', unit: 'chauffeurs', icon: 'bi-person-badge' },
  maxUsers: { label: 'Utilisateurs', unit: 'utilisateurs', icon: 'bi-people' },
  maxAgencies: { label: 'Agences', unit: 'agences', icon: 'bi-diagram-3' },
  maxCompanies: { label: 'Entreprises', unit: 'entreprises', icon: 'bi-buildings' },
  maxDocuments: { label: 'Documents', unit: 'documents', icon: 'bi-file-earmark-text' },
  maxStorage: { label: 'Stockage', unit: 'Go', icon: 'bi-hdd' },
  maxTripsPerMonth: { label: 'Trajets / mois', unit: 'trajets', icon: 'bi-sign-turn-right' },
  maxFuelRecordsPerMonth: { label: 'Pleins / mois', unit: 'pleins', icon: 'bi-fuel-pump' },
  maxMaintenanceRecordsPerMonth: {
    label: 'Entretiens / mois',
    unit: 'entretiens',
    icon: 'bi-wrench-adjustable',
  },
};

export const LIMIT_VALUES = Object.keys(LIMITS);

export const getLimit = (value) =>
  LIMITS[value] || { label: value, unit: '', icon: 'bi-circle' };

/**
 * Correspondance entre un champ d'usage (SubscriptionUsage) et la clé de
 * limite du plan correspondante.
 */
export const USAGE_LIMIT_MAP = {
  vehiclesUsed: 'maxVehicles',
  driversUsed: 'maxDrivers',
  usersUsed: 'maxUsers',
  agenciesUsed: 'maxAgencies',
  companiesUsed: 'maxCompanies',
  documentsUsed: 'maxDocuments',
  storageUsed: 'maxStorage',
  tripsUsed: 'maxTripsPerMonth',
  fuelRecordsUsed: 'maxFuelRecordsPerMonth',
  maintenanceRecordsUsed: 'maxMaintenanceRecordsPerMonth',
};

/* --------------------------------------------------------------------------
   Seuils d'alerte des limites d'usage
   -------------------------------------------------------------------------- */

/**
 * Seuils de consommation : normal (< 80 %), attention (80–89 %),
 * critique (≥ 90 %, y compris 100 % et au-delà).
 */
export const LIMIT_THRESHOLDS = {
  normal: { threshold: 0.8, label: 'Normal', variant: 'success', icon: 'bi-check-circle' },
  warning: { threshold: 0.9, label: 'Attention', variant: 'warning', icon: 'bi-exclamation-triangle' },
  critical: { threshold: 1, label: 'Critique', variant: 'danger', icon: 'bi-exclamation-octagon' },
};

/** Niveau d'usage à partir d'un ratio (0 → 1+). */
export const getUsageLevel = (ratio) => {
  const value = Number(ratio) || 0;
  if (value >= LIMIT_THRESHOLDS.critical.threshold) return LIMIT_THRESHOLDS.critical;
  if (value >= LIMIT_THRESHOLDS.warning.threshold) return LIMIT_THRESHOLDS.warning;
  return LIMIT_THRESHOLDS.normal;
};

/* --------------------------------------------------------------------------
   Config générale
   -------------------------------------------------------------------------- */

export const SUBSCRIPTIONS_ICON = 'bi-credit-card';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const SORT_OPTIONS = [
  { value: 'companyName', label: 'Entreprise' },
  { value: 'plan', label: 'Plan' },
  { value: 'status', label: 'Statut' },
  { value: 'price', label: 'Prix' },
  { value: 'currentPeriodEnd', label: 'Échéance' },
  { value: 'renewalDate', label: 'Renouvellement' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

/** Monnaie par défaut des prix d'abonnement (Cameroun — FCFA / XAF). */
export const DEFAULT_CURRENCY = 'XAF';

/** Durée de l'essai gratuit simulé (en jours). */
export const DEFAULT_TRIAL_DAYS = 14;

/** Nombre de mois facturés lors d'un engagement annuel (simulation). */
export const MONTHS_PER_BILLING_INTERVAL = {
  monthly: 1,
  yearly: 12,
};

/* --------------------------------------------------------------------------
   Formatage (dates, montants, stockage, intervalles)
   -------------------------------------------------------------------------- */

/** Construit une Date valide à partir d'une date simple ou d'un horodatage ISO. */
const toDate = (value) => {
  const candidate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Formate une date courte (ex. 12 août 2026). */
export const formatSubscriptionDate = (value) => {
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
export const formatSubscriptionDateTime = (value) => {
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

/** Formate un montant (ex. 75 000 FCFA). */
export const formatSubscriptionMoney = (value, currency = DEFAULT_CURRENCY) =>
  Number.isFinite(Number(value)) && Number(value) !== 0
    ? `${Number(value).toLocaleString('fr-FR')} ${currency === 'XAF' ? 'FCFA' : currency}`
    : '—';

/** Formate un stockage en Go (ex. 12 Go). */
export const formatStorage = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0 ? `${Number(value).toLocaleString('fr-FR')} Go` : '—';

/** Formate un intervalle de facturation (ex. « Mensuel »). */
export const formatBillingInterval = (value) =>
  getBillingInterval(value).label === value
    ? value
    : `${getBillingInterval(value).label} (${MONTHS_PER_BILLING_INTERVAL[value] || 1} mois)`;

/** Nombre de jours restants avant une date (positif) ou écoulés depuis (négatif). */
export const daysUntil = (value) => {
  const date = toDate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
};

/** Jours restants d'un essai gratuit (0 si terminé, null si indisponible). */
export const getTrialRemainingDays = (trialEndDate) => {
  const remaining = daysUntil(trialEndDate);
  if (remaining === null) return null;
  return Math.max(0, remaining);
};
