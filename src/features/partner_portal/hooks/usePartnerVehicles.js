/**
 * Navix Partner Portal — Hook usePartnerVehicles (PROMPT 063)
 * --------------------------------------------------------------------------
 * Charge la flotte partenaire (isolée multi-tenant) via
 * `partnerVehicleService` et expose les opérations CRUD + changement de
 * statut + affectation chauffeur, ainsi que l'état complet de la page :
 * recherche, filtres (statut / type / agence), tri, pagination et agrégats
 * des KPI (total / disponibles / en mission / en maintenance).
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getVehicleStatus } from '@/features/vehicles/constants';
import { getPartnerVehicleType } from '../constants/partner.constants';
import { partnerVehicleService } from '../services/partnerVehicleService';
import { DEFAULT_PARTNER_VEHICLE_PAGE_SIZE } from '../constants/partner.constants';

const SORTABLE_KEYS = {
  brand: (vehicle) => `${vehicle.brand} ${vehicle.model}`.toLowerCase(),
  registrationNumber: (vehicle) => vehicle.registrationNumber?.toLowerCase() ?? '',
  agency: (vehicle) => vehicle.agency?.toLowerCase() ?? '',
  mileage: (vehicle) => Number(vehicle.mileage) || 0,
  year: (vehicle) => Number(vehicle.year) || 0,
};

export const usePartnerVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '', agency: '' });
  const [sort, setSort] = useState({ by: 'brand', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PARTNER_VEHICLE_PAGE_SIZE);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await partnerVehicleService.getVehicles();
      setVehicles(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger votre flotte.');
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

  const hasActiveFilters = Boolean(search.trim() || filters.status || filters.type || filters.agency);

  const resetFilters = useCallback(() => {
    setSearch('');
    setFilters({ status: '', type: '', agency: '' });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      if (filters.status && vehicle.status !== filters.status) return false;
      if (filters.type && vehicle.type !== filters.type) return false;
      if (filters.agency && vehicle.agency !== filters.agency) return false;
      if (!query) return true;
      const haystack = [
        vehicle.registrationNumber,
        vehicle.brand,
        vehicle.model,
        vehicle.agency,
        vehicle.currentDriver,
        getPartnerVehicleType(vehicle.type).label,
        getVehicleStatus(vehicle.status).label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [vehicles, search, filters]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.brand;
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
      vehicles.reduce(
        (acc, vehicle) => {
          acc.total += 1;
          acc[vehicle.status] = (acc[vehicle.status] ?? 0) + 1;
          return acc;
        },
        { total: 0, available: 0, in_use: 0, maintenance: 0, out_of_service: 0 },
      ),
    [vehicles],
  );

  const availabilityRate = counts.total ? Math.round(((counts.available + counts.in_use) / counts.total) * 100) : 0;

  const createVehicle = useCallback((payload) => partnerVehicleService.createVehicle(payload), []);
  const updateVehicle = useCallback((id, payload) => partnerVehicleService.updateVehicle(id, payload), []);
  const updateVehicleStatus = useCallback((id, status) => partnerVehicleService.updateVehicleStatus(id, status), []);
  const assignVehicle = useCallback((id, driver) => partnerVehicleService.assignVehicle(id, driver), []);
  const deleteVehicle = useCallback((id) => partnerVehicleService.deleteVehicle(id), []);

  return {
    vehicles,
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
    availabilityRate,
    createVehicle,
    updateVehicle,
    updateVehicleStatus,
    assignVehicle,
    deleteVehicle,
  };
};

export default usePartnerVehicles;
