/**
 * Navix Subscriptions — SubscriptionStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'abonnement : délègue l'affichage au StatusBadge générique
 * de Core UI en résolvant la variante, l'icône et le libellé via les
 * constantes métier du module (trialing, active, past_due, paused, cancelled,
 * expired).
 */
import { StatusBadge } from '@/components/core';
import { getSubscriptionStatus } from '../constants';

const SubscriptionStatusBadge = ({ status, size, className, dot = true }) => {
  const meta = getSubscriptionStatus(status);
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

export default SubscriptionStatusBadge;
