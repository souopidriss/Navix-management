/**
 * Navix Agencies — AgencyActivity
 * --------------------------------------------------------------------------
 * Flux d'activité récent d'une agence (ajouts de chauffeurs / véhicules,
 * trajets, pleins, entretiens, documents), construit sur le Timeline
 * générique de la bibliothèque core. Les événements arrivent triés du plus
 * récent au plus ancien.
 *
 * Props :
 *   activity : liste d'événements
 *              [{ id, type, title, description, date, icon, variant }]
 */
import { Timeline } from '@/components/core';
import { EmptyState } from '@/components/core';
import { formatAgencyDateTime } from '../constants';

const AgencyActivity = ({ activity = [] }) => {
  if (activity.length === 0) {
    return (
      <EmptyState
        compact
        icon="bi-clock-history"
        title="Aucune activité"
        description="Aucun événement récent pour cette agence."
      />
    );
  }

  const items = activity.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: formatAgencyDateTime(event.date),
    icon: event.icon,
    variant: event.variant,
    active: false,
  }));

  return <Timeline items={items} />;
};

export default AgencyActivity;
