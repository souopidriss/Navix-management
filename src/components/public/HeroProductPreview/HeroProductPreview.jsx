/* ==========================================================================
   Navix Public — HeroProductPreview
   --------------------------------------------------------------------------
   Mockup visuel premium du dashboard Navix Management.
   Affiche des KPI, un graphique, un donut et une alerte.
   Données 100% démo, purement visuelles.
   ========================================================================== */

import './HeroProductPreview.css';

const KPI_DATA = [
  { label: 'Véhicules', value: '124', icon: 'bi-truck', color: 'var(--nv-blue-light)' },
  { label: 'Chauffeurs', value: '89', icon: 'bi-person-badge', color: 'var(--nv-navy)' },
  { label: 'Entretiens', value: '12', icon: 'bi-wrench', color: 'var(--nv-orange)' },
  { label: 'Consommation', value: '3.2M', icon: 'bi-fuel-pump', color: 'var(--nv-success, #3fcb8f)' },
];

const HeroProductPreview = () => (
  <div className="nv-mockup" role="img" aria-label="Aperçu du tableau de bord Navix Management — données de démonstration">
    <div className="nv-mockup__window">
      <div className="nv-mockup__toolbar">
        <span className="nv-mockup__dot nv-mockup__dot--red" />
        <span className="nv-mockup__dot nv-mockup__dot--yellow" />
        <span className="nv-mockup__dot nv-mockup__dot--green" />
        <span className="nv-mockup__url">app.navix.management/dashboard</span>
      </div>

      <div className="nv-mockup__body">
        {/* KPI row */}
        <div className="nv-mockup__kpi-row">
          {KPI_DATA.map((kpi) => (
            <div key={kpi.label} className="nv-mockup__kpi">
              <div className="nv-mockup__kpi-icon" style={{ color: kpi.color }}>
                <i className={`bi ${kpi.icon}`} aria-hidden="true" />
              </div>
              <div className="nv-mockup__kpi-data">
                <span className="nv-mockup__kpi-value">{kpi.value}</span>
                <span className="nv-mockup__kpi-label">{kpi.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Donut row */}
        <div className="nv-mockup__charts-row">
          <div className="nv-mockup__chart-card">
            <div className="nv-mockup__chart-header">
              <span className="nv-mockup__chart-title">Consommation mensuelle</span>
              <span className="nv-mockup__chart-badge">FCFA</span>
            </div>
            <svg className="nv-mockup__sparkline" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--nv-orange)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--nv-orange)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,50 Q20,45 40,38 T80,28 T120,22 T160,15 T200,10"
                fill="none"
                stroke="var(--nv-orange)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0,50 Q20,45 40,38 T80,28 T120,22 T160,15 T200,10 L200,60 L0,60 Z"
                fill="url(#sparkGrad)"
              />
            </svg>
          </div>

          <div className="nv-mockup__donut-card">
            <div className="nv-mockup__chart-header">
              <span className="nv-mockup__chart-title">État flotte</span>
            </div>
            <div className="nv-mockup__donut" aria-hidden="true">
              <div className="nv-mockup__donut-ring" />
              <div className="nv-mockup__donut-center">
                <span className="nv-mockup__donut-value">87%</span>
                <span className="nv-mockup__donut-label">Actifs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert row */}
        <div className="nv-mockup__alert">
          <div className="nv-mockup__alert-icon">
            <i className="bi bi-bell" aria-hidden="true" />
          </div>
          <div className="nv-mockup__alert-content">
            <span className="nv-mockup__alert-title">Entretien à venir</span>
            <span className="nv-mockup__alert-desc">Véhicule NVX-042 — vidange prévue dans 3 jours</span>
          </div>
          <span className="nv-mockup__alert-badge">Prioritaire</span>
        </div>
      </div>
    </div>
  </div>
);

export default HeroProductPreview;
