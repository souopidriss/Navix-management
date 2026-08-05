/**
 * Navix Subscriptions — PlanComparison
 * --------------------------------------------------------------------------
 * Comparaison des plans sur une table : chaque ligne est une fonctionnalité,
 * groupée par catégorie ; chaque colonne est un plan (incluse / non incluse).
 * Première colonne fixe pour le défilement horizontal sur mobile.
 */
import { FEATURE_CATEGORIES, FEATURE_CATEGORY_VALUES, getBillingInterval, formatSubscriptionMoney } from '../constants';
import './PlanComparison.css';

const PlanComparison = ({ plans = [], planFeatures = {}, features = [] }) => {
  const featureByCode = Object.fromEntries(features.map((feature) => [feature.code, feature]));

  const rowsByCategory = FEATURE_CATEGORY_VALUES.map((category) => ({
    category,
    features: features.filter((feature) => feature.category === category),
  }));

  return (
    <div className="navix-plan-comparison">
      <div className="table-responsive">
        <table className="table align-middle mb-0 navix-plan-comparison__table" aria-label="Comparaison des plans d'abonnement">
          <thead>
            <tr>
              <th scope="col" className="navix-plan-comparison__feature-head">
                Fonctionnalités
              </th>
              {plans.map((plan) => (
                <th scope="col" key={plan.id} className="text-center">
                  <span className="navix-plan-comparison__plan-name">{plan.name}</span>
                  <span className="navix-plan-comparison__plan-price">
                    {formatSubscriptionMoney(plan.price, plan.currency)} /{' '}
                    {getBillingInterval(plan.billingInterval).label.toLowerCase()}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsByCategory.map(({ category, features: categoryFeatures }) => (
              <FragmentRow
                key={category}
                category={category}
                categoryFeatures={categoryFeatures}
                featureByCode={featureByCode}
                plans={plans}
                planFeatures={planFeatures}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FragmentRow = ({ category, categoryFeatures, featureByCode, plans, planFeatures }) => (
  <>
    <tr className="navix-plan-comparison__category">
      <th scope="row" colSpan={plans.length + 1}>
        {FEATURE_CATEGORIES[category]?.label ?? category}
      </th>
    </tr>
    {categoryFeatures.map((feature) => {
      const meta = featureByCode[feature.code] ?? feature;
      return (
        <tr key={feature.code}>
          <th scope="row" className="navix-plan-comparison__feature">
            <i className={`bi ${meta.icon} navix-plan-comparison__feature-icon`} aria-hidden="true" />
            {meta.name}
          </th>
          {plans.map((plan) => {
            const included = (planFeatures[plan.code] || []).some((item) => item.code === feature.code);
            return (
              <td key={plan.id} className="text-center">
                {included ? (
                  <i
                    className="bi bi-check-circle-fill navix-plan-comparison__included"
                    aria-label="Inclus"
                    role="img"
                  />
                ) : (
                  <i
                    className="bi bi-dash-lg navix-plan-comparison__excluded"
                    aria-label="Non inclus"
                    role="img"
                  />
                )}
              </td>
            );
          })}
        </tr>
      );
    })}
  </>
);

export default PlanComparison;
