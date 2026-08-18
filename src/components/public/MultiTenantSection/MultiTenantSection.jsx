import SectionReveal from '../SectionReveal';
import './MultiTenantSection.css';

const MultiTenantSection = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="mt-title">
    <div className="nv-container">
      <div className="nv-mt">
        <SectionReveal>
          <div className="nv-mt__visual" aria-hidden="true">
            <div className="nv-mt__diagram">
              <div className="nv-mt__org nv-mt__org--main">
                <i className="bi bi-building" />
                <span>Organisation A</span>
              </div>
              <div className="nv-mt__org nv-mt__org--main">
                <i className="bi bi-building" />
                <span>Organisation B</span>
              </div>
              <div className="nv-mt__org nv-mt__org--main">
                <i className="bi bi-building" />
                <span>Organisation C</span>
              </div>
            </div>
            <div className="nv-mt__separator" />
            <div className="nv-mt__envs">
              <div className="nv-mt__env">
                <span className="nv-mt__env-label">Environnement A</span>
                <div className="nv-mt__env-dots">
                  <span className="nv-mt__dot" />
                  <span className="nv-mt__dot" />
                  <span className="nv-mt__dot" />
                </div>
              </div>
              <div className="nv-mt__env">
                <span className="nv-mt__env-label">Environnement B</span>
                <div className="nv-mt__env-dots">
                  <span className="nv-mt__dot" />
                  <span className="nv-mt__dot" />
                  <span className="nv-mt__dot" />
                </div>
              </div>
              <div className="nv-mt__env">
                <span className="nv-mt__env-label">Environnement C</span>
                <div className="nv-mt__env-dots">
                  <span className="nv-mt__dot" />
                  <span className="nv-mt__dot" />
                  <span className="nv-mt__dot" />
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
        <SectionReveal delay={100}>
          <div className="nv-mt__text">
            <span className="nv-badge">
              <i className="bi bi-hdd-rack" aria-hidden="true" />
              MULTI-TENANT
            </span>
            <h2 id="mt-title" className="nv-section-title">
              Chaque organisation dispose de{' '}
              <span className="nv-mt__accent">son propre environnement</span>
            </h2>
            <p className="nv-section-subtitle">
              Les donn&eacute;es et acc&egrave;s sont organis&eacute;s selon
              l&apos;entreprise et les permissions associ&eacute;es, garantissant
              une s&eacute;paration claire entre les organisations.
            </p>
          </div>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default MultiTenantSection;
