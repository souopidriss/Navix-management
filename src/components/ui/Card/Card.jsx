/**
 * Navix Card
 * --------------------------------------------------------------------------
 * Rôle : carte SaaS (conteneur sémantique) construite sur le thème Bootstrap,
 *        avec en-tête optionnel (titre / sous-titre / actions) et pied optionnel.
 *
 * Props :
 *   title       : titre de la carte (rendu en <h5>)
 *   subtitle    : sous-titre affiché sous le titre
 *   actions     : actions de l'en-tête (ex. un ou plusieurs Button)
 *   footer      : contenu du pied de carte
 *   children    : contenu du corps de la carte
 *   hoverable   : booléen — élévation au survol          (défaut : false)
 *   bordered    : booléen — affiche la bordure           (défaut : true)
 *   shadow      : none | sm | md | lg | xl               (défaut : 'sm')
 *   padding     : none | xs | sm | md | lg | xl          (défaut : 'md')
 *   flush       : booléen — supprime le padding du corps (défaut : false)
 *   className   : classes additionnelles
 *   style       : styles en ligne additionnels
 *   ...rest     : autres attributs (data-*, aria-*, id, etc.)
 *
 * Exemple :
 *   <Card
 *     title="Parc automobile"
 *     subtitle="12 véhicules actifs"
 *     actions={<Button size="sm" icon="bi-plus-lg">Ajouter</Button>}
 *     hoverable
 *   >
 *     <p>Contenu de la carte.</p>
 *   </Card>
 */
import './Card.css';

const PADDINGS = {
  none: '0',
  xs: 'var(--navix-space-2)',
  sm: 'var(--navix-space-3)',
  md: 'var(--navix-space-4)',
  lg: 'var(--navix-space-5)',
  xl: 'var(--navix-space-6)',
};

const SHADOWS = {
  none: 'navix-card--shadow-none',
  sm: 'navix-card--shadow-sm',
  md: 'navix-card--shadow-md',
  lg: 'navix-card--shadow-lg',
  xl: 'navix-card--shadow-xl',
};

const NavixCard = ({
  title,
  subtitle,
  actions,
  footer,
  children,
  hoverable = false,
  bordered = true,
  shadow = 'sm',
  padding = 'md',
  flush = false,
  className,
  style,
  ...rest
}) => {
  const classes = [
    'navix-card',
    hoverable && 'navix-card--hoverable',
    !bordered && 'navix-card--borderless',
    SHADOWS[shadow] || SHADOWS.sm,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const header = title || subtitle || actions ? (
    <div className="navix-card__header">
      <div>
        {title && <h5 className="navix-card__title">{title}</h5>}
        {subtitle && <p className="navix-card__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="navix-card__actions">{actions}</div>}
    </div>
  ) : null;

  return (
    <div
      className={classes}
      style={{ '--navix-card-padding': PADDINGS[padding] || PADDINGS.md, ...style }}
      {...rest}
    >
      {header}
      {children !== undefined && (
        <div className={flush ? 'navix-card__body navix-card__body--flush' : 'navix-card__body'}>{children}</div>
      )}
      {footer && <div className="navix-card__footer">{footer}</div>}
    </div>
  );
};

export default NavixCard;
