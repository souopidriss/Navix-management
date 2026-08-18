/**
 * Navix Client — Hook useClientDashboard
 * --------------------------------------------------------------------------
 * Charge et expose les données complètes du Dashboard Client.
 * Réagit automatiquement au changement de clientType.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientDashboardService } from '../services/clientDashboardService';

export const useClientDashboard = () => {
  const clientType = useClientStore((state) => state.clientType);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientDashboardService.getDashboardData(clientType);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement du dashboard client.');
    } finally {
      setIsLoading(false);
    }
  }, [clientType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    clientType,
    isEnterprise: clientType === 'enterprise',
    isIndividual: clientType === 'individual',
    client: data?.client || null,
    metrics: data?.metrics || [],
    metricsSecondary: data?.metricsSecondary || [],
    monthlyEvolution: data?.monthlyEvolution || [],
    financialData: data?.financialData || null,
    vehicles: data?.vehicles || [],
    fleetStatus: data?.fleetStatus || null,
    fleetCategories: data?.fleetCategories || [],
    tripsWeekly: data?.tripsWeekly || [],
    tripsOngoing: data?.tripsOngoing || [],
    upcomingTrips: data?.upcomingTrips || [],
    maintenance: data?.maintenance || null,
    alerts: data?.alerts || { critical: 0, warning: 0, info: 0, items: [] },
    recentActivities: data?.recentActivities || [],
    fuelData: data?.fuelData || null,
    financeSummary: data?.financeSummary || null,
    quickActions: data?.quickActions || [],
  };
};

export default useClientDashboard;
