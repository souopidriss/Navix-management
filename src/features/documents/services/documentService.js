/**
 * Navix Documents — DocumentService
 * --------------------------------------------------------------------------
 * Gestion complète des documents et des types de fichiers, mock uniquement.
 * Responsabilité : fournir les données documentaires aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()               → liste de tous les documents
 *   getById(id)            → détail d'un document (404 si absent)
 *   create(payload)        → création (métadonnées sans fichier)
 *   update(id, payload)    → mise à jour des métadonnées (404 si absent)
 *   delete(id)             → suppression (404 si absent)
 *   upload(files, payload) → téléversement simulé (progression + annulation)
 *   download(id)           → téléchargement simulé (aucun octet réel)
 *   preview(id)            → aperçu simulé (métadonnées du document)
 *   getFileTypes()         → liste des types de fichiers
 *   createFileType()       → création d'un type de fichier
 *   updateFileType()       → mise à jour d'un type de fichier
 *   deleteFileType()       → suppression (409 si utilisé par des documents)
 *   statistics()           → synthèse (total, taille, répartitions…)
 *
 * Règles métier simulées :
 *   - identifiant ULID et horodatages automatiques
 *   - un type de fichier utilisé par au moins un document ne peut pas être
 *     supprimé (409) ; le titre reste unique
 *   - le téléversement vérifie extension, type MIME et taille maximale du
 *     type choisi (422), simule une progression par fichier et peut être
 *     annulé (499)
 *   - la visibilité est purement visuelle (sécurité réelle ultérieure)
 *
 * Exemple d'utilisation :
 *   import { documentService } from '../services';
 *   const records = await documentService.getAll();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse, delay } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_DOCUMENTS, MOCK_FILE_TYPES } from '../mocks';
import { getFileExtension } from '../schemas';
import {
  DOCUMENT_TYPE_VALUES,
  DOCUMENT_TYPES,
  DOCUMENT_VISIBILITY_VALUES,
  formatDocumentSize,
} from '../constants';

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

const DIRECTORY_BY_ASSOCIATION = {
  company: 'entreprise',
  vehicle: 'vehicules',
  driver: 'chauffeurs',
  maintenance: 'entretiens',
  trip: 'trajets',
  fuel: 'carburant',
  user: 'utilisateurs',
};

/** Dossier de classement d'un document selon sa ressource associée. */
const buildDirectory = (associationType = '') =>
  DIRECTORY_BY_ASSOCIATION[associationType] || 'entreprise';

/** Chemin de stockage simulé d'un document. */
const buildPath = (companyId = '', associationType = '') =>
  `/documents/${companyId || 'compte'}/${buildDirectory(associationType)}/`;

/** Clé de mois (ex. « 2026-08 ») pour un horodatage. */
const monthKey = (value) => (value ? String(value).slice(0, 7) : '');

/** Année (ex. 2026) pour un horodatage. */
const yearOf = (value) => (value ? Number(String(value).slice(0, 4)) : null);

/** Clé de date locale (YYYY-MM-DD) pour le jour courant. */
const todayKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

let documentCache = null;
let fileTypeCache = null;

const getDocumentCache = () => {
  if (!documentCache) {
    documentCache = MOCK_DOCUMENTS.map((document) => ({ ...document }));
  }
  return documentCache;
};

const getFileTypeCache = () => {
  if (!fileTypeCache) {
    fileTypeCache = MOCK_FILE_TYPES.map((fileType) => ({ ...fileType }));
  }
  return fileTypeCache;
};

/** Retourne un type de fichier par identifiant (null si absent). */
const getFileTypeById = (id) => getFileTypeCache().find((fileType) => fileType.id === id) || null;

/** Clé DOCUMENT_TYPES d'un type de fichier (ex. « PDF » → « pdf »). */
const getDocumentTypeKey = (fileTypeId) => {
  const record = getFileTypeById(fileTypeId);
  return record ? String(record.title).toLowerCase() : '';
};

/**
 * Valide un fichier local contre un type de fichier (extension, type MIME,
 * taille maximale). Retourne un message d'erreur, ou null si conforme.
 */
const validateFile = (file, fileType) => {
  const name = String(file.name || '');
  const extension = getFileExtension(name);

  if (!extension) {
    return `Impossible de déterminer l’extension de « ${name} ».`;
  }
  if (!fileType.extensions.includes(extension)) {
    return `« ${name} » : extension ${extension} non autorisée pour le type ${fileType.title}.`;
  }
  if (file.type && fileType.mimeTypes.length > 0 && !fileType.mimeTypes.includes(String(file.type).toLowerCase())) {
    return `« ${name} » : type MIME « ${file.type} » non autorisé pour le type ${fileType.title}.`;
  }
  if (Number(file.size || 0) > Number(fileType.maxSize)) {
    return `« ${name} » : taille ${formatDocumentSize(file.size)} supérieure à la limite ${formatDocumentSize(fileType.maxSize)}.`;
  }
  return null;
};

/**
 * Construit un enregistrement de document à partir d'un fichier local et du
 * payload métier (type de fichier, visibilité, association, description).
 */
const buildFileRecord = (file, payload, fileType, timestamp = new Date().toISOString()) => ({
  id: generateUlid(),
  companyId: payload.companyId,
  fileTypeId: payload.fileTypeId,
  name: String(file.name || ''),
  originalName: String(file.name || ''),
  path: buildPath(payload.companyId, payload.associationType),
  directory: buildDirectory(payload.associationType),
  extension: getFileExtension(file.name),
  mimeType: file.type || fileType?.mimeTypes?.[0] || 'application/octet-stream',
  size: Number(file.size || 0),
  width: null,
  height: null,
  thumbnail: '',
  url: '',
  description: payload.description || '',
  isPublic: payload.visibility === 'public',
  visibility: payload.visibility || 'private',
  uploadedBy: 'Utilisateur connecté',
  createdAt: timestamp,
  updatedAt: timestamp,
  associationType: payload.associationType || '',
  associationId: payload.associationId || '',
  version: 1,
  category: payload.category || 'autre',
});

export const documentService = {
  /**
   * Liste de tous les documents (copie — les mutations ultérieures du cache
   * n'affectent pas les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    if (apiConfig.mock) {
      return mockResponse([...getDocumentCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.LIST);
    return data;
  },

  /**
   * Détail d'un document.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const record = getDocumentCache().find((document) => document.id === id);
      if (!record) {
        return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
      }
      return mockResponse(record);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
    return data;
  },

  /**
   * Création d'un document (métadonnées seules, sans fichier). Utilisé par
   * la création « manuelle » ; le téléversement de fichiers passe par upload.
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      const now = new Date().toISOString();
      const record = {
        ...payload,
        id: generateUlid(),
        path: buildPath(payload.companyId, payload.associationType),
        directory: buildDirectory(payload.associationType),
        isPublic: payload.visibility === 'public',
        uploadedBy: 'Utilisateur connecté',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      getDocumentCache().unshift(record);
      return mockResponse(record);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.DOCUMENTS.LIST, payload);
    return data;
  },

  /**
   * Mise à jour des métadonnées d'un document (description, visibilité,
   * association, catégorie, nom). Le fichier physique n'est pas modifié.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const index = getDocumentCache().findIndex((document) => document.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
      }

      const current = getDocumentCache()[index];
      const now = new Date().toISOString();
      const updated = {
        ...current,
        ...payload,
        id,
        path: buildPath(payload.companyId, payload.associationType),
        directory: buildDirectory(payload.associationType),
        isPublic: payload.visibility === 'public',
        updatedAt: now,
      };

      getDocumentCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.DOCUMENTS.DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'un document.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async delete(id) {
    if (apiConfig.mock) {
      const exists = getDocumentCache().some((document) => document.id === id);
      if (!exists) {
        return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
      }
      documentCache = getDocumentCache().filter((document) => document.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
    return data;
  },

  /**
   * Téléversement simulé de fichiers : progression par fichier (0 → 100 %),
   * annulation possible via `token.cancelled`, validation extension / MIME /
   * taille. En mode mock, les enregistrements sont créés en mémoire.
   *
   * @param {Array<File>} files — fichiers locaux à téléverser
   * @param {object} payload — métadonnées communes (companyId, fileTypeId,
   *                           visibility, associationType, associationId, …)
   * @param {{ onProgress?: (index: number, percent: number) => void,
   *           token?: { cancelled?: boolean } }} [options]
   * @returns {Promise<Array<object>>}
   */
  async upload(files = [], payload = {}, { onProgress, token } = {}) {
    if (apiConfig.mock) {
      const fileType = getFileTypeById(payload.fileTypeId);
      if (!fileType) {
        return mockResponse(null, { error: ApiError.badRequest('Type de fichier inconnu.') });
      }
      if (files.length === 0) {
        return mockResponse(null, { error: ApiError.badRequest('Aucun fichier à téléverser.') });
      }

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const problem = validateFile(file, fileType);
        if (problem) {
          return mockResponse(null, {
            error: ApiError.badRequest(problem, { file: file.name }),
          });
        }

        for (let percent = 0; percent <= 100; percent += 20) {
          if (token?.cancelled) {
            return mockResponse(null, {
              error: new ApiError({
                status: 499,
                code: 'UPLOAD_CANCELLED',
                message: 'Téléversement annulé.',
              }),
            });
          }
          await delay(90);
          onProgress?.(index, Math.min(percent, 100));
        }
      }

      const now = new Date().toISOString();
      const created = files.map((file) => buildFileRecord(file, payload, fileType, now));
      getDocumentCache().unshift(...created);
      return mockResponse(created, { latency: 200 });
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('payload', JSON.stringify(payload));
    const { data } = await apiClient.post(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress?.(0, Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return data;
  },

  /**
   * Téléchargement simulé : aucun octet réellement transféré, le service
   * restitue les métadonnées du document (le rappel UI affiche une
   * notification « téléchargement simulé »).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async download(id) {
    if (apiConfig.mock) {
      const record = getDocumentCache().find((document) => document.id === id);
      if (!record) {
        return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
      }
      return mockResponse({ ...record, downloadedAt: new Date().toISOString() });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id));
    return data;
  },

  /**
   * Aperçu simulé : restitue les métadonnées du document (le rendu visuel
   * est délégué à DocumentPreview selon le type MIME / la catégorie).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async preview(id) {
    if (apiConfig.mock) {
      const record = getDocumentCache().find((document) => document.id === id);
      if (!record) {
        return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
      }
      return mockResponse(record);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.PREVIEW(id));
    return data;
  },

  /**
   * Liste des types de fichiers (copie — non mutables par les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getFileTypes() {
    if (apiConfig.mock) {
      return mockResponse([...getFileTypeCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.FILE_TYPES);
    return data;
  },

  /**
   * Création d'un type de fichier (titre unique, identifiant ULID).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async createFileType(payload) {
    if (apiConfig.mock) {
      const title = String(payload.title || '').trim();
      const exists = getFileTypeCache().some(
        (fileType) => String(fileType.title).toLowerCase() === title.toLowerCase(),
      );
      if (exists) {
        return mockResponse(null, {
          error: ApiError.badRequest(`Un type de fichier « ${title} » existe déjà.`),
        });
      }

      const now = new Date().toISOString();
      const record = {
        ...payload,
        title,
        id: generateUlid(),
        extensions: Array.isArray(payload.extensions) ? payload.extensions : [],
        mimeTypes: Array.isArray(payload.mimeTypes) ? payload.mimeTypes : [],
        maxSize: Number(payload.maxSize) || 0,
        isActive: payload.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      getFileTypeCache().push(record);
      return mockResponse(record);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.DOCUMENTS.FILE_TYPES, payload);
    return data;
  },

  /**
   * Mise à jour d'un type de fichier (404 si absent, 409 si titre dupliqué).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async updateFileType(id, payload) {
    if (apiConfig.mock) {
      const index = getFileTypeCache().findIndex((fileType) => fileType.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Type de fichier introuvable.') });
      }

      const title = String(payload.title || '').trim();
      const duplicate = getFileTypeCache().some(
        (fileType) => fileType.id !== id && String(fileType.title).toLowerCase() === title.toLowerCase(),
      );
      if (duplicate) {
        return mockResponse(null, {
          error: ApiError.badRequest(`Un type de fichier « ${title} » existe déjà.`),
        });
      }

      const current = getFileTypeCache()[index];
      const updated = {
        ...current,
        ...payload,
        title,
        extensions: Array.isArray(payload.extensions) ? payload.extensions : current.extensions,
        mimeTypes: Array.isArray(payload.mimeTypes) ? payload.mimeTypes : current.mimeTypes,
        maxSize: Number(payload.maxSize) || current.maxSize,
        updatedAt: new Date().toISOString(),
      };

      getFileTypeCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.DOCUMENTS.FILE_TYPE_DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'un type de fichier. Un type utilisé par au moins un
   * document est verrouillé (409).
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async deleteFileType(id) {
    if (apiConfig.mock) {
      const record = getFileTypeById(id);
      if (!record) {
        return mockResponse(null, { error: ApiError.notFound('Type de fichier introuvable.') });
      }

      const used = getDocumentCache().some((document) => document.fileTypeId === id);
      if (used) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'FILE_TYPE_IN_USE',
            message: 'Ce type de fichier est utilisé par des documents et ne peut pas être supprimé.',
          }),
        });
      }

      fileTypeCache = getFileTypeCache().filter((fileType) => fileType.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.DOCUMENTS.FILE_TYPE_DETAIL(id));
    return data;
  },

  /**
   * Synthèse statistique des documents (dérivée des données mockées) :
   * total de fichiers, taille stockée, ajouts du mois / de l'année,
   * répartitions par type de fichier, par visibilité, par catégorie et
   * taille stockée par type, ainsi que les compteurs par ressource.
   * @returns {Promise<object>}
   */
  async statistics() {
    if (apiConfig.mock) {
      const records = getDocumentCache();
      const now = new Date();
      const currentMonth = monthKey(now.toISOString());
      const currentYear = now.getFullYear();

      const sum = (items, field) => items.reduce((total, item) => total + Number(item[field] || 0), 0);

      const typeCounts = records.reduce((groups, document) => {
        const key = getDocumentTypeKey(document.fileTypeId) || 'other';
        groups[key] = (groups[key] || 0) + 1;
        return groups;
      }, {});

      const typeDistribution = DOCUMENT_TYPE_VALUES.map((type) => ({
        type,
        count: typeCounts[type] || 0,
        meta: DOCUMENT_TYPES[type],
      }))
        .filter((group) => group.count > 0)
        .sort((a, b) => b.count - a.count);

      const visibilityDistribution = DOCUMENT_VISIBILITY_VALUES.map((visibility) => ({
        visibility,
        count: records.filter((document) => document.visibility === visibility).length,
      }));

      const sizeByType = DOCUMENT_TYPE_VALUES.map((type) => {
        const items = records.filter((document) => (getDocumentTypeKey(document.fileTypeId) || 'other') === type);
        return { type, count: items.length, totalSize: sum(items, 'size') };
      })
        .filter((group) => group.count > 0)
        .sort((a, b) => b.totalSize - a.totalSize);

      const categoryDistribution = records.reduce((groups, document) => {
        const key = document.category || 'autre';
        groups[key] = (groups[key] || 0) + 1;
        return groups;
      }, {});

      return mockResponse({
        totalCount: records.length,
        totalSize: sum(records, 'size'),
        monthCount: records.filter((document) => monthKey(document.createdAt) === currentMonth).length,
        yearCount: records.filter((document) => yearOf(document.createdAt) === currentYear).length,
        vehicleCount: records.filter((document) => document.associationType === 'vehicle').length,
        maintenanceCount: records.filter((document) => document.associationType === 'maintenance').length,
        driverCount: records.filter((document) => document.associationType === 'driver').length,
        tripCount: records.filter((document) => document.associationType === 'trip').length,
        fuelCount: records.filter((document) => document.associationType === 'fuel').length,
        publicCount: records.filter((document) => document.visibility === 'public').length,
        privateCount: records.filter((document) => document.visibility === 'private').length,
        restrictedCount: records.filter((document) => document.visibility === 'restricted').length,
        typeDistribution,
        visibilityDistribution,
        sizeByType,
        categoryDistribution,
        generatedAt: new Date().toISOString(),
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.STATS);
    return data;
  },
};

/** Résolution de chemin de répertoire (exposée pour les vues de détail). */
export const getDocumentDirectory = (associationType) => buildDirectory(associationType);

/** Date locale du jour (YYYY-MM-DD) — utile aux vues de contrôle. */
export const getTodayKey = () => todayKey();
