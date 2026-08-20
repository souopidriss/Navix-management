import * as dashboardService from './dashboard.service.js';

function buildParams(req) {
  return {
    companyId: req.tenantId,
    period: req.query.period || 'month',
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  };
}

export async function overview(req, res, next) {
  try {
    const result = await dashboardService.getOverview(buildParams(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function fleet(req, res, next) {
  try {
    const result = await dashboardService.getFleetStatistics(buildParams(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function fuelStats(req, res, next) {
  try {
    const result = await dashboardService.getFuelStatistics(buildParams(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function maintenanceStats(req, res, next) {
  try {
    const result = await dashboardService.getMaintenanceStatistics(buildParams(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function financial(req, res, next) {
  try {
    const result = await dashboardService.getFinancialStatistics(buildParams(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function alerts(req, res, next) {
  try {
    const result = await dashboardService.getAlerts({ companyId: req.tenantId });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function activities(req, res, next) {
  try {
    const result = await dashboardService.getRecentActivities(buildParams(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function topVehicles(req, res, next) {
  try {
    const result = await dashboardService.getTopVehicles(buildParams(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function topDrivers(req, res, next) {
  try {
    const result = await dashboardService.getTopDrivers(buildParams(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
