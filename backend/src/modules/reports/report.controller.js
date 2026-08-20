import * as reportService from './report.service.js';
import savedReportRepository from '../../repositories/SavedReportRepository.js';
import reportRepository from '../../repositories/ReportRepository.js';
import { generateId } from '../../utils/id.js';

/* -----------------------------------------------------------------------
   REPORT GENERATION HANDLERS
   ----------------------------------------------------------------------- */

export async function getReport(req, res, next) {
  try {
    const { type } = req.params;
    const companyId = req.isGlobalAccess ? (req.query.companyId || null) : req.tenantId;
    const filters = { ...req.query };
    const report = await reportService.generateReportByType(type, companyId, filters);
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
}

export async function getDashboardMetrics(req, res, next) {
  try {
    const companyId = req.isGlobalAccess ? (req.query.companyId || null) : req.tenantId;
    const filters = { ...req.query };
    const report = await reportService.generateDashboardMetrics(companyId, filters);
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
}

export async function getCustomReport(req, res, next) {
  try {
    const companyId = req.isGlobalAccess ? (req.body.filters?.companyId || req.tenantId) : req.tenantId;
    const config = req.body;
    const report = await reportService.generateCustomReport(config, companyId);
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
}

/* -----------------------------------------------------------------------
   SAVED REPORTS CRUD
   ----------------------------------------------------------------------- */

export async function listSavedReports(req, res, next) {
  try {
    const companyId = req.isGlobalAccess ? (req.query.companyId || req.tenantId) : req.tenantId;
    const filters = { ...req.query };
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      savedReportRepository.findByCompanyId(companyId, { ...filters, limit, offset }),
      savedReportRepository.countByCompanyId(companyId, filters),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) { next(error); }
}

export async function getSavedReport(req, res, next) {
  try {
    const companyId = req.isGlobalAccess ? req.tenantId : req.tenantId;
    const report = await savedReportRepository.findByIdAndCompany(req.params.id, companyId);
    if (!report) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Rapport introuvable.' } });
    }
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
}

export async function createSavedReport(req, res, next) {
  try {
    const companyId = req.isGlobalAccess ? (req.body.companyId || req.tenantId) : req.tenantId;
    const id = generateId();
    const report = await savedReportRepository.create({
      id,
      company_id: companyId,
      user_id: req.user.id,
      name: req.body.name || 'Rapport sans titre',
      description: req.body.description || '',
      report_type: req.body.reportType || 'fleet',
      status: req.body.status || 'draft',
      configuration: JSON.stringify(req.body.configuration || {}),
    });
    res.status(201).json({ success: true, data: report });
  } catch (error) { next(error); }
}

export async function updateSavedReport(req, res, next) {
  try {
    const companyId = req.isGlobalAccess ? req.tenantId : req.tenantId;
    const existing = await savedReportRepository.findByIdAndCompany(req.params.id, companyId);
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Rapport introuvable.' } });
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.configuration !== undefined) updates.configuration = JSON.stringify(req.body.configuration);

    const report = await savedReportRepository.update(req.params.id, updates);
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
}

export async function deleteSavedReport(req, res, next) {
  try {
    const companyId = req.isGlobalAccess ? req.tenantId : req.tenantId;
    const deleted = await savedReportRepository.deleteByIdAndCompany(req.params.id, companyId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Rapport introuvable.' } });
    }
    res.json({ success: true, message: 'Rapport supprimé.' });
  } catch (error) { next(error); }
}

/* -----------------------------------------------------------------------
   EXPORT
   ----------------------------------------------------------------------- */

export async function exportReport(req, res, next) {
  try {
    const reportType = req.body.reportType || req.body.filters?.reportType || 'fleet';
    const companyId = req.isGlobalAccess ? (req.body.filters?.companyId || req.tenantId) : req.tenantId;
    const filters = req.body.filters || {};
    const format = req.body.format || 'csv';

    const report = await reportService.generateReportByType(reportType, companyId, filters);
    const rows = Array.isArray(report.rows) ? report.rows : [];

    res.json({
      success: true,
      data: {
        format,
        count: rows.length,
        rows,
        exportedAt: new Date().toISOString(),
      },
    });
  } catch (error) { next(error); }
}

/* -----------------------------------------------------------------------
   CATEGORIES / OPTIONS
   ----------------------------------------------------------------------- */

export async function getCategories(req, res, next) {
  try {
    const companyId = req.isGlobalAccess ? (req.query.companyId || null) : req.tenantId;
    const [agencies, vehicles, drivers] = await Promise.all([
      reportRepository.getAgencyNames(companyId),
      reportRepository.getVehicleNames(companyId),
      reportRepository.getDriverNames(companyId),
    ]);

    res.json({
      success: true,
      data: {
        companies: [],
        agencies: agencies.map((a) => ({ value: a.id, label: a.name })),
        vehicles: vehicles.map((v) => ({ value: v.id, label: `${v.name} (${v.registration_number})` })),
        drivers: drivers.map((d) => ({ value: d.id, label: d.full_name })),
      },
    });
  } catch (error) { next(error); }
}
