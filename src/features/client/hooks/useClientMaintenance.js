/**
 * Navix Client — Hook useClientMaintenance
 * --------------------------------------------------------------------------
 * Charge les entretiens du Client (isolés multi-tenant) via
 * `clientMaintenanceService` et expose les opérations : création, mise à
 * jour, clôture, annulation et suppression.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientMaintenanceService } from '../services/clientMaintenanceService';

export const useClientMaintenance = () => {
  const clientType = useClientStore((state) => state.clientType);

  const [maintenance, setMaintenance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaintenance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientMaintenanceService.getAll(clientType);
      setMaintenance(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos entretiens.');
    } finally {
      setIsLoading(false);
    }
  }, [clientType]);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const createMaintenance = useCallback((payload) => clientMaintenanceService.create(payload), []);
  const updateMaintenance = useCallback((id, payload) => clientMaintenanceService.update(id, payload), []);
  const completeMaintenance = useCallback((id, payload) => clientMaintenanceService.complete(id, payload), []);
  const cancelMaintenance = useCallback((id, payload) => clientMaintenanceService.cancel(id, payload), []);
  const deleteMaintenance = useCallback((id) => clientMaintenanceService.remove(id), []);

  return {
    maintenance,
    isLoading,
    error,
    refetch: fetchMaintenance,
    createMaintenance,
    updateMaintenance,
    completeMaintenance,
    cancelMaintenance,
    deleteMaintenance,
  };
};

export default useClientMaintenance;
