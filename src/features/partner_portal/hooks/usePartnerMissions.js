/**
 * Navix Partner Portal — Hook usePartnerMissions (PROMPT 064)
 * --------------------------------------------------------------------------
 * Charge les missions du partenaire (isolées multi-tenant) via
 * `partnerMissionService` et expose les opérations CRUD + changement de
 * statut + annulation, ainsi que l'état complet de la page : recherche,
 * filtres (statut / type / période), tri, pagination et agrégats des KPI
 * (total / planifiées / en cours / terminées / annulées / revenus FCFA des
 * missions terminées).
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { partnerMissionService, isMissionInPeriod } from '../services/partnerMissionService';
import {
  DEFAULT_PARTNER_MISSION_PAGE_SIZE,
  getPartnerMissionType,
  getPartnerMissionStatus,
} from '../constants/partner.constants';

const SORTABLE_KEYS = {
  reference: (mission) => mission.reference?.toLowerCase() ?? '',
  startDate: (mission) => mission.startDate ?? '',
  client: (mission) => mission.client?.toLowerCase() ?? '',
  amount: (mission) => Number(mission.amount) || 0,
  status: (mission) => getPartnerMissionStatus(mission.status).label,
};

const EMPTY_COUNTS = { total: 0, scheduled: 0, in_progress: 0, completed: 0, cancelled: 0, revenue: 0 };

export const usePartnerMissions = () => {
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '', period: '', customFrom: '', customTo: '' });
  const [sort, setSort] = useState({ by: 'startDate', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PARTNER_MISSION_PAGE_SIZE);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await partnerMissionService.getMissions();
      setMissions(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos missions.');
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
      filters.status ||
      filters.type ||
      filters.period ||
      filters.customFrom ||
      filters.customTo,
  );

  const resetFilters = useCallback(() => {
    setSearch('');
    setFilters({ status: '', type: '', period: '', customFrom: '', customTo: '' });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return missions.filter((mission) => {
      if (filters.status && mission.status !== filters.status) return false;
      if (filters.type && mission.type !== filters.type) return false;
      if (filters.period && !isMissionInPeriod(mission, filters.period, { from: filters.customFrom, to: filters.customTo }))
        return false;
      if (!query) return true;
      const haystack = [
        mission.reference,
        mission.title,
        mission.client,
        mission.vehicle,
        mission.vehicleModel,
        mission.registrationNumber,
        mission.driver,
        mission.departure,
        mission.destination,
        getPartnerMissionType(mission.type).label,
        getPartnerMissionStatus(mission.status).label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [missions, search, filters]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.startDate;
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
      missions.reduce(
        (acc, mission) => {
          acc.total += 1;
          acc[mission.status] = (acc[mission.status] ?? 0) + 1;
          if (mission.status === 'completed') acc.revenue += Number(mission.amount) || 0;
          return acc;
        },
        { ...EMPTY_COUNTS },
      ),
    [missions],
  );

  const createMission = useCallback((payload) => partnerMissionService.createMission(payload), []);
  const updateMission = useCallback((id, payload) => partnerMissionService.updateMission(id, payload), []);
  const updateMissionStatus = useCallback((id, status) => partnerMissionService.updateMissionStatus(id, status), []);
  const cancelMission = useCallback((id) => partnerMissionService.cancelMission(id), []);
  const deleteMission = useCallback((id) => partnerMissionService.deleteMission(id), []);

  return {
    missions,
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
    createMission,
    updateMission,
    updateMissionStatus,
    cancelMission,
    deleteMission,
  };
};

export default usePartnerMissions;
