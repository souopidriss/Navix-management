/**
 * Navix Assignments — Logique de liste (filtre, tri, pagination) + hooks
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterAssignments`, `sortAssignments`, helpers
 * d'historique) testables, puis hooks `useAssignmentListData` et
 * `useAssignmentHistoryData` qui combinent l'état (store ou local) et les
 * cartes de références (companyById, agencyById, driverById, vehicleById)
 * pour produire la liste visible : items, totalItems, totalPages, page et
 * startIndex.
 */
import { useMemo } from 'react';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { useAssignmentsStore } from '../store';

const toQuery = (value) => String(value ?? '').trim().toLowerCase();

const isWithinPeriod = (startDate, period) => {
  if (!period) return true;

  const start = new Date(`${startDate}T00:00:00`);
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

export const filterAssignments = (
  assignments = [],
  { search = '', filters = {}, companyById = {}, agencyById = {}, driverById = {}, vehicleById = {} } = {},
) => {
  const query = toQuery(search);

  return assignments.filter((assignment) => {
    const companyName = companyById[assignment.companyId]?.name ?? '';
    const agencyName = agencyById[assignment.agencyId]?.name ?? '';
    const driver = driverById[assignment.driverId] ?? {};
    const driverName = driver.fullName ?? '';
    const vehicle = vehicleById[assignment.vehicleId] ?? {};
    const vehicleLabel = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();

    const matchesSearch =
      !query ||
      [
        assignment.assignmentNumber,
        driverName,
        vehicleLabel,
        companyName,
        agencyName,
        assignment.destination,
      ].some((field) => toQuery(field).includes(query));
    const matchesCompany = !filters.companyId || assignment.companyId === filters.companyId;
    const matchesAgency = !filters.agencyId || assignment.agencyId === filters.agencyId;
    const matchesStatus = !filters.status || assignment.status === filters.status;
    const matchesType = !filters.assignmentType || assignment.assignmentType === filters.assignmentType;
    const matchesPeriod = isWithinPeriod(assignment.startDate, filters.period);

    return (
      matchesSearch &&
      matchesCompany &&
      matchesAgency &&
      matchesStatus &&
      matchesType &&
      matchesPeriod
    );
  });
};

export const sortAssignments = (
  assignments = [],
  { by = 'startDate', direction = 'desc', companyById = {}, driverById = {}, vehicleById = {} } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;

  return [...assignments].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'startDate':
        result = String(a.startDate).localeCompare(String(b.startDate));
        break;
      case 'endDate':
        result = String(a.expectedEndDate || a.endDate).localeCompare(String(b.expectedEndDate || b.endDate));
        break;
      case 'company':
        result = String(companyById[a.companyId]?.name ?? '').localeCompare(
          String(companyById[b.companyId]?.name ?? ''),
          'fr',
        );
        break;
      case 'driver':
        result = String(driverById[a.driverId]?.fullName ?? '').localeCompare(
          String(driverById[b.driverId]?.fullName ?? ''),
          'fr',
        );
        break;
      case 'vehicle':
        result = String(
          vehicleById[a.vehicleId]?.registrationNumber ||
            `${vehicleById[a.vehicleId]?.brand ?? ''} ${vehicleById[a.vehicleId]?.model ?? ''}`.trim(),
        ).localeCompare(
          String(
            vehicleById[b.vehicleId]?.registrationNumber ||
              `${vehicleById[b.vehicleId]?.brand ?? ''} ${vehicleById[b.vehicleId]?.model ?? ''}`.trim(),
          ),
          'fr',
        );
        break;
      default:
        result = 0;
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible des affectations. Les cartes de références
 * (id → objet) sont utilisées pour la recherche et le tri.
 */
export const useAssignmentListData = (companyById = {}, agencyById = {}, driverById = {}, vehicleById = {}) => {
  const assignments = useAssignmentsStore((state) => state.assignments);
  const search = useAssignmentsStore((state) => state.search);
  const filters = useAssignmentsStore((state) => state.filters);
  const sort = useAssignmentsStore((state) => state.sort);
  const page = useAssignmentsStore((state) => state.pagination.page);
  const pageSize = useAssignmentsStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortAssignments(
      filterAssignments(assignments, { search, filters, companyById, agencyById, driverById, vehicleById }),
      { ...sort, companyById, driverById, vehicleById },
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
  }, [assignments, search, filters, sort, page, pageSize, companyById, agencyById, driverById, vehicleById]);
};

export const filterAssignmentHistory = (
  history = [],
  { search = '', status = '', companyById = {}, driverById = {}, vehicleById = {} } = {},
) => {
  const query = toQuery(search);

  return history.filter((assignment) => {
    const driverName = driverById[assignment.driverId]?.fullName ?? '';
    const vehicle = vehicleById[assignment.vehicleId] ?? {};
    const vehicleLabel = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();
    const companyName = companyById[assignment.companyId]?.name ?? '';

    const matchesSearch =
      !query ||
      [
        assignment.assignmentNumber,
        driverName,
        vehicleLabel,
        companyName,
        assignment.destination,
      ].some((field) => toQuery(field).includes(query));
    const matchesStatus = !status || assignment.status === status;

    return matchesSearch && matchesStatus;
  });
};

export const sortAssignmentHistory = (history = [], { by = 'endDate', direction = 'desc' } = {}) => {
  const factor = direction === 'desc' ? -1 : 1;

  return [...history].sort((a, b) => {
    const endA = a.endDate || a.updatedAt || a.startDate;
    const endB = b.endDate || b.updatedAt || b.startDate;
    let result = 0;

    switch (by) {
      case 'endDate':
        result = String(endA).localeCompare(String(endB));
        break;
      case 'startDate':
        result = String(a.startDate).localeCompare(String(b.startDate));
        break;
      case 'duration': {
        const daysA = new Date(endA).getTime() - new Date(a.startDate).getTime();
        const daysB = new Date(endB).getTime() - new Date(b.startDate).getTime();
        result = daysA - daysB;
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
 * @param {Array} options.history — affectations passées
 * @param {string} options.search — recherche
 * @param {string} options.status — filtre de statut
 * @param {{ by: string, direction: string }} options.sort — tri
 * @param {object} options.companyById
 * @param {object} options.driverById
 * @param {object} options.vehicleById
 * @param {number} options.page — page courante
 * @param {number} options.pageSize — taille de page
 */
export const useAssignmentHistoryData = ({
  history = [],
  search = '',
  status = '',
  sort = { by: 'endDate', direction: 'desc' },
  companyById = {},
  driverById = {},
  vehicleById = {},
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}) =>
  useMemo(() => {
    const filtered = sortAssignmentHistory(
      filterAssignmentHistory(history, { search, status, companyById, driverById, vehicleById }),
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
