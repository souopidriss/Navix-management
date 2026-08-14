/**
 * Navix Driver Dashboard — DriverKpiCards
 * --------------------------------------------------------------------------
 */
import './DriverDashboard.css';

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

const DriverKpiCard = ({ metric }) => {
  const { label, value, trend, trendLabel, icon, variant } = metric;
  const color = VARIANT_COLOR[variant] || VARIANT_COLOR.primary;
  const iconBg = VARIANT_ICON_BG[variant] || VARIANT_ICON_BG.primary;
  
  // Custom logic: if it's consumption, going down is good (positive trend visually)
  const isConsumption = metric.key === 'avg_consumption';
  const trendIsPositive = isConsumption ? trend < 0 : trend > 0;

  return (
    <div className="navix-driver-kpi-card">
      <div className="navix-driver-kpi-card__header">
        <span className="navix-driver-kpi-card__icon" style={{ background: iconBg, color }}>
          <i className={`bi ${icon}`} aria-hidden="true" />
        </span>
        <span className="navix-driver-kpi-card__label">{label}</span>
      </div>

      <div className="navix-driver-kpi-card__value">{value}</div>

      {trendLabel && (
        <div
          className={`navix-driver-kpi-card__trend ${trendIsPositive ? 'navix-driver-kpi-card__trend--up' : 'navix-driver-kpi-card__trend--down'}`}
        >
          <TrendIcon trend={trend} />
          <span>{trendLabel}</span>
        </div>
      )}

      {/* Accent line */}
      <div className="navix-driver-kpi-card__accent" style={{ background: color }} />
    </div>
  );
};

const DriverKpiCards = ({ metrics = [], loading = false }) => {
  if (loading) {
    return (
      <div className="navix-driver-kpi-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="navix-driver-kpi-card">
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
    <div className="navix-driver-kpi-grid">
      {metrics.map((metric) => (
        <DriverKpiCard key={metric.key} metric={metric} />
      ))}
    </div>
  );
};

export default DriverKpiCards;
