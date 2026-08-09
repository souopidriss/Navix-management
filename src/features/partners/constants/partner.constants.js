/**
 * Navix Partners — Constantes métier du module Partenaires
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les types de partenaires, les statuts, les
 * options de tri et les métadonnées d'affichage (libellé, variante Badge,
 * icône). Consommé par les composants, les pages, les filtres, la table,
 * le formulaire et le service.
 *
 * La liste des pays est réutilisée depuis le module Entreprises (COUNTRIES)
 * afin de ne pas dupliquer de données de référence.
 */

export const PARTNER_TYPES = {
  vehicle_supplier: { label: 'Fournisseur de véhicules', variant: 'primary', icon: 'bi-truck' },
  fuel_supplier: { label: 'Fournisseur de carburant', variant: 'warning', icon: 'bi-fuel-pump' },
  maintenance_provider: { label: 'Prestataire de maintenance', variant: 'info', icon: 'bi-tools' },
  parts_supplier: { label: 'Fournisseur de pièces', variant: 'secondary', icon: 'bi-gear' },
  insurer: { label: 'Assureur', variant: 'success', icon: 'bi-shield-check' },
  rental_company: { label: 'Société de location', variant: 'dark', icon: 'bi-key' },
  service_provider: { label: 'Prestataire de services', variant: 'info', icon: 'bi-briefcase' },
  other: { label: 'Autre', variant: 'secondary', icon: 'bi-building' },
};

export const PARTNER_TYPE_VALUES = Object.keys(PARTNER_TYPES);

export const PARTNER_STATUSES = {
  active: { label: 'Actif', variant: 'success', icon: 'bi-check-circle' },
  inactive: { label: 'Inactif', variant: 'secondary', icon: 'bi-circle' },
};

export const PARTNER_STATUS_VALUES = Object.keys(PARTNER_STATUSES);

export const PARTNER_SORT_OPTIONS = [
  { value: 'name', label: 'Nom' },
  { value: 'type', label: 'Type' },
  { value: 'city', label: 'Ville' },
  { value: 'createdAt', label: 'Date de création' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

export const PARTNER_ICON = 'bi-handshake';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const getPartnerType = (value) =>
  PARTNER_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-building' };

export const getPartnerStatus = (value) =>
  PARTNER_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/** Formate une date en date courte locale (ex. 12 août 2026). */
export const formatPartnerDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
};

/** Formate une date en date longue locale (ex. 12 août 2026). */
export const formatPartnerLongDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
};
