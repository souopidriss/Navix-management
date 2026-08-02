/**
 * Navix Spinner
 * --------------------------------------------------------------------------
 * Rôle : indicateur de chargement basé sur Bootstrap (spinner-border /
 *        spinner-grow), avec variantes de taille et modes écran plein /
 *        superposition.
 *
 * Props :
 *   size        : sm | md | lg                                  (défaut : 'md')
 *   color       : primary | secondary | success | danger |
 *                 warning | info | light | dark   — hérite du parent sinon
 *   grow        : booléen — utilise spinner-grow   (défaut : false)
 *   label       : texte annoncé aux lecteurs d'écran (défaut : 'Chargement…')
 *   overlay     : booléen — centré sur le parent (parent position:relative)
 *   fullscreen  : booléen — couche plein écran centrée
 *   className   : classes additionnelles
 *   ...rest     : autres attributs (id, data-*, etc.)
 *
 * Exemple :
 *   <Spinner size="lg" color="primary" />
 *   <Spinner overlay />            // dans un conteneur position:relative
 *   <Spinner fullscreen label="Chargement du tableau de bord…" />
 */
import { memo } from 'react';
import './Spinner.css';

const SIZES = {
  sm: 'spinner-border-sm',
  md: '',
  lg: 'navix-spinner--lg',
};

const COLORS = {
  primary: 'navix-spinner--primary',
  secondary: 'navix-spinner--secondary',
  success: 'navix-spinner--success',
  danger: 'navix-spinner--danger',
  warning: 'navix-spinner--warning',
  info: 'navix-spinner--info',
  light: 'navix-spinner--light',
  dark: 'navix-spinner--dark',
};

const NavixSpinner = ({
  size = 'md',
  color,
  grow = false,
  label = 'Chargement…',
  overlay = false,
  fullscreen = false,
  className,
  ...rest
}) => {
  const base = grow ? 'spinner-grow' : 'spinner-border';
  const classes = ['navix-spinner', base, color && COLORS[color], SIZES[size], className]
    .filter(Boolean)
    .join(' ');

  const spinner = (
    <span className={classes} role="status" {...rest}>
      <span className="visually-hidden">{label}</span>
    </span>
  );

  if (fullscreen) {
    return <div className="navix-spinner__fullscreen">{spinner}</div>;
  }

  if (overlay) {
    return <div className="navix-spinner__overlay">{spinner}</div>;
  }

  return spinner;
};

export default memo(NavixSpinner);
