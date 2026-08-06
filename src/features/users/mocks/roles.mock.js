/**
 * Navix Users — Rôles simulés (mode mock)
 * --------------------------------------------------------------------------
 * Rôles au format métier complet : id, companyId ('' pour les rôles système
 * globaux), name, code, description, isSystem, isActive, permissions (codes
 * `module.action`), createdAt, updatedAt.
 *
 * Les 8 rôles système (SUPER_ADMIN … VIEWER) sont globaux et non supprimables.
 * Le super admin possède le joker `*` — résolu en toutes les permissions par
 * les helpers (utils/access.js). Des rôles personnalisés par entreprise
 * complètent le jeu pour illustrer la création / modification de rôles.
 *
 * Aucune requête HTTP — consommé par roleService (mode mock).
 */

const ALL = '*';

const CRUD = ['view', 'create', 'update', 'delete'];

const perms = (module, actions) => actions.map((action) => `${module}.${action}`);

const VIEW = ['view'];

/* --------------------------------------------------------------------------
   Définitions des rôles système
   -------------------------------------------------------------------------- */

export const SYSTEM_ROLE_CODES = [
  'super_admin',
  'company_admin',
  'fleet_manager',
  'fleet_operator',
  'driver',
  'accountant',
  'maintenance_manager',
  'viewer',
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
    id: 'role_company_admin',
    companyId: '',
    name: 'Administrateur',
    code: 'company_admin',
    description: 'Administration complète de son entreprise : flotte, équipes, finance et abonnement.',
    isSystem: true,
    isActive: true,
    permissions: [
      ...perms('dashboard', VIEW),
      ...perms('companies', ['view', 'update']),
      ...perms('agencies', CRUD),
      ...perms('vehicles', CRUD),
      ...perms('drivers', CRUD),
      ...perms('assignments', CRUD),
      ...perms('trips', CRUD),
      ...perms('fuel', CRUD),
      ...perms('maintenance', CRUD),
      ...perms('documents', ['view', 'upload', 'download', 'delete']),
      ...perms('subscriptions', ['view', 'manage']),
      ...perms('billing', ['view', 'manage']),
      ...perms('notifications', VIEW),
      ...perms('audit', ['view', 'export']),
      ...perms('users', ['view', 'create', 'update', 'assign']),
      ...perms('roles', ['view']),
      ...perms('permissions', VIEW),
      ...perms('reports', ['view', 'export']),
    ],
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
    permissions: [
      ...perms('dashboard', VIEW),
      ...perms('vehicles', CRUD),
      ...perms('drivers', CRUD),
      ...perms('assignments', CRUD),
      ...perms('trips', CRUD),
      ...perms('fuel', CRUD),
      ...perms('maintenance', CRUD),
      ...perms('documents', ['view', 'upload', 'download']),
      ...perms('notifications', VIEW),
      ...perms('reports', VIEW),
    ],
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
    permissions: [
      ...perms('dashboard', VIEW),
      ...perms('vehicles', ['view', 'update']),
      ...perms('drivers', VIEW),
      ...perms('assignments', ['view', 'create', 'update']),
      ...perms('trips', ['view', 'create', 'update']),
      ...perms('fuel', ['view', 'create']),
      ...perms('maintenance', ['view', 'create']),
      ...perms('documents', ['view', 'upload']),
      ...perms('notifications', VIEW),
    ],
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
    permissions: [
      ...perms('dashboard', VIEW),
      ...perms('vehicles', VIEW),
      ...perms('trips', VIEW),
      ...perms('fuel', VIEW),
      ...perms('notifications', VIEW),
    ],
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
    permissions: [
      ...perms('dashboard', VIEW),
      ...perms('vehicles', VIEW),
      ...perms('drivers', VIEW),
      ...perms('trips', VIEW),
      ...perms('fuel', VIEW),
      ...perms('documents', ['view', 'download']),
      ...perms('subscriptions', VIEW),
      ...perms('billing', ['view', 'manage', 'approve', 'refund']),
      ...perms('reports', ['view', 'export']),
      ...perms('notifications', VIEW),
    ],
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
    permissions: [
      ...perms('dashboard', VIEW),
      ...perms('vehicles', VIEW),
      ...perms('maintenance', CRUD),
      ...perms('documents', ['view', 'upload']),
      ...perms('notifications', VIEW),
      ...perms('reports', VIEW),
    ],
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-02-06T10:00:00.000Z',
  },
  {
    id: 'role_viewer',
    companyId: '',
    name: 'Lecteur',
    code: 'viewer',
    description: 'Consultation uniquement de l’ensemble de la plateforme.',
    isSystem: true,
    isActive: true,
    permissions: [
      ...perms('dashboard', VIEW),
      ...perms('companies', VIEW),
      ...perms('agencies', VIEW),
      ...perms('vehicles', VIEW),
      ...perms('drivers', VIEW),
      ...perms('assignments', VIEW),
      ...perms('trips', VIEW),
      ...perms('fuel', VIEW),
      ...perms('maintenance', VIEW),
      ...perms('documents', VIEW),
      ...perms('subscriptions', VIEW),
      ...perms('billing', VIEW),
      ...perms('notifications', VIEW),
      ...perms('audit', VIEW),
      ...perms('reports', VIEW),
    ],
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
      ...perms('dashboard', VIEW),
      ...perms('vehicles', ['view', 'update']),
      ...perms('drivers', VIEW),
      ...perms('assignments', ['view', 'create', 'update']),
      ...perms('trips', ['view', 'create', 'update']),
      ...perms('fuel', VIEW),
      ...perms('documents', VIEW),
      ...perms('notifications', VIEW),
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
      ...perms('dashboard', VIEW),
      ...perms('users', ['view', 'create', 'update', 'assign']),
      ...perms('roles', VIEW),
      ...perms('notifications', VIEW),
      ...perms('reports', VIEW),
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
      ...perms('dashboard', VIEW),
      ...perms('vehicles', CRUD),
      ...perms('drivers', CRUD),
      ...perms('trips', ['view', 'create', 'update']),
      ...perms('fuel', ['view', 'create']),
      ...perms('notifications', VIEW),
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
