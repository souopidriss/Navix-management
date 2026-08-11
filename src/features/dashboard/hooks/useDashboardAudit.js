/**
 * Navix Dashboard — Audit récent (hook)
 * --------------------------------------------------------------------------
 * Alimente la carte « Journal des actions » du tableau de bord à partir du
 * store audit (déjà borné à la portée multi-tenant de l'utilisateur courant).
 * Déclenche le chargement du journal une seule fois par cycle de vie du store
 * (`logsLoaded`) et uniquement si l'utilisateur dispose de `audit.view`.
 *
 * Une liste vide (`logs = []`) est un résultat valide : « aucun log » n'est
 * pas rechargé. La boucle useEffect → fetchLogs → setState → useEffect est
 * ainsi impossible, y compris sous React StrictMode.
 */
import { useEffect, useMemo } from 'react';
import { useAuditStore } from '@/features/audit';
import { useAuditPermissions } from '@/features/audit/hooks';

export const useDashboardAudit = (limit = 5) => {
  const logs = useAuditStore((state) => state.logs);
  const logsLoaded = useAuditStore((state) => state.logsLoaded);
  const isLoading = useAuditStore((state) => state.isLoading);
  const fetchLogs = useAuditStore((state) => state.fetchLogs);
  const { canView } = useAuditPermissions();

  useEffect(() => {
    if (!canView || logsLoaded || isLoading) return;
    fetchLogs();
  }, [canView, logsLoaded, isLoading, fetchLogs]);

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
