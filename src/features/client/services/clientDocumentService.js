/**
 * Navix Client — Service Documents (Espace Client / Entreprise)
 * --------------------------------------------------------------------------
 * PROMPT 058 — Documents strictement isolés multi-tenant (companyId
 * Transports Express Cameroun). Les associations pointent vers la flotte
 * client (véhicules, chauffeurs, entretiens, pleins, trajets, entreprise).
 *
 * Règles :
 *   - upload simulé : taille validée (< MAX_DEFAULT_UPLOAD_SIZE), extension
 *     reconnue via MOCK_FILE_TYPES, 409 en cas de doublon de nom ;
 *   - suppression impossible tant que le document est référencé dans une
 *     alerte (403) ;
 *   - `expiryDate` alimente les états « expiré » / « bientôt expiré » (≤30 j).
 *
 * Aucune requête HTTP réelle ni aucune donnée financière.
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { CLIENT_TYPES } from '../constants/client.constants';
import { MOCK_CLIENT_DOCUMENTS } from '../mocks/clientDocuments.mock';
import { MOCK_FILE_TYPES } from '@/features/documents/mocks';
import { MAX_DEFAULT_UPLOAD_SIZE } from '@/features/documents/constants';
import { getNotificationCache } from './clientNotificationService';

const TEC_COMPANY_ID = '01J8A2B3C4D5E6F7G8H9J0K1L2';

const isEnterprise = (clientType) => clientType === CLIENT_TYPES.ENTERPRISE;

const inScope = (document) => document.companyId === TEC_COMPANY_ID;

const EXPIRY_WARNING_DAYS = 30;

let documentCache = null;
let documentSequence = 100;

const getDocumentCache = () => {
  if (!documentCache) {
    documentCache = MOCK_CLIENT_DOCUMENTS.map((document) => ({ ...document }));
  }
  return documentCache;
};

export const getDocumentRecordsCache = () => getDocumentCache().map((document) => ({ ...document }));

const getFileTypeById = (fileTypeId) =>
  MOCK_FILE_TYPES.find((fileType) => fileType.id === fileTypeId) || null;

const findFileTypeByExtension = (extension = '') =>
  MOCK_FILE_TYPES.find((fileType) =>
    (fileType.extensions || []).some((item) => item.toLowerCase() === String(extension).toLowerCase()),
  ) || null;

const daysUntil = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86400000);
};

const buildRecord = (payload, fileType) => {
  const now = new Date().toISOString();
  const size = Number(payload.size) || 0;
  const extension = String(payload.extension || '').startsWith('.')
    ? payload.extension
    : `.${payload.extension || ''}`;

  return {
    ...payload,
    id: `CLTDO-${String(documentSequence++).padStart(4, '0')}`,
    companyId: TEC_COMPANY_ID,
    fileTypeId: fileType?.id || payload.fileTypeId,
    name: payload.name || `Document_${documentSequence}`,
    originalName: payload.originalName || payload.name || '',
    path: `/documents/tec/${payload.directory || payload.associationType || 'documents'}/`,
    directory: payload.directory || payload.associationType || 'documents',
    extension,
    mimeType: fileType?.mimeTypes?.[0] || payload.mimeType || 'application/octet-stream',
    size,
    width: null,
    height: null,
    thumbnail: '',
    url: '',
    description: payload.description || '',
    isPublic: payload.visibility === 'public',
    visibility: payload.visibility || 'private',
    uploadedBy: 'Direction Flotte TEC',
    createdAt: now,
    updatedAt: now,
    version: 1,
    category: payload.category || '',
    expiryDate: payload.expiryDate || '',
  };
};

const buildDuplicateError = () =>
  new ApiError({
    status: 409,
    code: 'DOCUMENT_NAME_CONFLICT',
    message: 'Un document portant ce nom existe déjà pour ce dossier.',
  });

export const clientDocumentService = {
  /**
   * Liste des documents du Client (isolés multi-tenant).
   * @param {string} [clientType]
   * @returns {Promise<Array<object>>}
   */
  async getAll(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse([], { latency: 300 });
    }
    return mockResponse(
      getDocumentCache()
        .filter(inScope)
        .map((document) => ({ ...document })),
      { latency: 400 },
    );
  },

  /**
   * Détail d'un document (404 hors portée / introuvable).
   * @param {string} id
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async getById(id, clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
    }
    const record = getDocumentCache().find((item) => item.id === id && inScope(item));
    if (!record) {
      return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
    }
    return mockResponse({ ...record }, { latency: 350 });
  },

  /**
   * Création de métadonnées d'un document (sans fichier).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    const fileType = getFileTypeById(payload.fileTypeId) || findFileTypeByExtension(payload.extension);
    const record = buildRecord(payload, fileType);
    getDocumentCache().unshift(record);
    return mockResponse({ ...record }, { latency: 400 });
  },

  /**
   * Téléversement simulé d'un fichier : taille contrôlée, extension
   * reconnue, nom unique dans le dossier (409 en cas de doublon).
   * @param {object} payload — { file, name, associationType, associationId, directory, category }
   * @returns {Promise<object>}
   */
  async upload(payload = {}) {
    const file = payload.file || {};
    const size = Number(file.size) || 0;
    const extension = String(file.name || payload.name || '').split('.').pop() || '';

    if (size > MAX_DEFAULT_UPLOAD_SIZE) {
      return mockResponse(null, {
        error: new ApiError({
          status: 422,
          code: 'DOCUMENT_SIZE_EXCEEDED',
          message: 'Le fichier dépasse la taille maximale autorisée (50 Mo).',
        }),
      });
    }

    const fileType = findFileTypeByExtension(extension);
    if (!fileType) {
      return mockResponse(null, {
        error: new ApiError({
          status: 422,
          code: 'DOCUMENT_TYPE_UNSUPPORTED',
          message: `Le type de fichier « ${extension || 'inconnu'} » n'est pas pris en charge.`,
        }),
      });
    }

    const name = payload.name || file.name || `Fichier_${Date.now()}.${extension}`;
    const directory = payload.directory || payload.associationType || 'documents';
    const isDuplicate = getDocumentCache().some(
      (item) => item.directory === directory && item.name.toLowerCase() === name.toLowerCase(),
    );
    if (isDuplicate) {
      return mockResponse(null, { error: buildDuplicateError() });
    }

    const record = buildRecord(
      {
        ...payload,
        name,
        originalName: file.name || name,
        size,
        extension: `.${extension}`,
        fileTypeId: fileType.id,
        mimeType: fileType.mimeTypes?.[0] || 'application/octet-stream',
        directory,
      },
      fileType,
    );

    getDocumentCache().unshift(record);
    return mockResponse({ ...record }, { latency: 600 });
  },

  /**
   * Mise à jour des métadonnées (description, visibilité, catégorie,
   * association, date d'expiration).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    const cache = getDocumentCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
    }
    const updated = {
      ...cache[index],
      ...payload,
      id,
      isPublic: payload.visibility ? payload.visibility === 'public' : cache[index].isPublic,
      updatedAt: new Date().toISOString(),
    };
    cache[index] = updated;
    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Téléchargement simulé (aucun octet réel — enrichit downloadedAt).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async download(id) {
    const cache = getDocumentCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
    }
    const now = new Date().toISOString();
    cache[index] = { ...cache[index], downloadedAt: now };
    return mockResponse({ ...cache[index] }, { latency: 500 });
  },

  /**
   * Suppression d'un document. 403 si référencé par une notification
   * (alerte active), 404 si introuvable.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    const cache = getDocumentCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
    }

    const referenced = getNotificationCache().some(
      (notification) => notification.resourceType === 'document' && notification.resourceId === id,
    );
    if (referenced) {
      return mockResponse(null, {
        error: new ApiError({
          status: 403,
          code: 'DOCUMENT_REFERENCED',
          message: 'Ce document est référencé par une alerte active et ne peut pas être supprimé.',
        }),
      });
    }

    cache.splice(index, 1);
    return mockResponse({ id }, { latency: 350 });
  },

  /**
   * Synthèse des documents (total, stockage, expirations).
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async statistics(clientType = CLIENT_TYPES.ENTERPRISE) {
    const records = isEnterprise(clientType)
      ? getDocumentCache().filter(inScope)
      : [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`;

    const expired = records.filter((item) => item.expiryDate && item.expiryDate < todayValue);
    const expiring = records.filter((item) => {
      if (!item.expiryDate) return false;
      const days = daysUntil(item.expiryDate);
      return days !== null && days >= 0 && days <= EXPIRY_WARNING_DAYS;
    });

    const categoryDistribution = records.reduce((groups, item) => {
      groups[item.category] = (groups[item.category] || 0) + 1;
      return groups;
    }, {});

    const typeDistribution = records.reduce((groups, item) => {
      groups[item.extension] = (groups[item.extension] || 0) + 1;
      return groups;
    }, {});

    return mockResponse(
      {
        totalCount: records.length,
        totalSize: records.reduce((total, item) => total + Number(item.size || 0), 0),
        expiredCount: expired.length,
        expiringCount: expiring.length,
        validCount: records.filter((item) => item.expiryDate && item.expiryDate >= todayValue).length,
        noExpiryCount: records.filter((item) => !item.expiryDate).length,
        categoryDistribution,
        typeDistribution,
      },
      { latency: 350 },
    );
  },
};
