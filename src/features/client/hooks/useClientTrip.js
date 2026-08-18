/**
 * Navix Client — Hook useClientTrip
 * --------------------------------------------------------------------------
 * Charge le détail d'un trajet du Client (isolé multi-tenant) via
 * `clientTripService`. Gère les états chargement / erreur / introuvable.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientTripService } from '../services/clientTripService';

export const useClientTrip = (id) => {
  const clientType = useClientStore((state) => state.clientType);

  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrip = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientTripService.getById(id, clientType);
      setTrip(result);
    } catch (err) {
      setTrip(null);
      setError(err?.message || 'Trajet introuvable.');
    } finally {
      setIsLoading(false);
    }
  }, [id, clientType]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  return {
    trip,
    isLoading,
    error,
    refetch: fetchTrip,
  };
};

export default useClientTrip;
