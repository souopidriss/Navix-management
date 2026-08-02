/**
 * Navix Auth — EmailInput
 * --------------------------------------------------------------------------
 * Champ email réutilisable (icône, erreur Zod, accessibilité ARIA).
 * Contrôlé : la valeur et la modification sont déléguées au parent.
 *
 * Props :
 *   id           : identifiant du champ (auto-généré si absent)
 *   label        : libellé                    (défaut : 'Adresse email')
 *   value        : valeur contrôlée
 *   onChange     : (value: string) => void
 *   error        : message d'erreur de validation (Zod)
 *   hint         : aide affichée si aucune erreur
 *   autoComplete : attribut autocomplete      (défaut : 'email')
 *   placeholder  : texte indicatif
 *   disabled     : désactive le champ
 */
import { useId } from 'react';

const EmailInput = ({
  id,
  label = 'Adresse email',
  value,
  onChange,
  error,
  hint,
  autoComplete = 'email',
  placeholder = 'vous@entreprise.com',
  disabled,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div>
      <label className="form-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="input-group">
        <span className="input-group-text">
          <i className="bi bi-envelope" aria-hidden="true" />
        </span>
        <input
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
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

export default EmailInput;
