/**
 * Navix Button
 * --------------------------------------------------------------------------
 * Rôle : bouton d'action polyvalent basé sur Bootstrap (btn + btn-<variant>),
 *        décliné dans les tokens du Design System.
 *
 * Props :
 *   variant       : primary | secondary | success | danger | warning | info |
 *                   light | dark | ghost | outline   (défaut : 'primary')
 *   size          : sm | md | lg | xl                (défaut : 'md')
 *   icon          : classe d'icône Bootstrap Icons, ex. 'bi-plus-lg'
 *   iconPosition  : 'start' | 'end'                  (défaut : 'start')
 *   loading       : booléen — affiche un Spinner et désactive le bouton
 *   disabled      : booléen — désactive le bouton
 *   fullWidth     : booléen — occupe 100 % de la largeur disponible
 *   rounded       : booléen — forme pilule
 *   outline       : booléen — force la variante outline
 *   href          : si fourni, rend un <a> à la place d'un <button>
 *   onClick       : handler de clic
 *   type          : type du <button>                 (défaut : 'button')
 *   className     : classes additionnelles
 *   ...rest       : autres attributs (aria-*, data-*, etc.)
 *
 * Exemple :
 *   <Button variant="primary" icon="bi-plus-lg" loading={isSaving}>
 *     Créer un véhicule
 *   </Button>
 */
import { memo } from 'react';
import Spinner from '../Spinner';
import './Button.css';

const VARIANTS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

const SIZES = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

const NavixButton = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'start',
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = false,
  outline = false,
  children,
  onClick,
  href,
  type = 'button',
  className,
  ...rest
}) => {
  const outlineMode = outline || variant === 'outline';
  const baseVariant = outlineMode && variant === 'outline' ? 'primary' : variant;
  const variantClass =
    outlineMode && VARIANTS.includes(baseVariant) ? `btn-outline-${baseVariant}` : `btn-${baseVariant}`;

  const classes = [
    'btn',
    'navix-btn',
    variantClass,
    SIZES[size],
    loading && 'navix-btn--loading',
    fullWidth && 'navix-btn--full-width',
    rounded && 'navix-btn--pill',
    !children && icon && 'navix-btn--icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconNode = icon && <i className={`bi ${icon}`} aria-hidden="true" />;

  const content = (
    <>
      {loading && <Spinner size="sm" className="navix-btn__spinner" />}
      {icon && iconPosition === 'start' && iconNode}
      {children && <span className="navix-btn__label">{children}</span>}
      {icon && iconPosition === 'end' && iconNode}
    </>
  );

  const isDisabled = disabled || loading;

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={isDisabled}
        aria-busy={loading}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={isDisabled ? (event) => event.preventDefault() : onClick}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={isDisabled} aria-busy={loading} onClick={onClick} {...rest}>
      {content}
    </button>
  );
};

export default memo(NavixButton);
