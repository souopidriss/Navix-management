/**
 * Navix RBAC — Permissions centralisées
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les permissions de l'application.
 * Chaque permission est une chaîne `module.operation` (ex. `vehicles.update`)
 * afin d'être exploitable aussi bien par le RBAC (rôles → permissions) que
 * par un futur ABAC ou des permissions dynamiques serveur.
 *
 * Le joker `*` accorde l'accès à toutes les permissions (réservé aux
 * super-admins). Il est honoré par `hasPermission` dans utils/access.js.
 */

export const WILDCARD = '*';

export const PERMISSIONS = {
  /* Tableau de bord */
  DASHBOARD_READ: 'dashboard.read',

  /* Véhicules */
  VEHICLES_READ: 'vehicles.read',
  VEHICLES_CREATE: 'vehicles.create',
  VEHICLES_UPDATE: 'vehicles.update',
  VEHICLES_DELETE: 'vehicles.delete',

  /* Chauffeurs */
  DRIVERS_READ: 'drivers.read',
  DRIVERS_CREATE: 'drivers.create',
  DRIVERS_UPDATE: 'drivers.update',
  DRIVERS_DELETE: 'drivers.delete',

  /* Affectations */
  ASSIGNMENTS_READ: 'assignments.read',
  ASSIGNMENTS_CREATE: 'assignments.create',
  ASSIGNMENTS_UPDATE: 'assignments.update',
  ASSIGNMENTS_DELETE: 'assignments.delete',

  /* Trajets */
  TRIPS_READ: 'trips.read',
  TRIPS_CREATE: 'trips.create',
  TRIPS_UPDATE: 'trips.update',
  TRIPS_DELETE: 'trips.delete',

  /* Carburant */
  FUEL_READ: 'fuel.read',
  FUEL_CREATE: 'fuel.create',
  FUEL_UPDATE: 'fuel.update',
  FUEL_DELETE: 'fuel.delete',

  /* Entretiens / maintenance */
  MAINTENANCE_READ: 'maintenance.read',
  MAINTENANCE_CREATE: 'maintenance.create',
  MAINTENANCE_UPDATE: 'maintenance.update',
  MAINTENANCE_DELETE: 'maintenance.delete',

  /* Partenaires */
  PARTNERS_READ: 'partners.read',
  PARTNERS_CREATE: 'partners.create',
  PARTNERS_UPDATE: 'partners.update',
  PARTNERS_DELETE: 'partners.delete',
  PARTNERS_MANAGE: 'partners.manage',

  /* Documents */
  FILES_READ: 'files.read',
  FILES_CREATE: 'files.create',
  FILES_UPDATE: 'files.update',
  FILES_DELETE: 'files.delete',
  FILES_DOWNLOAD: 'files.download',
  FILES_MANAGE: 'files.manage',

  /* Entreprises & agences */
  COMPANIES_MANAGE: 'companies.manage',
  AGENCIES_MANAGE: 'agencies.manage',

  /* Finances */
  BILLING_MANAGE: 'billing.manage',
  SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',

  /* Système */
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  NOTIFICATIONS_DELETE: 'notifications.delete',
  NOTIFICATIONS_PREFERENCES: 'notifications.preferences',
  SETTINGS_MANAGE: 'settings.manage',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  SETTINGS_COMPANY: 'settings.company',
  SETTINGS_FLEET: 'settings.fleet',
  SETTINGS_MAINTENANCE: 'settings.maintenance',
  SETTINGS_FUEL: 'settings.fuel',
  SETTINGS_DOCUMENTS: 'settings.documents',
  SETTINGS_NOTIFICATIONS: 'settings.notifications',
  SETTINGS_BILLING: 'settings.billing',
  SETTINGS_SAAS: 'settings.saas',
  SETTINGS_SECURITY: 'settings.security',
  SETTINGS_SYSTEM: 'settings.system',
  USERS_MANAGE: 'users.manage',

  /* Journal des actions (audit) */
  AUDIT_VIEW: 'audit.view',
  AUDIT_EXPORT: 'audit.export',
  AUDIT_VIEW_SENSITIVE: 'audit.viewSensitive',
  AUDIT_VIEW_ALL_COMPANIES: 'audit.viewAllCompanies',
  AUDIT_DELETE: 'audit.delete',

  /* Utilisateurs, rôles et permissions */
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_ASSIGN: 'users.assign',
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_MANAGE: 'roles.manage',
  PERMISSIONS_VIEW: 'permissions.view',

  /* Rapports & analytics */
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_CREATE: 'reports.create',
  REPORTS_UPDATE: 'reports.update',
  REPORTS_DELETE: 'reports.delete',
  REPORTS_MANAGE: 'reports.manage',
  REPORTS_VIEW_FINANCIAL: 'reports.viewFinancial',
  REPORTS_VIEW_SENSITIVE: 'reports.viewSensitive',
};

/** Liste exhaustive de toutes les permissions de l'application. */
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
