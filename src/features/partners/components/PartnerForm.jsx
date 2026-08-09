/**
 * Navix Partners — PartnerForm
 * --------------------------------------------------------------------------
 * Grille de champs métier d'un partenaire, embarquée dans le FormModal
 * générique de la bibliothèque core (qui fournit l'enveloppe <form>, le
 * pied Annuler / Enregistrer et l'alerte d'erreur globale). L'état du
 * formulaire (valeurs, erreurs Zod, setField, handleSubmit) est piloté par
 * useZodForm depuis la page — le composant reste 100 % déclaratif.
 *
 * Props :
 *   values     : valeurs contrôlées du formulaire
 *   errors     : { champ: message } — erreurs de validation Zod
 *   setField   : (name: string, value: any) => void
 *   companies  : liste des entreprises (champ Entreprise)
 */
import {
  PARTNER_TYPES,
  PARTNER_TYPE_VALUES,
  PARTNER_STATUSES,
  PARTNER_STATUS_VALUES,
} from '../constants';
import './PartnerForm.css';

const toLabelOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const FieldError = ({ id, error }) =>
  error ? (
    <div className="invalid-feedback d-block" id={id}>
      {error}
    </div>
  ) : null;

const PartnerForm = ({ values, errors = {}, setField, companies = [] }) => (
  <div className="row g-3 navix-partner-form">
    <div className="col-12">
      <div className="navix-partner-form__section">
        <i className="bi bi-handshake me-1" aria-hidden="true" /> Identification
      </div>
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-name">
        Nom du partenaire
      </label>
      <input
        id="partner-name"
        type="text"
        className={errors.name ? 'form-control is-invalid' : 'form-control'}
        value={values.name}
        onChange={(event) => setField('name', event.target.value)}
        placeholder="Ex. Garage Navix, TotalEnergies Abidjan…"
        aria-invalid={errors.name ? true : undefined}
        aria-describedby={errors.name ? 'partner-name-error' : undefined}
      />
      <FieldError id="partner-name-error" error={errors.name} />
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-type">
        Type de partenaire
      </label>
      <select
        id="partner-type"
        className={errors.type ? 'form-select is-invalid' : 'form-select'}
        value={values.type}
        onChange={(event) => setField('type', event.target.value)}
        aria-invalid={errors.type ? true : undefined}
        aria-describedby={errors.type ? 'partner-type-error' : undefined}
      >
        <option value="" disabled hidden>
          Sélectionner un type…
        </option>
        {toLabelOptions(PARTNER_TYPE_VALUES, PARTNER_TYPES).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id="partner-type-error" error={errors.type} />
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-status">
        Statut
      </label>
      <select
        id="partner-status"
        className={errors.status ? 'form-select is-invalid' : 'form-select'}
        value={values.status}
        onChange={(event) => setField('status', event.target.value)}
        aria-invalid={errors.status ? true : undefined}
        aria-describedby={errors.status ? 'partner-status-error' : undefined}
      >
        {toLabelOptions(PARTNER_STATUS_VALUES, PARTNER_STATUSES).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id="partner-status-error" error={errors.status} />
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-company">
        Entreprise
      </label>
      <select
        id="partner-company"
        className={errors.companyId ? 'form-select is-invalid' : 'form-select'}
        value={values.companyId}
        onChange={(event) => setField('companyId', event.target.value)}
        aria-invalid={errors.companyId ? true : undefined}
        aria-describedby={errors.companyId ? 'partner-company-error' : undefined}
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
      <FieldError id="partner-company-error" error={errors.companyId} />
    </div>

    <div className="col-12">
      <div className="navix-partner-form__section">
        <i className="bi bi-person-lines-fill me-1" aria-hidden="true" /> Contact
      </div>
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-contact-name">
        Personne de contact
      </label>
      <input
        id="partner-contact-name"
        type="text"
        className="form-control"
        value={values.contactName}
        onChange={(event) => setField('contactName', event.target.value)}
        placeholder="Ex. Jean-Marc Kouassi"
      />
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-phone">
        Téléphone
      </label>
      <input
        id="partner-phone"
        type="tel"
        inputMode="tel"
        className={errors.phone ? 'form-control is-invalid' : 'form-control'}
        value={values.phone}
        onChange={(event) => setField('phone', event.target.value)}
        placeholder="+225 07 00 00 00 00"
        aria-invalid={errors.phone ? true : undefined}
        aria-describedby={errors.phone ? 'partner-phone-error' : undefined}
      />
      <FieldError id="partner-phone-error" error={errors.phone} />
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-email">
        Email
      </label>
      <input
        id="partner-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        className={errors.email ? 'form-control is-invalid' : 'form-control'}
        value={values.email}
        onChange={(event) => setField('email', event.target.value)}
        placeholder="contact@partenaire.com"
        aria-invalid={errors.email ? true : undefined}
        aria-describedby={errors.email ? 'partner-email-error' : undefined}
      />
      <FieldError id="partner-email-error" error={errors.email} />
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-website">
        Site web
      </label>
      <input
        id="partner-website"
        type="url"
        inputMode="url"
        className={errors.website ? 'form-control is-invalid' : 'form-control'}
        value={values.website}
        onChange={(event) => setField('website', event.target.value)}
        placeholder="https://www.partenaire.com"
        aria-invalid={errors.website ? true : undefined}
        aria-describedby={errors.website ? 'partner-website-error' : undefined}
      />
      <FieldError id="partner-website-error" error={errors.website} />
    </div>

    <div className="col-12">
      <div className="navix-partner-form__section">
        <i className="bi bi-geo-alt me-1" aria-hidden="true" /> Localisation & informations
      </div>
    </div>

    <div className="col-12">
      <label className="form-label" htmlFor="partner-address">
        Adresse
      </label>
      <input
        id="partner-address"
        type="text"
        className="form-control"
        value={values.address}
        onChange={(event) => setField('address', event.target.value)}
        placeholder="Ex. Zone industrielle, Koumassi, Abidjan"
      />
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-city">
        Ville
      </label>
      <input
        id="partner-city"
        type="text"
        className="form-control"
        value={values.city}
        onChange={(event) => setField('city', event.target.value)}
        placeholder="Ex. Abidjan"
      />
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-country">
        Pays
      </label>
      <input
        id="partner-country"
        type="text"
        className="form-control"
        value={values.country}
        onChange={(event) => setField('country', event.target.value)}
        placeholder="Ex. Côte d'Ivoire"
      />
    </div>

    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="partner-tax-id">
        N° fiscal
      </label>
      <input
        id="partner-tax-id"
        type="text"
        className="form-control"
        value={values.taxId}
        onChange={(event) => setField('taxId', event.target.value)}
        placeholder="Ex. CI-2018-448921"
      />
    </div>

    <div className="col-12">
      <label className="form-label" htmlFor="partner-notes">
        Notes
      </label>
      <textarea
        id="partner-notes"
        className="form-control"
        rows={3}
        value={values.notes}
        onChange={(event) => setField('notes', event.target.value)}
        placeholder="Observations, contrats, échéances…"
      />
    </div>
  </div>
);

export default PartnerForm;
