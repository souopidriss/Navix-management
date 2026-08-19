import * as driverService from '../../services/driver.service.js';

export async function list(req, res, next) {
  try {
    const result = await driverService.listDrivers(req.query, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const driver = await driverService.getDriverById(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: driver });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const driver = await driverService.createDriver(req.body, {
      companyId: req.tenantId,
    });
    res.status(201).json({ success: true, data: driver });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: driver });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await driverService.deleteDriver(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const data = await driverService.getDriverStats({
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
    const driver = await driverService.changeDriverStatus(req.params.id, status, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: driver });
  } catch (err) {
    next(err);
  }
}
