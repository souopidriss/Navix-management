/**
 * Navix Documents — DocumentVersionBadge
 * --------------------------------------------------------------------------
 * Numéro de version d'un document (ex. « v2 »), repli sur « v1 ».
 *
 * Props :
 *   version : numéro de version (entier)
 */
import { Badge } from '@/components/ui';

const DocumentVersionBadge = ({ version = 1 }) => (
  <Badge variant="secondary" soft size="sm">
    v{Math.max(1, Number(version) || 1)}
  </Badge>
);

export default DocumentVersionBadge;
