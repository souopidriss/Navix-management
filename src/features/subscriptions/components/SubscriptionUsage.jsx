/**
 * Navix Subscriptions — SubscriptionUsage
 * --------------------------------------------------------------------------
 * Vue d'ensemble de l'utilisation d'un abonnement : liste des ressources
 * (UsageProgress) avec une légende des niveaux (normal / attention /
 * critique). Consommé par SubscriptionDetailsPage et SubscriptionUsagePage.
 */
import { LIMIT_THRESHOLDS } from '../constants';
import UsageProgress from './UsageProgress';
import './SubscriptionUsage.css';

const LEVEL_ORDER = ['normal', 'warning', 'critical'];

const SubscriptionUsage = ({ rows = [], compact = false }) => (
  <div className="navix-subscription-usage">
    {!compact && (
      <div className="navix-subscription-usage__legend" aria-label="Légende des niveaux d'utilisation">
        {LEVEL_ORDER.map((key) => {
          const level = LIMIT_THRESHOLDS[key];
          return (
            <span key={key} className={`navix-subscription-usage__legend-item navix-subscription-usage__legend-item--${level.variant}`}>
              <i className={`bi ${level.icon}`} aria-hidden="true" />
              {level.label}
            </span>
          );
        })}
      </div>
    )}
    <div className="navix-subscription-usage__rows">
      {rows.map((row) => (
        <UsageProgress
          key={row.limitKey}
          label={row.label}
          icon={row.icon}
          used={row.used}
          limit={row.limit}
          ratio={row.ratio}
          level={row.level}
        />
      ))}
    </div>
  </div>
);

export default SubscriptionUsage;
