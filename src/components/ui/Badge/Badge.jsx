/**
 * Navix Badge
 * --------------------------------------------------------------------------
 * Rôle : étiquette de statut / compteur, construite sur Bootstrap (.badge)
 *        et pilotée par les tokens du Design System.
 *
 * Props :
 *   variant    : primary | secondary | success | warning | danger | info |
 *                dark | light                          (défaut : 'primary')
 *   size       : sm | md | lg                          (défaut : 'md')
 *   soft       : booléen — fond translucide (variante douce)
 *   dot        : booléen — petit point de statut avant le libellé
 *   children   : contenu (texte ou nœuds)
 *   className  : classes additionnelles
 *   ...rest    : autres attributs (aria-label, id, data-*, etc.)
 *
 * Exemple :
 *   <Badge variant="success" dot>Actif</Badge>
 *   <Badge variant="danger" soft size="sm">3 en panne</Badge>
 */
import { memo } from 'react';
import './Badge.css';

const SIZES = {
  sm: 'navix-badge--sm',
  md: '',
  lg: 'navix-badge--lg',
};

const NavixBadge = ({
  variant = 'primary',
  size = 'md',
  soft = false,
  dot = false,
  children,
  className,
  ...rest
}) => {
  const classes = [
    'badge',
    'navix-badge',
    `navix-badge--${variant}`,
    soft && 'navix-badge--soft',
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {dot && <span className="navix-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
};

export default memo(NavixBadge);
