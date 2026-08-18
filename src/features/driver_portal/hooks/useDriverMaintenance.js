/**
 * Navix Management — useDriverMaintenance
 * --------------------------------------------------------------------------
 * Chargement des entretiens liés au véhicule assigné.
 */
import { useCallback } from 'react';
import { driverPortalService } from '../services/driverPortalService';
import { useDriverResource } from './useDriverResource';

export const useDriverMaintenance = () => {
  const fetcher = useCallback(() => driverPortalService.getMaintenanceRecords(), []);

  return useDriverResource(fetcher);
};
