/**
 * Navix Reports — Constantes métier du module Rapports & analytics
 * --------------------------------------------------------------------------
 * Source unique de vérité pour :
 *   - les catégories de rapports (parc, véhicules, carburant, finances, …)
 *   - les périodes d'analyse (aujourd'hui, 7 derniers jours, ce mois, …)
 *   - les sources du rapport personnalisé
 *   - les statuts de rapport enregistré (brouillon, actif, archivé)
 *   - le tri, la pagination et le formatage (montant, taux, variation)
 *
 * Aucune couleur codée en dur : variantes sémantiques qui mappent les tokens
 * CSS existants (--navix-* / --bs-*). Chaque catégorie référence sa route
 * (`ROUTES.*`) et la permission RBAC requise.
 */

import { ROUTES } from '@/routes/route.constants';
import { currencyLabel } from '@/utils/format';

/* --------------------------------------------------------------------------
   Catégories de rapports
   -------------------------------------------------------------------------- */

/**
 * Catégories de rapports disponibles dans le module.
 * `permission` = permission RBAC minimale requise pour ouvrir la catégorie
 * (les catégories financières et sensibles sont restreintes).
 */
export const REPORT_TYPES = {
  fleet: {
    id: 'fleet',
    label: 'Parc automobile',
    description: 'Vue d’ensemble de la flotte : répartition, statuts, disponibilité.',
    icon: 'bi-truck',
    variant: 'info',
    route: ROUTES.REPORTS_FLEET,
    permission: 'reports.view',
  },
  vehicles: {
    id: 'vehicles',
    label: 'Véhicules',
    description: 'Détail par véhicule : kilométrage, groupe, coûts et usage.',
    icon: 'bi-truck-front',
    variant: 'primary',
    route: ROUTES.REPORTS_VEHICLES,
    permission: 'reports.view',
  },
  drivers: {
    id: 'drivers',
    label: 'Chauffeurs',
    description: 'Activité des chauffeurs : trajets, consommations, performance.',
    icon: 'bi-person-badge',
    variant: 'primary',
    route: ROUTES.REPORTS_DRIVERS,
    permission: 'reports.view',
  },
  assignments: {
    id: 'assignments',
    label: 'Affectations',
    description: 'Historique et disponibilité des affectations véhicule ↔ chauffeur.',
    icon: 'bi-shuffle',
    variant: 'info',
    route: ROUTES.REPORTS_ASSIGNMENTS,
    permission: 'reports.view',
  },
  trips: {
    id: 'trips',
    label: 'Trajets',
    description: 'Volume de trajets, distances parcourues et motifs.',
    icon: 'bi-signpost-split',
    variant: 'info',
    route: ROUTES.REPORTS_TRIPS,
    permission: 'reports.view',
  },
  fuel: {
    id: 'fuel',
    label: 'Carburant',
    description: 'Consommations, coûts et anomalies de plein.',
    icon: 'bi-fuel-pump',
    variant: 'warning',
    route: ROUTES.REPORTS_FUEL,
    permission: 'reports.view',
  },
  maintenance: {
    id: 'maintenance',
    label: 'Entretiens',
    description: 'Coûts d’entretien, délais et fiabilité de la flotte.',
    icon: 'bi-wrench-adjustable',
    variant: 'warning',
    route: ROUTES.REPORTS_MAINTENANCE,
    permission: 'reports.view',
  },
  documents: {
    id: 'documents',
    label: 'Documents',
    description: 'Expirations de documents, conformité par véhicule.',
    icon: 'bi-file-earmark-text',
    variant: 'warning',
    route: ROUTES.REPORTS_DOCUMENTS,
    permission: 'reports.view',
  },
  financial: {
    id: 'financial',
    label: 'Finances',
    description: 'Coûts de flotte, factures, paiements et tendances.',
    icon: 'bi-cash-coin',
    variant: 'success',
    route: ROUTES.REPORTS_FINANCIAL,
    permission: 'reports.viewFinancial',
  },
  subscriptions: {
    id: 'subscriptions',
    label: 'Abonnements',
    description: 'Plans, revenus récurrents et consommation de quotas.',
    icon: 'bi-credit-card',
    variant: 'primary',
    route: ROUTES.REPORTS_SUBSCRIPTIONS,
    permission: 'reports.view',
  },
  audit: {
    id: 'audit',
    label: 'Journal des actions',
    description: 'Activité, tentatives échouées et événements sensibles.',
    icon: 'bi-journal-text',
    variant: 'dark',
    route: ROUTES.REPORTS_AUDIT,
    permission: 'reports.viewSensitive',
  },
  companies: {
    id: 'companies',
    label: 'Entreprises',
    description: 'Comparaison multi-entreprises et consolidation de la plateforme.',
    icon: 'bi-buildings',
    variant: 'primary',
    route: ROUTES.REPORTS_COMPANIES,
    permission: 'reports.view',
  },
  custom: {
    id: 'custom',
    label: 'Rapports personnalisés',
    description: 'Construisez un rapport à partir de vos propres indicateurs.',
    icon: 'bi-sliders',
    variant: 'secondary',
    route: ROUTES.REPORTS_CUSTOM,
    permission: 'reports.create',
  },
};

export const REPORT_TYPE_VALUES = Object.keys(REPORT_TYPES);

/** @returns {{ id, label, description, icon, variant, route, permission }} méta d'une catégorie (défauts sûrs). */
export const getReportType = (value) =>
  REPORT_TYPES[value] || {
    id: value,
    label: value,
    description: '',
    icon: 'bi-file-earmark-bar-graph',
    variant: 'secondary',
    route: ROUTES.REPORTS,
    permission: 'reports.view',
  };

/** Catégories visibles selon les permissions de l'utilisateur (filtre pur). */
export const filterReportTypesByPermission = (permissions = []) =>
  REPORT_TYPE_VALUES.filter((key) => permissions.includes(REPORT_TYPES[key].permission));

/* --------------------------------------------------------------------------
   Périodes d'analyse
   -------------------------------------------------------------------------- */

export const REPORT_PERIODS = {
  today: { label: 'Aujourd’hui' },
  yesterday: { label: 'Hier' },
  last7: { label: '7 derniers jours' },
  last30: { label: '30 derniers jours' },
  last90: { label: '3 derniers mois' },
  last180: { label: '6 derniers mois' },
  last365: { label: '12 derniers mois' },
  thisWeek: { label: 'Cette semaine' },
  lastWeek: { label: 'Semaine précédente' },
  thisMonth: { label: 'Ce mois' },
  lastMonth: { label: 'Mois précédent' },
  thisQuarter: { label: 'Ce trimestre' },
  lastQuarter: { label: 'Trimestre précédent' },
  thisYear: { label: 'Cette année' },
  lastYear: { label: 'Année précédente' },
  custom: { label: 'Personnalisée' },
};

export const REPORT_PERIOD_VALUES = Object.keys(REPORT_PERIODS);

export const getReportPeriod = (value) => REPORT_PERIODS[value] || { label: value };

/** Périodes de comparaison de la période précédente (hors presets relatifs). */
export const COMPARABLE_PERIODS = REPORT_PERIOD_VALUES.filter(
  (period) => !['today', 'yesterday', 'custom'].includes(period),
);

/** Période par défaut (ce mois). */
export const DEFAULT_REPORT_PERIOD = 'thisMonth';

/** Nombre de mois couverts par les évolutions mensuelles des rapports. */
export const TREND_MONTHS = 6;

/** Nombre de points d'un graphique sparkline. */
export const SPARKLINE_POINTS = 12;

/* --------------------------------------------------------------------------
   Sources du rapport personnalisé
   -------------------------------------------------------------------------- */

export const CUSTOM_REPORT_SOURCES = {
  fleet: { id: 'fleet', label: 'Parc automobile', icon: 'bi-truck' },
  vehicles: { id: 'vehicles', label: 'Véhicules', icon: 'bi-truck-front' },
  drivers: { id: 'drivers', label: 'Chauffeurs', icon: 'bi-person-badge' },
  assignments: { id: 'assignments', label: 'Affectations', icon: 'bi-shuffle' },
  trips: { id: 'trips', label: 'Trajets', icon: 'bi-signpost-split' },
  fuel: { id: 'fuel', label: 'Carburant', icon: 'bi-fuel-pump' },
  maintenance: { id: 'maintenance', label: 'Entretiens', icon: 'bi-wrench-adjustable' },
  documents: { id: 'documents', label: 'Documents', icon: 'bi-file-earmark-text' },
  invoices: { id: 'invoices', label: 'Factures', icon: 'bi-receipt' },
  payments: { id: 'payments', label: 'Paiements', icon: 'bi-cash-coin' },
  audit: { id: 'audit', label: 'Journal des actions', icon: 'bi-journal-text' },
};

export const CUSTOM_REPORT_SOURCE_VALUES = Object.keys(CUSTOM_REPORT_SOURCES);

export const getCustomReportSource = (value) =>
  CUSTOM_REPORT_SOURCES[value] || { id: value, label: value, icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Statuts de rapport enregistré
   -------------------------------------------------------------------------- */

export const REPORT_STATUSES = {
  draft: { label: 'Brouillon', variant: 'info', icon: 'bi-pencil' },
  active: { label: 'Actif', variant: 'success', icon: 'bi-check-circle' },
  archived: { label: 'Archivé', variant: 'dark', icon: 'bi-archive' },
};

export const REPORT_STATUS_VALUES = Object.keys(REPORT_STATUSES);

export const getReportStatus = (value) =>
  REPORT_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Formats d'export pris en charge (architecture préparée).
   Le CSV/JSON sont générés côté client ; xlsx/pdf sont simulés.
   -------------------------------------------------------------------------- */

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'pdf', label: 'PDF' },
];

export const EXPORT_FORMAT_VALUES = EXPORT_FORMATS.map((format) => format.value);

/* --------------------------------------------------------------------------
   Tri, pagination, formatage
   -------------------------------------------------------------------------- */

export const REPORTS_ICON = 'bi-file-earmark-bar-graph';

export const DEFAULT_CURRENCY = 'XAF';

export const DEFAULT_PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/** Formate un montant (ex. 2 450 000 FCFA). */
export const formatReportMoney = (value, currency = DEFAULT_CURRENCY) =>
  Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('fr-FR')} ${currencyLabel(currency)}` : '—';

/** Formate un montant court (ex. 2,45 M FCFA). */
export const formatReportCompactMoney = (value, currency = DEFAULT_CURRENCY) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} M`;
  if (Math.abs(amount) >= 1_000) return `${(amount / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k`;
  return `${amount.toLocaleString('fr-FR')} ${currencyLabel(currency)}`;
};

/** Formate un nombre (ex. 12 450). */
export const formatReportNumber = (value) =>
  Number.isFinite(Number(value)) ? Number(value).toLocaleString('fr-FR') : '—';

/** Formate un taux (ex. 84 %). */
export const formatReportPercent = (value) =>
  Number.isFinite(Number(value)) ? `${Math.round(Number(value) * 100) / 100} %` : '—';

/** Formate une distance (ex. 68 500 km). */
export const formatReportDistance = (value) =>
  Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('fr-FR')} km` : '—';

/** Formate une durée en heures (ex. 12 h 30). */
export const formatReportDuration = (value) => {
  const hours = Number(value);
  if (!Number.isFinite(hours)) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m}`;
};

/** Formate une date courte (ex. 12 août 2026). */
export const formatReportDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

/** Formate une date + heure (ex. 12 août 2026, 14:05). */
export const formatReportDateTime = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

/**
 * Calcule la variation relative entre deux valeurs (en %).
 * @param {number} current — valeur de la période courante
 * @param {number} previous — valeur de la période précédente
 * @returns {number|null} — pourcentage (null si non calculable)
 */
export const computeVariation = (current, previous) => {
  const cur = Number(current);
  const prev = Number(previous);
  if (!Number.isFinite(cur) || !Number.isFinite(prev) || prev === 0) return null;
  return ((cur - prev) / Math.abs(prev)) * 100;
};

/**
 * Sens de la variation pour le badge (amélioration = up pour la plupart des
 * métriques ; un coût en baisse peut être souhaitable via `invert`).
 * @returns {'up'|'down'|'neutral'}
 */
export const getVariationDirection = (variation, { invert = false } = {}) => {
  if (!Number.isFinite(variation)) return 'neutral';
  if (variation === 0) return 'neutral';
  const positive = invert ? variation < 0 : variation > 0;
  return positive ? 'up' : 'down';
};

/** Formate une variation en chaîne signée (ex. +12,4 %). */
export const formatVariation = (variation) => {
  if (!Number.isFinite(variation)) return '—';
  const sign = variation > 0 ? '+' : '';
  return `${sign}${variation.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
};
