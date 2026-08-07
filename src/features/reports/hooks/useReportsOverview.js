/**
 * Navix Reports — useReportsOverview
 * --------------------------------------------------------------------------
 * Aperçu analytique cross-domaines : calcule les KPIs consolidés (flotte,
 * trajets, carburant, entretien, finances) à partir des filtres globaux du
 * store Rapports (période incluse) via le moteur pur `aggregateOverviewReport`.
 * La portée multi-tenant est réactive à l'utilisateur courant (auth store).
 */
import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth';
import { useReportStore } from '../store';
import {
  aggregateOverviewReport,
  resolveReportDateRange,
  buildPreviousRange,
} from '../services';

export const useReportsOverview = () => {
  const filters = useReportStore((state) => state.filters);
  const user = useAuthStore((state) => state.user);
  const company = useAuthStore((state) => state.company);

  const companyScopeId = user && user.role !== 'super_admin' ? company?.id ?? '' : '';

  return useMemo(() => {
    const range = resolveReportDateRange(filters.period, filters.dateFrom, filters.dateTo);
    const previousRange = buildPreviousRange(range);
    return aggregateOverviewReport({ companyScopeId, filters }, range, previousRange);
  }, [filters, companyScopeId]);
};
