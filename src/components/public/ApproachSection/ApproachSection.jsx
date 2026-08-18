import SectionReveal from '../SectionReveal';
import './ApproachSection.css';

const PILLARS = [
  {
    icon: 'bi-grid-1x2',
    title: 'Centraliser',
    text: 'Toutes les informations essentielles de votre flotte r\u00e9unies dans une seule plateforme. Fini la chasse aux donn\u00e9es.',
    accent: 'var(--nv-navy)',
  },
  {
    icon: 'bi-diagram-3',
    title: 'Structurer',
    text: 'Des processus plus clairs pour les v\u00e9hicules, chauffeurs, missions, maintenance et op\u00e9rations.',
    accent: 'var(--nv-blue-light)',
  },
  {
    icon: 'bi-speedometer2',
    title: 'D\u00e9cider',
    text: 'Des tableaux de bord et indicateurs permettant de mieux comprendre l\u2019activit\u00e9 de votre flotte.',
    accent: 'var(--nv-orange)',
  },
];

const ApproachSection = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="approach-title">
    <div className="nv-container">
      <SectionReveal>
        <div className="nv-section-header">
          <span className="nv-badge">
            <i className="bi bi-lightning" aria-hidden="true" />
            NOTRE APPROCHE
          </span>
          <h2 id="approach-title" className="nv-section-title">
            Centraliser. Structurer. D&eacute;cider.
          </h2>
          <p className="nv-section-subtitle">
            Trois piliers fondamentaux guident la conception de Navix Management
            pour offrir une exp&eacute;rience claire et efficace.
          </p>
        </div>
      </SectionReveal>

      <div className="nv-approach__pillars">
        {PILLARS.map((pillar, idx) => (
          <SectionReveal key={pillar.title} delay={idx * 100}>
            <div className="nv-approach__card">
              <div
                className="nv-approach__card-icon"
                style={{ background: `color-mix(in srgb, ${pillar.accent} 12%, transparent)`, color: pillar.accent }}
                aria-hidden="true"
              >
                <i className={`bi ${pillar.icon}`} />
              </div>
              <h3 className="nv-approach__card-title">{pillar.title}</h3>
              <p className="nv-approach__card-text">{pillar.text}</p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </div>
  </section>
);

export default ApproachSection;
