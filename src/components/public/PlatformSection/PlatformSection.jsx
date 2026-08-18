import SectionReveal from '../SectionReveal';
import './PlatformSection.css';

const DOMAINS = [
  { icon: 'bi-truck', label: 'V\u00e9hicules' },
  { icon: 'bi-person-badge', label: 'Chauffeurs' },
  { icon: 'bi-signpost-2', label: 'Missions' },
  { icon: 'bi-tools', label: 'Maintenance' },
  { icon: 'bi-fuel-pump', label: 'Carburant' },
  { icon: 'bi-folder2', label: 'Documents' },
  { icon: 'bi-bell', label: 'Alertes' },
  { icon: 'bi-bar-chart-line', label: 'Analytics' },
];

const PlatformSection = () => (
  <section className="nv-section" aria-labelledby="platform-title">
    <div className="nv-container">
      <div className="nv-platform">
        <SectionReveal>
          <div className="nv-platform__text">
            <span className="nv-badge">
              <i className="bi bi-grid" aria-hidden="true" />
              LA PLATEFORME
            </span>
            <h2 id="platform-title" className="nv-section-title">
              Une plateforme pens&eacute;e{' '}
              <span className="nv-platform__accent">autour de votre flotte</span>
            </h2>
            <p className="nv-section-subtitle">
              Navix Management couvre l&apos;ensemble des domaines essentiels
              de la gestion de flotte, depuis les v&eacute;hicules jusqu&apos;aux
              analytics, en passant par la maintenance et les documents.
            </p>
          </div>
        </SectionReveal>
        <SectionReveal delay={120}>
          <div className="nv-platform__grid" role="list">
            {DOMAINS.map((domain) => (
              <div key={domain.label} className="nv-platform__item" role="listitem">
                <div className="nv-platform__icon" aria-hidden="true">
                  <i className={`bi ${domain.icon}`} />
                </div>
                <span className="nv-platform__label">{domain.label}</span>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default PlatformSection;
