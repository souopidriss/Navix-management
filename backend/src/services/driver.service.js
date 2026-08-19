import driverRepository from '../repositories/DriverRepository.js';
import { ConflictError, NotFoundError, ValidationError, BadRequestError } from '../errors/index.js';

const VALID_STATUS_TRANSITIONS = {
  active: ['on_mission', 'available', 'suspended', 'on_leave', 'inactive'],
  on_mission: ['active', 'available', 'inactive'],
  available: ['active', 'on_mission', 'suspended', 'on_leave', 'inactive'],
  suspended: ['active', 'inactive'],
  on_leave: ['active', 'inactive'],
  inactive: ['active'],
};

function normalizeDriverPayload(data) {
  const out = {};
  const stringFields = ['firstName', 'lastName', 'gender', 'birthDate', 'phone', 'email', 'address', 'city', 'country', 'nationality', 'licenseNumber', 'licenseCategory', 'licenseIssueDate', 'licenseExpiryDate', 'employeeCode', 'agencyId', 'status', 'availability', 'photoUrl', 'identityDocument', 'emergencyContactName', 'emergencyContactPhone', 'notes'];
  for (const f of stringFields) {
    if (data[f] !== undefined && data[f] !== null) {
      out[f] = typeof data[f] === 'string' ? data[f].trim() : data[f];
    }
  }
  const numFields = ['yearsExperience'];
  for (const f of numFields) {
    if (data[f] !== undefined) {
      out[f] = data[f];
    }
  }
  if (data.isActive !== undefined) {
    out.isActive = data.isActive;
  }

  const snakeMap = {
    firstName: 'first_name',
    lastName: 'last_name',
    gender: 'gender',
    birthDate: 'birth_date',
    phone: 'phone',
    email: 'email',
    address: 'address',
    city: 'city',
    country: 'country',
    nationality: 'nationality',
    licenseNumber: 'license_number',
    licenseCategory: 'license_category',
    licenseIssueDate: 'license_issue_date',
    licenseExpiryDate: 'license_expiry_date',
    yearsExperience: 'years_experience',
    employeeCode: 'employee_code',
    agencyId: 'agency_id',
    status: 'status',
    availability: 'availability',
    photoUrl: 'photo_url',
    identityDocument: 'identity_document',
    emergencyContactName: 'emergency_contact_name',
    emergencyContactPhone: 'emergency_contact_phone',
    notes: 'notes',
    isActive: 'is_active',
  };

  const result = {};
  for (const [key, value] of Object.entries(out)) {
    const dbKey = snakeMap[key] || key;
    result[dbKey] = value;
  }
  return result;
}

function formatDriverResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    agencyId: row.agency_id,
    userId: row.user_id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    gender: row.gender,
    birthDate: row.birth_date,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    country: row.country,
    nationality: row.nationality,
    licenseNumber: row.license_number,
    licenseCategory: row.license_category,
    licenseIssueDate: row.license_issue_date,
    licenseExpiryDate: row.license_expiry_date,
    yearsExperience: row.years_experience,
    status: row.status,
    availability: row.availability,
    photoUrl: row.photo_url,
    identityDocument: row.identity_document,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    agencyName: row.agency_name || null,
    notes: row.notes,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createDriver(data, { companyId }) {
  const payload = normalizeDriverPayload(data);

  if (!payload.first_name) {
    throw new ValidationError('Le prénom est requis');
  }
  if (!payload.last_name) {
    throw new ValidationError('Le nom est requis');
  }
  if (!payload.employee_code) {
    throw new ValidationError('Le code employé est requis');
  }

  if (await driverRepository.employeeCodeExists(companyId, payload.employee_code)) {
    throw new ConflictError('Un chauffeur avec ce code employé existe déjà dans cette entreprise.');
  }

  if (payload.email && await driverRepository.emailExists(companyId, payload.email)) {
    throw new ConflictError('Un chauffeur avec cet email existe déjà dans cette entreprise.');
  }

  if (payload.license_expiry_date && new Date(payload.license_expiry_date) < new Date()) {
    throw new BadRequestError('La date d\'expiration du permis est dans le passé.');
  }

  const fullName = `${payload.first_name} ${payload.last_name}`;

  const driver = await driverRepository.create({
    company_id: companyId,
    agency_id: payload.agency_id || null,
    user_id: null,
    employee_code: payload.employee_code,
    first_name: payload.first_name,
    last_name: payload.last_name,
    full_name: fullName,
    gender: payload.gender || null,
    birth_date: payload.birth_date || null,
    phone: payload.phone || null,
    email: payload.email || null,
    address: payload.address || null,
    city: payload.city || null,
    country: payload.country || 'Cameroun',
    nationality: payload.nationality || null,
    license_number: payload.license_number || null,
    license_category: payload.license_category || null,
    license_issue_date: payload.license_issue_date || null,
    license_expiry_date: payload.license_expiry_date || null,
    years_experience: payload.years_experience || 0,
    status: payload.status || 'active',
    availability: payload.availability || 'available',
    photo_url: payload.photo_url || null,
    identity_document: payload.identity_document || null,
    emergency_contact_name: payload.emergency_contact_name || null,
    emergency_contact_phone: payload.emergency_contact_phone || null,
    notes: payload.notes || null,
    is_active: true,
  });

  const full = await driverRepository.findByIdWithDetails(driver.id);
  return formatDriverResponse(full);
}

export async function getDriverById(id, { companyId }) {
  const driver = await driverRepository.findByCompanyIdAndId(companyId, id);
  if (!driver) {
    throw new NotFoundError('Chauffeur');
  }
  return formatDriverResponse(driver);
}

export async function listDrivers({ page, limit, sort, order, status, availability, licenseCategory, agencyId, search }, { companyId }) {
  const filters = {};
  if (status) filters.status = status;
  if (availability) filters.availability = availability;
  if (licenseCategory) filters.license_category = licenseCategory;
  if (agencyId) filters.agency_id = agencyId;

  let result;
  if (search) {
    result = await driverRepository.search(companyId, search, {
      page: page || 1,
      limit: limit || 20,
      sort: sort || 'created_at',
      order: order || 'DESC',
    });
  } else {
    result = await driverRepository.findByCompanyId(companyId, {
      page: page || 1,
      limit: limit || 20,
      filters,
      sort: sort || 'created_at',
      order: order || 'DESC',
    });
  }

  return {
    drivers: result.rows.map(formatDriverResponse),
    pagination: {
      page: page || 1,
      limit: limit || 20,
      total: result.total,
      totalPages: Math.ceil(result.total / (limit || 20)),
    },
  };
}

export async function updateDriver(id, data, { companyId }) {
  const existing = await driverRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Chauffeur');
  }

  const payload = normalizeDriverPayload(data);

  if (payload.employee_code && await driverRepository.employeeCodeExists(companyId, payload.employee_code, id)) {
    throw new ConflictError('Un chauffeur avec ce code employé existe déjà dans cette entreprise.');
  }

  if (payload.email && await driverRepository.emailExists(companyId, payload.email, id)) {
    throw new ConflictError('Un chauffeur avec cet email existe déjà dans cette entreprise.');
  }

  if (payload.license_expiry_date && new Date(payload.license_expiry_date) < new Date()) {
    throw new BadRequestError('La date d\'expiration du permis est dans le passé.');
  }

  if (payload.status && payload.status !== existing.status) {
    const allowed = VALID_STATUS_TRANSITIONS[existing.status];
    if (!allowed || !allowed.includes(payload.status)) {
      throw new BadRequestError(
        `Transition de statut invalide : ${existing.status} → ${payload.status}`
      );
    }
  }

  if (payload.first_name || payload.last_name) {
    const fn = payload.first_name || existing.first_name;
    const ln = payload.last_name || existing.last_name;
    payload.full_name = `${fn} ${ln}`;
  }

  if (Object.keys(payload).length === 0) {
    throw new ValidationError('Aucun champ à mettre à jour');
  }

  await driverRepository.update(id, payload);
  const full = await driverRepository.findByIdWithDetails(id);
  return formatDriverResponse(full);
}

export async function deleteDriver(id, { companyId }) {
  const existing = await driverRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Chauffeur');
  }

  const dependencies = await driverRepository.findDependencies(id);
  if (dependencies.length > 0) {
    const depNames = dependencies.map((d) => `${d.table} (${d.count})`).join(', ');
    throw new BadRequestError(
      `Impossible de supprimer ce chauffeur. Il est associé à : ${depNames}`
    );
  }

  await driverRepository.softDelete(id);
  return { message: 'Chauffeur supprimé avec succès.' };
}

export async function getDriverStats({ companyId }) {
  const stats = await driverRepository.getStats(companyId);
  return stats;
}

export async function changeDriverStatus(id, newStatus, { companyId }) {
  const existing = await driverRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Chauffeur');
  }

  const allowed = VALID_STATUS_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Transition de statut invalide : ${existing.status} → ${newStatus}`
    );
  }

  await driverRepository.update(id, { status: newStatus });
  const full = await driverRepository.findByIdWithDetails(id);
  return formatDriverResponse(full);
}
