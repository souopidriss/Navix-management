import * as auditService from '../../services/audit.service.js';

function tenantCtx(req) {
  return {
    userId: req.user?.id,
    companyId: req.tenantId,
    isGlobalAccess: req.isGlobalAccess,
  };
}

export async function list(req, res, next) {
  try {
    const result = await auditService.listAuditLogs(req.query, tenantCtx(req));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const ctx = tenantCtx(req);
    const log = await auditService.getAuditLogById(req.params.id, ctx);
    if (!log) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Entrée du journal introuvable.' },
      });
    }
    res.json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
}

export async function statistics(req, res, next) {
  try {
    const ctx = tenantCtx(req);
    const companyId = ctx.isGlobalAccess ? null : ctx.companyId;
    const stats = await auditService.getStatistics(companyId);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function userActivity(req, res, next) {
  try {
    const { userId } = req.params;
    const result = await auditService.getUserActivity(userId, tenantCtx(req));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function resourceActivity(req, res, next) {
  try {
    const { resourceType, resourceId } = req.query;
    if (!resourceType || !resourceId) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'resourceType et resourceId requis.' },
      });
    }
    const result = await auditService.getResourceActivity(resourceType, resourceId, tenantCtx(req));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
