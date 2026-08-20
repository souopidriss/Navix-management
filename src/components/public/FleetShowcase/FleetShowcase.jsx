import SectionReveal from '../SectionReveal';
import './FleetShowcase.css';

const FLEET_GROUPS = [
  {
    group: 'A',
    title: 'Motos & v\u00e9hicules \u00e0 deux-roues',
    description: 'Mototaxis, scooters, motos sport et tout v\u00e9hicule motoris\u00e2\u0301 \u00e0 deux roues selon la r\u00e9glementation.',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=500&fit=crop&q=80',
    alt: 'Motos et v\u00e9hicules \u00e0 deux-roues motoris\u00e9s',
    color: '#3b82f6',
  },
  {
    group: 'B',
    title: 'Voitures & v\u00e9hicules l\u00e9gers',
    description: 'Berlines, citadines, SUV, breaks et tous v\u00e9hicules de transport l\u00e9ger pour vos op\u00e9rations quotidiennes.',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop&q=80',
    alt: 'Voitures et v\u00e9hicules l\u00e9gers',
    color: '#10b981',
  },
  {
    group: 'C',
    title: 'Camions & transport de marchandises',
    description: 'Camions, semi-remorques et v\u00e9hicules de transport de marchandises lourdes pour la logistique.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=500&fit=crop&q=80',
    alt: 'Camions et v\u00e9hicules de transport lourds',
    color: '#f59e0b',
  },
  {
    group: 'D',
    title: 'Autobus & transport de personnes',
    description: 'Autobus, autocars et v\u00e9hicules de transport en commun pour le d\u00e9placement de vos \u00e9quipes et clients.',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=500&fit=crop&q=80',
    alt: 'Autobus et autocars de transport de personnes',
    color: '#8b5cf6',
  },
  {
    group: 'E',
    title: 'V\u00e9hicules avec remorque',
    description: 'Ensembles tracteur-remorque et semi-remorques, selon la cat\u00e9gorie de permis associ\u00e9e.',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&h=500&fit=crop&q=80',
    alt: 'V\u00e9hicules avec remorque et semi-remorque',
    color: '#ef4444',
  },
];

const FleetShowcase = () => (
  <section className="nv-section nv-fleet" aria-labelledby="fleet-title">
    <div className="nv-container">
      <SectionReveal>
        <div className="nv-section-header">
          <span className="nv-badge">
            <i className="bi bi-truck" aria-hidden="true" />
            Flotte multi-segments
          </span>
          <h2 id="fleet-title" className="nv-section-title">
            Pr\u00e9sentation de la flotte logistique Navix Management
          </h2>
          <p className="nv-section-subtitle">
            Esquisse des diff\u00e9rents segments de v\u00e9hicules en fonction
            des cat\u00e9gories de permis de conduire utilis\u00e9s sur la voie terrestre.
          </p>
        </div>
      </SectionReveal>

      <div className="nv-fleet__grid">
        {FLEET_GROUPS.map((item, i) => (
          <SectionReveal key={item.group} delay={i * 80}>
            <article className="nv-fleet__card">
              <div className="nv-fleet__image-wrap">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="nv-fleet__image"
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <span
                  className="nv-fleet__group-badge"
                  style={{ '--group-color': item.color }}
                >
                  {item.group}
                </span>
              </div>
              <div className="nv-fleet__body">
                <h3 className="nv-fleet__title">{item.title}</h3>
                <p className="nv-fleet__desc">{item.description}</p>
              </div>
            </article>
          </SectionReveal>
        ))}
      </div>
    </div>
  </section>
);

export default FleetShowcase;
