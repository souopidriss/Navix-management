import { Fragment } from 'react';
import {
  PLANS,
  FEATURES,
  FEATURE_CATEGORIES,
  FEATURE_CATEGORY_VALUES,
} from '@/features/subscriptions/constants/subscription.constants';
import { MOCK_PLANS, MOCK_PLAN_FEATURES } from '@/features/subscriptions/mocks/subscriptions.mock';
import './FeatureComparison.css';

const PLAN_CODES = MOCK_PLANS.map((p) => p.code);

const FeatureComparison = () => (
  <section className="nv-fcomp" aria-labelledby="fcomp-title">
    <div className="nv-container">
      <div className="nv-section-header">
        <span className="nv-badge">
          <i className="bi bi-grid-3x3" aria-hidden="true" />
          COMPARAISON COMPL&Egrave;TE
        </span>
        <h2 id="fcomp-title" className="nv-section-title">
          Toutes les fonctionnalit&eacute;s, plan par plan
        </h2>
        <p className="nv-section-subtitle">
          Comparez les fonctionnalit&eacute;s incluses dans chaque formule pour
          choisir celle qui correspond &agrave; vos besoins.
        </p>
      </div>

      <div className="nv-fcomp__table-wrap">
        <table className="nv-fcomp__table" role="table" aria-label="Comparaison des fonctionnalit\u00e9s par plan">
          <thead>
            <tr>
              <th scope="col" className="nv-fcomp__th nv-fcomp__th--feature">
                Fonctionnalit&eacute;
              </th>
              {PLAN_CODES.map((code) => {
                const meta = PLANS[code] || {};
                return (
                  <th key={code} scope="col" className="nv-fcomp__th">
                    <span className="nv-fcomp__plan-name">{meta.label || code}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {FEATURE_CATEGORY_VALUES.map((catCode) => {
              const category = FEATURE_CATEGORIES[catCode];
              const featuresInCat = Object.entries(FEATURES).filter(
                ([, f]) => f.category === catCode,
              );
              if (featuresInCat.length === 0) return null;

              return (
                <Fragment key={catCode}>
                  <tr className="nv-fcomp__cat-row">
                    <td colSpan={PLAN_CODES.length + 1} className="nv-fcomp__cat-cell">
                      <i className={`bi ${category.icon}`} aria-hidden="true" />
                      {category.label}
                    </td>
                  </tr>
                  {featuresInCat.map(([code, feature]) => (
                    <tr key={code} className="nv-fcomp__row">
                      <td className="nv-fcomp__td nv-fcomp__td--feature">
                        <i className={`bi ${feature.icon} nv-fcomp__feature-icon`} aria-hidden="true" />
                        {feature.label}
                      </td>
                      {PLAN_CODES.map((planCode) => {
                        const included = (MOCK_PLAN_FEATURES[planCode] || []).includes(code);
                        return (
                          <td key={planCode} className="nv-fcomp__td">
                            {included ? (
                              <span className="nv-fcomp__check" aria-label={`${feature.label} inclus dans ${PLANS[planCode]?.label || planCode}`}>
                                <i className="bi bi-check-circle-fill" aria-hidden="true" />
                              </span>
                            ) : (
                              <span className="nv-fcomp__dash" aria-label={`${feature.label} non inclus dans ${PLANS[planCode]?.label || planCode}`}>
                                <i className="bi bi-dash" aria-hidden="true" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default FeatureComparison;
