/**
 * Navix Partner Portal — Hook usePartnerAnalytics
 * --------------------------------------------------------------------------
 * Hook principal pour la page Performance & Analytics Partenaire.
 * Agrège toutes les métriques de performance (READ-ONLY).
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { partnerAnalyticsService } from '../services/partnerAnalyticsService';

export const usePartnerAnalytics = (initialFilters = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentFilters = filtersRef.current;
      const result = await partnerAnalyticsService.getAnalyticsData(currentFilters);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger les données de performance.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, filters.period]);

  const kpis = useMemo(() => data?.kpis || null, [data]);
  const revenuePerformance = useMemo(() => data?.revenuePerformance || null, [data]);
  const missionPerformance = useMemo(() => data?.missionPerformance || null, [data]);
  const requestPerformance = useMemo(() => data?.requestPerformance || null, [data]);
  const clientPerformance = useMemo(() => data?.clientPerformance || null, [data]);
  const vehiclePerformance = useMemo(() => data?.vehiclePerformance || null, [data]);
  const contractPerformance = useMemo(() => data?.contractPerformance || null, [data]);
  const invoicePerformance = useMemo(() => data?.invoicePerformance || null, [data]);
  const financialPerformance = useMemo(() => data?.financialPerformance || null, [data]);
  const operationalPerformance = useMemo(() => data?.operationalPerformance || null, [data]);
  const prestations = useMemo(() => data?.prestations || [], [data]);
  const activityDistribution = useMemo(() => data?.activityDistribution || null, [data]);
  const insights = useMemo(() => data?.insights || [], [data]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    filters,
    setFilters: updateFilters,
    kpis,
    revenuePerformance,
    missionPerformance,
    requestPerformance,
    clientPerformance,
    vehiclePerformance,
    contractPerformance,
    invoicePerformance,
    financialPerformance,
    operationalPerformance,
    prestations,
    activityDistribution,
    insights,
  };
};

export default usePartnerAnalytics;
