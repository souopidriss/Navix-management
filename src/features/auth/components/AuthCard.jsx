/**
 * Navix Auth — AuthCard
 * --------------------------------------------------------------------------
 * Carte d'authentification (coquille sémantique de toutes les pages Auth).
 * Construite sur le composant UI `Card` du design system : en-tête (h1 +
 * sous-titre), corps (le formulaire), pied optionnel.
 *
 * Props :
 *   title    : titre de la page (rendu en <h1>)
 *   subtitle : sous-titre affiché sous le titre
 *   children : contenu de la carte (ex. un formulaire)
 *   footer   : pied de carte optionnel (centré)
 *   className: classes additionnelles
 *   ...rest  : autres attributs
 */
import { Card } from '@/components/ui';
import './AuthCard.css';

const AuthCard = ({ title, subtitle, children, footer, className, ...rest }) => {
  const classes = ['navix-auth-card', className].filter(Boolean).join(' ');

  return (
    <Card shadow="md" padding="xl" className={classes} {...rest}>
      {(title || subtitle) && (
        <header className="navix-auth-card__header text-center">
          {title && <h1 className="h4 navix-auth-card__title">{title}</h1>}
          {subtitle && <p className="navix-auth-card__subtitle text-secondary">{subtitle}</p>}
        </header>
      )}
      {children}
      {footer && <footer className="navix-auth-card__footer text-center">{footer}</footer>}
    </Card>
  );
};

export default AuthCard;
