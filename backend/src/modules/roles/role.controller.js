import * as roleService from './role.service.js';

export async function list(req, res, next) {
  try {
    const result = await roleService.listRoles(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const role = await roleService.getRoleById(req.params.id);
    res.json({ success: true, data: role });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json({ success: true, data: role });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    res.json({ success: true, data: role });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const result = await roleService.deleteRole(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function activate(req, res, next) {
  try {
    const role = await roleService.activateRole(req.params.id);
    res.json({ success: true, data: role });
  } catch (err) { next(err); }
}

export async function deactivate(req, res, next) {
  try {
    const role = await roleService.deactivateRole(req.params.id);
    res.json({ success: true, data: role });
  } catch (err) { next(err); }
}

export async function assignPermissions(req, res, next) {
  try {
    const role = await roleService.assignPermissions(req.params.id, req.body.permissionCodes || []);
    res.json({ success: true, data: role });
  } catch (err) { next(err); }
}
