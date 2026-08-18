import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './AboutHero.css';

const AboutHero = () => (
  <section className="nv-ahero" aria-labelledby="ahero-title">
    <div className="nv-ahero__bg" aria-hidden="true">
      <div className="nv-ahero__orb nv-ahero__orb--orange" />
      <div className="nv-ahero__orb nv-ahero__orb--blue" />
      <div className="nv-ahero__orb nv-ahero__orb--navy" />
    </div>
    <div className="nv-container">
      <div className="nv-ahero__content">
        <span className="nv-badge">
          <i className="bi bi-info-circle" aria-hidden="true" />
          &Agrave; PROPOS DE NAVIX MANAGEMENT
        </span>
        <h1 id="ahero-title" className="nv-ahero__title">
          Une nouvelle fa&ccedil;on de g&eacute;rer{' '}
          <span className="nv-ahero__title-accent">votre flotte</span>
        </h1>
        <p className="nv-ahero__subtitle">
          Navix Management est une plateforme SaaS pens&eacute;e pour centraliser
          et simplifier la gestion quotidienne des v&eacute;hicules et des
          op&eacute;rations associ&eacute;es.
        </p>
        <div className="nv-ahero__ctas">
          <Link to={ROUTES.PUBLIC_FEATURES} className="nv-btn-orange nv-btn-orange--lg">
            D&eacute;couvrir la plateforme
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
          <Link to={`${ROUTES.PUBLIC_CONTACT}?type=demo`} className="nv-btn-outline-navy">
            Demander une d&eacute;mo
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default AboutHero;
