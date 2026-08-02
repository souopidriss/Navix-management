/**
 * Navix RBAC — Utilitaires de contrôle d'accès (purs)
 * --------------------------------------------------------------------------
 * Fonctions pures, sans lecture d'état global : elles reçoivent les données
 * (rôle courant, permissions) et retournent une décision. Elles sont utilisées
 * par les hooks et le store RBAC, et restent compatibles ABAC / permissions
 * dynamiques serveur (une liste de permissions suffit).
 */
import { ALL_PERMISSIONS, WILDCARD } from '../constants/permissions';
import { ROLE_DEFINITIONS } from '../constants/roles';

/** Retourne le descripteur d'un rôle (ou null s'il est inconnu). */
export const getRole = (role) => ROLE_DEFINITIONS.find((definition) => definition.key === role) ?? null;

/**
 * Résout la liste de permissions effectives d'un rôle.
 * Le joker `*` (super admin) est expansé en ALL_PERMISSIONS.
 */
export const getPermissionsForRole = (role) => {
  const definition = getRole(role);
  if (!definition) return [];
  return definition.permissions.includes(WILDCARD)
    ? [...ALL_PERMISSIONS]
    : [...definition.permissions];
};

/** Normalise une exigence en tableau (string | string[] | undefined). */
export const normalizeRequired = (required) => {
  if (Array.isArray(required)) return required;
  if (required === undefined || required === null) return [];
  return [required];
};

/** Vérifie la présence d'une permission dans la liste (joker inclus). */
export const hasPermission = (permissions, permission) =>
  Array.isArray(permissions) &&
  (permissions.includes(WILDCARD) || permissions.includes(permission));

/** Vérifie que toutes les permissions requises sont présentes. */
export const hasAllPermissions = (permissions, required) =>
  normalizeRequired(required).every((permission) => hasPermission(permissions, permission));

/**
 * Contrôle d'accès générique.
 * @param {string[]} permissions — permissions effectives du contexte courant
 * @param {string|string[]} required — permission(s) requise(s)
 * @param {{ mode?: 'all'|'any' }} [options] — combinaison (défaut : 'all')
 */
export const can = (permissions, required, { mode = 'all' } = {}) => {
  const requiredList = normalizeRequired(required);
  if (requiredList.length === 0) return true;
  return mode === 'any'
    ? requiredList.some((permission) => hasPermission(permissions, permission))
    : requiredList.every((permission) => hasPermission(permissions, permission));
};

/**
 * Vérifie que le rôle courant appartient à la liste autorisée.
 * @param {string} currentRole — rôle courant
 * @param {string|string[]} roles — rôle(s) autorisé(s)
 */
export const hasAnyRole = (currentRole, roles) => {
  const rolesList = normalizeRequired(roles);
  if (rolesList.length === 0) return true;
  return rolesList.includes(currentRole);
};
