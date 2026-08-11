/**
 * Navix Users — Helpers RBAC simulés (purs)
 * --------------------------------------------------------------------------
 * Fonctions pures de contrôle d'accès basées sur les rôles d'un utilisateur
 * (multi-rôles : `roleIds`). Elles n'ont AUCUNE valeur de sécurité : elles
 * améliorent uniquement l'expérience utilisateur (affichage des actions, du
 * menu…). La sécurité réelle sera appliquée par Express.js.
 *
 * Ces helpers ne définissent AUCUN second système de permissions : ils
 * délèguent au catalogue et aux primitives officielles du RBAC
 * (`@/features/rbac` : `can`, `normalizeRequired`, `WILDCARD`) et calculent
 * les permissions effectives d'un utilisateur comme l'union des permissions
 * des rôles qui lui sont attribués (joker `*` expansé en toutes les
 * permissions).
 */
import { can, normalizeRequired, WILDCARD, ALL_PERMISSIONS } from '@/features/rbac';
import { MOCK_ROLES } from '../mocks';

/** Résout les permissions d'un rôle (joker expansé). */
export const resolveRolePermissions = (role, allPermissions = ALL_PERMISSIONS) => {
  if (!role || !Array.isArray(role.permissions)) return [];
  return role.permissions.includes(WILDCARD) ? [...allPermissions] : [...role.permissions];
};

/** Permissions effectives d'une liste d'identifiants de rôles (union). */
export const getPermissionsByRoleIds = (roleIds, roles = MOCK_ROLES) => {
  const ids = normalizeRequired(roleIds);
  return Array.from(
    new Set(
      roles
        .filter((role) => ids.includes(role.id))
        .flatMap((role) => resolveRolePermissions(role)),
    ),
  );
};

/** Permissions effectives d'un utilisateur (union de ses rôles). */
export const getEffectivePermissions = (user, roles = MOCK_ROLES) =>
  getPermissionsByRoleIds(user?.roleIds, roles);

/** Rôles (objets complets) d'un utilisateur. */
export const getUserRoles = (user, roles = MOCK_ROLES) =>
  roles.filter((role) => normalizeRequired(user?.roleIds).includes(role.id));

/** Codes de rôle de l'utilisateur (union). */
export const getUserRoleCodes = (user, roles = MOCK_ROLES) =>
  Array.from(new Set(getUserRoles(user, roles).map((role) => role.code)));

/** L'utilisateur possède le rôle (code) demandé. */
export const hasRole = (user, roleCode, roles = MOCK_ROLES) =>
  getUserRoleCodes(user, roles).includes(roleCode);

/** L'utilisateur possède au moins un des rôles demandés. */
export const hasAnyRole = (user, roleCodes, roles = MOCK_ROLES) => {
  const codes = normalizeRequired(roleCodes);
  if (codes.length === 0) return true;
  const owned = getUserRoleCodes(user, roles);
  return codes.some((code) => owned.includes(code));
};

/** L'utilisateur possède la permission (code module.action) demandée. */
export const hasPermission = (user, permissionCode, roles = MOCK_ROLES) =>
  can(getEffectivePermissions(user, roles), permissionCode);

/** L'utilisateur possède au moins une des permissions demandées. */
export const hasAnyPermission = (user, permissionCodes, roles = MOCK_ROLES) =>
  can(getEffectivePermissions(user, roles), permissionCodes, { mode: 'any' });

/** L'utilisateur possède toutes les permissions demandées. */
export const hasAllPermissions = (user, permissionCodes, roles = MOCK_ROLES) =>
  can(getEffectivePermissions(user, roles), permissionCodes, { mode: 'all' });

/** L'utilisateur accède à au moins une action du module demandé. */
export const canAccessModule = (user, module, roles = MOCK_ROLES) => {
  const permissions = getEffectivePermissions(user, roles);
  if (permissions.includes(WILDCARD)) return true;
  return permissions.some((code) => code.startsWith(`${module}.`));
};
