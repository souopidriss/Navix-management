/**
 * Navix Vehicles — Logique de liste (filtre, tri, pagination) + hook associé
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterVehicles`, `sortVehicles`) testables, puis hook
 * `useVehicleListData` qui combine l'état du store (vehicles, search,
 * filters, sort, pagination) et la carte des entreprises (companyById) pour
 * produire la liste visible : items, totalItems, totalPages, page et startIndex.
 */
import { useMemo } from 'react';
import { useVehiclesStore } from '../store';

export const filterVehicles = (vehicles = [], { search = '', filters = {}, companyById = {} } = {}) => {
  const query = search.trim().toLowerCase();

  return vehicles.filter((vehicle) => {
    const companyName = companyById[vehicle.companyId]?.name ?? '';

    const matchesSearch =
      !query ||
      [vehicle.registrationNumber, vehicle.vin, vehicle.brand, vehicle.model, companyName].some((field) =>
        String(field ?? '').toLowerCase().includes(query),
      );
    const matchesCompany = !filters.companyId || vehicle.companyId === filters.companyId;
    const matchesGroup = !filters.group || vehicle.group === filters.group;
    const matchesBrand = !filters.brand || vehicle.brand === filters.brand;
    const matchesStatus = !filters.status || vehicle.status === filters.status;
    const matchesFuel = !filters.fuelType || vehicle.fuelType === filters.fuelType;
    const matchesTransmission = !filters.transmission || vehicle.transmission === filters.transmission;
    const matchesYear = !filters.year || Number(vehicle.year) === Number(filters.year);

    return (
      matchesSearch &&
      matchesCompany &&
      matchesGroup &&
      matchesBrand &&
      matchesStatus &&
      matchesFuel &&
      matchesTransmission &&
      matchesYear
    );
  });
};

export const sortVehicles = (vehicles = [], { by = 'name', direction = 'asc' } = {}) => {
  const factor = direction === 'desc' ? -1 : 1;

  return [...vehicles].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'name':
        result = `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, 'fr');
        break;
      case 'brand':
        result = String(a.brand).localeCompare(String(b.brand), 'fr');
        break;
      case 'year':
        result = a.year - b.year;
        break;
      case 'mileage':
        result = a.mileage - b.mileage;
        break;
      case 'createdAt':
        result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        result = 0;
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible. La carte `companyById` (id → { name }) est utilisée
 * pour la recherche par nom d'entreprise.
 * @param {object} [companyById] — carte des entreprises (id → objet)
 */
export const useVehicleListData = (companyById = {}) => {
  const vehicles = useVehiclesStore((state) => state.vehicles);
  const search = useVehiclesStore((state) => state.search);
  const filters = useVehiclesStore((state) => state.filters);
  const sort = useVehiclesStore((state) => state.sort);
  const page = useVehiclesStore((state) => state.pagination.page);
  const pageSize = useVehiclesStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortVehicles(filterVehicles(vehicles, { search, filters, companyById }), sort);
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
  }, [vehicles, search, filters, sort, page, pageSize, companyById]);
};
