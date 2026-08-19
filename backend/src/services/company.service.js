import companyRepository from '../repositories/CompanyRepository.js';
import { ConflictError, NotFoundError, ValidationError, AuthorizationError } from '../errors/index.js';
import { getPool } from '../database/index.js';
import { generateId } from '../utils/id.js';

function generateSlug(name) {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const suffix = Date.now().toString(36);
  return `${base}-${suffix}`;
}

function normalizeCompanyPayload(data) {
  const out = {};
  const stringFields = ['name', 'code', 'legal_name', 'trading_name', 'registration_number', 'tax_number', 'email', 'phone', 'website', 'address', 'city', 'country', 'description', 'logo_url'];
  for (const f of stringFields) {
    if (data[f] !== undefined && data[f] !== null) {
      out[f] = typeof data[f] === 'string' ? data[f].trim() : data[f];
    }
  }
  if (data.status) out.status = data.status;
  if (data.is_active !== undefined) out.is_active = data.is_active;
  if (data.max_users !== undefined) out.max_users = data.max_users;
  if (data.max_vehicles !== undefined) out.max_vehicles = data.max_vehicles;
  if (data.settings !== undefined) out.settings = typeof data.settings === 'object' ? JSON.stringify(data.settings) : data.settings;
  return out;
}

export async function createCompany(data) {
  const payload = normalizeCompanyPayload(data);

  if (!payload.name) {
    throw new ValidationError('Le nom de l\'entreprise est requis');
  }

  const slug = generateSlug(payload.name);

  if (payload.email && await companyRepository.emailExists(payload.email)) {
    throw new ConflictError('Une entreprise avec cet email existe déjà.');
  }
  if (payload.code && await companyRepository.codeExists(payload.code)) {
    throw new ConflictError('Une entreprise avec ce code existe déjà.');
  }

  const company = await companyRepository.create({
    name: payload.name,
    code: payload.code || null,
    slug,
    legal_name: payload.legal_name || null,
    trading_name: payload.trading_name || null,
    registration_number: payload.registration_number || null,
    tax_number: payload.tax_number || null,
    email: payload.email || null,
    phone: payload.phone || null,
    website: payload.website || null,
    address: payload.address || null,
    city: payload.city || null,
    country: payload.country || null,
    description: payload.description || null,
    logo_url: payload.logo_url || null,
    status: 'pending',
    is_active: true,
    max_users: payload.max_users || null,
    max_vehicles: payload.max_vehicles || null,
    settings: payload.settings || null,
  });

  return formatCompanyResponse(company);
}

export async function createCompanyWithOwner(data, ownerData) {
  const payload = normalizeCompanyPayload(data);

  if (!payload.name) {
    throw new ValidationError('Le nom de l\'entreprise est requis');
  }

  if (payload.email && await companyRepository.emailExists(payload.email)) {
    throw new ConflictError('Une entreprise avec cet email existe déjà.');
  }
  if (payload.code && await companyRepository.codeExists(payload.code)) {
    throw new ConflictError('Une entreprise avec ce code existe déjà.');
  }

  const slug = generateSlug(payload.name);
  const companyId = generateId();
  const userId = generateId();
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await getPool().execute(
    `INSERT INTO companies (id, name, code, slug, legal_name, trading_name, registration_number, tax_number, email, phone, website, address, city, country, description, logo_url, status, is_active, max_users, max_vehicles, settings, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      companyId, payload.name, payload.code || null, slug,
      payload.legal_name || null, payload.trading_name || null, payload.registration_number || null,
      payload.tax_number || null, payload.email || null, payload.phone || null,
      payload.website || null, payload.address || null, payload.city || null,
      payload.country || null, payload.description || null, payload.logo_url || null,
      'active', true,
      payload.max_users || null, payload.max_vehicles || null,
      payload.settings ? JSON.stringify(payload.settings) : null,
      now, now,
    ]
  );

  const { hashPassword } = await import('../services/password.service.js');
  const passwordHash = await hashPassword(ownerData.password);

  await getPool().execute(
    `INSERT INTO users (id, first_name, last_name, email, password_hash, role, company_id, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, ownerData.firstName, ownerData.lastName, ownerData.email, passwordHash, 'company_owner', companyId, 'active', now, now]
  );

  const company = await companyRepository.findByIdWithOwner(companyId);
  return formatCompanyResponse(company);
}

export async function getCompanyById(id, { isGlobalAccess = false, tenantId = null } = {}) {
  const company = await companyRepository.findByIdWithOwner(id);
  if (!company) {
    throw new NotFoundError('Entreprise');
  }

  if (!isGlobalAccess && company.id !== tenantId) {
    throw new AuthorizationError('Accès refusé à cette entreprise.');
  }

  const counts = await companyRepository.findWithCounts(id);
  return formatCompanyResponse({ ...company, ...counts });
}

export async function listCompanies({ page, limit, sort, order, status, search }, { isGlobalAccess = false, tenantId = null } = {}) {
  const filters = {};
  if (status) filters.status = status;
  if (!isGlobalAccess && tenantId) {
    filters.id = tenantId;
  }

  let result;
  if (search) {
    const searchPattern = `%${search}%`;
    const { where, params } = companyRepository.buildWhereClause(filters, 'c');
    const sqlWhere = where ? `${where} AND (c.name LIKE ? OR c.code LIKE ? OR c.email LIKE ?)` : `WHERE (c.name LIKE ? OR c.code LIKE ? OR c.email LIKE ?)`;
    const searchParams = [searchPattern, searchPattern, searchPattern];

    const countResult = await companyRepository.queryOne(
      `SELECT COUNT(*) as total FROM companies c ${sqlWhere}`,
      [...params, ...searchParams]
    );
    const total = countResult?.total || 0;

    const allowedSort = companyRepository.sanitizeSortField(sort || 'created_at');
    const allowedOrder = (order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = ((page || 1) - 1) * (limit || 20);

    const rows = await companyRepository.query(`
      SELECT c.*,
        u.id AS owner_id, u.first_name AS owner_first_name, u.last_name AS owner_last_name,
        u.email AS owner_email,
        (SELECT COUNT(*) FROM vehicles v WHERE v.company_id = c.id AND v.deleted_at IS NULL) AS vehicle_count,
        (SELECT COUNT(*) FROM drivers d WHERE d.company_id = c.id AND d.deleted_at IS NULL) AS driver_count,
        (SELECT COUNT(*) FROM agencies a WHERE a.company_id = c.id AND a.deleted_at IS NULL) AS agency_count
      FROM companies c
      LEFT JOIN users u ON u.company_id = c.id AND u.role IN ('company_owner', 'client_enterprise') AND u.deleted_at IS NULL
      ${sqlWhere}
      ORDER BY c.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?
    `, [...params, ...searchParams, limit || 20, offset]);

    result = { rows, total };
  } else {
    result = await companyRepository.findListWithCounts({
      page: page || 1,
      limit: limit || 20,
      filters,
      sort: sort || 'created_at',
      order: order || 'DESC',
    });
  }

  return {
    companies: result.rows.map(formatCompanyResponse),
    pagination: {
      page: page || 1,
      limit: limit || 20,
      total: result.total,
      totalPages: Math.ceil(result.total / (limit || 20)),
    },
  };
}

export async function updateCompany(id, data, { isGlobalAccess = false, tenantId = null } = {}) {
  const existing = await companyRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Entreprise');
  }

  if (!isGlobalAccess && existing.id !== tenantId) {
    throw new AuthorizationError('Accès refusé à cette entreprise.');
  }

  const payload = normalizeCompanyPayload(data);

  if (payload.email && await companyRepository.emailExists(payload.email, id)) {
    throw new ConflictError('Une entreprise avec cet email existe déjà.');
  }
  if (payload.code && await companyRepository.codeExists(payload.code, id)) {
    throw new ConflictError('Une entreprise avec ce code existe déjà.');
  }

  if (Object.keys(payload).length === 0) {
    throw new ValidationError('Aucun champ à mettre à jour');
  }

  await companyRepository.update(id, payload);
  const full = await companyRepository.findByIdWithOwner(id);
  return formatCompanyResponse(full);
}

export async function deleteCompany(id, { isGlobalAccess = false, tenantId = null } = {}) {
  const existing = await companyRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Entreprise');
  }

  if (!isGlobalAccess && existing.id !== tenantId) {
    throw new AuthorizationError('Accès refusé à cette entreprise.');
  }

  await companyRepository.softDelete(id);
  return { message: 'Entreprise supprimée avec succès.' };
}

export async function activateCompany(id) {
  const existing = await companyRepository.findById(id);
  if (!existing) throw new NotFoundError('Entreprise');
  const updated = await companyRepository.update(id, { status: 'active', is_active: true });
  return formatCompanyResponse(updated);
}

export async function suspendCompany(id) {
  const existing = await companyRepository.findById(id);
  if (!existing) throw new NotFoundError('Entreprise');
  const updated = await companyRepository.update(id, { status: 'suspended', is_active: false });
  return formatCompanyResponse(updated);
}

function formatCompanyResponse(row) {
  if (!row) return null;

  const ownerName = row.owner_first_name
    ? `${row.owner_first_name} ${row.owner_last_name}`
    : null;

  return {
    id: row.id,
    name: row.name,
    code: row.code,
    legalName: row.legal_name,
    tradingName: row.trading_name,
    registrationNumber: row.registration_number,
    taxNumber: row.tax_number,
    email: row.email,
    phone: row.phone,
    website: row.website,
    address: row.address,
    city: row.city,
    country: row.country,
    description: row.description,
    logo: row.logo_url,
    slug: row.slug,
    status: row.status,
    subscriptionPlan: row.subscription_plan,
    subscriptionStatus: row.subscription_status,
    isActive: !!row.is_active,
    maxUsers: row.max_users,
    maxVehicles: row.max_vehicles,
    owner: row.owner_id ? {
      id: row.owner_id,
      name: ownerName,
      firstName: row.owner_first_name,
      lastName: row.owner_last_name,
      email: row.owner_email,
    } : null,
    vehicleCount: row.vehicle_count ?? undefined,
    driverCount: row.driver_count ?? undefined,
    agencyCount: row.agency_count ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
