/**
 * Navix Fuel — Logique de liste (filtre, tri, pagination) + hook
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterFuelRecords`, `sortFuelRecords`) testables, puis
 * hook `useFuelListData` qui combine l'état du store et les cartes de
 * références (companyById, driverById, vehicleById) pour produire la liste
 * visible : items, totalItems, totalPages, page et startIndex.
 */
import { useMemo } from 'react';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { useFuelStore } from '../store';

const toQuery = (value) => String(value ?? '').trim().toLowerCase();

const isWithinPeriod = (createdAt, period) => {
  if (!period) return true;

  const start = new Date(createdAt);
  if (Number.isNaN(start.getTime())) return false;

  const now = new Date();

  switch (period) {
    case 'current':
      return start <= now;
    case 'month':
      return start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth();
    case 'quarter': {
      const startQuarter = Math.floor(start.getMonth() / 3);
      const nowQuarter = Math.floor(now.getMonth() / 3);
      return start.getFullYear() === now.getFullYear() && startQuarter === nowQuarter;
    }
    case 'year':
      return start.getFullYear() === now.getFullYear();
    default:
      return true;
  }
};

export const filterFuelRecords = (
  fuelRecords = [],
  { search = '', filters = {}, companyById = {}, driverById = {}, vehicleById = {} } = {},
) => {
  const query = toQuery(search);

  return fuelRecords.filter((fuel) => {
    const companyName = companyById[fuel.companyId]?.name ?? '';
    const driverName = driverById[fuel.driverId]?.fullName ?? '';
    const vehicle = vehicleById[fuel.vehicleId] ?? {};
    const vehicleLabel = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();

    const matchesSearch =
      !query ||
      [
        fuel.fuelNumber,
        fuel.stationName,
        fuel.stationCity,
        fuel.invoiceNumber,
        vehicleLabel,
        driverName,
        companyName,
      ].some((field) => toQuery(field).includes(query));
    const matchesCompany = !filters.companyId || fuel.companyId === filters.companyId;
    const matchesVehicle = !filters.vehicleId || fuel.vehicleId === filters.vehicleId;
    const matchesDriver = !filters.driverId || fuel.driverId === filters.driverId;
    const matchesFuelType = !filters.fuelType || fuel.fuelType === filters.fuelType;
    const matchesStation =
      !filters.stationName || toQuery(fuel.stationName).includes(toQuery(filters.stationName));
    const matchesPeriod = isWithinPeriod(fuel.createdAt, filters.period);
    const matchesStatus = !filters.status || fuel.status === filters.status;

    return (
      matchesSearch &&
      matchesCompany &&
      matchesVehicle &&
      matchesDriver &&
      matchesFuelType &&
      matchesStation &&
      matchesPeriod &&
      matchesStatus
    );
  });
};

export const sortFuelRecords = (
  fuelRecords = [],
  { by = 'createdAt', direction = 'desc' } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;

  return [...fuelRecords].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'createdAt':
        result = String(a.createdAt).localeCompare(String(b.createdAt));
        break;
      case 'totalCost':
        result = Number(a.totalCost) - Number(b.totalCost);
        break;
      case 'consumptionAverage':
        result = Number(a.consumptionAverage) - Number(b.consumptionAverage);
        break;
      case 'quantity':
        result = Number(a.quantity) - Number(b.quantity);
        break;
      case 'mileage':
        result = Number(a.mileage) - Number(b.mileage);
        break;
      default:
        result = 0;
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible des pleins de carburant. Les cartes de références
 * (id → objet) sont utilisées pour la recherche et le filtrage.
 */
export const useFuelListData = (companyById = {}, driverById = {}, vehicleById = {}) => {
  const fuelRecords = useFuelStore((state) => state.fuelRecords);
  const search = useFuelStore((state) => state.search);
  const filters = useFuelStore((state) => state.filters);
  const sort = useFuelStore((state) => state.sort);
  const page = useFuelStore((state) => state.pagination.page);
  const pageSize = useFuelStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortFuelRecords(
      filterFuelRecords(fuelRecords, { search, filters, companyById, driverById, vehicleById }),
      sort,
    );
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (currentPage - 1) * pageSize;

    return {
      items: filtered.slice(startIndex, startIndex + pageSize),
      totalItems,
      totalPages,
      page: currentPage,
      startIndex,
    };
  }, [fuelRecords, search, filters, sort, page, pageSize, companyById, driverById, vehicleById]);
};
