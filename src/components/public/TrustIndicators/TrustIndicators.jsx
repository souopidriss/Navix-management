import './TrustIndicators.css';

const INDICATORS = [
  {
    icon: 'bi-shield-check',
    label: 'Sécurisé',
    description: 'Données protégées et chiffrées',
  },
  {
    icon: 'bi-patch-check',
    label: 'Fiable',
    description: 'Infrastructure stable et performante',
  },
  {
    icon: 'bi-speedometer2',
    label: 'Performant',
    description: 'Temps réel et haute disponibilité',
  },
];

const TrustIndicators = () => (
  <ul className="nv-trust" aria-label="Indicateurs de confiance">
    {INDICATORS.map((item) => (
      <li key={item.label} className="nv-trust__item">
        <span className="nv-trust__icon" aria-hidden="true">
          <i className={`bi ${item.icon}`} />
        </span>
        <span className="nv-trust__label">{item.label}</span>
      </li>
    ))}
  </ul>
);

export default TrustIndicators;
