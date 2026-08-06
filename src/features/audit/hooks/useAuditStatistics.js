/**
 * Navix Audit — Statistiques dérivées
 * --------------------------------------------------------------------------
 * Statistiques du journal pour les cartes de la page (AuditOverview).
 * Dérivées localement depuis l'état du store afin de refléter la liste
 * source (portée multi-tenant) sans appel supplémentaire.
 */
import { useMemo } from 'react';
import { SEVERITY_ORDER, getAuditStatus } from '../constants';
import { useAuditStore } from '../store';

export const useAuditStatistics = () => {
  const logs = useAuditStore((state) => state.logs);
  const stats = useAuditStore((state) => state.stats);
  const isLoading = useAuditStore((state) => state.isLoading);

  const derived = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const byStatus = { success: 0, failed: 0, warning: 0, info: 0 };
    const bySeverity = Object.fromEntries(SEVERITY_ORDER.map((level) => [level, 0]));

    logs.forEach((log) => {
      if (byStatus[log.status] !== undefined) byStatus[log.status] += 1;
      if (bySeverity[log.severity] !== undefined) bySeverity[log.severity] += 1;
    });

    return {
      total: logs.length,
      today: logs.filter((log) => log.createdAt.startsWith(today)).length,
      byStatus,
      bySeverity,
      successRate: logs.length > 0 ? Math.round((byStatus.success / logs.length) * 100) : 0,
    };
  }, [logs]);

  const critical = derived.bySeverity.critical ?? stats?.critical ?? 0;

  const cards = useMemo(
    () => [
      {
        key: 'total',
        label: 'Actions enregistrées',
        value: derived.total,
        hint: 'Journal de l’entreprise',
        variant: 'primary',
        icon: 'bi-journal-text',
      },
      {
        key: 'today',
        label: 'Aujourd’hui',
        value: derived.today,
        hint: 'Actions du jour',
        variant: 'info',
        icon: 'bi-calendar-event',
      },
      {
        key: 'success',
        label: 'Succès',
        value: derived.byStatus.success,
        hint: `${derived.successRate} % de réussite`,
        variant: 'success',
        icon: 'bi-check-circle',
      },
      {
        key: 'failed',
        label: 'Échecs',
        value: derived.byStatus.failed,
        hint: 'À examiner',
        variant: 'danger',
        icon: 'bi-x-octagon',
      },
    ],
    [derived],
  );

  const alerts = useMemo(
    () => [
      {
        key: 'critical',
        label: 'Critiques',
        value: critical,
        variant: 'danger',
        icon: 'bi-shield-exclamation',
      },
      {
        key: 'high',
        label: 'Hautes',
        value: derived.bySeverity.high,
        variant: 'warning',
        icon: 'bi-exclamation-triangle',
      },
    ],
    [critical, derived.bySeverity],
  );

  return {
    stats,
    derived,
    cards,
    alerts,
    severityOrder: SEVERITY_ORDER,
    getStatusMeta: getAuditStatus,
    isLoading,
  };
};
