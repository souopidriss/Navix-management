import SectionReveal from '../SectionReveal';
import './VehicleCategoriesGrid.css';

const CATEGORIES = [
  { group: 'A', label: 'Motos', icon: 'bi-bicycle', count: '3 types', examples: 'Mototaxi, Scooter, Moto Sport' },
  { group: 'B', label: 'V\u00e9hicules l\u00e9gers', icon: 'bi-car-front', count: '4 types', examples: 'Berline, Citadine, SUV, Break' },
  { group: 'C', label: 'Utilitaires', icon: 'bi-truck', count: '3 types', examples: 'Fourgon, Pick-up, Camionnette' },
  { group: 'D', label: 'Camions', icon: 'bi-truck-front', count: '3 types', examples: 'Camion, Semi-remorque, Porte-conteneur' },
  { group: 'E', label: 'Engins', icon: 'bi-gear', count: '4 types', examples: 'Tracteur, Bulldozer, Pelle m\u00e9canique' },
  { group: 'F', label: 'Bus', icon: 'bi-bus-front', count: '3 types', examples: 'Minibus, Bus, Autocar' },
  { group: 'G', label: 'Sp\u00e9ciaux', icon: 'bi-shield-check', count: '4 types', examples: 'Ambulance, Police, Pompiers, Grue' },
];

const VehicleCategoriesGrid = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="vcategories-title">
    <div className="nv-container">
      <SectionReveal>
        <div className="nv-section-header">
          <span className="nv-badge">
            <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
            Cat&eacute;gories
          </span>
          <h2 id="vcategories-title" className="nv-section-title">
            7 groupes, 23 cat&eacute;gories de v&eacute;hicules
          </h2>
          <p className="nv-section-subtitle">
            De la moto au camion, en passant par les engins sp&eacute;ciaux &mdash;
            Navix g&egrave;re tous les types de v&eacute;hicules.
          </p>
        </div>
      </SectionReveal>

      <div className="nv-vcat__grid">
        {CATEGORIES.map((cat, i) => (
          <SectionReveal key={cat.group} delay={i * 60}>
            <div className="nv-vcat__card">
              <span className="nv-vcat__group">{cat.group}</span>
              <div className="nv-vcat__icon">
                <i className={`bi ${cat.icon}`} aria-hidden="true" />
              </div>
              <h3 className="nv-vcat__label">{cat.label}</h3>
              <span className="nv-vcat__count">{cat.count}</span>
              <p className="nv-vcat__examples">{cat.examples}</p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </div>
  </section>
);

export default VehicleCategoriesGrid;
