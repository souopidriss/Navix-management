/**
 * Navix Partner Portal — Hook usePartnerDocuments (PROMPT 066)
 * --------------------------------------------------------------------------
 * Charge le centre documentaire partenaire (isolé multi-tenant) via
 * `partnerDocumentService` et expose l'état complet de la page : recherche
 * instantanée (nom, référence, client, véhicule, type, mission), filtres
 * (type, statut, entité, date d'ajout), tri (nom, date d'ajout, expiration,
 * taille, statut), pagination (10/25/50) et les opérations CRUD +
 * renouvellement + téléchargement simulé.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getPartnerDocumentCategory } from '../constants/partner.constants';
import { DEFAULT_PARTNER_DOCUMENT_PAGE_SIZE } from '../constants/partner.constants';
import { partnerDocumentService } from '../services/partnerDocumentService';

const STATUS_ORDER = { valid: 1, expiring: 2, expired: 3, pending: 4 };

const SORTABLE_KEYS = {
  name: (document) => String(document.name ?? '').toLowerCase(),
  category: (document) => getPartnerDocumentCategory(document.category).label.toLowerCase(),
  addedAt: (document) => new Date(document.addedAt ?? 0).getTime(),
  expiresAt: (document) =>
    document.expiresAt ? new Date(document.expiresAt).getTime() : Number.MAX_SAFE_INTEGER,
  size: (document) => Number(document.size) || 0,
  status: (document) => STATUS_ORDER[document.status] ?? 99,
};

export const usePartnerDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '', entity: '', date: '', dateFrom: '', dateTo: '' });
  const [sort, setSort] = useState({ by: 'addedAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PARTNER_DOCUMENT_PAGE_SIZE);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [documentList, documentStats] = await Promise.all([
        partnerDocumentService.getDocuments(),
        partnerDocumentService.getDocumentStats(),
      ]);
      setDocuments(documentList);
      setStats(documentStats);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos documents.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.category ||
      filters.status ||
      filters.entity ||
      filters.date ||
      filters.dateFrom ||
      filters.dateTo,
  );

  const resetFilters = useCallback(() => {
    setSearch('');
    setFilters({ category: '', status: '', entity: '', date: '', dateFrom: '', dateTo: '' });
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

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
    if (filters.date === 'today') minDate = startOfToday.getTime();
    else if (filters.date === 'week') minDate = startOfWeek.getTime();
    else if (filters.date === 'month') minDate = startOfMonth.getTime();
    else if (filters.date === 'custom') {
      if (filters.dateFrom) minDate = new Date(`${filters.dateFrom}T00:00:00`).getTime();
      if (filters.dateTo) maxDate = new Date(`${filters.dateTo}T23:59:59`).getTime();
    }

    return documents.filter((document) => {
      if (filters.category && document.category !== filters.category) return false;
      if (filters.status && document.status !== filters.status) return false;
      if (filters.entity && document.entityType !== filters.entity) return false;

      if (minDate !== null || maxDate !== null) {
        const addedAt = new Date(document.addedAt ?? 0).getTime();
        if (Number.isNaN(addedAt)) return false;
        if (minDate !== null && addedAt < minDate) return false;
        if (maxDate !== null && addedAt > maxDate) return false;
      }

      if (!query) return true;
      const haystack = [
        document.name,
        document.reference,
        document.entityLabel,
        getPartnerDocumentCategory(document.category).label,
        document.fileType,
        document.entityType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [documents, search, filters]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.addedAt;
    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      if (left < right) return -1 * direction;
      if (left > right) return 1 * direction;
      return 0;
    });
  }, [filtered, sort]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize);

  const counts = useMemo(
    () =>
      documents.reduce(
        (acc, document) => {
          acc[document.status] = (acc[document.status] ?? 0) + 1;
          return acc;
        },
        { valid: 0, expiring: 0, expired: 0, pending: 0 },
      ),
    [documents],
  );

  const createDocument = useCallback((payload) => partnerDocumentService.createDocument(payload), []);
  const updateDocument = useCallback((id, payload) => partnerDocumentService.updateDocument(id, payload), []);
  const deleteDocument = useCallback((id) => partnerDocumentService.deleteDocument(id), []);
  const renewDocument = useCallback((id, expiresAt) => partnerDocumentService.renewDocument(id, expiresAt), []);
  const downloadDocument = useCallback((id) => partnerDocumentService.downloadDocument(id), []);

  return {
    documents,
    stats,
    isLoading,
    error,
    refetch,
    search,
    setSearch,
    filters,
    setFilters,
    setFilter,
    hasActiveFilters,
    resetFilters,
    sort,
    setSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    sorted,
    pageItems,
    counts,
    createDocument,
    updateDocument,
    deleteDocument,
    renewDocument,
    downloadDocument,
  };
};

export default usePartnerDocuments;
