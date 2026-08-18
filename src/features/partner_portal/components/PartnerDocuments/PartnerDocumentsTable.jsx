/**
 * Navix Partner Portal — PartnerDocumentsTable (PROMPT 066)
 * --------------------------------------------------------------------------
 * Tableau documentaire premium : colonnes Document / Type / Entité liée /
 * Date d'ajout / Expiration / Taille / Statut / Actions. Tri par nom, date
 * d'ajout, expiration, taille et statut ; pagination 10/25/50. Les actions
 * (Voir, Télécharger, Modifier, Renouveler, Supprimer) passent par
 * ActionDropdown et sont conditionnées aux permissions RBAC.
 */
import { DataTable, StatusBadge, Pagination, ActionDropdown } from '@/components/core';
import {
  formatDocumentDate,
  formatDocumentSize,
  getDocumentType,
} from '@/features/documents/constants';
import {
  getPartnerDocumentCategory,
  getPartnerDocumentStatus,
  getPartnerDocumentEntity,
  getPartnerDocumentDaysLeft,
  PARTNER_DOCUMENT_PAGE_SIZE_OPTIONS,
} from '../../constants/partner.constants';

const PartnerDocumentsTable = ({
  documents = [],
  sort,
  onSortChange,
  page,
  setPage,
  pageSize,
  setPageSize,
  totalItems,
  totalPages,
  loading = false,
  empty,
  header,
  canUpdate = false,
  canDelete = false,
  onView,
  onDownload,
  onEdit,
  onRenew,
  onDelete,
}) => {
  const columns = [
    {
      key: 'name',
      label: 'Document',
      sortable: true,
      render: (document) => {
        const type = getDocumentType(document.fileType);
        return (
          <button
            type="button"
            className="navix-pdoc-docbtn"
            onClick={() => onView(document)}
            title={`Voir ${document.name}`}
          >
            <span className={`navix-pdoc-fileicon navix-pdoc-fileicon--${document.fileType || 'other'}`} aria-hidden="true">
              <i className={`bi ${type.icon}`} />
            </span>
            <span className="text-start">
              <span className="fw-semibold d-block text-truncate" style={{ maxWidth: '20rem' }}>
                {document.name}
              </span>
              <small className="text-secondary">{document.reference || '—'}</small>
            </span>
          </button>
        );
      },
    },
    {
      key: 'category',
      label: 'Type',
      sortable: true,
      render: (document) => {
        const meta = getPartnerDocumentCategory(document.category);
        return (
          <span className="d-inline-flex align-items-center gap-1">
            <i className={`bi ${meta.icon} text-secondary`} aria-hidden="true" />
            {meta.label}
          </span>
        );
      },
    },
    {
      key: 'entity',
      label: 'Entité liée',
      render: (document) => {
        const meta = getPartnerDocumentEntity(document.entityType);
        return (
          <span className="d-inline-flex align-items-center gap-1" title={document.entityLabel}>
            <i className={`bi ${meta.icon} text-secondary`} aria-hidden="true" />
            <span className="text-truncate" style={{ maxWidth: '14rem' }}>
              {document.entityLabel || '—'}
            </span>
          </span>
        );
      },
    },
    {
      key: 'addedAt',
      label: 'Date d’ajout',
      sortable: true,
      render: (document) => (
        <span className="text-nowrap">{formatDocumentDate(document.addedAt)}</span>
      ),
    },
    {
      key: 'expiresAt',
      label: 'Expiration',
      sortable: true,
      render: (document) => {
        if (!document.expiresAt) return <span className="text-secondary">—</span>;
        const daysLeft = getPartnerDocumentDaysLeft(document.expiresAt);
        return (
          <div>
            <div className="text-nowrap">{formatDocumentDate(document.expiresAt)}</div>
            {daysLeft !== null && document.status !== 'expired' && (
              <small className={daysLeft <= 30 ? 'text-warning fw-medium' : 'text-secondary'}>
                {daysLeft <= 30
                  ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`
                  : 'échéance lointaine'}
              </small>
            )}
          </div>
        );
      },
    },
    {
      key: 'size',
      label: 'Taille',
      align: 'end',
      sortable: true,
      render: (document) => <span className="tabular-nums">{formatDocumentSize(document.size)}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (document) => {
        const meta = getPartnerDocumentStatus(document.status);
        return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      srOnly: true,
      align: 'end',
      render: (document) => (
        <ActionDropdown
          ariaLabel={`Actions pour ${document.name}`}
          items={[
            {
              key: 'view',
              label: 'Voir le document',
              icon: 'bi-eye',
              onClick: () => onView(document),
            },
            {
              key: 'download',
              label: 'Télécharger',
              icon: 'bi-download',
              onClick: () => onDownload(document),
            },
            {
              key: 'edit',
              label: 'Modifier',
              icon: 'bi-pencil',
              show: () => canUpdate,
              onClick: () => onEdit(document),
            },
            {
              key: 'renew',
              label: 'Renouveler',
              icon: 'bi-arrow-clockwise',
              show: () => canUpdate && document.status === 'expired',
              onClick: () => onRenew(document),
            },
            { key: 'separator', separator: true },
            {
              key: 'delete',
              label: 'Supprimer',
              icon: 'bi-trash3',
              danger: true,
              show: () => canDelete,
              onClick: () => onDelete(document),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      className="navix-pdoc-table"
      columns={columns}
      rows={documents}
      sort={sort}
      onSortChange={onSortChange}
      ariaLabel="Liste des documents partenaires"
      loading={loading}
      empty={empty}
      header={header}
      footer={
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={PARTNER_DOCUMENT_PAGE_SIZE_OPTIONS}
        />
      }
    />
  );
};

export default PartnerDocumentsTable;
