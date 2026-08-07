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

export const ROUTE_META = {
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
  [ROUTES.FILES]: {
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
};
