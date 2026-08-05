/**
 * Navix Notifications — NotificationSeverityBadge
 * --------------------------------------------------------------------------
 * Badge de sévérité (low, medium, high, critical) : résout variante, icône et
 * libellé via les constantes métier puis délègue au StatusBadge de Core UI.
 */
import { StatusBadge } from '@/components/core';
import { getNotificationSeverity } from '../constants';

const NotificationSeverityBadge = ({ severity, size, className, dot = true }) => {
  const meta = getNotificationSeverity(severity);
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

export default NotificationSeverityBadge;
