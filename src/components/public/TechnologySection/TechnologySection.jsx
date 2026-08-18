import SectionReveal from '../SectionReveal';
import './TechnologySection.css';

const FEATURES = [
  { icon: 'bi-cloud', label: 'Architecture SaaS' },
  { icon: 'bi-building', label: 'Multi-tenant' },
  { icon: 'bi-shield-lock', label: 'R\u00f4les & permissions' },
  { icon: 'bi-speedometer2', label: 'Tableaux de bord' },
  { icon: 'bi-search', label: 'Recherche & filtres' },
  { icon: 'bi-bell', label: 'Notifications' },
  { icon: 'bi-file-earmark-bar-graph', label: 'Rapports' },
  { icon: 'bi-folder2', label: 'Documents' },
];

const TechnologySection = () => (
  <section className="nv-section nv-section--dark" aria-labelledby="tech-title">
    <div className="nv-container">
      <div className="nv-tech">
        <SectionReveal>
          <div className="nv-tech__text">
            <span className="nv-tech__badge">
              <i className="bi bi-cpu" aria-hidden="true" />
              TECHNOLOGIE
            </span>
            <h2 id="tech-title" className="nv-section-title nv-tech__title">
              Une plateforme con&ccedil;ue pour &eacute;voluer{' '}
              <span className="nv-tech__title-accent">avec votre flotte</span>
            </h2>
            <p className="nv-section-subtitle nv-tech__subtitle">
              Navix Management int\u00e8gre les fonctionnalit&eacute;s
              essentielles pour g&eacute;rer une flotte moderne, tout en restant
              simple et accessible.
            </p>
          </div>
        </SectionReveal>
        <SectionReveal delay={120}>
          <div className="nv-tech__grid" role="list">
            {FEATURES.map((feat) => (
              <div key={feat.label} className="nv-tech__item" role="listitem">
                <div className="nv-tech__icon" aria-hidden="true">
                  <i className={`bi ${feat.icon}`} />
                </div>
                <span className="nv-tech__label">{feat.label}</span>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default TechnologySection;
