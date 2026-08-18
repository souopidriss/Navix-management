import FeatureMockup from '../FeatureMockup';
import SectionReveal from '../SectionReveal';
import './MaintenanceSection.css';

const TIMELINE = [
  { date: '12 ao\u00fbt', type: 'Vidange', status: 'Pr\u00e9vu', statusColor: 'var(--nv-text-secondary)', icon: 'bi-droplet-half' },
  { date: '18 ao\u00fbt', type: 'Contr\u00f4le technique', status: 'En attente', statusColor: 'var(--nv-orange)', icon: 'bi-patch-check' },
  { date: '25 ao\u00fbt', type: 'Freinage', status: 'En cours', statusColor: 'var(--nv-blue-light)', icon: 'bi-speedometer2' },
  { date: '03 sept', type: 'Pneumatiques', status: 'Termin\u00e9', statusColor: 'var(--nv-success, #3fcb8f)', icon: 'bi-record-circle' },
];

const CAPACITIES = [
  { icon: 'bi-calendar2-event', label: 'Planification', desc: '14 types d\u2019entretiens, calendrier interactif' },
  { icon: 'bi-exclamation-triangle', label: 'Alertes intelligentes', desc: 'Date proche, kilom\u00e9trage, urgence' },
  { icon: 'bi-currency-exchange', label: 'Co\u00fbts', desc: 'Suivi des d\u00e9penses par v\u00e9hicule' },
  { icon: 'bi-history', label: 'Historique', desc: 'Tous les entretiens pass\u00e9s, tr\u00e7ables' },
];

const MaintenanceSection = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="maint-title">
    <div className="nv-container">
      <div className="nv-split">
        <SectionReveal>
          <div className="nv-split__text">
            <span className="nv-badge">
              <i className="bi bi-wrench-adjustable" aria-hidden="true" />
              Maintenance
            </span>
            <h2 id="maint-title" className="nv-section-title">
              Anticipez les entretiens avant les immobilisations
            </h2>
            <p className="nv-section-subtitle">
              Planifiez, suivez et documentez chaque intervention.
              Recevez des alertes avant qu&rsquo;un v\u00e9hicule n&rsquo;ait besoin d&rsquo;entretien.
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
          <FeatureMockup label="app.navix.management/maintenance">
            <div className="nv-mtl">
              {TIMELINE.map((item) => (
                <div key={item.date + item.type} className="nv-mtl__item">
                  <div className="nv-mtl__icon">
                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                  </div>
                  <div className="nv-mtl__content">
                    <span className="nv-mtl__type">{item.type}</span>
                    <span className="nv-mtl__date">{item.date}</span>
                  </div>
                  <span className="nv-mtl__status" style={{ color: item.statusColor }}>
                    {item.status}
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

export default MaintenanceSection;
