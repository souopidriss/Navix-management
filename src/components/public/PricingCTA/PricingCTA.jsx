import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './PricingCTA.css';

const PricingCTA = () => (
  <section className="nv-pcta" aria-labelledby="pcta-title">
    <div className="nv-pcta__bg" aria-hidden="true">
      <div className="nv-pcta__orb nv-pcta__orb--1" />
      <div className="nv-pcta__orb nv-pcta__orb--2" />
    </div>
    <div className="nv-container">
      <div className="nv-pcta__content">
        <h2 id="pcta-title" className="nv-pcta__title">
          Pr&ecirc;t &agrave; lancer votre flotte&nbsp;?
        </h2>
        <p className="nv-pcta__subtitle">
          Rejoignez des dizaines d&apos;entreprises qui g&egrave;rent leur flotte avec
          Navix Management. Commencez votre essai gratuit de 14 jours d&egrave;s
          aujourd&apos;hui.
        </p>
        <div className="nv-pcta__actions">
          <Link to={ROUTES.LOGIN} className="nv-btn-orange nv-btn-orange--lg">
            Commencer l&apos;essai gratuit
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

export default PricingCTA;
