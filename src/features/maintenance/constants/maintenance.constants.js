/**
 * Navix Maintenance — Constantes métier du module Entretiens
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les types d'entretien, les priorités, les
 * statuts, les options de tri et les métadonnées d'affichage (libellé,
 * variante Badge, icône). Contient également les règles métier simulées :
 * alerte « date proche », « kilométrage proche », « retard », « urgence » et
 * « véhicule immobilisé ». Consommé par les composants, les pages, les
 * filtres, la table, le calendrier et le service.
 */
import { currencyLabel } from '@/utils/format';

export const MAINTENANCE_TYPES = {
  vidange: { label: 'Vidange', variant: 'info', icon: 'bi-droplet-half' },
  revision: { label: 'Révision', variant: 'primary', icon: 'bi-clipboard-check' },
  controle_technique: { label: 'Contrôle technique', variant: 'secondary', icon: 'bi-patch-check' },
  freinage: { label: 'Freinage', variant: 'danger', icon: 'bi-speedometer2' },
  pneumatiques: { label: 'Pneumatiques', variant: 'dark', icon: 'bi-record-circle' },
  batterie: { label: 'Batterie', variant: 'success', icon: 'bi-battery-charging' },
  moteur: { label: 'Moteur', variant: 'warning', icon: 'bi-gear' },
  transmission: { label: 'Transmission', variant: 'primary', icon: 'bi-arrow-left-right' },
  suspension: { label: 'Suspension', variant: 'secondary', icon: 'bi-arrows-collapse' },
  climatisation: { label: 'Climatisation', variant: 'info', icon: 'bi-snow' },
  carrosserie: { label: 'Carrosserie', variant: 'warning', icon: 'bi-truck-front' },
  reparation: { label: 'Réparation', variant: 'danger', icon: 'bi-tools' },
  inspection: { label: 'Inspection', variant: 'success', icon: 'bi-search' },
  autre: { label: 'Autre', variant: 'secondary', icon: 'bi-wrench-adjustable' },
};

export const MAINTENANCE_TYPE_VALUES = Object.keys(MAINTENANCE_TYPES);

export const MAINTENANCE_PRIORITIES = {
  low: { label: 'Faible', variant: 'success', icon: 'bi-arrow-down', order: 1 },
  normal: { label: 'Normale', variant: 'info', icon: 'bi-arrow-right', order: 2 },
  high: { label: 'Haute', variant: 'warning', icon: 'bi-arrow-up', order: 3 },
  urgent: { label: 'Urgente', variant: 'danger', icon: 'bi-exclamation-triangle', order: 4 },
};

export const MAINTENANCE_PRIORITY_VALUES = Object.keys(MAINTENANCE_PRIORITIES);

export const MAINTENANCE_STATUSES = {
  planned: { label: 'Prévu', variant: 'secondary', icon: 'bi-calendar2-event' },
  pending: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  in_progress: { label: 'En cours', variant: 'primary', icon: 'bi-gear-wide-connected' },
  completed: { label: 'Terminé', variant: 'success', icon: 'bi-check2-circle' },
  cancelled: { label: 'Annulé', variant: 'danger', icon: 'bi-x-circle' },
};

export const MAINTENANCE_STATUS_VALUES = Object.keys(MAINTENANCE_STATUSES);

/** Statuts qui clôturent un entretien (aucune alerte de suivi). */
export const MAINTENANCE_FINISHED_STATUSES = ['completed', 'cancelled'];

/** Statuts considérés comme immobilisant le véhicule. */
export const MAINTENANCE_IMMOBILIZING_STATUSES = ['in_progress'];

/** Périodes disponibles pour le filtre « Période ». */
export const PERIOD_OPTIONS = [
  { value: '', label: 'Toutes les périodes' },
  { value: 'current', label: 'En cours' },
  { value: 'month', label: 'Ce mois-ci' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' },
];

export const PERIOD_VALUES = PERIOD_OPTIONS.map((period) => period.value);

export const SORT_OPTIONS = [
  { value: 'scheduledDate', label: 'Date' },
  { value: 'actualCost', label: 'Coût' },
  { value: 'mileage', label: 'Kilométrage' },
  { value: 'priority', label: 'Priorité' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

export const MAINTENANCE_ICON = 'bi-wrench-adjustable';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

/** Monnaie par défaut des entretiens. */
export const DEFAULT_CURRENCY = 'XAF';

/**
 * Seuils d'alerte (règles métier simulées).
 *   nextMaintenanceWithinDays : un entretien « date proche » si le prochain
 *       entretien a lieu dans les N prochains jours.
 *   mileageThresholdKm        : un entretien « kilométrage proche » si le
 *       kilométrage actuel du véhicule est à moins de N km du prochain seuil.
 */
export const MAINTENANCE_ALERT = {
  nextMaintenanceWithinDays: 30,
  mileageThresholdKm: 2000,
};

export const getMaintenanceType = (value) =>
  MAINTENANCE_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getMaintenancePriority = (value) =>
  MAINTENANCE_PRIORITIES[value] || { label: value, variant: 'secondary', icon: 'bi-circle', order: 99 };

export const getMaintenanceStatus = (value) =>
  MAINTENANCE_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/** Ordre numérique d'une priorité (pour le tri). */
export const getMaintenancePriorityOrder = (value) =>
  MAINTENANCE_PRIORITIES[value]?.order ?? Number.MAX_SAFE_INTEGER;

/** Indique si un entretien est clôturé (Terminé ou Annulé). */
export const isMaintenanceFinished = (maintenance = {}) =>
  MAINTENANCE_FINISHED_STATUSES.includes(maintenance.status);

/** Indique si un entretien immobilise le véhicule (en cours). */
export const isMaintenanceImmobilizing = (maintenance = {}) =>
  MAINTENANCE_IMMOBILIZING_STATUSES.includes(maintenance.status);

/**
 * Alerte « retard » : entretien non clôturé dont la date prévue est dépassée
 * OU dont le prochain seuil kilométrique est déjà atteint par le véhicule.
 */
export const isMaintenanceLate = (maintenance = {}, vehicle = {}) => {
  if (isMaintenanceFinished(maintenance)) return false;

  const dateLate =
    maintenance.nextMaintenanceDate && maintenance.nextMaintenanceDate < todayKey();
  const mileageLate =
    maintenance.nextMileage &&
    Number(vehicle.mileage ?? 0) >= Number(maintenance.nextMileage);

  return Boolean(dateLate || mileageLate);
};

/** Alerte « date proche » : prochain entretien dans les N prochains jours. */
export const isMaintenanceDateDueSoon = (maintenance = {}) => {
  if (isMaintenanceFinished(maintenance) || !maintenance.nextMaintenanceDate) return false;

  const today = new Date();
  const next = new Date(`${maintenance.nextMaintenanceDate}T00:00:00`);
  const diffDays = Math.round((next.getTime() - today.getTime()) / 86_400_000);

  return diffDays >= 0 && diffDays <= MAINTENANCE_ALERT.nextMaintenanceWithinDays;
};

/** Alerte « kilométrage proche » : le véhicule approche du prochain seuil. */
export const isMaintenanceMileageDueSoon = (maintenance = {}, vehicle = {}) => {
  if (isMaintenanceFinished(maintenance) || !maintenance.nextMileage) return false;

  const remaining = Number(maintenance.nextMileage) - Number(vehicle.mileage ?? 0);

  return remaining >= 0 && remaining <= MAINTENANCE_ALERT.mileageThresholdKm;
};

/** Alerte « urgence » : priorité urgente et entretien non clôturé. */
export const isMaintenanceUrgent = (maintenance = {}) =>
  maintenance.priority === 'urgent' && !isMaintenanceFinished(maintenance);

/** Clé de date locale (YYYY-MM-DD) pour le jour courant. */
const todayKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/** Construit une Date valide à partir d'une date simple (YYYY-MM-DD) ou d'un horodatage ISO. */
const toDate = (value) => {
  const candidate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Formate une date courte (ex. 12 août 2026). */
export const formatMaintenanceDate = (value) => {
  const date = toDate(value);
  return date
    ? date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';
};

/** Formate une date longue (ex. 12 août 2026). */
export const formatMaintenanceLongDate = (value) => {
  const date = toDate(value);
  return date
    ? date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';
};

/** Formate un montant (ex. 38 250 FCFA). */
export const formatMaintenanceMoney = (value, currency = DEFAULT_CURRENCY) =>
  Number.isFinite(Number(value)) && Number(value) !== 0
    ? `${Number(value).toLocaleString('fr-FR')} ${currencyLabel(currency)}`
    : '—';

/** Formate un kilométrage en français (ex. 68 350 km). */
export const formatMaintenanceMileage = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0
    ? `${Number(value).toLocaleString('fr-FR')} km`
    : '—';
