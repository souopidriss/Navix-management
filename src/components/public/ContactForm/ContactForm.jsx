import { useState, useCallback, useId } from 'react';
import { useSearchParams } from 'react-router-dom';
import { contactSchema, contactDefaultValues, FLEET_SIZES, SUBJECTS } from './contact.schema';
import './ContactForm.css';

const FORM_STATES = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };

const ContactForm = () => {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('type') === 'demo';
  const formId = useId();

  const [values, setValues] = useState({
    ...contactDefaultValues,
    sujet: isDemo ? SUBJECTS[0] : '',
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [formState, setFormState] = useState(FORM_STATES.IDLE);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setFormState(FORM_STATES.LOADING);

    // TODO: Intégrer l'appel API réel ici (backend à venir)
    // Pour le moment, simulation frontend du traitement
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFormState(FORM_STATES.SUCCESS);
    } catch {
      setFormState(FORM_STATES.ERROR);
    }
  }, [values]);

  const handleReset = useCallback(() => {
    setValues(contactDefaultValues);
    setFormState(FORM_STATES.IDLE);
    setErrors({});
  }, []);

  if (formState === FORM_STATES.SUCCESS) {
    return (
      <div className="nv-cform nv-cform--success" role="status">
        <div className="nv-cform__success-icon" aria-hidden="true">
          <i className="bi bi-check-circle-fill" />
        </div>
        <h3 className="nv-cform__success-title">Votre demande a bien &eacute;t&eacute; envoy&eacute;e.</h3>
        <p className="nv-cform__success-desc">
          Nous avons bien re&ccedil;u votre message. Notre &eacute;quipe
          l&apos;examinera et vous r&eacute;pondra dans les meilleurs d&eacute;lais.
        </p>
        <button
          type="button"
          className="nv-btn-orange"
          onClick={handleReset}
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <div className="nv-cform">
      <h2 className="nv-cform__title">
        {isDemo ? 'Demandez une d\u00e9monstration' : 'Envoyez-nous un message'}
      </h2>

      {formState === FORM_STATES.ERROR && (
        <div className="nv-cform__alert nv-cform__alert--error" role="alert">
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
          <span>Une erreur est survenue. Veuillez r&eacute;essayer.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Nom */}
        <div className="nv-cform__field">
          <label htmlFor={`${formId}-nom`} className="nv-cform__label">
            Nom complet <span className="nv-cform__required" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id={`${formId}-nom`}
            name="nom"
            className={`nv-cform__input ${errors.nom ? 'nv-cform__input--error' : ''}`}
            value={values.nom}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={!!errors.nom}
            aria-describedby={errors.nom ? `${formId}-nom-error` : undefined}
            autoComplete="name"
          />
          {errors.nom && (
            <span id={`${formId}-nom-error`} className="nv-cform__error" role="alert">
              {errors.nom}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="nv-cform__field">
          <label htmlFor={`${formId}-email`} className="nv-cform__label">
            Email professionnel <span className="nv-cform__required" aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            id={`${formId}-email`}
            name="email"
            className={`nv-cform__input ${errors.email ? 'nv-cform__input--error' : ''}`}
            value={values.email}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <span id={`${formId}-email-error`} className="nv-cform__error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {/* Téléphone */}
        <div className="nv-cform__field">
          <label htmlFor={`${formId}-tel`} className="nv-cform__label">
            T&eacute;l&eacute;phone
          </label>
          <input
            type="tel"
            id={`${formId}-tel`}
            name="telephone"
            className="nv-cform__input"
            value={values.telephone}
            onChange={handleChange}
            autoComplete="tel"
          />
        </div>

        {/* Entreprise */}
        <div className="nv-cform__field">
          <label htmlFor={`${formId}-entreprise`} className="nv-cform__label">
            Entreprise
          </label>
          <input
            type="text"
            id={`${formId}-entreprise`}
            name="entreprise"
            className="nv-cform__input"
            value={values.entreprise}
            onChange={handleChange}
            autoComplete="organization"
          />
        </div>

        {/* Taille de flotte */}
        <div className="nv-cform__field">
          <label htmlFor={`${formId}-flotte`} className="nv-cform__label">
            Taille de flotte
          </label>
          <select
            id={`${formId}-flotte`}
            name="tailleFlotte"
            className={`nv-cform__input nv-cform__select ${errors.tailleFlotte ? 'nv-cform__input--error' : ''}`}
            value={values.tailleFlotte}
            onChange={handleChange}
            aria-invalid={!!errors.tailleFlotte}
            aria-describedby={errors.tailleFlotte ? `${formId}-flotte-error` : undefined}
          >
            <option value="">S&eacute;lectionnez une taille</option>
            {FLEET_SIZES.map((size) => (
              <option key={size} value={size}>{size} v&eacute;hicules</option>
            ))}
          </select>
          {errors.tailleFlotte && (
            <span id={`${formId}-flotte-error`} className="nv-cform__error" role="alert">
              {errors.tailleFlotte}
            </span>
          )}
        </div>

        {/* Sujet */}
        <div className="nv-cform__field">
          <label htmlFor={`${formId}-sujet`} className="nv-cform__label">
            Sujet <span className="nv-cform__required" aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-sujet`}
            name="sujet"
            className={`nv-cform__input nv-cform__select ${errors.sujet ? 'nv-cform__input--error' : ''}`}
            value={values.sujet}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={!!errors.sujet}
            aria-describedby={errors.sujet ? `${formId}-sujet-error` : undefined}
          >
            <option value="">S&eacute;lectionnez un sujet</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.sujet && (
            <span id={`${formId}-sujet-error`} className="nv-cform__error" role="alert">
              {errors.sujet}
            </span>
          )}
        </div>

        {/* Message */}
        <div className="nv-cform__field">
          <label htmlFor={`${formId}-message`} className="nv-cform__label">
            Message <span className="nv-cform__required" aria-hidden="true">*</span>
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            className={`nv-cform__input nv-cform__textarea ${errors.message ? 'nv-cform__input--error' : ''}`}
            value={values.message}
            onChange={handleChange}
            rows={6}
            aria-required="true"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? `${formId}-message-error` : undefined}
          />
          {errors.message && (
            <span id={`${formId}-message-error`} className="nv-cform__error" role="alert">
              {errors.message}
            </span>
          )}
        </div>

        {/* Consentement */}
        <div className="nv-cform__field">
          <label className="nv-cform__checkbox-label">
            <input
              type="checkbox"
              name="consent"
              className="nv-cform__checkbox"
              checked={values.consent}
              onChange={handleChange}
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
            />
            <span>
              J&apos;accepte que mes donn&eacute;es soient trait&eacute;es pour
              le traitement de ma demande.{' '}
              <span className="nv-cform__required" aria-hidden="true">*</span>
            </span>
          </label>
          {errors.consent && (
            <span id={`${formId}-consent-error`} className="nv-cform__error" role="alert">
              {errors.consent}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="nv-btn-orange nv-cform__submit"
          disabled={formState === FORM_STATES.LOADING}
        >
          {formState === FORM_STATES.LOADING ? (
            <>
              <span className="nv-cform__spinner" aria-hidden="true" />
              Envoi en cours&hellip;
            </>
          ) : (
            <>
              Envoyer le message
              <i className="bi bi-send" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
