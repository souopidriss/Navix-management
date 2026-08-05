/**
 * Navix Billing — PaymentMethodBadge
 * --------------------------------------------------------------------------
 * Badge du moyen de paiement (simulé) : virement bancaire, Mobile Money,
 * carte, espèces ou autre. Aucun traitement réel.
 */
import { StatusBadge } from '@/components/core';
import { getPaymentMethod } from '../constants';

const PaymentMethodBadge = ({ method, size, className, dot = false }) => {
  const meta = getPaymentMethod(method);
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

export default PaymentMethodBadge;
