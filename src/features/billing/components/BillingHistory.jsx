/**
 * Navix Billing — BillingHistory
 * --------------------------------------------------------------------------
 * Journal de facturation (émissions, paiements, avoirs, remises, retards,
 * remboursements) rendu sous forme de chronologie. S'appuie sur le Timeline
 * générique de Core UI et sur les constantes du module.
 */
import { Timeline } from '@/components/core';
import { getHistoryType, formatBillingDateTime } from '../constants';

const BillingHistory = ({ history = [] }) => {
  const items = history.map((entry) => {
    const meta = getHistoryType(entry.type);
    return {
      id: entry.id,
      title: meta.label,
      description: entry.message,
      date: formatBillingDateTime(entry.createdAt),
      icon: meta.icon,
      variant: meta.variant,
    };
  });

  return <Timeline items={items} />;
};

export default BillingHistory;
