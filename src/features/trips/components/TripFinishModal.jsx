/**
 * Navix Trips — TripFinishModal
 * --------------------------------------------------------------------------
 * Modale de clôture d'un trajet (statut « Terminé ») : date d'arrivée
 * (obligatoire, postérieure au départ), heure d'arrivée, distance réelle,
 * kilométrage d'arrivée (supérieur au kilométrage de départ), durée réelle
 * et notes. Validation Zod contextuelle (buildTripFinishSchema). Contrôlée
 * en React comme les autres modales du module (Échap, backdrop, verrouillage
 * du scroll).
 *
 * Props :
 *   trip     : trajet à clôturer (null = modale fermée)
 *   open     : booléen — ouvre la modale
 *   loading  : booléen — soumission en cours
 *   error    : message d'erreur global (optionnel)
 *   onSubmit : (values: object) => Promise<void>
 *   onClose  : () => void — ferme la modale
 */
import { useEffect } from 'react';
import { Alert, Button } from '@/components/ui';
import { useZodForm } from '@/features/auth';
import { buildTripFinishSchema, tripFinishDefaultValues } from '../schemas';
import './TripFinishModal.css';

const TripFinishModal = ({ trip, open, loading, error, onSubmit, onClose }) => {
  const finishSchema = buildTripFinishSchema({
    departureDate: trip?.departureDate ?? '',
    departureMileage: trip?.departureMileage ?? 0,
  });
  const { values, errors, setField, handleSubmit, reset } = useZodForm({
    schema: finishSchema,
    defaultValues: tripFinishDefaultValues,
    onSubmit,
  });

  useEffect(() => {
    if (open && trip) {
      reset({ ...tripFinishDefaultValues, arrivalDate: new Date().toISOString().slice(0, 10) });
    }
  }, [open, trip, reset]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('navix-modal-open');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('navix-modal-open');
    };
  }, [open, onClose]);

  if (!open || !trip) return null;

  return (
    <div
      className="navix-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="navix-modal__backdrop" aria-hidden="true" />
      <div
        className="navix-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="finish-trip-title"
        aria-describedby="finish-trip-description"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h5" id="finish-trip-title">
              Clôturer {trip.tripNumber}
            </h2>
            <Button variant="ghost" size="sm" icon="bi-x-lg" onClick={onClose} disabled={loading} aria-label="Fermer la fenêtre" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}
              <p id="finish-trip-description" className="text-secondary small">
                Renseignez les informations de clôture du trajet.
              </p>

              <div className="mb-3">
                <label className="form-label" htmlFor="finish-arrival-date">
                  Date d’arrivée
                </label>
                <input
                  id="finish-arrival-date"
                  type="date"
                  className={errors.arrivalDate ? 'form-control is-invalid' : 'form-control'}
                  value={values.arrivalDate}
                  onChange={(event) => setField('arrivalDate', event.target.value)}
                  aria-invalid={errors.arrivalDate ? true : undefined}
                  aria-describedby={errors.arrivalDate ? 'finish-arrival-date-error' : undefined}
                />
                {errors.arrivalDate && (
                  <div className="invalid-feedback d-block" id="finish-arrival-date-error">
                    {errors.arrivalDate}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="finish-arrival-time">
                  Heure d’arrivée
                </label>
                <input
                  id="finish-arrival-time"
                  type="time"
                  className={errors.arrivalTime ? 'form-control is-invalid' : 'form-control'}
                  value={values.arrivalTime}
                  onChange={(event) => setField('arrivalTime', event.target.value)}
                  aria-invalid={errors.arrivalTime ? true : undefined}
                  aria-describedby={errors.arrivalTime ? 'finish-arrival-time-error' : undefined}
                />
                {errors.arrivalTime && (
                  <div className="invalid-feedback d-block" id="finish-arrival-time-error">
                    {errors.arrivalTime}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="finish-actual-distance">
                  Distance réelle (km)
                </label>
                <input
                  id="finish-actual-distance"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  className={errors.actualDistance ? 'form-control is-invalid' : 'form-control'}
                  value={values.actualDistance}
                  onChange={(event) => setField('actualDistance', event.target.value)}
                  placeholder="0"
                  aria-invalid={errors.actualDistance ? true : undefined}
                  aria-describedby={errors.actualDistance ? 'finish-actual-distance-error' : undefined}
                />
                {errors.actualDistance && (
                  <div className="invalid-feedback d-block" id="finish-actual-distance-error">
                    {errors.actualDistance}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="finish-arrival-mileage">
                  Kilométrage d’arrivée
                </label>
                <input
                  id="finish-arrival-mileage"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  className={errors.arrivalMileage ? 'form-control is-invalid' : 'form-control'}
                  value={values.arrivalMileage}
                  onChange={(event) => setField('arrivalMileage', event.target.value)}
                  placeholder="0"
                  aria-invalid={errors.arrivalMileage ? true : undefined}
                  aria-describedby={errors.arrivalMileage ? 'finish-arrival-mileage-error' : undefined}
                />
                {errors.arrivalMileage && (
                  <div className="invalid-feedback d-block" id="finish-arrival-mileage-error">
                    {errors.arrivalMileage}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="finish-actual-duration">
                  Durée réelle (min)
                </label>
                <input
                  id="finish-actual-duration"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  className={errors.actualDuration ? 'form-control is-invalid' : 'form-control'}
                  value={values.actualDuration}
                  onChange={(event) => setField('actualDuration', event.target.value)}
                  placeholder="0"
                  aria-invalid={errors.actualDuration ? true : undefined}
                  aria-describedby={errors.actualDuration ? 'finish-actual-duration-error' : undefined}
                />
                {errors.actualDuration && (
                  <div className="invalid-feedback d-block" id="finish-actual-duration-error">
                    {errors.actualDuration}
                  </div>
                )}
              </div>

              <div className="mb-0">
                <label className="form-label" htmlFor="finish-notes">
                  Notes de clôture
                </label>
                <textarea
                  id="finish-notes"
                  className="form-control"
                  rows={3}
                  value={values.notes}
                  onChange={(event) => setField('notes', event.target.value)}
                  placeholder="Ex. Trajet terminé, marchandise livrée…"
                />
              </div>
            </div>

            <div className="modal-footer">
              <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" variant="success" icon="bi-check2-circle" loading={loading}>
                Clôturer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripFinishModal;
