import { useState } from 'react';
import { Divider } from '@/components/ui';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  vehicleSchema,
  vehicleDefaultValues,
  toVehicleFormValues,
  toVehiclePayload,
} from '@/features/vehicles/schemas';
import {
  VEHICLE_GROUPS,
  VEHICLE_GROUP_VALUES,
  VEHICLE_STATUSES,
  VEHICLE_STATUS_VALUES,
  FUEL_TYPES,
  FUEL_TYPE_VALUES,
  TRANSMISSIONS,
  TRANSMISSION_VALUES,
  getGroupCategories,
  normalizeRegistrationNumber,
} from '@/features/vehicles/constants';
import { CAMEROON_CITIES } from '../../constants/client.constants';
import { CLIENT_FLEET_COMPANY_ID } from '../../services/clientVehicleService';

const AGENCY_OPTIONS = [
  'Agence Douala',
  'Agence Yaoundé',
  'Agence Bafoussam',
  'Agence Garoua',
  'Agence Kribi',
  'Agence Ebolowa',
];

const toLabelOptions = (values, meta) => values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const TextField = ({ id, label, value, onChange, error, hint, placeholder, type = 'text', inputMode, autoComplete }) => (
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
      autoComplete={autoComplete}
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

const SelectField = ({ id, label, value, onChange, options, placeholder = 'Sélectionner…', disabled }) => (
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
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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

const ClientVehicleFormModal = ({ open, onClose, vehicle, vehicles, onSubmit, loading, error }) => {
  const editingId = vehicle?.id ?? null;
  const isEditing = Boolean(vehicle);
  const [registrationError, setRegistrationError] = useState('');

  const baseDefaults = {
    ...vehicleDefaultValues,
    companyId: CLIENT_FLEET_COMPANY_ID,
  };

  const defaults = isEditing
    ? { ...toVehicleFormValues(vehicle), companyId: CLIENT_FLEET_COMPANY_ID }
    : baseDefaults;

  const form = useZodForm({
    schema: vehicleSchema,
    defaultValues: defaults,
    onSubmit: async (values) => {
      const isDuplicate = vehicles.some(
        (item) =>
          normalizeRegistrationNumber(item.registrationNumber) ===
            normalizeRegistrationNumber(values.registrationNumber) && item.id !== editingId,
      );
      if (isDuplicate) {
        setRegistrationError('Cette immatriculation est déjà enregistrée dans votre flotte.');
        return;
      }
      await onSubmit(toVehiclePayload(values));
    },
  });

  const handleRegistrationChange = (value) => {
    form.setField('registrationNumber', value);
    setRegistrationError('');
  };

  const handleGroupChange = (value) => {
    form.setField('group', value);
    form.setField('category', '');
  };

  const categoryOptions = getGroupCategories(form.values.group).map((category) => ({ value: category, label: category }));

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
      subtitle={isEditing ? vehicle?.registrationNumber : 'Enregistrez un véhicule dans votre flotte.'}
      icon="bi-truck"
      size="xl"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel={isEditing ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
    >
      <div className="row g-3">
        <div className="col-12">
          <Divider>Identification</Divider>
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-vehicle-registration"
            label="Immatriculation"
            value={form.values.registrationNumber}
            onChange={handleRegistrationChange}
            error={form.errors.registrationNumber || registrationError}
            hint="Format camerounais, ex. LT 1234 AB."
            placeholder="Ex. LT 1234 AB"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-vehicle-vin"
            label="VIN"
            value={form.values.vin}
            onChange={(value) => form.setField('vin', value)}
            error={form.errors.vin}
            hint="17 caractères (lettres et chiffres)."
            placeholder="Ex. JTMHV05J2N4012345"
          />
        </div>

        <div className="col-12">
          <Divider>Caractéristiques</Divider>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="client-vehicle-group"
            label="Groupe"
            value={form.values.group}
            onChange={handleGroupChange}
            options={VEHICLE_GROUP_VALUES.map((group) => ({
              value: group,
              label: `Groupe ${group} · ${VEHICLE_GROUPS[group].label}`,
            }))}
            placeholder="Sélectionner un groupe…"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="client-vehicle-category"
            label="Catégorie"
            value={form.values.category}
            onChange={(value) => form.setField('category', value)}
            options={categoryOptions}
            placeholder={form.values.group ? 'Sélectionner une catégorie…' : 'Choisir d’abord un groupe'}
            disabled={!form.values.group}
          />
        </div>
        {!isEditing && (
          <div className="col-12 col-md-6 col-lg-4">
            <SelectField
              id="client-vehicle-status"
              label="Statut"
              value={form.values.status}
              onChange={(value) => form.setField('status', value)}
              options={toLabelOptions(VEHICLE_STATUS_VALUES, VEHICLE_STATUSES)}
            />
          </div>
        )}

        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-vehicle-brand"
            label="Marque"
            value={form.values.brand}
            onChange={(value) => form.setField('brand', value)}
            error={form.errors.brand}
            placeholder="Ex. Toyota"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-vehicle-model"
            label="Modèle"
            value={form.values.model}
            onChange={(value) => form.setField('model', value)}
            error={form.errors.model}
            placeholder="Ex. Hilux"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-vehicle-version"
            label="Version"
            value={form.values.version}
            onChange={(value) => form.setField('version', value)}
            error={form.errors.version}
            placeholder="Ex. Double Cabine"
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="client-vehicle-year"
            label="Année"
            type="number"
            inputMode="numeric"
            value={form.values.year}
            onChange={(value) => form.setField('year', value)}
            error={form.errors.year}
            placeholder={String(new Date().getFullYear())}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="client-vehicle-color"
            label="Couleur"
            value={form.values.color}
            onChange={(value) => form.setField('color', value)}
            error={form.errors.color}
            placeholder="Ex. Blanc"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <SelectField
            id="client-vehicle-fuel"
            label="Carburant"
            value={form.values.fuelType}
            onChange={(value) => form.setField('fuelType', value)}
            options={toLabelOptions(FUEL_TYPE_VALUES, FUEL_TYPES)}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <SelectField
            id="client-vehicle-transmission"
            label="Transmission"
            value={form.values.transmission}
            onChange={(value) => form.setField('transmission', value)}
            options={toLabelOptions(TRANSMISSION_VALUES, TRANSMISSIONS)}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-vehicle-mileage"
            label="Kilométrage"
            type="number"
            inputMode="numeric"
            value={form.values.mileage}
            onChange={(value) => form.setField('mileage', value)}
            error={form.errors.mileage}
            hint="En kilomètres."
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-vehicle-capacity"
            label="Capacité"
            type="number"
            inputMode="numeric"
            value={form.values.capacity}
            onChange={(value) => form.setField('capacity', value)}
            error={form.errors.capacity}
            hint="Passagers ou tonnes selon le véhicule."
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="client-vehicle-location"
            label="Localisation (ville)"
            value={form.values.location}
            onChange={(value) => form.setField('location', value)}
            options={CAMEROON_CITIES.map((city) => ({ value: city, label: city }))}
            placeholder="Sélectionner une ville…"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="client-vehicle-agency"
            label="Agence"
            value={form.values.agency}
            onChange={(value) => form.setField('agency', value)}
            options={AGENCY_OPTIONS.map((agency) => ({ value: agency, label: agency }))}
            placeholder="Sélectionner une agence…"
          />
        </div>

        <div className="col-12">
          <Divider>Documents & validité</Divider>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="client-vehicle-purchase-date"
            label="Date d’achat"
            type="date"
            value={form.values.purchaseDate}
            onChange={(value) => form.setField('purchaseDate', value)}
            error={form.errors.purchaseDate}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="client-vehicle-insurance-expiry"
            label="Expiration assurance"
            type="date"
            value={form.values.insuranceExpiry}
            onChange={(value) => form.setField('insuranceExpiry', value)}
            error={form.errors.insuranceExpiry}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="client-vehicle-inspection-expiry"
            label="Expiration visite technique"
            type="date"
            value={form.values.inspectionExpiry}
            onChange={(value) => form.setField('inspectionExpiry', value)}
            error={form.errors.inspectionExpiry}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="client-vehicle-registration-expiry"
            label="Expiration carte grise"
            type="date"
            value={form.values.registrationExpiry}
            onChange={(value) => form.setField('registrationExpiry', value)}
            error={form.errors.registrationExpiry}
          />
        </div>

        <div className="col-12">
          <Divider>Notes</Divider>
        </div>
        <div className="col-12">
          <TextAreaField
            id="client-vehicle-notes"
            label="Notes"
            value={form.values.notes}
            onChange={(value) => form.setField('notes', value)}
            error={form.errors.notes}
            rows={3}
            placeholder="Observations, entretiens à prévoir, affectation spéciale…"
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientVehicleFormModal;
