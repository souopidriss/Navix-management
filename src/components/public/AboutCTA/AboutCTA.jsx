import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './AboutCTA.css';

const AboutCTA = () => (
  <section className="nv-acta" aria-labelledby="acta-title">
    <div className="nv-acta__bg" aria-hidden="true">
      <div className="nv-acta__orb nv-acta__orb--1" />
      <div className="nv-acta__orb nv-acta__orb--2" />
    </div>
    <div className="nv-container">
      <div className="nv-acta__content">
        <h2 id="acta-title" className="nv-acta__title">
          Construisons une gestion de flotte plus simple
        </h2>
        <p className="nv-acta__subtitle">
          D&eacute;couvrez Navix Management et voyez comment la plateforme peut
          s&apos;int&eacute;grer &agrave; vos op&eacute;rations.
        </p>
        <div className="nv-acta__actions">
          <Link to={`${ROUTES.PUBLIC_CONTACT}?type=demo`} className="nv-btn-orange nv-btn-orange--lg">
            Demander une d&eacute;mo
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
          <Link to={ROUTES.PUBLIC_FEATURES} className="nv-btn-outline-navy nv-btn-outline-navy--dark">
            D&eacute;couvrir les fonctionnalit&eacute;s
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default AboutCTA;
