import { z } from 'zod';
import { Divider } from '@/components/ui';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import { fuelSchema, fuelDefaultValues, toFuelPayload } from '@/features/fuel/schemas';
import { FUEL_TYPES, FUEL_TYPE_VALUES, PAYMENT_METHODS, PAYMENT_METHOD_VALUES } from '@/features/fuel/constants';
import { CLIENT_FLEET_COMPANY_ID } from '../../services/clientVehicleService';
import { CAMEROON_CITIES } from '../../constants/client.constants';

const clientFuelSchema = fuelSchema.extend({
  fuelDate: z.string().trim().optional(),
});

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

const SelectField = ({ id, label, value, onChange, options, placeholder = 'Sélectionner…', disabled, hint, error }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      className={error ? 'form-select is-invalid' : 'form-select'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
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
    {error ? (
      <div className="invalid-feedback d-block">{error}</div>
    ) : hint ? (
      <small className="form-text text-secondary">{hint}</small>
    ) : null}
  </div>
);

/**
 * Modale d'enregistrement d'un plein de carburant (flotte Client).
 * Le montant total et la consommation moyenne sont calculés par le service.
 * Le kilométrage saisi doit être supérieur au dernier plein du véhicule.
 */
const ClientFuelFormModal = ({ open, onClose, vehicles, drivers, onSubmit, loading, error }) => {
  const form = useZodForm({
    schema: clientFuelSchema,
    defaultValues: {
      ...fuelDefaultValues,
      companyId: CLIENT_FLEET_COMPANY_ID,
      fuelDate: new Date().toISOString().slice(0, 10),
    },
    onSubmit: async (values) => {
      await onSubmit({ ...toFuelPayload(values), fuelDate: values.fuelDate || '' });
    },
  });

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: vehicle.id,
    label: `${vehicle.brand} ${vehicle.model} · ${vehicle.registrationNumber}`,
  }));

  const driverOptions = drivers.map((driver) => ({
    value: driver.id,
    label: driver.fullName || `${driver.firstName || ''} ${driver.lastName || ''}`.trim(),
  }));

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Enregistrer un plein"
      subtitle="Relevez le plein effectué sur votre flotte."
      icon="bi-fuel-pump"
      size="lg"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Enregistrer le plein"
    >
      <div className="row g-3">
        <div className="col-12">
          <Divider>Identification</Divider>
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-fuel-vehicle"
            label="Véhicule"
            value={form.values.vehicleId}
            onChange={(value) => form.setField('vehicleId', value)}
            options={vehicleOptions}
            error={form.errors.vehicleId}
            placeholder="Sélectionner un véhicule…"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-fuel-type"
            label="Type de carburant"
            value={form.values.fuelType}
            onChange={(value) => form.setField('fuelType', value)}
            options={FUEL_TYPE_VALUES.map((type) => ({ value: type, label: FUEL_TYPES[type].label }))}
            error={form.errors.fuelType}
            placeholder="Sélectionner un type…"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-fuel-driver"
            label="Chauffeur"
            value={form.values.driverId}
            onChange={(value) => form.setField('driverId', value)}
            options={driverOptions}
            hint="Optionnel."
            placeholder="Sélectionner un chauffeur…"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-fuel-method"
            label="Mode de paiement"
            value={form.values.paymentMethod}
            onChange={(value) => form.setField('paymentMethod', value)}
            options={PAYMENT_METHOD_VALUES.map((method) => ({ value: method, label: PAYMENT_METHODS[method].label }))}
            error={form.errors.paymentMethod}
            placeholder="Sélectionner un mode…"
          />
        </div>

        <div className="col-12">
          <Divider>Station</Divider>
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-fuel-station-name"
            label="Station-service"
            value={form.values.stationName}
            onChange={(value) => form.setField('stationName', value)}
            error={form.errors.stationName}
            placeholder="Ex. TotalEnergies Akwa"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-fuel-city"
            label="Ville"
            value={form.values.stationCity}
            onChange={(value) => form.setField('stationCity', value)}
            options={CAMEROON_CITIES.map((city) => ({ value: city, label: city }))}
            placeholder="Sélectionner une ville…"
          />
        </div>

        <div className="col-12">
          <Divider>Quantités & coûts (FCFA)</Divider>
        </div>
        <div className="col-12 col-md-4">
          <TextField
            id="client-fuel-date"
            label="Date du plein"
            type="date"
            value={form.values.fuelDate}
            onChange={(value) => form.setField('fuelDate', value)}
            error={form.errors.fuelDate}
          />
        </div>
        <div className="col-12 col-md-4">
          <TextField
            id="client-fuel-quantity"
            label="Quantité (L)"
            type="number"
            inputMode="numeric"
            value={form.values.quantity}
            onChange={(value) => form.setField('quantity', value)}
            error={form.errors.quantity}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-4">
          <TextField
            id="client-fuel-unit-price"
            label="Prix unitaire (FCFA/L)"
            type="number"
            inputMode="numeric"
            value={form.values.unitPrice}
            onChange={(value) => form.setField('unitPrice', value)}
            error={form.errors.unitPrice}
            hint="Ex. 605 FCFA/L diesel, 660 FCFA/L essence."
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-fuel-mileage"
            label="Kilométrage"
            type="number"
            inputMode="numeric"
            value={form.values.mileage}
            onChange={(value) => form.setField('mileage', value)}
            error={form.errors.mileage}
            hint="Doit être supérieur au dernier plein du véhicule."
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-fuel-invoice"
            label="Numéro de facture"
            value={form.values.invoiceNumber}
            onChange={(value) => form.setField('invoiceNumber', value)}
            placeholder="Ex. FACT-2026-0815"
          />
        </div>
        <div className="col-12">
          <TextField
            id="client-fuel-notes"
            label="Notes"
            value={form.values.notes}
            onChange={(value) => form.setField('notes', value)}
            placeholder="Observations sur le plein…"
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientFuelFormModal;
