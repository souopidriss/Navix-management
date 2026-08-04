/**
 * Navix Documents — DocumentAssociationBadge
 * --------------------------------------------------------------------------
 * Étiquette de la ressource associée (entreprise, véhicule, chauffeur…) avec
 * son libellé résolu (nom, immatriculation, référence…). Rendu vide si le
 * document n'est rattaché à aucune ressource.
 *
 * Props :
 *   associationType : clé ASSOCIATION_TYPE_VALUES ('' si aucune)
 *   resourceLabel   : libellé de la ressource associée (déjà résolu)
 *   size            : 'sm' | 'md' | 'lg'
 */
import { Badge } from '@/components/ui';
import { getAssociationType } from '../constants';

const DocumentAssociationBadge = ({ associationType, resourceLabel = '', size = 'md' }) => {
  if (!associationType) return null;

  const meta = getAssociationType(associationType);

  return (
    <Badge variant={meta.variant} soft size={size}>
      <i className={`bi ${meta.icon} me-1`} aria-hidden="true" />
      {meta.label}
      {resourceLabel ? ` · ${resourceLabel}` : ''}
    </Badge>
  );
};

export default DocumentAssociationBadge;
