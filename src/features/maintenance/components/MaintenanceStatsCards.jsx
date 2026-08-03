/**
 * Navix Maintenance — MaintenanceStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Entretiens (page liste) : total, entretiens
 * en cours (véhicules immobilisés), entretiens en retard et coût du mois.
 * Construit sur le StatsCards générique de la bibliothèque core.
 *
 * Props :
 *   maintenanceRecords : liste des entretiens (source des compteurs)
 *   vehicleById        : carte { id → véhicule } pour les seuils kilométriques
 */
import { StatsCards } from '@/components/core';
import {
  formatMaintenanceMoney,
  isMaintenanceLate,
} from '../constants';

const monthKey = (value) => (value ? String(value).slice(0, 7) : '');

const buildStats = (maintenanceRecords = [], vehicleById = {}) => {
  const currentMonth = monthKey(new Date().toISOString());
  const monthCost = maintenanceRecords
    .filter((record) => record.status === 'completed' && monthKey(record.completedAt) === currentMonth)
    .reduce((sum, record) => sum + Number(record.actualCost || 0), 0);

  const inProgress = maintenanceRecords.filter((record) => record.status === 'in_progress').length;
  const late = maintenanceRecords.filter(
    (record) => !['completed', 'cancelled'].includes(record.status) && isMaintenanceLate(record, vehicleById[record.vehicleId]),
  ).length;

  return [
    {
      key: 'count',
      label: 'Entretiens',
      value: maintenanceRecords.length,
      icon: 'bi-wrench-adjustable',
      variant: 'primary',
    },
    {
      key: 'inProgress',
      label: 'En cours',
      value: inProgress,
      icon: 'bi-pause-circle',
      variant: 'warning',
    },
    {
      key: 'late',
      label: 'En retard',
      value: late,
      icon: 'bi-clock-history',
      variant: 'danger',
    },
    {
      key: 'monthCost',
      label: 'Coût du mois',
      value: formatMaintenanceMoney(monthCost),
      icon: 'bi-cash-stack',
      variant: 'success',
    },
  ];
};

const MaintenanceStatsCards = ({ maintenanceRecords = [], vehicleById = {} }) => (
  <StatsCards stats={buildStats(maintenanceRecords, vehicleById)} />
);

export default MaintenanceStatsCards;
