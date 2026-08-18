/**
 * Navix Client — Hook useClientVehicles
 * --------------------------------------------------------------------------
 * Charge la flotte complète du Client (isolée multi-tenant) via
 * `clientVehicleService` et expose les opérations CRUD + changement de statut.
 * Réagit automatiquement au changement de clientType (Entreprise / Particulier).
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientVehicleService } from '../services/clientVehicleService';

export const useClientVehicles = () => {
  const clientType = useClientStore((state) => state.clientType);

  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientVehicleService.getAll(clientType);
      setVehicles(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger votre flotte.');
    } finally {
      setIsLoading(false);
    }
  }, [clientType]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const createVehicle = useCallback((payload) => clientVehicleService.create(payload), []);
  const updateVehicle = useCallback((id, payload) => clientVehicleService.update(id, payload), []);
  const updateVehicleStatus = useCallback((id, status) => clientVehicleService.updateStatus(id, status), []);
  const deleteVehicle = useCallback((id) => clientVehicleService.remove(id), []);

  return {
    vehicles,
    isLoading,
    error,
    refetch: fetchVehicles,
    createVehicle,
    updateVehicle,
    updateVehicleStatus,
    deleteVehicle,
  };
};

export default useClientVehicles;
