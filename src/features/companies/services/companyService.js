/**
 * Navix Companies — CompanyService
 * --------------------------------------------------------------------------
 * Description : gestion complète des entreprises (multi-tenant), mock uniquement.
 * Responsabilité : fournir les données entreprises aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()                 → liste de toutes les entreprises
 *   getById(id)              → détail d'une entreprise (404 si absente)
 *   create(payload)          → création (code unique, 409 si doublon)
 *   update(id, payload)      → mise à jour (code unique, 404/409 si conflit)
 *   remove(id)               → suppression (404 si absente)
 *
 * Exemple d'utilisation :
 *   import { companyService } from '../services';
 *   const companies = await companyService.getAll();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_COMPANIES } from '../mocks';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Génère un identifiant ULID plausible (horodatage + aléa Crockford). */
const generateUlid = () => {
  const time = Date.now().toString(36).toUpperCase().padStart(10, '0').slice(0, 10);
  let random = '';
  for (let i = 0; i < 16; i += 1) {
    random += CROCKFORD[Math.floor(Math.random() * CROCKFORD.length)];
  }
  return `${time}${random}`;
};

let companiesCache = null;

const getCompaniesCache = () => {
  if (!companiesCache) {
    companiesCache = MOCK_COMPANIES.map((company) => ({
      ...company,
      owner: { ...company.owner },
    }));
  }
  return companiesCache;
};

const isDuplicateCode = (code, excludedId) =>
  getCompaniesCache().some(
    (company) => company.code.toLowerCase() === code.trim().toLowerCase() && company.id !== excludedId,
  );

export const companyService = {
  /**
   * Liste de toutes les entreprises (copie — les mutations ultérieures du
   * cache n'affectent pas les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    if (apiConfig.mock) {
      return mockResponse([...getCompaniesCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.COMPANIES.LIST);
    return data;
  },

  /**
   * Détail d'une entreprise.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const company = getCompaniesCache().find((item) => item.id === id);
      if (!company) {
        return mockResponse(null, { error: ApiError.notFound('Entreprise introuvable.') });
      }
      return mockResponse(company);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.COMPANIES.DETAIL(id));
    return data;
  },

  /**
   * Création d'une entreprise (le code doit être unique).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      if (isDuplicateCode(payload.code)) {
        return mockResponse(null, { error: new ApiError({ status: 409, code: 'COMPANY_CODE_EXISTS', message: 'Ce code d’entreprise est déjà utilisé.' }) });
      }

      const now = new Date().toISOString();
      const company = {
        ...payload,
        id: generateUlid(),
        createdAt: now,
        updatedAt: now,
      };
      getCompaniesCache().unshift(company);
      return mockResponse(company);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.COMPANIES.LIST, payload);
    return data;
  },

  /**
   * Mise à jour d'une entreprise.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const index = getCompaniesCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Entreprise introuvable.') });
      }
      if (isDuplicateCode(payload.code, id)) {
        return mockResponse(null, { error: new ApiError({ status: 409, code: 'COMPANY_CODE_EXISTS', message: 'Ce code d’entreprise est déjà utilisé.' }) });
      }

      const updated = {
        ...getCompaniesCache()[index],
        ...payload,
        id,
        updatedAt: new Date().toISOString(),
      };
      getCompaniesCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.COMPANIES.DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'une entreprise.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    if (apiConfig.mock) {
      const exists = getCompaniesCache().some((item) => item.id === id);
      if (!exists) {
        return mockResponse(null, { error: ApiError.notFound('Entreprise introuvable.') });
      }
      companiesCache = getCompaniesCache().filter((item) => item.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.COMPANIES.DETAIL(id));
    return data;
  },
};
