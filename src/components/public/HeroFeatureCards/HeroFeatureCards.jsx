import './HeroFeatureCards.css';

const CARDS = [
  {
    icon: 'bi-truck',
    title: 'Gestion des véhicules',
    description: 'Suivez l\'état, la localisation et l\'utilisation de vos véhicules.',
    color: 'var(--nv-blue-light)',
  },
  {
    icon: 'bi-person-badge',
    title: 'Gestion des chauffeurs',
    description: 'Gérez vos chauffeurs, permis, documents et performances.',
    color: 'var(--nv-navy)',
  },
  {
    icon: 'bi-wrench',
    title: 'Maintenance',
    description: 'Planifiez les entretiens et recevez des alertes en temps réel.',
    color: 'var(--nv-orange)',
  },
  {
    icon: 'bi-fuel-pump',
    title: 'Carburant',
    description: 'Suivez vos consommations et optimisez vos coûts.',
    color: 'var(--nv-success, #3fcb8f)',
  },
];

const HeroFeatureCards = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="feature-cards-title">
    <div className="nv-container">
      <h2 id="feature-cards-title" className="sr-only">Aperçu des fonctionnalités</h2>
      <div className="nv-fcards__grid">
        {CARDS.map((card) => (
          <div key={card.title} className="nv-fcard">
            <div className="nv-fcard__icon" style={{ color: card.color, backgroundColor: `color-mix(in srgb, ${card.color} 10%, transparent)` }}>
              <i className={`bi ${card.icon}`} aria-hidden="true" />
            </div>
            <h3 className="nv-fcard__title">{card.title}</h3>
            <p className="nv-fcard__desc">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HeroFeatureCards;
