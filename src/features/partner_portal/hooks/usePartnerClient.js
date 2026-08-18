/**
 * Navix Partner Portal — Hook usePartnerClient (PROMPT 065)
 * --------------------------------------------------------------------------
 * Charge le détail d'un client partenaire (isolé multi-tenant) : fiche client,
 * statistiques d'activité & finance (FCFA) et missions réelles du module
 * Missions. Expose aussi la mise à jour et l'archivage.
 */
import { useState, useEffect, useCallback } from 'react';
import { partnerClientService } from '../services/partnerClientService';

export const usePartnerClient = (clientId) => {
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState(null);
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [clientResult, statsResult, missionsResult] = await Promise.all([
        partnerClientService.getClientById(clientId),
        partnerClientService.getClientStats(clientId),
        partnerClientService.getClientMissions(clientId),
      ]);
      setClient(clientResult);
      setStats(statsResult);
      setMissions(missionsResult);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateClient = useCallback(
    (payload) => partnerClientService.updateClient(clientId, payload),
    [clientId],
  );
  const archiveClient = useCallback(() => partnerClientService.archiveClient(clientId), [clientId]);

  return {
    client,
    stats,
    missions,
    isLoading,
    error,
    refetch,
    updateClient,
    archiveClient,
  };
};

export default usePartnerClient;
