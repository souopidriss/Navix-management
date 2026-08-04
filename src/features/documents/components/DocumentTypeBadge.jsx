/**
 * Navix Documents — DocumentTypeBadge
 * --------------------------------------------------------------------------
 * Étiquette du type de fichier d'un document (PDF, PNG, XLSX…), construite
 * sur le Badge du Design System et les métadonnées DOCUMENT_TYPES
 * (libellé, icône, variante). Le type est résolu à partir du titre du
 * FileType associé (source de vérité : constants).
 *
 * Props :
 *   fileType : objet FileType (ou null si inconnu) — { id, title }
 *   size     : 'sm' | 'md' | 'lg'
 */
import { Badge } from '@/components/ui';
import { getDocumentType } from '../constants';

const DocumentTypeBadge = ({ fileType, size = 'md' }) => {
  const title = String(fileType?.title ?? '').toLowerCase();
  const meta = getDocumentType(title);

  return (
    <Badge variant={meta.variant} soft size={size}>
      <i className={`bi ${meta.icon} me-1`} aria-hidden="true" />
      {fileType?.title || meta.label}
    </Badge>
  );
};

export default DocumentTypeBadge;
