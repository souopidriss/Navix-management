import FeatureMockup from '../FeatureMockup';
import SectionReveal from '../SectionReveal';
import './AlertSection.css';

const ALERTS = [
  { icon: 'bi-wrench-adjustable', title: 'Entretien \u00e0 pr\u00e9voir', desc: 'NVX-042 \u2014 vidange dans 3 jours', severity: 'warning', color: 'var(--nv-orange)' },
  { icon: 'bi-folder2-open', title: 'Document arrivant \u00e0 expiration', desc: 'Assurance NVX-089 \u2014 expire le 30 sept.', severity: 'danger', color: 'var(--navix-danger, #f0484d)' },
  { icon: 'bi-send', title: 'Nouvelle mission assign\u00e9e', desc: 'Douala \u2192 Yaound\u00e9 \u2014 Jean Kamga', severity: 'info', color: 'var(--nv-blue-light)' },
  { icon: 'bi-receipt', title: 'Facture en attente', desc: 'Station Total Douala \u2014 45 000 FCFA', severity: 'reminder', color: 'var(--nv-text-secondary)' },
];

const CAPACITIES = [
  { icon: 'bi-bell', label: 'Alertes en temps r\u00e9el', desc: 'Notifications push et in-app' },
  { icon: 'bi-exclamation-triangle', label: 'S\u00e9vérit\u00e9s configurables', desc: 'Low, Medium, High, Critical' },
  { icon: 'bi-folder2-open', label: 'Documents', desc: 'Expiration de permis, assurance, visite technique' },
  { icon: 'bi-inbox', label: '16 types de notifications', desc: 'Maintenance, v\u00e9hicule, mission, facturation...' },
];

const AlertSection = () => (
  <section className="nv-section" aria-labelledby="alert-title">
    <div className="nv-container">
      <div className="nv-split nv-split--reverse">
        <SectionReveal>
          <div className="nv-split__text">
            <span className="nv-badge">
              <i className="bi bi-bell" aria-hidden="true" />
              Alertes &amp; Notifications
            </span>
            <h2 id="alert-title" className="nv-section-title">
              Les informations importantes, au bon moment
            </h2>
            <p className="nv-section-subtitle">
              Recevez des alertes cibl\u00e9es sur la maintenance, les documents expirants,
              les missions et les \u00e9ch\u00e9ances. Jamais plus rien ne vous \u00e9chappe.
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
          <FeatureMockup label="app.navix.management/notifications">
            <div className="nv-alert-mock">
              {ALERTS.map((a) => (
                <div key={a.title} className="nv-alert-mock__card">
                  <div className="nv-alert-mock__icon" style={{ color: a.color, backgroundColor: `color-mix(in srgb, ${a.color} 10%, transparent)` }}>
                    <i className={`bi ${a.icon}`} aria-hidden="true" />
                  </div>
                  <div className="nv-alert-mock__content">
                    <span className="nv-alert-mock__title">{a.title}</span>
                    <span className="nv-alert-mock__desc">{a.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </FeatureMockup>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default AlertSection;
