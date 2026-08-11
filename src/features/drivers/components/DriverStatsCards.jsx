/**
 * Navix Drivers — DriverStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Chauffeurs : effectif total, actifs,
 * en mission et disponibles. Les valeurs sont dérivées de la liste chargée
 * puis rendues via le StatsCards générique de la bibliothèque core.
 *
 * Props :
 *   drivers : liste des chauffeurs (source des compteurs)
 */
import { StatsCards } from '@/components/core';

const buildStats = (drivers = []) => [
  {
    key: 'total',
    label: 'Effectif total',
    value: drivers.length,
    icon: 'bi-people',
    variant: 'primary',
  },
  {
    key: 'active',
    label: 'Actifs',
    value: drivers.filter((driver) => driver.status === 'active').length,
    icon: 'bi-check-circle',
    variant: 'success',
  },
  {
    key: 'on_mission',
    label: 'En mission',
    value: drivers.filter((driver) => driver.status === 'on_mission').length,
    icon: 'bi-play-circle',
    variant: 'info',
  },
  {
    key: 'available',
    label: 'Disponibles',
    value: drivers.filter((driver) => driver.availability === 'available').length,
    icon: 'bi-person-check',
    variant: 'warning',
  },
];

const DriverStatsCards = ({ drivers = [] }) => <StatsCards stats={buildStats(drivers)} />;

export default DriverStatsCards;
