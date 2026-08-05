/**
 * Navix Subscriptions — SubscriptionTable
 * --------------------------------------------------------------------------
 * Tableau des abonnements (affichage desktop) construit sur le DataTable
 * générique de la bibliothèque core : colonnes déclaratives, tri par en-tête,
 * badges métier et colonne d'actions contextuelles (détail, changement de
 * plan, résiliation, suppression).
 *
 * Props :
 *   subscriptions : liste des abonnements (filtrée/triée/paginée)
 *   companyById   : carte { id → { name } } pour le libellé de l'entreprise
 *   planById      : carte { id → { name, code, price } } pour le plan
 *   sort          : { by, direction } — tri contrôlé
 *   onSortChange  : (by, direction) => void
 *   onView        : (id: string) => void
 *   onUpgrade     : (subscription) => void
 *   onCancel      : (subscription) => void
 *   onDelete      : (subscription) => void
 */
import { DataTable } from '@/components/core';
import { Badge } from '@/components/ui';
import {
  getPlan,
  getBillingInterval,
  formatSubscriptionMoney,
  formatSubscriptionDate,
  MONTHS_PER_BILLING_INTERVAL,
} from '../constants';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';
import './SubscriptionTable.css';

const CANCELABLE_STATUSES = new Set(['active', 'trialing', 'past_due']);

const SubscriptionTable = ({
  subscriptions = [],
  companyById = {},
  planById = {},
  sort,
  onSortChange,
  onView,
  onUpgrade,
  onCancel,
  onDelete,
}) => {
  const columns = [
    {
      key: 'companyName',
      label: 'Entreprise',
      sortable: true,
      width: '14rem',
      render: (subscription) => (
        <span className="navix-subscription-table__company">
          <button
            type="button"
            className="navix-subscription-table__link"
            onClick={() => onView(subscription.id)}
            title={`Voir l'abonnement de ${companyById[subscription.companyId]?.name ?? '—'}`}
          >
            {companyById[subscription.companyId]?.name ?? '—'}
          </button>
        </span>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      sortable: true,
      render: (subscription) => {
        const plan = planById[subscription.planId];
        const meta = getPlan(plan?.code);
        return <Badge variant={meta.variant} icon={meta.icon} label={plan?.name ?? '—'} />;
      },
    },
    {
      key: 'billingInterval',
      label: 'Facturation',
      render: (subscription) => {
        const meta = getBillingInterval(subscription.billingInterval);
        return <Badge variant={meta.variant} icon={meta.icon} label={meta.label} />;
      },
    },
    {
      key: 'price',
      label: 'Prix',
      align: 'end',
      sortable: true,
      render: (subscription) => {
        const months = MONTHS_PER_BILLING_INTERVAL[subscription.billingInterval] || 1;
        const annualDiscount = subscription.billingInterval === 'yearly' ? 0.833 : 1;
        const total = Math.round(Number(subscription.price || 0) * months * annualDiscount);
        return (
          <span className="tabular-nums">
            {formatSubscriptionMoney(total, subscription.currency)}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (subscription) => <SubscriptionStatusBadge status={subscription.status} />,
    },
    {
      key: 'currentPeriodEnd',
      label: 'Échéance',
      sortable: true,
      render: (subscription) => (
        <span className="navix-subscription-table__date">
          {formatSubscriptionDate(subscription.currentPeriodEnd)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      className="navix-subscription-table"
      columns={columns}
      rows={subscriptions}
      sort={sort}
      onSortChange={onSortChange}
      actions={[
        {
          key: 'view',
          label: (subscription) =>
            `Voir le détail de l'abonnement de ${companyById[subscription.companyId]?.name ?? 'l’entreprise'}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (subscription) => onView(subscription.id),
        },
        {
          key: 'upgrade',
          label: () => 'Changer de plan',
          title: 'Changer de plan',
          icon: 'bi-arrow-repeat',
          show: (subscription) => !['cancelled', 'expired'].includes(subscription.status),
          onClick: (subscription) => onUpgrade(subscription),
        },
        {
          key: 'cancel',
          label: (subscription) => `Résilier l'abonnement de ${companyById[subscription.companyId]?.name ?? 'l’entreprise'}`,
          title: 'Résilier',
          icon: 'bi-x-circle',
          show: (subscription) => CANCELABLE_STATUSES.has(subscription.status),
          onClick: (subscription) => onCancel(subscription),
        },
        {
          key: 'delete',
          label: (subscription) =>
            `Supprimer définitivement l'abonnement de ${companyById[subscription.companyId]?.name ?? 'l’entreprise'}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          onClick: (subscription) => onDelete(subscription),
        },
      ]}
    />
  );
};

export default SubscriptionTable;
