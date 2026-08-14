/**
 * Navix Vehicles — VehicleForm
 * --------------------------------------------------------------------------
 * Formulaire de création / édition d'un véhicule. Validation exclusive Zod
 * (useZodForm), unicité simulée de l'immatriculation, groupe lié à sa liste
 * de catégories, états chargement / erreur.
 *
 * Props :
 *   initialValues : valeurs initiales (valeurs par défaut pour la création)
 *   editingId     : id du véhicule édité (unicité immatriculation, sinon null)
 *   vehicles      : liste chargée (contrôle d'unicité de l'immatriculation)
 *   companies     : liste des entreprises (options du sélecteur Entreprise)
 *   onSubmit      : (values: object) => Promise<void>
 *   submitLabel   : libellé du bouton de soumission
 *   loading       : booléen — soumission en cours
 *   error         : erreur globale (affichée en alerte)
 *   onCancel      : () => void — retour en arrière
 */
import { useState } from 'react';
import { Alert, Button, Divider } from '@/components/ui';
import { useZodForm } from '@/features/auth';
import { vehicleSchema, vehicleDefaultValues } from '../schemas';
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
  MIN_VEHICLE_YEAR,
} from '../constants';
import './VehicleForm.css';

const TextField = ({ id, label, value, onChange, error, hint, placeholder, type = 'text', inputMode, autoComplete, disabled }) => (
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
      disabled={disabled}
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

const toLabelOptions = (values, meta) => values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const VehicleForm = ({
  initialValues = vehicleDefaultValues,
  editingId = null,
  vehicles = [],
  companies = [],
  onSubmit,
  submitLabel = 'Enregistrer',
  loading = false,
  error = null,
  onCancel,
}) => {
  const [registrationError, setRegistrationError] = useState('');

  const handleValidSubmit = async (data) => {
    const isDuplicate = vehicles.some(
      (vehicle) =>
        vehicle.registrationNumber.trim().toLowerCase() === data.registrationNumber.trim().toLowerCase() &&
        vehicle.id !== editingId,
    );

    if (isDuplicate) {
      setRegistrationError('Cette immatriculation est déjà utilisée par un autre véhicule.');
      return;
    }

    await onSubmit(data);
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: vehicleSchema,
    defaultValues: initialValues,
    onSubmit: handleValidSubmit,
  });

  const handleRegistrationChange = (value) => {
    setField('registrationNumber', value);
    setRegistrationError('');
  };

  const handleGroupChange = (value) => {
    setField('group', value);
    setField('category', '');
  };

  const categoryOptions = getGroupCategories(values.group).map((category) => ({ value: category, label: category }));

  return (
    <form onSubmit={handleSubmit} noValidate className="navix-vehicle-form">
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      <div className="row g-3">
        <div className="col-12">
          <Divider>Identification</Divider>
        </div>

        <div className="col-12 col-md-6">
          <TextField
            id="vehicle-registration"
            label="Immatriculation"
            value={values.registrationNumber}
            onChange={handleRegistrationChange}
            error={errors.registrationNumber || registrationError}
            hint="Numéro unique, ex. AB-3824-KL."
            placeholder="Ex. AB-3824-KL"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="vehicle-vin"
            label="VIN"
            value={values.vin}
            onChange={(value) => setField('vin', value)}
            error={errors.vin}
            hint="17 caractères (lettres et chiffres)."
            placeholder="Ex. JTMHV05J2N4011234"
          />
        </div>

        <div className="col-12">
          <Divider>Entreprise & affectation</Divider>
        </div>

        <div className="col-12 col-md-6">
          <SelectField
            id="vehicle-company"
            label="Entreprise"
            value={values.companyId}
            onChange={(value) => setField('companyId', value)}
            options={companies.map((company) => ({ value: company.id, label: company.name }))}
            placeholder="Sélectionner une entreprise…"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="vehicle-agency"
            label="Agence"
            value={values.agency}
            onChange={(value) => setField('agency', value)}
            error={errors.agency}
            placeholder="Ex. Agence Douala"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="vehicle-current-driver"
            label="Conducteur actuel"
            autoComplete="name"
            value={values.currentDriver}
            onChange={(value) => setField('currentDriver', value)}
            error={errors.currentDriver}
            placeholder="Ex. Yao N'Guessan"
          />
        </div>

        <div className="col-12">
          <Divider>Caractéristiques</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="vehicle-group"
            label="Groupe"
            value={values.group}
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
            id="vehicle-category"
            label="Catégorie"
            value={values.category}
            onChange={(value) => setField('category', value)}
            options={categoryOptions}
            placeholder={values.group ? 'Sélectionner une catégorie…' : 'Choisir d’abord un groupe'}
            disabled={!values.group}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="vehicle-status"
            label="Statut"
            value={values.status}
            onChange={(value) => setField('status', value)}
            options={toLabelOptions(VEHICLE_STATUS_VALUES, VEHICLE_STATUSES)}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="vehicle-brand"
            label="Marque"
            value={values.brand}
            onChange={(value) => setField('brand', value)}
            error={errors.brand}
            placeholder="Ex. Toyota"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="vehicle-model"
            label="Modèle"
            value={values.model}
            onChange={(value) => setField('model', value)}
            error={errors.model}
            placeholder="Ex. Hilux"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="vehicle-version"
            label="Version"
            value={values.version}
            onChange={(value) => setField('version', value)}
            error={errors.version}
            placeholder="Ex. Double Cabine"
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="vehicle-year"
            label="Année"
            type="number"
            inputMode="numeric"
            value={values.year}
            onChange={(value) => setField('year', value)}
            error={errors.year}
            placeholder={String(new Date().getFullYear())}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="vehicle-color"
            label="Couleur"
            value={values.color}
            onChange={(value) => setField('color', value)}
            error={errors.color}
            placeholder="Ex. Blanc"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <SelectField
            id="vehicle-fuel"
            label="Carburant"
            value={values.fuelType}
            onChange={(value) => setField('fuelType', value)}
            options={toLabelOptions(FUEL_TYPE_VALUES, FUEL_TYPES)}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <SelectField
            id="vehicle-transmission"
            label="Transmission"
            value={values.transmission}
            onChange={(value) => setField('transmission', value)}
            options={toLabelOptions(TRANSMISSION_VALUES, TRANSMISSIONS)}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="vehicle-mileage"
            label="Kilométrage"
            type="number"
            inputMode="numeric"
            value={values.mileage}
            onChange={(value) => setField('mileage', value)}
            error={errors.mileage}
            hint="En kilomètres."
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="vehicle-capacity"
            label="Capacité"
            type="number"
            inputMode="numeric"
            value={values.capacity}
            onChange={(value) => setField('capacity', value)}
            error={errors.capacity}
            hint="Passagers ou tonnes selon le véhicule."
            placeholder="0"
          />
        </div>
        <div className="col-12 col-lg-4">
          <TextField
            id="vehicle-photo"
            label="URL de la photo"
            type="url"
            inputMode="url"
            value={values.photo}
            onChange={(value) => setField('photo', value)}
            error={errors.photo}
            placeholder="https://…/photo-vehicule.jpg"
          />
        </div>

        <div className="col-12">
          <Divider>Documents & validité</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="vehicle-purchase-date"
            label="Date d’achat"
            type="date"
            value={values.purchaseDate}
            onChange={(value) => setField('purchaseDate', value)}
            error={errors.purchaseDate}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="vehicle-insurance-expiry"
            label="Expiration assurance"
            type="date"
            value={values.insuranceExpiry}
            onChange={(value) => setField('insuranceExpiry', value)}
            error={errors.insuranceExpiry}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="vehicle-inspection-expiry"
            label="Expiration visite technique"
            type="date"
            value={values.inspectionExpiry}
            onChange={(value) => setField('inspectionExpiry', value)}
            error={errors.inspectionExpiry}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TextField
            id="vehicle-registration-expiry"
            label="Expiration carte grise"
            type="date"
            value={values.registrationExpiry}
            onChange={(value) => setField('registrationExpiry', value)}
            error={errors.registrationExpiry}
          />
        </div>

        <div className="col-12">
          <TextAreaField
            id="vehicle-notes"
            label="Notes"
            value={values.notes}
            onChange={(value) => setField('notes', value)}
            error={errors.notes}
            rows={3}
            placeholder="Observations, entretiens à prévoir, affectation spéciale…"
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

export default VehicleForm;
