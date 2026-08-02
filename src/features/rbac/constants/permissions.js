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

  /* Entretiens / maintenance */
  MAINTENANCE_READ: 'maintenance.read',
  MAINTENANCE_CREATE: 'maintenance.create',

  /* Documents */
  FILES_READ: 'files.read',
  FILES_CREATE: 'files.create',

  /* Entreprises & agences */
  COMPANIES_MANAGE: 'companies.manage',
  AGENCIES_MANAGE: 'agencies.manage',

  /* Finances */
  BILLING_MANAGE: 'billing.manage',
  SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',

  /* Système */
  NOTIFICATIONS_READ: 'notifications.read',
  SETTINGS_MANAGE: 'settings.manage',
  USERS_MANAGE: 'users.manage',
};

/** Liste exhaustive de toutes les permissions de l'application. */
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
