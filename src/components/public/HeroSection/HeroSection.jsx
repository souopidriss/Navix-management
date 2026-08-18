import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import HeroProductPreview from '../HeroProductPreview';
import TrustIndicators from '../TrustIndicators';
import './HeroSection.css';

const HeroSection = () => (
  <section className="nv-hero" aria-labelledby="hero-title">
    <div className="nv-hero__bg" aria-hidden="true">
      <div className="nv-hero__orb nv-hero__orb--orange" />
      <div className="nv-hero__orb nv-hero__orb--blue" />
      <div className="nv-hero__orb nv-hero__orb--navy" />
    </div>

    <div className="nv-container">
      <div className="nv-hero__grid">
        <div className="nv-hero__content">
          <span className="nv-badge">
            <i className="bi bi-rocket-takeoff" aria-hidden="true" />
            Plateforme SaaS de gestion de flotte
          </span>

          <h1 id="hero-title" className="nv-hero__title">
            La solution compl&egrave;te pour une gestion de flotte{' '}
            <span className="nv-hero__title-accent">optimis&eacute;e</span>
          </h1>

          <p className="nv-hero__subtitle">
            Navix Management vous aide &agrave; contr&ocirc;ler vos v&eacute;hicules,
            vos chauffeurs, vos entretiens et vos co&ucirc;ts en temps r&eacute;el.
          </p>

          <div className="nv-hero__ctas">
            <Link to={ROUTES.LOGIN} className="nv-btn-orange nv-btn-orange--lg">
              Demander une d&eacute;mo
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
            <Link to={ROUTES.PUBLIC_FEATURES} className="nv-btn-outline-navy">
              D&eacute;couvrir les fonctionnalit&eacute;s
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>

          <TrustIndicators />
        </div>

        <div className="nv-hero__visual">
          <HeroProductPreview />
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
