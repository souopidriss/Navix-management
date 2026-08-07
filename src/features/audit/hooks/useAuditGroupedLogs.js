/**
 * Navix Audit — Liste regroupée (hook)
 * --------------------------------------------------------------------------
 * Applique les critères courants du store (recherche, filtres, portée
 * multi-tenant) à la liste source, trie par date décroissante puis regroupe
 * selon le critère choisi (date, utilisateur, module, action, ressource,
 * sévérité). Vue « Regroupé » du journal.
 */
import { useMemo } from 'react';
import { useAuditStore } from '../store';
import { sanitizeAuditFilters } from '../schemas';
import { applyAuditFilters, sortAuditLogs, groupAuditLogs } from '../services';
import { getAuditScopeCompanyId } from './useAuditLogs';

export const useAuditGroupedLogs = (groupBy = 'date') => {
  const logs = useAuditStore((state) => state.logs);
  const search = useAuditStore((state) => state.search);
  const filters = useAuditStore((state) => state.filters);

  return useMemo(() => {
    const scopeCompanyId = getAuditScopeCompanyId();
    const safeFilters = sanitizeAuditFilters({ ...filters, search });
    const filtered = applyAuditFilters(logs, safeFilters, scopeCompanyId);
    const sorted = sortAuditLogs(filtered, 'createdAt', 'desc');
    const groups = groupAuditLogs(sorted, groupBy);
    const totalItems = sorted.length;

    return { groups, totalItems, logs: sorted };
  }, [logs, search, filters, groupBy]);
};
