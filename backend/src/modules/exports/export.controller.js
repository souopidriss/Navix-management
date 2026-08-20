import * as exportService from './export.service.js';
import { EXPORT_FORMATS } from './index.js';

export async function exportReport(req, res, next) {
  try {
    const reportType = req.body.reportType || req.body.filters?.reportType || 'fleet';
    const companyId = req.isGlobalAccess ? (req.body.filters?.companyId || req.tenantId) : req.tenantId;
    const format = EXPORT_FORMATS.includes(req.body.format) ? req.body.format : 'csv';
    const filters = { ...req.body.filters };

    const result = await exportService.generateReportExport(reportType, format, companyId, filters);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', result.contentDisposition);
    res.setHeader('X-Export-Count', String(result.count));
    res.setHeader('X-Export-Format', result.format);
    res.setHeader('X-Exported-At', result.exportedAt);
    res.send(result.buffer);
  } catch (error) {
    next(error);
  }
}

export async function exportData(req, res, next) {
  try {
    const { source } = req.params;
    const companyId = req.isGlobalAccess ? (req.query.companyId || req.tenantId) : req.tenantId;
    const format = EXPORT_FORMATS.includes(req.query.format) ? req.query.format : 'csv';
    const filters = { ...req.query };

    const result = await exportService.generateExport(source, format, companyId, filters);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', result.contentDisposition);
    res.setHeader('X-Export-Count', String(result.count));
    res.setHeader('X-Export-Format', result.format);
    res.setHeader('X-Exported-At', result.exportedAt);
    res.send(result.buffer);
  } catch (error) {
    next(error);
  }
}

export async function exportAuditLogs(req, res, next) {
  try {
    const companyId = req.isGlobalAccess ? (req.query.companyId || req.tenantId) : req.tenantId;
    const format = EXPORT_FORMATS.includes(req.body.format) ? req.body.format : 'csv';
    const filters = { ...req.body.filters };

    const result = await exportService.generateAuditExport(format, companyId, filters);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', result.contentDisposition);
    res.setHeader('X-Export-Count', String(result.count));
    res.setHeader('X-Export-Format', result.format);
    res.setHeader('X-Exported-At', result.exportedAt);
    res.send(result.buffer);
  } catch (error) {
    next(error);
  }
}
