import SectionReveal from '../SectionReveal';
import './ModuleOverview.css';

const MODULES = [
  { icon: 'bi-truck', label: 'V\u00e9hicules', color: 'var(--nv-blue-light)' },
  { icon: 'bi-person-badge', label: 'Chauffeurs', color: 'var(--nv-navy)' },
  { icon: 'bi-shuffle', label: 'Affectations', color: 'var(--nv-orange)' },
  { icon: 'bi-signpost-split', label: 'Trajets', color: 'var(--nv-blue-light)' },
  { icon: 'bi-fuel-pump', label: 'Carburant', color: 'var(--nv-success, #3fcb8f)' },
  { icon: 'bi-wrench-adjustable', label: 'Maintenance', color: 'var(--nv-orange)' },
  { icon: 'bi-bar-chart', label: 'Analytics', color: 'var(--nv-navy)' },
];

const ModuleOverview = () => (
  <section id="vue-globale" className="nv-section nv-section--alt" aria-labelledby="overview-title">
    <div className="nv-container">
      <SectionReveal>
        <div className="nv-section-header">
          <span className="nv-badge">
            <i className="bi bi-diagram-3" aria-hidden="true" />
            Vue globale
          </span>
          <h2 id="overview-title" className="nv-section-title">
            Des modules connect&eacute;s, une vision unifi&eacute;e
          </h2>
          <p className="nv-section-subtitle">
            Chaque donn&eacute;e alimente automatiquement les autres modules.
            Vos v&eacute;hicules, chauffeurs, missions et co&ucirc;ts sont toujours synchronis&eacute;s.
          </p>
        </div>
      </SectionReveal>

      <div className="nv-modflow" role="list" aria-label="Flux des modules Navix">
        {MODULES.map((mod, i) => (
          <SectionReveal key={mod.label} delay={i * 80}>
            <div className="nv-modflow__step" role="listitem">
              <div className="nv-modflow__card">
                <div className="nv-modflow__icon" style={{ color: mod.color, backgroundColor: `color-mix(in srgb, ${mod.color} 10%, transparent)` }}>
                  <i className={`bi ${mod.icon}`} aria-hidden="true" />
                </div>
                <span className="nv-modflow__label">{mod.label}</span>
              </div>
              {i < MODULES.length - 1 && (
                <div className="nv-modflow__arrow" aria-hidden="true">
                  <i className="bi bi-arrow-right" />
                </div>
              )}
            </div>
          </SectionReveal>
        ))}
      </div>
    </div>
  </section>
);

export default ModuleOverview;
