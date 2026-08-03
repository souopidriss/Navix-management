/**
 * Navix Assignments — AssignmentStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'une affectation (Prévue, Active, Terminée, Annulée,
 * Suspendue). Le libellé et la variante proviennent des constantes.
 *
 * Props :
 *   status   : valeur du statut
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point de statut (défaut : true)
 *   ...rest  : attributs transmis au Badge (size, className, aria-*, etc.)
 */
import { Badge } from '@/components/ui';
import { getAssignmentStatus } from '../constants';

const AssignmentStatusBadge = ({ status, soft = true, showDot = true, ...rest }) => {
  const meta = getAssignmentStatus(status);

  return (
    <Badge variant={meta.variant} soft={soft} dot={showDot} {...rest}>
      {meta.label}
    </Badge>
  );
};

export default AssignmentStatusBadge;
