/**
 * Navix Trips — TripStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'un trajet (Prévu, En cours, Terminé, Annulé, Suspendu).
 * Le libellé et la variante proviennent des constantes.
 *
 * Props :
 *   status   : valeur du statut
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point de statut (défaut : true)
 *   ...rest  : attributs transmis au Badge (size, className, aria-*, etc.)
 */
import { Badge } from '@/components/ui';
import { getTripStatus } from '../constants';

const TripStatusBadge = ({ status, soft = true, showDot = true, ...rest }) => {
  const meta = getTripStatus(status);

  return (
    <Badge variant={meta.variant} soft={soft} dot={showDot} {...rest}>
      {meta.label}
    </Badge>
  );
};

export default TripStatusBadge;
