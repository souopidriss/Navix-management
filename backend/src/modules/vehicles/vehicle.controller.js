import * as vehicleService from '../../services/vehicle.service.js';

export async function list(req, res, next) {
  try {
    const result = await vehicleService.listVehicles(req.query, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const vehicle = await vehicleService.createVehicle(req.body, {
      companyId: req.tenantId,
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await vehicleService.deleteVehicle(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const data = await vehicleService.getVehicleStats({
      companyId: req.tenantId,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function changeStatus(req, res, next) {
  try {
    const { status } = req.body;
    const vehicle = await vehicleService.changeVehicleStatus(req.params.id, status, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}
