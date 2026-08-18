import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './ResourcesComingSoon.css';

const RESOURCE_TYPES = [
  {
    icon: 'bi-journal-text',
    title: 'Guides d\u2019utilisation',
    desc: 'Tutoriels pas \u00e0 pas pour prendre en main chaque module de la plateforme.',
  },
  {
    icon: 'bi-lightbulb',
    title: 'Conseils flotte',
    desc: 'Bonnes pratiques et astuces pour optimiser la gestion de vos v\u00e9hicules.',
  },
  {
    icon: 'bi-file-earmark-text',
    title: 'Documentation',
    desc: 'R\u00e9f\u00e9rence technique d\u00e9taill\u00e9e de chaque fonctionnalit\u00e9.',
  },
  {
    icon: 'bi-megaphone',
    title: 'Actualit\u00e9s produit',
    desc: 'Nouvelles fonctionnalit\u00e9s, mises \u00e0 jour et am\u00e9liorations.',
  },
];

const ResourcesComingSoon = () => (
  <section className="nv-rcoming nv-section" aria-labelledby="rcoming-title">
    <div className="nv-container">
      <div className="nv-section-header">
        <span className="nv-badge">
          <i className="bi bi-clock-history" aria-hidden="true" />
          BIENT&Ocirc;T DISPONIBLE
        </span>
        <h2 id="rcoming-title" className="nv-section-title">
          Ressources bient&ocirc;t disponibles
        </h2>
        <p className="nv-section-subtitle">
          Nous pr&eacute;parons une biblioth&egrave;que de ressources pour vous
          aider &agrave; tirer le meilleur parti de Navix Management.
        </p>
      </div>

      <div className="nv-rcoming__grid">
        {RESOURCE_TYPES.map((item) => (
          <div key={item.title} className="nv-rcoming__card">
            <div className="nv-rcoming__card-icon" aria-hidden="true">
              <i className={`bi ${item.icon}`} />
            </div>
            <h3 className="nv-rcoming__card-title">{item.title}</h3>
            <p className="nv-rcoming__card-desc">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="nv-rcoming__cta">
        <p className="nv-rcoming__cta-text">
          En attendant, d&eacute;couvrez la plateforme en demandant une
          d&eacute;monstration personnalis&eacute;e.
        </p>
        <Link to={`${ROUTES.PUBLIC_CONTACT}?type=demo`} className="nv-btn-orange nv-btn-orange--lg">
          Demander une d&eacute;mo
          <i className="bi bi-arrow-right" aria-hidden="true" />
        </Link>
      </div>
    </div>
  </section>
);

export default ResourcesComingSoon;
