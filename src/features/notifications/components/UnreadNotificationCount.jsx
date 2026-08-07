/**
 * Navix Notifications — UnreadNotificationCount
 * --------------------------------------------------------------------------
 * Compteur de notifications non lues (cloche navbar, carte dashboard).
 * Affichage « 99+ » au-delà de 99, masqué si aucune non lue.
 *
 * Props :
 *   count     : nombre de notifications non lues
 *   className : classes additionnelles
 *   ...rest   : attributs ARIA supplémentaires
 */
import './UnreadNotificationCount.css';

const UnreadNotificationCount = ({ count = 0, className, ...rest }) => {
  if (!count || count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);

  return (
    <span className={`navix-unread-count ${className ?? ''}`} aria-live="polite" {...rest}>
      {label}
    </span>
  );
};

export default UnreadNotificationCount;
