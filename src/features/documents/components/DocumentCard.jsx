/**
 * Navix Documents — DocumentCard
 * --------------------------------------------------------------------------
 * Carte d'un document (vues grille / tablette / mobile) : tuile d'icône,
 * nom cliquable, type, visibilité, ressource associée, métadonnées
 * (entreprise, taille, date, version) et actions (aperçu, détail, édition,
 * suppression).
 *
 * Props :
 *   document       : document à afficher
 *   fileType       : type de fichier associé (objet FileType)
 *   companyName    : nom de l'entreprise
 *   resourceLabel  : libellé de la ressource associée
 *   onView         : (id: string) => void
 *   onPreview      : (document: object) => void
 *   onEdit         : (id: string) => void
 *   onDelete       : (document: object) => void
 *   canEdit        : booléen — affiche le bouton « Modifier »
 *   canDelete      : booléen — affiche le bouton « Supprimer »
 */
import { Button } from '@/components/ui';
import DocumentTypeBadge from './DocumentTypeBadge';
import DocumentVisibilityBadge from './DocumentVisibilityBadge';
import DocumentAssociationBadge from './DocumentAssociationBadge';
import DocumentVersionBadge from './DocumentVersionBadge';
import {
  formatDocumentSize,
  formatDocumentDate,
  getDocumentType,
} from '../constants';
import './DocumentCard.css';

const DocumentCard = ({
  document,
  fileType,
  companyName = '—',
  resourceLabel = '',
  onView,
  onPreview,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const typeMeta = getDocumentType(String(fileType?.title ?? '').toLowerCase());
  const fileTypeLabel = fileType?.title || document.extension || 'DOCUMENT';

  return (
    <article className="card h-100 navix-doc-card">
      <div className="card-body">
        <div className="d-flex align-items-start gap-3">
          <span className="navix-doc-card__tile" aria-hidden="true">
            <i className={`bi ${typeMeta.icon}`} />
            <span className="navix-doc-card__tile-ext">{fileTypeLabel}</span>
          </span>

          <div className="min-w-0 flex-grow-1">
            <h2 className="navix-doc-card__name">
              <button
                type="button"
                className="navix-doc-card__link"
                onClick={() => onView(document.id)}
                title={`Voir le détail de ${document.name}`}
              >
                {document.name}
              </button>
            </h2>
            <div className="navix-doc-card__tags">
              <DocumentTypeBadge fileType={fileType} />
              <DocumentVisibilityBadge visibility={document.visibility} />
              <DocumentVersionBadge version={document.version} />
            </div>
          </div>
        </div>

        {document.description && (
          <p className="navix-doc-card__description mb-0">{document.description}</p>
        )}

        <div className="navix-doc-card__association">
          <DocumentAssociationBadge
            associationType={document.associationType}
            resourceLabel={resourceLabel}
          />
        </div>

        <dl className="navix-doc-card__meta">
          <div>
            <dt>
              <i className="bi bi-buildings" aria-hidden="true" /> Entreprise
            </dt>
            <dd>{companyName}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-hdd" aria-hidden="true" /> Taille
            </dt>
            <dd>{formatDocumentSize(document.size)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-calendar3" aria-hidden="true" /> Date
            </dt>
            <dd>{formatDocumentDate(document.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="card-footer d-flex justify-content-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          icon="bi-eye"
          onClick={() => onPreview(document)}
          title="Aperçu"
          aria-label={`Aperçu de ${document.name}`}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="bi-box-arrow-up-right"
          onClick={() => onView(document.id)}
          title="Voir le détail"
          aria-label={`Voir le détail de ${document.name}`}
        />
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            icon="bi-pencil"
            onClick={() => onEdit(document.id)}
            title="Modifier"
            aria-label={`Modifier ${document.name}`}
          />
        )}
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            icon="bi-trash3"
            onClick={() => onDelete(document)}
            title="Supprimer"
            aria-label={`Supprimer ${document.name}`}
          />
        )}
      </div>
    </article>
  );
};

export default DocumentCard;
