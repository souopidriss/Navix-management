/**
 * Navix UI — TextInput
 * --------------------------------------------------------------------------
 * Champ texte générique avec icône, erreur Zod, accessibilité ARIA.
 * Contrôlé : la valeur et la modification sont déléguées au parent.
 *
 * Props :
 *   id           : identifiant du champ (auto-généré si absent)
 *   label        : libellé
 *   value        : valeur contrôlée
 *   onChange     : (value: string) => void
 *   error        : message d'erreur de validation (Zod)
 *   hint         : aide affichée si aucune erreur
 *   autoComplete : attribut autocomplete
 *   placeholder  : texte indicatif
 *   icon         : icône Bootstrap du préfixe (ex. 'bi-person-fill')
 *   type         : type HTML (défaut : 'text')
 *   disabled     : désactive le champ
 *   required     : champ requis (affiche l'astérisque)
 */
import { useId } from 'react';

const TextInput = ({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete,
  placeholder,
  icon,
  type = 'text',
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
        <input
          id={inputId}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={required}
          className={error ? 'form-control is-invalid' : 'form-control'}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
        />
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

export default TextInput;
