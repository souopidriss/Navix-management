/**
 * Navix Management — Constantes métier de l'Espace Chauffeur
 * --------------------------------------------------------------------------
 * Source unique des vocabulaires propres au chauffeur : statuts de trajets,
 * types / sévérités / statuts d'incidents, types et statuts de documents,
 * villes camerounaises. 100 % Cameroun (villes) et FCFA (monnaie).
 * Isolé du reste de l'application pour garantir le cloisonnement multi-tenant.
 */
import { currencyLabel } from '@/utils/format';

export const DRIVER_CURRENCY = 'XAF';

export const CAMEROON_CITIES = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Bamenda',
  'Garoua',
  'Maroua',
  'Ngaoundéré',
  'Bertoua',
  'Kribi',
  'Limbe',
  'Ebolowa',
  'Edéa',
  'Kumba',
  'Buea',
  'Dschang',
];

/* ------------------------------------------------------------------ */
/* Trajets                                                             */
/* ------------------------------------------------------------------ */
export const DRIVER_TRIP_STATUSES = {
  planned: { label: 'Prévu', variant: 'secondary', icon: 'bi-calendar2-event' },
  in_progress: { label: 'En cours', variant: 'primary', icon: 'bi-play-circle' },
  completed: { label: 'Terminé', variant: 'success', icon: 'bi-check2-circle' },
  cancelled: { label: 'Annulé', variant: 'danger', icon: 'bi-x-circle' },
  suspended: { label: 'Suspendu', variant: 'warning', icon: 'bi-pause-circle' },
};

export const DRIVER_TRIP_STATUS_VALUES = Object.keys(DRIVER_TRIP_STATUSES);

export const DRIVER_TRIP_TYPES = {
  mission: { label: 'Mission', variant: 'primary', icon: 'bi-briefcase' },
  delivery: { label: 'Livraison', variant: 'success', icon: 'bi-box-seam' },
  transport: { label: 'Transport', variant: 'info', icon: 'bi-truck' },
  personnel: { label: 'Personnel', variant: 'secondary', icon: 'bi-people' },
};

export const getDriverTripType = (value) =>
  DRIVER_TRIP_TYPES[value] || { label: value || '—', variant: 'secondary', icon: 'bi-circle' };

export const DRIVER_PERIOD_OPTIONS = [
  { value: '', label: 'Toutes les périodes' },
  { value: 'current', label: 'En cours' },
  { value: 'month', label: 'Ce mois-ci' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' },
];

export const getDriverTripStatus = (value) =>
  DRIVER_TRIP_STATUSES[value] || { label: value || '—', variant: 'secondary', icon: 'bi-circle' };

/* ------------------------------------------------------------------ */
/* Workflow trajet                                                     */
/* ------------------------------------------------------------------ */

/** Transitions autorisées côté chauffeur (PLANIFIÉ → EN COURS → TERMINÉ). */
export const DRIVER_TRIP_WORKFLOW = {
  planned: ['in_progress'],
  in_progress: ['suspended', 'completed'],
  suspended: ['in_progress', 'completed'],
  completed: [],
  cancelled: [],
};

/** Vérifie que la transition `from → to` est autorisée par le workflow. */
export const canTransitionDriverTrip = (from, to) =>
  Boolean(DRIVER_TRIP_WORKFLOW[from] && DRIVER_TRIP_WORKFLOW[from].includes(to));

/**
 * Un trajet est « actif » quand il est en cours, ou en pause par le chauffeur.
 * Les trajets suspendus par la flotte (sans `pausedByDriver`) restent inertes.
 */
export const isDriverTripActive = (trip) =>
  Boolean(trip && (trip.status === 'in_progress' || (trip.status === 'suspended' && trip.pausedByDriver)));

/** Sélectionne le trajet actif dans une liste de trajets. */
export const selectDriverActiveTrip = (trips = []) => trips.find((trip) => isDriverTripActive(trip)) ?? null;

/* ------------------------------------------------------------------ */
/* Incidents                                                           */
/* ------------------------------------------------------------------ */
export const INCIDENT_TYPES = {
  accident: { label: 'Accident', variant: 'danger', icon: 'bi-car-front' },
  panne: { label: 'Panne', variant: 'warning', icon: 'bi-gear' },
  contravention: { label: 'Contravention', variant: 'secondary', icon: 'bi-clipboard-x' },
  vol: { label: 'Vol', variant: 'danger', icon: 'bi-lock' },
  degat_marchandises: { label: 'Dégât marchandises', variant: 'warning', icon: 'bi-box-seam' },
  voie_publique: { label: 'Incident voie publique', variant: 'info', icon: 'bi-sign-turn-right' },
  autre: { label: 'Autre', variant: 'secondary', icon: 'bi-shield-exclamation' },
};

export const INCIDENT_TYPE_VALUES = Object.keys(INCIDENT_TYPES);

export const INCIDENT_SEVERITIES = {
  low: { label: 'Faible', variant: 'success', icon: 'bi-arrow-down' },
  medium: { label: 'Moyenne', variant: 'info', icon: 'bi-dash-lg' },
  high: { label: 'Élevée', variant: 'warning', icon: 'bi-arrow-up' },
  critical: { label: 'Critique', variant: 'danger', icon: 'bi-exclamation-octagon' },
};

export const INCIDENT_SEVERITY_VALUES = Object.keys(INCIDENT_SEVERITIES);

export const INCIDENT_STATUSES = {
  reported: { label: 'Signalé', variant: 'warning', icon: 'bi-flag' },
  investigating: { label: 'En cours', variant: 'primary', icon: 'bi-search' },
  resolved: { label: 'Résolu', variant: 'success', icon: 'bi-check2-circle' },
  closed: { label: 'Clôturé', variant: 'secondary', icon: 'bi-archive' },
};

export const INCIDENT_STATUS_VALUES = Object.keys(INCIDENT_STATUSES);

export const getIncidentType = (value) =>
  INCIDENT_TYPES[value] || { label: value || '—', variant: 'secondary', icon: 'bi-shield-exclamation' };

export const getIncidentSeverity = (value) =>
  INCIDENT_SEVERITIES[value] || { label: value || '—', variant: 'secondary', icon: 'bi-circle' };

export const getIncidentStatus = (value) =>
  INCIDENT_STATUSES[value] || { label: value || '—', variant: 'secondary', icon: 'bi-circle' };

/* ------------------------------------------------------------------ */
/* Véhicule                                                           */
/* ------------------------------------------------------------------ */
export const DRIVER_VEHICLE_STATUSES = {
  available: { label: 'Disponible', variant: 'success', icon: 'bi-check-circle' },
  assigned: { label: 'En service', variant: 'info', icon: 'bi-truck' },
  maintenance: { label: 'En entretien', variant: 'warning', icon: 'bi-wrench-adjustable' },
  out_of_service: { label: 'Immobilisé', variant: 'danger', icon: 'bi-pause-circle' },
};

export const getDriverVehicleStatus = (value) =>
  DRIVER_VEHICLE_STATUSES[value] || { label: value || '—', variant: 'secondary', icon: 'bi-truck' };

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */
export const DRIVER_DOCUMENT_TYPES = {
  permis: { label: 'Permis de conduire', variant: 'primary', icon: 'bi-person-badge' },
  assurance: { label: 'Assurance', variant: 'success', icon: 'bi-shield-check' },
  visite_technique: { label: 'Visite technique', variant: 'warning', icon: 'bi-patch-check' },
  carte_grise: { label: 'Carte grise', variant: 'info', icon: 'bi-card-text' },
  vignette: { label: 'Vignette', variant: 'secondary', icon: 'bi-ticket-perforated' },
  attestation: { label: 'Attestation', variant: 'secondary', icon: 'bi-file-earmark-check' },
  autre: { label: 'Autre', variant: 'secondary', icon: 'bi-file-earmark' },
};

export const DRIVER_DOCUMENT_TYPE_VALUES = Object.keys(DRIVER_DOCUMENT_TYPES);

export const DRIVER_DOCUMENT_STATUSES = {
  valid: { label: 'Valide', variant: 'success', icon: 'bi-check-circle' },
  expiring: { label: 'Expire bientôt', variant: 'warning', icon: 'bi-clock' },
  expired: { label: 'Expiré', variant: 'danger', icon: 'bi-x-circle' },
  pending: { label: 'En attente', variant: 'info', icon: 'bi-hourglass-split' },
};

export const DRIVER_DOCUMENT_STATUS_VALUES = Object.keys(DRIVER_DOCUMENT_STATUSES);

export const getDriverDocumentType = (value) =>
  DRIVER_DOCUMENT_TYPES[value] || { label: value || '—', variant: 'secondary', icon: 'bi-file-earmark' };

export const getDriverDocumentStatus = (value) =>
  DRIVER_DOCUMENT_STATUSES[value] || { label: value || '—', variant: 'secondary', icon: 'bi-circle' };

/** Seuil (jours) avant expiration à partir duquel un document est « expire bientôt ». */
export const DOCUMENT_EXPIRY_WARNING_DAYS = 30;

/**
 * Nombre de jours restants avant une échéance (négatif si passée).
 * @param {string|Date} date — date d'échéance (YYYY-MM-DD ou ISO)
 */
export const daysUntil = (date) => {
  if (!date) return null;
  const target = new Date(`${String(date).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

/**
 * Déduit le statut de validité d'un document depuis sa date d'échéance.
 * La date d'échéance est la référence métier (jamais un statut codé en dur).
 */
export const computeDriverDocumentStatus = (document) => {
  const days = daysUntil(document.expiryDate);
  if (document.status === 'pending') return 'pending';
  if (days === null) return 'valid'; // sans échéance → valide
  if (days < 0) return 'expired';
  if (days <= DOCUMENT_EXPIRY_WARNING_DAYS) return 'expiring';
  return 'valid';
};

/* ------------------------------------------------------------------ */
/* Carburant                                                           */
/* ------------------------------------------------------------------ */
export const DRIVER_FUEL_TYPES = {
  diesel: { label: 'Diesel', variant: 'info', icon: 'bi-fuel-pump' },
  essence: { label: 'Essence', variant: 'primary', icon: 'bi-fuel-pump' },
  super: { label: 'Super', variant: 'success', icon: 'bi-fuel-pump' },
};

export const getDriverFuelType = (value) =>
  DRIVER_FUEL_TYPES[value] || { label: value || '—', variant: 'secondary', icon: 'bi-fuel-pump' };

/* ------------------------------------------------------------------ */
/* Alertes métier du chauffeur                                         */
/* ------------------------------------------------------------------ */

/** Niveaux de priorité des alertes du centre « Alertes & rappels ». */
export const DRIVER_ALERT_LEVELS = {
  info: { label: 'INFO', variant: 'info', icon: 'bi-info-circle' },
  attention: { label: 'ATTENTION', variant: 'warning', icon: 'bi-exclamation-triangle' },
  urgent: { label: 'URGENT', variant: 'danger', icon: 'bi-exclamation-octagon' },
};

export const getDriverAlertLevel = (value) =>
  DRIVER_ALERT_LEVELS[value] || { label: 'INFO', variant: 'info', icon: 'bi-info-circle' };

/* ------------------------------------------------------------------ */
/* Formatage monétaire (FCFA)                                          */
/* ------------------------------------------------------------------ */
export const formatDriverMoney = (value, currency = DRIVER_CURRENCY) =>
  Number.isFinite(Number(value)) && Number(value) !== 0
    ? `${Number(value).toLocaleString('fr-FR')} ${currencyLabel(currency)}`
    : '—';
