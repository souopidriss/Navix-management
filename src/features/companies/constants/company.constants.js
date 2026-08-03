/**
 * Navix Companies — Constantes métier du module Entreprises
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les statuts, plans d'abonnement, pays,
 * options de tri et métadonnées d'affichage (libellé, variante Badge, icône).
 * Consommé par les composants, les pages, les filtres et la table.
 */

export const COMPANY_STATUSES = {
  active: { label: 'Active', variant: 'success', icon: 'bi-check-circle' },
  pending: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  suspended: { label: 'Suspendue', variant: 'danger', icon: 'bi-slash-circle' },
  inactive: { label: 'Inactive', variant: 'secondary', icon: 'bi-circle' },
};

export const COMPANY_STATUS_VALUES = Object.keys(COMPANY_STATUSES);

export const SUBSCRIPTION_PLANS = {
  essentials: { label: 'Essentiel', variant: 'info' },
  business: { label: 'Business', variant: 'primary' },
  enterprise: { label: 'Entreprise', variant: 'dark' },
};

export const SUBSCRIPTION_PLAN_VALUES = Object.keys(SUBSCRIPTION_PLANS);

export const SUBSCRIPTION_STATUSES = {
  active: { label: 'Active', variant: 'success' },
  trial: { label: 'Essai', variant: 'info' },
  overdue: { label: 'En retard', variant: 'warning' },
  cancelled: { label: 'Annulée', variant: 'secondary' },
};

export const SUBSCRIPTION_STATUS_VALUES = Object.keys(SUBSCRIPTION_STATUSES);

export const COUNTRIES = [
  'Côte d’Ivoire',
  'Sénégal',
  'Mali',
  'Burkina Faso',
  'Bénin',
  'Togo',
  'Guinée',
  'Cameroun',
  'Gabon',
  'République démocratique du Congo',
];

export const SORT_OPTIONS = [
  { value: 'name', label: 'Nom' },
  { value: 'createdAt', label: 'Date de création' },
  { value: 'vehicleCount', label: 'Véhicules' },
  { value: 'driverCount', label: 'Chauffeurs' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

export const COMPANY_LOGO_ICON = 'bi-building';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const getCompanyStatus = (value) => COMPANY_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getSubscriptionPlan = (value) => SUBSCRIPTION_PLANS[value] || { label: value, variant: 'secondary' };

export const getSubscriptionStatus = (value) => SUBSCRIPTION_STATUSES[value] || { label: value, variant: 'secondary' };
