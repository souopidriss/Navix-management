import { Timeline } from '@/components/core';

const EVENT_META = {
  created: { icon: 'bi-clipboard-check', variant: 'secondary' },
  started: { icon: 'bi-sign-turn-right', variant: 'success' },
  completed: { icon: 'bi-flag-fill', variant: 'info' },
  cancelled: { icon: 'bi-x-octagon-fill', variant: 'danger' },
};

const formatDateTime = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const ClientTripTimeline = ({ events = [] }) => {
  const items = events
    .slice()
    .sort((a, b) => new Date(a.at) - new Date(b.at))
    .map((event) => {
      const meta = EVENT_META[event.type] ?? { icon: 'bi-dot', variant: 'info' };
      return {
        id: event.id,
        title: event.label,
        description: event.description,
        date: formatDateTime(event.at),
        icon: meta.icon,
        variant: meta.variant,
      };
    });

  return <Timeline items={items} />;
};

export default ClientTripTimeline;
