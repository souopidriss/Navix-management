/**
 * Navix RBAC — Rôles centralisés
 * --------------------------------------------------------------------------
 * Définition des rôles applicatifs et de leur matrice de permissions.
 * L'attribution des permissions par rôle est déclarative : modifier ce fichier
 * suffit à faire évoluer l'accès de chaque rôle partout dans l'application
 * (hooks, guards, menu).
 *
 * Rôles :
 *   - super_admin    : accès complet (joker *)
 *   - company_owner  : dirige son entreprise, facturation et abonnements
 *   - company_admin  : administre l'entreprise au quotidien
 *   - fleet_manager  : pilote la flotte (véhicules, chauffeurs, affectations)
 *   - dispatcher     : organise les trajets et les affectations
 *   - driver         : conducteur (lecture de ses trajets / véhicules)
 *   - mechanic       : atelier (entretiens et maintenance)
 *   - accountant     : comptabilité et facturation
 *   - viewer         : consultation en lecture seule
 */
import { PERMISSIONS, WILDCARD } from './permissions';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_OWNER: 'company_owner',
  COMPANY_ADMIN: 'company_admin',
  FLEET_MANAGER: 'fleet_manager',
  DISPATCHER: 'dispatcher',
  DRIVER: 'driver',
  MECHANIC: 'mechanic',
  ACCOUNTANT: 'accountant',
  VIEWER: 'viewer',
};

/* Sous-ensembles réutilisables de permissions. */
const VEHICLES_FULL = [
  PERMISSIONS.VEHICLES_READ,
  PERMISSIONS.VEHICLES_CREATE,
  PERMISSIONS.VEHICLES_UPDATE,
  PERMISSIONS.VEHICLES_DELETE,
];

const DRIVERS_FULL = [
  PERMISSIONS.DRIVERS_READ,
  PERMISSIONS.DRIVERS_CREATE,
  PERMISSIONS.DRIVERS_UPDATE,
  PERMISSIONS.DRIVERS_DELETE,
];

const ASSIGNMENTS_FULL = [
  PERMISSIONS.ASSIGNMENTS_READ,
  PERMISSIONS.ASSIGNMENTS_CREATE,
  PERMISSIONS.ASSIGNMENTS_UPDATE,
  PERMISSIONS.ASSIGNMENTS_DELETE,
];

const TRIPS_FULL = [
  PERMISSIONS.TRIPS_READ,
  PERMISSIONS.TRIPS_CREATE,
  PERMISSIONS.TRIPS_UPDATE,
  PERMISSIONS.TRIPS_DELETE,
];

const FUEL_OPERATIONS = [
  PERMISSIONS.FUEL_READ,
  PERMISSIONS.FUEL_CREATE,
  PERMISSIONS.FUEL_UPDATE,
  PERMISSIONS.FUEL_DELETE,
];
const MAINTENANCE_OPERATIONS = [PERMISSIONS.MAINTENANCE_READ, PERMISSIONS.MAINTENANCE_CREATE];
const FILES_OPERATIONS = [PERMISSIONS.FILES_READ, PERMISSIONS.FILES_CREATE];

/**
 * Descripteurs de rôles. `permissions: [WILDCARD]` se résout en
 * `ALL_PERMISSIONS` via getPermissionsForRole (utils/access.js).
 */
export const ROLE_DEFINITIONS = [
  {
    key: ROLES.SUPER_ADMIN,
    label: 'Super Admin',
    description: 'Accès complet à toute la plateforme.',
    permissions: [WILDCARD],
  },
  {
    key: ROLES.COMPANY_OWNER,
    label: "Propriétaire d'entreprise",
    description: 'Gère son entreprise, ses équipes, la facturation et les abonnements.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      ...VEHICLES_FULL,
      ...DRIVERS_FULL,
      ...ASSIGNMENTS_FULL,
      ...TRIPS_FULL,
      ...FUEL_OPERATIONS,
      ...MAINTENANCE_OPERATIONS,
      ...FILES_OPERATIONS,
      PERMISSIONS.COMPANIES_MANAGE,
      PERMISSIONS.AGENCIES_MANAGE,
      PERMISSIONS.BILLING_MANAGE,
      PERMISSIONS.SUBSCRIPTIONS_MANAGE,
      PERMISSIONS.NOTIFICATIONS_READ,
      PERMISSIONS.AUDIT_VIEW,
      PERMISSIONS.AUDIT_EXPORT,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_ASSIGN,
      PERMISSIONS.ROLES_VIEW,
      PERMISSIONS.ROLES_CREATE,
      PERMISSIONS.ROLES_UPDATE,
      PERMISSIONS.ROLES_DELETE,
      PERMISSIONS.ROLES_MANAGE,
      PERMISSIONS.PERMISSIONS_VIEW,
    ],
  },
  {
    key: ROLES.COMPANY_ADMIN,
    label: 'Administrateur',
    description: "Administre l'entreprise au quotidien (agences, flotte, équipes).",
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      ...VEHICLES_FULL,
      ...DRIVERS_FULL,
      ...ASSIGNMENTS_FULL,
      ...TRIPS_FULL,
      ...FUEL_OPERATIONS,
      ...MAINTENANCE_OPERATIONS,
      ...FILES_OPERATIONS,
      PERMISSIONS.AGENCIES_MANAGE,
      PERMISSIONS.BILLING_MANAGE,
      PERMISSIONS.NOTIFICATIONS_READ,
      PERMISSIONS.AUDIT_VIEW,
      PERMISSIONS.AUDIT_EXPORT,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_ASSIGN,
      PERMISSIONS.ROLES_VIEW,
      PERMISSIONS.ROLES_CREATE,
      PERMISSIONS.ROLES_UPDATE,
      PERMISSIONS.ROLES_DELETE,
      PERMISSIONS.ROLES_MANAGE,
      PERMISSIONS.PERMISSIONS_VIEW,
    ],
  },
  {
    key: ROLES.FLEET_MANAGER,
    label: 'Gestionnaire de flotte',
    description: 'Pilote la flotte : véhicules, chauffeurs, affectations et entretiens.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      ...VEHICLES_FULL,
      ...DRIVERS_FULL,
      ...ASSIGNMENTS_FULL,
      PERMISSIONS.TRIPS_READ,
      PERMISSIONS.TRIPS_CREATE,
      PERMISSIONS.TRIPS_UPDATE,
      ...FUEL_OPERATIONS,
      ...MAINTENANCE_OPERATIONS,
      ...FILES_OPERATIONS,
      PERMISSIONS.NOTIFICATIONS_READ,
    ],
  },
  {
    key: ROLES.DISPATCHER,
    label: 'Répartiteur',
    description: 'Organise les trajets et les affectations de la flotte.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.VEHICLES_READ,
      PERMISSIONS.DRIVERS_READ,
      PERMISSIONS.ASSIGNMENTS_READ,
      PERMISSIONS.ASSIGNMENTS_CREATE,
      PERMISSIONS.ASSIGNMENTS_UPDATE,
      PERMISSIONS.TRIPS_READ,
      PERMISSIONS.TRIPS_CREATE,
      PERMISSIONS.TRIPS_UPDATE,
      PERMISSIONS.NOTIFICATIONS_READ,
    ],
  },
  {
    key: ROLES.DRIVER,
    label: 'Chauffeur',
    description: 'Consulte ses trajets, son véhicule et le carburant.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.VEHICLES_READ,
      PERMISSIONS.TRIPS_READ,
      PERMISSIONS.FUEL_READ,
      PERMISSIONS.NOTIFICATIONS_READ,
    ],
  },
  {
    key: ROLES.MECHANIC,
    label: 'Mécanicien',
    description: 'Gère les entretiens et la maintenance de la flotte.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.VEHICLES_READ,
      ...MAINTENANCE_OPERATIONS,
      PERMISSIONS.NOTIFICATIONS_READ,
    ],
  },
  {
    key: ROLES.ACCOUNTANT,
    label: 'Comptable',
    description: 'Gère la facturation et la comptabilité.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.VEHICLES_READ,
      PERMISSIONS.DRIVERS_READ,
      PERMISSIONS.TRIPS_READ,
      PERMISSIONS.FUEL_READ,
      PERMISSIONS.BILLING_MANAGE,
      PERMISSIONS.NOTIFICATIONS_READ,
    ],
  },
  {
    key: ROLES.VIEWER,
    label: 'Lecteur',
    description: 'Consultation de la flotte en lecture seule.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.VEHICLES_READ,
      PERMISSIONS.DRIVERS_READ,
      PERMISSIONS.ASSIGNMENTS_READ,
      PERMISSIONS.TRIPS_READ,
      PERMISSIONS.FUEL_READ,
      PERMISSIONS.MAINTENANCE_READ,
      PERMISSIONS.FILES_READ,
      PERMISSIONS.NOTIFICATIONS_READ,
    ],
  },
];
