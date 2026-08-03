/**
 * Navix Drivers — DriverStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'un chauffeur (Actif, En mission, Disponible, Suspendu,
 * En congé, Inactif). Le libellé et la variante proviennent des constantes.
 *
 * Props :
 *   status   : valeur du statut
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point de statut (défaut : true)
 *   ...rest  : attributs transmis au Badge (size, className, aria-*, etc.)
 */
import { Badge } from '@/components/ui';
import { getDriverStatus } from '../constants';

const DriverStatusBadge = ({ status, soft = true, showDot = true, ...rest }) => {
  const meta = getDriverStatus(status);

  return (
    <Badge variant={meta.variant} soft={soft} dot={showDot} {...rest}>
      {meta.label}
    </Badge>
  );
};

export default DriverStatusBadge;
