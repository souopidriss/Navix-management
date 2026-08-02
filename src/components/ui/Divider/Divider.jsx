/**
 * Navix Divider
 * --------------------------------------------------------------------------
 * Rôle : séparateur de contenu horizontal ou vertical, avec libellé
 *        centré optionnel.
 *
 * Props :
 *   orientation  : 'horizontal' | 'vertical'           (défaut : 'horizontal')
 *   children     : libellé centré (horizontal uniquement)
 *   className    : classes additionnelles
 *   ...rest      : autres attributs (id, data-*, aria-label, etc.)
 *
 * Exemple :
 *   <Divider />
 *   <Divider>ou</Divider>
 *   <div className="d-flex align-items-stretch"><Divider orientation="vertical" /></div>
 */
import { memo } from 'react';
import './Divider.css';

const NavixDivider = ({ orientation = 'horizontal', children, className, ...rest }) => {
  const classes = ['navix-divider', `navix-divider--${orientation}`, className].filter(Boolean).join(' ');

  if (orientation === 'vertical') {
    return (
      <span role="separator" aria-orientation="vertical" className={classes} {...rest}>
        {children}
      </span>
    );
  }

  if (children) {
    return (
      <div role="separator" className={`${classes} navix-divider--text`} {...rest}>
        <span className="navix-divider__line" aria-hidden="true" />
        <span className="navix-divider__content">{children}</span>
        <span className="navix-divider__line" aria-hidden="true" />
      </div>
    );
  }

  return <div role="separator" className={classes} {...rest} />;
};

export default memo(NavixDivider);
