/**
 * Navix Audit — Activité d'une ressource (hook)
 * --------------------------------------------------------------------------
 * Charge les entrées du journal liées à une ressource (type + identifiant),
 * portée multi-tenant simulée. Consommé par les fiches métier
 * (véhicule, chauffeur, …) via le composant AuditResourceActivity.
 */
import { useMemo } from 'react';
import { getResourceAuditLogs } from '../services';
import { getAuditScopeCompanyId } from './useAuditLogs';

export const useResourceActivity = ({ resourceType, resourceId }, { limit = 5 } = {}) => {
  const logs = useMemo(
    () =>
      resourceType && resourceId
        ? getResourceAuditLogs({ resourceType, resourceId }, getAuditScopeCompanyId())
        : [],
    [resourceType, resourceId],
  );

  return {
    logs,
    recent: logs.slice(0, limit),
    total: logs.length,
  };
};
