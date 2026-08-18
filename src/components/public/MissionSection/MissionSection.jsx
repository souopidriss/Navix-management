import FeatureMockup from '../FeatureMockup';
import SectionReveal from '../SectionReveal';
import './MissionSection.css';

const WORKFLOW = [
  { label: 'Demande', icon: 'bi-inbox', color: 'var(--nv-blue-light)' },
  { label: 'Affectation', icon: 'bi-shuffle', color: 'var(--nv-navy)' },
  { label: 'Mission', icon: 'bi-send', color: 'var(--nv-orange)' },
  { label: 'Trajet', icon: 'bi-signpost-split', color: 'var(--nv-blue-light)' },
  { label: 'Termin\u00e9e', icon: 'bi-check2-circle', color: 'var(--nv-success, #3fcb8f)' },
];

const CAPACITIES = [
  { icon: 'bi-truck', label: 'Affectation v\u00e9hicule', desc: 'Assignez le bon v\u00e9hicule &agrave; chaque mission' },
  { icon: 'bi-person-badge', label: 'Affectation chauffeur', desc: 'Choisissez le chauffeur disponible' },
  { icon: 'bi-calendar2-check', label: 'Statuts en temps r\u00e9el', desc: 'Pr\u00e9vue, Active, Termin\u00e9e, Annul\u00e9e, Suspendue' },
  { icon: 'bi-clock-history', label: 'Historique complet', desc: 'Retrouvez toutes les missions pass\u00e9es' },
];

const MissionSection = () => (
  <section className="nv-section" aria-labelledby="mission-title">
    <div className="nv-container">
      <div className="nv-split nv-split--reverse">
        <SectionReveal>
          <div className="nv-split__text">
            <span className="nv-badge">
              <i className="bi bi-clipboard-check" aria-hidden="true" />
              Missions &amp; Affectations
            </span>
            <h2 id="mission-title" className="nv-section-title">
              Planifiez et suivez chaque mission
            </h2>
            <p className="nv-section-subtitle">
              Du premier contact &agrave; la livraison termin\u00e9e, chaque mission est
              tra&ccedil;able. Affectez v\u00e9hicule et chauffeur, suivez l&rsquo;avancement en temps r&eacute;el.
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
          <FeatureMockup label="app.navix.management/missions">
            <div className="nv-workflow">
              {WORKFLOW.map((step, i) => (
                <div key={step.label} className="nv-workflow__step">
                  <div className="nv-workflow__circle" style={{ borderColor: step.color, color: step.color }}>
                    <i className={`bi ${step.icon}`} aria-hidden="true" />
                  </div>
                  <span className="nv-workflow__label">{step.label}</span>
                  {i < WORKFLOW.length - 1 && (
                    <div className="nv-workflow__line" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </FeatureMockup>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default MissionSection;
