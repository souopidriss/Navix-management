/**
 * Navix Vehicles — VehicleStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Véhicules : parc total, disponibles,
 * en mission et en maintenance. Les valeurs sont dérivées de la liste chargée
 * puis rendues via le StatsCards générique de la bibliothèque core.
 *
 * Props :
 *   vehicles : liste des véhicules (source des compteurs)
 */
import { StatsCards } from '@/components/core';

const buildStats = (vehicles = []) => [
  {
    key: 'total',
    label: 'Parc total',
    value: vehicles.length,
    icon: 'bi-truck',
    variant: 'primary',
  },
  {
    key: 'available',
    label: 'Disponibles',
    value: vehicles.filter((vehicle) => vehicle.status === 'available').length,
    icon: 'bi-check-circle',
    variant: 'success',
  },
  {
    key: 'in_use',
    label: 'En mission',
    value: vehicles.filter((vehicle) => vehicle.status === 'in_use').length,
    icon: 'bi-play-circle',
    variant: 'info',
  },
  {
    key: 'maintenance',
    label: 'En maintenance',
    value: vehicles.filter((vehicle) => vehicle.status === 'maintenance').length,
    icon: 'bi-wrench-adjustable',
    variant: 'warning',
  },
];

const VehicleStatsCards = ({ vehicles = [] }) => <StatsCards stats={buildStats(vehicles)} />;

export default VehicleStatsCards;
