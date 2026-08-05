/**
 * Navix Notifications — NotificationTypeBadge
 * --------------------------------------------------------------------------
 * Badge du type de notification (system, maintenance, vehicle, driver,
 * assignment, trip, fuel, document, billing, subscription, security, report) :
 * résout variante, icône et libellé via les constantes métier puis délègue au
 * StatusBadge de Core UI.
 */
import { StatusBadge } from '@/components/core';
import { getNotificationType } from '../constants';

const NotificationTypeBadge = ({ type, size, className, dot = true }) => {
  const meta = getNotificationType(type);
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

export default NotificationTypeBadge;
