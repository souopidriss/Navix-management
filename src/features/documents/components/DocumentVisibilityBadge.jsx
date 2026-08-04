/**
 * Navix Documents — DocumentVisibilityBadge
 * --------------------------------------------------------------------------
 * Étiquette de visibilité (public / privé / restreint) d'un document,
 * construite sur le Badge du Design System et DOCUMENT_VISIBILITIES.
 *
 * Props :
 *   visibility : 'public' | 'private' | 'restricted'
 *   size       : 'sm' | 'md' | 'lg'
 */
import { Badge } from '@/components/ui';
import { getDocumentVisibility } from '../constants';

const DocumentVisibilityBadge = ({ visibility, size = 'md' }) => {
  const meta = getDocumentVisibility(visibility);

  return (
    <Badge variant={meta.variant} soft size={size}>
      <i className={`bi ${meta.icon} me-1`} aria-hidden="true" />
      {meta.label}
    </Badge>
  );
};

export default DocumentVisibilityBadge;
