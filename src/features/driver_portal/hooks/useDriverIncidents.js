/**
 * Navix Management — useDriverIncidents
 * --------------------------------------------------------------------------
 * Chargement et signalement des incidents du chauffeur connecté.
 */
import { useState, useCallback } from 'react';
import { driverPortalService } from '../services/driverPortalService';
import { useDriverResource } from './useDriverResource';

export const useDriverIncidents = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetcher = useCallback(() => driverPortalService.getIncidents(), []);
  const { data, isLoading, error, refetch } = useDriverResource(fetcher);

  const createIncident = useCallback(
    async (incidentData) => {
      setIsSubmitting(true);
      setSubmitError('');
      try {
        const result = await driverPortalService.createIncident(incidentData);
        await refetch();
        return result;
      } catch (err) {
        const message = err?.message || 'Impossible de signaler l\u2019incident.';
        setSubmitError(message);
        return { success: false, error: message };
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch],
  );

  return {
    incidents: data ?? [],
    isLoading,
    error,
    refetch,
    createIncident,
    isSubmitting,
    submitError,
  };
};
