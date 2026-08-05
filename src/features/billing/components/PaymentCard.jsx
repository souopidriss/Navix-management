/**
 * Navix Billing — PaymentCard
 * --------------------------------------------------------------------------
 * Carte compacte d'un paiement (vue mobile / tablette) : numéro, entreprise,
 * statut, moyen de paiement, montant et date.
 */
import { Button, Card } from '@/components/ui';
import { formatBillingDate } from '../constants';
import PaymentStatusBadge from './PaymentStatusBadge';
import PaymentMethodBadge from './PaymentMethodBadge';
import BillingAmount from './BillingAmount';
import './PaymentCard.css';

const PaymentCard = ({ payment, company, invoice, onView }) => (
  <Card className="navix-payment-card" padding="md">
    <div className="navix-payment-card__head">
      <div className="navix-payment-card__identity">
        <span className="navix-payment-card__icon" aria-hidden="true">
          <i className="bi bi-cash-coin" />
        </span>
        <div className="min-w-0">
          <h3 className="navix-payment-card__number mb-0">{payment.number}</h3>
          <p className="navix-payment-card__company mb-0">{company?.name ?? '—'}</p>
        </div>
      </div>
      <PaymentStatusBadge status={payment.status} size="sm" />
    </div>

    <div className="navix-payment-card__amount">
      <span className="navix-payment-card__amount-label">Montant</span>
      <span className="navix-payment-card__amount-value">
        <BillingAmount value={payment.amount} currency={payment.currency} />
      </span>
    </div>

    <dl className="navix-payment-card__details">
      <div>
        <dt>Moyen</dt>
        <dd>
          <PaymentMethodBadge method={payment.method} size="sm" />
        </dd>
      </div>
      <div>
        <dt>Date</dt>
        <dd>{formatBillingDate(payment.paymentDate)}</dd>
      </div>
      <div>
        <dt>Facture</dt>
        <dd>{invoice?.number ?? '—'}</dd>
      </div>
    </dl>

    <div className="navix-payment-card__actions">
      <Button variant="outline" size="sm" icon="bi-eye" fullWidth onClick={() => onView?.(payment.id)}>
        Détails
      </Button>
    </div>
  </Card>
);

export default PaymentCard;
