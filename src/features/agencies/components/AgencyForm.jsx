/**
 * Navix Agencies — AgencyForm
 * --------------------------------------------------------------------------
 * Grille de champs métier d'une agence / site, embarquée dans le FormModal
 * générique de la bibliothèque core (qui fournit l'enveloppe <form>, le pied
 * Annuler / Enregistrer et l'alerte d'erreur globale). L'état du formulaire
 * (valeurs, erreurs Zod, setField, handleSubmit) est piloté par useZodForm
 * depuis la page — le composant reste 100 % déclaratif.
 *
 * Props :
 *   values   : valeurs contrôlées du formulaire
 *   errors   : { champ: message } — erreurs de validation Zod
 *   setField : (name: string, value: any) => void
 *   companies : liste des sociétés (options du champ Entreprise)
 *   drivers  : liste des chauffeurs (options du champ Responsable)
 */
import { Divider } from '@/components/ui';
import { COUNTRIES } from '@/features/companies';
import {
  AGENCY_TYPES,
  AGENCY_TYPE_VALUES,
  AGENCY_STATUSES,
  AGENCY_STATUS_VALUES,
  DEFAULT_OPENING_HOURS,
} from '../constants';
import './AgencyForm.css';

const toLabelOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const FieldError = ({ id, error }) =>
  error ? (
    <div className="invalid-feedback d-block" id={id}>
      {error}
    </div>
  ) : null;

const AgencyForm = ({ values, errors = {}, setField, companies = [], drivers = [] }) => (
  <div className="row g-3 navix-agency-form">
    <div className="col-12">
      <Divider>Rattachement</Divider>
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-company">
        Entreprise
      </label>
      <select
        id="agency-company"
        className={errors.companyId ? 'form-select is-invalid' : 'form-select'}
        value={values.companyId}
        onChange={(event) => setField('companyId', event.target.value)}
        aria-invalid={errors.companyId ? true : undefined}
        aria-describedby={errors.companyId ? 'agency-company-error' : undefined}
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
      <FieldError id="agency-company-error" error={errors.companyId} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-name">
        Nom de l’agence
      </label>
      <input
        id="agency-name"
        type="text"
        className={errors.name ? 'form-control is-invalid' : 'form-control'}
        value={values.name}
        onChange={(event) => setField('name', event.target.value)}
        placeholder="Ex. Agence Abidjan"
        aria-invalid={errors.name ? true : undefined}
        aria-describedby={errors.name ? 'agency-name-error' : undefined}
      />
      <FieldError id="agency-name-error" error={errors.name} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-code">
        Code
      </label>
      <input
        id="agency-code"
        type="text"
        className={errors.code ? 'form-control is-invalid' : 'form-control'}
        value={values.code}
        onChange={(event) => setField('code', event.target.value)}
        placeholder="Ex. AG-ABJ"
        aria-invalid={errors.code ? true : undefined}
        aria-describedby={errors.code ? 'agency-code-error' : undefined}
      />
      <FieldError id="agency-code-error" error={errors.code} />
    </div>

    <div className="col-12">
      <Divider>Identification</Divider>
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-type">
        Type d’agence
      </label>
      <select
        id="agency-type"
        className={errors.type ? 'form-select is-invalid' : 'form-select'}
        value={values.type}
        onChange={(event) => setField('type', event.target.value)}
        aria-invalid={errors.type ? true : undefined}
        aria-describedby={errors.type ? 'agency-type-error' : undefined}
      >
        {toLabelOptions(AGENCY_TYPE_VALUES, AGENCY_TYPES).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id="agency-type-error" error={errors.type} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-status">
        Statut
      </label>
      <select
        id="agency-status"
        className={errors.status ? 'form-select is-invalid' : 'form-select'}
        value={values.status}
        onChange={(event) => setField('status', event.target.value)}
        aria-invalid={errors.status ? true : undefined}
        aria-describedby={errors.status ? 'agency-status-error' : undefined}
      >
        {toLabelOptions(AGENCY_STATUS_VALUES, AGENCY_STATUSES).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id="agency-status-error" error={errors.status} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-manager">
        Responsable
      </label>
      <select
        id="agency-manager"
        className="form-select"
        value={values.managerId}
        onChange={(event) => setField('managerId', event.target.value)}
      >
        <option value="">Aucun responsable</option>
        {drivers.map((driver) => (
          <option key={driver.id} value={driver.id}>
            {driver.fullName}
          </option>
        ))}
      </select>
    </div>

    <div className="col-12">
      <label className="form-label" htmlFor="agency-description">
        Description
      </label>
      <textarea
        id="agency-description"
        className="form-control"
        rows={2}
        value={values.description}
        onChange={(event) => setField('description', event.target.value)}
        placeholder="Rôle du site, activités, contraintes…"
      />
    </div>

    <div className="col-12">
      <Divider>Coordonnées</Divider>
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-address">
        Adresse
      </label>
      <textarea
        id="agency-address"
        className="form-control"
        rows={2}
        value={values.address}
        onChange={(event) => setField('address', event.target.value)}
        placeholder="Rue, quartier, bâtiment…"
      />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-city">
        Ville
      </label>
      <input
        id="agency-city"
        type="text"
        className={errors.city ? 'form-control is-invalid' : 'form-control'}
        value={values.city}
        onChange={(event) => setField('city', event.target.value)}
        placeholder="Ex. Abidjan"
        aria-invalid={errors.city ? true : undefined}
        aria-describedby={errors.city ? 'agency-city-error' : undefined}
      />
      <FieldError id="agency-city-error" error={errors.city} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-region">
        Région
      </label>
      <input
        id="agency-region"
        type="text"
        className="form-control"
        value={values.region}
        onChange={(event) => setField('region', event.target.value)}
        placeholder="Ex. District d’Abidjan"
      />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-country">
        Pays
      </label>
      <select
        id="agency-country"
        className={errors.country ? 'form-select is-invalid' : 'form-select'}
        value={values.country}
        onChange={(event) => setField('country', event.target.value)}
        aria-invalid={errors.country ? true : undefined}
        aria-describedby={errors.country ? 'agency-country-error' : undefined}
      >
        {COUNTRIES.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      <FieldError id="agency-country-error" error={errors.country} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-postal-code">
        Code postal
      </label>
      <input
        id="agency-postal-code"
        type="text"
        className="form-control"
        value={values.postalCode}
        onChange={(event) => setField('postalCode', event.target.value)}
        placeholder="Ex. 01 BP 1234"
      />
    </div>

    <div className="col-12">
      <Divider>Contact</Divider>
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-phone">
        Téléphone
      </label>
      <input
        id="agency-phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        className={errors.phone ? 'form-control is-invalid' : 'form-control'}
        value={values.phone}
        onChange={(event) => setField('phone', event.target.value)}
        placeholder="+225 27 22 48 19 00"
        aria-invalid={errors.phone ? true : undefined}
        aria-describedby={errors.phone ? 'agency-phone-error' : undefined}
      />
      <FieldError id="agency-phone-error" error={errors.phone} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-email">
        Adresse email
      </label>
      <input
        id="agency-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        className={errors.email ? 'form-control is-invalid' : 'form-control'}
        value={values.email}
        onChange={(event) => setField('email', event.target.value)}
        placeholder="agence@entreprise.com"
        aria-invalid={errors.email ? true : undefined}
        aria-describedby={errors.email ? 'agency-email-error' : undefined}
      />
      <FieldError id="agency-email-error" error={errors.email} />
    </div>

    <div className="col-12">
      <Divider>Horaires & localisation</Divider>
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="agency-opening-hours">
        Horaires d’ouverture
      </label>
      <input
        id="agency-opening-hours"
        type="text"
        className="form-control"
        value={values.openingHours}
        onChange={(event) => setField('openingHours', event.target.value)}
        placeholder={DEFAULT_OPENING_HOURS}
      />
    </div>

    <div className="col-6 col-md-4 col-lg-2">
      <label className="form-label" htmlFor="agency-latitude">
        Latitude
      </label>
      <input
        id="agency-latitude"
        type="number"
        inputMode="decimal"
        step="any"
        className={errors.latitude ? 'form-control is-invalid' : 'form-control'}
        value={values.latitude}
        onChange={(event) => setField('latitude', event.target.value)}
        placeholder="5.3599"
        aria-invalid={errors.latitude ? true : undefined}
        aria-describedby={errors.latitude ? 'agency-latitude-error' : undefined}
      />
      <FieldError id="agency-latitude-error" error={errors.latitude} />
    </div>

    <div className="col-6 col-md-4 col-lg-2">
      <label className="form-label" htmlFor="agency-longitude">
        Longitude
      </label>
      <input
        id="agency-longitude"
        type="number"
        inputMode="decimal"
        step="any"
        className={errors.longitude ? 'form-control is-invalid' : 'form-control'}
        value={values.longitude}
        onChange={(event) => setField('longitude', event.target.value)}
        placeholder="-4.0083"
        aria-invalid={errors.longitude ? true : undefined}
        aria-describedby={errors.longitude ? 'agency-longitude-error' : undefined}
      />
      <FieldError id="agency-longitude-error" error={errors.longitude} />
    </div>
  </div>
);

export default AgencyForm;
