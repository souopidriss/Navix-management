/**
 * Navix Trips — Constantes métier du module Trajets
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les types, statuts, options de tri et
 * métadonnées d'affichage (libellé, variante Badge, icône). Consommé par
 * les composants, les pages, les filtres, la table et les formulaires.
 */

export const TRIP_TYPES = {
  mission: { label: 'Mission', variant: 'warning', icon: 'bi-send' },
  delivery: { label: 'Livraison', variant: 'primary', icon: 'bi-box-seam' },
  transport: { label: 'Transport', variant: 'info', icon: 'bi-truck' },
  service: { label: 'Service', variant: 'success', icon: 'bi-person-check' },
  maintenance: { label: 'Maintenance', variant: 'danger', icon: 'bi-wrench-adjustable' },
  personnel: { label: 'Personnel', variant: 'secondary', icon: 'bi-person-badge' },
  trial: { label: 'Essai', variant: 'dark', icon: 'bi-patch-check' },
};

export const TRIP_TYPE_VALUES = Object.keys(TRIP_TYPES);

export const TRIP_STATUSES = {
  planned: { label: 'Prévu', variant: 'info', icon: 'bi-calendar2-check' },
  in_progress: { label: 'En cours', variant: 'primary', icon: 'bi-play-circle' },
  completed: { label: 'Terminé', variant: 'success', icon: 'bi-check2-circle' },
  cancelled: { label: 'Annulé', variant: 'danger', icon: 'bi-x-circle' },
  suspended: { label: 'Suspendu', variant: 'warning', icon: 'bi-pause-circle' },
};

export const TRIP_STATUS_VALUES = Object.keys(TRIP_STATUSES);

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
  { value: 'departureDate', label: 'Date de départ' },
  { value: 'arrivalDate', label: 'Date d’arrivée' },
  { value: 'distance', label: 'Distance' },
  { value: 'duration', label: 'Durée' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

export const TRIP_ICON = 'bi-signpost-split';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const getTripType = (value) =>
  TRIP_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getTripStatus = (value) =>
  TRIP_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/** Formate une date courte (ex. 12 août 2026). */
export const formatTripDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

/** Formate une date longue (ex. 12 août 2026). */
export const formatTripLongDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

/** Formate une date et une heure (ex. 12 août 2026 · 07:30). */
export const formatTripDateTime = (date, time) => {
  if (!date) return '—';
  const dateLabel = formatTripDate(date);
  return time ? `${dateLabel} · ${time}` : dateLabel;
};

/** Formate une distance en kilomètres (ex. 385 km). */
export const formatTripDistance = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0 ? `${Number(value).toLocaleString('fr-FR')} km` : '—';

/** Formate un kilométrage en français (ex. 68 500 km). */
export const formatTripMileage = (value) =>
  Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('fr-FR')} km` : '—';

/** Formate une durée en minutes (ex. « 6 h 25 » ou « 45 min »). */
export const formatTripDuration = (value) => {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return '—';

  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);

  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${String(rest).padStart(2, '0')}`;
};

/** Formate une vitesse moyenne (ex. 56 km/h). */
export const formatTripSpeed = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0 ? `${Number(value).toLocaleString('fr-FR')} km/h` : '—';

/** Calcule la durée (en minutes) entre une date/heure de départ et d'arrivée. */
export const getTripDurationMinutes = ({ departureDate = '', departureTime = '', arrivalDate = '', arrivalTime = '' } = {}) => {
  if (!departureDate || !arrivalDate) return null;

  const start = new Date(`${departureDate}T${departureTime || '00:00'}:00`).getTime();
  const end = new Date(`${arrivalDate}T${arrivalTime || '00:00'}:00`).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return Math.max(0, Math.round((end - start) / 60000));
};
