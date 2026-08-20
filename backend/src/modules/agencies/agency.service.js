import agencyRepository from '../../repositories/AgencyRepository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors/index.js';

export async function listAgencies(query, { companyId, isGlobalAccess } = {}) {
  const targetCompanyId = isGlobalAccess ? (query.companyScopeId || companyId) : companyId;

  const { rows, total } = await agencyRepository.findByCompanyId({
    page: query.page,
    limit: query.limit,
    filters: {
      company_id: targetCompanyId,
      status: query.status,
      search: query.search,
    },
    sort: query.sort,
    order: query.order,
  });

  return {
    items: rows.map((r) => ({
      id: r.id,
      companyId: r.company_id,
      name: r.name,
      code: r.code,
      email: r.email,
      phone: r.phone,
      address: r.address,
      city: r.city,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
      status: r.status,
      isActive: !!r.is_active,
      vehicleCount: r.vehicle_count || 0,
      driverCount: r.driver_count || 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
    total,
  };
}

export async function getAgencyById(id, { companyId, isGlobalAccess } = {}) {
  const agency = await agencyRepository.findByIdWithCounts(id);
  if (!agency) throw new NotFoundError('Agence');
  if (!isGlobalAccess && agency.company_id !== companyId) throw new NotFoundError('Agence');

  return {
    id: agency.id,
    companyId: agency.company_id,
    name: agency.name,
    code: agency.code,
    email: agency.email,
    phone: agency.phone,
    address: agency.address,
    city: agency.city,
    country: agency.country,
    latitude: agency.latitude,
    longitude: agency.longitude,
    status: agency.status,
    isActive: !!agency.is_active,
    vehicleCount: agency.vehicle_count || 0,
    driverCount: agency.driver_count || 0,
    createdAt: agency.created_at,
    updatedAt: agency.updated_at,
  };
}

export async function createAgency(data, { companyId, isGlobalAccess } = {}) {
  const targetCompanyId = isGlobalAccess ? (data.companyId || companyId) : companyId;
  const existing = await agencyRepository.findByCompanyAndCode(targetCompanyId, data.code);
  if (existing) throw new ConflictError('Une agence avec ce code existe déjà dans cette entreprise');

  const agency = await agencyRepository.create({
    company_id: targetCompanyId,
    name: data.name,
    code: data.code,
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    city: data.city || null,
    country: data.country || 'Cameroun',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    status: data.status || 'active',
    is_active: data.status !== 'inactive',
  });

  return getAgencyById(agency.id, { companyId, isGlobalAccess });
}

export async function updateAgency(id, data, { companyId, isGlobalAccess } = {}) {
  const existing = await agencyRepository.findById(id);
  if (!existing) throw new NotFoundError('Agence');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Agence');

  if (data.code && data.code !== existing.code) {
    const duplicate = await agencyRepository.findByCompanyAndCode(existing.company_id, data.code, id);
    if (duplicate) throw new ConflictError('Une agence avec ce code existe déjà');
  }

  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.code) updateData.code = data.code;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.country) updateData.country = data.country;
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;
  if (data.status) {
    updateData.status = data.status;
    updateData.is_active = data.status !== 'inactive';
  }

  await agencyRepository.update(id, updateData);
  return getAgencyById(id, { companyId, isGlobalAccess });
}

export async function deleteAgency(id, { companyId, isGlobalAccess } = {}) {
  const existing = await agencyRepository.findById(id);
  if (!existing) throw new NotFoundError('Agence');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Agence');

  if (existing.vehicle_count > 0 || existing.driver_count > 0) {
    throw new BadRequestError('Impossible de supprimer une agence contenant des véhicules ou chauffeurs');
  }

  await agencyRepository.softDelete(id);
  return { success: true };
}

export async function activateAgency(id, { companyId, isGlobalAccess } = {}) {
  const existing = await agencyRepository.findById(id);
  if (!existing) throw new NotFoundError('Agence');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Agence');

  await agencyRepository.activate(id);
  return getAgencyById(id, { companyId, isGlobalAccess });
}

export async function deactivateAgency(id, { companyId, isGlobalAccess } = {}) {
  const existing = await agencyRepository.findById(id);
  if (!existing) throw new NotFoundError('Agence');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Agence');

  await agencyRepository.deactivate(id);
  return getAgencyById(id, { companyId, isGlobalAccess });
}

export async function getAgencyVehicles(id, { companyId, isGlobalAccess } = {}) {
  const existing = await agencyRepository.findById(id);
  if (!existing) throw new NotFoundError('Agence');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Agence');

  return agencyRepository.findVehiclesByAgency(id);
}

export async function getAgencyDrivers(id, { companyId, isGlobalAccess } = {}) {
  const existing = await agencyRepository.findById(id);
  if (!existing) throw new NotFoundError('Agence');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Agence');

  return agencyRepository.findDriversByAgency(id);
}

export async function getAgencyActivity(id, { companyId, isGlobalAccess } = {}) {
  const existing = await agencyRepository.findById(id);
  if (!existing) throw new NotFoundError('Agence');
  if (!isGlobalAccess && existing.company_id !== companyId) throw new NotFoundError('Agence');

  return agencyRepository.getRecentActivity(id);
}

export async function getAgencyStats({ companyId, isGlobalAccess } = {}) {
  const targetCompanyId = isGlobalAccess ? null : companyId;
  return agencyRepository.getStats(targetCompanyId);
}
