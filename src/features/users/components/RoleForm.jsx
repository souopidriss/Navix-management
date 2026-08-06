/**
 * Navix Users — RoleForm
 * --------------------------------------------------------------------------
 * Grille de champs métier d'un rôle (création / édition), embarquée dans les
 * pages. L'état du formulaire (valeurs, erreurs Zod, setField, handleSubmit)
 * est piloté par `useRoleForm` depuis la page. En édition, le code est
 * verrouillé (références existantes) ; l'entreprise est figée pour les rôles
 * système.
 *
 * Props :
 *   values     : valeurs contrôlées du formulaire
 *   errors     : { champ: message } — erreurs de validation Zod
 *   setField   : (name, value) => void
 *   companies  : liste des sociétés (options du champ Entreprise)
 *   showCompany: booléen — affiche le champ Entreprise (création super admin)
 *   isEdit     : booléen — verrouille le code
 */
import { Divider } from '@/components/ui';
import { ROLE_STATUSES, ROLE_STATUS_VALUES, getRoleStatus } from '../constants';
import './RoleForm.css';

const FieldError = ({ id, error }) =>
  error ? (
    <div className="invalid-feedback d-block" id={id}>
      {error}
    </div>
  ) : null;

const RoleForm = ({ values, errors = {}, setField, companies = [], showCompany = true, isEdit = false }) => (
  <div className="row g-3 navix-role-form">
    <div className="col-12">
      <Divider>Identification</Divider>
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="role-name">
        Nom du rôle
      </label>
      <input
        id="role-name"
        type="text"
        className={errors.name ? 'form-control is-invalid' : 'form-control'}
        value={values.name}
        onChange={(event) => setField('name', event.target.value)}
        placeholder="Ex. Superviseur dépôt"
        aria-invalid={errors.name ? true : undefined}
        aria-describedby={errors.name ? 'role-name-error' : undefined}
      />
      <FieldError id="role-name-error" error={errors.name} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="role-code">
        Code
      </label>
      <input
        id="role-code"
        type="text"
        className={errors.code ? 'form-control is-invalid' : 'form-control'}
        value={values.code}
        onChange={(event) => setField('code', event.target.value)}
        placeholder="ex. supervisor_depot"
        disabled={isEdit}
        aria-invalid={errors.code ? true : undefined}
        aria-describedby={errors.code ? 'role-code-error' : 'role-code-hint'}
      />
      <div id="role-code-hint" className="form-text">
        Minuscules, chiffres et tirets bas (ex. supervisor_depot).
      </div>
      <FieldError id="role-code-error" error={errors.code} />
    </div>

    <div className="col-12 col-md-6 col-lg-4">
      <label className="form-label" htmlFor="role-status">
        Statut
      </label>
      <select
        id="role-status"
        className={errors.isActive ? 'form-select is-invalid' : 'form-select'}
        value={values.isActive}
        onChange={(event) => setField('isActive', event.target.value)}
        disabled={values.code === 'super_admin'}
        aria-invalid={errors.isActive ? true : undefined}
        aria-describedby={errors.isActive ? 'role-status-error' : undefined}
      >
        {ROLE_STATUS_VALUES.map((value) => (
          <option key={value} value={value}>
            {getRoleStatus(value).label}
          </option>
        ))}
      </select>
      <FieldError id="role-status-error" error={errors.isActive} />
    </div>

    {showCompany && (
      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="role-company">
          Entreprise
        </label>
        <select
          id="role-company"
          className={errors.companyId ? 'form-select is-invalid' : 'form-select'}
          value={values.companyId}
          onChange={(event) => setField('companyId', event.target.value)}
          disabled={isEdit}
          aria-invalid={errors.companyId ? true : undefined}
          aria-describedby={errors.companyId ? 'role-company-error' : undefined}
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
        <FieldError id="role-company-error" error={errors.companyId} />
      </div>
    )}

    <div className="col-12">
      <label className="form-label" htmlFor="role-description">
        Description
      </label>
      <textarea
        id="role-description"
        className="form-control"
        rows={2}
        value={values.description}
        onChange={(event) => setField('description', event.target.value)}
        placeholder="Périmètre du rôle, responsabilités…"
      />
    </div>
  </div>
);

export default RoleForm;
