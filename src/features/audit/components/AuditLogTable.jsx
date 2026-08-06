/**
 * Navix Audit — AuditLogTable
 * --------------------------------------------------------------------------
 * Tableau des entrées du journal (affichage desktop) construit sur le
 * DataTable générique : date, utilisateur, entreprise, agence, action,
 * ressource, description, statut, sévérité et menu contextuel.
 *
 * Props :
 *   logs         : liste filtrée / triée / paginée
 *   sort         : { by, direction }
 *   onSortChange : (by, direction) => void
 *   onView       : (log) => void
 *   onOpenResource : (log) => void
 */
import { DataTable, ActionDropdown } from '@/components/core';
import { formatAuditDateTime, getUser } from '../constants';
import AuditActionBadge from './AuditActionBadge';
import AuditResourceBadge from './AuditResourceBadge';
import AuditStatusBadge from './AuditStatusBadge';
import AuditSeverityBadge from './AuditSeverityBadge';
import './AuditLogTable.css';

const AuditLogTable = ({ logs = [], sort, onSortChange, onView, onOpenResource }) => {
  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      width: '9.5rem',
      render: (log) => (
        <time className="navix-audit-table__date" dateTime={log.createdAt}>
          {formatAuditDateTime(log.createdAt)}
        </time>
      ),
    },
    {
      key: 'userName',
      label: 'Utilisateur',
      sortable: true,
      width: '13rem',
      render: (log) => (
        <div className="navix-audit-table__user">
          <span className="navix-audit-table__user-name">{log.userName}</span>
          <span className="navix-audit-table__user-role">{getUser(log.userId).role ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'companyName',
      label: 'Entreprise',
      sortable: true,
      width: '11rem',
      render: (log) => log.companyName ?? '—',
    },
    {
      key: 'agencyName',
      label: 'Agence',
      width: '10rem',
      render: (log) => log.agencyName ?? '—',
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      width: '11rem',
      render: (log) => <AuditActionBadge action={log.action} />,
    },
    {
      key: 'resourceType',
      label: 'Ressource',
      sortable: true,
      width: '14rem',
      render: (log) => (
        <div className="navix-audit-table__resource">
          <AuditResourceBadge resourceType={log.resourceType} />
          <span className="navix-audit-table__resource-name">{log.resourceName}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      width: '20rem',
      render: (log) => (
        <span className="navix-audit-table__description" title={log.description}>
          {log.description}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (log) => <AuditStatusBadge status={log.status} />,
    },
    {
      key: 'severity',
      label: 'Sévérité',
      sortable: true,
      render: (log) => <AuditSeverityBadge severity={log.severity} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'end',
      className: 'text-end',
      render: (log) => (
        <ActionDropdown
          align="end"
          triggerLabel="Actions de l'entrée d'audit"
          items={[
            {
              key: 'view',
              label: 'Voir le détail',
              icon: 'bi-eye',
              onClick: () => onView(log),
            },
            {
              key: 'resource',
              label: 'Ouvrir la ressource',
              icon: 'bi-box-arrow-up-right',
              onClick: () => onOpenResource(log),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      className="navix-audit-table"
      columns={columns}
      rows={logs}
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={onView}
      ariaLabel="Tableau des actions du journal"
    />
  );
};

export default AuditLogTable;
