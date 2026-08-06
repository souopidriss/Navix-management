/**
 * Navix Users — Logique de liste des rôles (filtre, tri)
 * --------------------------------------------------------------------------
 * Hook `useRoleListData` qui combine l'état du store (roles, search, filters,
 * sort) et la portée multi-tenant simulée pour produire la liste visible des
 * rôles (enrichie du nombre d'utilisateurs rattachés).
 *
 * Réutilise les fonctions pures du service (`applyRoleFilters`, `sortRoles`).
 * Aucune pagination : le catalogue de rôles est réduit (page unique).
 */
import { useMemo } from 'react';
import { MOCK_USERS } from '../mocks';
import { useRoleStore } from '../store';
import { sanitizeRoleFilters } from '../schemas';
import { applyRoleFilters, sortRoles } from '../services';
import { enrichRoles, getTenantScopeCompanyId } from './useTenantScope';

/**
 * Hook de liste visible des rôles.
 * @returns {object} { items, totalItems }
 */
export const useRoleListData = () => {
  const roles = useRoleStore((state) => state.roles);
  const search = useRoleStore((state) => state.search);
  const filters = useRoleStore((state) => state.filters);
  const sort = useRoleStore((state) => state.sort);

  return useMemo(() => {
    const scopeCompanyId = getTenantScopeCompanyId();
    const scopedUsers = MOCK_USERS.filter(
      (user) => !scopeCompanyId || user.companyId === scopeCompanyId,
    );
    const enriched = enrichRoles(roles, scopedUsers);
    const safeFilters = sanitizeRoleFilters({ ...filters, search });
    const filtered = applyRoleFilters(enriched, safeFilters);
    const sorted = sortRoles(filtered, sort.by, sort.direction);
    return { items: sorted, totalItems: sorted.length };
  }, [roles, search, filters, sort]);
};
