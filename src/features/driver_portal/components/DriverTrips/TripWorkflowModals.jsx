/**
 * Navix Driver Portal — TripWorkflowModals
 * --------------------------------------------------------------------------
 * Modales premium du workflow trajet, pilotées par `useDriverTripWorkflow` :
 *   - Démarrer un trajet (kilométrage de départ)
 *   - Signaler un incident (formulaire rapide, lié au trajet en cours)
 *   - Terminer un trajet (kilométrage d'arrivée + bilan)
 *
 * Les trois formulaires passent par `useZodForm` (validation Zod) : les
 * erreurs de champ sont affichées en direct sous chaque contrôle et le
 * kilométrage est validé par schéma avant envoi au service.
 */
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatDate, formatNumber } from '@/utils/format';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth/hooks/useZodForm';
import { INCIDENT_TYPES, INCIDENT_SEVERITIES } from '../../constants/driver.constants';
import {
  startTripSchema,
  completeTripSchema,
  incidentSchema,
} from '../../schemas/driver.schemas';

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const nowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const toOptions = (map) => Object.entries(map).map(([value, meta]) => ({ value, label: meta.label }));

const startDefaults = (trip, lastTrip) => {
  const fromTrip = Number(trip?.departureMileage) || 0;
  const fromLast = Number(lastTrip?.arrivalMileage) || 0;
  const prefill = Math.max(fromTrip, fromLast);
  return { tripId: trip?.id ?? '', departureMileage: prefill ? String(prefill) : '' };
};

const completeDefaults = (trip) => {
  const departure = Number(trip?.departureMileage) || 0;
  const suggested = departure + (Number(trip?.plannedDistance) || 0);
  return {
    tripId: trip?.id ?? '',
    departureMileage: departure ? String(departure) : '',
    arrivalMileage: suggested ? String(suggested) : '',
  };
};

const incidentDefaults = (trip) => ({
  tripId: trip?.id ?? '',
  type: 'panne',
  severity: 'medium',
  date: todayKey(),
  time: nowTime(),
  location: '',
  description: '',
});

const TripWorkflowModals = ({ workflow, onSuccess }) => {
  const {
    modal,
    selectedTrip,
    isSubmitting,
    submitError,
    closeModal,
    submitStart,
    submitIncident,
    submitComplete,
    lastTrip,
  } = workflow;

  const start = useZodForm({
    schema: startTripSchema,
    defaultValues: startDefaults(null, null),
    onSubmit: async (values) => {
      const result = await submitStart(values);
      if (result.success) {
        toast.success(result.message);
        closeModal();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Impossible de démarrer le trajet.');
      }
    },
  });

  const incident = useZodForm({
    schema: incidentSchema,
    defaultValues: incidentDefaults(null),
    onSubmit: async (values) => {
      const result = await submitIncident(values);
      if (result.success) {
        toast.success(result.message);
        closeModal();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Impossible d\u2019enregistrer l\u2019incident.');
      }
    },
  });

  const complete = useZodForm({
    schema: completeTripSchema,
    defaultValues: completeDefaults(null),
    onSubmit: async (values) => {
      const result = await submitComplete(values);
      if (result.success) {
        toast.success(result.message);
        closeModal();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Impossible de terminer le trajet.');
      }
    },
  });

  useEffect(() => {
    if (!selectedTrip) return;
    start.reset(startDefaults(selectedTrip, lastTrip));
    complete.reset(completeDefaults(selectedTrip));
    incident.reset(incidentDefaults(selectedTrip));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrip]);

  const departureMinimum = Math.max(
    Number(selectedTrip?.departureMileage) || 0,
    Number(lastTrip?.arrivalMileage) || 0,
  );
  const completeMinimum = Number(selectedTrip?.departureMileage) || 0;

  return (
    <>
      {/* ── Démarrer un trajet ─────────────────────────────────────────── */}
      <FormModal
        open={modal === 'start' && Boolean(selectedTrip)}
        onClose={closeModal}
        title="Démarrer le trajet"
        subtitle={`${selectedTrip?.tripNumber} — ${selectedTrip?.departure} → ${selectedTrip?.arrival}`}
        icon="bi-play-circle"
        size="lg"
        onSubmit={start.handleSubmit}
        loading={isSubmitting}
        submitLabel="Démarrer le trajet"
        submitIcon="bi-play-fill"
        error={submitError || undefined}
      >
        <div className="d-flex flex-wrap gap-4 mb-3 small">
          <span className="d-flex align-items-center gap-2 text-muted">
            <i className="bi bi-calendar-event" aria-hidden="true" />
            {formatDate(selectedTrip?.departureDate)} à {selectedTrip?.departureTime}
          </span>
          <span className="d-flex align-items-center gap-2 text-muted">
            <i className="bi bi-people" aria-hidden="true" />
            {formatNumber(selectedTrip?.passengerCount)} passagers
          </span>
          <span className="d-flex align-items-center gap-2 text-muted">
            <i className="bi bi-box-seam" aria-hidden="true" />
            {formatNumber(selectedTrip?.cargoWeight)} kg
          </span>
        </div>

        <label htmlFor="start-mileage" className="form-label fw-semibold">
          Kilométrage de départ
        </label>
        <input
          id="start-mileage"
          type="number"
          min={departureMinimum || undefined}
          className={`form-control form-control-lg${start.errors.departureMileage ? ' is-invalid' : ''}`}
          placeholder="Ex. 8 562"
          value={start.values.departureMileage}
          onChange={(event) => start.setField('departureMileage', event.target.value)}
        />
        {start.errors.departureMileage ? (
          <div className="invalid-feedback">{start.errors.departureMileage}</div>
        ) : (
          <div className="form-text">
            Minimum : {formatNumber(departureMinimum)} km (dernier kilométrage connu).
          </div>
        )}
      </FormModal>

      {/* ── Signaler un incident ───────────────────────────────────────── */}
      <FormModal
        open={modal === 'incident' && Boolean(selectedTrip)}
        onClose={closeModal}
        title="Signaler un incident"
        subtitle={`Trajet en cours ${selectedTrip?.tripNumber} — ${selectedTrip?.departure} → ${selectedTrip?.arrival}`}
        icon="bi-shield-exclamation"
        size="lg"
        onSubmit={incident.handleSubmit}
        loading={isSubmitting}
        submitLabel="Enregistrer l\u2019incident"
        submitIcon="bi-flag"
        error={submitError || undefined}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="wf-incident-type" className="form-label">
              Type d\u2019incident
            </label>
            <select
              id="wf-incident-type"
              className="form-select"
              value={incident.values.type}
              onChange={(event) => incident.setField('type', event.target.value)}
            >
              {toOptions(INCIDENT_TYPES).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="wf-incident-severity" className="form-label">
              Gravité
            </label>
            <select
              id="wf-incident-severity"
              className="form-select"
              value={incident.values.severity}
              onChange={(event) => incident.setField('severity', event.target.value)}
            >
              {toOptions(INCIDENT_SEVERITIES).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <label htmlFor="wf-incident-location" className="form-label">
              Lieu
            </label>
            <input
              id="wf-incident-location"
              type="text"
              className={`form-control${incident.errors.location ? ' is-invalid' : ''}`}
              placeholder="Ex. N3 — péage de Bonabéri, Douala"
              value={incident.values.location}
              onChange={(event) => incident.setField('location', event.target.value)}
            />
            {incident.errors.location && (
              <div className="invalid-feedback">{incident.errors.location}</div>
            )}
          </div>

          <div className="col-12">
            <label htmlFor="wf-incident-description" className="form-label">
              Description
            </label>
            <textarea
              id="wf-incident-description"
              className={`form-control${incident.errors.description ? ' is-invalid' : ''}`}
              rows={3}
              placeholder="Décrivez les circonstances de l\u2019incident…"
              value={incident.values.description}
              onChange={(event) => incident.setField('description', event.target.value)}
            />
            {incident.errors.description && (
              <div className="invalid-feedback">{incident.errors.description}</div>
            )}
          </div>
        </div>
      </FormModal>

      {/* ── Terminer un trajet ─────────────────────────────────────────── */}
      <FormModal
        open={modal === 'complete' && Boolean(selectedTrip)}
        onClose={closeModal}
        title="Terminer le trajet"
        subtitle={`${selectedTrip?.tripNumber} — ${selectedTrip?.departure} → ${selectedTrip?.arrival}`}
        icon="bi-check2-circle"
        size="lg"
        onSubmit={complete.handleSubmit}
        loading={isSubmitting}
        submitLabel="Terminer le trajet"
        submitIcon="bi-flag"
        error={submitError || undefined}
      >
        <label htmlFor="complete-mileage" className="form-label fw-semibold">
          Kilométrage d\u2019arrivée
        </label>
        <input
          id="complete-mileage"
          type="number"
          min={completeMinimum || undefined}
          className={`form-control form-control-lg${complete.errors.arrivalMileage ? ' is-invalid' : ''}`}
          placeholder="Ex. 8 800"
          value={complete.values.arrivalMileage}
          onChange={(event) => complete.setField('arrivalMileage', event.target.value)}
        />
        {complete.errors.arrivalMileage ? (
          <div className="invalid-feedback">{complete.errors.arrivalMileage}</div>
        ) : (
          <div className="form-text">
            Minimum : {formatNumber(completeMinimum)} km (kilométrage de départ). La distance parcourue
            sera calculée automatiquement.
          </div>
        )}
      </FormModal>
    </>
  );
};

export default TripWorkflowModals;
