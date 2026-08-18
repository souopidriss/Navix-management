/**
 * Navix Client — Hook useClientDriver
 * --------------------------------------------------------------------------
 * Charge le détail d'un chauffeur du Client (isolé multi-tenant) via
 * `clientDriverService`. Gère les états chargement / erreur / introuvable.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientDriverService } from '../services/clientDriverService';

export const useClientDriver = (id) => {
  const clientType = useClientStore((state) => state.clientType);

  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDriver = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientDriverService.getById(id, clientType);
      setDriver(result);
    } catch (err) {
      setDriver(null);
      setError(err?.message || 'Chauffeur introuvable.');
    } finally {
      setIsLoading(false);
    }
  }, [id, clientType]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  return {
    driver,
    isLoading,
    error,
    refetch: fetchDriver,
  };
};

export default useClientDriver;
