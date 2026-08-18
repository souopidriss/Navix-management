/**
 * Navix Partner Portal — usePartnerPreferences (PROMPT 061)
 * --------------------------------------------------------------------------
 * Hook d'accès aux préférences de l'espace partenaire (notifications email /
 * push / in-app, langue, thème). Persistance simulée via le service de
 * notifications partenaire.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { partnerNotificationService } from '../services/partnerNotificationService';

const usePartnerPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await partnerNotificationService.getPreferences();
      if (!mountedRef.current) return;
      setPreferences(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Impossible de charger les préférences.');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updatePreferences = useCallback(async (patch = {}) => {
    const data = await partnerNotificationService.updatePreferences(patch);
    setPreferences(data);
    return data;
  }, []);

  return { preferences, isLoading, error, refetch, updatePreferences };
};

export default usePartnerPreferences;
