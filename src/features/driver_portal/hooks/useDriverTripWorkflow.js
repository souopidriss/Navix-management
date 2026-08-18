/**
 * Navix Management — useDriverTripWorkflow
 * --------------------------------------------------------------------------
 * Couche opérationnelle des trajets de l'Espace Chauffeur : état du trajet
 * actif / prochain / dernier, transitions (démarrer, pause, reprendre,
 * terminer), signalement d'incident et modales associées. Toutes les actions
 * passent par `driverPortalService` (jamais les mocks directement) puis
 * rafraîchissent la liste pour synchroniser l'ensemble des écrans.
 */
import { useCallback, useMemo, useState } from 'react';
import { driverPortalService } from '../services/driverPortalService';
import { useDriverResource } from './useDriverResource';
import { canTransitionDriverTrip, selectDriverActiveTrip } from '../constants/driver.constants';

export const useDriverTripWorkflow = () => {
  const [modal, setModal] = useState(null); // 'start' | 'incident' | 'complete'
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetcher = useCallback(() => driverPortalService.getDriverTrips(), []);
  const { data, isLoading, error, refetch } = useDriverResource(fetcher);

  const trips = useMemo(() => data ?? [], [data]);
  const activeTrip = useMemo(() => selectDriverActiveTrip(trips), [trips]);
  const nextTrip = useMemo(() => trips.find((trip) => trip.status === 'planned') ?? null, [trips]);
  const lastTrip = useMemo(() => trips.find((trip) => trip.status === 'completed') ?? null, [trips]);

  const openModal = useCallback((kind, trip) => {
    setSelectedTrip(trip);
    setSubmitError('');
    setModal(kind);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setSelectedTrip(null);
    setSubmitError('');
  }, []);

  /** Ouvre la modale de démarrage à partir d'un identifiant de trajet. */
  const startTrip = useCallback(
    (tripId) => {
      const trip = trips.find((item) => item.id === tripId) ?? null;
      if (trip) openModal('start', trip);
    },
    [trips, openModal],
  );

  const openIncident = useCallback((trip) => openModal('incident', trip), [openModal]);
  const openComplete = useCallback((trip) => openModal('complete', trip), [openModal]);

  /** Exécute une mutation du workflow puis rafraîchit la liste. */
  const runMutation = useCallback(
    async (action) => {
      setIsSubmitting(true);
      setSubmitError('');
      try {
        const result = await action();
        if (result.success) {
          await refetch();
        } else {
          setSubmitError(result.error || 'Action impossible.');
        }
        return result;
      } catch (err) {
        const message = err?.message || 'Une erreur est survenue.';
        setSubmitError(message);
        return { success: false, error: message };
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch],
  );

  const submitStart = useCallback(
    (payload) => runMutation(() => driverPortalService.startTrip(payload)),
    [runMutation],
  );

  const submitPause = useCallback(
    (tripId) => runMutation(() => driverPortalService.pauseTrip(tripId)),
    [runMutation],
  );

  const submitResume = useCallback(
    (tripId) => runMutation(() => driverPortalService.resumeTrip(tripId)),
    [runMutation],
  );

  const submitIncident = useCallback(
    (payload) => runMutation(() => driverPortalService.reportIncident(payload)),
    [runMutation],
  );

  const submitComplete = useCallback(
    (payload) => runMutation(() => driverPortalService.completeTrip(payload)),
    [runMutation],
  );

  const canStart = useCallback((trip) => canTransitionDriverTrip(trip?.status, 'in_progress'), []);
  const canPause = useCallback((trip) => trip?.status === 'in_progress', []);
  const canResume = useCallback(
    (trip) => trip?.status === 'suspended' && trip.pausedByDriver,
    [],
  );
  const canComplete = useCallback((trip) => canTransitionDriverTrip(trip?.status, 'completed'), []);

  return {
    trips,
    activeTrip,
    nextTrip,
    lastTrip,
    isLoading,
    error,
    refetch,

    modal,
    selectedTrip,
    isSubmitting,
    submitError,
    startTrip,
    openIncident,
    openComplete,
    closeModal,

    submitStart,
    submitPause,
    submitResume,
    submitIncident,
    submitComplete,

    canStart,
    canPause,
    canResume,
    canComplete,
  };
};
