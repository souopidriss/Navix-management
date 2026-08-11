/**
 * Navix Companies — CompanyStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Entreprises : total, actives, en attente
 * et abonnements actifs. Les valeurs sont dérivées de la liste chargée puis
 * rendues via le StatsCards générique de la bibliothèque core.
 *
 * Props :
 *   companies : liste des entreprises (source des compteurs)
 */
import { StatsCards } from '@/components/core';

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

const CompanyStatsCards = ({ companies = [] }) => <StatsCards stats={buildStats(companies)} />;

export default CompanyStatsCards;
