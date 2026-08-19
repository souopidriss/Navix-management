import permissionRepository from '../repositories/PermissionRepository.js';

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
