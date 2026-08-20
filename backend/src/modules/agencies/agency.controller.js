import * as agencyService from './agency.service.js';

export async function list(req, res, next) {
  try {
    const result = await agencyService.listAgencies(req.query, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const agency = await agencyService.getAgencyById(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: agency });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const agency = await agencyService.createAgency(req.body, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.status(201).json({ success: true, data: agency });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const agency = await agencyService.updateAgency(req.params.id, req.body, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: agency });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const result = await agencyService.deleteAgency(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function activate(req, res, next) {
  try {
    const agency = await agencyService.activateAgency(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: agency });
  } catch (err) { next(err); }
}

export async function deactivate(req, res, next) {
  try {
    const agency = await agencyService.deactivateAgency(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: agency });
  } catch (err) { next(err); }
}

export async function getVehicles(req, res, next) {
  try {
    const vehicles = await agencyService.getAgencyVehicles(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: vehicles });
  } catch (err) { next(err); }
}

export async function getDrivers(req, res, next) {
  try {
    const drivers = await agencyService.getAgencyDrivers(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: drivers });
  } catch (err) { next(err); }
}

export async function getActivity(req, res, next) {
  try {
    const activity = await agencyService.getAgencyActivity(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: activity });
  } catch (err) { next(err); }
}

export async function stats(req, res, next) {
  try {
    const result = await agencyService.getAgencyStats({
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
