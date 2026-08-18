/**
 * Navix Management — useDriverResource
 * --------------------------------------------------------------------------
 * Hook générique de chargement asynchrone pour l'Espace Chauffeur.
 * Le `fetcher` doit être stable (useCallback) ; `deps` déclenche le rechargement.
 */
import { useState, useEffect, useCallback } from 'react';

export const useDriverResource = (fetcher, deps = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetcher());
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des données.');
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...deps]);

  return { data, isLoading, error, refetch: fetchData };
};
