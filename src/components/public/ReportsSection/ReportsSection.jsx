import FeatureMockup from '../FeatureMockup';
import SectionReveal from '../SectionReveal';
import './ReportsSection.css';

const REPORTS = [
  { icon: 'bi-truck', label: 'Flotte', desc: 'Vue d\u2019ensemble de la flotte', color: 'var(--nv-blue-light)' },
  { icon: 'bi-car-front', label: 'V\u00e9hicules', desc: 'D\u00e9tail par v\u00e9hicule', color: 'var(--nv-blue-light)' },
  { icon: 'bi-person-badge', label: 'Chauffeurs', desc: 'Performance et activit\u00e9', color: 'var(--nv-navy)' },
  { icon: 'bi-shuffle', label: 'Affectations', desc: 'Historique des affectations', color: 'var(--nv-orange)' },
  { icon: 'bi-signpost-split', label: 'Trajets', desc: 'Volumes et distances', color: 'var(--nv-blue-light)' },
  { icon: 'bi-fuel-pump', label: 'Carburant', desc: 'Consommation et co\u00fbts', color: 'var(--nv-success, #3fcb8f)' },
  { icon: 'bi-wrench-adjustable', label: 'Maintenance', desc: 'Co\u00fbts et fiabilit\u00e9', color: 'var(--nv-orange)' },
  { icon: 'bi-wallet2', label: 'Financier', desc: 'Co\u00fbts, factures, tendances', color: 'var(--nv-success, #3fcb8f)' },
];

const CAPACITIES = [
  { icon: 'bi-file-earmark-bar-graph', label: '14 types de rapports', desc: 'Flotte, v\u00e9hicules, chauffeurs, carburant, maintenance...' },
  { icon: 'bi-download', label: 'Export multi-format', desc: 'CSV, JSON, Excel (XLSX), PDF' },
  { icon: 'bi-calendar-range', label: 'P\u00e9riodes configurables', desc: '15 pr\u00e9r\u00e9glages : semaine, mois, trimestre, ann\u00e9e...' },
  { icon: 'bi-pencil-square', label: 'Rapport personnalis\u00e9', desc: 'Cr\u00e9ez vos propres rapports avec des crit\u00e8res flexibles' },
];

const ReportsSection = () => (
  <section className="nv-section" aria-labelledby="reports-title">
    <div className="nv-container">
      <div className="nv-split nv-split--reverse">
        <SectionReveal>
          <div className="nv-split__text">
            <span className="nv-badge">
              <i className="bi bi-file-earmark-bar-graph" aria-hidden="true" />
              Rapports &amp; Exports
            </span>
            <h2 id="reports-title" className="nv-section-title">
              Des rapports qui racontent une histoire
            </h2>
            <p className="nv-section-subtitle">
              14 types de rapports pr\u00e9d\u00e9finis, export en plusieurs formats,
              p\u00e9riodes flexibles et rapports personnalis\u00e9s pour prendre les bonnes d\u00e9cisions.
            </p>
            <div className="nv-feat-list">
              {CAPACITIES.map((c) => (
                <div key={c.label} className="nv-feat-list__item">
                  <div className="nv-feat-list__icon">
                    <i className={`bi ${c.icon}`} aria-hidden="true" />
                  </div>
                  <div>
                    <strong className="nv-feat-list__label">{c.label}</strong>
                    <span className="nv-feat-list__desc">{c.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={120}>
          <FeatureMockup label="app.navix.management/reports">
            <div className="nv-reports-mock">
              {REPORTS.map((r) => (
                <div key={r.label} className="nv-reports-mock__row">
                  <div className="nv-reports-mock__icon" style={{ color: r.color }}>
                    <i className={`bi ${r.icon}`} aria-hidden="true" />
                  </div>
                  <div className="nv-reports-mock__info">
                    <span className="nv-reports-mock__label">{r.label}</span>
                    <span className="nv-reports-mock__desc">{r.desc}</span>
                  </div>
                  <span className="nv-reports-mock__export">
                    <i className="bi bi-download" aria-hidden="true" />
                  </span>
                </div>
              ))}
            </div>
          </FeatureMockup>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default ReportsSection;
