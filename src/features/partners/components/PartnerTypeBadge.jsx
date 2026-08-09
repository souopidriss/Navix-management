/**
 * Navix Partners — PartnerTypeBadge
 * --------------------------------------------------------------------------
 * Badge du type de partenaire (Fournisseur de véhicules, Assureur…),
 * construit sur le Badge générique de la bibliothèque UI. Le mapping
 * « valeur → { variant, icon, label } » provient des constantes métier.
 *
 * Props :
 *   type    : valeur du type de partenaire
 *   ...rest : attributs transmis au Badge (soft, size, className, aria-*)
 */
import { Badge } from '@/components/ui';
import { getPartnerType } from '../constants';

const PartnerTypeBadge = ({ type, ...rest }) => {
  const meta = getPartnerType(type);

  return (
    <Badge variant={meta.variant} soft {...rest}>
      <i className={`bi ${meta.icon} me-1`} aria-hidden="true" />
      {meta.label}
    </Badge>
  );
};

export default PartnerTypeBadge;
