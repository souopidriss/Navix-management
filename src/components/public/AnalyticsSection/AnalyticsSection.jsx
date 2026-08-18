import SectionReveal from '../SectionReveal';
import './AnalyticsSection.css';

const KPIS = [
  { label: 'V\u00e9hicules actifs', value: '124', trend: '+8%', trendUp: true, color: 'var(--nv-blue-light)' },
  { label: 'Missions ce mois', value: '312', trend: '+12%', trendUp: true, color: 'var(--nv-orange)' },
  { label: 'Co\u00fbt carburant', value: '3.2M', trend: '\u22125%', trendUp: false, color: 'var(--nv-success, #3fcb8f)' },
  { label: 'Taux disponibilit\u00e9', value: '87%', trend: '+2%', trendUp: true, color: 'var(--nv-navy)' },
];

const DONUT_SEGMENTS = [
  { label: 'Disponible', pct: 45, color: 'var(--nv-success, #3fcb8f)' },
  { label: 'En mission', pct: 32, color: 'var(--nv-blue-light)' },
  { label: 'Maintenance', pct: 15, color: 'var(--nv-orange)' },
  { label: 'Hors service', pct: 8, color: 'var(--navix-danger, #f0484d)' },
];

const AnalyticsSection = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="analytics-title">
    <div className="nv-container">
      <SectionReveal>
        <div className="nv-section-header">
          <span className="nv-badge">
            <i className="bi bi-bar-chart" aria-hidden="true" />
            Analytics
          </span>
          <h2 id="analytics-title" className="nv-section-title">
            Transformez vos donn&eacute;es en d&eacute;cisions
          </h2>
          <p className="nv-section-subtitle">
            KPI en temps r&eacute;el, graphiques de tendance, tableaux de bord
            et rapports pour piloter chaque aspect de votre flotte.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal delay={80}>
        <div className="nv-analytics__mockup" role="img" aria-label="Aper\u00e7u du tableau de bord analytics : KPI temps r\u00e9el, graphique des missions et \u00e9tat de la flotte">
          <div className="nv-analytics__window">
            <div className="nv-analytics__toolbar">
              <span className="nv-analytics__dot nv-analytics__dot--red" />
              <span className="nv-analytics__dot nv-analytics__dot--yellow" />
              <span className="nv-analytics__dot nv-analytics__dot--green" />
              <span className="nv-analytics__url">app.navix.management/dashboard</span>
            </div>
            <div className="nv-analytics__body">
              <div className="nv-analytics__kpis">
                {KPIS.map((k) => (
                  <div key={k.label} className="nv-analytics__kpi">
                    <span className="nv-analytics__kpi-label">{k.label}</span>
                    <span className="nv-analytics__kpi-value">{k.value}</span>
                    <span className={`nv-analytics__kpi-trend ${k.trendUp ? 'nv-analytics__kpi-trend--up' : 'nv-analytics__kpi-trend--down'}`}>
                      <i className={`bi ${k.trendUp ? 'bi-arrow-up' : 'bi-arrow-down'}`} aria-hidden="true" />
                      {k.trend}
                    </span>
                  </div>
                ))}
              </div>
              <div className="nv-analytics__charts">
                <div className="nv-analytics__chart-card">
                  <span className="nv-analytics__chart-title">Missions par mois</span>
                  <div className="nv-analytics__bars">
                    {[40, 55, 48, 72, 65, 80, 75, 88, 92, 85, 95, 90].map((h, i) => (
                      <div key={i} className="nv-analytics__bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="nv-analytics__chart-card">
                  <span className="nv-analytics__chart-title">\u00c9tat de la flotte</span>
                  <div className="nv-analytics__donut">
                    <svg viewBox="0 0 100 100" className="nv-analytics__donut-svg" role="img" aria-label="R\u00e9partition de la flotte : Disponible 45%, En mission 32%, Maintenance 15%, Hors service 8%">
                      {DONUT_SEGMENTS.reduce((acc, seg) => {
                        const offset = acc.offset;
                        const dashArray = `${seg.pct} ${100 - seg.pct}`;
                        acc.elements.push(
                          <circle
                            key={seg.label}
                            cx="50" cy="50" r="40"
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="12"
                            strokeDasharray={dashArray}
                            strokeDashoffset={-offset}
                            strokeLinecap="round"
                          />,
                        );
                        acc.offset += seg.pct;
                        return acc;
                      }, { offset: 0, elements: [] }).elements}
                    </svg>
                    <div className="nv-analytics__donut-center">
                      <span className="nv-analytics__donut-value">87%</span>
                      <span className="nv-analytics__donut-label">Actifs</span>
                    </div>
                  </div>
                  <div className="nv-analytics__legend">
                    {DONUT_SEGMENTS.map((s) => (
                      <span key={s.label} className="nv-analytics__legend-item">
                        <span className="nv-analytics__legend-dot" style={{ backgroundColor: s.color }} />
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </div>
  </section>
);

export default AnalyticsSection;
