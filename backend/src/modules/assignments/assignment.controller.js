import * as assignmentService from '../../services/assignment.service.js';

export async function list(req, res, next) {
  try {
    const result = await assignmentService.listAssignments(req.query, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const assignment = await assignmentService.createAssignment(req.body, {
      companyId: req.tenantId,
      userName: req.user?.fullName || req.user?.email || 'Systeme',
    });
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const assignment = await assignmentService.updateAssignment(req.params.id, req.body, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await assignmentService.deleteAssignment(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const data = await assignmentService.getAssignmentStats({
      companyId: req.tenantId,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function end(req, res, next) {
  try {
    const assignment = await assignmentService.endAssignment(req.params.id, req.body, {
      companyId: req.tenantId,
      userName: req.user?.fullName || req.user?.email || 'Systeme',
    });
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function start(req, res, next) {
  try {
    const assignment = await assignmentService.startAssignment(req.params.id, {
      companyId: req.tenantId,
      userName: req.user?.fullName || req.user?.email || 'Systeme',
    });
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req, res, next) {
  try {
    const assignment = await assignmentService.cancelAssignment(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function history(req, res, next) {
  try {
    const result = await assignmentService.getHistory(req.query, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function currentByVehicle(req, res, next) {
  try {
    const assignment = await assignmentService.getCurrentByVehicle(req.params.vehicleId, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function currentByDriver(req, res, next) {
  try {
    const assignment = await assignmentService.getCurrentByDriver(req.params.driverId, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function byVehicle(req, res, next) {
  try {
    const assignments = await assignmentService.getByVehicle(req.params.vehicleId, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
}

export async function byDriver(req, res, next) {
  try {
    const assignments = await assignmentService.getByDriver(req.params.driverId, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
}
