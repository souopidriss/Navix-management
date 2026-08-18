import FeatureMockup from '../FeatureMockup';
import SectionReveal from '../SectionReveal';
import './TripSection.css';

const TRIPS = [
  { from: 'Douala', to: 'Yaound\u00e9', distance: '245 km', duration: '3h 12', status: 'Termin\u00e9', statusColor: 'var(--nv-success, #3fcb8f)' },
  { from: 'Bafoussam', to: 'Bamenda', distance: '180 km', duration: '2h 45', status: 'En cours', statusColor: 'var(--nv-blue-light)' },
  { from: 'Yaound\u00e9', to: 'Kribi', distance: '155 km', duration: '2h 10', status: 'Pr\u00e9vu', statusColor: 'var(--nv-text-secondary)' },
];

const CAPACITIES = [
  { icon: 'bi-signpost-split', label: 'Historique des trajets', desc: 'Tous les d\u00e9placements enregistr\u00e9s' },
  { icon: 'bi-geo-alt', label: 'Origine &amp; destination', desc: 'Villes de d\u00e9part et d\u2019arriv\u00e9e' },
  { icon: 'bi-speedometer', label: 'Distance &amp; dur\u00e9e', desc: 'Kilom\u00e9trage et temps de trajet' },
  { icon: 'bi-clock-history', label: 'P\u00e9riodes', desc: 'Filtrage par semaine, mois, trimestre' },
];

const TripSection = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="trip-title">
    <div className="nv-container">
      <div className="nv-split">
        <SectionReveal>
          <div className="nv-split__text">
            <span className="nv-badge">
              <i className="bi bi-signpost-split" aria-hidden="true" />
              Trajets
            </span>
            <h2 id="trip-title" className="nv-section-title">
              Comprenez chaque d\u00e9placement
            </h2>
            <p className="nv-section-subtitle">
              Historique d\u00e9taill\u00e9 de tous les trajets &mdash; origine, destination,
              distance, dur\u00e9e et statut. Analysez les itin\u00e9raires de votre flotte.
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
          <FeatureMockup label="app.navix.management/trips">
            <div className="nv-trip-mock">
              {TRIPS.map((t) => (
                <div key={t.from + t.to} className="nv-trip-mock__card">
                  <div className="nv-trip-mock__route">
                    <span className="nv-trip-mock__city">{t.from}</span>
                    <i className="bi bi-arrow-right nv-trip-mock__arrow" aria-hidden="true" />
                    <span className="nv-trip-mock__city">{t.to}</span>
                  </div>
                  <div className="nv-trip-mock__meta">
                    <span><i className="bi bi-speedometer" aria-hidden="true" /> {t.distance}</span>
                    <span><i className="bi bi-clock" aria-hidden="true" /> {t.duration}</span>
                  </div>
                  <span className="nv-trip-mock__status" style={{ color: t.statusColor }}>
                    <span className="nv-trip-mock__dot" style={{ backgroundColor: t.statusColor }} />
                    {t.status}
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

export default TripSection;
