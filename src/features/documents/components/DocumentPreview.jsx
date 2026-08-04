/**
 * Navix Documents — DocumentPreview
 * --------------------------------------------------------------------------
 * Aperçu d'un document dans une modale (FormModal sans soumission, pied
 * personnalisé). Le rendu visuel est simulé : tuile d'icône du type de
 * fichier et métadonnées complètes (type, extension, taille, MIME,
 * entreprise, ressource, visibilité, auteur, dates, version). Le bouton
 * « Télécharger » déclenche le téléchargement simulé via `onDownload`.
 *
 * Props :
 *   document     : document à prévisualiser (ou null)
 *   fileType     : type de fichier associé (objet FileType)
 *   companyName  : nom de l'entreprise
 *   resourceLabel : libellé de la ressource associée
 *   onDownload   : (document: object) => void
 *   downloading  : booléen — téléchargement en cours
 *   onClose      : () => void
 */
import { Button } from '@/components/ui';
import { FormModal } from '@/components/core';
import DocumentTypeBadge from './DocumentTypeBadge';
import DocumentVisibilityBadge from './DocumentVisibilityBadge';
import DocumentAssociationBadge from './DocumentAssociationBadge';
import DocumentVersionBadge from './DocumentVersionBadge';
import {
  formatDocumentSize,
  formatDocumentLongDate,
  getDocumentCategoryKind,
  getDocumentTypeByExtension,
  getDocumentType,
} from '../constants';
import './DocumentPreview.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="navix-doc-preview__row">
    <dt>
      <i className={`bi ${icon}`} aria-hidden="true" /> {label}
    </dt>
    <dd>{children}</dd>
  </div>
);

const DocumentPreview = ({
  open = true,
  document,
  fileType,
  companyName = '—',
  resourceLabel = '',
  onDownload,
  downloading = false,
  onClose,
}) => {
  if (!open || !document) return null;

  const typeMeta =
    getDocumentTypeByExtension(document.extension) ||
    getDocumentType(String(fileType?.title ?? '').toLowerCase());
  const category = getDocumentCategoryKind(typeMeta?.category);
  const isImage = category === 'image';

  return (
    <FormModal
      open
      onClose={onClose}
      title={document.name}
      subtitle={`Aperçu · ${formatDocumentSize(document.size)}`}
      icon="bi-eye"
      size="lg"
      footer={
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="primary" icon="bi-download" onClick={() => onDownload(document)} loading={downloading}>
            Télécharger
          </Button>
        </div>
      }
    >
      <div className="navix-doc-preview">
        <div className={`navix-doc-preview__hero ${isImage ? 'navix-doc-preview__hero--image' : ''}`}>
          {isImage ? (
            <>
              <i className={`bi ${typeMeta?.icon ?? 'bi-file-earmark-image'} navix-doc-preview__hero-icon`} aria-hidden="true" />
              <span className="navix-doc-preview__hero-note">
                Aperçu simulé — aucune image réelle n’est stockée en mode mock.
              </span>
            </>
          ) : (
            <>
              <i className={`bi ${typeMeta?.icon ?? 'bi-file-earmark'} navix-doc-preview__hero-icon`} aria-hidden="true" />
              <span className="navix-doc-preview__hero-note">
                Ce type de fichier ne dispose pas d’aperçu intégré.
              </span>
            </>
          )}
        </div>

        <dl className="navix-doc-preview__meta">
          <InfoRow icon="bi-tag" label="Type">
            <DocumentTypeBadge fileType={fileType} />
          </InfoRow>
          <InfoRow icon="bi-file-earmark" label="Extension">
            {document.extension || '—'}
          </InfoRow>
          <InfoRow icon="bi-hdd" label="Taille">
            {formatDocumentSize(document.size)}
          </InfoRow>
          <InfoRow icon="bi-filetype" label="Type MIME">
            {document.mimeType || '—'}
          </InfoRow>
          <InfoRow icon="bi-buildings" label="Entreprise">
            {companyName}
          </InfoRow>
          <InfoRow icon="bi-link" label="Ressource">
            <DocumentAssociationBadge
              associationType={document.associationType}
              resourceLabel={resourceLabel}
            />
          </InfoRow>
          <InfoRow icon="bi-shield-lock" label="Visibilité">
            <DocumentVisibilityBadge visibility={document.visibility} />
          </InfoRow>
          <InfoRow icon="bi-person" label="Téléversé par">
            {document.uploadedBy || '—'}
          </InfoRow>
          <InfoRow icon="bi-calendar3" label="Ajouté le">
            {formatDocumentLongDate(document.createdAt)}
          </InfoRow>
          <InfoRow icon="bi-pencil" label="Modifié le">
            {formatDocumentLongDate(document.updatedAt)}
          </InfoRow>
          <InfoRow icon="bi-tags" label="Version">
            <DocumentVersionBadge version={document.version} />
          </InfoRow>
        </dl>
      </div>
    </FormModal>
  );
};

export default DocumentPreview;
