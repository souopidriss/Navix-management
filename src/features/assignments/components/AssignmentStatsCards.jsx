/**
 * Navix Assignments — AssignmentStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Affectations : total, actives, prévues et
 * en retard. Les valeurs sont dérivées de la liste chargée.
 *
 * Props :
 *   assignments : liste des affectations (source des compteurs)
 */
import { Card } from '@/components/ui';
import './AssignmentStatsCards.css';

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

const AssignmentStatsCards = ({ assignments = [] }) => (
  <div className="row g-3 navix-assignment-stats">
    {buildStats(assignments).map((stat) => (
      <div key={stat.key} className="col-6 col-lg-3">
        <Card className="navix-assignment-stat">
          <span className={`navix-assignment-stat__icon navix-assignment-stat__icon--${stat.variant}`} aria-hidden="true">
            <i className={`bi ${stat.icon}`} />
          </span>
          <span className="navix-assignment-stat__body">
            <span className="navix-assignment-stat__value">{stat.value}</span>
            <span className="navix-assignment-stat__label">{stat.label}</span>
          </span>
        </Card>
      </div>
    ))}
  </div>
);

export default AssignmentStatsCards;
