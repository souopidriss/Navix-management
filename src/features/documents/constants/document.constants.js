/**
 * Navix Documents — Constantes métier du module Documents
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les types de fichiers (métadonnées
 * d'affichage : libellé, icône, variante Badge, extensions, types MIME,
 * taille maximale), la visibilité (public / privé / restreint), les types
 * d'association (entreprise, véhicule, chauffeur, entretien, trajet,
 * carburant, utilisateur), les catégories documentaires par ressource, les
 * options de tri et les utilitaires de formatage (taille, date).
 *
 * Consommé par les composants, les pages, les filtres, la table, la grille,
 * l'upload, le preview et le service.
 */

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const MAX_DEFAULT_UPLOAD_SIZE = 50 * 1024 * 1024; // 50 Mo

/** Types de fichiers pris en charge (source unique de vérité). */
export const DOCUMENT_TYPES = {
  pdf: {
    label: 'PDF',
    icon: 'bi-file-earmark-pdf',
    variant: 'danger',
    category: 'pdf',
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    maxSize: 20 * 1024 * 1024,
  },
  png: {
    label: 'PNG',
    icon: 'bi-file-earmark-image',
    variant: 'success',
    category: 'image',
    extensions: ['.png'],
    mimeTypes: ['image/png'],
    maxSize: 10 * 1024 * 1024,
  },
  jpg: {
    label: 'JPG',
    icon: 'bi-file-earmark-image',
    variant: 'success',
    category: 'image',
    extensions: ['.jpg'],
    mimeTypes: ['image/jpeg'],
    maxSize: 10 * 1024 * 1024,
  },
  jpeg: {
    label: 'JPEG',
    icon: 'bi-file-earmark-image',
    variant: 'success',
    category: 'image',
    extensions: ['.jpeg'],
    mimeTypes: ['image/jpeg'],
    maxSize: 10 * 1024 * 1024,
  },
  webp: {
    label: 'WEBP',
    icon: 'bi-file-earmark-image',
    variant: 'success',
    category: 'image',
    extensions: ['.webp'],
    mimeTypes: ['image/webp'],
    maxSize: 10 * 1024 * 1024,
  },
  doc: {
    label: 'DOC',
    icon: 'bi-file-earmark-word',
    variant: 'primary',
    category: 'office',
    extensions: ['.doc'],
    mimeTypes: ['application/msword'],
    maxSize: 15 * 1024 * 1024,
  },
  docx: {
    label: 'DOCX',
    icon: 'bi-file-earmark-word',
    variant: 'primary',
    category: 'office',
    extensions: ['.docx'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 15 * 1024 * 1024,
  },
  xls: {
    label: 'XLS',
    icon: 'bi-file-earmark-excel',
    variant: 'info',
    category: 'spreadsheet',
    extensions: ['.xls'],
    mimeTypes: ['application/vnd.ms-excel'],
    maxSize: 15 * 1024 * 1024,
  },
  xlsx: {
    label: 'XLSX',
    icon: 'bi-file-earmark-excel',
    variant: 'info',
    category: 'spreadsheet',
    extensions: ['.xlsx'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    maxSize: 15 * 1024 * 1024,
  },
  csv: {
    label: 'CSV',
    icon: 'bi-file-earmark-spreadsheet',
    variant: 'info',
    category: 'spreadsheet',
    extensions: ['.csv'],
    mimeTypes: ['text/csv'],
    maxSize: 10 * 1024 * 1024,
  },
  txt: {
    label: 'TXT',
    icon: 'bi-file-earmark-text',
    variant: 'secondary',
    category: 'text',
    extensions: ['.txt'],
    mimeTypes: ['text/plain'],
    maxSize: 5 * 1024 * 1024,
  },
  zip: {
    label: 'ZIP',
    icon: 'bi-file-earmark-zip',
    variant: 'warning',
    category: 'archive',
    extensions: ['.zip'],
    mimeTypes: ['application/zip', 'application/x-zip-compressed'],
    maxSize: MAX_DEFAULT_UPLOAD_SIZE,
  },
};

export const DOCUMENT_TYPE_VALUES = Object.keys(DOCUMENT_TYPES);

/** Métadonnées d'affichage d'un type de fichier (avec repli). */
export const getDocumentType = (value) =>
  DOCUMENT_TYPES[value] || { label: value, icon: 'bi-file-earmark', variant: 'secondary', category: 'other' };

/** Déduit un type depuis une extension de fichier. */
export const getDocumentTypeByExtension = (extension = '') => {
  const ext = String(extension).toLowerCase();
  const entry = Object.entries(DOCUMENT_TYPES).find(([, meta]) =>
    meta.extensions.includes(ext),
  );
  return entry ? getDocumentType(entry[0]) : null;
};

/** Déduit un type depuis un type MIME. */
export const getDocumentTypeByMime = (mimeType = '') => {
  const mime = String(mimeType).toLowerCase();
  const entry = Object.entries(DOCUMENT_TYPES).find(([, meta]) =>
    meta.mimeTypes.includes(mime),
  );
  return entry ? getDocumentType(entry[0]) : null;
};

/** Visibilités d'un document (sécurité visuelle uniquement côté frontend). */
export const DOCUMENT_VISIBILITIES = {
  public: { label: 'Public', variant: 'success', icon: 'bi-eye' },
  private: { label: 'Privé', variant: 'secondary', icon: 'bi-lock' },
  restricted: { label: 'Restreint', variant: 'warning', icon: 'bi-shield-lock' },
};

export const DOCUMENT_VISIBILITY_VALUES = Object.keys(DOCUMENT_VISIBILITIES);

export const getDocumentVisibility = (value) =>
  DOCUMENT_VISIBILITIES[value] || { label: value, variant: 'secondary', icon: 'bi-eye-slash' };

/** Types de ressources associables à un document. */
export const ASSOCIATION_TYPES = {
  company: { label: 'Entreprise', icon: 'bi-buildings', variant: 'primary' },
  vehicle: { label: 'Véhicule', icon: 'bi-truck', variant: 'info' },
  driver: { label: 'Chauffeur', icon: 'bi-person-badge', variant: 'success' },
  maintenance: { label: 'Entretien', icon: 'bi-wrench-adjustable', variant: 'warning' },
  trip: { label: 'Trajet', icon: 'bi-signpost-split', variant: 'secondary' },
  fuel: { label: 'Carburant', icon: 'bi-fuel-pump', variant: 'danger' },
  user: { label: 'Utilisateur', icon: 'bi-person', variant: 'dark' },
};

export const ASSOCIATION_TYPE_VALUES = Object.keys(ASSOCIATION_TYPES);

export const getAssociationType = (value) =>
  ASSOCIATION_TYPES[value] || { label: value, icon: 'bi-link', variant: 'secondary' };

/** Catégories documentaires par ressource (documents types). */
export const RESOURCE_DOCUMENT_CATEGORIES = {
  vehicle: [
    { value: 'carte_grise', label: 'Carte grise', icon: 'bi-card-text' },
    { value: 'assurance', label: 'Assurance', icon: 'bi-shield-check' },
    { value: 'visite_technique', label: 'Visite technique', icon: 'bi-clipboard-check' },
    { value: 'certificat_conformite', label: 'Certificat de conformité', icon: 'bi-patch-check' },
    { value: 'contrat', label: 'Contrat', icon: 'bi-file-earmark-text' },
    { value: 'photo', label: 'Photo', icon: 'bi-camera' },
    { value: 'autre', label: 'Autre', icon: 'bi-folder' },
  ],
  driver: [
    { value: 'permis', label: 'Permis de conduire', icon: 'bi-person-vcard' },
    { value: 'piece_identite', label: 'Pièce d’identité', icon: 'bi-person-badge' },
    { value: 'contrat', label: 'Contrat', icon: 'bi-file-earmark-text' },
    { value: 'certificat', label: 'Certificat', icon: 'bi-patch-check' },
    { value: 'photo', label: 'Photo', icon: 'bi-camera' },
    { value: 'autre', label: 'Autre', icon: 'bi-folder' },
  ],
  maintenance: [
    { value: 'facture', label: 'Facture', icon: 'bi-receipt' },
    { value: 'devis', label: 'Devis', icon: 'bi-file-earmark-text' },
    { value: 'rapport', label: 'Rapport', icon: 'bi-journal-text' },
    { value: 'bon_reparation', label: 'Bon de réparation', icon: 'bi-tools' },
    { value: 'photo', label: 'Photo', icon: 'bi-camera' },
    { value: 'autre', label: 'Autre', icon: 'bi-folder' },
  ],
  company: [
    { value: 'administratif', label: 'Documents administratifs', icon: 'bi-briefcase' },
    { value: 'contrat', label: 'Contrats', icon: 'bi-file-earmark-text' },
    { value: 'facture', label: 'Factures', icon: 'bi-receipt' },
    { value: 'certificat', label: 'Certificats', icon: 'bi-patch-check' },
    { value: 'autre', label: 'Autre', icon: 'bi-folder' },
  ],
};

export const getResourceCategories = (associationType = 'company') =>
  RESOURCE_DOCUMENT_CATEGORIES[associationType] || RESOURCE_DOCUMENT_CATEGORIES.company;

export const getDocumentCategory = (associationType, value) =>
  getResourceCategories(associationType).find((category) => category.value === value) || {
    value,
    label: value || 'Autre',
    icon: 'bi-folder',
  };

/** Catégories de rendu pour le preview (image / pdf / office / autre). */
export const getDocumentCategoryKind = (category) =>
  category === 'image' ? 'image' : category === 'pdf' ? 'pdf' : category === 'office' || category === 'spreadsheet' ? 'office' : 'other';

/** Périodes disponibles pour le filtre « Période ». */
export const PERIOD_OPTIONS = [
  { value: '', label: 'Toutes les périodes' },
  { value: 'current', label: 'En cours' },
  { value: 'month', label: 'Ce mois-ci' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' },
];

export const PERIOD_VALUES = PERIOD_OPTIONS.map((period) => period.value);

/** Tranches de taille pour le filtre « Taille ». */
export const SIZE_FILTER_OPTIONS = [
  { value: '', label: 'Toutes les tailles' },
  { value: 'small', label: 'Moins de 1 Mo' },
  { value: 'medium', label: '1 à 10 Mo' },
  { value: 'large', label: 'Plus de 10 Mo' },
];

export const SIZE_FILTER_VALUES = SIZE_FILTER_OPTIONS.map((option) => option.value);

/** Options de tri de la liste des documents. */
export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'name', label: 'Nom' },
  { value: 'size', label: 'Taille' },
  { value: 'extension', label: 'Extension' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

export const DOCUMENT_ICON = 'bi-folder2-open';

/** Construit une Date valide à partir d'une date simple ou d'un horodatage ISO. */
const toDate = (value) => {
  if (!value) return null;
  const candidate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Formate une date courte (ex. 12 août 2026). */
export const formatDocumentDate = (value) => {
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
export const formatDocumentLongDate = (value) => {
  const date = toDate(value);
  return date
    ? date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';
};

/**
 * Formate une taille de fichier lisible (B, Ko, Mo, Go).
 * Ex. 1 204 890 → « 1,2 Mo ».
 */
export const formatDocumentSize = (value) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';

  const units = ['o', 'Ko', 'Mo', 'Go'];
  const step = 1024;
  let index = 0;
  let amount = bytes;

  while (amount >= step && index < units.length - 1) {
    amount /= step;
    index += 1;
  }

  const digits = index === 0 ? 0 : amount >= 100 ? 0 : amount >= 10 ? 1 : 2;
  return `${amount.toLocaleString('fr-FR', { maximumFractionDigits: digits })} ${units[index]}`;
};

/** Taille de fichier en octets (pour tri / filtres). */
export const getSizeInBytes = (value) => {
  const bytes = Number(value);
  return Number.isFinite(bytes) ? bytes : 0;
};
