/**
 * Navix Agencies — Logique de liste (filtre, tri, pagination) + hook
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterAgencies`, `sortAgencies`) testables, puis hook
 * `useAgencyListData` qui combine l'état du store et la carte des sociétés
 * (companyById) pour produire la liste visible : items, totalItems,
 * totalPages, page et startIndex.
 */
import { useMemo } from 'react';
import { DEFAULT_PAGE_SIZE, getAgencyType, getAgencyStatus } from '../constants';
import { useAgenciesStore } from '../store';

const toQuery = (value) => String(value ?? '').trim().toLowerCase();

export const filterAgencies = (
  agencies = [],
  { search = '', filters = {}, companyById = {} } = {},
) => {
  const query = toQuery(search);

  return agencies.filter((agency) => {
    const companyName = companyById[agency.companyId]?.name ?? '';
    const matchesSearch =
      !query ||
      [
        agency.name,
        agency.code,
        agency.city,
        agency.region,
        agency.country,
        agency.description,
        getAgencyType(agency.type).label,
        companyName,
      ].some((field) => toQuery(field).includes(query));
    const matchesCompany = !filters.companyId || agency.companyId === filters.companyId;
    const matchesType = !filters.type || agency.type === filters.type;
    const matchesStatus = !filters.status || agency.status === filters.status;
    const matchesCountry = !filters.country || agency.country === filters.country;
    const matchesCity = !filters.city || toQuery(agency.city).includes(toQuery(filters.city));
    const matchesRegion = !filters.region || toQuery(agency.region).includes(toQuery(filters.region));

    return (
      matchesSearch &&
      matchesCompany &&
      matchesType &&
      matchesStatus &&
      matchesCountry &&
      matchesCity &&
      matchesRegion
    );
  });
};

export const sortAgencies = (
  agencies = [],
  { by = 'name', direction = 'asc' } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;
  const dateKey = (agency) => agency.createdAt || '1970-01-01T00:00:00.000Z';

  return [...agencies].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'name':
        result = toQuery(a.name).localeCompare(toQuery(b.name), 'fr');
        break;
      case 'code':
        result = toQuery(a.code).localeCompare(toQuery(b.code), 'fr');
        break;
      case 'type':
        result =
          getAgencyType(a.type).label.localeCompare(getAgencyType(b.type).label, 'fr') ||
          toQuery(a.name).localeCompare(toQuery(b.name), 'fr');
        break;
      case 'status':
        result =
          getAgencyStatus(a.status).label.localeCompare(getAgencyStatus(b.status).label, 'fr') ||
          toQuery(a.name).localeCompare(toQuery(b.name), 'fr');
        break;
      case 'city':
        result = toQuery(a.city).localeCompare(toQuery(b.city), 'fr');
        break;
      case 'country':
        result = toQuery(a.country).localeCompare(toQuery(b.country), 'fr');
        break;
      case 'vehicleCount':
        result = Number(a.vehicleCount || 0) - Number(b.vehicleCount || 0);
        break;
      case 'driverCount':
        result = Number(a.driverCount || 0) - Number(b.driverCount || 0);
        break;
      case 'createdAt':
        result = dateKey(a).localeCompare(dateKey(b));
        break;
      default:
        result = toQuery(a.name).localeCompare(toQuery(b.name), 'fr');
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible des agences. La carte des sociétés
 * (id → objet) est utilisée pour la recherche et le filtrage.
 */
export const useAgencyListData = (companyById = {}) => {
  const agencies = useAgenciesStore((state) => state.agencies);
  const search = useAgenciesStore((state) => state.search);
  const filters = useAgenciesStore((state) => state.filters);
  const sort = useAgenciesStore((state) => state.sort);
  const page = useAgenciesStore((state) => state.pagination.page);
  const pageSize = useAgenciesStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortAgencies(
      filterAgencies(agencies, { search, filters, companyById }),
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
  }, [agencies, search, filters, sort, page, pageSize, companyById]);
};
