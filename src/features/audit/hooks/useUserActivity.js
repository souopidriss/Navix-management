/**
 * Navix Audit — Activité d'un utilisateur (hook)
 * --------------------------------------------------------------------------
 * Charge l'activité d'un utilisateur donné (portée multi-tenant simulée :
 * un utilisateur non super-admin ne voit que son entreprise) et en dérive
 * des indicateurs : total, échecs, critiques, familles d'actions, dernière
 * activité. Consommé par la page « Activité de l'utilisateur ».
 */
import { useMemo } from 'react';
import { getUser } from '../constants';
import { getUserAuditLogs } from '../services';
import { getAuditScopeCompanyId } from './useAuditLogs';

export const useUserActivity = (userId) => {
  const logs = useMemo(
    () => (userId ? getUserAuditLogs(userId, getAuditScopeCompanyId()) : []),
    [userId],
  );

  const user = getUser(userId);

  const summary = useMemo(() => {
    const byStatus = { success: 0, failed: 0, warning: 0, info: 0 };
    const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    const byModule = {};

    logs.forEach((log) => {
      if (byStatus[log.status] !== undefined) byStatus[log.status] += 1;
      if (bySeverity[log.severity] !== undefined) bySeverity[log.severity] += 1;
      byModule[log.actionType] = (byModule[log.actionType] ?? 0) + 1;
    });

    return {
      total: logs.length,
      byStatus,
      bySeverity,
      byModule,
      lastActive: logs[0]?.createdAt ?? null,
    };
  }, [logs]);

  return { user, logs, summary };
};
