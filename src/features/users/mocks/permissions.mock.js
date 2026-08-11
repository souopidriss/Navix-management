/**
 * Navix Users — Permissions simulées (mode mock)
 * --------------------------------------------------------------------------
 * Catalogue des permissions au format `module.action` (lecture seule). La
 * source unique de vérité est le catalogue RBAC officiel
 * (`src/features/rbac/constants/permissions.js`) : chaque permission du
 * catalogue applicatif est reflétée ici sous forme métier (id, name,
 * description, module, action, isSensitive) pour les vues (matrice, éditeur
 * de rôle) et les stores. Aucune permission supplémentaire n'est définie à
 * la main : ce module dérive le mock du catalogue officiel.
 *
 * `isSensitive` signale les permissions sensibles (financier, administration,
 * export, audit) pour un éventuel sur-compteur d'affichage. Aucune requête
 * HTTP — consommé par permissionService (mode mock).
 */
import { PERMISSIONS, ALL_PERMISSIONS } from '@/features/rbac';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../constants';

const SENSITIVE = new Set([
  PERMISSIONS.BILLING_MANAGE,
  PERMISSIONS.SUBSCRIPTIONS_MANAGE,
  PERMISSIONS.AUDIT_EXPORT,
  PERMISSIONS.AUDIT_DELETE,
  PERMISSIONS.AUDIT_VIEW_SENSITIVE,
  PERMISSIONS.AUDIT_VIEW_ALL_COMPANIES,
  PERMISSIONS.USERS_MANAGE,
  PERMISSIONS.USERS_ASSIGN,
  PERMISSIONS.USERS_DELETE,
  PERMISSIONS.USERS_UPDATE,
  PERMISSIONS.ROLES_MANAGE,
  PERMISSIONS.ROLES_DELETE,
  PERMISSIONS.PERMISSIONS_VIEW,
  PERMISSIONS.REPORTS_EXPORT,
  PERMISSIONS.REPORTS_MANAGE,
  PERMISSIONS.REPORTS_VIEW_FINANCIAL,
  PERMISSIONS.REPORTS_VIEW_SENSITIVE,
  PERMISSIONS.SETTINGS_MANAGE,
  PERMISSIONS.SETTINGS_BILLING,
  PERMISSIONS.SETTINGS_SAAS,
  PERMISSIONS.SETTINGS_SECURITY,
  PERMISSIONS.SETTINGS_SYSTEM,
]);

const splitCode = (code) => {
  const [module, action] = code.split('.');
  return { module, action: action ?? module };
};

const labelOf = (module, action) => {
  const moduleLabel = PERMISSION_MODULES[module]?.label ?? module;
  const actionLabel = PERMISSION_ACTIONS[action]?.label ?? action;
  return `${moduleLabel} : ${actionLabel}`;
};

const descriptionOf = (module, action) =>
  `Autorise l'action « ${PERMISSION_ACTIONS[action]?.label ?? action} » dans le module ${PERMISSION_MODULES[module]?.label ?? module}.`;

export const MOCK_PERMISSIONS = ALL_PERMISSIONS.map((code) => {
  const { module, action } = splitCode(code);
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
