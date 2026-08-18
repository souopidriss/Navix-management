/**
 * Navix Partner Portal — PartnerVehicleFormModal (PROMPT 063)
 * --------------------------------------------------------------------------
 * Modale de création / édition d'un véhicule de la flotte partenaire.
 * Champs : Marque, Modèle, Année, Immatriculation, Type, Agence,
 * Kilométrage, Date de mise en service, Couleur, Statut.
 * Validation exclusive Zod (useZodForm) + unicité d'immatriculation
 * simulée côté formulaire (réappliquée par le service en 409).
 */
import { useState } from 'react';
import { Divider } from '@/components/ui';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  partnerVehicleSchema,
  partnerVehicleDefaultValues,
  toPartnerVehicleFormValues,
  toPartnerVehiclePayload,
} from '../../schemas/partnerVehicle.schema';
import { VEHICLE_STATUSES, VEHICLE_STATUS_VALUES, normalizeRegistrationNumber } from '@/features/vehicles/constants';
import {
  PARTNER_VEHICLE_TYPES,
  PARTNER_VEHICLE_TYPE_VALUES,
  PARTNER_AGENCIES,
} from '../../constants/partner.constants';

const toLabelOptions = (values, meta) => values.map((value) => ({ value, label: meta[value]?.label ?? value }));

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

const SelectField = ({ id, label, value, onChange, options, placeholder = 'Sélectionner…' }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <select id={id} className="form-select" value={value} onChange={(event) => onChange(event.target.value)}>
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

const PartnerVehicleFormModal = ({ open, onClose, vehicle, vehicles, onSubmit, loading, error }) => {
  const editingId = vehicle?.id ?? null;
  const isEditing = Boolean(vehicle);
  const [registrationError, setRegistrationError] = useState('');

  const defaults = isEditing ? toPartnerVehicleFormValues(vehicle) : partnerVehicleDefaultValues;

  const form = useZodForm({
    schema: partnerVehicleSchema,
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
      await onSubmit(toPartnerVehiclePayload(values));
    },
  });

  const handleRegistrationChange = (value) => {
    form.setField('registrationNumber', value);
    setRegistrationError('');
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
      subtitle={isEditing ? vehicle?.registrationNumber : 'Enregistrez un véhicule dans votre flotte partenaire.'}
      icon="bi-truck"
      size="lg"
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
            id="partner-vehicle-registration"
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
            id="partner-vehicle-brand"
            label="Marque"
            value={form.values.brand}
            onChange={(value) => form.setField('brand', value)}
            error={form.errors.brand}
            placeholder="Ex. Toyota"
          />
        </div>

        <div className="col-12 col-md-6">
          <TextField
            id="partner-vehicle-model"
            label="Modèle"
            value={form.values.model}
            onChange={(value) => form.setField('model', value)}
            error={form.errors.model}
            placeholder="Ex. Hilux"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="partner-vehicle-year"
            label="Année"
            type="number"
            inputMode="numeric"
            value={form.values.year}
            onChange={(value) => form.setField('year', value)}
            error={form.errors.year}
            placeholder={String(new Date().getFullYear())}
          />
        </div>

        <div className="col-12 col-md-6">
          <SelectField
            id="partner-vehicle-type"
            label="Type"
            value={form.values.type}
            onChange={(value) => form.setField('type', value)}
            options={toLabelOptions(PARTNER_VEHICLE_TYPE_VALUES, PARTNER_VEHICLE_TYPES)}
            placeholder="Sélectionner un type…"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="partner-vehicle-agency"
            label="Agence"
            value={form.values.agency}
            onChange={(value) => form.setField('agency', value)}
            options={PARTNER_AGENCIES.map((agency) => ({ value: agency, label: agency }))}
            placeholder="Sélectionner une agence…"
          />
        </div>

        <div className="col-12">
          <Divider>Exploitation</Divider>
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="partner-vehicle-mileage"
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
        <div className="col-12 col-md-6">
          <TextField
            id="partner-vehicle-service-date"
            label="Date de mise en service"
            type="date"
            value={form.values.serviceStartDate}
            onChange={(value) => form.setField('serviceStartDate', value)}
            error={form.errors.serviceStartDate}
          />
        </div>

        <div className="col-12 col-md-6">
          <TextField
            id="partner-vehicle-color"
            label="Couleur"
            value={form.values.color}
            onChange={(value) => form.setField('color', value)}
            error={form.errors.color}
            placeholder="Ex. Blanc"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="partner-vehicle-status"
            label="Statut"
            value={form.values.status}
            onChange={(value) => form.setField('status', value)}
            options={toLabelOptions(VEHICLE_STATUS_VALUES, VEHICLE_STATUSES)}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default PartnerVehicleFormModal;
