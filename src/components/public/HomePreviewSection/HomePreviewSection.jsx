import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import SectionReveal from '../SectionReveal';
import './HomePreviewSection.css';

const FEATURES = [
  { icon: 'bi-truck', label: 'V\u00e9hicules', desc: 'Parc automobile complet' },
  { icon: 'bi-person-badge', label: 'Chauffeurs', desc: 'Gestion des profils' },
  { icon: 'bi-clipboard-check', label: 'Missions', desc: 'Affectations & trajets' },
  { icon: 'bi-wrench-adjustable', label: 'Maintenance', desc: 'Entretiens & alertes' },
  { icon: 'bi-fuel-pump', label: 'Carburant', desc: 'Suivi des co\u00fbts' },
  { icon: 'bi-bar-chart', label: 'Analytics', desc: 'Rapports & KPI' },
];

const HomePreviewSection = () => (
  <section className="nv-section nv-section--dark" aria-labelledby="preview-title">
    <div className="nv-container">
      <SectionReveal>
        <div className="nv-section-header">
          <span className="nv-badge nv-badge--on-dark">
            <i className="bi bi-grid-1x2" aria-hidden="true" />
            Fonctionnalit&eacute;s
          </span>
          <h2 id="preview-title" className="nv-section-title">
            Tout ce dont vous avez besoin
          </h2>
          <p className="nv-section-subtitle">
            Une suite compl&egrave;te d&rsquo;outils pour g&eacute;rer chaque aspect de votre flotte.
          </p>
        </div>
      </SectionReveal>

      <div className="nv-preview__grid">
        {FEATURES.map((f, i) => (
          <SectionReveal key={f.label} delay={i * 60}>
            <div className="nv-preview__card">
              <div className="nv-preview__icon">
                <i className={`bi ${f.icon}`} aria-hidden="true" />
              </div>
              <span className="nv-preview__label">{f.label}</span>
              <span className="nv-preview__desc">{f.desc}</span>
            </div>
          </SectionReveal>
        ))}
      </div>

      <SectionReveal delay={400}>
        <div className="nv-preview__cta">
          <Link to={ROUTES.PUBLIC_FEATURES} className="nv-btn-orange nv-btn-orange--lg">
            D&eacute;couvrir les fonctionnalit&eacute;s
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </SectionReveal>
    </div>
  </section>
);

export default HomePreviewSection;
