/**
 * Navix Drivers — DriverForm
 * --------------------------------------------------------------------------
 * Formulaire de création / édition d'un chauffeur. Validation exclusive Zod
 * (useZodForm), unicité simulée du code employé, agences restreintes à
 * l'entreprise sélectionnée, états chargement / erreur.
 *
 * Props :
 *   initialValues : valeurs initiales (valeurs par défaut pour la création)
 *   editingId     : id du chauffeur édité (unicité du code employé, sinon null)
 *   drivers       : liste chargée (contrôle d'unicité du code employé)
 *   companies     : liste des entreprises (options du sélecteur Entreprise)
 *   agencies      : liste des agences (restreintes par entreprise)
 *   onSubmit      : (values: object) => Promise<void>
 *   submitLabel   : libellé du bouton de soumission
 *   loading       : booléen — soumission en cours
 *   error         : erreur globale (affichée en alerte)
 *   onCancel      : () => void — retour en arrière
 */
import { useState } from 'react';
import { Alert, Button, Divider } from '@/components/ui';
import { useZodForm } from '@/features/auth';
import { driverSchema, driverDefaultValues } from '../schemas';
import {
  DRIVER_STATUSES,
  DRIVER_STATUS_VALUES,
  DRIVER_AVAILABILITY,
  DRIVER_AVAILABILITY_VALUES,
  LICENSE_CATEGORIES,
  LICENSE_CATEGORY_VALUES,
  DRIVER_GENDERS,
  GENDER_VALUES,
} from '../constants';
import './DriverForm.css';

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

const toLabelOptions = (values, meta) => values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const DriverForm = ({
  initialValues = driverDefaultValues,
  editingId = null,
  drivers = [],
  companies = [],
  agencies = [],
  onSubmit,
  submitLabel = 'Enregistrer',
  loading = false,
  error = null,
  onCancel,
}) => {
  const [employeeCodeError, setEmployeeCodeError] = useState('');

  const handleValidSubmit = async (data) => {
    const isDuplicate = drivers.some(
      (driver) =>
        driver.employeeCode.trim().toLowerCase() === data.employeeCode.trim().toLowerCase() &&
        driver.id !== editingId,
    );

    if (isDuplicate) {
      setEmployeeCodeError('Ce code employé est déjà utilisé par un autre chauffeur.');
      return;
    }

    await onSubmit(data);
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: driverSchema,
    defaultValues: initialValues,
    onSubmit: handleValidSubmit,
  });

  const handleEmployeeCodeChange = (value) => {
    setField('employeeCode', value);
    setEmployeeCodeError('');
  };

  const handleCompanyChange = (value) => {
    setField('companyId', value);
    setField('agencyId', '');
  };

  const agencyOptions = agencies.filter((agency) => !values.companyId || agency.companyId === values.companyId);

  return (
    <form onSubmit={handleSubmit} noValidate className="navix-driver-form">
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      <div className="row g-3">
        <div className="col-12">
          <Divider>Informations personnelles</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-first-name"
            label="Prénom"
            autoComplete="given-name"
            value={values.firstName}
            onChange={(value) => setField('firstName', value)}
            error={errors.firstName}
            placeholder="Ex. Yao"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-last-name"
            label="Nom"
            autoComplete="family-name"
            value={values.lastName}
            onChange={(value) => setField('lastName', value)}
            error={errors.lastName}
            placeholder="Ex. N'Guessan"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="driver-gender"
            label="Genre"
            value={values.gender}
            onChange={(value) => setField('gender', value)}
            options={toLabelOptions(GENDER_VALUES, DRIVER_GENDERS)}
            placeholder="Sélectionner…"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-birth-date"
            label="Date de naissance"
            type="date"
            value={values.birthDate}
            onChange={(value) => setField('birthDate', value)}
            error={errors.birthDate}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-phone"
            label="Téléphone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(value) => setField('phone', value)}
            error={errors.phone}
            placeholder="Ex. +237 07 07 77 77 77"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(value) => setField('email', value)}
            error={errors.email}
            placeholder="Ex. yao.nguessan@navix.cm"
          />
        </div>

        <div className="col-12">
          <Divider>Employé & affectation</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-employee-code"
            label="Code employé"
            value={values.employeeCode}
            onChange={handleEmployeeCodeChange}
            error={errors.employeeCode || employeeCodeError}
            hint="Code unique, ex. DRV-0014."
            placeholder="Ex. DRV-0014"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="driver-company"
            label="Entreprise"
            value={values.companyId}
            onChange={handleCompanyChange}
            options={companies.map((company) => ({ value: company.id, label: company.name }))}
            placeholder="Sélectionner une entreprise…"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="driver-agency"
            label="Agence"
            value={values.agencyId}
            onChange={(value) => setField('agencyId', value)}
            options={agencyOptions.map((agency) => ({ value: agency.id, label: agency.name }))}
            placeholder={values.companyId ? 'Sélectionner une agence…' : 'Choisir d’abord une entreprise'}
            disabled={!values.companyId}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="driver-status"
            label="Statut"
            value={values.status}
            onChange={(value) => setField('status', value)}
            options={toLabelOptions(DRIVER_STATUS_VALUES, DRIVER_STATUSES)}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="driver-availability"
            label="Disponibilité"
            value={values.availability}
            onChange={(value) => setField('availability', value)}
            options={toLabelOptions(DRIVER_AVAILABILITY_VALUES, DRIVER_AVAILABILITY)}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-experience"
            label="Années d’expérience"
            type="number"
            inputMode="numeric"
            value={values.yearsExperience}
            onChange={(value) => setField('yearsExperience', value)}
            error={errors.yearsExperience}
            hint="En années."
            placeholder="0"
          />
        </div>

        <div className="col-12">
          <Divider>Permis de conduire</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-license-number"
            label="Numéro de permis"
            value={values.licenseNumber}
            onChange={(value) => setField('licenseNumber', value)}
            error={errors.licenseNumber}
            placeholder="Ex. CI-2021-004577"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="driver-license-category"
            label="Catégorie de permis"
            value={values.licenseCategory}
            onChange={(value) => setField('licenseCategory', value)}
            options={LICENSE_CATEGORY_VALUES.map((category) => ({
              value: category,
              label: `${category} · ${LICENSE_CATEGORIES[category].label}`,
            }))}
            placeholder="Sélectionner une catégorie…"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-license-issue-date"
            label="Date de délivrance"
            type="date"
            value={values.licenseIssueDate}
            onChange={(value) => setField('licenseIssueDate', value)}
            error={errors.licenseIssueDate}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-license-expiry-date"
            label="Date d’expiration"
            type="date"
            value={values.licenseExpiryDate}
            onChange={(value) => setField('licenseExpiryDate', value)}
            error={errors.licenseExpiryDate}
            hint="Un rappel apparaît 90 jours avant l’expiration."
          />
        </div>

        <div className="col-12">
          <Divider>Contact, documents & urgence</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-address"
            label="Adresse"
            autoComplete="street-address"
            value={values.address}
            onChange={(value) => setField('address', value)}
            error={errors.address}
            placeholder="Ex. Bonapriso, Rue des Jardins"
          />
        </div>
        <div className="col-12 col-md-4 col-lg-3">
          <TextField
            id="driver-city"
            label="Ville"
            autoComplete="address-level2"
            value={values.city}
            onChange={(value) => setField('city', value)}
            error={errors.city}
            placeholder="Ex. Douala"
          />
        </div>
        <div className="col-12 col-md-4 col-lg-3">
          <TextField
            id="driver-country"
            label="Pays"
            autoComplete="country-name"
            value={values.country}
            onChange={(value) => setField('country', value)}
            error={errors.country}
            placeholder="Ex. Cameroun"
          />
        </div>
        <div className="col-12 col-md-4 col-lg-2">
          <TextField
            id="driver-nationality"
            label="Nationalité"
            value={values.nationality}
            onChange={(value) => setField('nationality', value)}
            error={errors.nationality}
            placeholder="Ex. Camerounaise"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-identity-document"
            label="Document d’identité"
            value={values.identityDocument}
            onChange={(value) => setField('identityDocument', value)}
            error={errors.identityDocument}
            hint="CNI ou passeport, ex. CNI-2020-458123."
            placeholder="Ex. CNI-2020-458123"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-photo"
            label="URL de la photo"
            type="url"
            inputMode="url"
            value={values.photo}
            onChange={(value) => setField('photo', value)}
            error={errors.photo}
            placeholder="https://…/photo-chauffeur.jpg"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-emergency-name"
            label="Contact d’urgence — nom"
            autoComplete="name"
            value={values.emergencyContactName}
            onChange={(value) => setField('emergencyContactName', value)}
            error={errors.emergencyContactName}
            placeholder="Ex. Marie N'Guessan"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="driver-emergency-phone"
            label="Contact d’urgence — téléphone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.emergencyContactPhone}
            onChange={(value) => setField('emergencyContactPhone', value)}
            error={errors.emergencyContactPhone}
            placeholder="Ex. +237 05 05 55 55 55"
          />
        </div>

        <div className="col-12">
          <TextAreaField
            id="driver-notes"
            label="Notes"
            value={values.notes}
            onChange={(value) => setField('notes', value)}
            error={errors.notes}
            rows={3}
            placeholder="Observations, restrictions médicales, affectation spéciale…"
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

export default DriverForm;
