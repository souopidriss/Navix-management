import * as tripService from '../../services/trip.service.js';

export async function list(req, res, next) {
  try {
    const result = await tripService.listTrips(req.query, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const trip = await tripService.getTripById(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const trip = await tripService.createTrip(req.body, {
      companyId: req.tenantId,
      userName: req.user?.fullName || req.user?.email || 'Systeme',
    });
    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.body, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await tripService.deleteTrip(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const data = await tripService.getTripStats({
      companyId: req.tenantId,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function start(req, res, next) {
  try {
    const trip = await tripService.startTrip(req.params.id, {
      companyId: req.tenantId,
      userName: req.user?.fullName || req.user?.email || 'Systeme',
    });
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function pause(req, res, next) {
  try {
    const trip = await tripService.pauseTrip(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function resume(req, res, next) {
  try {
    const trip = await tripService.resumeTrip(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function finish(req, res, next) {
  try {
    const trip = await tripService.finishTrip(req.params.id, req.body, {
      companyId: req.tenantId,
      userName: req.user?.fullName || req.user?.email || 'Systeme',
    });
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req, res, next) {
  try {
    const trip = await tripService.cancelTrip(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function history(req, res, next) {
  try {
    const result = await tripService.getHistory(req.query, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function byDriver(req, res, next) {
  try {
    const result = await tripService.getTripsByDriver(req.params.driverId, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function byAssignment(req, res, next) {
  try {
    const trips = await tripService.getTripsByAssignment(req.params.assignmentId, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: trips });
  } catch (err) {
    next(err);
  }
}
