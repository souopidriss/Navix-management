/**
 * Navix Fuel — Constantes métier du module Carburant
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les types de carburant, les statuts, les modes
 * de paiement, les options de tri, le seuil d'anomalie et les métadonnées
 * d'affichage (libellé, variante Badge, icône). Consommé par les composants,
 * les pages, les filtres, la table, les formulaires et le service.
 */
import { currencyLabel } from '@/utils/format';

export const FUEL_TYPES = {
  essence: { label: 'Essence', variant: 'warning', icon: 'bi-fuel-pump' },
  diesel: { label: 'Diesel', variant: 'dark', icon: 'bi-fuel-pump-fill' },
  super: { label: 'Super', variant: 'primary', icon: 'bi-fuel-pump' },
  gasoil: { label: 'Gasoil', variant: 'secondary', icon: 'bi-fuel-pump' },
  gpl: { label: 'GPL', variant: 'info', icon: 'bi-fire' },
  electrique: { label: 'Électrique', variant: 'success', icon: 'bi-ev-station' },
  hybride: { label: 'Hybride', variant: 'primary', icon: 'bi-lightning-charge' },
};

export const FUEL_TYPE_VALUES = Object.keys(FUEL_TYPES);

export const FUEL_STATUSES = {
  pending: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  validated: { label: 'Validé', variant: 'success', icon: 'bi-check2-circle' },
  cancelled: { label: 'Annulé', variant: 'danger', icon: 'bi-x-circle' },
};

export const FUEL_STATUS_VALUES = Object.keys(FUEL_STATUSES);

export const PAYMENT_METHODS = {
  cash: { label: 'Espèces', variant: 'success', icon: 'bi-cash' },
  card: { label: 'Carte bancaire', variant: 'primary', icon: 'bi-credit-card' },
  fuel_card: { label: 'Carte carburant', variant: 'info', icon: 'bi-credit-card-2-front' },
  bank_transfer: { label: 'Virement', variant: 'warning', icon: 'bi-bank' },
  company_account: { label: 'Compte entreprise', variant: 'secondary', icon: 'bi-building' },
};

export const PAYMENT_METHOD_VALUES = Object.keys(PAYMENT_METHODS);

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
  { value: 'createdAt', label: 'Date' },
  { value: 'totalCost', label: 'Montant' },
  { value: 'consumptionAverage', label: 'Consommation' },
  { value: 'quantity', label: 'Quantité' },
  { value: 'mileage', label: 'Kilométrage' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

export const FUEL_ICON = 'bi-fuel-pump';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

/** Monnaie par défaut des enregistrements de carburant. */
export const DEFAULT_CURRENCY = 'XAF';

/**
 * Détection des consommations anormales : référence de consommation
 * (L/100 km) par catégorie de véhicule. Un plein est considéré anormal
 * lorsque sa consommation moyenne dépasse la référence de sa catégorie
 * multipliée par `FUEL_ANOMALY_FACTOR`.
 */
export const FUEL_ANOMALY_FACTOR = 1.35;

export const CONSUMPTION_REFERENCES = {
  'Pick-up': 8,
  Berline: 8,
  SUV: 9,
  'Moto Sport': 6,
  Fourgon: 9,
  Camion: 34,
  'Semi-remorque': 34,
  Bus: 20,
  'Pelle mécanique': 22,
  Ambulance: 9,
};

export const getConsumptionReference = (category) => CONSUMPTION_REFERENCES[category] ?? 9;

export const getFuelType = (value) =>
  FUEL_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getFuelStatus = (value) =>
  FUEL_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getPaymentMethod = (value) =>
  PAYMENT_METHODS[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/** Indique si une consommation moyenne (L/100 km) est anormale. */
export const isAbnormalFuelConsumption = (value, category = '') => {
  const consumption = Number(value);
  if (!Number.isFinite(consumption) || consumption <= 0) return false;
  return consumption > getConsumptionReference(category) * FUEL_ANOMALY_FACTOR;
};

/** Formate une date courte (ex. 12 août 2026). */
export const formatFuelDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

/** Formate une date longue (ex. 12 août 2026). */
export const formatFuelLongDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

/** Formate un montant (ex. 38 250 FCFA). */
export const formatFuelMoney = (value, currency = DEFAULT_CURRENCY) =>
  Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('fr-FR')} ${currencyLabel(currency)}` : '—';

/** Formate une quantité en litres (ex. 55 L). */
export const formatFuelQuantity = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0 ? `${Number(value).toLocaleString('fr-FR')} L` : '—';

/** Formate un prix unitaire (ex. 625 /L). */
export const formatFuelUnitPrice = (value, currency = DEFAULT_CURRENCY) =>
  Number.isFinite(Number(value)) && Number(value) > 0 ? `${Number(value).toLocaleString('fr-FR')} ${currencyLabel(currency)}` : '—';

/** Formate une consommation moyenne (ex. 8,4 L/100 km). */
export const formatFuelConsumption = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0
    ? `${Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} L/100 km`
    : '—';

/** Formate un kilométrage en français (ex. 68 350 km). */
export const formatFuelMileage = (value) =>
  Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('fr-FR')} km` : '—';

/** Formate un mois court (ex. « août »). */
export const formatFuelMonth = (value) => {
  if (!value) return '—';
  const [year, month] = String(value).split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('fr-FR', { month: 'short' });
};
