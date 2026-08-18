/**
 * Navix Management — useDriverProfile
 * --------------------------------------------------------------------------
 * Chargement du profil du chauffeur connecté.
 */
import { useCallback } from 'react';
import { driverPortalService } from '../services/driverPortalService';
import { useDriverResource } from './useDriverResource';

export const useDriverProfile = () => {
  const fetcher = useCallback(() => driverPortalService.getProfile(), []);

  return useDriverResource(fetcher);
};
