/**
 * Navix Users — Rôles simulés (mode mock)
 * --------------------------------------------------------------------------
 * Rôles au format métier complet : id, companyId ('' pour les rôles système
 * globaux), name, code, description, isSystem, isActive, permissions (codes
 * `module.action`), createdAt, updatedAt.
 *
 * Les permissions des rôles système consomment la matrice officielle du
 * catalogue RBAC (`src/features/rbac/constants/roles.js` → ROLE_DEFINITIONS) :
 * modifier un rôle officiel là-bas suffit à faire évoluer ces rôles ici.
 * Les codes non présents dans le catalogue RBAC (`fleet_operator`,
 * `maintenance_manager`) sont mappés explicitement vers leurs équivalents
 * officiels (voir SYSTEM_ROLE_CODE_MAP) afin de rester cohérents avec la
 * source unique de vérité, sans casser les rôles déjà référencés par les
 * utilisateurs mockés (roleIds).
 *
 * Le super admin possède le joker `*` — résolu en toutes les permissions par
 * les helpers (utils/access.js). Des rôles personnalisés par entreprise
 * complètent le jeu pour illustrer la création / modification de rôles.
 *
 * Aucune requête HTTP — consommé par roleService (mode mock).
 */
import { ROLES, ROLE_DEFINITIONS } from '@/features/rbac';

const ALL = '*';

const CRUD = ['view', 'create', 'update', 'delete'];

const perms = (module, actions) => actions.map((action) => `${module}.${action}`);

/* --------------------------------------------------------------------------
   Correspondance des codes de rôle du module avec les codes officiels RBAC.
   `fleet_operator` et `maintenance_manager` sont des codes métier du module
   (conservés pour la compatibilité des mocks) explicitement mappés vers les
   rôles officiels `dispatcher` et `mechanic`.
   -------------------------------------------------------------------------- */

export const SYSTEM_ROLE_CODE_MAP = {
  super_admin: ROLES.SUPER_ADMIN,
  company_owner: ROLES.COMPANY_OWNER,
  company_admin: ROLES.COMPANY_ADMIN,
  fleet_manager: ROLES.FLEET_MANAGER,
  fleet_operator: ROLES.DISPATCHER,
  driver: ROLES.DRIVER,
  accountant: ROLES.ACCOUNTANT,
  maintenance_manager: ROLES.MECHANIC,
  viewer: ROLES.VIEWER,
};

/** Permissions officielles d'un code de rôle système (mapping RBAC). */
const systemPermissions = (code) => {
  const officialKey = SYSTEM_ROLE_CODE_MAP[code];
  const definition = ROLE_DEFINITIONS.find((item) => item.key === officialKey);
  return definition ? [...definition.permissions] : [];
};

export const SYSTEM_ROLE_CODES = [
  ROLES.SUPER_ADMIN,
  ROLES.COMPANY_OWNER,
  ROLES.COMPANY_ADMIN,
  ROLES.FLEET_MANAGER,
  'fleet_operator',
  ROLES.DRIVER,
  ROLES.ACCOUNTANT,
  'maintenance_manager',
  ROLES.VIEWER,
];

export const MOCK_ROLES = [
  {
    id: 'role_super_admin',
    companyId: '',
    name: 'Super Admin',
    code: 'super_admin',
    description: 'Accès global à la plateforme, toutes entreprises confondues.',
    isSystem: true,
    isActive: true,
    permissions: [ALL],
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'role_company_owner',
    companyId: '',
    name: "Propriétaire d'entreprise",
    code: 'company_owner',
    description: "Dirige son entreprise : flotte, équipes, facturation et abonnements.",
    isSystem: true,
    isActive: true,
    permissions: systemPermissions('company_owner'),
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'role_company_admin',
    companyId: '',
    name: 'Administrateur',
    code: 'company_admin',
    description: 'Administration complète de son entreprise : flotte, équipes, finance et abonnement.',
    isSystem: true,
    isActive: true,
    permissions: systemPermissions('company_admin'),
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-02-02T10:00:00.000Z',
  },
  {
    id: 'role_fleet_manager',
    companyId: '',
    name: 'Gestionnaire de flotte',
    code: 'fleet_manager',
    description: 'Gestion opérationnelle de la flotte : véhicules, chauffeurs, affectations, trajets, carburant et entretiens.',
    isSystem: true,
    isActive: true,
    permissions: systemPermissions('fleet_manager'),
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-02-05T11:00:00.000Z',
  },
  {
    id: 'role_fleet_operator',
    companyId: '',
    name: 'Opérateur flotte',
    code: 'fleet_operator',
    description: 'Opérations quotidiennes : affectations, trajets, pleins de carburant et entretiens courants.',
    isSystem: true,
    isActive: true,
    permissions: systemPermissions('fleet_operator'),
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-02-05T11:30:00.000Z',
  },
  {
    id: 'role_driver',
    companyId: '',
    name: 'Chauffeur',
    code: 'driver',
    description: 'Accès limité aux informations nécessaires au chauffeur : véhicule, trajets, carburant.',
    isSystem: true,
    isActive: true,
    permissions: systemPermissions('driver'),
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-02-05T12:00:00.000Z',
  },
  {
    id: 'role_accountant',
    companyId: '',
    name: 'Comptable',
    code: 'accountant',
    description: 'Accès aux données financières, facturation et rapports.',
    isSystem: true,
    isActive: true,
    permissions: systemPermissions('accountant'),
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-02-06T09:00:00.000Z',
  },
  {
    id: 'role_maintenance_manager',
    companyId: '',
    name: 'Responsable maintenance',
    code: 'maintenance_manager',
    description: 'Gestion des entretiens, maintenance et pièces de la flotte.',
    isSystem: true,
    isActive: true,
    permissions: systemPermissions('maintenance_manager'),
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-02-06T10:00:00.000Z',
  },
  {
    id: 'role_viewer',
    companyId: '',
    name: 'Lecteur',
    code: 'viewer',
    description: 'Consultation de la flotte en lecture seule.',
    isSystem: true,
    isActive: true,
    permissions: systemPermissions('viewer'),
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-02-06T11:00:00.000Z',
  },
  /* ------------------------------------------------------------------------
     Rôles personnalisés (par entreprise)
     ------------------------------------------------------------------------ */
  {
    id: 'role_dispatcher',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    name: 'Répartiteur',
    code: 'dispatcher',
    description: 'Répartition des affectations et organisation des trajets (Navix Trans).',
    isSystem: false,
    isActive: true,
    permissions: [
      ...perms('dashboard', ['read']),
      ...perms('vehicles', ['view', 'update']),
      ...perms('drivers', ['view']),
      ...perms('assignments', ['view', 'create', 'update']),
      ...perms('trips', ['view', 'create', 'update']),
      ...perms('fuel', ['view']),
      ...perms('files', ['read']),
      ...perms('notifications', ['view']),
    ],
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'role_hr_manager',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    name: 'Responsable RH',
    code: 'hr_manager',
    description: 'Gestion des utilisateurs et des rôles (Navix Trans).',
    isSystem: false,
    isActive: true,
    permissions: [
      ...perms('dashboard', ['read']),
      ...perms('users', ['view', 'create', 'update', 'assign']),
      ...perms('roles', ['view']),
      ...perms('notifications', ['view']),
      ...perms('reports', ['view']),
    ],
    createdAt: '2026-02-10T08:00:00.000Z',
    updatedAt: '2026-03-02T09:00:00.000Z',
  },
  {
    id: 'role_ops_manager',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2',
    name: 'Responsable exploitation',
    code: 'ops_manager',
    description: 'Supervision de l’exploitation (Trans Express CI).',
    isSystem: false,
    isActive: true,
    permissions: [
      ...perms('dashboard', ['read']),
      ...perms('vehicles', CRUD),
      ...perms('drivers', CRUD),
      ...perms('trips', ['view', 'create', 'update']),
      ...perms('fuel', ['view', 'create']),
      ...perms('notifications', ['view']),
    ],
    createdAt: '2026-02-15T08:00:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
  },
];

/** Recherche un rôle par identifiant (ou code). */
export const getRoleById = (id) =>
  MOCK_ROLES.find((role) => role.id === id || role.code === id) ?? null;

/** Codes système non supprimables et non désactivables. */
export const PROTECTED_ROLE_CODES = SYSTEM_ROLE_CODES;
