import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './ContactCTA.css';

const ContactCTA = () => (
  <section className="nv-contact-cta" aria-labelledby="contact-cta-title">
    <div className="nv-contact-cta__bg" aria-hidden="true">
      <div className="nv-contact-cta__orb nv-contact-cta__orb--1" />
      <div className="nv-contact-cta__orb nv-contact-cta__orb--2" />
    </div>
    <div className="nv-container">
      <div className="nv-contact-cta__content">
        <h2 id="contact-cta-title" className="nv-contact-cta__title">
          Voyez Navix en action
        </h2>
        <p className="nv-contact-cta__subtitle">
          D&eacute;couvrez comment la plateforme peut s&apos;adapter aux
          besoins sp&eacute;cifiques de votre flotte.
        </p>
        <div className="nv-contact-cta__actions">
          <Link
            to={`${ROUTES.PUBLIC_CONTACT}?type=demo`}
            className="nv-btn-orange nv-btn-orange--lg"
          >
            Demander une d&eacute;monstration
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
          <Link
            to={ROUTES.PUBLIC_PRICING}
            className="nv-btn-outline-navy nv-btn-outline-navy--dark"
          >
            Consulter les tarifs
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default ContactCTA;
