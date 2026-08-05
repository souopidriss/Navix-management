/**
 * Navix Notifications — AlertBanner
 * --------------------------------------------------------------------------
 * Bannière d'urgence : affiche la notification critique / haute non lue la
 * plus récente avec un lien vers son détail et un bouton d'ignorance.
 * Construite sur l'Alert de l'UI et les tokens du design system.
 *
 * Props :
 *   notification : notification urgente (ou null si aucune)
 *   onView       : (notification) => void
 *   onDismiss    : (id: string) => void
 */
import { Button } from '@/components/ui';
import { Alert } from '@/components/ui';
import { formatNotificationRelative } from '../constants';
import './AlertBanner.css';

const AlertBanner = ({ notification, onView, onDismiss }) => {
  if (!notification) return null;

  return (
    <Alert
      variant={notification.severity === 'critical' ? 'danger' : 'warning'}
      icon={notification.severity === 'critical' ? 'bi-exclamation-octagon-fill' : 'bi-exclamation-triangle-fill'}
      closable
      onClose={() => onDismiss?.(notification.id)}
      className="navix-alert-banner mb-3"
      role="alert"
      aria-live="polite"
    >
      <div className="navix-alert-banner__content">
        <div className="navix-alert-banner__text">
          <strong>{notification.title}</strong>
          <span className="navix-alert-banner__meta">
            {notification.message} — <time dateTime={notification.createdAt}>{formatNotificationRelative(notification.createdAt)}</time>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon="bi-eye"
          onClick={() => onView?.(notification)}
        >
          Voir
        </Button>
      </div>
    </Alert>
  );
};

export default AlertBanner;
