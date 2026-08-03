/**
 * Navix Maintenance — MaintenanceTypeBadge
 * --------------------------------------------------------------------------
 * Badge du type d'entretien (Vidange, Révision, Contrôle technique…),
 * construit sur le Badge générique de la bibliothèque UI. Le mapping
 * « valeur → { variant, icon, label } » provient des constantes métier.
 *
 * Props :
 *   type    : valeur du type d'entretien
 *   ...rest : attributs transmis au Badge (soft, size, className, aria-*)
 */
import { Badge } from '@/components/ui';
import { getMaintenanceType } from '../constants';

const MaintenanceTypeBadge = ({ type, ...rest }) => {
  const meta = getMaintenanceType(type);

  return (
    <Badge variant={meta.variant} soft {...rest}>
      <i className={`bi ${meta.icon} me-1`} aria-hidden="true" />
      {meta.label}
    </Badge>
  );
};

export default MaintenanceTypeBadge;
