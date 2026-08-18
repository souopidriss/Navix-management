/**
 * Navix Partner Portal — PartnerInvoiceAlerts (PROMPT 071 §27)
 * --------------------------------------------------------------------------
 * Alertes factures en retard et à échéance proche.
 */
import { PARTNER_INVOICE_STATUSES, PARTNER_PAYMENT_STATUSES } from '../../constants/partner.constants';

const PartnerInvoiceAlerts = ({ overdueInvoices = [], dueSoonInvoices = [] }) => {
  if (!overdueInvoices.length && !dueSoonInvoices.length) return null;

  return (
    <div className="mb-4">
      {overdueInvoices.map((inv) => (
        <div key={inv.id} className="navix-invoice-alert navix-invoice-alert--overdue" role="alert">
          <i className="bi bi-exclamation-triangle" aria-hidden="true" />
          <span>
            La facture <strong>{inv.reference}</strong> de <strong>{inv.totalAmount?.toLocaleString('fr-FR')} FCFA</strong> est en retard.
            Client : {inv.clientName}.
          </span>
        </div>
      ))}
      {dueSoonInvoices.map((inv) => (
        <div key={inv.id} className="navix-invoice-alert navix-invoice-alert--warning" role="alert">
          <i className="bi bi-clock-history" aria-hidden="true" />
          <span>
            La facture <strong>{inv.reference}</strong> de <strong>{inv.totalAmount?.toLocaleString('fr-FR')} FCFA</strong> arrive à échéance.
            Client : {inv.clientName}.
          </span>
        </div>
      ))}
    </div>
  );
};

export default PartnerInvoiceAlerts;
