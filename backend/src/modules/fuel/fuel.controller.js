import * as fuelService from '../../services/fuel.service.js';

export async function list(req, res, next) {
  try {
    const result = await fuelService.listFuelRecords(req.query, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const record = await fuelService.getFuelRecordById(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const record = await fuelService.createFuelRecord(req.body, {
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
    const record = await fuelService.updateFuelRecord(req.params.id, req.body, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await fuelService.deleteFuelRecord(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const data = await fuelService.getFuelStatistics({
      companyId: req.tenantId,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function vehicleFuelHistory(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await fuelService.getVehicleFuelHistory(req.params.vehicleId, {
      companyId: req.tenantId,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
