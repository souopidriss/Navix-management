/**
 * Navix Partner Portal — PartnerActivityTimeline (PROMPT 067)
 * --------------------------------------------------------------------------
 * Timeline Premium des activités récentes du Partenaire. Regroupées par
 * période (Aujourd'hui / Hier / Cette semaine / Plus anciennes). Chaque
 * activité affiche : icône, titre, description, date et entité concernée.
 */
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { EmptyState } from '@/components/core';
import { formatNotificationRelative } from '@/features/notifications/constants';
import { getPartnerActivityType } from '../../constants/partner.constants';

const RESOURCE_ROUTES = {
  vehicle: ROUTES.PARTNER_VEHICLES,
  mission: ROUTES.PARTNER_MISSIONS,
  document: ROUTES.PARTNER_DOCUMENTS,
  client: ROUTES.PARTNER_CLIENTS,
  transaction: ROUTES.PARTNER_FINANCE_TRANSACTIONS,
  contract: ROUTES.PARTNER_CONTRACTS,
  invoice: ROUTES.PARTNER_FINANCE_INVOICES,
  request: ROUTES.PARTNER_REQUESTS,
};

const groupByPeriod = (activities = []) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);
  const startOfWeek = new Date(startOfToday.getTime() - ((now.getDay() + 6) % 7) * 86_400_000);

  const groups = { today: [], yesterday: [], thisWeek: [], older: [] };

  activities.forEach((activity) => {
    const ts = new Date(activity.createdAt).getTime();
    if (Number.isNaN(ts)) {
      groups.older.push(activity);
    } else if (ts >= startOfToday.getTime()) {
      groups.today.push(activity);
    } else if (ts >= startOfYesterday.getTime()) {
      groups.yesterday.push(activity);
    } else if (ts >= startOfWeek.getTime()) {
      groups.thisWeek.push(activity);
    } else {
      groups.older.push(activity);
    }
  });

  return [
    { key: 'today', label: "Aujourd'hui", items: groups.today },
    { key: 'yesterday', label: 'Hier', items: groups.yesterday },
    { key: 'thisWeek', label: 'Cette semaine', items: groups.thisWeek },
    { key: 'older', label: 'Plus anciennes', items: groups.older },
  ].filter((group) => group.items.length > 0);
};

const PartnerActivityTimeline = ({ activities = [], loading = false }) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-secondary small py-3">Chargement des activités…</div>;
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        compact
        icon="bi-activity"
        title="Aucune activité récente"
        description="Les activités de votre espace apparaîtront ici."
      />
    );
  }

  const groups = groupByPeriod(activities);

  return (
    <div className="pn-timeline">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="pn-timeline__group-label">{group.label}</div>
          {group.items.map((activity) => {
            const actType = getPartnerActivityType(activity.type);
            const route = activity.entityType ? RESOURCE_ROUTES[activity.entityType] : null;
            return (
              <div key={activity.id} className="pn-timeline__item">
                <span className={`pn-timeline__dot pn-timeline__dot--${actType.variant}`} aria-hidden="true" />
                <span className={`pn-timeline__icon bg-${actType.variant}-soft text-${actType.variant}`} aria-hidden="true">
                  <i className={`bi ${actType.icon}`} />
                </span>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <p className="pn-timeline__title mb-0">{activity.title}</p>
                    <span className="pn-timeline__time">{formatNotificationRelative(activity.createdAt)}</span>
                  </div>
                  <p className="pn-timeline__desc mb-0">{activity.description}</p>
                  {activity.entityId && route && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 mt-1"
                      onClick={() => navigate(route)}
                    >
                      <i className="bi bi-link-45deg me-1" aria-hidden="true" />
                      Voir les détails
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default PartnerActivityTimeline;
