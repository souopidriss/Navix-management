import FeatureMockup from '../FeatureMockup';
import SectionReveal from '../SectionReveal';
import './FuelSection.css';

const TRANSACTIONS = [
  { date: '10 ao\u00fbt', vehicle: 'LT 1234 AB', liters: '45L', cost: '27 000 FCFA', type: 'Diesel' },
  { date: '08 ao\u00fbt', vehicle: 'EN 5678 CD', liters: '60L', cost: '36 000 FCFA', type: 'Diesel' },
  { date: '05 ao\u00fbt', vehicle: 'LT 9012 EF', liters: '35L', cost: '24 500 FCFA', type: 'Essence' },
];

const BARS = [
  { id: 'jan', month: 'J', pct: 45 },
  { id: 'fev', month: 'F', pct: 62 },
  { id: 'mar', month: 'M', pct: 58 },
  { id: 'avr', month: 'A', pct: 75 },
  { id: 'mai', month: 'M', pct: 68 },
  { id: 'jui', month: 'J', pct: 82 },
  { id: 'jul', month: 'J', pct: 71 },
];

const CAPACITIES = [
  { icon: 'bi-fuel-pump', label: 'Ravitaillements', desc: 'Enregistrez chaque plein en quelques secondes' },
  { icon: 'bi-currency-exchange', label: 'Co\u00fbts', desc: 'Suivi des d\u00e9penses par v\u00e9hicule et p\u00e9riode' },
  { icon: 'bi-graph-up', label: 'Consommation', desc: 'Graphiques et tendances de consommation' },
  { icon: 'bi-shop', label: 'Stations partenaires', desc: 'R\u00e9seau de stations Partenaire \u2013 Station' },
];

const FuelSection = () => (
  <section className="nv-section" aria-labelledby="fuel-title">
    <div className="nv-container">
      <div className="nv-split nv-split--reverse">
        <SectionReveal>
          <div className="nv-split__text">
            <span className="nv-badge">
              <i className="bi bi-fuel-pump" aria-hidden="true" />
              Carburant
            </span>
            <h2 id="fuel-title" className="nv-section-title">
              Gardez le contr&ocirc;le sur votre consommation
            </h2>
            <p className="nv-section-subtitle">
              Enregistrez les ravitaillements, suivez les co&ucirc;ts,
              analysez la consommation de chaque v&eacute;hicule et identifiez les anomalies.
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
          <FeatureMockup label="app.navix.management/fuel">
            <div className="nv-fuel-mock">
              <div className="nv-fuel-mock__chart">
                <div className="nv-fuel-mock__bars">
                  {BARS.map((b) => (
                    <div key={b.id} className="nv-fuel-mock__bar-col">
                      <div className="nv-fuel-mock__bar" style={{ height: `${b.pct}%` }} />
                      <span className="nv-fuel-mock__month">{b.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="nv-fuel-mock__list">
                {TRANSACTIONS.map((t) => (
                  <div key={t.date + t.vehicle} className="nv-fuel-mock__row">
                    <span className="nv-fuel-mock__date">{t.date}</span>
                    <span className="nv-fuel-mock__vehicle">{t.vehicle}</span>
                    <span className="nv-fuel-mock__liters">{t.liters}</span>
                    <span className="nv-fuel-mock__cost">{t.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </FeatureMockup>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default FuelSection;
