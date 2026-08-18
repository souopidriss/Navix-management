/**
 * Navix Management — useDriverFuel
 * --------------------------------------------------------------------------
 * Chargement des pleins de carburant du véhicule assigné.
 */
import { useCallback } from 'react';
import { driverPortalService } from '../services/driverPortalService';
import { useDriverResource } from './useDriverResource';

export const useDriverFuel = () => {
  const fetcher = useCallback(() => driverPortalService.getFuelRecords(), []);

  return useDriverResource(fetcher);
};
