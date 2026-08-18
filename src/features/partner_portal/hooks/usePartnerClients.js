/**
 * Navix Partner Portal — Hook usePartnerClients (PROMPT 065)
 * --------------------------------------------------------------------------
 * Charge les clients de l'entreprise partenaire (isolés multi-tenant) via
 * `partnerClientService` et expose l'état complet de la page : recherche,
 * filtres (statut / ville / type), tri, pagination et agrégats des KPI
 * (total / actifs / inactifs+archivés / revenus FCFA des missions terminées).
 * Les mutations (création, mise à jour, archivage) sont exposées pour être
 * appelées depuis la page ; la liste est ensuite rechargée par `refetch`.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { partnerClientService } from '../services/partnerClientService';
import {
  DEFAULT_PARTNER_CLIENT_PAGE_SIZE,
  getPartnerClientStatus,
  getPartnerClientType,
} from '../constants/partner.constants';

const SORTABLE_KEYS = {
  reference: (client) => client.reference?.toLowerCase() ?? '',
  name: (client) => client.name?.toLowerCase() ?? '',
  city: (client) => client.city?.toLowerCase() ?? '',
  status: (client) => getPartnerClientStatus(client.status).label,
  type: (client) => getPartnerClientType(client.type).label,
  missionsCount: (client) => Number(client.missionsCount) || 0,
  revenue: (client) => Number(client.revenue) || 0,
  lastMissionDate: (client) => client.lastMissionDate ?? '',
};

const EMPTY_COUNTS = { total: 0, active: 0, inactive: 0, revenue: 0 };

export const usePartnerClients = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', city: '', type: '' });
  const [sort, setSort] = useState({ by: 'reference', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PARTNER_CLIENT_PAGE_SIZE);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await partnerClientService.getClients();
      setClients(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos clients.');
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

  const hasActiveFilters = Boolean(search.trim() || filters.status || filters.city || filters.type);

  const resetFilters = useCallback(() => {
    setSearch('');
    setFilters({ status: '', city: '', type: '' });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return clients.filter((client) => {
      if (filters.status && client.status !== filters.status) return false;
      if (filters.city && client.city !== filters.city) return false;
      if (filters.type && client.type !== filters.type) return false;
      if (!query) return true;
      const haystack = [
        client.reference,
        client.name,
        client.email,
        client.phone,
        client.city,
        client.contactName,
        getPartnerClientType(client.type).label,
        getPartnerClientStatus(client.status).label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [clients, search, filters]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.name;
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

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const counts = useMemo(
    () =>
      clients.reduce(
        (acc, client) => {
          acc.total += 1;
          if (client.status === 'active') acc.active += 1;
          else acc.inactive += 1;
          acc.revenue += Number(client.revenue) || 0;
          return acc;
        },
        { ...EMPTY_COUNTS },
      ),
    [clients],
  );

  const cities = useMemo(() => {
    const seen = new Set();
    return clients
      .map((client) => client.city)
      .filter((city) => {
        if (!city || seen.has(city)) return false;
        seen.add(city);
        return true;
      })
      .sort((a, b) => String(a).localeCompare(String(b)));
  }, [clients]);

  const createClient = useCallback((payload) => partnerClientService.createClient(payload), []);
  const updateClient = useCallback((id, payload) => partnerClientService.updateClient(id, payload), []);
  const archiveClient = useCallback((id) => partnerClientService.archiveClient(id), []);

  return {
    clients,
    isLoading,
    error,
    refetch,
    search,
    setSearch,
    filters,
    setFilters,
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
    cities,
    createClient,
    updateClient,
    archiveClient,
  };
};

export default usePartnerClients;
