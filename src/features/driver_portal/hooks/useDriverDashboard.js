/**
 * Navix Management — useDriverDashboard Hook
 * --------------------------------------------------------------------------
 * Gère l'état et le cycle de vie des données du Dashboard Chauffeur.
 */
import { useState, useEffect, useCallback } from 'react';
import { driverDashboardService } from '../services/driverDashboardService';

export const useDriverDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await driverDashboardService.getDashboardData();
      setData(response);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des données.');
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

    // Déstructuration utilitaire
    driver: data?.driver || null,
    metrics: data?.metrics || [],
    vehicle: data?.vehicle || null,
    nextTrip: data?.nextTrip || null,
    recentTrips: data?.recentTrips || [],
    activityEvolution: data?.activityEvolution || [],
    fuelData: data?.fuelData || null,
    alerts: data?.alerts || [],
    maintenances: data?.maintenances || [],
    documents: data?.documents || [],
    quickActions: data?.quickActions || [],
  };
};
