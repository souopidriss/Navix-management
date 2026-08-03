/**
 * Navix Drivers — DriverLicenseBadge
 * --------------------------------------------------------------------------
 * Badge de catégorie de permis (A, A1, A2, B, BE, C, CE, D, DE). Le libellé
 * complet et la variante proviennent des constantes centralisées.
 *
 * Props :
 *   category   : catégorie de permis (ex. 'CE')
 *   soft       : badge doux (défaut : true)
 *   showLabel  : affiche le libellé complet au lieu du code (défaut : false)
 *   ...rest    : attributs transmis au Badge
 */
import { Badge } from '@/components/ui';
import { getLicenseCategory } from '../constants';

const DriverLicenseBadge = ({ category, soft = true, showLabel = false, ...rest }) => {
  const meta = getLicenseCategory(category);

  return (
    <Badge variant={meta.variant} soft={soft} title={meta.label} {...rest}>
      {showLabel ? meta.label : category}
    </Badge>
  );
};

export default DriverLicenseBadge;
