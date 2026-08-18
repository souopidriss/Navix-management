import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { PLANS, FEATURES, DEFAULT_TRIAL_DAYS, MONTHS_PER_BILLING_INTERVAL } from '@/features/subscriptions/constants/subscription.constants';
import { MOCK_PLANS, MOCK_PLAN_FEATURES } from '@/features/subscriptions/mocks/subscriptions.mock';
import './PricingCards.css';

const formatPrice = (price) =>
  Number(price ?? 0).toLocaleString('fr-FR');

const PricingCards = ({ interval }) => (
  <div className="nv-pcards" role="list" aria-label="Formules d'abonnement">
    {MOCK_PLANS.map((plan) => {
      const meta = PLANS[plan.code] || {};
      const featureCodes = MOCK_PLAN_FEATURES[plan.code] || [];
      const yearlyPrice = plan.price * 10;
      const displayPrice = interval === 'yearly' ? yearlyPrice : plan.price;
      const isYearly = interval === 'yearly';
      const perMonth = isYearly ? plan.price : displayPrice;

      return (
        <div
          key={plan.id}
          className={`nv-pcard ${plan.isPopular ? 'nv-pcard--popular' : ''}`}
          role="listitem"
        >
          {plan.isPopular && (
            <span className="nv-pcard__badge">
              <i className="bi bi-star-fill" aria-hidden="true" />
              Populaire
            </span>
          )}

          <div className="nv-pcard__head">
            <div className="nv-pcard__icon" aria-hidden="true">
              <i className={`bi ${meta.icon || 'bi-circle'}`} />
            </div>
            <h3 className="nv-pcard__name">{plan.name}</h3>
            <p className="nv-pcard__desc">{plan.description}</p>
          </div>

          <div className="nv-pcard__price-block">
            <span className="nv-pcard__price">
              {formatPrice(displayPrice)}
            </span>
            <span className="nv-pcard__currency">FCFA</span>
            <span className="nv-pcard__period">
              {isYearly ? '/an' : '/mois'}
            </span>
          </div>

          {isYearly && (
            <p className="nv-pcard__monthly">
              soit {formatPrice(perMonth)} FCFA/mois
            </p>
          )}

          <p className="nv-pcard__trial">
            <i className="bi bi-clock-history" aria-hidden="true" />
            {DEFAULT_TRIAL_DAYS} jours d'essai gratuit
          </p>

          <ul className="nv-pcard__features" aria-label={`Fonctionnalités ${plan.name}`}>
            {featureCodes.map((code) => {
              const feature = FEATURES[code];
              if (!feature) return null;
              return (
                <li key={code} className="nv-pcard__feature">
                  <i className="bi bi-check-circle-fill" aria-hidden="true" />
                  {feature.label}
                </li>
              );
            })}
          </ul>

          <div className="nv-pcard__cta">
            <Link
              to={ROUTES.LOGIN}
              className={plan.isPopular ? 'nv-btn-orange nv-btn-orange--lg nv-pcard__btn' : 'nv-btn-outline-navy nv-pcard__btn'}
            >
              Commencer l'essai gratuit
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      );
    })}
  </div>
);

export default PricingCards;
