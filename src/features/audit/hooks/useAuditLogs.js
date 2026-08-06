/**
 * Navix Audit — Logique de liste (filtre, tri, pagination)
 * --------------------------------------------------------------------------
 * Hook `useAuditLogs` qui combine l'état du store (search, filters, sort,
 * pagination) et la portée multi-tenant simulée pour produire la liste
 * visible : items, totalItems, totalPages, page, startIndex.
 *
 * Réutilise les fonctions pures du service (`applyAuditFilters`,
 * `sortAuditLogs`) afin qu'il n'existe qu'une seule logique de filtrage.
 * Les cartes companyById / agencyById servent au tri et à l'affichage.
 */
import { useMemo } from 'react';
import { MOCK_COMPANIES } from '@/features/companies/mocks';
import { MOCK_AGENCIES } from '@/features/agencies/mocks';
import { useAuthStore } from '@/features/auth';
import { useAuditStore } from '../store';
import { sanitizeAuditFilters } from '../schemas';
import { applyAuditFilters, sortAuditLogs } from '../services';

/** Carte id → entreprise (pour tri/labels, dérivée une seule fois). */
export const buildCompanyById = () =>
  MOCK_COMPANIES.reduce((acc, company) => {
    acc[company.id] = company;
    return acc;
  }, {});

/** Carte id → agence. */
export const buildAgencyById = () =>
  MOCK_AGENCIES.reduce((acc, agency) => {
    acc[agency.id] = agency;
    return acc;
  }, {});

/** Portée multi-tenant simulée : tout sauf pour super_admin. */
export const getAuditScopeCompanyId = () => {
  const { user, company } = useAuthStore.getState();
  if (!user) return '';
  return user.role === 'super_admin' ? '' : company?.id ?? '';
};

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
 * Hook de liste visible du journal des actions.
 * @returns {object} { items, totalItems, totalPages, page, startIndex }
 */
export const useAuditLogs = () => {
  const logs = useAuditStore((state) => state.logs);
  const search = useAuditStore((state) => state.search);
  const filters = useAuditStore((state) => state.filters);
  const sort = useAuditStore((state) => state.sort);
  const page = useAuditStore((state) => state.pagination.page);
  const pageSize = useAuditStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const scopeCompanyId = getAuditScopeCompanyId();
    const safeFilters = sanitizeAuditFilters({ ...filters, search });
    const filtered = applyAuditFilters(logs, safeFilters, scopeCompanyId);
    const sorted = sortAuditLogs(filtered, sort.by, sort.direction);
    return paginate(sorted, { page, pageSize });
  }, [logs, search, filters, sort, page, pageSize]);
};
