/**
 * Navix Drivers — Logique de liste (filtre, tri, pagination) + hook associé
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterDrivers`, `sortDrivers`) testables, puis hook
 * `useDriverListData` qui combine l'état du store (drivers, search,
 * filters, sort, pagination) et les cartes entreprises / agences
 * (companyById, agencyById) pour produire la liste visible : items,
 * totalItems, totalPages, page et startIndex.
 */
import { useMemo } from 'react';
import { useDriversStore } from '../store';

export const filterDrivers = (
  drivers = [],
  { search = '', filters = {}, companyById = {}, agencyById = {} } = {},
) => {
  const query = search.trim().toLowerCase();

  return drivers.filter((driver) => {
    const companyName = companyById[driver.companyId]?.name ?? '';
    const agencyName = agencyById[driver.agencyId]?.name ?? '';

    const matchesSearch =
      !query ||
      [
        driver.firstName,
        driver.lastName,
        driver.fullName,
        driver.phone,
        driver.email,
        driver.employeeCode,
        driver.licenseNumber,
        companyName,
        agencyName,
      ].some((field) => String(field ?? '').toLowerCase().includes(query));
    const matchesCompany = !filters.companyId || driver.companyId === filters.companyId;
    const matchesAgency = !filters.agencyId || driver.agencyId === filters.agencyId;
    const matchesAvailability = !filters.availability || driver.availability === filters.availability;
    const matchesStatus = !filters.status || driver.status === filters.status;
    const matchesLicense = !filters.licenseCategory || driver.licenseCategory === filters.licenseCategory;

    return (
      matchesSearch &&
      matchesCompany &&
      matchesAgency &&
      matchesAvailability &&
      matchesStatus &&
      matchesLicense
    );
  });
};

export const sortDrivers = (drivers = [], { by = 'name', direction = 'asc' } = {}) => {
  const factor = direction === 'desc' ? -1 : 1;

  return [...drivers].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'name':
        result = String(a.fullName).localeCompare(String(b.fullName), 'fr');
        break;
      case 'hireDate':
        result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'yearsExperience':
        result = a.yearsExperience - b.yearsExperience;
        break;
      case 'licenseExpiryDate':
        result = String(a.licenseExpiryDate).localeCompare(String(b.licenseExpiryDate));
        break;
      default:
        result = 0;
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible. Les cartes `companyById` / `agencyById`
 * (id → { name }) sont utilisées pour la recherche par nom d'entreprise ou
 * d'agence.
 * @param {object} [companyById] — carte des entreprises (id → objet)
 * @param {object} [agencyById] — carte des agences (id → objet)
 */
export const useDriverListData = (companyById = {}, agencyById = {}) => {
  const drivers = useDriversStore((state) => state.drivers);
  const search = useDriversStore((state) => state.search);
  const filters = useDriversStore((state) => state.filters);
  const sort = useDriversStore((state) => state.sort);
  const page = useDriversStore((state) => state.pagination.page);
  const pageSize = useDriversStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortDrivers(filterDrivers(drivers, { search, filters, companyById, agencyById }), sort);
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
  }, [drivers, search, filters, sort, page, pageSize, companyById, agencyById]);
};
