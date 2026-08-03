/**
 * Navix Maintenance — Logique de liste (filtre, tri, pagination) + hook
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterMaintenanceRecords`, `sortMaintenanceRecords`)
 * testables, puis hook `useMaintenanceListData` qui combine l'état du store
 * et les cartes de références (companyById, vehicleById) pour produire la
 * liste visible : items, totalItems, totalPages, page et startIndex.
 *
 * Le filtre « Période » porte sur la date prévue (scheduledDate) :
 *   current → entretiens non clôturés ; month/quarter/year → fenêtres
 *   glissantes de l'année courante.
 */
import { useMemo } from 'react';
import {
  DEFAULT_PAGE_SIZE,
  getMaintenancePriorityOrder,
  getMaintenanceType,
  isMaintenanceFinished,
} from '../constants';
import { useMaintenanceStore } from '../store';

const toQuery = (value) => String(value ?? '').trim().toLowerCase();

const isWithinPeriod = (scheduledDate, period) => {
  if (!period) return true;
  if (!scheduledDate) return false;

  const start = new Date(`${scheduledDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return false;

  const now = new Date();

  switch (period) {
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

export const filterMaintenanceRecords = (
  maintenanceRecords = [],
  { search = '', filters = {}, companyById = {}, vehicleById = {} } = {},
) => {
  const query = toQuery(search);

  return maintenanceRecords.filter((maintenance) => {
    const companyName = companyById[maintenance.companyId]?.name ?? '';
    const vehicle = vehicleById[maintenance.vehicleId] ?? {};
    const vehicleLabel =
      vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();

    const matchesSearch =
      !query ||
      [
        maintenance.maintenanceNumber,
        maintenance.workshop,
        maintenance.mechanic,
        maintenance.supplier,
        maintenance.description,
        maintenance.maintenanceNumber,
        getMaintenanceType(maintenance.maintenanceType).label,
        vehicleLabel,
        companyName,
      ].some((field) => toQuery(field).includes(query));
    const matchesCompany = !filters.companyId || maintenance.companyId === filters.companyId;
    const matchesVehicle = !filters.vehicleId || maintenance.vehicleId === filters.vehicleId;
    const matchesType = !filters.maintenanceType || maintenance.maintenanceType === filters.maintenanceType;
    const matchesPriority = !filters.priority || maintenance.priority === filters.priority;
    const matchesStatus = !filters.status || maintenance.status === filters.status;
    const matchesPeriod =
      filters.period === 'current'
        ? !isMaintenanceFinished(maintenance)
        : isWithinPeriod(maintenance.scheduledDate, filters.period);

    return (
      matchesSearch &&
      matchesCompany &&
      matchesVehicle &&
      matchesType &&
      matchesPriority &&
      matchesStatus &&
      matchesPeriod
    );
  });
};

export const sortMaintenanceRecords = (
  maintenanceRecords = [],
  { by = 'scheduledDate', direction = 'desc' } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;
  const dateKey = (record) => record.scheduledDate || '9999-12-31';

  return [...maintenanceRecords].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'scheduledDate':
        result = dateKey(a).localeCompare(dateKey(b));
        break;
      case 'actualCost':
        result = Number(a.actualCost || 0) - Number(b.actualCost || 0);
        break;
      case 'mileage':
        result = Number(a.mileage || 0) - Number(b.mileage || 0);
        break;
      case 'priority':
        result =
          getMaintenancePriorityOrder(a.priority) - getMaintenancePriorityOrder(b.priority) ||
          dateKey(a).localeCompare(dateKey(b));
        break;
      default:
        result = 0;
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible des entretiens. Les cartes de références
 * (id → objet) sont utilisées pour la recherche et le filtrage.
 */
export const useMaintenanceListData = (companyById = {}, vehicleById = {}) => {
  const maintenanceRecords = useMaintenanceStore((state) => state.maintenanceRecords);
  const search = useMaintenanceStore((state) => state.search);
  const filters = useMaintenanceStore((state) => state.filters);
  const sort = useMaintenanceStore((state) => state.sort);
  const page = useMaintenanceStore((state) => state.pagination.page);
  const pageSize = useMaintenanceStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortMaintenanceRecords(
      filterMaintenanceRecords(maintenanceRecords, { search, filters, companyById, vehicleById }),
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
  }, [maintenanceRecords, search, filters, sort, page, pageSize, companyById, vehicleById]);
};
