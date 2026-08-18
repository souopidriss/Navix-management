/**
 * Navix Client — Hook useClientVehicle
 * --------------------------------------------------------------------------
 * Charge le détail d'un véhicule du Client (isolé multi-tenant) via
 * `clientVehicleService`. Gère les états chargement / erreur / introuvable.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientVehicleService } from '../services/clientVehicleService';

export const useClientVehicle = (id) => {
  const clientType = useClientStore((state) => state.clientType);

  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicle = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientVehicleService.getById(id, clientType);
      setVehicle(result);
    } catch (err) {
      setVehicle(null);
      setError(err?.message || 'Véhicule introuvable.');
    } finally {
      setIsLoading(false);
    }
  }, [id, clientType]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  return {
    vehicle,
    isLoading,
    error,
    refetch: fetchVehicle,
  };
};

export default useClientVehicle;
