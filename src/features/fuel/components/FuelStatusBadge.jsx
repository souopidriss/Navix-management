/**
 * Navix Fuel — FuelStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'un plein (En attente, Validé, Annulé). Le libellé et la
 * variante proviennent des constantes.
 *
 * Props :
 *   status   : valeur du statut
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point de statut (défaut : true)
 *   ...rest  : attributs transmis au Badge (size, className, aria-*, etc.)
 */
import { Badge } from '@/components/ui';
import { getFuelStatus } from '../constants';

const FuelStatusBadge = ({ status, soft = true, showDot = true, ...rest }) => {
  const meta = getFuelStatus(status);

  return (
    <Badge variant={meta.variant} soft={soft} dot={showDot} {...rest}>
      {meta.label}
    </Badge>
  );
};

export default FuelStatusBadge;
