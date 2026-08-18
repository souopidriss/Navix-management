import { useState } from 'react';
import { Divider } from '@/components/ui';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  driverSchema,
  driverDefaultValues,
  toDriverFormValues,
  toDriverPayload,
} from '@/features/drivers/schemas';
import {
  DRIVER_STATUSES,
  DRIVER_STATUS_VALUES,
  DRIVER_AVAILABILITY,
  DRIVER_AVAILABILITY_VALUES,
  LICENSE_CATEGORIES,
  LICENSE_CATEGORY_VALUES,
  DRIVER_GENDERS,
  GENDER_VALUES,
} from '@/features/drivers/constants';
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

const ClientDriverFormModal = ({ open, onClose, driver, drivers, onSubmit, loading, error }) => {
  const isEditing = Boolean(driver);
  const editingId = driver?.id ?? null;
  const [employeeCodeError, setEmployeeCodeError] = useState('');

  const baseDefaults = {
    ...driverDefaultValues,
    companyId: CLIENT_FLEET_COMPANY_ID,
  };

  const defaults = isEditing
    ? { ...toDriverFormValues(driver), companyId: CLIENT_FLEET_COMPANY_ID }
    : baseDefaults;

  const form = useZodForm({
    schema: driverSchema,
    defaultValues: defaults,
    onSubmit: async (values) => {
      const isDuplicate = drivers.some(
        (item) =>
          item.employeeCode.trim().toLowerCase() === values.employeeCode.trim().toLowerCase() &&
          item.id !== editingId,
      );
      if (isDuplicate) {
        setEmployeeCodeError('Ce code employé est déjà enregistré dans votre flotte.');
        return;
      }
      await onSubmit(toDriverPayload(values));
    },
  });

  const handleEmployeeCodeChange = (value) => {
    form.setField('employeeCode', value);
    setEmployeeCodeError('');
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le chauffeur' : 'Ajouter un chauffeur'}
      subtitle={isEditing ? driver?.fullName : 'Enregistrez un chauffeur dans votre flotte.'}
      icon="bi-person-vcard"
      size="xl"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel={isEditing ? 'Enregistrer les modifications' : 'Ajouter le chauffeur'}
    >
      <div className="row g-3">
        <div className="col-12">
          <Divider>Identité</Divider>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-first-name"
            label="Prénom"
            value={form.values.firstName}
            onChange={(value) => form.setField('firstName', value)}
            error={form.errors.firstName}
            placeholder="Ex. Jean"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-last-name"
            label="Nom"
            value={form.values.lastName}
            onChange={(value) => form.setField('lastName', value)}
            error={form.errors.lastName}
            placeholder="Ex. Mbarga"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="client-driver-gender"
            label="Genre"
            value={form.values.gender}
            onChange={(value) => form.setField('gender', value)}
            options={toLabelOptions(GENDER_VALUES, DRIVER_GENDERS)}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-birth-date"
            label="Date de naissance"
            type="date"
            value={form.values.birthDate}
            onChange={(value) => form.setField('birthDate', value)}
            error={form.errors.birthDate}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-phone"
            label="Téléphone"
            value={form.values.phone}
            onChange={(value) => form.setField('phone', value)}
            error={form.errors.phone}
            placeholder="Ex. +237 6 99 00 11 22"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-email"
            label="Email"
            type="email"
            value={form.values.email}
            onChange={(value) => form.setField('email', value)}
            error={form.errors.email}
            placeholder="Ex. jean.mbarga@express-cameroun.cm"
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-employee-code"
            label="Code employé"
            value={form.values.employeeCode}
            onChange={handleEmployeeCodeChange}
            error={form.errors.employeeCode || employeeCodeError}
            hint="Identifiant interne unique."
            placeholder="Ex. CDR-0015"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="client-driver-agency"
            label="Agence"
            value={form.values.agencyId}
            onChange={(value) => form.setField('agencyId', value)}
            options={AGENCY_OPTIONS.map((agency) => ({ value: agency, label: agency }))}
            placeholder="Sélectionner une agence…"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="client-driver-city"
            label="Ville"
            value={form.values.city}
            onChange={(value) => form.setField('city', value)}
            options={CAMEROON_CITIES.map((city) => ({ value: city, label: city }))}
            placeholder="Sélectionner une ville…"
          />
        </div>

        <div className="col-12">
          <Divider>Permis de conduire</Divider>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-license-number"
            label="Numéro de permis"
            value={form.values.licenseNumber}
            onChange={(value) => form.setField('licenseNumber', value)}
            error={form.errors.licenseNumber}
            placeholder="Ex. LIC-CM-2020-12345"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="client-driver-license-category"
            label="Catégorie"
            value={form.values.licenseCategory}
            onChange={(value) => form.setField('licenseCategory', value)}
            options={toLabelOptions(LICENSE_CATEGORY_VALUES, LICENSE_CATEGORIES)}
            placeholder="Sélectionner une catégorie…"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-license-expiry"
            label="Expiration du permis"
            type="date"
            value={form.values.licenseExpiryDate}
            onChange={(value) => form.setField('licenseExpiryDate', value)}
            error={form.errors.licenseExpiryDate}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-experience"
            label="Années d’expérience"
            type="number"
            inputMode="numeric"
            value={form.values.yearsExperience}
            onChange={(value) => form.setField('yearsExperience', value)}
            error={form.errors.yearsExperience}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-identity"
            label="Pièce d’identité"
            value={form.values.identityDocument}
            onChange={(value) => form.setField('identityDocument', value)}
            placeholder="Ex. CNI-AB-2022-123456"
          />
        </div>

        <div className="col-12">
          <Divider>Statut & disponibilité</Divider>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="client-driver-status"
            label="Statut"
            value={form.values.status}
            onChange={(value) => form.setField('status', value)}
            options={toLabelOptions(DRIVER_STATUS_VALUES, DRIVER_STATUSES)}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="client-driver-availability"
            label="Disponibilité"
            value={form.values.availability}
            onChange={(value) => form.setField('availability', value)}
            options={toLabelOptions(DRIVER_AVAILABILITY_VALUES, DRIVER_AVAILABILITY)}
          />
        </div>

        <div className="col-12">
          <Divider>Coordonnées & urgence</Divider>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-address"
            label="Adresse"
            value={form.values.address}
            onChange={(value) => form.setField('address', value)}
            placeholder="Ex. Akwa, Bd de la Liberté"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-emergency-name"
            label="Contact d’urgence (nom)"
            value={form.values.emergencyContactName}
            onChange={(value) => form.setField('emergencyContactName', value)}
            placeholder="Ex. Awa Mbarga"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <TextField
            id="client-driver-emergency-phone"
            label="Contact d’urgence (téléphone)"
            value={form.values.emergencyContactPhone}
            onChange={(value) => form.setField('emergencyContactPhone', value)}
            placeholder="Ex. +237 6 88 00 11 22"
          />
        </div>

        <div className="col-12">
          <Divider>Notes</Divider>
        </div>
        <div className="col-12">
          <TextAreaField
            id="client-driver-notes"
            label="Notes"
            value={form.values.notes}
            onChange={(value) => form.setField('notes', value)}
            error={form.errors.notes}
            rows={3}
            placeholder="Observations, contraintes, missions habituelles…"
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientDriverFormModal;
