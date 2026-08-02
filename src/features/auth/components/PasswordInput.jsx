/**
 * Navix Auth — PasswordInput
 * --------------------------------------------------------------------------
 * Champ mot de passe réutilisable avec bascule afficher / masquer
 * (icônes Bootstrap bi-eye / bi-eye-slash) et accessibilité complète :
 * aria-label sur le bouton, aria-pressed, aria-invalid et aria-describedby.
 * Contrôlé : la valeur et la modification sont déléguées au parent.
 *
 * Props :
 *   id           : identifiant du champ (auto-généré si absent)
 *   label        : libellé                    (défaut : 'Mot de passe')
 *   value        : valeur contrôlée
 *   onChange     : (value: string) => void
 *   error        : message d'erreur de validation (Zod)
 *   hint         : aide affichée si aucune erreur
 *   autoComplete : attribut autocomplete (ex. 'current-password', 'new-password')
 *   placeholder  : texte indicatif
 *   icon         : icône Bootstrap du préfixe (défaut : 'bi-lock-fill')
 *   disabled     : désactive le champ
 */
import { useId, useState } from 'react';
import './PasswordInput.css';

const PasswordInput = ({
  id,
  label = 'Mot de passe',
  value,
  onChange,
  error,
  hint,
  autoComplete,
  placeholder = 'Votre mot de passe',
  icon = 'bi-lock-fill',
  disabled,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);

  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const toggleLabel = visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe';

  return (
    <div>
      <label className="form-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="input-group">
        <span className="input-group-text">
          <i className={`bi ${icon}`} aria-hidden="true" />
        </span>
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={error ? 'form-control is-invalid' : 'form-control'}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
        />
        <button
          type="button"
          className="navix-password-input__toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={toggleLabel}
          aria-pressed={visible}
        >
          <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
        </button>
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

export default PasswordInput;
