/**
 * Navix Companies — CompanyStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'une entreprise (Active, En attente, Suspendue, Inactive).
 * Le libellé et la variante proviennent des constantes métier.
 *
 * Props :
 *   status   : valeur du statut (active | pending | suspended | inactive)
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point de statut (défaut : true)
 *   ...rest  : attributs transmis au Badge (size, className, aria-*, etc.)
 */
import { Badge } from '@/components/ui';
import { getCompanyStatus } from '../constants';

const CompanyStatusBadge = ({ status, soft = true, showDot = true, ...rest }) => {
  const meta = getCompanyStatus(status);

  return (
    <Badge variant={meta.variant} soft={soft} dot={showDot} {...rest}>
      {meta.label}
    </Badge>
  );
};

export default CompanyStatusBadge;
