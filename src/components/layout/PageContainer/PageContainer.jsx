import './PageContainer.css';

const PADDINGS = {
  none: 'navix-page--padding-none',
  sm: 'navix-page--padding-sm',
  md: '',
  lg: 'navix-page--padding-lg',
};

/**
 * PageContainer — structure de contenu officielle de toutes les pages.
 *
 * Gère automatiquement : padding horizontal/vertical, largeur maximale,
 * responsive et espacement entre les sections (ex. PageHeader puis contenu).
 *
 * Props :
 *   fluid    : booléen — supprime la limite de largeur (défaut : false)
 *   maxWidth : valeur CSS — remplace la largeur maximale
 *   padding  : 'none' | 'sm' | 'md' | 'lg'  (défaut : 'md', responsive)
 *   className: classes additionnelles
 *   style    : styles en ligne additionnels
 *   children : contenu de la page
 *
 * Usage :
 *   <PageContainer>
 *     <PageHeader ... />
 *     ...
 *   </PageContainer>
 */
const PageContainer = ({ fluid = false, maxWidth, padding = 'md', className, style, children, ...rest }) => {
  const classes = ['navix-page', fluid && 'navix-page--fluid', PADDINGS[padding], className]
    .filter(Boolean)
    .join(' ');

  const styles = maxWidth ? { maxWidth, ...style } : style;

  return (
    <div className={classes} style={styles} {...rest}>
      {children}
    </div>
  );
};

export default PageContainer;
