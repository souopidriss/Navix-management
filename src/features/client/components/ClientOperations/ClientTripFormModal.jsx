import { Divider } from '@/components/ui';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  tripSchema,
  tripDefaultValues,
  toTripFormValues,
  toTripPayload,
} from '@/features/trips/schemas';
import { TRIP_TYPES, TRIP_TYPE_VALUES } from '@/features/trips/constants';
import { CLIENT_FLEET_COMPANY_ID } from '../../services/clientVehicleService';

const TextField = ({ id, label, value, onChange, error, hint, placeholder, type = 'text', inputMode }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      className={error ? 'form-control is-invalid' : 'form-control'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
    />
    {error ? (
      <div className="invalid-feedback d-block" id={`${id}-error`}>
        {error}
      </div>
    ) : hint ? (
      <small className="form-text text-secondary" id={`${id}-hint`}>
        {hint}
      </small>
    ) : null}
  </div>
);

const SelectField = ({ id, label, value, onChange, options, placeholder = 'Sélectionner…', disabled, hint }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      className="form-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
    {hint && (
      <small className="form-text text-secondary" id={`${id}-hint`}>
        {hint}
      </small>
    )}
  </div>
);

const TextAreaField = ({ id, label, value, onChange, error, rows = 3, placeholder }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <textarea
      id={id}
      className={error ? 'form-control is-invalid' : 'form-control'}
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
    />
    {error && (
      <div className="invalid-feedback d-block" id={`${id}-error`}>
        {error}
      </div>
    )}
  </div>
);

/**
 * Modale de création / modification d'un trajet. Le véhicule et le chauffeur
 * sont dérivés de l'affectation sélectionnée (champ `assignmentId`). Seules
 * les affectations actives apparaissent dans la liste.
 */
const ClientTripFormModal = ({
  open,
  onClose,
  trip,
  assignments,
  onSubmit,
  loading,
  error,
}) => {
  const isEditing = Boolean(trip);

  const defaults = isEditing
    ? { ...toTripFormValues(trip), companyId: CLIENT_FLEET_COMPANY_ID }
    : { ...tripDefaultValues, companyId: CLIENT_FLEET_COMPANY_ID };

  const form = useZodForm({
    schema: tripSchema,
    defaultValues: defaults,
    onSubmit: async (values) => {
      await onSubmit(toTripPayload(values));
    },
  });

  const assignmentOptions = assignments.map((assignment) => {
    const isBusy = assignment.status === 'in_progress';
    return {
      value: assignment.id,
      label: `${assignment.assignmentNumber} · ${assignment.driver?.fullName ?? ''} · ${assignment.vehicle?.registrationNumber ?? ''}${isBusy ? ' (trajet en cours)' : ''}`,
      disabled: isBusy,
    };
  });

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le trajet' : 'Planifier un trajet'}
      subtitle={isEditing ? trip?.tripNumber : 'Planifiez un déplacement de votre flotte.'}
      icon="bi-signpost-split"
      size="xl"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel={isEditing ? 'Enregistrer les modifications' : 'Planifier le trajet'}
    >
      <div className="row g-3">
        <div className="col-12">
          <Divider>Itinéraire</Divider>
        </div>
        <div className="col-12">
          <SelectField
            id="client-trip-assignment"
            label="Affectation"
            value={form.values.assignmentId}
            onChange={(value) => form.setField('assignmentId', value)}
            options={assignmentOptions}
            error={form.errors.assignmentId}
            placeholder="Sélectionner une affectation active…"
            hint="Véhicule et chauffeur issus de l’affectation."
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-trip-type"
            label="Type de trajet"
            value={form.values.tripType}
            onChange={(value) => form.setField('tripType', value)}
            options={TRIP_TYPE_VALUES.map((type) => ({ value: type, label: TRIP_TYPES[type].label }))}
            error={form.errors.tripType}
            placeholder="Sélectionner un type…"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-purpose"
            label="Motif"
            value={form.values.purpose}
            onChange={(value) => form.setField('purpose', value)}
            error={form.errors.purpose}
            placeholder="Ex. Livraison commande client"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-departure-location"
            label="Lieu de départ"
            value={form.values.departureLocation}
            onChange={(value) => form.setField('departureLocation', value)}
            error={form.errors.departureLocation}
            placeholder="Ex. Agence Douala, Akwa"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-arrival-location"
            label="Lieu d’arrivée"
            value={form.values.arrivalLocation}
            onChange={(value) => form.setField('arrivalLocation', value)}
            error={form.errors.arrivalLocation}
            placeholder="Ex. Yaoundé, Bastos"
          />
        </div>

        <div className="col-12">
          <Divider>Planning</Divider>
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-departure-date"
            label="Date de départ"
            type="date"
            value={form.values.departureDate}
            onChange={(value) => form.setField('departureDate', value)}
            error={form.errors.departureDate}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-departure-time"
            label="Heure de départ"
            type="time"
            value={form.values.departureTime}
            onChange={(value) => form.setField('departureTime', value)}
            error={form.errors.departureTime}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-arrival-date"
            label="Date d’arrivée prévue"
            type="date"
            value={form.values.arrivalDate}
            onChange={(value) => form.setField('arrivalDate', value)}
            error={form.errors.arrivalDate}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-arrival-time"
            label="Heure d’arrivée prévue"
            type="time"
            value={form.values.arrivalTime}
            onChange={(value) => form.setField('arrivalTime', value)}
            error={form.errors.arrivalTime}
          />
        </div>

        <div className="col-12">
          <Divider>Distance & chargement</Divider>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-trip-planned-distance"
            label="Distance planifiée (km)"
            type="number"
            inputMode="numeric"
            value={form.values.plannedDistance}
            onChange={(value) => form.setField('plannedDistance', value)}
            error={form.errors.plannedDistance}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-trip-estimated-duration"
            label="Durée estimée (min)"
            type="number"
            inputMode="numeric"
            value={form.values.estimatedDuration}
            onChange={(value) => form.setField('estimatedDuration', value)}
            error={form.errors.estimatedDuration}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-trip-departure-mileage"
            label="Kilométrage au départ"
            type="number"
            inputMode="numeric"
            value={form.values.departureMileage}
            onChange={(value) => form.setField('departureMileage', value)}
            error={form.errors.departureMileage}
            hint="En kilomètres."
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <TextField
            id="client-trip-passenger-count"
            label="Nombre de passagers"
            type="number"
            inputMode="numeric"
            value={form.values.passengerCount}
            onChange={(value) => form.setField('passengerCount', value)}
            error={form.errors.passengerCount}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <TextField
            id="client-trip-cargo-weight"
            label="Poids de chargement (kg)"
            type="number"
            inputMode="numeric"
            value={form.values.cargoWeight}
            onChange={(value) => form.setField('cargoWeight', value)}
            error={form.errors.cargoWeight}
            placeholder="0"
          />
        </div>

        <div className="col-12">
          <Divider>Notes</Divider>
        </div>
        <div className="col-12">
          <TextAreaField
            id="client-trip-notes"
            label="Notes"
            value={form.values.notes}
            onChange={(value) => form.setField('notes', value)}
            error={form.errors.notes}
            rows={3}
            placeholder="Consignes, contraintes de chargement…"
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientTripFormModal;
