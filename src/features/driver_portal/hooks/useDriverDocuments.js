/**
 * Navix Management — useDriverDocuments
 * --------------------------------------------------------------------------
 * Chargement des documents du chauffeur et de son véhicule.
 */
import { useCallback } from 'react';
import { driverPortalService } from '../services/driverPortalService';
import { useDriverResource } from './useDriverResource';

export const useDriverDocuments = () => {
  const fetcher = useCallback(() => driverPortalService.getDocuments(), []);

  return useDriverResource(fetcher);
};
