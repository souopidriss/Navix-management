/**
 * Navix Client Dashboard — ClientKpiCards
 * --------------------------------------------------------------------------
 * Rangée de cartes KPI premium pour le Dashboard Client.
 * Adaptée selon clientType (Entreprise vs Particulier).
 * Réutilise les tokens CSS du design system Navix.
 */
import './ClientDashboard.css';

const TrendIcon = ({ trend }) => {
  if (trend > 0) return <i className="bi bi-arrow-up-short" aria-hidden="true" />;
  if (trend < 0) return <i className="bi bi-arrow-down-short" aria-hidden="true" />;
  return <i className="bi bi-dash" aria-hidden="true" />;
};

const VARIANT_ICON_BG = {
  primary: 'var(--navix-primary-muted)',
  warning: 'rgba(245,165,36,0.12)',
  info: 'rgba(77,163,255,0.12)',
  success: 'rgba(63,203,143,0.12)',
  danger: 'rgba(240,72,77,0.12)',
  secondary: 'rgba(124,134,152,0.12)',
};

const VARIANT_COLOR = {
  primary: 'var(--navix-primary)',
  warning: 'var(--navix-warning)',
  info: 'var(--navix-info)',
  success: 'var(--navix-success)',
  danger: 'var(--navix-danger)',
  secondary: 'var(--navix-secondary)',
};

const ClientKpiCard = ({ metric }) => {
  const { label, value, trend, trendLabel, icon, variant } = metric;
  const color = VARIANT_COLOR[variant] || VARIANT_COLOR.primary;
  const iconBg = VARIANT_ICON_BG[variant] || VARIANT_ICON_BG.primary;
  const trendPositive = trend <= 0;

  return (
    <div className="navix-client-kpi-card" aria-label={`KPI : ${label}`}>
      <div className="navix-client-kpi-card__header">
        <span className="navix-client-kpi-card__icon" style={{ background: iconBg, color }}>
          <i className={`bi ${icon}`} aria-hidden="true" />
        </span>
        <span className="navix-client-kpi-card__label">{label}</span>
      </div>

      <div className="navix-client-kpi-card__value">{value}</div>

      {trendLabel && (
        <div
          className={`navix-client-kpi-card__trend ${trendPositive ? 'navix-client-kpi-card__trend--up' : 'navix-client-kpi-card__trend--down'}`}
        >
          <TrendIcon trend={trend} />
          <span>{trendLabel}</span>
        </div>
      )}

      {/* Accent line */}
      <div className="navix-client-kpi-card__accent" style={{ background: color }} />
    </div>
  );
};

const ClientKpiCards = ({ metrics = [], loading = false }) => {
  if (loading) {
    return (
      <div className="navix-client-kpi-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="navix-client-kpi-card navix-client-kpi-card--skeleton">
            <div className="placeholder-glow">
              <div className="placeholder col-12 rounded mb-2" style={{ height: 20 }} />
              <div className="placeholder col-8 rounded mb-1" style={{ height: 32 }} />
              <div className="placeholder col-6 rounded" style={{ height: 14 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="navix-client-kpi-grid">
      {metrics.map((metric) => (
        <ClientKpiCard key={metric.key} metric={metric} />
      ))}
    </div>
  );
};

export default ClientKpiCards;
