/**
 * Navix Notifications — NotificationCategoryBadge
 * --------------------------------------------------------------------------
 * Badge de catégorie (info, success, warning, danger, reminder) : résout
 * variante, icône et libellé via les constantes métier puis délègue au
 * StatusBadge de Core UI.
 */
import { StatusBadge } from '@/components/core';
import { getNotificationCategory } from '../constants';

const NotificationCategoryBadge = ({ category, size, className, dot = true }) => {
  const meta = getNotificationCategory(category);
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

export default NotificationCategoryBadge;
