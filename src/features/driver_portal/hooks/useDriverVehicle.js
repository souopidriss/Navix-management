/**
 * Navix Management — useDriverVehicle
 * --------------------------------------------------------------------------
 * Chargement du véhicule assigné au chauffeur connecté.
 */
import { useCallback } from 'react';
import { driverPortalService } from '../services/driverPortalService';
import { useDriverResource } from './useDriverResource';

export const useDriverVehicle = () => {
  const fetcher = useCallback(() => driverPortalService.getVehicle(), []);

  return useDriverResource(fetcher);
};
