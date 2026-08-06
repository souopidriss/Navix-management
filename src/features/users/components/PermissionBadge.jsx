/**
 * Navix Users — PermissionBadge
 * --------------------------------------------------------------------------
 * Représentation compacte d'une permission (`module.action`) : libellé
 * « Module : Action », surlignage pour les permissions sensibles et libellé
 * natif complet (description) au survol. Le joker `*` (super admin) est
 * traduit en « Accès complet ».
 *
 * Props : code, className
 */
import { Badge } from '@/components/ui';
import { getPermissionByCode } from '../mocks';

const WILDCARD = '*';

const PermissionBadge = ({ code, className }) => {
  if (code === WILDCARD) {
    return (
      <Badge variant="primary" soft className={className} title="Toutes les permissions">
        Accès complet
      </Badge>
    );
  }

  const permission = getPermissionByCode(code);
  return (
    <Badge
      variant={permission?.isSensitive ? 'danger' : 'secondary'}
      soft
      className={className}
      title={permission?.description ?? code}
    >
      {permission?.name ?? code}
    </Badge>
  );
};

export default PermissionBadge;
