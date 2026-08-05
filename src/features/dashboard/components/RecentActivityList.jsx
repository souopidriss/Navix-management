/**
 * Navix Dashboard — RecentActivityList
 * --------------------------------------------------------------------------
 * Activité récente (trajets, carburant, entretiens, documents, véhicules)
 * rendue sur la frise chronologique générique.
 */
import { Card } from '@/components/ui';
import { Timeline } from '@/components/core';
import { getActivityType, formatDashboardDateTime } from '../constants';

const TYPE_VARIANTS = {
  trip_created: 'primary',
  trip_completed: 'success',
  fuel_created: 'info',
  fuel_validated: 'success',
  maintenance_created: 'warning',
  maintenance_completed: 'success',
  document_uploaded: 'info',
  vehicle_created: 'info',
  vehicle_status: 'warning',
  driver_created: 'success',
};

const RecentActivityList = ({ activities = [] }) => {
  const items = activities.map((activity) => {
    const type = getActivityType(activity.type);
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      date: formatDashboardDateTime(activity.createdAt),
      icon: type.icon,
      variant: TYPE_VARIANTS[activity.type] || 'primary',
    };
  });

  return (
    <Card
      title={<span><i className="bi bi-activity me-2" aria-hidden="true" />Activité récente</span>}
      flush
    >
      {items.length === 0 ? (
        <div className="p-3">
          <p className="text-secondary mb-0">Aucune activité pour la période.</p>
        </div>
      ) : (
        <Timeline items={items} />
      )}
    </Card>
  );
};

export default RecentActivityList;
