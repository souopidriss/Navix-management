/**
 * Navix Client — Hook useClientDrivers
 * --------------------------------------------------------------------------
 * Charge la liste des chauffeurs du Client (isolée multi-tenant) via
 * `clientDriverService` et expose les opérations CRUD + statut + disponibilité.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientDriverService } from '../services/clientDriverService';

export const useClientDrivers = () => {
  const clientType = useClientStore((state) => state.clientType);

  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientDriverService.getAll(clientType);
      setDrivers(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos chauffeurs.');
    } finally {
      setIsLoading(false);
    }
  }, [clientType]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const createDriver = useCallback((payload) => clientDriverService.create(payload), []);
  const updateDriver = useCallback((id, payload) => clientDriverService.update(id, payload), []);
  const updateDriverStatus = useCallback((id, status) => clientDriverService.updateStatus(id, status), []);
  const updateDriverAvailability = useCallback(
    (id, availability) => clientDriverService.updateAvailability(id, availability),
    [],
  );
  const deleteDriver = useCallback((id) => clientDriverService.remove(id), []);

  return {
    drivers,
    isLoading,
    error,
    refetch: fetchDrivers,
    createDriver,
    updateDriver,
    updateDriverStatus,
    updateDriverAvailability,
    deleteDriver,
  };
};

export default useClientDrivers;
