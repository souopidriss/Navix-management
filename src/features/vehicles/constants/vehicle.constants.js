/**
 * Navix Vehicles — Constantes métier du module Véhicules
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les groupes A→G, statuts, carburants,
 * transmissions, options de tri et métadonnées d'affichage
 * (libellé, variante Badge, icône). Consommé par les composants,
 * les pages, les filtres, la table et les formulaires.
 */

export const VEHICLE_GROUPS = {
  A: {
    label: 'Motos',
    variant: 'info',
    icon: 'bi-bicycle',
    categories: ['Mototaxi', 'Scooter', 'Moto Sport'],
  },
  B: {
    label: 'Véhicules légers',
    variant: 'primary',
    icon: 'bi-car-front',
    categories: ['Berline', 'Citadine', 'SUV', 'Break'],
  },
  C: {
    label: 'Utilitaires',
    variant: 'success',
    icon: 'bi-truck',
    categories: ['Fourgon', 'Pick-up', 'Camionnette'],
  },
  D: {
    label: 'Camions',
    variant: 'warning',
    icon: 'bi-truck-front',
    categories: ['Camion', 'Semi-remorque', 'Porte-conteneur'],
  },
  E: {
    label: 'Engins',
    variant: 'danger',
    icon: 'bi-gear',
    categories: ['Tracteur', 'Bulldozer', 'Pelle mécanique', 'Chargeuse'],
  },
  F: {
    label: 'Bus',
    variant: 'secondary',
    icon: 'bi-bus-front',
    categories: ['Minibus', 'Bus', 'Autocar'],
  },
  G: {
    label: 'Véhicules spéciaux',
    variant: 'dark',
    icon: 'bi-shield-check',
    categories: ['Ambulance', 'Police', 'Pompiers', 'Grue'],
  },
};

export const VEHICLE_GROUP_VALUES = Object.keys(VEHICLE_GROUPS);

export const VEHICLE_STATUSES = {
  available: { label: 'Disponible', variant: 'success', icon: 'bi-check-circle' },
  in_use: { label: 'En mission', variant: 'info', icon: 'bi-play-circle' },
  maintenance: { label: 'En maintenance', variant: 'warning', icon: 'bi-wrench-adjustable' },
  out_of_service: { label: 'Hors service', variant: 'danger', icon: 'bi-slash-circle' },
};

export const VEHICLE_STATUS_VALUES = Object.keys(VEHICLE_STATUSES);

export const FUEL_TYPES = {
  diesel: { label: 'Diesel' },
  essence: { label: 'Essence' },
  hybride: { label: 'Hybride' },
  electrique: { label: 'Électrique' },
};

export const FUEL_TYPE_VALUES = Object.keys(FUEL_TYPES);

export const TRANSMISSIONS = {
  manuelle: { label: 'Manuelle' },
  automatique: { label: 'Automatique' },
};

export const TRANSMISSION_VALUES = Object.keys(TRANSMISSIONS);

export const SORT_OPTIONS = [
  { value: 'name', label: 'Nom' },
  { value: 'brand', label: 'Marque' },
  { value: 'year', label: 'Année' },
  { value: 'mileage', label: 'Kilométrage' },
  { value: 'createdAt', label: 'Date d’ajout' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

export const VEHICLE_PHOTO_ICON = 'bi-truck';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const MIN_VEHICLE_YEAR = 1980;

export const getVehicleStatus = (value) => VEHICLE_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getVehicleGroup = (value) =>
  VEHICLE_GROUPS[value] || { label: value, variant: 'secondary', icon: 'bi-truck', categories: [] };

/** Renvoie les catégories d'un groupe (liste vide si groupe inconnu). */
export const getGroupCategories = (group) => getVehicleGroup(group).categories;

export const getFuelType = (value) => FUEL_TYPES[value] || { label: value };

export const getTransmission = (value) => TRANSMISSIONS[value] || { label: value };

/** Formate un kilométrage en français (ex. 68 500 km). */
export const formatMileage = (value) => `${Number(value ?? 0).toLocaleString('fr-FR')} km`;

/** Formate une date courte (ex. 12 août 2026). */
export const formatVehicleDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

/**
 * État d'expiration d'un document (assurance, visite technique, etc.).
 * @param {string|undefined} date — date ISO ou 'yyyy-mm-dd'
 * @returns {{ label: string, variant: string }}
 */
export const getExpiryStatus = (date) => {
  if (!date) return { label: 'Non renseignée', variant: 'secondary' };

  const now = Date.now();
  const expiry = new Date(date).getTime();
  const inMs = (days) => days * 24 * 60 * 60 * 1000;

  if (Number.isNaN(expiry)) return { label: 'Non renseignée', variant: 'secondary' };
  if (expiry < now) return { label: 'Expirée', variant: 'danger' };
  if (expiry - now < inMs(30)) return { label: 'Expire bientôt', variant: 'warning' };
  return { label: 'En règle', variant: 'success' };
};
