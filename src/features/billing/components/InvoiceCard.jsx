/**
 * Navix Billing — InvoiceCard
 * --------------------------------------------------------------------------
 * Carte compacte d'une facture (vue mobile / tablette) : numéro, entreprise,
 * statut, montant, échéance et période de facturation.
 */
import { Button, Card } from '@/components/ui';
import { formatBillingDate } from '../constants';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import BillingAmount from './BillingAmount';
import './InvoiceCard.css';

const InvoiceCard = ({ invoice, company, onView }) => (
  <Card className="navix-invoice-card" padding="md">
    <div className="navix-invoice-card__head">
      <div className="navix-invoice-card__identity">
        <span className="navix-invoice-card__icon" aria-hidden="true">
          <i className="bi bi-receipt" />
        </span>
        <div className="min-w-0">
          <h3 className="navix-invoice-card__number mb-0">{invoice.number}</h3>
          <p className="navix-invoice-card__company mb-0">{company?.name ?? '—'}</p>
        </div>
      </div>
      <InvoiceStatusBadge status={invoice.status} size="sm" />
    </div>

    <div className="navix-invoice-card__amount">
      <span className="navix-invoice-card__amount-label">Montant total</span>
      <span className="navix-invoice-card__amount-value">
        <BillingAmount value={invoice.total} currency={invoice.currency} />
      </span>
    </div>

    <dl className="navix-invoice-card__details">
      <div>
        <dt>Émise le</dt>
        <dd>{formatBillingDate(invoice.issuedDate)}</dd>
      </div>
      <div>
        <dt>Échéance</dt>
        <dd>{formatBillingDate(invoice.dueDate)}</dd>
      </div>
      <div>
        <dt>Reste dû</dt>
        <dd className="navix-invoice-card__due">
          {invoice.status === 'paid' ? (
            'Soldée'
          ) : (
            <BillingAmount value={invoice.amountDue} currency={invoice.currency} />
          )}
        </dd>
      </div>
    </dl>

    <div className="navix-invoice-card__actions">
      <Button variant="outline" size="sm" icon="bi-eye" fullWidth onClick={() => onView?.(invoice.id)}>
        Détails
      </Button>
    </div>
  </Card>
);

export default InvoiceCard;
