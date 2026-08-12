/**
 * Navix Profile — ProfileIdentityForm
 * --------------------------------------------------------------------------
 * Formulaire d'identité du profil courant : prénom, nom, téléphone, poste et
 * avatar (URL). L'email est en lecture seule : sa modification n'est pas
 * disponible sans procédure métier dédiée (avertissement affiché).
 * Piloté par `useProfileForm` depuis la page — composant déclaratif.
 *
 * Props :
 *   values, errors, setField   : état du formulaire (useProfileForm)
 *   email                      : adresse email en lecture seule
 *   onSubmit                   : (event) => void — soumission du formulaire
 *   isSaving                   : booléen — état de sauvegarde
 *   onReset                    : () => void — réinitialisation
 */
import { Button, Alert, Divider } from '@/components/ui';

const FieldError = ({ id, error }) =>
  error ? (
    <div className="invalid-feedback d-block" id={id} role="alert">
      {error}
    </div>
  ) : null;

const ProfileIdentityForm = ({ values, errors = {}, setField, email, onSubmit, isSaving = false, onReset }) => (
  <form onSubmit={onSubmit} noValidate>
    <Divider>Identité</Divider>

    <div className="row g-3">
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="profile-first-name">
          Prénom
        </label>
        <input
          id="profile-first-name"
          type="text"
          autoComplete="given-name"
          className={errors.firstName ? 'form-control is-invalid' : 'form-control'}
          value={values.firstName}
          onChange={(event) => setField('firstName', event.target.value)}
          placeholder="Ex. Awa"
          aria-invalid={errors.firstName ? true : undefined}
          aria-describedby={errors.firstName ? 'profile-first-name-error' : undefined}
        />
        <FieldError id="profile-first-name-error" error={errors.firstName} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="profile-last-name">
          Nom
        </label>
        <input
          id="profile-last-name"
          type="text"
          autoComplete="family-name"
          className={errors.lastName ? 'form-control is-invalid' : 'form-control'}
          value={values.lastName}
          onChange={(event) => setField('lastName', event.target.value)}
          placeholder="Ex. Kouamé"
          aria-invalid={errors.lastName ? true : undefined}
          aria-describedby={errors.lastName ? 'profile-last-name-error' : undefined}
        />
        <FieldError id="profile-last-name-error" error={errors.lastName} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="profile-email">
          Adresse email
        </label>
        <input
          id="profile-email"
          type="email"
          className="form-control"
          value={email ?? ''}
          disabled
          aria-describedby="profile-email-hint"
        />
        <div className="form-text" id="profile-email-hint">
          L'adresse email sert d'identifiant de connexion : elle n'est pas modifiable depuis le profil.
        </div>
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="profile-phone">
          Téléphone
        </label>
        <input
          id="profile-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={errors.phone ? 'form-control is-invalid' : 'form-control'}
          value={values.phone}
          onChange={(event) => setField('phone', event.target.value)}
          placeholder="+225 27 22 48 19 00"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? 'profile-phone-error' : undefined}
        />
        <FieldError id="profile-phone-error" error={errors.phone} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="profile-job-title">
          Poste / fonction
        </label>
        <input
          id="profile-job-title"
          type="text"
          className="form-control"
          value={values.jobTitle}
          onChange={(event) => setField('jobTitle', event.target.value)}
          placeholder="Ex. Responsable exploitation"
          aria-invalid={errors.jobTitle ? true : undefined}
          aria-describedby={errors.jobTitle ? 'profile-job-title-error' : undefined}
        />
        <FieldError id="profile-job-title-error" error={errors.jobTitle} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="profile-avatar">
          Avatar (URL)
        </label>
        <input
          id="profile-avatar"
          type="url"
          className={errors.avatar ? 'form-control is-invalid' : 'form-control'}
          value={values.avatar}
          onChange={(event) => setField('avatar', event.target.value)}
          placeholder="https://…"
          aria-invalid={errors.avatar ? true : undefined}
          aria-describedby={errors.avatar ? 'profile-avatar-error' : 'profile-avatar-hint'}
        />
        {errors.avatar ? (
          <FieldError id="profile-avatar-error" error={errors.avatar} />
        ) : (
          <div className="form-text" id="profile-avatar-hint">
            URL publique de la photo de profil (aperçu ci-contre).
          </div>
        )}
      </div>
    </div>

    <Alert variant="info" icon="bi-info-circle" className="mt-3 mb-0">
      La modification de l'email, du rôle, de l'entreprise ou du tenant nécessite l'administration de votre espace.
    </Alert>

    <div className="d-flex justify-content-end gap-2 mt-3">
      <Button variant="outline" type="button" icon="bi-arrow-counterclockwise" onClick={onReset} disabled={isSaving}>
        Réinitialiser
      </Button>
      <Button variant="primary" type="submit" icon="bi-check-lg" loading={isSaving}>
        Enregistrer
      </Button>
    </div>
  </form>
);

export default ProfileIdentityForm;
