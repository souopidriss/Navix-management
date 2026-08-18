import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './CTASection.css';

const CTASection = () => (
  <section className="nv-cta-section" aria-labelledby="cta-title">
    <div className="nv-cta-section__bg" aria-hidden="true">
      <div className="nv-cta-section__orb nv-cta-section__orb--1" />
      <div className="nv-cta-section__orb nv-cta-section__orb--2" />
    </div>
    <div className="nv-container">
      <div className="nv-cta-section__content">
        <h2 id="cta-title" className="nv-cta-section__title">
          Pr&ecirc;t &agrave; optimiser votre flotte&nbsp;?
        </h2>
        <p className="nv-cta-section__subtitle">
          Rejoignez les entreprises qui g&egrave;rent leur flotte avec Navix Management.
          Demandez une d&eacute;monstration personnalis&eacute;e d&egrave;s aujourd&apos;hui.
        </p>
        <div className="nv-cta-section__actions">
          <Link to={`${ROUTES.PUBLIC_CONTACT}?type=demo`} className="nv-btn-orange nv-btn-orange--lg">
            Demander une d&eacute;mo
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
          <Link to={ROUTES.PUBLIC_CONTACT} className="nv-btn-outline-navy nv-btn-outline-navy--dark">
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
