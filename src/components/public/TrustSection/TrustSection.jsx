import SectionReveal from '../SectionReveal';
import './TrustSection.css';

const MECHANISMS = [
  {
    icon: 'bi-lock',
    title: 'Contr\u00f4le des acc\u00e8s',
    text: 'Chaque utilisateur acc\u00e8de uniquement aux fonctionnalit\u00e9s autoris\u00e9es par son r\u00f4le.',
  },
  {
    icon: 'bi-people',
    title: 'Gestion des r\u00f4les',
    text: 'Un syst\u00e8me de r\u00f4les et permissions d\u00e9fini pour chaque profil d\u2019utilisateur.',
  },
  {
    icon: 'bi-hdd-rack',
    title: 'Isolation des donn\u00e9es',
    text: 'Les donn\u00e9es de chaque entreprise sont organis\u00e9es et s\u00e9par\u00e9es.',
  },
  {
    icon: 'bi-journal-text',
    title: 'Journalisation',
    text: 'Les actions importantes sont tr\u00e9sor\u00e9es dans un journal pour tra\u00e7abilit\u00e9.',
  },
];

const TrustSection = () => (
  <section className="nv-section" aria-labelledby="trust-title">
    <div className="nv-container">
      <div className="nv-trust">
        <SectionReveal>
          <div className="nv-trust__text">
            <span className="nv-badge">
              <i className="bi bi-shield-check" aria-hidden="true" />
              CONFIANCE & S&Eacute;CURIT&Eacute;
            </span>
            <h2 id="trust-title" className="nv-section-title">
              Vos donn&eacute;es m&eacute;ritent une gestion rigoureuse
            </h2>
            <p className="nv-section-subtitle">
              Navix Management int\u00e8gre des m&eacute;canismes de protection
              con&ccedil;us pour garantir la s\u00e9curit&eacute; et la
              confidentialit&eacute; des informations de votre organisation.
            </p>
          </div>
        </SectionReveal>
        <SectionReveal delay={120}>
          <div className="nv-trust__grid" role="list">
            {MECHANISMS.map((mech) => (
              <div key={mech.title} className="nv-trust__item" role="listitem">
                <div className="nv-trust__icon" aria-hidden="true">
                  <i className={`bi ${mech.icon}`} />
                </div>
                <div>
                  <h3 className="nv-trust__item-title">{mech.title}</h3>
                  <p className="nv-trust__item-text">{mech.text}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default TrustSection;
