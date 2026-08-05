/**
 * Navix Billing — PaymentStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut de paiement : délègue l'affichage au StatusBadge générique
 * de Core UI (pending, processing, successful, failed, cancelled, refunded).
 */
import { StatusBadge } from '@/components/core';
import { getPaymentStatus } from '../constants';

const PaymentStatusBadge = ({ status, size, className, dot = true }) => {
  const meta = getPaymentStatus(status);
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

export default PaymentStatusBadge;
