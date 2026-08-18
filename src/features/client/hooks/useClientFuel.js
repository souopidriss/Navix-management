/**
 * Navix Client — Hook useClientFuel
 * --------------------------------------------------------------------------
 * Charge les pleins de carburant du Client (isolés multi-tenant) via
 * `clientFuelService` et expose les opérations : enregistrement, mise à
 * jour, validation, annulation et suppression.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientFuelService } from '../services/clientFuelService';

export const useClientFuel = () => {
  const clientType = useClientStore((state) => state.clientType);

  const [fuel, setFuel] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFuel = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientFuelService.getAll(clientType);
      setFuel(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos pleins de carburant.');
    } finally {
      setIsLoading(false);
    }
  }, [clientType]);

  useEffect(() => {
    fetchFuel();
  }, [fetchFuel]);

  const createFuel = useCallback((payload) => clientFuelService.create(payload), []);
  const updateFuel = useCallback((id, payload) => clientFuelService.update(id, payload), []);
  const validateFuel = useCallback((id) => clientFuelService.validate(id), []);
  const cancelFuel = useCallback((id, payload) => clientFuelService.cancel(id, payload), []);
  const deleteFuel = useCallback((id) => clientFuelService.remove(id), []);

  return {
    fuel,
    isLoading,
    error,
    refetch: fetchFuel,
    createFuel,
    updateFuel,
    validateFuel,
    cancelFuel,
    deleteFuel,
  };
};

export default useClientFuel;
