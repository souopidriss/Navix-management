/**
 * Navix Companies — Logique de liste (filtre, tri, pagination) + hook associé
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterCompanies`, `sortCompanies`) testables, puis hook
 * `useCompanyListData` qui combine l'état du store (companies, search,
 * filters, sort, pagination) pour produire la liste visible :
 * items, totalItems, totalPages, page et startIndex.
 */
import { useMemo } from 'react';
import { useCompaniesStore } from '../store';

export const filterCompanies = (companies = [], { search = '', filters = {} } = {}) => {
  const query = search.trim().toLowerCase();

  return companies.filter((company) => {
    const matchesSearch =
      !query ||
      [company.name, company.code, company.city, company.email].some((field) =>
        String(field ?? '').toLowerCase().includes(query),
      );
    const matchesCountry = !filters.country || company.country === filters.country;
    const matchesStatus = !filters.status || company.status === filters.status;
    const matchesPlan = !filters.plan || company.subscriptionPlan === filters.plan;
    const matchesCity = !filters.city || company.city === filters.city;

    return matchesSearch && matchesCountry && matchesStatus && matchesPlan && matchesCity;
  });
};

export const sortCompanies = (companies = [], { by = 'name', direction = 'asc' } = {}) => {
  const factor = direction === 'desc' ? -1 : 1;

  return [...companies].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'name':
        result = String(a.name).localeCompare(String(b.name), 'fr');
        break;
      case 'createdAt':
        result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'vehicleCount':
        result = a.vehicleCount - b.vehicleCount;
        break;
      case 'driverCount':
        result = a.driverCount - b.driverCount;
        break;
      default:
        result = 0;
    }

    return result * factor;
  });
};

export const useCompanyListData = () => {
  const companies = useCompaniesStore((state) => state.companies);
  const search = useCompaniesStore((state) => state.search);
  const filters = useCompaniesStore((state) => state.filters);
  const sort = useCompaniesStore((state) => state.sort);
  const page = useCompaniesStore((state) => state.pagination.page);
  const pageSize = useCompaniesStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortCompanies(filterCompanies(companies, { search, filters }), sort);
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
  }, [companies, search, filters, sort, page, pageSize]);
};
