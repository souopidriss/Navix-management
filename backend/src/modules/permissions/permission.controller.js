import * as permissionService from './permission.service.js';

export async function list(req, res, next) {
  try {
    const result = await permissionService.listPermissions(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const perm = await permissionService.getPermissionById(req.params.id);
    res.json({ success: true, data: perm });
  } catch (err) { next(err); }
}

export async function modules(req, res, next) {
  try {
    const result = await permissionService.getModules();
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function statistics(req, res, next) {
  try {
    const result = await permissionService.getStatistics();
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
