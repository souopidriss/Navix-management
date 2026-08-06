/**
 * Navix Users — Logique de liste des utilisateurs (filtre, tri, pagination)
 * --------------------------------------------------------------------------
 * Hook `useUserListData` qui combine l'état du store (users, search, filters,
 * sort, pagination) et la portée multi-tenant simulée pour produire la liste
 * visible : items, totalItems, totalPages, page, startIndex.
 *
 * Réutilise les fonctions pures du service (`applyUserFilters`, `sortUsers`)
 * afin qu'il n'existe qu'une seule logique de filtrage. La liste est enrichie
 * (libellés entreprise / agence / rôles) avant filtrage et tri.
 */
import { useMemo } from 'react';
import { useUserStore } from '../store';
import { sanitizeUserFilters } from '../schemas';
import { applyUserFilters, sortUsers } from '../services';
import { useTenantScope } from './useTenantScope';

const paginate = (items, { page, pageSize }) => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalItems,
    totalPages,
    page: currentPage,
    startIndex,
  };
};

/**
 * Hook de liste visible des utilisateurs.
 * @returns {object} { items, totalItems, totalPages, page, startIndex }
 */
export const useUserListData = () => {
  const { enrichUsers } = useTenantScope();
  const users = useUserStore((state) => state.users);
  const search = useUserStore((state) => state.search);
  const filters = useUserStore((state) => state.filters);
  const sort = useUserStore((state) => state.sort);
  const page = useUserStore((state) => state.pagination.page);
  const pageSize = useUserStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const enriched = enrichUsers(users);
    const safeFilters = sanitizeUserFilters({ ...filters, search });
    const filtered = applyUserFilters(enriched, safeFilters);
    const sorted = sortUsers(filtered, sort.by, sort.direction);
    return paginate(sorted, { page, pageSize });
  }, [users, enrichUsers, search, filters, sort, page, pageSize]);
};
