/**
 * Navix Assignments — AssignmentStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Affectations : total, actives, prévues et
 * en retard. Les valeurs sont dérivées de la liste chargée puis rendues via
 * le StatsCards générique de la bibliothèque core.
 *
 * Props :
 *   assignments : liste des affectations (source des compteurs)
 */
import { StatsCards } from '@/components/core';

const buildStats = (assignments = []) => {
  const lateCount = assignments.filter(
    (assignment) =>
      assignment.status === 'active' &&
      assignment.expectedEndDate &&
      new Date(assignment.expectedEndDate).getTime() < Date.now(),
  ).length;

  return [
    {
      key: 'total',
      label: 'Affectations',
      value: assignments.length,
      icon: 'bi-shuffle',
      variant: 'primary',
    },
    {
      key: 'active',
      label: 'Actives',
      value: assignments.filter((assignment) => assignment.status === 'active').length,
      icon: 'bi-play-circle',
      variant: 'success',
    },
    {
      key: 'planned',
      label: 'Prévues',
      value: assignments.filter((assignment) => assignment.status === 'planned').length,
      icon: 'bi-calendar2-check',
      variant: 'info',
    },
    {
      key: 'late',
      label: 'En retard',
      value: lateCount,
      icon: 'bi-exclamation-triangle',
      variant: 'warning',
    },
  ];
};

const AssignmentStatsCards = ({ assignments = [] }) => <StatsCards stats={buildStats(assignments)} />;

export default AssignmentStatsCards;
