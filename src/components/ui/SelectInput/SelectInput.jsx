/**
 * Navix UI — SelectInput
 * --------------------------------------------------------------------------
 * Champ select générique avec icône, erreur Zod, accessibilité ARIA.
 * Contrôlé : la valeur et la modification sont déléguées au parent.
 *
 * Props :
 *   id           : identifiant du champ (auto-généré si absent)
 *   label        : libellé
 *   value        : valeur contrôlée
 *   onChange     : (value: string) => void
 *   error        : message d'erreur de validation (Zod)
 *   hint         : aide affichée si aucune erreur
 *   options      : [{ value, label }]
 *   placeholder  : texte indicatif (première option disabled)
 *   icon         : icône Bootstrap du préfixe
 *   disabled     : désactive le champ
 *   required     : champ requis
 */
import { useId } from 'react';

const SelectInput = ({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  options = [],
  placeholder = 'Sélectionnez…',
  icon,
  disabled,
  required,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div>
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <div className="input-group">
        {icon && (
          <span className="input-group-text">
            <i className={`bi ${icon}`} aria-hidden="true" />
          </span>
        )}
        <select
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={required}
          className={error ? 'form-select is-invalid' : 'form-select'}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <div className="invalid-feedback d-block" id={errorId}>
          {error}
        </div>
      ) : hint ? (
        <small className="form-text text-secondary" id={hintId}>
          {hint}
        </small>
      ) : null}
    </div>
  );
};

export default SelectInput;
