/**
 * Navix Client — Hook useClientTrips
 * --------------------------------------------------------------------------
 * Charge les trajets du Client (isolés multi-tenant) via `clientTripService`
 * et expose les opérations : création, mise à jour, démarrage, clôture,
 * annulation et suppression.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientTripService } from '../services/clientTripService';

export const useClientTrips = () => {
  const clientType = useClientStore((state) => state.clientType);

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientTripService.getAll(clientType);
      setTrips(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos trajets.');
    } finally {
      setIsLoading(false);
    }
  }, [clientType]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const createTrip = useCallback((payload) => clientTripService.create(payload), []);
  const updateTrip = useCallback((id, payload) => clientTripService.update(id, payload), []);
  const startTrip = useCallback((id, payload) => clientTripService.start(id, payload), []);
  const finishTrip = useCallback((id, payload) => clientTripService.finish(id, payload), []);
  const cancelTrip = useCallback((id, payload) => clientTripService.cancel(id, payload), []);
  const deleteTrip = useCallback((id) => clientTripService.remove(id), []);

  return {
    trips,
    isLoading,
    error,
    refetch: fetchTrips,
    createTrip,
    updateTrip,
    startTrip,
    finishTrip,
    cancelTrip,
    deleteTrip,
  };
};

export default useClientTrips;
