/**
 * Navix Partner Portal — PartnerNotificationStats (PROMPT 067)
 * --------------------------------------------------------------------------
 * 4 cartes KPI notifications : Total / Non lues / Importantes / Aujourd'hui.
 * Les compteurs proviennent du service (portefeuille réel du partenaire).
 */
import { MetricCard } from '@/components/core';

const PartnerNotificationStats = ({ stats = {}, loading = false }) => {
  const total = stats.total || 0;

  return (
    <div className="pn-kpi-grid mb-4">
      <MetricCard
        label="Notifications"
        value={total}
        icon="bi-bell"
        variant="primary"
        loading={loading}
        variation="total notifications"
        trend="neutral"
        trendLabel="ensemble"
      />
      <MetricCard
        label="Non lues"
        value={stats.unread ?? 0}
        icon="bi-envelope"
        variant="danger"
        loading={loading}
        variation={total ? `${Math.round(((stats.unread ?? 0) / total) * 100)} % du total` : 'aucune'}
        trend={(stats.unread ?? 0) > 0 ? 'down' : 'neutral'}
        trendLabel="à consulter"
      />
      <MetricCard
        label="Importantes"
        value={stats.important ?? 0}
        icon="bi-exclamation-diamond"
        variant="warning"
        loading={loading}
        variation="priorité haute"
        trend={(stats.important ?? 0) > 0 ? 'down' : 'neutral'}
        trendLabel="nécessitent attention"
      />
      <MetricCard
        label="Aujourd'hui"
        value={stats.today ?? 0}
        icon="bi-calendar-check"
        variant="success"
        loading={loading}
        variation="reçues aujourd'hui"
        trend="neutral"
        trendLabel="activités du jour"
      />
    </div>
  );
};

export default PartnerNotificationStats;
