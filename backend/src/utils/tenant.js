import { AuthorizationError, NotFoundError } from '../errors/index.js';

export function assertCompanyAccess(resourceCompanyId, userCompanyId, isGlobalAccess = false) {
  if (isGlobalAccess) return;
  if (!resourceCompanyId) {
    throw new NotFoundError('Ressource');
  }
  if (resourceCompanyId !== userCompanyId) {
    throw new AuthorizationError('Accès refusé à cette ressource.');
  }
}

export function assertSuperAdmin(user) {
  if (!user || user.role !== 'super_admin') {
    throw new AuthorizationError('Réservé aux super administrateurs.');
  }
}

export function isSuperAdmin(user) {
  return user?.role === 'super_admin';
}

export function getTenantId(user, isGlobalAccess = false) {
  if (isGlobalAccess) return null;
  return user?.companyId || null;
}
