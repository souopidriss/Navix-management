/**
 * Navix Client — Constantes métier du module Espace Client
 * --------------------------------------------------------------------------
 * Types de clients, statuts des demandes, catégories de services et
 * options de filtrage pour l'espace Client.
 */
export const CLIENT_TYPES = {
  ENTERPRISE: 'enterprise',
  INDIVIDUAL: 'individual',
};

export const CLIENT_TYPE_LABELS = {
  [CLIENT_TYPES.ENTERPRISE]: 'Client Entreprise',
  [CLIENT_TYPES.INDIVIDUAL]: 'Client Particulier',
};

export const REQUEST_STATUSES = {
  PENDING: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  APPROVED: { label: 'Approuvée', variant: 'info', icon: 'bi-check-circle' },
  IN_PROGRESS: { label: 'En cours', variant: 'primary', icon: 'bi-arrow-repeat' },
  COMPLETED: { label: 'Terminée', variant: 'success', icon: 'bi-check2-all' },
  CANCELLED: { label: 'Annulée', variant: 'danger', icon: 'bi-x-circle' },
};

export const SERVICE_CATEGORIES = [
  { id: 'fleet_rental', label: 'Location de flotte', icon: 'bi-truck' },
  { id: 'vip_transport', label: 'Transport VIP / Personnel', icon: 'bi-person-badge' },
  { id: 'logistics_freight', label: 'Fret & Logistique', icon: 'bi-box-seam' },
  { id: 'maintenance_contract', label: 'Contrat de maintenance', icon: 'bi-wrench' },
];

export const DEFAULT_CURRENCY = 'XAF';

export const CAMEROON_CITIES = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Bamenda',
  'Garoua',
  'Maroua',
  'Ngaoundéré',
  'Bertoua',
  'Ebolowa',
  'Kribi',
  'Limbe',
  'Buea',
  'Kumba',
  'Dschang',
  'Nkongsamba',
];
