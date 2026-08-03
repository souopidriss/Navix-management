/**
 * Navix Vehicles — VehicleStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'un véhicule (Disponible, En mission, En maintenance,
 * Hors service). Le libellé et la variante proviennent des constantes métier.
 *
 * Props :
 *   status   : valeur du statut (available | in_use | maintenance | out_of_service)
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point de statut (défaut : true)
 *   ...rest  : attributs transmis au Badge (size, className, aria-*, etc.)
 */
import { Badge } from '@/components/ui';
import { getVehicleStatus } from '../constants';

const VehicleStatusBadge = ({ status, soft = true, showDot = true, ...rest }) => {
  const meta = getVehicleStatus(status);

  return (
    <Badge variant={meta.variant} soft={soft} dot={showDot} {...rest}>
      {meta.label}
    </Badge>
  );
};

export default VehicleStatusBadge;
