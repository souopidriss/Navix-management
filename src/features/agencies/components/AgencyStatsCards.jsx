/**
 * Navix Agencies — AgencyStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Agences / Sites : total, actives, en
 * maintenance et fermées temporairement. Les valeurs sont dérivées de la
 * liste chargée.
 *
 * Props :
 *   agencies : liste des agences (source des compteurs)
 */
import { Card } from '@/components/ui';
import './AgencyStatsCards.css';

const buildStats = (agencies = []) => [
  {
    key: 'total',
    label: 'Agences & sites',
    value: agencies.length,
    icon: 'bi-diagram-3',
    variant: 'primary',
  },
  {
    key: 'active',
    label: 'Actives',
    value: agencies.filter((agency) => agency.status === 'active').length,
    icon: 'bi-check-circle',
    variant: 'success',
  },
  {
    key: 'maintenance',
    label: 'En maintenance',
    value: agencies.filter((agency) => agency.status === 'maintenance').length,
    icon: 'bi-tools',
    variant: 'warning',
  },
  {
    key: 'closed',
    label: 'Temporairement fermées',
    value: agencies.filter((agency) => agency.status === 'temporarily_closed').length,
    icon: 'bi-pause-circle',
    variant: 'danger',
  },
];

const AgencyStatsCards = ({ agencies = [] }) => (
  <div className="row g-3 navix-agency-stats">
    {buildStats(agencies).map((stat) => (
      <div key={stat.key} className="col-6 col-lg-3">
        <Card className="navix-agency-stat">
          <span className={`navix-agency-stat__icon navix-agency-stat__icon--${stat.variant}`} aria-hidden="true">
            <i className={`bi ${stat.icon}`} />
          </span>
          <span className="navix-agency-stat__body">
            <span className="navix-agency-stat__value">{stat.value}</span>
            <span className="navix-agency-stat__label">{stat.label}</span>
          </span>
        </Card>
      </div>
    ))}
  </div>
);

export default AgencyStatsCards;
