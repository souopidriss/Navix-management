import userRepository from '../../repositories/UserRepository.js';
import { hashPassword, generateTempPassword } from '../../utils/password.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors/index.js';

export async function listUsers(query, { companyId, isGlobalAccess } = {}) {
  const filters = {
    company_id: isGlobalAccess ? (query.companyScopeId || companyId) : companyId,
    status: query.status,
    role: query.role,
    search: query.search,
  };

  const { rows, total } = await userRepository.findByCompanyId({
    page: query.page,
    limit: query.limit,
    filters,
    sort: query.sort,
    order: query.order,
  });

  return {
    items: rows,
    total,
    page: query.page,
    pageSize: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function getUserById(id, { companyId, isGlobalAccess } = {}) {
  const user = await userRepository.findWithRoles(id);
  if (!user) throw new NotFoundError('Utilisateur');

  if (!isGlobalAccess && user.company_id !== companyId) {
    throw new NotFoundError('Utilisateur');
  }

  return {
    id: user.id,
    companyId: user.company_id,
    agencyId: user.agency_id,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatar_url,
    role: user.role,
    roles: user.roles || [],
    status: user.status,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function createUser(data, { companyId, isGlobalAccess } = {}) {
  const existing = await userRepository.findByEmail(data.email);
  if (existing) throw new ConflictError('Un utilisateur avec cet email existe déjà');

  const password = data.password || generateTempPassword();
  const passwordHash = await hashPassword(password);

  const user = await userRepository.create({
    company_id: isGlobalAccess ? (data.companyId || companyId) : companyId,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    password_hash: passwordHash,
    phone: data.phone || null,
    role: data.role || 'viewer',
    agency_id: data.agencyId || null,
    status: data.status || 'active',
  });

  return {
    id: user.id,
    companyId: user.company_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
  };
}

export async function updateUser(id, data, { companyId, isGlobalAccess } = {}) {
  const existing = await userRepository.findById(id);
  if (!existing) throw new NotFoundError('Utilisateur');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Utilisateur');

  if (data.email && data.email !== existing.email) {
    const duplicate = await userRepository.findByEmail(data.email);
    if (duplicate) throw new ConflictError('Un utilisateur avec cet email existe déjà');
  }

  const updateData = {};
  if (data.firstName) updateData.first_name = data.firstName;
  if (data.lastName) updateData.last_name = data.lastName;
  if (data.email) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.role) updateData.role = data.role;
  if (data.agencyId !== undefined) updateData.agency_id = data.agencyId;
  if (data.status) updateData.status = data.status;

  await userRepository.update(id, updateData);
  return getUserById(id, { companyId, isGlobalAccess });
}

export async function deleteUser(id, { companyId, isGlobalAccess } = {}) {
  const existing = await userRepository.findById(id);
  if (!existing) throw new NotFoundError('Utilisateur');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Utilisateur');
  if (existing.role === 'super_admin') throw new BadRequestError('Impossible de supprimer un super administrateur');

  await userRepository.softDelete(id);
  return { success: true };
}

export async function activateUser(id, { companyId, isGlobalAccess } = {}) {
  const existing = await userRepository.findById(id);
  if (!existing) throw new NotFoundError('Utilisateur');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Utilisateur');

  await userRepository.activate(id);
  return getUserById(id, { companyId, isGlobalAccess });
}

export async function deactivateUser(id, { companyId, isGlobalAccess } = {}) {
  const existing = await userRepository.findById(id);
  if (!existing) throw new NotFoundError('Utilisateur');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Utilisateur');
  if (existing.role === 'super_admin') throw new BadRequestError('Impossible de désactiver un super administrateur');

  await userRepository.deactivate(id);
  return getUserById(id, { companyId, isGlobalAccess });
}

export async function suspendUser(id, { companyId, isGlobalAccess } = {}) {
  const existing = await userRepository.findById(id);
  if (!existing) throw new NotFoundError('Utilisateur');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Utilisateur');
  if (existing.role === 'super_admin') throw new BadRequestError('Impossible de suspendre un super administrateur');

  await userRepository.suspend(id);
  return getUserById(id, { companyId, isGlobalAccess });
}

export async function reactivateUser(id, { companyId, isGlobalAccess } = {}) {
  const existing = await userRepository.findById(id);
  if (!existing) throw new NotFoundError('Utilisateur');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Utilisateur');

  await userRepository.reactivate(id);
  return getUserById(id, { companyId, isGlobalAccess });
}

export async function inviteUser(id, { companyId, isGlobalAccess } = {}) {
  const existing = await userRepository.findById(id);
  if (!existing) throw new NotFoundError('Utilisateur');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Utilisateur');

  if (existing.status !== 'inactive') {
    throw new BadRequestError("L'utilisateur doit être inactif pour pouvoir être invité");
  }

  await userRepository.updateStatus(id, 'pending');
  return getUserById(id, { companyId, isGlobalAccess });
}

export async function resetUserPassword(id, { companyId, isGlobalAccess } = {}) {
  const existing = await userRepository.findById(id);
  if (!existing) throw new NotFoundError('Utilisateur');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Utilisateur');

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await userRepository.updatePasswordHash(id, passwordHash);

  return { success: true, tempPassword };
}

export async function getUserStatistics({ companyId, isGlobalAccess } = {}) {
  const stats = await userRepository.getStatistics(isGlobalAccess ? null : companyId);
  return {
    total: stats.total || 0,
    active: stats.active || 0,
    inactive: stats.inactive || 0,
    suspended: stats.suspended || 0,
    pending: stats.pending || 0,
    byStatus: {
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      suspended: stats.suspended || 0,
      pending: stats.pending || 0,
    },
  };
}
