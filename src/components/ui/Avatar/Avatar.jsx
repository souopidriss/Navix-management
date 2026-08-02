/**
 * Navix Avatar
 * --------------------------------------------------------------------------
 * Rôle : avatar rond pour image, initiales ou icône, utilisé pour représenter
 *        un utilisateur ou une entité.
 *
 * Props :
 *   src        : URL de l'image (prioritaire si fournie)
 *   alt        : texte alternatif de l'image / label accessible
 *   name       : nom utilisé pour calculer automatiquement les initiales
 *   icon       : classe d'icône Bootstrap Icons, ex. 'bi-building'
 *   size       : xs | sm | md | lg | xl                    (défaut : 'md')
 *   variant    : primary | secondary | success | danger |
 *                warning | info | light | dark             (défaut : 'primary')
 *   className  : classes additionnelles
 *   ...rest    : autres attributs (title, data-*, etc.)
 *
 * Exemple :
 *   <Avatar name="Awa Kouamé" variant="success" />
 *   <Avatar src="/photos/awa.jpg" alt="Photo d'Awa Kouamé" size="lg" />
 *   <Avatar icon="bi-building" variant="primary" />
 */
import { memo } from 'react';
import './Avatar.css';

const SIZES = {
  xs: 'navix-avatar--xs',
  sm: 'navix-avatar--sm',
  md: '',
  lg: 'navix-avatar--lg',
  xl: 'navix-avatar--xl',
};

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

const NavixAvatar = ({ src, alt, name, icon, size = 'md', variant = 'primary', className, ...rest }) => {
  const classes = ['navix-avatar', `navix-avatar--${variant}`, SIZES[size], className].filter(Boolean).join(' ');

  if (src) {
    return <img className={classes} src={src} alt={alt || name || ''} {...rest} />;
  }

  const fallback = icon ? (
    <i className={`bi ${icon}`} aria-hidden="true" />
  ) : name ? (
    getInitials(name)
  ) : (
    <i className="bi bi-person-fill" aria-hidden="true" />
  );

  return (
    <span className={classes} role={alt ? 'img' : undefined} aria-label={alt} {...rest}>
      {fallback}
    </span>
  );
};

export default memo(NavixAvatar);
