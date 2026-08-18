/**
 * Navix Client Dashboard — ClientKpiCards
 * --------------------------------------------------------------------------
 * Rangée(s) de cartes KPI premium pour le Dashboard Client / Partenaire.
 * Prend en charge deux rangées (KPI principaux + KPI exploitation du mois)
 * via la prop `groups`. Réutilise les tokens CSS du design system Navix.
 *
 * PROMPT 062 : enrichissement additif — si un KPI porte `sparkline`
 * (nombre[]), une mini-courbe (Sparkline du module Reports) est rendue dans
 * la carte. La prop `columns` (4 par défaut, 5 pour le Dashboard Partenaire)
 * pilote le nombre de colonnes sur desktop.
 *
 * Sémantique de tendance : une hausse (trend > 0) est positive (verte),
 * une baisse (trend < 0) est négative (rouge).
 */
import Sparkline from '@/features/reports/components/charts/Sparkline';
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
  const { label, value, trend, trendLabel, icon, variant, sparkline } = metric;
  const color = VARIANT_COLOR[variant] || VARIANT_COLOR.primary;
  const iconBg = VARIANT_ICON_BG[variant] || VARIANT_ICON_BG.primary;
  const isPositive = Number(trend) > 0;

  return (
    <div className="navix-client-kpi-card" aria-label={`KPI : ${label}`}>
      <div className="navix-client-kpi-card__header">
        <span className="navix-client-kpi-card__icon" style={{ background: iconBg, color }}>
          <i className={`bi ${icon}`} aria-hidden="true" />
        </span>
        <span className="navix-client-kpi-card__label">{label}</span>
      </div>

      <div className="navix-client-kpi-card__value">{value}</div>

      {Array.isArray(sparkline) && sparkline.length > 0 && (
        <div className="navix-client-kpi-card__sparkline">
          <Sparkline values={sparkline} variant={variant} height={34} title={`Tendance — ${label}`} />
        </div>
      )}

      {trendLabel && (
        <div
          className={`navix-client-kpi-card__trend ${isPositive ? 'navix-client-kpi-card__trend--up' : 'navix-client-kpi-card__trend--down'}`}
        >
          <TrendIcon trend={Number(trend)} />
          <span>{trendLabel}</span>
        </div>
      )}

      {/* Accent line */}
      <div className="navix-client-kpi-card__accent" style={{ background: color }} />
    </div>
  );
};

const KpiGridSkeleton = ({ columns = 4 }) => (
  <div className={`navix-client-kpi-grid ${columns === 5 ? 'navix-client-kpi-grid--5' : ''}`}>
    {Array.from({ length: columns }).map((_, i) => (
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

/**
 * @param {Array<{ title?: string, metrics: Array }>} groups
 * @param {Array} metrics
 * @param {boolean} loading
 * @param {number} columns - nombre de colonnes sur desktop (4 | 5)
 */
const ClientKpiCards = ({ groups = [], metrics = [], loading = false, columns = 4 }) => {
  if (loading) {
    return (
      <>
        <KpiGridSkeleton columns={columns} />
        {groups.length > 1 && (
          <div className="mt-3">
            <KpiGridSkeleton columns={columns} />
          </div>
        )}
      </>
    );
  }

  // Compatibilité : usage simple `metrics` → un seul groupe sans titre.
  const normalizedGroups = groups.length > 0 ? groups : metrics.length > 0 ? [{ metrics }] : [];

  return normalizedGroups.map((group, index) => (
    <section key={group.title || `kpi-group-${index}`} className="mb-4 navix-client-animate">
      {group.title && (
        <div className="navix-client-section-title" aria-hidden="true">
          <span>{group.title}</span>
        </div>
      )}
      <div className={`navix-client-kpi-grid ${columns === 5 ? 'navix-client-kpi-grid--5' : ''}`}>
        {group.metrics.map((metric) => (
          <ClientKpiCard key={metric.key} metric={metric} />
        ))}
      </div>
    </section>
  ));
};

export default ClientKpiCards;
