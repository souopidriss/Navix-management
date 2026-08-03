/**
 * Navix Core — EmptyState
 * --------------------------------------------------------------------------
 * État vide générique : icône (ou image), titre, description et action
 * optionnelle. Utilisé par DataTable et par les modules pour « aucun
 * résultat » / « aucune donnée ».
 *
 * Props :
 *   icon        : classe d'icône Bootstrap Icons, ex. 'bi-inbox' (défaut : 'bi-inbox')
 *   image       : URL d'une image (prioritaire si fournie)
 *   title       : titre principal
 *   description : texte explicatif (peut être un nœud)
 *   action      : nœud d'action (ex. un Button « Réinitialiser les filtres »)
 *   compact     : booléen — réduit les espacements                  (défaut : false)
 *   className   : classes additionnelles
 *
 * Exemple :
 *   <EmptyState
 *     icon="bi-fuel-pump"
 *     title="Aucun résultat"
 *     description="Aucun élément ne correspond à vos critères."
 *     action={<Button variant="outline" size="sm" onClick={onReset}>Réinitialiser</Button>}
 *   />
 */
import { memo } from 'react';
import './EmptyState.css';

const EmptyState = ({
  icon = 'bi-inbox',
  image,
  title = 'Aucune donnée',
  description,
  action,
  compact = false,
  className,
  ...rest
}) => {
  const classes = ['navix-empty', compact && 'navix-empty--compact', className].filter(Boolean).join(' ');

  return (
    <div className={`${classes} text-center`} {...rest}>
      <span className="navix-empty__visual" aria-hidden="true">
        {image ? (
          <img className="navix-empty__image" src={image} alt="" />
        ) : (
          <i className={`bi ${icon}`} />
        )}
      </span>
      <h2 className="navix-empty__title">{title}</h2>
      {description && <p className="navix-empty__description">{description}</p>}
      {action && <div className="navix-empty__action">{action}</div>}
    </div>
  );
};

export default memo(EmptyState);
