/**
 * Navix Drivers — Constantes métier du module Chauffeurs
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les statuts, disponibilités, catégories de
 * permis, genres, options de tri et métadonnées d'affichage (libellé,
 * variante Badge, icône). Consommé par les composants, les pages, les
 * filtres, la table et les formulaires.
 */

export const DRIVER_STATUSES = {
  active: { label: 'Actif', variant: 'success', icon: 'bi-check-circle' },
  on_mission: { label: 'En mission', variant: 'info', icon: 'bi-play-circle' },
  available: { label: 'Disponible', variant: 'primary', icon: 'bi-person-check' },
  suspended: { label: 'Suspendu', variant: 'warning', icon: 'bi-pause-circle' },
  on_leave: { label: 'En congé', variant: 'secondary', icon: 'bi-backpack' },
  inactive: { label: 'Inactif', variant: 'danger', icon: 'bi-slash-circle' },
};

export const DRIVER_STATUS_VALUES = Object.keys(DRIVER_STATUSES);

export const DRIVER_AVAILABILITY = {
  available: { label: 'Disponible', variant: 'success', icon: 'bi-circle-fill' },
  busy: { label: 'En service', variant: 'info', icon: 'bi-lightning-charge' },
  unavailable: { label: 'Indisponible', variant: 'danger', icon: 'bi-x-circle' },
};

export const DRIVER_AVAILABILITY_VALUES = Object.keys(DRIVER_AVAILABILITY);

export const LICENSE_CATEGORIES = {
  A: { label: 'A — Moto', variant: 'info' },
  A1: { label: 'A1 — Moto légère', variant: 'info' },
  A2: { label: 'A2 — Moto intermédiaire', variant: 'info' },
  B: { label: 'B — Véhicule léger', variant: 'primary' },
  BE: { label: 'BE — Véhicule léger + remorque', variant: 'primary' },
  C: { label: 'C — Poids lourd', variant: 'warning' },
  CE: { label: 'CE — Poids lourd + remorque', variant: 'warning' },
  D: { label: 'D — Transport de personnes', variant: 'success' },
  DE: { label: 'DE — Transport de personnes + remorque', variant: 'success' },
};

export const LICENSE_CATEGORY_VALUES = Object.keys(LICENSE_CATEGORIES);

export const DRIVER_GENDERS = {
  male: { label: 'Homme' },
  female: { label: 'Femme' },
};

export const GENDER_VALUES = Object.keys(DRIVER_GENDERS);

export const SORT_OPTIONS = [
  { value: 'name', label: 'Nom' },
  { value: 'hireDate', label: 'Date d’embauche' },
  { value: 'yearsExperience', label: 'Expérience' },
  { value: 'licenseExpiryDate', label: 'Expiration permis' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

export const DRIVER_PHOTO_ICON = 'bi-person-badge';

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const getDriverStatus = (value) =>
  DRIVER_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getDriverAvailability = (value) =>
  DRIVER_AVAILABILITY[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getLicenseCategory = (value) =>
  LICENSE_CATEGORIES[value] || { label: value, variant: 'secondary' };

export const getGender = (value) => DRIVER_GENDERS[value] || { label: value };

/** Formate une date courte (ex. 12 août 2026). */
export const formatDriverDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

/** Calcule l'âge d'un chauffeur à partir de sa date de naissance. */
export const getDriverAge = (birthDate) => {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasNotHadBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());

  if (hasNotHadBirthday) age -= 1;
  return age;
};

/**
 * État d'expiration d'un document (permis, assurance, etc.).
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
