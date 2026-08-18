import FeatureMockup from '../FeatureMockup';
import SectionReveal from '../SectionReveal';
import './VehicleSection.css';

const VEHICLE_ROWS = [
  { plate: 'LT 1234 AB', name: 'Toyota Hilux 2024', category: 'Pick-up', status: 'Disponible', statusColor: 'var(--nv-success, #3fcb8f)' },
  { plate: 'EN 5678 CD', name: 'Mercedes Sprinter', category: 'Fourgon', status: 'En mission', statusColor: 'var(--nv-blue-light)' },
  { plate: 'LT 9012 EF', name: 'Hyundai Tucson', category: 'SUV', status: 'En maintenance', statusColor: 'var(--nv-orange)' },
  { plate: 'EN 3456 GH', name: 'Nissan NP300', category: 'Pick-up', status: 'Disponible', statusColor: 'var(--nv-success, #3fcb8f)' },
];

const CAPACITIES = [
  { icon: 'bi-car-front', label: 'Identification compl&egrave;te', desc: 'Plaque, marque, mod&egrave;le, ann&eacute;e, kilom&eacute;trage' },
  { icon: 'bi-tag', label: 'Cat&eacute;gories &amp; groupes', desc: '7 groupes (A\u2192G), 23 cat&eacute;gories' },
  { icon: 'bi-activity', label: 'Statuts en temps r&eacute;el', desc: 'Disponible, En mission, Maintenance, Hors service' },
  { icon: 'bi-file-earmark', label: 'Documents &amp; contrats', desc: 'Assurance, visite technique, cartes grises' },
];

const VehicleSection = () => (
  <section className="nv-section" aria-labelledby="vehicle-title">
    <div className="nv-container">
      <div className="nv-split nv-split--reverse">
        <SectionReveal>
          <div className="nv-split__text">
            <span className="nv-badge">
              <i className="bi bi-truck" aria-hidden="true" />
              V&eacute;hicules
            </span>
            <h2 id="vehicle-title" className="nv-section-title">
              Une vision compl&egrave;te de votre parc automobile
            </h2>
            <p className="nv-section-subtitle">
              Suivez chaque v&eacute;hicule de votre flotte &mdash; statut, affectation,
              documents, kilom&eacute;trage et historique d&rsquo;entretien, tout en un seul endroit.
            </p>
            <div className="nv-feat-list">
              {CAPACITIES.map((c) => (
                <div key={c.label} className="nv-feat-list__item">
                  <div className="nv-feat-list__icon">
                    <i className={`bi ${c.icon}`} aria-hidden="true" />
                  </div>
                  <div>
                    <strong className="nv-feat-list__label">{c.label}</strong>
                    <span className="nv-feat-list__desc">{c.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={120}>
          <FeatureMockup label="app.navix.management/vehicles">
            <div className="nv-vtable">
              <div className="nv-vtable__header">
                <span className="nv-vtable__th">Immat.</span>
                <span className="nv-vtable__th">V&eacute;hicule</span>
                <span className="nv-vtable__th">Statut</span>
              </div>
              {VEHICLE_ROWS.map((v) => (
                <div key={v.plate} className="nv-vtable__row">
                  <span className="nv-vtable__plate">{v.plate}</span>
                  <span className="nv-vtable__name">
                    {v.name}
                    <small>{v.category}</small>
                  </span>
                  <span className="nv-vtable__status" style={{ color: v.statusColor }}>
                    <span className="nv-vtable__dot" style={{ backgroundColor: v.statusColor }} />
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </FeatureMockup>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default VehicleSection;
