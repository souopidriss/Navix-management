import permissionRepository from '../repositories/PermissionRepository.js';
import logger from '../logs/logger.js';

export function requirePermission(...requiredPermissions) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentification requise.',
        },
      });
    }

    if (req.user.role === 'super_admin') {
      return next();
    }

    const userPermissions = await permissionRepository.findByRoleCode(req.user.role);
    const permissionCodes = userPermissions.map((p) => p.code);

    const hasPermission = requiredPermissions.some(
      (perm) => permissionCodes.includes(perm) || permissionCodes.includes('*')
    );

    if (hasPermission) {
      return next();
    }

    logger.warn('Permission denied', {
      userId: req.user.id,
      companyId: req.user.companyId,
      requiredPermissions,
      userRole: req.user.role,
      method: req.method,
      path: req.originalUrl ? req.originalUrl.split('?')[0] : 'unknown',
      requestId: req.id,
    });

    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'Accès refusé. Permission insuffisante.',
      },
    });
  };
}

export function requireAnyPermission(...permissions) {
  return requirePermission(...permissions);
}
