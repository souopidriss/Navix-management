/**
 * Navix Billing — PaymentTable
 * --------------------------------------------------------------------------
 * Tableau des paiements (affichage desktop) construit sur le DataTable
 * générique : numéro, entreprise, facture, statut, moyen, montant et date.
 * Actions contextuelles : détail et remboursement (paiement réussi).
 *
 * Props :
 *   payments      : liste des paiements (filtrée/triée/paginée)
 *   companyById   : carte { id → { name } }
 *   invoiceById   : carte { id → { number } }
 *   sort          : { by, direction } — tri contrôlé
 *   onSortChange  : (by, direction) => void
 *   onView        : (id: string) => void
 *   onRefund      : (payment) => void
 */
import { DataTable } from '@/components/core';
import { formatBillingDate } from '../constants';
import PaymentStatusBadge from './PaymentStatusBadge';
import PaymentMethodBadge from './PaymentMethodBadge';
import BillingAmount from './BillingAmount';
import './PaymentTable.css';

const PaymentTable = ({
  payments = [],
  companyById = {},
  invoiceById = {},
  sort,
  onSortChange,
  onView,
  onRefund,
}) => {
  const columns = [
    {
      key: 'number',
      label: 'Numéro',
      sortable: true,
      width: '11rem',
      render: (payment) => (
        <button
          type="button"
          className="navix-payment-table__link"
          onClick={() => onView(payment.id)}
          title={`Voir le paiement ${payment.number}`}
        >
          <code>{payment.number}</code>
        </button>
      ),
    },
    {
      key: 'companyName',
      label: 'Entreprise',
      sortable: true,
      width: '13rem',
      render: (payment) => companyById[payment.companyId]?.name ?? '—',
    },
    {
      key: 'invoice',
      label: 'Facture',
      render: (payment) => invoiceById[payment.invoiceId]?.number ?? '—',
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (payment) => <PaymentStatusBadge status={payment.status} />,
    },
    {
      key: 'method',
      label: 'Moyen',
      sortable: true,
      render: (payment) => <PaymentMethodBadge method={payment.method} size="sm" />,
    },
    {
      key: 'amount',
      label: 'Montant',
      align: 'end',
      sortable: true,
      render: (payment) => (
        <span className="tabular-nums">
          <BillingAmount value={payment.amount} currency={payment.currency} />
        </span>
      ),
    },
    {
      key: 'paymentDate',
      label: 'Date',
      sortable: true,
      render: (payment) => (
        <span className="navix-payment-table__date">
          {formatBillingDate(payment.paymentDate)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      className="navix-payment-table"
      columns={columns}
      rows={payments}
      sort={sort}
      onSortChange={onSortChange}
      actions={[
        {
          key: 'view',
          label: (payment) => `Voir le détail du paiement ${payment.number}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (payment) => onView(payment.id),
        },
        {
          key: 'refund',
          label: (payment) => `Rembourser le paiement ${payment.number}`,
          title: 'Rembourser',
          icon: 'bi-arrow-counterclockwise',
          show: (payment) => payment.status === 'successful',
          onClick: (payment) => onRefund(payment),
        },
      ]}
    />
  );
};

export default PaymentTable;
