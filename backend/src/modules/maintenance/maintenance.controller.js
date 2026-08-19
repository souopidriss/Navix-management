import * as maintenanceService from '../../services/maintenance.service.js';

export async function list(req, res, next) {
  try {
    const result = await maintenanceService.listMaintenances(req.query, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const record = await maintenanceService.getMaintenanceById(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const record = await maintenanceService.createMaintenance(req.body, {
      companyId: req.tenantId,
      userName: req.user?.fullName || req.user?.first_name || '',
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const record = await maintenanceService.updateMaintenance(
      req.params.id,
      req.body,
      { companyId: req.tenantId }
    );
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await maintenanceService.deleteMaintenance(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const data = await maintenanceService.getMaintenanceStatistics({
      companyId: req.tenantId,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function calendar(req, res, next) {
  try {
    const result = await maintenanceService.getCalendarEvents(req.query, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function history(req, res, next) {
  try {
    const result = await maintenanceService.getVehicleMaintenanceHistory(
      req.query.vehicleId,
      { companyId: req.tenantId }
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function start(req, res, next) {
  try {
    const record = await maintenanceService.startMaintenance(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function complete(req, res, next) {
  try {
    const record = await maintenanceService.completeMaintenance(
      req.params.id,
      { companyId: req.tenantId }
    );
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req, res, next) {
  try {
    const record = await maintenanceService.cancelMaintenance(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function vehicleMaintenanceHistory(req, res, next) {
  try {
    const result = await maintenanceService.getVehicleMaintenanceHistory(
      req.params.vehicleId,
      { companyId: req.tenantId }
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
