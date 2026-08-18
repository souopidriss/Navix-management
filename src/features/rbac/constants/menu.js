/**
 * Navix RBAC — Méta-données de navigation
 * --------------------------------------------------------------------------
 * Associe à chaque route privée une méta RBAC consommée par la sidebar :
 *
 *   requiredRole          : rôle(s) autorisé(s) (string | string[])
 *   requiredPermissions   : permission(s) requise(s) (string | string[], voir `mode`)
 *   mode                  : 'all' (défaut) | 'any' — combinaison des permissions
 *   hidden                : masque l'entrée du menu (route non livrée, etc.)
 *   disabled              : affiche l'entrée mais la rend inutilisable
 *
 * Le filtrage est appliqué par `filterSidebarSections` (utils/menu.js).
 * Les chemins proviennent de `ROUTES` (source unique de vérité).
 */
import { ROUTES } from '@/routes/route.constants';
import { PERMISSIONS } from './permissions';
import { ROLES } from './roles';

/** Rôles autorisés sur l'ensemble de l'Espace Client. */
const CLIENT_ROLES = [ROLES.CLIENT_ENTERPRISE, ROLES.CLIENT_INDIVIDUAL];

export const ROUTE_META = {
  [ROUTES.DASHBOARD]: {
    requiredPermissions: [PERMISSIONS.DASHBOARD_READ],
  },
  [ROUTES.PROFILE]: {},
  [ROUTES.COMPANIES]: {
    requiredPermissions: [PERMISSIONS.COMPANIES_MANAGE],
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER],
  },
  [ROUTES.COMPANIES_CREATE]: {
    requiredPermissions: [PERMISSIONS.COMPANIES_MANAGE],
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER],
  },
  [ROUTES.COMPANIES_DETAIL]: {
    requiredPermissions: [PERMISSIONS.COMPANIES_MANAGE],
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER],
  },
  [ROUTES.COMPANIES_EDIT]: {
    requiredPermissions: [PERMISSIONS.COMPANIES_MANAGE],
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER],
  },
  [ROUTES.AGENCIES]: {
    requiredPermissions: [PERMISSIONS.AGENCIES_MANAGE],
  },
  [ROUTES.AGENCIES_CREATE]: {
    requiredPermissions: [PERMISSIONS.AGENCIES_MANAGE],
  },
  [ROUTES.AGENCIES_DETAIL]: {
    requiredPermissions: [PERMISSIONS.AGENCIES_MANAGE],
  },
  [ROUTES.AGENCIES_EDIT]: {
    requiredPermissions: [PERMISSIONS.AGENCIES_MANAGE],
  },
  [ROUTES.AGENCIES_STATISTICS]: {
    requiredPermissions: [PERMISSIONS.AGENCIES_MANAGE],
  },
  [ROUTES.VEHICLES]: {
    requiredPermissions: [PERMISSIONS.VEHICLES_READ],
  },
  [ROUTES.VEHICLES_CREATE]: {
    requiredPermissions: [PERMISSIONS.VEHICLES_CREATE],
  },
  [ROUTES.VEHICLES_DETAIL]: {
    requiredPermissions: [PERMISSIONS.VEHICLES_READ],
  },
  [ROUTES.VEHICLES_EDIT]: {
    requiredPermissions: [PERMISSIONS.VEHICLES_UPDATE],
  },
  [ROUTES.DRIVERS]: {
    requiredPermissions: [PERMISSIONS.DRIVERS_READ],
  },
  [ROUTES.DRIVERS_CREATE]: {
    requiredPermissions: [PERMISSIONS.DRIVERS_CREATE],
  },
  [ROUTES.DRIVERS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.DRIVERS_READ],
  },
  [ROUTES.DRIVERS_EDIT]: {
    requiredPermissions: [PERMISSIONS.DRIVERS_UPDATE],
  },
  [ROUTES.ASSIGNMENTS]: {
    requiredPermissions: [PERMISSIONS.ASSIGNMENTS_READ],
  },
  [ROUTES.ASSIGNMENTS_CREATE]: {
    requiredPermissions: [PERMISSIONS.ASSIGNMENTS_CREATE],
  },
  [ROUTES.ASSIGNMENTS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.ASSIGNMENTS_READ],
  },
  [ROUTES.ASSIGNMENTS_EDIT]: {
    requiredPermissions: [PERMISSIONS.ASSIGNMENTS_UPDATE],
  },
  [ROUTES.ASSIGNMENTS_HISTORY]: {
    requiredPermissions: [PERMISSIONS.ASSIGNMENTS_READ],
  },
  [ROUTES.TRIPS]: {
    requiredPermissions: [PERMISSIONS.TRIPS_READ],
  },
  [ROUTES.TRIPS_CREATE]: {
    requiredPermissions: [PERMISSIONS.TRIPS_CREATE],
  },
  [ROUTES.TRIPS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.TRIPS_READ],
  },
  [ROUTES.TRIPS_EDIT]: {
    requiredPermissions: [PERMISSIONS.TRIPS_UPDATE],
  },
  [ROUTES.TRIPS_HISTORY]: {
    requiredPermissions: [PERMISSIONS.TRIPS_READ],
  },
  [ROUTES.FUEL]: {
    requiredPermissions: [PERMISSIONS.FUEL_READ],
  },
  [ROUTES.FUEL_CREATE]: {
    requiredPermissions: [PERMISSIONS.FUEL_CREATE],
  },
  [ROUTES.FUEL_DETAIL]: {
    requiredPermissions: [PERMISSIONS.FUEL_READ],
  },
  [ROUTES.FUEL_EDIT]: {
    requiredPermissions: [PERMISSIONS.FUEL_UPDATE],
  },
  [ROUTES.FUEL_STATISTICS]: {
    requiredPermissions: [PERMISSIONS.FUEL_READ],
  },
  [ROUTES.ENTRETIENS]: {
    requiredPermissions: [PERMISSIONS.MAINTENANCE_READ],
  },
  [ROUTES.MAINTENANCE_CREATE]: {
    requiredPermissions: [PERMISSIONS.MAINTENANCE_CREATE],
  },
  [ROUTES.MAINTENANCE_DETAIL]: {
    requiredPermissions: [PERMISSIONS.MAINTENANCE_READ],
  },
  [ROUTES.MAINTENANCE_EDIT]: {
    requiredPermissions: [PERMISSIONS.MAINTENANCE_UPDATE],
  },
  [ROUTES.MAINTENANCE_CALENDAR]: {
    requiredPermissions: [PERMISSIONS.MAINTENANCE_READ],
  },
  [ROUTES.MAINTENANCE_STATISTICS]: {
    requiredPermissions: [PERMISSIONS.MAINTENANCE_READ],
  },
  [ROUTES.PARTNERS]: {
    requiredPermissions: [PERMISSIONS.PARTNERS_READ],
  },
  [ROUTES.PARTNERS_CREATE]: {
    requiredPermissions: [PERMISSIONS.PARTNERS_CREATE],
  },
  [ROUTES.PARTNERS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.PARTNERS_READ],
  },
  [ROUTES.PARTNERS_EDIT]: {
    requiredPermissions: [PERMISSIONS.PARTNERS_UPDATE],
  },
  [ROUTES.FILES]: {
    requiredPermissions: [PERMISSIONS.FILES_READ],
  },
  [ROUTES.FILES_CREATE]: {
    requiredPermissions: [PERMISSIONS.FILES_CREATE],
  },
  [ROUTES.FILES_DETAIL]: {
    requiredPermissions: [PERMISSIONS.FILES_READ],
  },
  [ROUTES.FILES_EDIT]: {
    requiredPermissions: [PERMISSIONS.FILES_UPDATE],
  },
  [ROUTES.FILE_TYPES]: {
    requiredPermissions: [PERMISSIONS.FILES_READ],
  },
  [ROUTES.INVOICES]: {
    requiredPermissions: [PERMISSIONS.BILLING_MANAGE],
  },
  [ROUTES.BILLING]: {
    requiredPermissions: [PERMISSIONS.BILLING_MANAGE],
  },
  [ROUTES.BILLING_INVOICES]: {
    requiredPermissions: [PERMISSIONS.BILLING_MANAGE],
  },
  [ROUTES.BILLING_INVOICE_DETAIL]: {
    requiredPermissions: [PERMISSIONS.BILLING_MANAGE],
  },
  [ROUTES.BILLING_PAYMENTS]: {
    requiredPermissions: [PERMISSIONS.BILLING_MANAGE],
  },
  [ROUTES.BILLING_PAYMENT_DETAIL]: {
    requiredPermissions: [PERMISSIONS.BILLING_MANAGE],
  },
  [ROUTES.BILLING_HISTORY]: {
    requiredPermissions: [PERMISSIONS.BILLING_MANAGE],
  },
  [ROUTES.BILLING_SETTINGS]: {
    requiredPermissions: [PERMISSIONS.BILLING_MANAGE],
  },
  [ROUTES.SUBSCRIPTIONS]: {
    requiredPermissions: [PERMISSIONS.SUBSCRIPTIONS_MANAGE],
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER],
  },
  [ROUTES.SUBSCRIPTIONS_PLANS]: {
    requiredPermissions: [PERMISSIONS.SUBSCRIPTIONS_MANAGE],
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER],
  },
  [ROUTES.SUBSCRIPTIONS_USAGE]: {
    requiredPermissions: [PERMISSIONS.SUBSCRIPTIONS_MANAGE],
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER],
  },
  [ROUTES.SUBSCRIPTIONS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.SUBSCRIPTIONS_MANAGE],
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER],
  },
  [ROUTES.NOTIFICATIONS]: {
    requiredPermissions: [PERMISSIONS.NOTIFICATIONS_VIEW],
  },
  [ROUTES.NOTIFICATIONS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.NOTIFICATIONS_VIEW],
  },
  [ROUTES.AUDIT_LOGS]: {
    requiredPermissions: [PERMISSIONS.AUDIT_VIEW],
  },
  [ROUTES.AUDIT_LOGS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.AUDIT_VIEW],
  },
  [ROUTES.AUDIT_USER_ACTIVITY]: {
    requiredPermissions: [PERMISSIONS.AUDIT_VIEW],
  },
  [ROUTES.USERS]: {
    requiredPermissions: [PERMISSIONS.USERS_VIEW],
  },
  [ROUTES.USERS_CREATE]: {
    requiredPermissions: [PERMISSIONS.USERS_CREATE],
  },
  [ROUTES.USERS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.USERS_VIEW],
  },
  [ROUTES.USERS_EDIT]: {
    requiredPermissions: [PERMISSIONS.USERS_UPDATE],
  },
  [ROUTES.ROLES]: {
    requiredPermissions: [PERMISSIONS.ROLES_VIEW],
  },
  [ROUTES.ROLES_DETAIL]: {
    requiredPermissions: [PERMISSIONS.ROLES_VIEW],
  },
  [ROUTES.PERMISSIONS]: {
    requiredPermissions: [PERMISSIONS.PERMISSIONS_VIEW],
  },
  [ROUTES.REPORTS]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_FLEET]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_VEHICLES]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_DRIVERS]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_ASSIGNMENTS]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_TRIPS]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_FUEL]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_MAINTENANCE]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_DOCUMENTS]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_FINANCIAL]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW_FINANCIAL],
  },
  [ROUTES.REPORTS_SUBSCRIPTIONS]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_AUDIT]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW_SENSITIVE],
  },
  [ROUTES.REPORTS_COMPANIES]: {
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
  [ROUTES.REPORTS_CUSTOM]: {
    requiredPermissions: [PERMISSIONS.REPORTS_CREATE],
  },
  [ROUTES.SETTINGS]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_VIEW],
  },
  [ROUTES.SETTINGS_GENERAL]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE],
  },
  [ROUTES.SETTINGS_COMPANY]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_COMPANY],
  },
  [ROUTES.SETTINGS_FLEET]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_FLEET],
  },
  [ROUTES.SETTINGS_MAINTENANCE]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_MAINTENANCE],
  },
  [ROUTES.SETTINGS_FUEL]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_FUEL],
  },
  [ROUTES.SETTINGS_DOCUMENTS]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_DOCUMENTS],
  },
  [ROUTES.SETTINGS_NOTIFICATIONS]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_NOTIFICATIONS],
  },
  [ROUTES.SETTINGS_USER]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE],
  },
  [ROUTES.SETTINGS_APPEARANCE]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE],
  },
  [ROUTES.SETTINGS_TABLES]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE],
  },
  [ROUTES.SETTINGS_REGIONAL]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE],
  },
  [ROUTES.SETTINGS_BILLING]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_BILLING],
  },
  [ROUTES.SETTINGS_SAAS]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_SAAS],
  },
  [ROUTES.SETTINGS_SECURITY]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_SECURITY],
  },
  [ROUTES.SETTINGS_SYSTEM]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_SYSTEM],
  },

  /* Espace Super Admin — Finance plateforme */
  [ROUTES.SA_FINANCE]: {
    requiredPermissions: [PERMISSIONS.SUPER_ADMIN_FINANCE_READ],
    requiredRole: [ROLES.SUPER_ADMIN],
  },
  [ROUTES.SA_FINANCE_TRANSACTIONS]: {
    requiredPermissions: [PERMISSIONS.SUPER_ADMIN_FINANCE_READ],
    requiredRole: [ROLES.SUPER_ADMIN],
  },
  [ROUTES.SA_FINANCE_TRANSACTION_DETAIL]: {
    requiredPermissions: [PERMISSIONS.SUPER_ADMIN_FINANCE_READ],
    requiredRole: [ROLES.SUPER_ADMIN],
  },
  [ROUTES.SA_FINANCE_REPORTS]: {
    requiredPermissions: [PERMISSIONS.SUPER_ADMIN_FINANCE_READ],
    requiredRole: [ROLES.SUPER_ADMIN],
  },

  /* Espace Chauffeur */
  [ROUTES.DRIVER_DASHBOARD]: {
    requiredPermissions: [PERMISSIONS.DASHBOARD_READ],
    requiredRole: [ROLES.DRIVER],
  },
  [ROUTES.DRIVER_TRIPS]: {
    requiredPermissions: [PERMISSIONS.TRIPS_READ],
    requiredRole: [ROLES.DRIVER],
  },
  [ROUTES.DRIVER_TRIPS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.TRIPS_READ],
    requiredRole: [ROLES.DRIVER],
  },
  [ROUTES.DRIVER_VEHICLE]: {
    requiredPermissions: [PERMISSIONS.VEHICLES_READ],
    requiredRole: [ROLES.DRIVER],
  },
  [ROUTES.DRIVER_FUEL]: {
    requiredPermissions: [PERMISSIONS.FUEL_READ],
    requiredRole: [ROLES.DRIVER],
  },
  [ROUTES.DRIVER_MAINTENANCE]: {
    requiredPermissions: [PERMISSIONS.MAINTENANCE_READ],
    requiredRole: [ROLES.DRIVER],
  },
  [ROUTES.DRIVER_INCIDENTS]: {
    requiredPermissions: [PERMISSIONS.INCIDENTS_READ],
    requiredRole: [ROLES.DRIVER],
  },
  [ROUTES.DRIVER_DOCUMENTS]: {
    requiredPermissions: [PERMISSIONS.FILES_READ],
    requiredRole: [ROLES.DRIVER],
  },
  [ROUTES.DRIVER_NOTIFICATIONS]: {
    requiredPermissions: [PERMISSIONS.NOTIFICATIONS_VIEW],
    requiredRole: [ROLES.DRIVER],
  },
  [ROUTES.DRIVER_PROFILE]: {
    requiredPermissions: [PERMISSIONS.DASHBOARD_READ],
    requiredRole: [ROLES.DRIVER],
  },

  /* Espace Client — isolation stricte : rôles Client uniquement.
     Le Chauffeur (et tout autre rôle) est redirigé vers /403 sur /client/*. */
  [ROUTES.CLIENT_DASHBOARD]: {
    requiredPermissions: [PERMISSIONS.CLIENT_DASHBOARD_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_SERVICES]: {
    requiredPermissions: [PERMISSIONS.CLIENT_SERVICES_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_VEHICLES]: {
    requiredPermissions: [PERMISSIONS.CLIENT_VEHICLES_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_VEHICLES_DETAIL]: {
    requiredPermissions: [PERMISSIONS.CLIENT_VEHICLES_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_DRIVERS]: {
    requiredPermissions: [PERMISSIONS.CLIENT_DRIVERS_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_DRIVERS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.CLIENT_DRIVERS_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_ASSIGNMENTS]: {
    requiredPermissions: [PERMISSIONS.CLIENT_ASSIGNMENTS_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_REQUESTS]: {
    requiredPermissions: [PERMISSIONS.CLIENT_REQUESTS_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_REQUESTS_NEW]: {
    requiredPermissions: [PERMISSIONS.CLIENT_REQUESTS_CREATE],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_REQUESTS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.CLIENT_REQUESTS_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_TRIPS]: {
    requiredPermissions: [PERMISSIONS.CLIENT_TRIPS_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_TRIPS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.CLIENT_TRIPS_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_MAINTENANCE]: {
    requiredPermissions: [PERMISSIONS.CLIENT_MAINTENANCE_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_FUEL]: {
    requiredPermissions: [PERMISSIONS.CLIENT_FUEL_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_DOCUMENTS]: {
    requiredPermissions: [PERMISSIONS.CLIENT_DOCUMENTS_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_INVOICES]: {
    requiredPermissions: [PERMISSIONS.CLIENT_INVOICES_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_REPORTS]: {
    requiredPermissions: [PERMISSIONS.CLIENT_REPORTS_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_NOTIFICATIONS]: {
    requiredPermissions: [PERMISSIONS.NOTIFICATIONS_VIEW],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_PROFILE]: {
    requiredPermissions: [PERMISSIONS.CLIENT_PROFILE_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_FINANCE]: {
    requiredPermissions: [PERMISSIONS.CLIENT_FINANCE_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_FINANCE_FUNDS]: {
    requiredPermissions: [PERMISSIONS.CLIENT_FINANCE_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_FINANCE_TRANSACTIONS]: {
    requiredPermissions: [PERMISSIONS.CLIENT_FINANCE_READ],
    requiredRole: CLIENT_ROLES,
  },
  [ROUTES.CLIENT_FINANCE_TRANSACTION_DETAIL]: {
    requiredPermissions: [PERMISSIONS.CLIENT_FINANCE_READ],
    requiredRole: CLIENT_ROLES,
  },

  /* Garde générique : toute route /client/* non répertoriée ci-dessus reste
     réservée aux rôles Client (ajoutée en dernier : les entrées précises
     priment via matchPath — première correspondance). */
  '/client/*': {
    requiredRole: CLIENT_ROLES,
  },

  /* Espace Partenaire — isolation stricte : rôle Partenaire uniquement.
     Le Chauffeur (et tout autre rôle) est redirigé vers /403 sur /partner/*.
     La Finance Partenaire est un espace financier autorisé (FCFA). */
  [ROUTES.PARTNER_ROOT]: {
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_DASHBOARD]: {
    requiredPermissions: [PERMISSIONS.PARTNER_DASHBOARD_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_VEHICLES]: {
    requiredPermissions: [PERMISSIONS.PARTNER_VEHICLES_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_MISSIONS]: {
    requiredPermissions: [PERMISSIONS.PARTNER_MISSIONS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_MISSIONS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.PARTNER_MISSIONS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_MISSIONS_NEW]: {
    requiredPermissions: [PERMISSIONS.PARTNER_MISSIONS_CREATE],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_CLIENTS]: {
    requiredPermissions: [PERMISSIONS.PARTNER_CLIENTS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_CLIENTS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.PARTNER_CLIENTS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_CLIENTS_NEW]: {
    requiredPermissions: [PERMISSIONS.PARTNER_CLIENTS_CREATE],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_FINANCE]: {
    requiredPermissions: [PERMISSIONS.PARTNER_FINANCE_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_FINANCE_FUNDS]: {
    requiredPermissions: [PERMISSIONS.PARTNER_FINANCE_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_FINANCE_TRANSACTIONS]: {
    requiredPermissions: [PERMISSIONS.PARTNER_FINANCE_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_FINANCE_TRANSACTION_DETAIL]: {
    requiredPermissions: [PERMISSIONS.PARTNER_FINANCE_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_FINANCE_REVENUE]: {
    requiredPermissions: [PERMISSIONS.PARTNER_FINANCE_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_FINANCE_REVENUE_DETAIL]: {
    requiredPermissions: [PERMISSIONS.PARTNER_FINANCE_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_FINANCE_INVOICES]: {
    requiredPermissions: [PERMISSIONS.PARTNER_FINANCE_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_FINANCE_INVOICE_DETAIL]: {
    requiredPermissions: [PERMISSIONS.PARTNER_FINANCE_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_DOCUMENTS]: {
    requiredPermissions: [PERMISSIONS.PARTNER_DOCUMENTS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_DOCUMENTS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.PARTNER_DOCUMENTS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_REQUESTS]: {
    requiredPermissions: [PERMISSIONS.PARTNER_REQUESTS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_REQUESTS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.PARTNER_REQUESTS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_CONTRACTS]: {
    requiredPermissions: [PERMISSIONS.PARTNER_CONTRACTS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_CONTRACTS_DETAIL]: {
    requiredPermissions: [PERMISSIONS.PARTNER_CONTRACTS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_NOTIFICATIONS]: {
    requiredPermissions: [PERMISSIONS.NOTIFICATIONS_VIEW],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_ALERTS]: {
    requiredPermissions: [PERMISSIONS.PARTNER_ALERTS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_CALENDAR]: {
    requiredPermissions: [PERMISSIONS.PARTNER_CALENDAR_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_ANALYTICS]: {
    requiredPermissions: [PERMISSIONS.PARTNER_ANALYTICS_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_SUPPORT]: {
    requiredPermissions: [PERMISSIONS.PARTNER_SUPPORT_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_SUPPORT_DETAIL]: {
    requiredPermissions: [PERMISSIONS.PARTNER_SUPPORT_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_PROFILE]: {
    requiredPermissions: [PERMISSIONS.PARTNER_PROFILE_READ],
    requiredRole: [ROLES.PARTNER],
  },
  [ROUTES.PARTNER_SETTINGS]: {
    requiredPermissions: [PERMISSIONS.PARTNER_PROFILE_READ],
    requiredRole: [ROLES.PARTNER],
  },
  '/partner/*': {
    requiredRole: [ROLES.PARTNER],
  },
};
