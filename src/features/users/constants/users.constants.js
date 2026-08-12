/**
 * Navix Users — Constantes métier du module Utilisateurs / Rôles / Permissions
 * --------------------------------------------------------------------------
 * Source unique de vérité pour :
 *   - les statuts d'utilisateur (active, inactive, suspended, pending, invited)
 *   - les types de rôle (système / personnalisé)
 *   - les modules et actions de permissions (module.action)
 *   - le tri et la pagination, le formatage des dates
 *
 * Le RBAC simulé côté frontend ne constitue PAS un mécanisme de sécurité :
 * il sert uniquement l'expérience utilisateur. Express.js vérifiera
 * réellement les permissions (relation UserRole / RolePermission).
 * Aucune couleur codée en dur : variantes sémantiques mappées sur les tokens
 * CSS existants (--navix-* / --bs-*).
 */

/* --------------------------------------------------------------------------
   Statuts d'utilisateur
   -------------------------------------------------------------------------- */

export const USER_STATUSES = {
  active: { label: 'Actif', variant: 'success', icon: 'bi-person-check' },
  inactive: { label: 'Inactif', variant: 'secondary', icon: 'bi-person-slash' },
  suspended: { label: 'Suspendu', variant: 'danger', icon: 'bi-person-x' },
  pending: { label: 'En attente', variant: 'warning', icon: 'bi-hourglass-split' },
  invited: { label: 'Invité', variant: 'info', icon: 'bi-envelope' },
};

export const USER_STATUS_VALUES = Object.keys(USER_STATUSES);

export const getUserStatus = (value) =>
  USER_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Types de rôle
   -------------------------------------------------------------------------- */

export const ROLE_TYPES = {
  system: { label: 'Système', variant: 'primary', icon: 'bi-shield-check' },
  custom: { label: 'Personnalisé', variant: 'info', icon: 'bi-person-gear' },
};

export const ROLE_TYPE_VALUES = Object.keys(ROLE_TYPES);

export const getRoleType = (value) =>
  ROLE_TYPES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const ROLE_STATUSES = {
  active: { label: 'Actif', variant: 'success', icon: 'bi-check-circle' },
  inactive: { label: 'Inactif', variant: 'secondary', icon: 'bi-circle' },
};

export const ROLE_STATUS_VALUES = Object.keys(ROLE_STATUSES);

export const getRoleStatus = (value) =>
  ROLE_STATUSES[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

/* --------------------------------------------------------------------------
   Modules et actions de permissions
   -------------------------------------------------------------------------- */

export const PERMISSION_MODULES = {
  dashboard: { label: 'Tableau de bord', icon: 'bi-speedometer2' },
  companies: { label: 'Entreprises', icon: 'bi-buildings' },
  agencies: { label: 'Agences', icon: 'bi-diagram-3' },
  vehicles: { label: 'Véhicules', icon: 'bi-truck' },
  drivers: { label: 'Chauffeurs', icon: 'bi-person-badge' },
  assignments: { label: 'Affectations', icon: 'bi-shuffle' },
  trips: { label: 'Trajets', icon: 'bi-signpost-split' },
  fuel: { label: 'Carburant', icon: 'bi-fuel-pump' },
  maintenance: { label: 'Entretiens', icon: 'bi-wrench-adjustable' },
  partners: { label: 'Partenaires', icon: 'bi-handshake' },
  files: { label: 'Documents', icon: 'bi-folder2-open' },
  subscriptions: { label: 'Abonnements', icon: 'bi-credit-card' },
  billing: { label: 'Facturation', icon: 'bi-receipt' },
  notifications: { label: 'Notifications', icon: 'bi-bell' },
  audit: { label: 'Journal des actions', icon: 'bi-journal-text' },
  users: { label: 'Utilisateurs', icon: 'bi-people' },
  roles: { label: 'Rôles', icon: 'bi-shield-lock' },
  permissions: { label: 'Permissions', icon: 'bi-key' },
  reports: { label: 'Rapports', icon: 'bi-file-earmark-bar-graph' },
  settings: { label: 'Paramètres', icon: 'bi-gear' },
};

export const PERMISSION_MODULE_VALUES = Object.keys(PERMISSION_MODULES);

export const getPermissionModule = (value) =>
  PERMISSION_MODULES[value] || { label: value, icon: 'bi-circle' };

export const PERMISSION_ACTIONS = {
  view: { label: 'Consulter', icon: 'bi-eye' },
  read: { label: 'Consulter', icon: 'bi-eye' },
  create: { label: 'Créer', icon: 'bi-plus-circle' },
  update: { label: 'Modifier', icon: 'bi-pencil-square' },
  delete: { label: 'Supprimer', icon: 'bi-trash3' },
  manage: { label: 'Gérer', icon: 'bi-sliders' },
  export: { label: 'Exporter', icon: 'bi-download' },
  import: { label: 'Importer', icon: 'bi-upload' },
  upload: { label: 'Déposer', icon: 'bi-cloud-arrow-up' },
  download: { label: 'Télécharger', icon: 'bi-cloud-arrow-down' },
  assign: { label: 'Affecter', icon: 'bi-person-plus' },
  approve: { label: 'Valider', icon: 'bi-check2-circle' },
  refund: { label: 'Rembourser', icon: 'bi-cash' },
  preferences: { label: 'Préférences', icon: 'bi-sliders' },
  viewFinancial: { label: 'Données financières', icon: 'bi-cash-stack' },
  viewSensitive: { label: 'Données sensibles', icon: 'bi-shield-exclamation' },
  viewAllCompanies: { label: 'Toutes les entreprises', icon: 'bi-buildings' },
};

export const PERMISSION_ACTION_VALUES = Object.keys(PERMISSION_ACTIONS);

export const getPermissionAction = (value) =>
  PERMISSION_ACTIONS[value] || { label: value, icon: 'bi-circle' };

/** Actions standard affichées dans la matrice (view, create, update, delete, manage, export). */
export const PERMISSION_MATRIX_ACTIONS = ['view', 'create', 'update', 'delete', 'manage', 'export'];

/* --------------------------------------------------------------------------
   Icônes / tri / pagination
   -------------------------------------------------------------------------- */

export const USERS_ICON = 'bi-people';
export const ROLES_ICON = 'bi-shield-lock';
export const PERMISSIONS_ICON = 'bi-key';

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const USER_SORT_OPTIONS = [
  { value: 'fullName', label: 'Nom' },
  { value: 'email', label: 'Email' },
  { value: 'companyName', label: 'Entreprise' },
  { value: 'status', label: 'Statut' },
  { value: 'lastLoginAt', label: 'Dernière connexion' },
  { value: 'createdAt', label: 'Date de création' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' },
];

/* --------------------------------------------------------------------------
   Formatage
   -------------------------------------------------------------------------- */

/** Formate une date en date courte locale. */
export const formatUserDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/** Formate une date en date + heure courtes locales. */
export const formatUserDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
