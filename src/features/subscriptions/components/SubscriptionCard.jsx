/**
 * Navix Subscriptions — SubscriptionCard
 * --------------------------------------------------------------------------
 * Carte compacte d'un abonnement (vue mobile / tablette) : entreprise, plan,
 * statut, prix, période de facturation, renouvellement et actions.
 */
import { Button, Card } from '@/components/ui';
import { getPlan, getBillingInterval, formatSubscriptionMoney, formatSubscriptionDate } from '../constants';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';
import './SubscriptionCard.css';

const SubscriptionCard = ({ subscription, company, plan, onView }) => {
  const planMeta = getPlan(plan?.code);

  return (
    <Card className="navix-subscription-card" padding="md">
      <div className="navix-subscription-card__head">
        <div className="navix-subscription-card__identity">
          <span className={`navix-subscription-card__logo navix-subscription-card__logo--${planMeta.variant}`} aria-hidden="true">
            <i className={`bi ${planMeta.icon}`} />
          </span>
          <div>
            <h3 className="navix-subscription-card__company mb-0">{company?.name ?? '—'}</h3>
            <p className="navix-subscription-card__meta mb-0">
              {plan?.name} · {formatSubscriptionMoney(subscription.price, subscription.currency)} /{' '}
              {getBillingInterval(subscription.billingInterval).label.toLowerCase()}
            </p>
          </div>
        </div>
        <SubscriptionStatusBadge status={subscription.status} size="sm" />
      </div>

      <dl className="navix-subscription-card__details">
        <div>
          <dt>Période</dt>
          <dd>
            {formatSubscriptionDate(subscription.currentPeriodStart)} →{' '}
            {formatSubscriptionDate(subscription.currentPeriodEnd)}
          </dd>
        </div>
        <div>
          <dt>Renouvellement</dt>
          <dd>{formatSubscriptionDate(subscription.renewalDate)}</dd>
        </div>
      </dl>

      <div className="navix-subscription-card__actions">
        <Button variant="outline" size="sm" icon="bi-eye" fullWidth onClick={() => onView?.(subscription.id)}>
          Détails
        </Button>
      </div>
    </Card>
  );
};

export default SubscriptionCard;
