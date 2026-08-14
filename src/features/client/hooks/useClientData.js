/**
 * Navix Client — Hook custom useClientData
 * --------------------------------------------------------------------------
 * Permet aux composants d'accéder facilement à l'état du Client
 * et de piloter le type de client (Entreprise vs Particulier).
 */
import { useEffect } from 'react';
import { useClientStore } from '../store/client.store';

export const useClientData = () => {
  const clientType = useClientStore((state) => state.clientType);
  const currentClient = useClientStore((state) => state.currentClient);
  const dashboardData = useClientStore((state) => state.dashboardData);
  const isLoading = useClientStore((state) => state.isLoading);
  const error = useClientStore((state) => state.error);
  const setClientType = useClientStore((state) => state.setClientType);
  const fetchDashboard = useClientStore((state) => state.fetchDashboard);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    clientType,
    currentClient,
    dashboardData,
    isLoading,
    error,
    setClientType,
    refetch: fetchDashboard,
    isEnterprise: clientType === 'enterprise',
    isIndividual: clientType === 'individual',
  };
};

export default useClientData;
