import './ContactHero.css';

const ContactHero = () => (
  <section className="nv-contact-hero" aria-labelledby="contact-hero-title">
    <div className="nv-contact-hero__bg" aria-hidden="true">
      <div className="nv-contact-hero__orb nv-contact-hero__orb--1" />
      <div className="nv-contact-hero__orb nv-contact-hero__orb--2" />
    </div>
    <div className="nv-container">
      <div className="nv-contact-hero__content">
        <span className="nv-badge">
          <i className="bi bi-envelope" aria-hidden="true" />
          PARLONS DE VOTRE FLOTTE
        </span>
        <h1 id="contact-hero-title" className="nv-contact-hero__title">
          Une question&nbsp;? Parlons-en.
        </h1>
        <p className="nv-contact-hero__subtitle">
          Navix Management est &agrave; votre disposition pour r&eacute;pondre &agrave;
          vos questions, vous pr&eacute;senter la plateforme et discuter de vos
          besoins en gestion de flotte.
        </p>
      </div>
    </div>
  </section>
);

export default ContactHero;
