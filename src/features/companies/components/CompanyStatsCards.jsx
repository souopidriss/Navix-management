/**
 * Navix Companies — CompanyStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Entreprises : total, actives, en attente
 * et abonnements actifs. Les valeurs sont dérivées de la liste chargée.
 *
 * Props :
 *   companies : liste des entreprises (source des compteurs)
 */
import { Card } from '@/components/ui';
import './CompanyStatsCards.css';

const buildStats = (companies = []) => [
  {
    key: 'total',
    label: 'Entreprises',
    value: companies.length,
    icon: 'bi-buildings',
    variant: 'primary',
  },
  {
    key: 'active',
    label: 'Actives',
    value: companies.filter((company) => company.status === 'active').length,
    icon: 'bi-check-circle',
    variant: 'success',
  },
  {
    key: 'pending',
    label: 'En attente',
    value: companies.filter((company) => company.status === 'pending').length,
    icon: 'bi-hourglass-split',
    variant: 'warning',
  },
  {
    key: 'subscriptions',
    label: 'Abonnements actifs',
    value: companies.filter((company) => company.subscriptionStatus === 'active').length,
    icon: 'bi-credit-card',
    variant: 'info',
  },
];

const CompanyStatsCards = ({ companies = [] }) => (
  <div className="row g-3 navix-company-stats">
    {buildStats(companies).map((stat) => (
      <div key={stat.key} className="col-6 col-lg-3">
        <Card className="navix-company-stat">
          <span className={`navix-company-stat__icon navix-company-stat__icon--${stat.variant}`} aria-hidden="true">
            <i className={`bi ${stat.icon}`} />
          </span>
          <span className="navix-company-stat__body">
            <span className="navix-company-stat__value">{stat.value}</span>
            <span className="navix-company-stat__label">{stat.label}</span>
          </span>
        </Card>
      </div>
    ))}
  </div>
);

export default CompanyStatsCards;
