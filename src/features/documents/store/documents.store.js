/**
 * Navix Documents — Store du module Documents (Zustand)
 * --------------------------------------------------------------------------
 * État : documents (liste brute), selectedDocument, fileTypes, statistics
 *        (synthèse), uploadProgress (téléversement), search, filters
 *        (companyId, fileTypeId, associationType, visibility, size, period,
 *        extension), sort, pagination (page, pageSize), viewMode
 *        (list | grid), isLoading, isUploading, isSaving, error.
 *
 * Actions : fetchDocuments, fetchDocument, fetchStatistics, fetchFileTypes,
 *           createDocument, updateDocument, deleteDocument, downloadDocument,
 *           uploadDocuments, createFileType, updateFileType, deleteFileType,
 *           setSearch, setFilter, resetFilters, setSort, setPage, setPageSize,
 *           setViewMode, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de
 * session). La liste affichée (filtre + tri + pagination) est dérivée par le
 * hook `useDocumentListData` — le store ne stocke que l'état source et les
 * critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { useAuthStore } from '@/features/auth';
import { documentService, emitFileAuditLog } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

/** Entreprise du contexte courant (simulation tenant). */
export const getFileCompanyScopeId = () => {
  const { user, company } = useAuthStore.getState();
  if (!user) return '';
  if (user.role === 'super_admin') return '';
  return company?.id ?? '';
};

const initialState = {
  documents: [],
  selectedDocument: null,
  fileTypes: [],
  statistics: null,
  uploadProgress: { index: -1, percent: 0 },
  search: '',
  filters: {
    companyId: '',
    fileTypeId: '',
    associationType: '',
    visibility: '',
    size: '',
    period: '',
    extension: '',
  },
  sort: {
    by: 'createdAt',
    direction: 'desc',
  },
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  viewMode: 'list',
  isLoading: false,
  isUploading: false,
  isSaving: false,
  error: null,
};

const useDocumentsStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des documents.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchDocuments: async () => {
    set({ isLoading: true, error: null });

    try {
      const documents = await documentService.getAll({ companyScopeId: getFileCompanyScopeId() });
      set({ documents, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les documents.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'un document.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchDocument: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const selectedDocument = await documentService.getById(id);
      set({ selectedDocument, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger le document.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge la synthèse statistique des documents.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchStatistics: async () => {
    set({ isLoading: true, error: null });

    try {
      const statistics = await documentService.statistics(getFileCompanyScopeId());
      set({ statistics, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les statistiques des documents.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge la liste des types de fichiers.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchFileTypes: async () => {
    set({ isLoading: true, error: null });

    try {
      const fileTypes = await documentService.getFileTypes();
      set({ fileTypes, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les types de fichiers.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un document (métadonnées, sans fichier — simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createDocument: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const document = await documentService.create(payload);
      set((state) => ({
        documents: [document, ...state.documents],
        isSaving: false,
      }));
      emitFileAuditLog({ action: 'CREATE', ids: document.id, titles: document.name });
      return { success: true, data: document };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer le document.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour les métadonnées d'un document (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateDocument: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const document = await documentService.update(id, payload);
      set((state) => ({
        documents: state.documents.map((item) => (item.id === id ? document : item)),
        selectedDocument: state.selectedDocument?.id === id ? document : state.selectedDocument,
        isSaving: false,
      }));
      emitFileAuditLog({ action: 'UPDATE', ids: id, titles: document.name });
      return { success: true, data: document };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour le document.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un document (simulé).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteDocument: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const current = useDocumentsStore.getState();
      const target = current.documents.find((item) => item.id === id);
      await documentService.delete(id);
      set((state) => ({
        documents: state.documents.filter((item) => item.id !== id),
        selectedDocument: state.selectedDocument?.id === id ? null : state.selectedDocument,
        isSaving: false,
      }));
      emitFileAuditLog({ action: 'DELETE', ids: id, titles: target?.name });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer le document.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Téléchargement simulé d'un document (aucun octet transféré).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  downloadDocument: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const document = await documentService.download(id);
      set({ isSaving: false });
      emitFileAuditLog({ action: 'DOWNLOAD', ids: id, titles: document.name });
      return { success: true, data: document };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de télécharger le document.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Téléverse des fichiers (progression simulée) puis crée les documents.
   * La progression est exposée via `onProgress(index, percent)` ; un appel
   * peut être annulé en réglant `token.cancelled = true`.
   * @param {Array<File>} files
   * @param {object} payload
   * @param {{ onProgress?: (index: number, percent: number) => void,
   *           token?: { cancelled?: boolean } }} [options]
   * @returns {Promise<{ success: boolean, error?: string, data?: Array<object> }>}
   */
  uploadDocuments: async (files, payload, { onProgress, token } = {}) => {
    set({ isUploading: true, error: null, uploadProgress: { index: -1, percent: 0 } });

    const handleProgress = (index, percent) => {
      set({ uploadProgress: { index, percent } });
      onProgress?.(index, percent);
    };

    try {
      const created = await documentService.upload(files, payload, {
        onProgress: handleProgress,
        token,
      });
      set((state) => ({
        documents: [...created, ...state.documents],
        isUploading: false,
        uploadProgress: { index: -1, percent: 0 },
      }));
      emitFileAuditLog({
        action: 'UPLOAD',
        ids: created.map((doc) => doc.id),
        titles: created.map((doc) => doc.name),
      });
      return { success: true, data: created };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de téléverser les fichiers.');
      set({ isUploading: false, error: message, uploadProgress: { index: -1, percent: 0 } });
      return { success: false, error: message };
    }
  },

  /**
   * Crée un type de fichier (simulé).
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  createFileType: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const fileType = await documentService.createFileType(payload);
      set((state) => ({
        fileTypes: [...state.fileTypes, fileType],
        isSaving: false,
      }));
      emitFileAuditLog({ action: 'FILE_TYPE_CREATE', ids: fileType.id, titles: fileType.title });
      return { success: true, data: fileType };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de créer le type de fichier.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour un type de fichier (simulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ success: boolean, error?: string, data?: object }>}
   */
  updateFileType: async (id, payload) => {
    set({ isSaving: true, error: null });

    try {
      const fileType = await documentService.updateFileType(id, payload);
      set((state) => ({
        fileTypes: state.fileTypes.map((item) => (item.id === id ? fileType : item)),
        isSaving: false,
      }));
      emitFileAuditLog({ action: 'FILE_TYPE_UPDATE', ids: id, titles: fileType.title });
      return { success: true, data: fileType };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour le type de fichier.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime un type de fichier (simulé — 409 si utilisé par des documents).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteFileType: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const current = useDocumentsStore.getState();
      const target = current.fileTypes.find((item) => item.id === id);
      await documentService.deleteFileType(id);
      set((state) => ({
        fileTypes: state.fileTypes.filter((item) => item.id !== id),
        isSaving: false,
      }));
      emitFileAuditLog({ action: 'FILE_TYPE_DELETE', ids: id, titles: target?.title });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer le type de fichier.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Recherche instantanée (réinitialise la page courante). */
  setSearch: (search) =>
    set((state) => ({ search, pagination: { ...state.pagination, page: 1 } })),

  /** Applique un filtre (réinitialise la page courante). */
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, page: 1 },
    })),

  /** Réinitialise la recherche et les filtres. */
  resetFilters: () =>
    set((state) => ({
      search: '',
      filters: initialState.filters,
      pagination: { ...state.pagination, page: 1 },
    })),

  /** Applique le tri (réinitialise la page courante). */
  setSort: (by, direction) =>
    set((state) => ({ sort: { by, direction }, pagination: { ...state.pagination, page: 1 } })),

  /** Change de page. */
  setPage: (page) => set((state) => ({ pagination: { ...state.pagination, page } })),

  /** Change la taille de page. */
  setPageSize: (pageSize) => set({ pagination: { page: 1, pageSize } }),

  /** Bascule la vue liste / grille. */
  setViewMode: (viewMode) => set({ viewMode: viewMode === 'grid' ? 'grid' : 'list' }),

  /** Efface l'erreur courante. */
  clearError: () => set({ error: null }),

  /** Réinitialise entièrement le store. */
  reset: () => set({ ...initialState }),
}));

export default useDocumentsStore;
