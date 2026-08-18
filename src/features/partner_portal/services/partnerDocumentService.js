/**
 * Navix Partner Portal — Service Documents Partenaire (PROMPT 066)
 * --------------------------------------------------------------------------
 * Centre documentaire de l'entreprise partenaire, strictement isolé
 * multi-tenant : le Partenaire ne voit que les documents liés à
 * `companyId` = `PARTNER_COMPANY_ID` (cmp_partner_navix) et à son
 * `partnerId` (ptr_partner_tec). Aucun `companyId` / `partnerId` ne
 * transite depuis l'UI : le service les applique toujours côté serveur simulé.
 *
 * Réutilise l'infrastructure documentaire globale (`@/features/documents`) :
 *   - `DOCUMENT_TYPES` / `getDocumentTypeByExtension` : extensions, MIME et
 *     taille maximale des fichiers (pdf, png, jpg, jpeg, webp, doc, docx,
 *     xls, xlsx, csv, txt, zip) — aucune dépendance ajoutée ;
 *   - `getFileExtension` : dérivation d'extension côté schéma.
 *
 * Statuts : les documents du mock portent un statut figé (démo) ; les
 * documents créés / modifiés / renouvelés se voient recalculer leur statut
 * par les règles d'expiration (`getPartnerDocumentExpiryStatus`) :
 *   échéance passée → Expiré · ≤ 30 jours → Expire bientôt · sinon → Valide.
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { getDocumentTypeByExtension } from '@/features/documents/constants';
import { getFileExtension } from '@/features/documents/schemas/document.schema';
import { MOCK_PARTNER_DOCUMENTS } from '../mocks/partner.mock';
import {
  PARTNER_COMPANY_ID,
  PARTNER_PARTNER_ID,
  getPartnerDocumentExpiryStatus,
  PARTNER_DOCUMENT_DEMO_STORAGE_BYTES,
} from '../constants/partner.constants';

const DOC_REFERENCE_PREFIX = 'DOC-REF';

let documentCache = null;

const getDocumentCache = () => {
  if (!documentCache) {
    documentCache = MOCK_PARTNER_DOCUMENTS.map((document) => ({ ...document }));
  }
  return documentCache;
};

/** Getter public du cache documents (lecture pour agrégations, copie défensive). */
export const getPartnerDocumentsCache = () => getDocumentCache().map((document) => ({ ...document }));

const isInScope = (document) =>
  document.companyId === PARTNER_COMPANY_ID && document.partnerId === PARTNER_PARTNER_ID;

const toPublicDocument = (document) => ({ ...document });

/** Statut d'un document : statut figé (démo) sinon calculé par l'échéance. */
const resolveStatus = (document) => {
  if (document.status === 'pending') return 'pending';
  if (document.status) return document.status;
  return getPartnerDocumentExpiryStatus(document.expiresAt) ?? 'valid';
};

const toDateValue = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

export const partnerDocumentService = {
  /**
   * Liste des documents partenaire (isolée multi-tenant), triée par date
   * d'ajout décroissante.
   * @returns {Promise<Array<object>>}
   */
  async getDocuments() {
    const documents = getDocumentCache()
      .filter(isInScope)
      .map(toPublicDocument)
      .sort((a, b) => String(b.addedAt ?? '').localeCompare(String(a.addedAt ?? '')));
    return mockResponse(documents, { latency: 320 });
  },

  /**
   * Détail d'un document (404 hors portée / introuvable).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getDocumentById(id) {
    const document = getDocumentCache().find((item) => item.id === id && isInScope(item));
    if (!document) {
      return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
    }
    return mockResponse(toPublicDocument(document), { latency: 260 });
  },

  /**
   * Recherche instantanée (nom, référence, entité liée — client / véhicule /
   * mission —, type, catégorie). Retourne les documents de portée seulement.
   * @param {string} query
   * @returns {Promise<Array<object>>}
   */
  async searchDocuments(query = '') {
    const search = String(query).trim().toLowerCase();
    const documents = getDocumentCache().filter(isInScope);
    const result = !search
      ? documents
      : documents.filter((document) => {
          const haystack = [
            document.name,
            document.reference,
            document.entityLabel,
            document.category,
            document.fileType,
            document.entityType,
            resolveStatus(document),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(search);
        });
    return mockResponse(result.map(toPublicDocument), { latency: 200 });
  },

  /**
   * Filtres combinables (type, statut, entité, date d'ajout — période ou
   * plage personnalisée). Les comptages utilisent les statuts résolus.
   * @param {object} filters — { category, status, entity, date, dateFrom, dateTo }
   * @returns {Promise<Array<object>>}
   */
  async filterDocuments(filters = {}) {
    const { category = '', status = '', entity = '', date = '', dateFrom = '', dateTo = '' } = filters;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(startOfToday);
    startOfMonth.setDate(startOfMonth.getDate() - 29);
    startOfMonth.setHours(0, 0, 0, 0);

    let minDate = null;
    let maxDate = null;
    if (date === 'today') {
      minDate = startOfToday.getTime();
    } else if (date === 'week') {
      minDate = startOfWeek.getTime();
    } else if (date === 'month') {
      minDate = startOfMonth.getTime();
    } else if (date === 'custom') {
      if (dateFrom) minDate = toDateValue(dateFrom);
      if (dateTo) maxDate = toDateValue(dateTo);
    }

    const documents = getDocumentCache().filter(isInScope).filter((document) => {
      if (category && document.category !== category) return false;
      if (status && resolveStatus(document) !== status) return false;
      if (entity && document.entityType !== entity) return false;
      if (minDate !== null || maxDate !== null) {
        const addedAt = toDateValue(document.addedAt);
        if (addedAt === null) return false;
        if (minDate !== null && addedAt < minDate) return false;
        if (maxDate !== null && addedAt > maxDate) return false;
      }
      return true;
    });

    return mockResponse(documents.map(toPublicDocument), { latency: 220 });
  },

  /**
   * Statistiques documentaires (KPI PROMPT 066 §5).
   * Les compteurs sont issus du portefeuille réel ; l'espace utilisé est une
   * valeur de démonstration (1,8 Go — pas de backend de stockage).
   * @returns {Promise<{ total: number, valid: number, expiring: number, expired: number, pending: number, storageBytes: number }>}
   */
  async getDocumentStats() {
    const documents = getDocumentCache().filter(isInScope);
    const stats = documents.reduce(
      (acc, document) => {
        acc[resolveStatus(document)] = (acc[resolveStatus(document)] ?? 0) + 1;
        return acc;
      },
      { total: documents.length, valid: 0, expiring: 0, expired: 0, pending: 0 },
    );
    return mockResponse(
      {
        ...stats,
        storageBytes: PARTNER_DOCUMENT_DEMO_STORAGE_BYTES,
      },
      { latency: 240 },
    );
  },

  /**
   * Création d'un document (fichier requis, extension et taille validées).
   * Le `companyId` / `partnerId` du partenaire sont toujours appliqués côté
   * service — jamais depuis l'UI. Statut recalculé par l'échéance.
   * @param {object} payload — cf. toPartnerDocumentPayload
   * @returns {Promise<object>}
   */
  async createDocument(payload) {
    const file = payload?.file;
    if (!file?.name) {
      return mockResponse(null, { error: ApiError.badRequest('Le fichier est obligatoire.') });
    }

    const extension = String(getFileExtension(file.name)).toLowerCase();
    const fileMeta = getDocumentTypeByExtension(extension);
    if (!fileMeta) {
      return mockResponse(null, {
        error: ApiError.badRequest('Format de fichier non pris en charge (PDF, image, DOC/DOCX, XLS/XLSX, CSV, TXT ou ZIP).'),
      });
    }
    if (file.size > fileMeta.maxSize) {
      return mockResponse(null, {
        error: ApiError.badRequest(`Fichier trop volumineux pour un ${fileMeta.label}.`),
      });
    }

    const now = new Date().toISOString();
    const status = getPartnerDocumentExpiryStatus(payload.expiresAt) ?? 'valid';
    const document = {
      ...payload,
      name: String(file.name || '').trim(),
      reference: payload.reference || `${DOC_REFERENCE_PREFIX}-${String(Date.now()).slice(-6)}`,
      fileType: extension,
      extension,
      mimeType: fileMeta.mimeTypes?.[0] ?? (file.type || 'application/octet-stream'),
      size: Number(file.size) || 0,
      companyId: PARTNER_COMPANY_ID,
      partnerId: PARTNER_PARTNER_ID,
      entityType: payload.entityType ?? 'company',
      entityId: payload.entityId ?? PARTNER_COMPANY_ID,
      entityLabel: payload.entityLabel ?? 'Cameroon Logistics Partners',
      status,
      addedAt: now,
      updatedAt: now,
      id: `DOC-P-${String(Date.now()).slice(-5)}`,
    };
    getDocumentCache().unshift(document);
    return mockResponse(toPublicDocument(document), { latency: 420 });
  },

  /**
   * Mise à jour de la fiche d'un document (404 introuvable). Le fichier n'est
   * pas modifié ; le statut est recalculé si l'échéance change.
   * @param {string} id
   * @param {object} payload — cf. toPartnerDocumentUpdatePayload
   * @returns {Promise<object>}
   */
  async updateDocument(id, payload) {
    const index = getDocumentCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
    }

    const current = getDocumentCache()[index];
    const expiresAt = payload.expiresAt !== undefined ? payload.expiresAt : current.expiresAt;
    const status =
      payload.status === 'pending' ? 'pending' : (getPartnerDocumentExpiryStatus(expiresAt) ?? current.status ?? 'valid');

    const updated = {
      ...current,
      ...payload,
      id,
      companyId: PARTNER_COMPANY_ID,
      partnerId: PARTNER_PARTNER_ID,
      expiresAt: expiresAt ?? null,
      status,
      updatedAt: new Date().toISOString(),
    };
    getDocumentCache()[index] = updated;
    return mockResponse(toPublicDocument(updated), { latency: 380 });
  },

  /**
   * Renouvellement d'un document : prolonge l'échéance (par défaut +1 an) et
   * recalcule le statut. 404 si introuvable.
   * @param {string} id
   * @param {string} [newExpiresAt] — nouvelle échéance ISO (défaut : +1 an)
   * @returns {Promise<object>}
   */
  async renewDocument(id, newExpiresAt) {
    const index = getDocumentCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
    }

    const current = getDocumentCache()[index];
    const base = newExpiresAt ? new Date(newExpiresAt) : new Date();
    if (Number.isNaN(base.getTime())) {
      return mockResponse(null, { error: ApiError.badRequest("Date de renouvellement invalide.") });
    }
    if (!newExpiresAt) base.setFullYear(base.getFullYear() + 1);

    const expiresAt = base.toISOString();
    const updated = {
      ...current,
      expiresAt,
      status: getPartnerDocumentExpiryStatus(expiresAt) ?? 'valid',
      updatedAt: new Date().toISOString(),
    };
    getDocumentCache()[index] = updated;
    return mockResponse(toPublicDocument(updated), { latency: 380 });
  },

  /**
   * Suppression d'un document (retrait du cache). 404 si introuvable.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async deleteDocument(id) {
    const exists = getDocumentCache().some((item) => item.id === id && isInScope(item));
    if (!exists) {
      return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
    }
    documentCache = getDocumentCache().filter((item) => item.id !== id);
    return mockResponse({ id }, { latency: 340 });
  },

  /**
   * Téléchargement simulé (aucun backend de stockage).
   * @param {string} id
   * @returns {Promise<{ id: string, name: string, size: number, mimeType: string }>}
   */
  async downloadDocument(id) {
    const document = getDocumentCache().find((item) => item.id === id && isInScope(item));
    if (!document) {
      return mockResponse(null, { error: ApiError.notFound('Document introuvable.') });
    }
    return mockResponse(
      { id: document.id, name: document.name, size: document.size, mimeType: document.mimeType },
      { latency: 200 },
    );
  },
};
