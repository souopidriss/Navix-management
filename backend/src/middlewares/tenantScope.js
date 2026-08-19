export function tenantScope(req, res, next) {
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
    req.tenantId = null;
    req.isGlobalAccess = true;
    return next();
  }

  if (!req.user.companyId) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'TENANT_ERROR',
        message: 'Aucun tenant associé à votre compte.',
      },
    });
  }

  req.tenantId = req.user.companyId;
  req.isGlobalAccess = false;
  next();
}
