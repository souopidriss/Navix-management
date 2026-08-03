/**
 * Navix Core — ErrorState
 * --------------------------------------------------------------------------
 * État d'erreur générique : icône, titre, description et action « Réessayer ».
 *
 * Props :
 *   title       : titre de l'erreur         (défaut : 'Une erreur est survenue')
 *   description : explication (texte ou nœud)
 *   retry       : () => void — déclenche une nouvelle tentative
 *   retryLabel  : libellé du bouton         (défaut : 'Réessayer')
 *   icon        : classe d'icône Bootstrap Icons (défaut : 'bi-exclamation-triangle')
 *   variant     : danger | warning           (défaut : 'danger')
 *   className   : classes additionnelles
 *
 * Exemple :
 *   <ErrorState
 *     title="Impossible de charger les données"
 *     description={error}
 *     retry={fetchData}
 *   />
 */
import { memo } from 'react';
import { Button } from '@/components/ui';
import './ErrorState.css';

const ICONS = {
  danger: 'bi-exclamation-triangle',
  warning: 'bi-exclamation-diamond',
};

const ErrorState = ({
  title = 'Une erreur est survenue',
  description,
  retry,
  retryLabel = 'Réessayer',
  icon,
  variant = 'danger',
  className,
  ...rest
}) => (
  <div className={`navix-error navix-error--${variant} text-center ${className || ''}`.trim()} role="alert" {...rest}>
    <span className="navix-error__icon" aria-hidden="true">
      <i className={`bi ${icon || ICONS[variant] || ICONS.danger}`} />
    </span>
    <h2 className="navix-error__title">{title}</h2>
    {description && <p className="navix-error__description">{description}</p>}
    {retry && (
      <Button variant="outline" size="sm" icon="bi-arrow-clockwise" onClick={retry} className="mt-3">
        {retryLabel}
      </Button>
    )}
  </div>
);

export default memo(ErrorState);
