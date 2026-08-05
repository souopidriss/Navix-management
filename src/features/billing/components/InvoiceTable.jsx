/**
 * Navix Billing — InvoiceTable
 * --------------------------------------------------------------------------
 * Tableau des factures (affichage desktop) construit sur le DataTable
 * générique : numéro, entreprise, statut, montant, échéance, période et
 * actions contextuelles (détail, émettre, annuler, simuler un paiement).
 *
 * Props :
 *   invoices      : liste des factures (filtrée/triée/paginée)
 *   companyById   : carte { id → { name } }
 *   sort          : { by, direction } — tri contrôlé
 *   onSortChange  : (by, direction) => void
 *   onView        : (id: string) => void
 *   onIssue       : (invoice) => void
 *   onCancel      : (invoice) => void
 *   onPay         : (invoice) => void
 */
import { DataTable } from '@/components/core';
import { formatBillingDate } from '../constants';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import BillingAmount from './BillingAmount';
import BillingPeriod from './BillingPeriod';
import './InvoiceTable.css';

const InvoiceTable = ({
  invoices = [],
  companyById = {},
  sort,
  onSortChange,
  onView,
  onIssue,
  onCancel,
  onPay,
}) => {
  const columns = [
    {
      key: 'number',
      label: 'Numéro',
      sortable: true,
      width: '11rem',
      render: (invoice) => (
        <button
          type="button"
          className="navix-invoice-table__link"
          onClick={() => onView(invoice.id)}
          title={`Voir la facture ${invoice.number}`}
        >
          <code>{invoice.number}</code>
        </button>
      ),
    },
    {
      key: 'companyName',
      label: 'Entreprise',
      sortable: true,
      width: '14rem',
      render: (invoice) => companyById[invoice.companyId]?.name ?? '—',
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (invoice) => <InvoiceStatusBadge status={invoice.status} />,
    },
    {
      key: 'total',
      label: 'Montant',
      align: 'end',
      sortable: true,
      render: (invoice) => (
        <span className="tabular-nums">
          <BillingAmount value={invoice.total} currency={invoice.currency} />
        </span>
      ),
    },
    {
      key: 'amountDue',
      label: 'Reste dû',
      align: 'end',
      render: (invoice) => (
        <span className="tabular-nums navix-invoice-table__due">
          <BillingAmount value={invoice.amountDue} currency={invoice.currency} />
        </span>
      ),
    },
    {
      key: 'issuedDate',
      label: 'Émise le',
      sortable: true,
      render: (invoice) => (
        <span className="navix-invoice-table__date">
          {invoice.issuedDate ? formatBillingDate(invoice.issuedDate) : '—'}
        </span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Échéance',
      sortable: true,
      render: (invoice) => (
        <span className="navix-invoice-table__date">
          {invoice.dueDate ? formatBillingDate(invoice.dueDate) : '—'}
        </span>
      ),
    },
    {
      key: 'period',
      label: 'Période',
      render: (invoice) => (
        <BillingPeriod start={invoice.periodStart} end={invoice.periodEnd} />
      ),
    },
  ];

  return (
    <DataTable
      className="navix-invoice-table"
      columns={columns}
      rows={invoices}
      sort={sort}
      onSortChange={onSortChange}
      actions={[
        {
          key: 'view',
          label: (invoice) => `Voir le détail de la facture ${invoice.number}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (invoice) => onView(invoice.id),
        },
        {
          key: 'pay',
          label: (invoice) => `Simuler un paiement pour ${invoice.number}`,
          title: 'Simuler un paiement',
          icon: 'bi-cash-coin',
          show: (invoice) => ['issued', 'partially_paid', 'overdue'].includes(invoice.status),
          onClick: (invoice) => onPay(invoice),
        },
        {
          key: 'issue',
          label: (invoice) => `Émettre la facture ${invoice.number}`,
          title: 'Émettre',
          icon: 'bi-send',
          show: (invoice) => invoice.status === 'draft',
          onClick: (invoice) => onIssue(invoice),
        },
        {
          key: 'cancel',
          label: (invoice) => `Annuler la facture ${invoice.number}`,
          title: 'Annuler',
          icon: 'bi-x-circle',
          show: (invoice) => !['paid', 'cancelled', 'refunded'].includes(invoice.status),
          onClick: (invoice) => onCancel(invoice),
        },
      ]}
    />
  );
};

export default InvoiceTable;
