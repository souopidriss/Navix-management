/**
 * Navix Subscriptions — SubscriptionStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Abonnements : total, essais en cours,
 * actifs, paiements en retard et revenu mensuel récurrent (MRR). Les valeurs
 * sont dérivées de la liste chargée.
 *
 * Props :
 *   subscriptions : liste des abonnements (source des compteurs)
 */
import { Card } from '@/components/ui';
import { formatSubscriptionMoney, DEFAULT_CURRENCY } from '../constants';
import './SubscriptionStatsCards.css';

const REVENUE_STATUSES = new Set(['active', 'trialing', 'past_due']);

const buildStats = (subscriptions = []) => [
  {
    key: 'total',
    label: 'Abonnements',
    value: subscriptions.length,
    icon: 'bi-credit-card',
    variant: 'primary',
  },
  {
    key: 'trialing',
    label: 'Essais en cours',
    value: subscriptions.filter((subscription) => subscription.status === 'trialing').length,
    icon: 'bi-hourglass-split',
    variant: 'info',
  },
  {
    key: 'active',
    label: 'Actifs',
    value: subscriptions.filter((subscription) => subscription.status === 'active').length,
    icon: 'bi-check-circle',
    variant: 'success',
  },
  {
    key: 'pastDue',
    label: 'Paiements en retard',
    value: subscriptions.filter((subscription) => subscription.status === 'past_due').length,
    icon: 'bi-exclamation-triangle',
    variant: 'warning',
  },
  {
    key: 'mrr',
    label: 'Revenu mensuel (MRR)',
    value: formatSubscriptionMoney(
      subscriptions
        .filter((subscription) => REVENUE_STATUSES.has(subscription.status))
        .reduce((total, subscription) => total + Number(subscription.price || 0), 0),
      DEFAULT_CURRENCY,
    ),
    icon: 'bi-cash-stack',
    variant: 'dark',
  },
];

const SubscriptionStatsCards = ({ subscriptions = [] }) => (
  <div className="row g-3 navix-subscription-stats">
    {buildStats(subscriptions).map((stat) => (
      <div key={stat.key} className="col-6 col-md-4 col-xl">
        <Card className="navix-subscription-stat">
          <span className={`navix-subscription-stat__icon navix-subscription-stat__icon--${stat.variant}`} aria-hidden="true">
            <i className={`bi ${stat.icon}`} />
          </span>
          <span className="navix-subscription-stat__body">
            <span className="navix-subscription-stat__value">{stat.value}</span>
            <span className="navix-subscription-stat__label">{stat.label}</span>
          </span>
        </Card>
      </div>
    ))}
  </div>
);

export default SubscriptionStatsCards;
