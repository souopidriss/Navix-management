/**
 * Navix Trips — Logique de liste (filtre, tri, pagination) + hooks
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterTrips`, `sortTrips`, helpers d'historique)
 * testables, puis hooks `useTripListData` et `useTripHistoryData` qui
 * combinent l'état (store ou local) et les cartes de références
 * (companyById, driverById, vehicleById) pour produire la liste visible :
 * items, totalItems, totalPages, page et startIndex.
 */
import { useMemo } from 'react';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { useTripsStore } from '../store';

const toQuery = (value) => String(value ?? '').trim().toLowerCase();

const isWithinPeriod = (departureDate, period) => {
  if (!period) return true;

  const start = new Date(`${departureDate}T00:00:00`);
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

export const filterTrips = (
  trips = [],
  { search = '', filters = {}, companyById = {}, driverById = {}, vehicleById = {} } = {},
) => {
  const query = toQuery(search);

  return trips.filter((trip) => {
    const companyName = companyById[trip.companyId]?.name ?? '';
    const driverName = driverById[trip.driverId]?.fullName ?? '';
    const vehicle = vehicleById[trip.vehicleId] ?? {};
    const vehicleLabel = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();

    const matchesSearch =
      !query ||
      [
        trip.tripNumber,
        driverName,
        vehicleLabel,
        companyName,
        trip.departureLocation,
        trip.arrivalLocation,
        trip.purpose,
      ].some((field) => toQuery(field).includes(query));
    const matchesCompany = !filters.companyId || trip.companyId === filters.companyId;
    const matchesStatus = !filters.status || trip.status === filters.status;
    const matchesType = !filters.tripType || trip.tripType === filters.tripType;
    const matchesPeriod = isWithinPeriod(trip.departureDate, filters.period);
    const matchesDriver = !filters.driverId || trip.driverId === filters.driverId;
    const matchesVehicle = !filters.vehicleId || trip.vehicleId === filters.vehicleId;

    return (
      matchesSearch &&
      matchesCompany &&
      matchesStatus &&
      matchesType &&
      matchesPeriod &&
      matchesDriver &&
      matchesVehicle
    );
  });
};

export const sortTrips = (
  trips = [],
  { by = 'departureDate', direction = 'desc' } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;

  return [...trips].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'departureDate':
        result = String(a.departureDate).localeCompare(String(b.departureDate));
        break;
      case 'arrivalDate':
        result = String(a.arrivalDate || a.departureDate).localeCompare(
          String(b.arrivalDate || b.departureDate),
        );
        break;
      case 'distance': {
        const distanceA = Number(a.actualDistance) || Number(a.plannedDistance) || 0;
        const distanceB = Number(b.actualDistance) || Number(b.plannedDistance) || 0;
        result = distanceA - distanceB;
        break;
      }
      case 'duration': {
        const durationA = Number(a.actualDuration) || Number(a.estimatedDuration) || 0;
        const durationB = Number(b.actualDuration) || Number(b.estimatedDuration) || 0;
        result = durationA - durationB;
        break;
      }
      default:
        result = 0;
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible des trajets. Les cartes de références
 * (id → objet) sont utilisées pour la recherche et le filtrage.
 */
export const useTripListData = (companyById = {}, driverById = {}, vehicleById = {}) => {
  const trips = useTripsStore((state) => state.trips);
  const search = useTripsStore((state) => state.search);
  const filters = useTripsStore((state) => state.filters);
  const sort = useTripsStore((state) => state.sort);
  const page = useTripsStore((state) => state.pagination.page);
  const pageSize = useTripsStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortTrips(
      filterTrips(trips, { search, filters, companyById, driverById, vehicleById }),
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
  }, [trips, search, filters, sort, page, pageSize, companyById, driverById, vehicleById]);
};

export const filterTripHistory = (
  history = [],
  { search = '', status = '', companyById = {}, driverById = {}, vehicleById = {} } = {},
) => {
  const query = toQuery(search);

  return history.filter((trip) => {
    const driverName = driverById[trip.driverId]?.fullName ?? '';
    const vehicle = vehicleById[trip.vehicleId] ?? {};
    const vehicleLabel = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();
    const companyName = companyById[trip.companyId]?.name ?? '';

    const matchesSearch =
      !query ||
      [
        trip.tripNumber,
        driverName,
        vehicleLabel,
        companyName,
        trip.departureLocation,
        trip.arrivalLocation,
        trip.purpose,
      ].some((field) => toQuery(field).includes(query));
    const matchesStatus = !status || trip.status === status;

    return matchesSearch && matchesStatus;
  });
};

export const sortTripHistory = (history = [], { by = 'arrivalDate', direction = 'desc' } = {}) => {
  const factor = direction === 'desc' ? -1 : 1;

  return [...history].sort((a, b) => {
    const endA = a.arrivalDate || a.updatedAt || a.departureDate;
    const endB = b.arrivalDate || b.updatedAt || b.departureDate;
    let result = 0;

    switch (by) {
      case 'arrivalDate':
        result = String(endA).localeCompare(String(endB));
        break;
      case 'departureDate':
        result = String(a.departureDate).localeCompare(String(b.departureDate));
        break;
      case 'distance': {
        const distanceA = Number(a.actualDistance) || Number(a.plannedDistance) || 0;
        const distanceB = Number(b.actualDistance) || Number(b.plannedDistance) || 0;
        result = distanceA - distanceB;
        break;
      }
      case 'duration': {
        const durationA = Number(a.actualDuration) || Number(a.estimatedDuration) || 0;
        const durationB = Number(b.actualDuration) || Number(b.estimatedDuration) || 0;
        result = durationA - durationB;
        break;
      }
      default:
        result = 0;
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible de l'historique (état local à la page).
 * @param {object} options
 * @param {Array} options.history — trajets passés
 * @param {string} options.search — recherche
 * @param {string} options.status — filtre de statut
 * @param {{ by: string, direction: string }} options.sort — tri
 * @param {object} options.companyById
 * @param {object} options.driverById
 * @param {object} options.vehicleById
 * @param {number} options.page — page courante
 * @param {number} options.pageSize — taille de page
 */
export const useTripHistoryData = ({
  history = [],
  search = '',
  status = '',
  sort = { by: 'arrivalDate', direction: 'desc' },
  companyById = {},
  driverById = {},
  vehicleById = {},
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}) =>
  useMemo(() => {
    const filtered = sortTripHistory(
      filterTripHistory(history, { search, status, companyById, driverById, vehicleById }),
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
  }, [history, search, status, sort, companyById, driverById, vehicleById, page, pageSize]);
