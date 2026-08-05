/**
 * Navix Agencies — AgencyTypeBadge
 * --------------------------------------------------------------------------
 * Badge du type d'agence (Siège, Agence, Dépôt, Garage, Atelier, Parking,
 * Site opérationnel, Autre), construit sur le Badge générique. Le libellé,
 * la variante et l'icône proviennent des constantes métier.
 *
 * Props :
 *   type     : valeur du type
 *   soft     : badge doux (défaut : true)
 *   ...rest  : attributs transmis au Badge (size, className, aria-*, etc.)
 */
import { Badge } from '@/components/ui';
import { getAgencyType } from '../constants';

const AgencyTypeBadge = ({ type, soft = true, ...rest }) => {
  const meta = getAgencyType(type);

  return (
    <Badge variant={meta.variant} soft={soft} {...rest}>
      {meta.icon && <i className={`bi ${meta.icon} me-1`} aria-hidden="true" />}
      {meta.label}
    </Badge>
  );
};

export default AgencyTypeBadge;
