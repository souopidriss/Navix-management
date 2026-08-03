/**
 * Navix Assignments — Constantes métier du module Affectations
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les types, statuts, options de tri et
 * métadonnées d'affichage (libellé, variante Badge, icône). Consommé par
 * les composants, les pages, les filtres, la table et les formulaires.
 */

export const ASSIGNMENT_TYPES = {
  permanent: { label: 'Permanente', variant: 'primary', icon: 'bi-infinity' },
  temporary: { label: 'Temporaire', variant: 'info', icon: 'bi-clock-history' },
  mission: { label: 'Mission', variant: 'warning', icon: 'bi-send' },
  replacement: { label: 'Remplacement', variant: 'secondary', icon: 'bi-arrow-repeat' },
  maintenance: { label: 'Maintenance', variant: 'danger', icon: 'bi-wrench-adjustable' },
  trial: { label: 'Essai', variant: 'success', icon: 'bi-patch-check' },
};

export const ASSIGNMENT_TYPE_VALUES = Object.keys(ASSIGNMENT_TYPES);

export const ASSIGNMENT_STATUSES = {
  planned: { label: 'Prévue', variant: 'info', icon: 'bi-calendar2-check' },
  active: { label: 'Active', variant: 'success', icon: 'bi-play-circle' },
  completed: { label: 'Terminée', variant: 'secondary', icon: 'bi-check2-circle' },
  cancelled: { label: 'Annulée', variant: 'danger', icon: 'bi-x-circle' },
  suspended: { label: 'Suspendue', variant: 'warning', icon: 'bi-pause-circle' },
};

export const ASSIGNMENT_STATUS_VALUES = Object.keys(ASSIGNMENT_STATUSES);

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
  { value: 'startDate', label: 'Date de début' },
  { value: 'endDate', label: 'Date de fin' },
  { value: 'company', label: 'Entreprise' },
  { value: 'driver', label: 'Chauffeur' },
  { value: 'vehicle', label: 'Véhicule' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

export const ASSIGNMENT_ICON = 'bi-shuffle';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const getAssignmentType = (value) =>
  ASSIGNMENT_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getAssignmentStatus = (value) =>
  ASSIGNMENT_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/** Formate une date courte (ex. 12 août 2026). */
export const formatAssignmentDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

/** Formate une date longue (ex. 12 août 2026). */
export const formatAssignmentLongDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

/** Formate un kilométrage en français (ex. 68 500 km). */
export const formatAssignmentMileage = (value) =>
  Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('fr-FR')} km` : '—';

/** Calcule la durée (en jours) entre deux dates. */
export const getDurationDays = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return Math.max(0, Math.round((end - start) / (24 * 60 * 60 * 1000)));
};

/** Libellé de durée lisible (ex. « 45 jours » ou « 2 mois »). */
export const formatAssignmentDuration = (startDate, endDate) => {
  const days = getDurationDays(startDate, endDate);

  if (days === null) return '—';
  if (days === 0) return 'Moins d’un jour';
  if (days < 30) return `${days} jour${days > 1 ? 's' : ''}`;
  if (days < 365) {
    const months = Math.round(days / 30.44);
    return `${months} mois`;
  }
  const years = (days / 365.25).toFixed(1).replace('.', ',');
  return `${years} an${Number(years) > 1 ? 's' : ''}`;
};

/**
 * État de l'affectation vis-à-vis de la date de fin prévue.
 * @param {object} assignment
 * @returns {{ label: string, variant: string } | null}
 */
export const getAssignmentProgress = (assignment = {}) => {
  if (!assignment.expectedEndDate || assignment.status !== 'active') return null;

  const now = Date.now();
  const expectedEnd = new Date(assignment.expectedEndDate).getTime();
  const inMs = (days) => days * 24 * 60 * 60 * 1000;

  if (Number.isNaN(expectedEnd)) return null;
  if (expectedEnd < now) return { label: 'En retard', variant: 'danger' };
  if (expectedEnd - now < inMs(14)) return { label: 'Se termine bientôt', variant: 'warning' };
  return { label: 'Dans les temps', variant: 'success' };
};
