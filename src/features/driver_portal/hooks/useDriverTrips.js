/**
 * Navix Management — useDriverTrips / useDriverTripDetails
 * --------------------------------------------------------------------------
 * Chargement des trajets du chauffeur et du détail d'un trajet.
 */
import { useCallback } from 'react';
import { driverPortalService } from '../services/driverPortalService';
import { useDriverResource } from './useDriverResource';

export const useDriverTrips = () => {
  const fetcher = useCallback(() => driverPortalService.getTrips(), []);

  return useDriverResource(fetcher);
};

export const useDriverTripDetails = (id) => {
  const fetcher = useCallback(() => driverPortalService.getTripById(id), [id]);

  return useDriverResource(fetcher, [id]);
};
