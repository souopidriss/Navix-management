import FeatureMockup from '../FeatureMockup';
import SectionReveal from '../SectionReveal';
import './DriverSection.css';

const DRIVERS = [
  { name: 'Jean Kamga', status: 'Disponible', statusColor: 'var(--nv-success, #3fcb8f)', license: 'B, C', missions: 24 },
  { name: 'Marie Njoya', status: 'En mission', statusColor: 'var(--nv-blue-light)', license: 'B', missions: 18 },
  { name: 'Paul Messi', status: 'En mission', statusColor: 'var(--nv-blue-light)', license: 'C, CE', missions: 31 },
  { name: 'Sophie Atangana', status: 'En attente', statusColor: 'var(--nv-orange)', license: 'B, D', missions: 12 },
];

const CAPACITIES = [
  { icon: 'bi-person', label: 'Profils complets', desc: 'Nom, permis, qualifications, disponibilit\u00e9' },
  { icon: 'bi-shuffle', label: 'Affectations', desc: 'Lien v\u00e9hicule \u2194 chauffeur en temps r\u00e9el' },
  { icon: 'bi-clipboard-check', label: 'Missions', desc: 'Suivi des affectations et historique' },
  { icon: 'bi-folder2-open', label: 'Documents', desc: 'Permis, identit\u00e9, contrats, visites m\u00e9dicales' },
];

const DriverSection = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="driver-title">
    <div className="nv-container">
      <div className="nv-split">
        <SectionReveal>
          <div className="nv-split__text">
            <span className="nv-badge">
              <i className="bi bi-person-badge" aria-hidden="true" />
              Chauffeurs
            </span>
            <h2 id="driver-title" className="nv-section-title">
              Les bons chauffeurs, au bon moment
            </h2>
            <p className="nv-section-subtitle">
              G&eacute;rez les profils, permis, disponibilit&eacute;s et performances
              de vos chauffeurs. Affectez-les aux missions en quelques clics.
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
          <FeatureMockup label="app.navix.management/drivers">
            <div className="nv-dcard__grid">
              {DRIVERS.map((d) => (
                <div key={d.name} className="nv-dcard">
                  <div className="nv-dcard__avatar">
                    <i className="bi bi-person-fill" aria-hidden="true" />
                  </div>
                  <div className="nv-dcard__info">
                    <span className="nv-dcard__name">{d.name}</span>
                    <span className="nv-dcard__meta">
                      Permis {d.license} &middot; {d.missions} missions
                    </span>
                  </div>
                  <span className="nv-dcard__status" style={{ color: d.statusColor }}>
                    <span className="nv-dcard__dot" style={{ backgroundColor: d.statusColor }} />
                    {d.status}
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

export default DriverSection;
