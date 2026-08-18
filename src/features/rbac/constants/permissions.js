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

  /* Incidents */
  INCIDENTS_READ: 'incidents.read',
  INCIDENTS_CREATE: 'incidents.create',
  INCIDENTS_UPDATE: 'incidents.update',
  INCIDENTS_DELETE: 'incidents.delete',

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

  /* Rapports */
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_CREATE: 'reports.create',
  REPORTS_UPDATE: 'reports.update',
  REPORTS_DELETE: 'reports.delete',
  REPORTS_MANAGE: 'reports.manage',
  REPORTS_VIEW_FINANCIAL: 'reports.viewFinancial',
  REPORTS_VIEW_SENSITIVE: 'reports.viewSensitive',

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

  /* Espace Client */
  CLIENT_DASHBOARD_READ: 'client.dashboard.read',
  CLIENT_SERVICES_READ: 'client.services.read',
  CLIENT_VEHICLES_READ: 'client.vehicles.read',
  CLIENT_VEHICLES_CREATE: 'client.vehicles.create',
  CLIENT_VEHICLES_UPDATE: 'client.vehicles.update',
  CLIENT_VEHICLES_DELETE: 'client.vehicles.delete',
  CLIENT_DRIVERS_READ: 'client.drivers.read',
  CLIENT_DRIVERS_CREATE: 'client.drivers.create',
  CLIENT_DRIVERS_UPDATE: 'client.drivers.update',
  CLIENT_DRIVERS_DELETE: 'client.drivers.delete',
  CLIENT_ASSIGNMENTS_READ: 'client.assignments.read',
  CLIENT_ASSIGNMENTS_CREATE: 'client.assignments.create',
  CLIENT_ASSIGNMENTS_UPDATE: 'client.assignments.update',
  CLIENT_ASSIGNMENTS_DELETE: 'client.assignments.delete',
  CLIENT_REQUESTS_READ: 'client.requests.read',
  CLIENT_REQUESTS_CREATE: 'client.requests.create',
  CLIENT_TRIPS_READ: 'client.trips.read',
  CLIENT_TRIPS_CREATE: 'client.trips.create',
  CLIENT_TRIPS_UPDATE: 'client.trips.update',
  CLIENT_TRIPS_DELETE: 'client.trips.delete',
  CLIENT_MAINTENANCE_READ: 'client.maintenance.read',
  CLIENT_MAINTENANCE_CREATE: 'client.maintenance.create',
  CLIENT_MAINTENANCE_UPDATE: 'client.maintenance.update',
  CLIENT_MAINTENANCE_DELETE: 'client.maintenance.delete',
  CLIENT_FUEL_READ: 'client.fuel.read',
  CLIENT_FUEL_CREATE: 'client.fuel.create',
  CLIENT_FUEL_UPDATE: 'client.fuel.update',
  CLIENT_FUEL_DELETE: 'client.fuel.delete',
  CLIENT_DOCUMENTS_READ: 'client.documents.read',
  CLIENT_DOCUMENTS_CREATE: 'client.documents.create',
  CLIENT_DOCUMENTS_UPDATE: 'client.documents.update',
  CLIENT_DOCUMENTS_DELETE: 'client.documents.delete',
  CLIENT_INVOICES_READ: 'client.invoices.read',
  CLIENT_REPORTS_READ: 'client.reports.read',
  CLIENT_PROFILE_READ: 'client.profile.read',
  CLIENT_PROFILE_UPDATE: 'client.profile.update',

  /* Finances Espace Client — réservées aux espaces financiers (Super Admin, Client/Entreprise, Partenaire).
     Le rôle Chauffeur ne reçoit AUCUNE permission financière. */
  CLIENT_FINANCE_READ: 'client.finance.read',
  CLIENT_FINANCE_CREATE: 'client.finance.create',
  CLIENT_FINANCE_WALLET_DEPOSIT: 'client.finance.wallet.deposit',
  CLIENT_FINANCE_WALLET_WITHDRAW: 'client.finance.wallet.withdraw',
  CLIENT_FINANCE_WALLET_TRANSFER: 'client.finance.wallet.transfer',

  /* Espace Partenaire — réservé au rôle Partenaire (finance FCFA incluse).
     Le Chauffeur ne reçoit AUCUNE permission partenaire (ni financière). */
  PARTNER_DASHBOARD_READ: 'partner.dashboard.read',
  PARTNER_VEHICLES_READ: 'partner.vehicles.read',
  PARTNER_VEHICLES_CREATE: 'partner.vehicles.create',
  PARTNER_VEHICLES_UPDATE: 'partner.vehicles.update',
  PARTNER_VEHICLES_DELETE: 'partner.vehicles.delete',
  PARTNER_VEHICLES_ASSIGN: 'partner.vehicles.assign',
  PARTNER_MISSIONS_READ: 'partner.missions.read',
  PARTNER_MISSIONS_CREATE: 'partner.missions.create',
  PARTNER_MISSIONS_UPDATE: 'partner.missions.update',
  PARTNER_MISSIONS_DELETE: 'partner.missions.delete',
  PARTNER_CLIENTS_READ: 'partner.clients.read',
  PARTNER_CLIENTS_CREATE: 'partner.clients.create',
  PARTNER_CLIENTS_UPDATE: 'partner.clients.update',
  PARTNER_CLIENTS_ARCHIVE: 'partner.clients.archive',
  PARTNER_DOCUMENTS_READ: 'partner.documents.read',
  PARTNER_DOCUMENTS_CREATE: 'partner.documents.create',
  PARTNER_DOCUMENTS_UPDATE: 'partner.documents.update',
  PARTNER_DOCUMENTS_DELETE: 'partner.documents.delete',
  PARTNER_PROFILE_READ: 'partner.profile.read',
  PARTNER_PROFILE_UPDATE: 'partner.profile.update',
  PARTNER_FINANCE_READ: 'partner.finance.read',
  PARTNER_FINANCE_CREATE: 'partner.finance.create',
  PARTNER_FINANCE_WALLET_DEPOSIT: 'partner.finance.wallet.deposit',
  PARTNER_FINANCE_WALLET_WITHDRAW: 'partner.finance.wallet.withdraw',
  PARTNER_FINANCE_WALLET_TRANSFER: 'partner.finance.wallet.transfer',
  PARTNER_REQUESTS_READ: 'partner.requests.read',
  PARTNER_REQUESTS_UPDATE: 'partner.requests.update',
  PARTNER_CONTRACTS_READ: 'partner.contracts.read',
  PARTNER_CONTRACTS_CREATE: 'partner.contracts.create',
  PARTNER_CONTRACTS_UPDATE: 'partner.contracts.update',
  PARTNER_ALERTS_READ: 'partner.alerts.read',
  PARTNER_ALERTS_UPDATE: 'partner.alerts.update',
  PARTNER_CALENDAR_READ: 'partner.calendar.read',
  PARTNER_ANALYTICS_READ: 'partner.analytics.read',
  PARTNER_SUPPORT_READ: 'partner.support.read',
  PARTNER_SUPPORT_CREATE: 'partner.support.create',
  PARTNER_SUPPORT_REPLY: 'partner.support.reply',

  /* Finances Plateforme Super Admin — réservées au rôle Super Admin.
     Le Chauffeur, le Client et le Partenaire ne reçoivent AUCUNE de ces permissions. */
  SUPER_ADMIN_FINANCE_READ: 'superAdmin.finance.read',
  SUPER_ADMIN_FINANCE_CREATE: 'superAdmin.finance.create',
  SUPER_ADMIN_FINANCE_UPDATE: 'superAdmin.finance.update',
};

/** Liste exhaustive de toutes les permissions de l'application. */
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
