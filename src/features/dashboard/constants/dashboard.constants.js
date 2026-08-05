/**
 * Navix Dashboard — Constantes métier du module Tableau de bord
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les périodes d'analyse, les types et niveaux
 * d'alerte, les types d'activité, les actions rapides et les métadonnées
 * d'affichage (libellé, variante Badge, icône). Consommé par le service,
 * le store, les hooks, les composants et la page.
 */

/** Périodes d'analyse disponibles pour le filtre global du tableau de bord. */
export const PERIOD_OPTIONS = [
  { value: 'today', label: "Aujourd'hui", icon: 'bi-sun' },
  { value: 'week', label: '7 derniers jours', icon: 'bi-calendar-week' },
  { value: 'month', label: 'Ce mois-ci', icon: 'bi-calendar-month' },
  { value: 'quarter', label: 'Ce trimestre', icon: 'bi-calendar-range' },
  { value: 'year', label: 'Cette année', icon: 'bi-calendar3' },
  { value: 'custom', label: 'Période personnalisée', icon: 'bi-calendar-event' },
];

export const PERIOD_VALUES = PERIOD_OPTIONS.map((period) => period.value);

export const DEFAULT_PERIOD = 'month';

export const getPeriodOption = (value) =>
  PERIOD_OPTIONS.find((period) => period.value === value) || PERIOD_OPTIONS[2];

/** Types d'alerte consolidés sur le tableau de bord. */
export const ALERT_TYPES = {
  maintenance_urgent: { label: 'Entretien urgent', variant: 'danger', icon: 'bi-exclamation-triangle' },
  maintenance_late: { label: 'Entretien en retard', variant: 'danger', icon: 'bi-alarm' },
  maintenance_due: { label: 'Entretien à prévoir', variant: 'warning', icon: 'bi-calendar2-week' },
  document_expiring: { label: 'Document expirant', variant: 'warning', icon: 'bi-file-earmark-excel' },
  vehicle_immobilized: { label: 'Véhicule immobilisé', variant: 'danger', icon: 'bi-slash-circle' },
  fuel_anomaly: { label: 'Consommation anormale', variant: 'warning', icon: 'bi-fuel-pump' },
  insurance_expiry: { label: 'Assurance proche de l’échéance', variant: 'info', icon: 'bi-shield-check' },
  inspection_expiry: { label: 'Visite technique proche', variant: 'info', icon: 'bi-clipboard-check' },
};

export const ALERT_TYPE_VALUES = Object.keys(ALERT_TYPES);

export const getAlertType = (value) =>
  ALERT_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/** Niveaux de gravité des alertes. */
export const ALERT_SEVERITIES = {
  critical: { label: 'Critique', variant: 'danger', icon: 'bi-exclamation-octagon' },
  warning: { label: 'Avertissement', variant: 'warning', icon: 'bi-exclamation-triangle' },
  info: { label: 'Information', variant: 'info', icon: 'bi-info-circle' },
};

export const ALERT_SEVERITY_VALUES = Object.keys(ALERT_SEVERITIES);

export const getAlertSeverity = (value) =>
  ALERT_SEVERITIES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/** Types d'activité récente affichés sur la frise chronologique. */
export const ACTIVITY_TYPES = {
  trip_created: { label: 'Trajet créé', icon: 'bi-signpost-split' },
  trip_completed: { label: 'Trajet terminé', icon: 'bi-flag' },
  fuel_created: { label: 'Plein ajouté', icon: 'bi-fuel-pump' },
  fuel_validated: { label: 'Plein validé', icon: 'bi-check2-circle' },
  maintenance_created: { label: 'Entretien planifié', icon: 'bi-wrench-adjustable' },
  maintenance_completed: { label: 'Entretien terminé', icon: 'bi-check2-circle' },
  document_uploaded: { label: 'Document ajouté', icon: 'bi-file-earmark-plus' },
  vehicle_created: { label: 'Véhicule ajouté', icon: 'bi-truck' },
  vehicle_status: { label: 'Statut véhicule modifié', icon: 'bi-arrow-repeat' },
  driver_created: { label: 'Chauffeur ajouté', icon: 'bi-person-plus' },
};

export const ACTIVITY_TYPE_VALUES = Object.keys(ACTIVITY_TYPES);

export const getActivityType = (value) =>
  ACTIVITY_TYPES[value] || { label: value, icon: 'bi-activity' };

/** Actions rapides du tableau de bord (liens vers les modules). */
export const QUICK_ACTIONS = [
  { key: 'vehicle', label: 'Ajouter un véhicule', icon: 'bi-truck', to: '/dashboard/vehicles/new' },
  { key: 'driver', label: 'Ajouter un chauffeur', icon: 'bi-person-plus', to: '/dashboard/drivers/new' },
  { key: 'trip', label: 'Créer un trajet', icon: 'bi-signpost-split', to: '/dashboard/trips/new' },
  { key: 'fuel', label: 'Enregistrer un plein', icon: 'bi-fuel-pump', to: '/dashboard/fuel/new' },
  { key: 'maintenance', label: 'Planifier un entretien', icon: 'bi-wrench-adjustable', to: '/dashboard/maintenance/new' },
  { key: 'document', label: 'Ajouter un document', icon: 'bi-file-earmark-plus', to: '/dashboard/files/new' },
];

/** Monnaie par défaut des montants du tableau de bord. */
export const DEFAULT_CURRENCY = 'XOF';

/** Nombre de lignes affichées dans les classements (top véhicules / chauffeurs). */
export const TOP_LIMIT = 5;

/** Nombre d'activités récentes affichées. */
export const ACTIVITY_LIMIT = 6;

/** Nombre d'alertes affichées. */
export const ALERT_LIMIT = 8;

/** Nombre de mois couverts par les évolutions mensuelles. */
export const TREND_MONTHS = 6;

/** Formate un montant (ex. 2 450 000 XOF). */
export const formatDashboardMoney = (value, currency = DEFAULT_CURRENCY) =>
  Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('fr-FR')} ${currency}` : '—';

/** Formate un taux (ex. 84 %). */
export const formatDashboardRate = (value) =>
  Number.isFinite(Number(value)) ? `${Math.round(Number(value))} %` : '—';

/** Formate un kilométrage en français (ex. 68 500 km). */
export const formatDashboardDistance = (value) =>
  Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('fr-FR')} km` : '—';

/** Formate une date courte (ex. 12 août 2026). */
export const formatDashboardDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

/** Formate une date + heure (ex. 12 août 2026, 14:05). */
export const formatDashboardDateTime = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
