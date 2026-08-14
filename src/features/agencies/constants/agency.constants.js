/**
 * Navix Agencies — Constantes métier du module Agences / Sites
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les types d'agence, les statuts, les groupes
 * de véhicules (A→G), les options de tri et les métadonnées d'affichage
 * (libellé, variante Badge, icône). Contient également les règles de formatage
 * (dates, montants, coordonnées) et l'heure d'ouverture par défaut.
 * Consommé par les composants, les pages, les filtres, la table et le service.
 */
import { currencyLabel } from '@/utils/format';

export const AGENCY_TYPES = {
  siege: { label: 'Siège', variant: 'primary', icon: 'bi-building' },
  agence: { label: 'Agence', variant: 'info', icon: 'bi-diagram-3' },
  depot: { label: 'Dépôt', variant: 'secondary', icon: 'bi-box-seam' },
  garage: { label: 'Garage', variant: 'success', icon: 'bi-wrench-adjustable' },
  atelier: { label: 'Atelier', variant: 'warning', icon: 'bi-tools' },
  parking: { label: 'Parking', variant: 'secondary', icon: 'bi-p-square' },
  site_operationnel: { label: 'Site opérationnel', variant: 'info', icon: 'bi-geo-alt' },
  autre: { label: 'Autre', variant: 'secondary', icon: 'bi-building-gear' },
};

export const AGENCY_TYPE_VALUES = Object.keys(AGENCY_TYPES);

export const AGENCY_STATUSES = {
  active: { label: 'Active', variant: 'success', icon: 'bi-check-circle' },
  inactive: { label: 'Inactive', variant: 'secondary', icon: 'bi-circle' },
  maintenance: { label: 'En maintenance', variant: 'warning', icon: 'bi-tools' },
  temporarily_closed: { label: 'Temporairement fermée', variant: 'danger', icon: 'bi-pause-circle' },
};

export const AGENCY_STATUS_VALUES = Object.keys(AGENCY_STATUSES);

/** Groupes de véhicules A→G (référence de la flotte). */
export const VEHICLE_GROUPS = {
  A: { label: 'Motos', variant: 'info', icon: 'bi-bicycle' },
  B: { label: 'Véhicules légers', variant: 'primary', icon: 'bi-car-front' },
  C: { label: 'Utilitaires', variant: 'success', icon: 'bi-truck-front' },
  D: { label: 'Camions', variant: 'warning', icon: 'bi-truck' },
  E: { label: 'Engins', variant: 'secondary', icon: 'bi-robot' },
  F: { label: 'Bus', variant: 'info', icon: 'bi-bus-front' },
  G: { label: 'Véhicules spéciaux', variant: 'danger', icon: 'bi-truck-front-fill' },
};

export const VEHICLE_GROUP_VALUES = Object.keys(VEHICLE_GROUPS);

export const SORT_OPTIONS = [
  { value: 'name', label: 'Nom' },
  { value: 'type', label: 'Type' },
  { value: 'city', label: 'Ville' },
  { value: 'createdAt', label: 'Date de création' },
  { value: 'vehicleCount', label: 'Véhicules' },
  { value: 'driverCount', label: 'Chauffeurs' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

export const AGENCY_ICON = 'bi-diagram-3';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

/** Monnaie par défaut des agrégats financiers. */
export const DEFAULT_CURRENCY = 'XAF';

/** Heures d'ouverture proposées par défaut lors de la création. */
export const DEFAULT_OPENING_HOURS = 'Lun–Ven : 08h00–18h00, Sam : 08h00–12h00';

export const getAgencyType = (value) =>
  AGENCY_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getAgencyStatus = (value) =>
  AGENCY_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getVehicleGroup = (value) =>
  VEHICLE_GROUPS[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/** Construit une Date valide à partir d'une date simple (YYYY-MM-DD) ou d'un horodatage ISO. */
const toDate = (value) => {
  const candidate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Formate une date courte (ex. 12 août 2026). */
export const formatAgencyDate = (value) => {
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
export const formatAgencyLongDate = (value) => {
  const date = toDate(value);
  return date
    ? date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';
};

/** Formate une date avec l'heure (ex. 12 août 2026, 14:05). */
export const formatAgencyDateTime = (value) => {
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

/** Formate un montant (ex. 227 240 FCFA). */
export const formatAgencyMoney = (value, currency = DEFAULT_CURRENCY) =>
  Number.isFinite(Number(value)) && Number(value) !== 0
    ? `${Number(value).toLocaleString('fr-FR')} ${currencyLabel(currency)}`
    : '—';

/** Formate une distance (ex. 3 850 km). */
export const formatAgencyDistance = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0
    ? `${Number(value).toLocaleString('fr-FR')} km`
    : '—';

/** Formate des coordonnées géographiques (ex. 5.3599, -4.0083). */
export const formatAgencyCoordinates = (latitude, longitude) => {
  const isValid = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
  return isValid ? `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}` : '—';
};
