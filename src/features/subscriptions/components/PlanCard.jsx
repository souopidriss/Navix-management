/**
 * Navix Subscriptions — PlanCard
 * --------------------------------------------------------------------------
 * Carte d'un plan SaaS : nom, badge « populaire », prix + intervalle, durée
 * d'essai, description, fonctionnalités incluses (extrait) et bouton d'action
 * (choisir / plan actuel). Responsive : une carte par colonne sur desktop,
 * empilée sur mobile.
 */
import { Badge, Button, Card } from '@/components/ui';
import { getPlan, formatSubscriptionMoney, getBillingInterval } from '../constants';
import './PlanCard.css';

const FEATURES_PREVIEW = 5;

const PlanCard = ({ plan, features = [], active = false, onSelect }) => {
  const meta = getPlan(plan.code);
  const preview = features.slice(0, FEATURES_PREVIEW);
  const extraCount = Math.max(0, features.length - FEATURES_PREVIEW);

  return (
    <Card className={`navix-plan-card ${active ? 'navix-plan-card--active' : ''} ${plan.isPopular ? 'navix-plan-card--popular' : ''}`} padding="lg">
      <div className="navix-plan-card__header">
        <div className="d-flex align-items-center gap-2">
          <span className={`navix-plan-card__icon navix-plan-card__icon--${meta.variant}`} aria-hidden="true">
            <i className={`bi ${meta.icon}`} />
          </span>
          <h3 className="navix-plan-card__name mb-0">{plan.name}</h3>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {plan.isPopular && <Badge variant="primary" soft>Populaire</Badge>}
          {active && <Badge variant="success" soft icon="bi-check-circle">Plan actuel</Badge>}
        </div>
      </div>

      <div className="navix-plan-card__price">
        <span className="navix-plan-card__amount">
          {formatSubscriptionMoney(plan.price, plan.currency)}
        </span>
        <span className="navix-plan-card__interval">/ {getBillingInterval(plan.billingInterval).label.toLowerCase()}</span>
      </div>

      <p className="navix-plan-card__description">{plan.description}</p>

      {Number(plan.trialDays) > 0 && (
        <p className="navix-plan-card__trial">
          <i className="bi bi-gift me-1" aria-hidden="true" />
          {plan.trialDays} jours d’essai gratuit
        </p>
      )}

      <ul className="navix-plan-card__features">
        {preview.map((feature) => (
          <li key={feature.code}>
            <i className="bi bi-check-circle-fill navix-plan-card__check" aria-hidden="true" />
            <span>{feature.name}</span>
          </li>
        ))}
        {extraCount > 0 && (
          <li className="navix-plan-card__more">
            <i className="bi bi-plus-circle" aria-hidden="true" />
            <span>+ {extraCount} fonctionnalité{extraCount > 1 ? 's' : ''}</span>
          </li>
        )}
      </ul>

      <div className="navix-plan-card__footer">
        <Button
          variant={active ? 'secondary' : 'primary'}
          icon={active ? 'bi-check2' : 'bi-box-arrow-in-right'}
          fullWidth
          disabled={active}
          onClick={() => onSelect?.(plan)}
        >
          {active ? 'Plan actuel' : 'Choisir ce plan'}
        </Button>
      </div>
    </Card>
  );
};

export default PlanCard;
