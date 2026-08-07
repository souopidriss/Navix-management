/**
 * Navix Settings — Champs de formulaire réutilisables
 * --------------------------------------------------------------------------
 * Ensemble de champs accessibles (label htmlFor, id auto, erreur liée,
 * hint, désactivation) utilisés par les 14 sections de paramètres.
 * Tous les champs sont non contrôlés visuellement : la valeur et la
 * modification sont pilotées par le formulaire parent (SettingsForm).
 */
import { useId } from 'react';

/** Normalise les options en [{ value, label }]. */
const normalizeOptions = (options) =>
  (options ?? []).map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );

const FieldWrapper = ({ id, label, hint, error, required = false, children, className }) => (
  <div className={className}>
    {label && (
      <label className="form-label" htmlFor={id}>
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
    )}
    {children}
    {error ? (
      <div className="invalid-feedback d-block" id={`${id}-error`} role="alert">
        {error}
      </div>
    ) : hint ? (
      <div className="form-text" id={`${id}-hint`}>
        {hint}
      </div>
    ) : null}
  </div>
);

/**
 * Champ texte / numérique / mot de passe.
 */
export const FieldInput = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  error,
  disabled = false,
  required = false,
  min,
  max,
  step,
  className,
  autoComplete,
}) => {
  const autoId = useId();
  const id = `${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}-${autoId}`;
  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <input
        id={id}
        type={type}
        className={error ? 'form-control is-invalid' : 'form-control'}
        value={value ?? ''}
        onChange={(event) => onChange?.(type === 'number' ? event.target.value : event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
    </FieldWrapper>
  );
};

/**
 * Liste déroulante (options : tableau de chaînes ou [{ value, label }]).
 */
export const FieldSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  error,
  disabled = false,
  required = false,
  className,
}) => {
  const autoId = useId();
  const id = `${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}-${autoId}`;
  const normalized = normalizeOptions(options);
  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <select
        id={id}
        className={error ? 'form-select is-invalid' : 'form-select'}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {normalized.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
};

/**
 * Zone de texte multiligne.
 */
export const FieldTextarea = ({
  label,
  value,
  onChange,
  rows = 3,
  maxLength,
  placeholder,
  hint,
  error,
  disabled = false,
  required = false,
  className,
}) => {
  const autoId = useId();
  const id = `${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}-${autoId}`;
  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        id={id}
        className={error ? 'form-control is-invalid' : 'form-control'}
        rows={rows}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
    </FieldWrapper>
  );
};

/**
 * Interrupteur (case à cocher type switch).
 */
export const FieldSwitch = ({
  label,
  value,
  onChange,
  hint,
  error,
  disabled = false,
  className,
}) => {
  const autoId = useId();
  const id = `${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}-${autoId}`;
  return (
    <div className={className}>
      <div className="form-check form-switch">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className={`form-check-input ${error ? 'is-invalid' : ''}`}
          checked={Boolean(value)}
          onChange={(event) => onChange?.(event.target.checked)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? `${id}-help` : undefined}
        />
        <label className="form-check-label" htmlFor={id}>
          {label}
        </label>
      </div>
      {hint && (
        <div className="form-text" id={`${id}-help`}>
          {hint}
        </div>
      )}
      {error && (
        <div className="invalid-feedback d-block" id={`${id}-help`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Groupe de cases à cocher (options : tableau de chaînes ou [{ value, label }]).
 */
export const FieldCheckboxes = ({
  label,
  selected,
  onChange,
  options,
  hint,
  error,
  disabled = false,
  className,
}) => {
  const autoId = useId();
  const id = `${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}-${autoId}`;
  const normalized = normalizeOptions(options);
  const toggle = (value) => {
    const current = Array.isArray(selected) ? selected : [];
    onChange?.(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };
  return (
    <div className={className}>
      {label && <div className="form-label">{label}</div>}
      <div className="d-flex flex-wrap gap-3">
        {normalized.map((option) => (
          <div className="form-check" key={option.value}>
            <input
              id={`${id}-${option.value}`}
              type="checkbox"
              className="form-check-input"
              checked={Array.isArray(selected) && selected.includes(option.value)}
              onChange={() => toggle(option.value)}
              disabled={disabled}
            />
            <label className="form-check-label" htmlFor={`${id}-${option.value}`}>
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error ? (
        <div className="invalid-feedback d-block" role="alert">
          {error}
        </div>
      ) : hint ? (
        <div className="form-text">{hint}</div>
      ) : null}
    </div>
  );
};

/**
 * Options segmentées (cartes radio) — thème, densité, sidebar…
 */
export const FieldSegmented = ({
  label,
  value,
  onChange,
  options,
  hint,
  error,
  disabled = false,
  className,
}) => {
  const autoId = useId();
  const id = `${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}-${autoId}`;
  const normalized = normalizeOptions(options);
  return (
    <div className={className}>
      {label && <div className="form-label">{label}</div>}
      <div className="settings-segmented" role="radiogroup" aria-label={label}>
        {normalized.map((option) => {
          const optionId = `${id}-${option.value}`;
          const checked = value === option.value;
          return (
            <div
              className={`settings-segmented__option ${checked ? 'settings-segmented__option--active' : ''}`}
              key={option.value}
            >
              <input
                id={optionId}
                type="radio"
                name={id}
                value={option.value}
                checked={checked}
                onChange={() => onChange?.(option.value)}
                disabled={disabled}
              />
              <label htmlFor={optionId}>
                <strong>{option.label}</strong>
                {option.description && <span>{option.description}</span>}
              </label>
            </div>
          );
        })}
      </div>
      {error ? (
        <div className="invalid-feedback d-block" role="alert">
          {error}
        </div>
      ) : hint ? (
        <div className="form-text">{hint}</div>
      ) : null}
    </div>
  );
};
