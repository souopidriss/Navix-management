import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './FeaturesCta.css';

const FeaturesCta = () => (
  <section className="nv-fcta" aria-labelledby="fcta-title">
    <div className="nv-fcta__bg" aria-hidden="true">
      <div className="nv-fcta__orb nv-fcta__orb--1" />
      <div className="nv-fcta__orb nv-fcta__orb--2" />
    </div>
    <div className="nv-container">
      <div className="nv-fcta__content">
        <h2 id="fcta-title" className="nv-fcta__title">
          Pr&ecirc;t &agrave; reprendre le contr&ocirc;le de votre flotte&nbsp;?
        </h2>
        <p className="nv-fcta__subtitle">
          D&eacute;couvrez comment Navix Management peut simplifier votre gestion quotidienne.
        </p>
        <div className="nv-fcta__actions">
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

export default FeaturesCta;
