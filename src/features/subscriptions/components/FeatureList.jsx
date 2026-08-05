/**
 * Navix Subscriptions — FeatureList
 * --------------------------------------------------------------------------
 * Liste des fonctionnalités d'un plan en grille responsive : icône + libellé,
 * coche pour les fonctionnalités incluses et croix pour celles non incluses
 * (lorsque `allFeatures` est fourni). Accessible (listes + aria).
 */
import './FeatureList.css';

const FeatureList = ({ features = [], allFeatures, columns = 2 }) => {
  const hasAll = Array.isArray(allFeatures) && allFeatures.length > 0;
  const items = hasAll ? allFeatures : features;

  const gridClass = columns === 3 ? 'navix-feature-list--3' : 'navix-feature-list--2';

  return (
    <ul className={`navix-feature-list ${gridClass}`} aria-label="Fonctionnalités du plan">
      {items.map((feature) => {
        const included = hasAll
          ? features.some((item) => item.code === feature.code)
          : true;
        return (
          <li key={feature.code} className={included ? '' : 'navix-feature-list__item--excluded'}>
            {included ? (
              <i className="bi bi-check-circle-fill navix-feature-list__check" aria-hidden="true" />
            ) : (
              <i className="bi bi-x-circle navix-feature-list__cross" aria-hidden="true" />
            )}
            <i className={`bi ${feature.icon} navix-feature-list__icon me-2`} aria-hidden="true" />
            <span>{feature.name}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default FeatureList;
