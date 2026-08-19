import * as companyService from '../../services/company.service.js';

export async function list(req, res, next) {
  try {
    const { page, limit, sort, order, status, search } = req.query;
    const result = await companyService.listCompanies(
      { page, limit, sort, order, status, search },
      { isGlobalAccess: req.isGlobalAccess, tenantId: req.tenantId }
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const company = await companyService.getCompanyById(req.params.id, {
      isGlobalAccess: req.isGlobalAccess,
      tenantId: req.tenantId,
    });
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const company = await companyService.createCompany(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
}

export async function createWithOwner(req, res, next) {
  try {
    const { company: companyData, owner: ownerData } = req.body;
    const result = await companyService.createCompanyWithOwner(companyData, ownerData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const company = await companyService.updateCompany(req.params.id, req.body, {
      isGlobalAccess: req.isGlobalAccess,
      tenantId: req.tenantId,
    });
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await companyService.deleteCompany(req.params.id, {
      isGlobalAccess: req.isGlobalAccess,
      tenantId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function activate(req, res, next) {
  try {
    const company = await companyService.activateCompany(req.params.id);
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
}

export async function suspend(req, res, next) {
  try {
    const company = await companyService.suspendCompany(req.params.id);
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
}

export async function getStats(req, res, next) {
  try {
    const company = await companyService.getCompanyById(req.params.id, {
      isGlobalAccess: req.isGlobalAccess,
      tenantId: req.tenantId,
    });
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
}
