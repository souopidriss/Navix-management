/**
 * Navix Auth — RememberMe
 * --------------------------------------------------------------------------
 * Case à cocher « Se souvenir de moi » (Remember Me), contrôlée.
 * Prépare l'architecture : la valeur est transmise à authService.login
 * (persistance de session à brancher avec le backend).
 *
 * Props :
 *   id       : identifiant (auto-généré si absent)
 *   checked  : état coché
 *   onChange : (checked: boolean) => void
 *   label    : libellé                     (défaut : 'Se souvenir de moi')
 *   disabled : désactive la case
 *   className: classes additionnelles
 */
import { useId } from 'react';

const RememberMe = ({ id, checked, onChange, label = 'Se souvenir de moi', disabled, className }) => {
  const generatedId = useId();
  const checkboxId = id || generatedId;
  const classes = ['form-check', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <input
        id={checkboxId}
        type="checkbox"
        className="form-check-input"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
      <label className="form-check-label" htmlFor={checkboxId}>
        {label}
      </label>
    </div>
  );
};

export default RememberMe;
