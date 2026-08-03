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
  [ROUTES.ENTRETIENS]: {
    requiredPermissions: [PERMISSIONS.MAINTENANCE_READ],
  },
  [ROUTES.FILES]: {
    requiredPermissions: [PERMISSIONS.FILES_READ],
  },
  [ROUTES.INVOICES]: {
    requiredPermissions: [PERMISSIONS.BILLING_MANAGE],
  },
  [ROUTES.SUBSCRIPTIONS]: {
    requiredPermissions: [PERMISSIONS.SUBSCRIPTIONS_MANAGE],
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER],
  },
  [ROUTES.NOTIFICATIONS]: {
    requiredPermissions: [PERMISSIONS.NOTIFICATIONS_READ],
  },
  [ROUTES.SETTINGS]: {
    requiredPermissions: [PERMISSIONS.SETTINGS_MANAGE],
  },
};
