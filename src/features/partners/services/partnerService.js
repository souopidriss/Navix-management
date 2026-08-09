/**
 * Navix Partners — PartnerService
 * --------------------------------------------------------------------------
 * Description : gestion complète des partenaires (multi-tenant), mock uniquement.
 * Responsabilité : fournir les données partenaires aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()             → liste de tous les partenaires
 *   getById(id)          → détail d'un partenaire (404 si absent)
 *   create(payload)      → création (code auto PRT-XXXX, horodatages)
 *   update(id, payload)  → mise à jour (404 si absent)
 *   delete(id)           → suppression (404 si absent)
 *
 * Règles métier simulées :
 *   - code partenaire automatique (PRT-XXXX) et identifiant ULID
 *   - horodatages de création / mise à jour gérés par le service
 *
 * Exemple d'utilisation :
 *   import { partnerService } from '../services';
 *   const records = await partnerService.getAll();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_PARTNER_RECORDS, nextPartnerCode } from '../mocks';

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

let partnersCache = null;
let partnerCodeCounter = Number(nextPartnerCode);

const getPartnersCache = () => {
  if (!partnersCache) {
    partnersCache = MOCK_PARTNER_RECORDS.map((record) => ({ ...record }));
  }
  return partnersCache;
};

/** Construit un enregistrement partenaire à partir du payload du formulaire. */
const buildPartnerRecord = (payload) => {
  const now = new Date().toISOString();
  return {
    ...payload,
    id: generateUlid(),
    code: `PRT-${String(partnerCodeCounter).padStart(4, '0')}`,
    createdBy: 'Utilisateur connecté',
    createdAt: now,
    updatedAt: now,
  };
};

export const partnerService = {
  /**
   * Liste de tous les partenaires (copie — les mutations ultérieures du cache
   * n'affectent pas les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    if (apiConfig.mock) {
      return mockResponse([...getPartnersCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.PARTNERS.LIST);
    return data;
  },

  /**
   * Détail d'un partenaire.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const record = getPartnersCache().find((item) => item.id === id);
      if (!record) {
        return mockResponse(null, { error: ApiError.notFound('Partenaire introuvable.') });
      }
      return mockResponse(record);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.PARTNERS.DETAIL(id));
    return data;
  },

  /**
   * Création d'un partenaire (code automatique, horodatages).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      partnerCodeCounter += 1;
      const record = buildPartnerRecord(payload);
      getPartnersCache().unshift(record);
      return mockResponse(record);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.PARTNERS.LIST, payload);
    return data;
  },

  /**
   * Mise à jour d'un partenaire.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const index = getPartnersCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Partenaire introuvable.') });
      }

      const now = new Date().toISOString();
      const updated = { ...getPartnersCache()[index], ...payload, id, updatedAt: now };
      getPartnersCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.PARTNERS.DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'un partenaire.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async delete(id) {
    if (apiConfig.mock) {
      const exists = getPartnersCache().some((item) => item.id === id);
      if (!exists) {
        return mockResponse(null, { error: ApiError.notFound('Partenaire introuvable.') });
      }
      partnersCache = getPartnersCache().filter((item) => item.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.PARTNERS.DETAIL(id));
    return data;
  },
};
