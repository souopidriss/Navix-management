/**
 * Navix Billing — CreditBadge
 * --------------------------------------------------------------------------
 * Badge de crédit / avoir : statut (disponible, utilisé, expiré) + montant.
 */
import { StatusBadge } from '@/components/core';
import { getCreditStatus, formatBillingMoney } from '../constants';

const CreditBadge = ({ status, amount, currency, size, className }) => {
  const meta = getCreditStatus(status);
  return (
    <StatusBadge
      variant={meta.variant}
      icon={meta.icon}
      label={`${meta.label} · ${formatBillingMoney(amount, currency)}`}
      size={size}
      className={className}
    />
  );
};

export default CreditBadge;
