import * as userService from './user.service.js';

export async function list(req, res, next) {
  try {
    const result = await userService.listUsers(req.query, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const user = await userService.createUser(req.body, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const result = await userService.deleteUser(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function activate(req, res, next) {
  try {
    const user = await userService.activateUser(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function deactivate(req, res, next) {
  try {
    const user = await userService.deactivateUser(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function suspend(req, res, next) {
  try {
    const user = await userService.suspendUser(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function reactivate(req, res, next) {
  try {
    const user = await userService.reactivateUser(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function invite(req, res, next) {
  try {
    const user = await userService.inviteUser(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await userService.resetUserPassword(req.params.id, {
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function statistics(req, res, next) {
  try {
    const stats = await userService.getUserStatistics({
      companyId: req.tenantId,
      isGlobalAccess: req.isGlobalAccess,
    });
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}
