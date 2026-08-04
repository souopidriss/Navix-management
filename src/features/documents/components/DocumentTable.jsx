/**
 * Navix Documents — DocumentTable
 * --------------------------------------------------------------------------
 * Tableau des documents (affichage desktop) construit sur le DataTable
 * générique de la bibliothèque core : colonnes déclaratives, tri par
 * en-tête, libellés métier (type, visibilité, ressource, taille, date) et
 * colonne d'actions (aperçu, détail, édition, suppression).
 *
 * Props :
 *   documents     : liste des documents à afficher (filtrée/triée/paginée)
 *   fileTypesById : carte { id → FileType }
 *   companyById   : carte { id → { name } } des entreprises
 *   resourceLabel : (document) => string — libellé de la ressource associée
 *   sort          : { by, direction } — tri contrôlé
 *   onSortChange  : (by, direction) => void
 *   onView        : (id: string) => void
 *   onPreview     : (document: object) => void
 *   onEdit        : (id: string) => void
 *   onDelete      : (document: object) => void
 */
import { DataTable } from '@/components/core';
import DocumentTypeBadge from './DocumentTypeBadge';
import DocumentVisibilityBadge from './DocumentVisibilityBadge';
import DocumentAssociationBadge from './DocumentAssociationBadge';
import DocumentVersionBadge from './DocumentVersionBadge';
import {
  formatDocumentSize,
  formatDocumentDate,
  getDocumentType,
} from '../constants';
import './DocumentTable.css';

const DocumentTable = ({
  documents = [],
  fileTypesById = {},
  companyById = {},
  resourceLabel = () => '',
  sort,
  onSortChange,
  onView,
  onPreview,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (document) => {
        const fileType = fileTypesById[document.fileTypeId];
        const typeMeta = getDocumentType(String(fileType?.title ?? '').toLowerCase());
        return (
          <span className="navix-doc-table__name">
            <i
              className={`bi ${typeMeta.icon} navix-doc-table__name-icon`}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <button
                type="button"
                className="navix-doc-table__link"
                onClick={() => onView(document.id)}
                title={`Voir le détail de ${document.name}`}
              >
                {document.name}
              </button>
              <span className="navix-doc-table__name-sub">
                {document.extension} · {formatDocumentSize(document.size)}
              </span>
            </span>
          </span>
        );
      },
    },
    {
      key: 'fileTypeId',
      label: 'Type',
      sortValue: (document) => fileTypesById[document.fileTypeId]?.title ?? '',
      render: (document) => (
        <DocumentTypeBadge fileType={fileTypesById[document.fileTypeId]} />
      ),
    },
    {
      key: 'companyId',
      label: 'Entreprise',
      sortValue: (document) => companyById[document.companyId]?.name ?? '',
      render: (document) => (
        <span className="navix-doc-table__company">
          {companyById[document.companyId]?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'associationType',
      label: 'Ressource',
      render: (document) => (
        <DocumentAssociationBadge
          associationType={document.associationType}
          resourceLabel={resourceLabel(document)}
        />
      ),
    },
    {
      key: 'visibility',
      label: 'Visibilité',
      render: (document) => (
        <DocumentVisibilityBadge visibility={document.visibility} />
      ),
    },
    {
      key: 'createdAt',
      label: 'Ajouté le',
      sortable: true,
      sortValue: (document) => document.createdAt || '',
      render: (document) => (
        <span className="navix-doc-table__date">{formatDocumentDate(document.createdAt)}</span>
      ),
    },
    {
      key: 'version',
      label: 'Version',
      render: (document) => <DocumentVersionBadge version={document.version} />,
    },
  ];

  return (
    <DataTable
      className="navix-doc-table"
      columns={columns}
      rows={documents}
      sort={sort}
      onSortChange={onSortChange}
      actions={[
        {
          key: 'preview',
          label: (document) => `Aperçu de ${document.name}`,
          title: 'Aperçu',
          icon: 'bi-eye',
          onClick: (document) => onPreview(document),
        },
        {
          key: 'view',
          label: (document) => `Voir le détail de ${document.name}`,
          title: 'Voir le détail',
          icon: 'bi-box-arrow-up-right',
          onClick: (document) => onView(document.id),
        },
        {
          key: 'edit',
          label: (document) => `Modifier ${document.name}`,
          title: 'Modifier',
          icon: 'bi-pencil',
          onClick: (document) => onEdit(document.id),
        },
        {
          key: 'delete',
          label: (document) => `Supprimer ${document.name}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          onClick: (document) => onDelete(document),
        },
      ]}
    />
  );
};

export default DocumentTable;
