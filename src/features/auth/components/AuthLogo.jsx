/**
 * Navix Auth — AuthLogo
 * --------------------------------------------------------------------------
 * Logo de marque utilisé par AuthLayout. Le nom provient de la configuration
 * officielle (appConfig.name) — jamais de chaîne codée en dur.
 *
 * Props :
 *   className : classes additionnelles
 *   ...rest   : autres attributs
 */
import { appConfig } from '@/config';
import './AuthLogo.css';

const AuthLogo = ({ className, ...rest }) => {
  const classes = ['navix-auth-logo', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      <span className="navix-auth-logo__mark" aria-hidden="true">
        <i className="bi bi-geo-alt-fill" />
      </span>
      <span className="navix-auth-logo__name">{appConfig.name}</span>
    </div>
  );
};

export default AuthLogo;
