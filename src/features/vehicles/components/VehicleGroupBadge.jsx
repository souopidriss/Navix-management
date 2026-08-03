/**
 * Navix Vehicles — VehicleGroupBadge
 * --------------------------------------------------------------------------
 * Badge du groupe de classification d'un véhicule (A → G). Le libellé et la
 * variante proviennent des constantes métier (VEHICLE_GROUPS).
 *
 * Props :
 *   group      : groupe (A | B | C | D | E | F | G)
 *   soft       : badge doux (défaut : true)
 *   showCode   : affiche le code du groupe (ex. « Groupe B »)
 *   ...rest    : attributs transmis au Badge
 */
import { Badge } from '@/components/ui';
import { getVehicleGroup } from '../constants';

const VehicleGroupBadge = ({ group, soft = true, showCode = false, ...rest }) => {
  const meta = getVehicleGroup(group);

  return (
    <Badge variant={meta.variant} soft={soft} {...rest}>
      {showCode ? `Groupe ${group} · ${meta.label}` : meta.label}
    </Badge>
  );
};

export default VehicleGroupBadge;
