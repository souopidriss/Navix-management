import SectionReveal from '../SectionReveal';
import './ValuesSection.css';

const VALUES = [
  {
    icon: 'bi-lightning-charge',
    title: 'Simplicit\u00e9',
    text: 'R\u00e9duire la complexit\u00e9 de la gestion quotidienne pour que chaque acteur se concentre sur l\u2019essentiel.',
    color: 'var(--nv-navy)',
  },
  {
    icon: 'bi-eye',
    title: 'Transparence',
    text: 'Donner une meilleure visibilit\u00e9 sur les op\u00e9rations, les co\u00fbts et les donn\u00e9es de la flotte.',
    color: 'var(--nv-blue-light)',
  },
  {
    icon: 'bi-graph-up',
    title: 'Performance',
    text: "Aider les organisations \u00e0 exploiter leurs donn\u00e9es pour prendre des d\u00e9cisions plus \u00e9clair\u00e9es.",
    color: 'var(--nv-orange)',
  },
  {
    icon: 'bi-shield-check',
    title: 'Fiabilit\u00e9',
    text: 'Centraliser les informations importantes dans un environnement structur\u00e9 et coh\u00e9rent.',
    color: 'var(--nv-success, #3fcb8f)',
  },
];

const ValuesSection = () => (
  <section className="nv-section" aria-labelledby="values-title">
    <div className="nv-container">
      <SectionReveal>
        <div className="nv-section-header">
          <span className="nv-badge">
            <i className="bi bi-heart" aria-hidden="true" />
            NOS VALEURS
          </span>
          <h2 id="values-title" className="nv-section-title">
            Ce qui guide notre approche
          </h2>
          <p className="nv-section-subtitle">
            Des principes simples qui inspirent la conception de Navix Management
            au quotidien.
          </p>
        </div>
      </SectionReveal>

      <div className="nv-values__grid">
        {VALUES.map((value, idx) => (
          <SectionReveal key={value.title} delay={idx * 80}>
            <div className="nv-values__card">
              <div
                className="nv-values__card-icon"
                style={{ background: `color-mix(in srgb, ${value.color} 12%, transparent)`, color: value.color }}
                aria-hidden="true"
              >
                <i className={`bi ${value.icon}`} />
              </div>
              <h3 className="nv-values__card-title">{value.title}</h3>
              <p className="nv-values__card-text">{value.text}</p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </div>
  </section>
);

export default ValuesSection;
