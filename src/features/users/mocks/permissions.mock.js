/**
 * Navix Users — Permissions simulées (mode mock)
 * --------------------------------------------------------------------------
 * 68 permissions fictives au format `module.action` (source unique de vérité
 * du module : voir PERMISSION_MODULES / PERMISSION_ACTIONS dans ../constants).
 * Chaque permission : id, code, name, description, module, action, isSensitive,
 * createdAt, updatedAt.
 *
 * `isSensitive` signale les permissions sensibles (financier, administration,
 * export, audit) pour un éventuel sur-compteur d'affichage. Aucune requête
 * HTTP — consommé par permissionService (mode mock).
 */
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../constants';

const SENSITIVE = new Set([
  'billing.manage',
  'billing.refund',
  'subscriptions.manage',
  'audit.export',
  'users.delete',
  'users.update',
  'roles.manage',
  'permissions.view',
  'reports.export',
]);

const DEFS = [
  { module: 'dashboard', action: 'view' },
  { module: 'companies', action: 'view' },
  { module: 'companies', action: 'create' },
  { module: 'companies', action: 'update' },
  { module: 'companies', action: 'delete' },
  { module: 'agencies', action: 'view' },
  { module: 'agencies', action: 'create' },
  { module: 'agencies', action: 'update' },
  { module: 'agencies', action: 'delete' },
  { module: 'vehicles', action: 'view' },
  { module: 'vehicles', action: 'create' },
  { module: 'vehicles', action: 'update' },
  { module: 'vehicles', action: 'delete' },
  { module: 'drivers', action: 'view' },
  { module: 'drivers', action: 'create' },
  { module: 'drivers', action: 'update' },
  { module: 'drivers', action: 'delete' },
  { module: 'assignments', action: 'view' },
  { module: 'assignments', action: 'create' },
  { module: 'assignments', action: 'update' },
  { module: 'assignments', action: 'delete' },
  { module: 'trips', action: 'view' },
  { module: 'trips', action: 'create' },
  { module: 'trips', action: 'update' },
  { module: 'trips', action: 'delete' },
  { module: 'fuel', action: 'view' },
  { module: 'fuel', action: 'create' },
  { module: 'fuel', action: 'update' },
  { module: 'fuel', action: 'delete' },
  { module: 'maintenance', action: 'view' },
  { module: 'maintenance', action: 'create' },
  { module: 'maintenance', action: 'update' },
  { module: 'maintenance', action: 'delete' },
  { module: 'documents', action: 'view' },
  { module: 'documents', action: 'upload' },
  { module: 'documents', action: 'download' },
  { module: 'documents', action: 'delete' },
  { module: 'subscriptions', action: 'view' },
  { module: 'subscriptions', action: 'manage' },
  { module: 'billing', action: 'view' },
  { module: 'billing', action: 'manage' },
  { module: 'billing', action: 'approve' },
  { module: 'billing', action: 'refund' },
  { module: 'notifications', action: 'view' },
  { module: 'audit', action: 'view' },
  { module: 'audit', action: 'export' },
  { module: 'users', action: 'view' },
  { module: 'users', action: 'create' },
  { module: 'users', action: 'update' },
  { module: 'users', action: 'delete' },
  { module: 'users', action: 'assign' },
  { module: 'roles', action: 'view' },
  { module: 'roles', action: 'create' },
  { module: 'roles', action: 'update' },
  { module: 'roles', action: 'delete' },
  { module: 'roles', action: 'manage' },
  { module: 'permissions', action: 'view' },
  { module: 'reports', action: 'view' },
  { module: 'reports', action: 'export' },
];

const labelOf = (module, action) => {
  const moduleLabel = PERMISSION_MODULES[module]?.label ?? module;
  const actionLabel = PERMISSION_ACTIONS[action]?.label ?? action;
  return `${moduleLabel} : ${actionLabel}`;
};

const descriptionOf = (module, action) =>
  `Autorise l'action « ${PERMISSION_ACTIONS[action]?.label ?? action} » dans le module ${PERMISSION_MODULES[module]?.label ?? module}.`;

export const MOCK_PERMISSIONS = DEFS.map(({ module, action }) => {
  const code = `${module}.${action}`;
  return {
    id: `perm_${module}_${action}`,
    code,
    name: labelOf(module, action),
    description: descriptionOf(module, action),
    module,
    action,
    isSensitive: SENSITIVE.has(code),
    createdAt: '2025-11-01T08:00:00.000Z',
    updatedAt: '2026-01-15T09:30:00.000Z',
  };
});

/** Recherche une permission par code (défauts sûrs). */
export const getPermissionByCode = (code) =>
  MOCK_PERMISSIONS.find((permission) => permission.code === code) ?? null;

/** Groupes de permissions par module (utilisé par la matrice et l'éditeur). */
export const getPermissionsByModule = () =>
  MOCK_PERMISSIONS.reduce((groups, permission) => {
    const list = groups[permission.module] ?? [];
    list.push(permission);
    groups[permission.module] = list;
    return groups;
  }, {});
