/**
 * Navix Alert
 * --------------------------------------------------------------------------
 * Rôle : message d'information contextuel (succès, avertissement, erreur…),
 *        avec icône automatique, fermeture animée optionnelle.
 *
 * Props :
 *   variant    : success | warning | danger | info | primary   (défaut : 'info')
 *   icon       : booléen ou classe d'icône Bootstrap Icons
 *                true  → icône par défaut de la variante
 *                false → aucune icône
 *                'bi-…' → icône personnalisée
 *   closable   : booléen — affiche le bouton de fermeture
 *   onClose    : callback appelé après la sortie animée
 *   children   : contenu du message
 *   className  : classes additionnelles
 *   ...rest    : autres attributs (id, data-*, etc.)
 *
 * Exemple :
 *   <Alert variant="success" closable onClose={handleDismiss}>
 *     Véhicule enregistré avec succès.
 *   </Alert>
 */
import { useState } from 'react';
import './Alert.css';

const ICONS = {
  success: 'bi-check-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  danger: 'bi-x-octagon-fill',
  info: 'bi-info-circle-fill',
  primary: 'bi-lightbulb-fill',
};

const EXIT_DURATION = 220;

const NavixAlert = ({
  variant = 'info',
  icon = true,
  closable = false,
  onClose,
  children,
  className,
  ...rest
}) => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  if (!visible) return null;

  const handleClose = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, EXIT_DURATION);
  };

  const iconClass = ICONS[variant] || ICONS.info;

  const classes = ['navix-alert', `navix-alert--${variant}`, leaving && 'navix-alert--leaving', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="alert" {...rest}>
      {icon !== false && <i className={`bi ${icon === true ? iconClass : icon}`} aria-hidden="true" />}
      <div className="navix-alert__body">{children}</div>
      {closable && (
        <button type="button" className="navix-alert__close" aria-label="Fermer l'alerte" onClick={handleClose}>
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default NavixAlert;
