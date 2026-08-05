/**
 * Navix Billing — InvoiceStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut de facture : délègue l'affichage au StatusBadge générique
 * de Core UI en résolvant la variante, l'icône et le libellé via les
 * constantes métier (draft, issued, paid, partially_paid, overdue,
 * cancelled, refunded).
 */
import { StatusBadge } from '@/components/core';
import { getInvoiceStatus } from '../constants';

const InvoiceStatusBadge = ({ status, size, className, dot = true }) => {
  const meta = getInvoiceStatus(status);
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

export default InvoiceStatusBadge;
