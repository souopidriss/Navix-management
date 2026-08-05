/**
 * Navix Notifications — NotificationStats
 * --------------------------------------------------------------------------
 * Indicateurs du centre de notifications (total, non lues, urgentes,
 * archivées) rendus via StatsCards de Core UI.
 *
 * Props :
 *   stats   : { total, unread, read, archived, dismissed, urgent, byType }
 *   loading : booléen — skeleton pendant le chargement
 */
import { StatsCards } from '@/components/core';

const NotificationStats = ({ stats, loading = false }) => {
  if (!stats && !loading) return null;

  const cards = [
    {
      key: 'total',
      label: 'Notifications',
      value: loading ? '—' : stats?.total ?? 0,
      icon: 'bi-bell',
      variant: 'primary',
      variation: 'en tout',
    },
    {
      key: 'unread',
      label: 'Non lues',
      value: loading ? '—' : stats?.unread ?? 0,
      icon: 'bi-envelope',
      variant: 'info',
      variation: 'à consulter',
    },
    {
      key: 'urgent',
      label: 'Urgentes',
      value: loading ? '—' : stats?.urgent ?? 0,
      icon: 'bi-exclamation-octagon',
      variant: 'danger',
      variation: 'critiques ou hautes',
      trend: (stats?.urgent ?? 0) > 0 ? 'down' : 'neutral',
      trendLabel: 'à traiter',
    },
    {
      key: 'archived',
      label: 'Archivées',
      value: loading ? '—' : stats?.archived ?? 0,
      icon: 'bi-archive',
      variant: 'secondary',
      variation: 'traitées',
    },
  ];

  return <StatsCards stats={cards} loading={loading} columns={4} />;
};

export default NotificationStats;
