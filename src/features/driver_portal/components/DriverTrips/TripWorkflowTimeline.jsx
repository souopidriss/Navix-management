/**
 * Navix Driver Portal — TripWorkflowTimeline
 * --------------------------------------------------------------------------
 * Chronologie du workflow d'un trajet : planifié → départ → en cours →
 * arrivée → terminé. Les étapes franchies sont marquées actives.
 */
import { memo } from 'react';
import { Timeline } from '@/components/core';
import { formatDate, formatNumber } from '@/utils/format';

const STEPS = [
  { id: 'planned', title: 'Planifié', icon: 'bi-calendar2-event', variant: 'secondary' },
  { id: 'departed', title: 'Départ effectué', icon: 'bi-sign-turn-right', variant: 'primary' },
  { id: 'in_progress', title: 'En cours de route', icon: 'bi-play-circle', variant: 'primary' },
  { id: 'arrived', title: 'Arrivée', icon: 'bi-flag', variant: 'success' },
  { id: 'completed', title: 'Terminé', icon: 'bi-check2-circle', variant: 'success' },
];

const isReached = (stepId, status) => {
  if (stepId === 'planned') return true;
  if (stepId === 'departed' || stepId === 'in_progress') {
    return status === 'in_progress' || status === 'suspended' || status === 'completed';
  }
  return status === 'completed';
};

const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours} h ${String(rest).padStart(2, '0')}` : `${rest} min`;
};

const TripWorkflowTimeline = ({ trip }) => {
  const items = STEPS.map((step) => {
    const reached = isReached(step.id, trip?.status);
    let date = '';
    let description = '';

    if (step.id === 'planned') {
      date = trip?.departureDate ? formatDate(trip.departureDate) : '';
      description = trip?.departureTime ? `Départ prévu à ${trip.departureTime}` : '';
    } else if (step.id === 'departed') {
      date = trip?.departureTime || '';
      description = trip?.departureMileage ? `${formatNumber(trip.departureMileage)} km au compteur` : '';
    } else if (step.id === 'in_progress') {
      date = trip?.status === 'suspended' ? 'En pause' : 'En cours';
      description = trip?.actualDistance ? `${formatNumber(trip.actualDistance)} km parcourus` : '';
    } else if (step.id === 'arrived') {
      date = trip?.arrivalTime || '';
      description = trip?.arrivalMileage ? `${formatNumber(trip.arrivalMileage)} km au compteur` : '';
    } else if (step.id === 'completed') {
      date = trip?.arrivalDate ? formatDate(trip.arrivalDate) : '';
      description = trip?.actualDuration ? `${formatDuration(trip.actualDuration)} de trajet` : '';
    }

    return {
      id: step.id,
      title: step.title,
      icon: step.icon,
      variant: reached ? step.variant : 'secondary',
      active: reached,
      date,
      description,
    };
  });

  return <Timeline items={items} align="left" />;
};

export default memo(TripWorkflowTimeline);
