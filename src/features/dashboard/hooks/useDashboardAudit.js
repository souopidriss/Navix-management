/**
 * Navix Dashboard — Audit récent (hook)
 * --------------------------------------------------------------------------
 * Alimente la carte « Journal des actions » du tableau de bord à partir du
 * store audit (déjà borné à la portée multi-tenant de l'utilisateur courant).
 * Déclenche le chargement du journal uniquement s'il n'a pas encore été
 * chargé et si l'utilisateur dispose de `audit.view`.
 */
import { useEffect, useMemo } from 'react';
import { useAuditStore } from '@/features/audit';
import { useAuditPermissions } from '@/features/audit/hooks';

export const useDashboardAudit = (limit = 5) => {
  const logs = useAuditStore((state) => state.logs);
  const isLoading = useAuditStore((state) => state.isLoading);
  const fetchLogs = useAuditStore((state) => state.fetchLogs);
  const { canView } = useAuditPermissions();

  useEffect(() => {
    if (canView && logs.length === 0 && !isLoading) fetchLogs();
  }, [canView, logs.length, isLoading, fetchLogs]);

  return useMemo(() => {
    const recent = logs.slice(0, limit);
    const critical = logs.filter((log) => log.severity === 'critical').length;
    const failed = logs.filter((log) => log.status === 'failed').length;

    return {
      recent,
      critical,
      failed,
      total: logs.length,
      isLoading,
      canView,
    };
  }, [logs, limit, isLoading, canView]);
};
