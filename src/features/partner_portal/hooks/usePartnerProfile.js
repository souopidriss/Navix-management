/**
 * Navix Partner Portal — usePartnerProfile (PROMPT 061)
 * --------------------------------------------------------------------------
 * Hook d'accès au profil utilisateur partenaire (lecture simulée via le
 * service central du portail partenaire).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { partnerPortalService } from '../services/partnerPortalService';

const usePartnerProfile = () => {
  const [profile, setProfile] = useState(null);
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
      const data = await partnerPortalService.getProfile();
      if (!mountedRef.current) return;
      setProfile(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Impossible de charger le profil.');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { profile, isLoading, error, refetch };
};

export default usePartnerProfile;
