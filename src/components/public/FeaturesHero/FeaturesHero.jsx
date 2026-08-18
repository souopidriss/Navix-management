import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './FeaturesHero.css';

const FeaturesHero = () => (
  <section className="nv-fhero" aria-labelledby="fhero-title">
    <div className="nv-fhero__bg" aria-hidden="true">
      <div className="nv-fhero__orb nv-fhero__orb--orange" />
      <div className="nv-fhero__orb nv-fhero__orb--blue" />
    </div>
    <div className="nv-container">
      <div className="nv-fhero__content">
        <span className="nv-badge">
          <i className="bi bi-grid-1x2" aria-hidden="true" />
          UNE PLATEFORME. UNE VISION GLOBALE.
        </span>
        <h1 id="fhero-title" className="nv-fhero__title">
          Tout ce qu&rsquo;il faut pour piloter votre flotte{' '}
          <span className="nv-fhero__title-accent">intelligemment</span>
        </h1>
        <p className="nv-fhero__subtitle">
          Navix Management centralise la gestion de vos v&eacute;hicules, chauffeurs,
          missions, maintenance et d&eacute;penses en une seule plateforme intelligente.
        </p>
        <div className="nv-fhero__ctas">
          <Link to={ROUTES.LOGIN} className="nv-btn-orange nv-btn-orange--lg">
            Demander une d&eacute;mo
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
          <a href="#vue-globale" className="nv-btn-outline-navy">
            Voir la plateforme
            <i className="bi bi-arrow-down" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default FeaturesHero;
