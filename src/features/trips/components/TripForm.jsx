/**
 * Navix Trips — TripForm
 * --------------------------------------------------------------------------
 * Formulaire de création / édition d'un trajet. Validation exclusive Zod
 * (useZodForm + tripSchema). L'affectation sélectionnée détermine le
 * véhicule et le chauffeur (champs dérivés, non saisis) ; seules les
 * affectations actives de l'entreprise choisie sont proposées.
 *
 * Props :
 *   initialValues : valeurs initiales (tripDefaultValues pour la création)
 *   assignments   : liste des affectations (restreintes par entreprise)
 *   companies     : liste des entreprises
 *   driverById    : carte { id → { fullName } }
 *   vehicleById   : carte { id → { registrationNumber, brand, model } }
 *   onSubmit      : (values: object) => Promise<void>
 *   submitLabel   : libellé du bouton de soumission
 *   loading       : booléen — soumission en cours
 *   error         : erreur globale (affichée en alerte)
 *   onCancel      : () => void — retour en arrière
 */
import { Alert, Button, Divider } from '@/components/ui';
import { useZodForm } from '@/features/auth';
import { tripSchema, tripDefaultValues } from '../schemas';
import { TRIP_TYPES, TRIP_TYPE_VALUES } from '../constants';
import './TripForm.css';

const toLabelOptions = (values, meta) => values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const assignmentLabel = (assignment, driverById, vehicleById) => {
  const driver = driverById[assignment.driverId]?.fullName ?? '—';
  const vehicle = vehicleById[assignment.vehicleId] ?? {};
  const vehicleLabel = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() || '—';
  return `${assignment.assignmentNumber} · ${driver} · ${vehicleLabel}`;
};

const TripForm = ({
  initialValues = tripDefaultValues,
  assignments = [],
  companies = [],
  driverById = {},
  vehicleById = {},
  onSubmit,
  submitLabel = 'Enregistrer',
  loading = false,
  error = null,
  onCancel,
}) => {
  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: tripSchema,
    defaultValues: initialValues,
    onSubmit,
  });

  const handleCompanyChange = (value) => {
    setField('companyId', value);
    setField('assignmentId', '');
  };

  const assignmentOptions = assignments.filter(
    (assignment) =>
      assignment.status === 'active' && (!values.companyId || assignment.companyId === values.companyId),
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="navix-trip-form">
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <div className="row g-3">
        <div className="col-12">
          <Divider>Trajet</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="trip-company">
            Entreprise
          </label>
          <select
            id="trip-company"
            className="form-select"
            value={values.companyId}
            onChange={(event) => handleCompanyChange(event.target.value)}
          >
            <option value="" disabled hidden>
              Sélectionner une entreprise…
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="trip-assignment">
            Affectation
          </label>
          <select
            id="trip-assignment"
            className={errors.assignmentId ? 'form-select is-invalid' : 'form-select'}
            value={values.assignmentId}
            onChange={(event) => setField('assignmentId', event.target.value)}
            disabled={!values.companyId}
            aria-invalid={errors.assignmentId ? true : undefined}
            aria-describedby={errors.assignmentId ? 'trip-assignment-error' : undefined}
          >
            <option value="" disabled hidden>
              {values.companyId ? 'Sélectionner une affectation active…' : 'Choisir d’abord une entreprise'}
            </option>
            {assignmentOptions.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignmentLabel(assignment, driverById, vehicleById)}
              </option>
            ))}
          </select>
          {errors.assignmentId && (
            <div className="invalid-feedback d-block" id="trip-assignment-error">
              {errors.assignmentId}
            </div>
          )}
          <small className="form-text text-secondary">
            Le véhicule et le chauffeur sont déterminés par l’affectation choisie.
          </small>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="trip-type">
            Type de trajet
          </label>
          <select
            id="trip-type"
            className={errors.tripType ? 'form-select is-invalid' : 'form-select'}
            value={values.tripType}
            onChange={(event) => setField('tripType', event.target.value)}
            aria-invalid={errors.tripType ? true : undefined}
            aria-describedby={errors.tripType ? 'trip-type-error' : undefined}
          >
            <option value="" disabled hidden>
              Sélectionner un type…
            </option>
            {toLabelOptions(TRIP_TYPE_VALUES, TRIP_TYPES).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.tripType && (
            <div className="invalid-feedback d-block" id="trip-type-error">
              {errors.tripType}
            </div>
          )}
        </div>
        <div className="col-12 col-md-12 col-lg-12">
          <label className="form-label" htmlFor="trip-purpose">
            Motif du trajet
          </label>
          <input
            id="trip-purpose"
            type="text"
            className={errors.purpose ? 'form-control is-invalid' : 'form-control'}
            value={values.purpose}
            onChange={(event) => setField('purpose', event.target.value)}
            placeholder="Ex. Livraison de marchandises à Bouaké"
            aria-invalid={errors.purpose ? true : undefined}
            aria-describedby={errors.purpose ? 'trip-purpose-error' : undefined}
          />
          {errors.purpose && (
            <div className="invalid-feedback d-block" id="trip-purpose-error">
              {errors.purpose}
            </div>
          )}
        </div>

        <div className="col-12">
          <Divider>Itinéraire</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-6">
          <label className="form-label" htmlFor="trip-departure-location">
            Lieu de départ
          </label>
          <input
            id="trip-departure-location"
            type="text"
            className={errors.departureLocation ? 'form-control is-invalid' : 'form-control'}
            value={values.departureLocation}
            onChange={(event) => setField('departureLocation', event.target.value)}
            placeholder="Ex. Abidjan"
            aria-invalid={errors.departureLocation ? true : undefined}
            aria-describedby={errors.departureLocation ? 'trip-departure-location-error' : undefined}
          />
          {errors.departureLocation && (
            <div className="invalid-feedback d-block" id="trip-departure-location-error">
              {errors.departureLocation}
            </div>
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <label className="form-label" htmlFor="trip-arrival-location">
            Lieu d’arrivée
          </label>
          <input
            id="trip-arrival-location"
            type="text"
            className={errors.arrivalLocation ? 'form-control is-invalid' : 'form-control'}
            value={values.arrivalLocation}
            onChange={(event) => setField('arrivalLocation', event.target.value)}
            placeholder="Ex. Bouaké"
            aria-invalid={errors.arrivalLocation ? true : undefined}
            aria-describedby={errors.arrivalLocation ? 'trip-arrival-location-error' : undefined}
          />
          {errors.arrivalLocation && (
            <div className="invalid-feedback d-block" id="trip-arrival-location-error">
              {errors.arrivalLocation}
            </div>
          )}
        </div>

        <div className="col-12">
          <Divider>Programmation</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label" htmlFor="trip-departure-date">
            Date de départ
          </label>
          <input
            id="trip-departure-date"
            type="date"
            className={errors.departureDate ? 'form-control is-invalid' : 'form-control'}
            value={values.departureDate}
            onChange={(event) => setField('departureDate', event.target.value)}
            aria-invalid={errors.departureDate ? true : undefined}
            aria-describedby={errors.departureDate ? 'trip-departure-date-error' : undefined}
          />
          {errors.departureDate && (
            <div className="invalid-feedback d-block" id="trip-departure-date-error">
              {errors.departureDate}
            </div>
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label" htmlFor="trip-departure-time">
            Heure de départ
          </label>
          <input
            id="trip-departure-time"
            type="time"
            className={errors.departureTime ? 'form-control is-invalid' : 'form-control'}
            value={values.departureTime}
            onChange={(event) => setField('departureTime', event.target.value)}
            aria-invalid={errors.departureTime ? true : undefined}
            aria-describedby={errors.departureTime ? 'trip-departure-time-error' : undefined}
          />
          {errors.departureTime && (
            <div className="invalid-feedback d-block" id="trip-departure-time-error">
              {errors.departureTime}
            </div>
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label" htmlFor="trip-arrival-date">
            Date d’arrivée
          </label>
          <input
            id="trip-arrival-date"
            type="date"
            className={errors.arrivalDate ? 'form-control is-invalid' : 'form-control'}
            value={values.arrivalDate}
            onChange={(event) => setField('arrivalDate', event.target.value)}
            aria-invalid={errors.arrivalDate ? true : undefined}
            aria-describedby={errors.arrivalDate ? 'trip-arrival-date-error' : undefined}
          />
          {errors.arrivalDate && (
            <div className="invalid-feedback d-block" id="trip-arrival-date-error">
              {errors.arrivalDate}
            </div>
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label" htmlFor="trip-arrival-time">
            Heure d’arrivée
          </label>
          <input
            id="trip-arrival-time"
            type="time"
            className={errors.arrivalTime ? 'form-control is-invalid' : 'form-control'}
            value={values.arrivalTime}
            onChange={(event) => setField('arrivalTime', event.target.value)}
            aria-invalid={errors.arrivalTime ? true : undefined}
            aria-describedby={errors.arrivalTime ? 'trip-arrival-time-error' : undefined}
          />
          {errors.arrivalTime && (
            <div className="invalid-feedback d-block" id="trip-arrival-time-error">
              {errors.arrivalTime}
            </div>
          )}
        </div>

        <div className="col-12">
          <Divider>Indicateurs</Divider>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label" htmlFor="trip-planned-distance">
            Distance (km)
          </label>
          <input
            id="trip-planned-distance"
            type="number"
            inputMode="numeric"
            min="0"
            className={errors.plannedDistance ? 'form-control is-invalid' : 'form-control'}
            value={values.plannedDistance}
            onChange={(event) => setField('plannedDistance', event.target.value)}
            placeholder="0"
            aria-invalid={errors.plannedDistance ? true : undefined}
            aria-describedby={errors.plannedDistance ? 'trip-planned-distance-error' : undefined}
          />
          {errors.plannedDistance && (
            <div className="invalid-feedback d-block" id="trip-planned-distance-error">
              {errors.plannedDistance}
            </div>
          )}
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label" htmlFor="trip-estimated-duration">
            Durée (min)
          </label>
          <input
            id="trip-estimated-duration"
            type="number"
            inputMode="numeric"
            min="0"
            className={errors.estimatedDuration ? 'form-control is-invalid' : 'form-control'}
            value={values.estimatedDuration}
            onChange={(event) => setField('estimatedDuration', event.target.value)}
            placeholder="0"
            aria-invalid={errors.estimatedDuration ? true : undefined}
            aria-describedby={errors.estimatedDuration ? 'trip-estimated-duration-error' : undefined}
          />
          {errors.estimatedDuration && (
            <div className="invalid-feedback d-block" id="trip-estimated-duration-error">
              {errors.estimatedDuration}
            </div>
          )}
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label" htmlFor="trip-departure-mileage">
            Km départ
          </label>
          <input
            id="trip-departure-mileage"
            type="number"
            inputMode="numeric"
            min="0"
            className={errors.departureMileage ? 'form-control is-invalid' : 'form-control'}
            value={values.departureMileage}
            onChange={(event) => setField('departureMileage', event.target.value)}
            placeholder="0"
            aria-invalid={errors.departureMileage ? true : undefined}
            aria-describedby={errors.departureMileage ? 'trip-departure-mileage-error' : undefined}
          />
          {errors.departureMileage && (
            <div className="invalid-feedback d-block" id="trip-departure-mileage-error">
              {errors.departureMileage}
            </div>
          )}
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label" htmlFor="trip-passenger-count">
            Passagers
          </label>
          <input
            id="trip-passenger-count"
            type="number"
            inputMode="numeric"
            min="0"
            className={errors.passengerCount ? 'form-control is-invalid' : 'form-control'}
            value={values.passengerCount}
            onChange={(event) => setField('passengerCount', event.target.value)}
            placeholder="0"
            aria-invalid={errors.passengerCount ? true : undefined}
            aria-describedby={errors.passengerCount ? 'trip-passenger-count-error' : undefined}
          />
          {errors.passengerCount && (
            <div className="invalid-feedback d-block" id="trip-passenger-count-error">
              {errors.passengerCount}
            </div>
          )}
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label" htmlFor="trip-cargo-weight">
            Charge (kg)
          </label>
          <input
            id="trip-cargo-weight"
            type="number"
            inputMode="numeric"
            min="0"
            className={errors.cargoWeight ? 'form-control is-invalid' : 'form-control'}
            value={values.cargoWeight}
            onChange={(event) => setField('cargoWeight', event.target.value)}
            placeholder="0"
            aria-invalid={errors.cargoWeight ? true : undefined}
            aria-describedby={errors.cargoWeight ? 'trip-cargo-weight-error' : undefined}
          />
          {errors.cargoWeight && (
            <div className="invalid-feedback d-block" id="trip-cargo-weight-error">
              {errors.cargoWeight}
            </div>
          )}
        </div>

        <div className="col-12">
          <label className="form-label" htmlFor="trip-notes">
            Notes
          </label>
          <textarea
            id="trip-notes"
            className="form-control"
            rows={3}
            value={values.notes}
            onChange={(event) => setField('notes', event.target.value)}
            placeholder="Observations, consignes particulières…"
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 flex-wrap mt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
        )}
        <Button type="submit" variant="primary" icon="bi-check-lg" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
