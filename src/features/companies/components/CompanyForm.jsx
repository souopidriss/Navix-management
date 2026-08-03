/**
 * Navix Companies — CompanyForm
 * --------------------------------------------------------------------------
 * Formulaire de création / édition d'une entreprise. Validation exclusive
 * Zod (useZodForm), unicité simulée du code, états chargement / erreur.
 * Le propriétaire est saisi via des champs aplatis (ownerName / ownerEmail).
 *
 * Props :
 *   initialValues : valeurs initiales (valeurs par défaut pour la création)
 *   editingId     : id de l'entreprise éditée (unicité du code, sinon null)
 *   companies     : liste chargée (contrôle d'unicité du code)
 *   onSubmit      : (values: object) => Promise<void> — valeurs aplaties
 *   submitLabel   : libellé du bouton de soumission
 *   loading       : booléen — soumission en cours
 *   error         : erreur globale (affichée en alerte)
 *   onCancel      : () => void — retour en arrière
 */
import { useState } from 'react';
import { Alert, Button, Divider } from '@/components/ui';
import { useZodForm } from '@/features/auth';
import {
  companySchema,
  companyDefaultValues,
} from '../schemas';
import {
  COUNTRIES,
  COMPANY_STATUSES,
  COMPANY_STATUS_VALUES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PLAN_VALUES,
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_STATUS_VALUES,
} from '../constants';
import './CompanyForm.css';

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

const CompanyForm = ({
  initialValues = companyDefaultValues,
  editingId = null,
  companies = [],
  onSubmit,
  submitLabel = 'Enregistrer',
  loading = false,
  error = null,
  onCancel,
}) => {
  const [codeError, setCodeError] = useState('');

  const handleValidSubmit = async (data) => {
    const isDuplicate = companies.some(
      (company) =>
        company.code.trim().toLowerCase() === data.code.trim().toLowerCase() && company.id !== editingId,
    );

    if (isDuplicate) {
      setCodeError('Ce code est déjà utilisé par une autre entreprise.');
      return;
    }

    await onSubmit(data);
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: companySchema,
    defaultValues: initialValues,
    onSubmit: handleValidSubmit,
  });

  const handleCodeChange = (value) => {
    setField('code', value);
    setCodeError('');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="navix-company-form">
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <TextField
            id="company-name"
            label="Nom de l’entreprise"
            value={values.name}
            onChange={(value) => setField('name', value)}
            error={errors.name}
            placeholder="Ex. Navix Trans"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="company-code"
            label="Code"
            value={values.code}
            onChange={handleCodeChange}
            error={errors.code || codeError}
            hint="Code unique, ex. NAVX-TRS (lettres, chiffres, tirets)."
            placeholder="Ex. NAVX-TRS"
          />
        </div>

        <div className="col-12 col-md-6">
          <TextField
            id="company-email"
            label="Adresse email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(value) => setField('email', value)}
            error={errors.email}
            placeholder="contact@entreprise.com"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="company-phone"
            label="Téléphone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(value) => setField('phone', value)}
            error={errors.phone}
            placeholder="+225 27 22 48 19 00"
          />
        </div>

        <div className="col-12 col-md-6">
          <TextField
            id="company-website"
            label="Site web"
            type="url"
            inputMode="url"
            value={values.website}
            onChange={(value) => setField('website', value)}
            error={errors.website}
            placeholder="https://www.entreprise.com"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="company-logo"
            label="URL du logo"
            type="url"
            value={values.logo}
            onChange={(value) => setField('logo', value)}
            error={errors.logo}
            placeholder="https://www.entreprise.com/logo.png"
          />
        </div>

        <div className="col-12 col-md-6">
          <SelectField
            id="company-country"
            label="Pays"
            value={values.country}
            onChange={(value) => setField('country', value)}
            options={COUNTRIES.map((country) => ({ value: country, label: country }))}
            placeholder="Sélectionner un pays…"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="company-city"
            label="Ville"
            value={values.city}
            onChange={(value) => setField('city', value)}
            error={errors.city}
            placeholder="Ex. Abidjan"
          />
        </div>

        <div className="col-12">
          <TextAreaField
            id="company-address"
            label="Adresse"
            value={values.address}
            onChange={(value) => setField('address', value)}
            error={errors.address}
            rows={2}
            placeholder="Adresse complète du siège"
          />
        </div>

        <div className="col-12">
          <Divider>Abonnement</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="company-status"
            label="Statut"
            value={values.status}
            onChange={(value) => setField('status', value)}
            options={toLabelOptions(COMPANY_STATUS_VALUES, COMPANY_STATUSES)}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="company-subscription-plan"
            label="Plan d’abonnement"
            value={values.subscriptionPlan}
            onChange={(value) => setField('subscriptionPlan', value)}
            options={toLabelOptions(SUBSCRIPTION_PLAN_VALUES, SUBSCRIPTION_PLANS)}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <SelectField
            id="company-subscription-status"
            label="Statut de l’abonnement"
            value={values.subscriptionStatus}
            onChange={(value) => setField('subscriptionStatus', value)}
            options={toLabelOptions(SUBSCRIPTION_STATUS_VALUES, SUBSCRIPTION_STATUSES)}
          />
        </div>

        <div className="col-12">
          <Divider>Propriétaire</Divider>
        </div>

        <div className="col-12 col-md-6">
          <TextField
            id="company-owner-name"
            label="Nom du propriétaire"
            autoComplete="name"
            value={values.ownerName}
            onChange={(value) => setField('ownerName', value)}
            error={errors.ownerName}
            placeholder="Ex. Awa Kouamé"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="company-owner-email"
            label="Email du propriétaire"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.ownerEmail}
            onChange={(value) => setField('ownerEmail', value)}
            error={errors.ownerEmail}
            placeholder="proprietaire@entreprise.com"
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

export default CompanyForm;
