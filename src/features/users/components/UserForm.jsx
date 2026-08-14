/**
 * Navix Users — UserForm
 * --------------------------------------------------------------------------
 * Grille de champs métier d'un utilisateur, embarquée dans les pages de
 * création / édition (l'enveloppe <form> et le pied sont portés par les
 * pages). L'état du formulaire (valeurs, erreurs Zod, setField, handleSubmit)
 * est piloté par `useUserForm` depuis la page — le composant reste déclaratif.
 *
 * Sections : Rattachement (entreprise, agence, rôles), Identification
 * (prénom, nom, email, téléphone, poste), Statut du compte.
 *
 * Props :
 *   values          : valeurs contrôlées du formulaire
 *   errors          : { champ: message } — erreurs de validation Zod
 *   setField        : (name, value) => void
 *   companies       : liste des sociétés (options du champ Entreprise)
 *   agencies        : liste des agences (options du champ Agence)
 *   roles           : rôles disponibles (cases à cocher)
 *   onCompanyChange : (companyId) => void — réinitialise l'agence
 *   readOnly        : booléen — édition en lecture seule (rôles système)
 */
import { Divider } from '@/components/ui';
import { USER_STATUS_VALUES, getUserStatus } from '../constants';
import UserRoleAssignment from './UserRoleAssignment';
import './UserForm.css';

const FieldError = ({ id, error }) =>
  error ? (
    <div className="invalid-feedback d-block" id={id}>
      {error}
    </div>
  ) : null;

const UserForm = ({
  values,
  errors = {},
  setField,
  companies = [],
  agencies = [],
  roles = [],
  onCompanyChange,
  readOnly = false,
}) => (
  <div className="row g-3 navix-user-form">
    <div className="col-12">
      <Divider>Rattachement</Divider>
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="user-company">
        Entreprise
      </label>
      <select
        id="user-company"
        className={errors.companyId ? 'form-select is-invalid' : 'form-select'}
        value={values.companyId}
        onChange={(event) => (onCompanyChange ? onCompanyChange(event.target.value) : setField('companyId', event.target.value))}
        disabled={readOnly}
        aria-invalid={errors.companyId ? true : undefined}
        aria-describedby={errors.companyId ? 'user-company-error' : undefined}
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
      <FieldError id="user-company-error" error={errors.companyId} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="user-agency">
        Agence
      </label>
      <select
        id="user-agency"
        className={errors.agencyId ? 'form-select is-invalid' : 'form-select'}
        value={values.agencyId}
        onChange={(event) => setField('agencyId', event.target.value)}
        disabled={readOnly}
        aria-invalid={errors.agencyId ? true : undefined}
        aria-describedby={errors.agencyId ? 'user-agency-error' : undefined}
      >
        <option value="">Aucune agence</option>
        {agencies.map((agency) => (
          <option key={agency.id} value={agency.id}>
            {agency.name}
          </option>
        ))}
      </select>
      <FieldError id="user-agency-error" error={errors.agencyId} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="user-status">
        Statut du compte
      </label>
      <select
        id="user-status"
        className={errors.status ? 'form-select is-invalid' : 'form-select'}
        value={values.status}
        onChange={(event) => setField('status', event.target.value)}
        disabled={readOnly}
        aria-invalid={errors.status ? true : undefined}
        aria-describedby={errors.status ? 'user-status-error' : undefined}
      >
        {USER_STATUS_VALUES.map((value) => (
          <option key={value} value={value}>
            {getUserStatus(value).label}
          </option>
        ))}
      </select>
      <FieldError id="user-status-error" error={errors.status} />
    </div>

    <div className="col-12">
      <Divider>Identification</Divider>
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="user-first-name">
        Prénom
      </label>
      <input
        id="user-first-name"
        type="text"
        autoComplete="given-name"
        className={errors.firstName ? 'form-control is-invalid' : 'form-control'}
        value={values.firstName}
        onChange={(event) => setField('firstName', event.target.value)}
        placeholder="Ex. Awa"
        disabled={readOnly}
        aria-invalid={errors.firstName ? true : undefined}
        aria-describedby={errors.firstName ? 'user-first-name-error' : undefined}
      />
      <FieldError id="user-first-name-error" error={errors.firstName} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="user-last-name">
        Nom
      </label>
      <input
        id="user-last-name"
        type="text"
        autoComplete="family-name"
        className={errors.lastName ? 'form-control is-invalid' : 'form-control'}
        value={values.lastName}
        onChange={(event) => setField('lastName', event.target.value)}
        placeholder="Ex. Kouamé"
        disabled={readOnly}
        aria-invalid={errors.lastName ? true : undefined}
        aria-describedby={errors.lastName ? 'user-last-name-error' : undefined}
      />
      <FieldError id="user-last-name-error" error={errors.lastName} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="user-email">
        Adresse email
      </label>
      <input
        id="user-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        className={errors.email ? 'form-control is-invalid' : 'form-control'}
        value={values.email}
        onChange={(event) => setField('email', event.target.value)}
        placeholder="prenom.nom@entreprise.com"
        disabled={readOnly}
        aria-invalid={errors.email ? true : undefined}
        aria-describedby={errors.email ? 'user-email-error' : undefined}
      />
      <FieldError id="user-email-error" error={errors.email} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="user-phone">
        Téléphone
      </label>
      <input
        id="user-phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        className={errors.phone ? 'form-control is-invalid' : 'form-control'}
        value={values.phone}
        onChange={(event) => setField('phone', event.target.value)}
        placeholder="+237 27 22 48 19 00"
        disabled={readOnly}
        aria-invalid={errors.phone ? true : undefined}
        aria-describedby={errors.phone ? 'user-phone-error' : undefined}
      />
      <FieldError id="user-phone-error" error={errors.phone} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="user-job-title">
        Poste / fonction
      </label>
      <input
        id="user-job-title"
        type="text"
        className="form-control"
        value={values.jobTitle}
        onChange={(event) => setField('jobTitle', event.target.value)}
        placeholder="Ex. Responsable exploitation"
        disabled={readOnly}
      />
    </div>

    <div className="col-12">
      <Divider>Rôles &amp; permissions</Divider>
    </div>

    <div className="col-12">
      <UserRoleAssignment
        roles={roles}
        selectedIds={values.roleIds}
        onChange={(roleIds) => setField('roleIds', roleIds)}
        error={errors.roleIds}
        readOnly={readOnly}
      />
    </div>
  </div>
);

export default UserForm;
