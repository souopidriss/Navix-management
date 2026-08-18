import './ResourcesHero.css';

const ResourcesHero = () => (
  <section className="nv-resources-hero" aria-labelledby="resources-hero-title">
    <div className="nv-resources-hero__bg" aria-hidden="true">
      <div className="nv-resources-hero__orb nv-resources-hero__orb--1" />
      <div className="nv-resources-hero__orb nv-resources-hero__orb--2" />
    </div>
    <div className="nv-container">
      <div className="nv-resources-hero__content">
        <span className="nv-badge">
          <i className="bi bi-book" aria-hidden="true" />
          RESSOURCES
        </span>
        <h1 id="resources-hero-title" className="nv-resources-hero__title">
          Ressources Navix Management
        </h1>
        <p className="nv-resources-hero__subtitle">
          Guides, articles et documentation pour optimiser la gestion de votre
          flotte avec Navix.
        </p>
      </div>
    </div>
  </section>
);

export default ResourcesHero;
