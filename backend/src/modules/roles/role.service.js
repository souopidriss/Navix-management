import roleRepository from '../../repositories/RoleRepository.js';
import permissionRepository from '../../repositories/PermissionRepository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors/index.js';

export async function listRoles(query) {
  const filters = {};
  if (query.search) filters.search = query.search;
  if (query.type === 'system') filters.is_system = true;
  if (query.type === 'custom') filters.is_system = false;
  if (query.is_active !== undefined) filters.is_active = query.is_active;

  const { rows, total } = await roleRepository.findAll({
    page: query.page,
    limit: query.limit,
    filters,
    sort: query.sort,
    order: query.order,
  });

  return {
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      displayName: r.display_name,
      description: r.description,
      isSystem: !!r.is_system,
      isActive: !!r.is_active,
      usersCount: r.users_count || 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
    total,
  };
}

export async function getRoleById(id) {
  const role = await roleRepository.findWithPermissionsList(id);
  if (!role) throw new NotFoundError('Rôle');

  return {
    id: role.id,
    name: role.name,
    code: role.code,
    displayName: role.display_name,
    description: role.description,
    isSystem: !!role.is_system,
    isActive: !!role.is_active,
    permissions: role.permissions || [],
    createdAt: role.created_at,
    updatedAt: role.updated_at,
  };
}

export async function createRole(data) {
  const existing = await roleRepository.findByCodeOrName(data.code, data.name);
  if (existing) throw new ConflictError('Un rôle avec ce nom ou code existe déjà');

  const role = await roleRepository.create({
    name: data.name,
    code: data.code,
    display_name: data.displayName || data.name,
    description: data.description || null,
    company_id: data.companyId || null,
    is_system: false,
    is_active: data.isActive !== false,
  });

  if (data.permissions && data.permissions.length > 0) {
    const permRecords = await permissionRepository.findManyByCodes(data.permissions);
    if (permRecords.length > 0) {
      await roleRepository.syncPermissions(role.id, permRecords.map((p) => p.id));
    }
  }

  return getRoleById(role.id);
}

export async function updateRole(id, data) {
  const existing = await roleRepository.findById(id);
  if (!existing) throw new NotFoundError('Rôle');
  if (existing.is_system) throw new BadRequestError('Impossible de modifier un rôle système');

  if (data.code || data.name) {
    const code = data.code || existing.code;
    const name = data.name || existing.name;
    const duplicate = await roleRepository.findByCodeOrName(code, name, id);
    if (duplicate) throw new ConflictError('Un rôle avec ce nom ou code existe déjà');
  }

  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.code) updateData.code = data.code;
  if (data.displayName) updateData.display_name = data.displayName;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  if (Object.keys(updateData).length > 0) {
    await roleRepository.update(id, updateData);
  }

  if (data.permissions !== undefined) {
    const permRecords = await permissionRepository.findManyByCodes(data.permissions);
    await roleRepository.syncPermissions(id, permRecords.map((p) => p.id));
  }

  return getRoleById(id);
}

export async function deleteRole(id) {
  const existing = await roleRepository.findById(id);
  if (!existing) throw new NotFoundError('Rôle');
  if (existing.is_system) throw new BadRequestError('Impossible de supprimer un rôle système');

  const usersCount = await roleRepository.countUsers(id);
  if (usersCount > 0) throw new BadRequestError(`Ce rôle est assigné à ${usersCount} utilisateur(s). Réassignez-les avant de supprimer.`);

  await roleRepository.softDelete(id);
  return { success: true };
}

export async function activateRole(id) {
  const existing = await roleRepository.findById(id);
  if (!existing) throw new NotFoundError('Rôle');
  await roleRepository.update(id, { is_active: true });
  return getRoleById(id);
}

export async function deactivateRole(id) {
  const existing = await roleRepository.findById(id);
  if (!existing) throw new NotFoundError('Rôle');
  if (existing.is_system) throw new BadRequestError('Impossible de désactiver un rôle système');
  await roleRepository.update(id, { is_active: false });
  return getRoleById(id);
}

export async function assignPermissions(id, permissionCodes) {
  const existing = await roleRepository.findById(id);
  if (!existing) throw new NotFoundError('Rôle');

  const permRecords = await permissionRepository.findManyByCodes(permissionCodes);
  await roleRepository.syncPermissions(id, permRecords.map((p) => p.id));

  return getRoleById(id);
}
