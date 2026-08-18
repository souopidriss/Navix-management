/**
 * Navix Partner Portal — Hook usePartnerDashboard
 * --------------------------------------------------------------------------
 * Charge et expose les données complètes du Dashboard Partenaire.
 */
import { useState, useEffect, useCallback } from 'react';
import { partnerDashboardService } from '../services/partnerDashboardService';

export const usePartnerDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await partnerDashboardService.getDashboardData();
      setData(result);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement du dashboard partenaire.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    partner: data?.partner || null,
    kpis: data?.kpis || null,
    metrics: data?.metrics || [],
    metricsSecondary: data?.metricsSecondary || [],
    stats: data?.stats || [],
    fleetStatus: data?.fleetStatus || null,
    vehicles: data?.vehicles || [],
    missions: data?.missions || [],
    clients: data?.clients || [],
    alerts: data?.alerts || { critical: 0, warning: 0, info: 0, items: [] },
    recentActivities: data?.recentActivities || [],
    revenueEvolution: data?.revenueEvolution || null,
    activityDistribution: data?.activityDistribution || null,
    vehiclePerformance: data?.vehiclePerformance || [],
    financeSummary: data?.financeSummary || null,
    quickActions: data?.quickActions || [],
  };
};

export default usePartnerDashboard;
