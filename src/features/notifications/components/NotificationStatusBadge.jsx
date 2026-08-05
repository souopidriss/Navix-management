/**
 * Navix Notifications — NotificationStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut de notification (unread, read, archived, dismissed) : résout
 * variante, icône et libellé via les constantes métier puis délègue au
 * StatusBadge générique de Core UI.
 */
import { StatusBadge } from '@/components/core';
import { getNotificationStatus } from '../constants';

const NotificationStatusBadge = ({ status, size, className, dot = true }) => {
  const meta = getNotificationStatus(status);
  return (
    <StatusBadge
      variant={meta.variant}
      icon={meta.icon}
      label={meta.label}
      size={size}
      dot={dot}
      className={className}
    />
  );
};

export default NotificationStatusBadge;
