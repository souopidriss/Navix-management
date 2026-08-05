/**
 * Navix Billing — DiscountBadge
 * --------------------------------------------------------------------------
 * Badge de remise : code + type (pourcentage / montant fixe) formaté.
 */
import { Badge } from '@/components/ui';
import { getDiscountType, formatBillingMoney } from '../constants';

const DiscountBadge = ({ discount, size, className }) => {
  if (!discount) return null;
  const meta = getDiscountType(discount.type);
  const value =
    discount.type === 'percentage'
      ? `${Number(discount.value)} %`
      : formatBillingMoney(discount.value, discount.currency);

  return (
    <Badge variant="success" soft size={size} className={className}>
      <i className={`bi ${meta.icon} me-1`} aria-hidden="true" />
      {discount.code} · {value}
    </Badge>
  );
};

export default DiscountBadge;
