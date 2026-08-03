/**
 * Navix Assignments — AssignmentForm
 * --------------------------------------------------------------------------
 * Formulaire de création / édition d'une affectation. Validation exclusive
 * Zod (useZodForm + assignmentSchema), agences restreintes à l'entreprise,
 * véhicules et chauffeurs déjà en affectation active marqués indisponibles,
 * états chargement / erreur.
 *
 * Props :
 *   initialValues : valeurs initiales (assignmentDefaultValues pour la création)
 *   editingId     : id de l'affectation éditée (sinon null)
 *   assignments   : liste chargée (détection des conflits véhicule/chauffeur)
 *   vehicles      : liste des véhicules
 *   drivers       : liste des chauffeurs
 *   companies     : liste des entreprises
 *   agencies      : liste des agences (restreintes par entreprise)
 *   onSubmit      : (values: object) => Promise<void>
 *   submitLabel   : libellé du bouton de soumission
 *   loading       : booléen — soumission en cours
 *   error         : erreur globale (affichée en alerte)
 *   onCancel      : () => void — retour en arrière
 */
import { Alert, Button, Divider } from '@/components/ui';
import { useZodForm } from '@/features/auth';
import { assignmentSchema, assignmentDefaultValues } from '../schemas';
import { ASSIGNMENT_TYPES, ASSIGNMENT_TYPE_VALUES } from '../constants';
import './AssignmentForm.css';

const toLabelOptions = (values, meta) => values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const vehicleLabel = (vehicle) =>
  vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() || 'Véhicule';

const driverLabel = (driver) =>
  driver.fullName + (driver.employeeCode ? ` · ${driver.employeeCode}` : '');

const AssignmentForm = ({
  initialValues = assignmentDefaultValues,
  editingId = null,
  assignments = [],
  vehicles = [],
  drivers = [],
  companies = [],
  agencies = [],
  onSubmit,
  submitLabel = 'Enregistrer',
  loading = false,
  error = null,
  onCancel,
}) => {
  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: assignmentSchema,
    defaultValues: initialValues,
    onSubmit,
  });

  const handleCompanyChange = (value) => {
    setField('companyId', value);
    setField('agencyId', '');
  };

  const agencyOptions = agencies.filter((agency) => !values.companyId || agency.companyId === values.companyId);

  const busyVehicleIds = new Set(
    assignments
      .filter((assignment) => assignment.status === 'active' && assignment.id !== editingId)
      .map((assignment) => assignment.vehicleId),
  );

  const busyDriverIds = new Set(
    assignments
      .filter((assignment) => assignment.status === 'active' && assignment.id !== editingId)
      .map((assignment) => assignment.driverId),
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="navix-assignment-form">
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <div className="row g-3">
        <div className="col-12">
          <Divider>Affectation</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="assignment-company">
            Entreprise
          </label>
          <select
            id="assignment-company"
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
          <label className="form-label" htmlFor="assignment-agency">
            Agence
          </label>
          <select
            id="assignment-agency"
            className="form-select"
            value={values.agencyId}
            onChange={(event) => setField('agencyId', event.target.value)}
            disabled={!values.companyId}
          >
            <option value="" disabled hidden>
              {values.companyId ? 'Sélectionner une agence…' : 'Choisir d’abord une entreprise'}
            </option>
            {agencyOptions.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="assignment-type">
            Type d’affectation
          </label>
          <select
            id="assignment-type"
            className="form-select"
            value={values.assignmentType}
            onChange={(event) => setField('assignmentType', event.target.value)}
          >
            <option value="" disabled hidden>
              Sélectionner un type…
            </option>
            {toLabelOptions(ASSIGNMENT_TYPE_VALUES, ASSIGNMENT_TYPES).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <Divider>Ressources</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-6">
          <label className="form-label" htmlFor="assignment-vehicle">
            Véhicule
          </label>
          <select
            id="assignment-vehicle"
            className="form-select"
            value={values.vehicleId}
            onChange={(event) => setField('vehicleId', event.target.value)}
          >
            <option value="" disabled hidden>
              Sélectionner un véhicule…
            </option>
            {vehicles.map((vehicle) => {
              const busy = busyVehicleIds.has(vehicle.id);
              return (
                <option key={vehicle.id} value={vehicle.id} disabled={busy}>
                  {vehicleLabel(vehicle)}
                  {busy ? ' — déjà affecté' : ''}
                </option>
              );
            })}
          </select>
          <small className="form-text text-secondary">
            Les véhicules déjà en affectation active sont désactivés.
          </small>
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <label className="form-label" htmlFor="assignment-driver">
            Chauffeur
          </label>
          <select
            id="assignment-driver"
            className="form-select"
            value={values.driverId}
            onChange={(event) => setField('driverId', event.target.value)}
          >
            <option value="" disabled hidden>
              Sélectionner un chauffeur…
            </option>
            {drivers.map((driver) => {
              const busy = busyDriverIds.has(driver.id);
              return (
                <option key={driver.id} value={driver.id} disabled={busy}>
                  {driverLabel(driver)}
                  {busy ? ' — déjà affecté' : ''}
                </option>
              );
            })}
          </select>
          <small className="form-text text-secondary">
            Les chauffeurs déjà en affectation active sont désactivés.
          </small>
        </div>

        <div className="col-12">
          <Divider>Période</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="assignment-start-date">
            Date de début
          </label>
          <input
            id="assignment-start-date"
            type="date"
            className={errors.startDate ? 'form-control is-invalid' : 'form-control'}
            value={values.startDate}
            onChange={(event) => setField('startDate', event.target.value)}
            aria-invalid={errors.startDate ? true : undefined}
            aria-describedby={errors.startDate ? 'assignment-start-date-error' : undefined}
          />
          {errors.startDate && (
            <div className="invalid-feedback d-block" id="assignment-start-date-error">
              {errors.startDate}
            </div>
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="assignment-expected-end-date">
            Date de fin prévue
          </label>
          <input
            id="assignment-expected-end-date"
            type="date"
            className={errors.expectedEndDate ? 'form-control is-invalid' : 'form-control'}
            value={values.expectedEndDate}
            onChange={(event) => setField('expectedEndDate', event.target.value)}
            aria-invalid={errors.expectedEndDate ? true : undefined}
            aria-describedby={errors.expectedEndDate ? 'assignment-expected-end-date-error' : undefined}
          />
          {errors.expectedEndDate && (
            <div className="invalid-feedback d-block" id="assignment-expected-end-date-error">
              {errors.expectedEndDate}
            </div>
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="assignment-destination">
            Destination
          </label>
          <input
            id="assignment-destination"
            type="text"
            className="form-control"
            value={values.destination}
            onChange={(event) => setField('destination', event.target.value)}
            placeholder="Ex. Site de Bouaké"
          />
        </div>

        <div className="col-12">
          <Divider>État du véhicule au départ</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="assignment-start-mileage">
            Kilométrage de départ
          </label>
          <input
            id="assignment-start-mileage"
            type="number"
            inputMode="numeric"
            className={errors.startMileage ? 'form-control is-invalid' : 'form-control'}
            value={values.startMileage}
            onChange={(event) => setField('startMileage', event.target.value)}
            placeholder="0"
            aria-invalid={errors.startMileage ? true : undefined}
            aria-describedby={errors.startMileage ? 'assignment-start-mileage-error' : undefined}
          />
          {errors.startMileage && (
            <div className="invalid-feedback d-block" id="assignment-start-mileage-error">
              {errors.startMileage}
            </div>
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="assignment-fuel-level">
            Niveau de carburant au départ (%)
          </label>
          <input
            id="assignment-fuel-level"
            type="number"
            inputMode="numeric"
            min="0"
            max="100"
            className={errors.fuelLevelStart ? 'form-control is-invalid' : 'form-control'}
            value={values.fuelLevelStart}
            onChange={(event) => setField('fuelLevelStart', event.target.value)}
            placeholder="0"
            aria-invalid={errors.fuelLevelStart ? true : undefined}
            aria-describedby={errors.fuelLevelStart ? 'assignment-fuel-level-error' : undefined}
          />
          {errors.fuelLevelStart && (
            <div className="invalid-feedback d-block" id="assignment-fuel-level-error">
              {errors.fuelLevelStart}
            </div>
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="assignment-reason">
            Motif
          </label>
          <input
            id="assignment-reason"
            type="text"
            className="form-control"
            value={values.reason}
            onChange={(event) => setField('reason', event.target.value)}
            placeholder="Ex. Remplacement temporaire"
          />
        </div>

        <div className="col-12">
          <label className="form-label" htmlFor="assignment-notes">
            Notes
          </label>
          <textarea
            id="assignment-notes"
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

export default AssignmentForm;
