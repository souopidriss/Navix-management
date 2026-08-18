import SectionReveal from '../SectionReveal';
import './RolesEcosystem.css';

const ROLES = [
  {
    icon: 'bi-shield-lock',
    title: 'Super Admin',
    desc: 'Administration globale de la plateforme.',
    color: 'var(--nv-navy)',
  },
  {
    icon: 'bi-building',
    title: 'Client',
    desc: 'Gestion de sa flotte et de ses op\u00e9rations.',
    color: 'var(--nv-blue-light)',
  },
  {
    icon: 'bi-person-standing',
    title: 'Chauffeur',
    desc: 'Acc\u00e8s \u00e0 ses missions et informations autoris\u00e9es.',
    color: 'var(--nv-orange)',
  },
  {
    icon: 'bi-fuel-pump',
    title: 'Partenaire \u2013 Station',
    desc: 'Gestion des activit\u00e9s li\u00e9es aux stations et op\u00e9rations carburant.',
    color: 'var(--nv-success, #3fcb8f)',
  },
];

const RolesEcosystem = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="roles-title">
    <div className="nv-container">
      <SectionReveal>
        <div className="nv-section-header">
          <span className="nv-badge">
            <i className="bi bi-people" aria-hidden="true" />
            &Eacute;COSYST&Egrave;ME DES R&Ocirc;LES
          </span>
          <h2 id="roles-title" className="nv-section-title">
            Un acc&egrave;s adapt&eacute; &agrave; chaque profil
          </h2>
          <p className="nv-section-subtitle">
            Navix Management s&apos;adapte aux diff&eacute;rents acteurs
            de la gestion de flotte avec des espaces d&eacute;di&eacute;s.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal delay={80}>
        <div className="nv-roles__diagram" aria-label="Sch\u00e9ma de l'\u00e9cosyst\u00e8me des r\u00f4les">
          <div className="nv-roles__center">
            <span className="nv-roles__center-icon" aria-hidden="true">
              <i className="bi bi-geo-alt-fill" />
            </span>
            <span className="nv-roles__center-name">NAVIX</span>
          </div>
          <div className="nv-roles__branch nv-roles__branch--left">
            <div className="nv-roles__node" style={{ borderColor: ROLES[0].color }}>
              <i className={`bi ${ROLES[0].icon}`} aria-hidden="true" />
              <span>{ROLES[0].title}</span>
            </div>
          </div>
          <div className="nv-roles__branch nv-roles__branch--center">
            <div className="nv-roles__node" style={{ borderColor: ROLES[1].color }}>
              <i className={`bi ${ROLES[1].icon}`} aria-hidden="true" />
              <span>{ROLES[1].title}</span>
            </div>
            <div className="nv-roles__sub-branch">
              <div className="nv-roles__node nv-roles__node--sub" style={{ borderColor: ROLES[3].color }}>
                <i className={`bi ${ROLES[3].icon}`} aria-hidden="true" />
                <span>{ROLES[3].title}</span>
              </div>
            </div>
          </div>
          <div className="nv-roles__branch nv-roles__branch--right">
            <div className="nv-roles__node" style={{ borderColor: ROLES[2].color }}>
              <i className={`bi ${ROLES[2].icon}`} aria-hidden="true" />
              <span>{ROLES[2].title}</span>
            </div>
          </div>
        </div>
      </SectionReveal>

      <div className="nv-roles__cards">
        {ROLES.map((role, idx) => (
          <SectionReveal key={role.title} delay={idx * 80}>
            <div className="nv-roles__card">
              <div
                className="nv-roles__card-icon"
                style={{ background: `color-mix(in srgb, ${role.color} 12%, transparent)`, color: role.color }}
                aria-hidden="true"
              >
                <i className={`bi ${role.icon}`} />
              </div>
              <h3 className="nv-roles__card-title">{role.title}</h3>
              <p className="nv-roles__card-desc">{role.desc}</p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </div>
  </section>
);

export default RolesEcosystem;
