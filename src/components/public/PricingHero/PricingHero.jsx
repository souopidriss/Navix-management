import './PricingHero.css';

const PricingHero = () => (
  <section className="nv-phero" aria-labelledby="phero-title">
    <div className="nv-phero__bg" aria-hidden="true">
      <div className="nv-phero__orb nv-phero__orb--orange" />
      <div className="nv-phero__orb nv-phero__orb--blue" />
    </div>
    <div className="nv-container">
      <div className="nv-phero__content">
        <span className="nv-badge">
          <i className="bi bi-tag" aria-hidden="true" />
          TARIFS TRANSPARENTS
        </span>
        <h1 id="phero-title" className="nv-phero__title">
          Des tarifs adapt&eacute;s &agrave;{' '}
          <span className="nv-phero__title-accent">chaque flotte</span>
        </h1>
        <p className="nv-phero__subtitle">
          Choisissez la formule qui correspond &agrave; la taille de votre op&eacute;ration.
          Essai gratuit de 14 jours, sans engagement.
        </p>
      </div>
    </div>
  </section>
);

export default PricingHero;
