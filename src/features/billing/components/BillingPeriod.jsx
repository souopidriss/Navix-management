/**
 * Navix Billing — BillingPeriod
 * --------------------------------------------------------------------------
 * Plaquette d'affichage de la période de facturation d'une facture
 * (ex. 1 juil. 2026 → 31 juil. 2026).
 */
import { Badge } from '@/components/ui';
import { formatBillingPeriod } from '../constants';

const BillingPeriod = ({ start, end, className }) => (
  <Badge variant="light" className={className}>
    <i className="bi bi-calendar-range me-1" aria-hidden="true" />
    {formatBillingPeriod(start, end)}
  </Badge>
);

export default BillingPeriod;
