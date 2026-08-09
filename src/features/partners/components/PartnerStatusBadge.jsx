/**
 * Navix Partners — PartnerStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'un partenaire (Actif, Inactif), construit sur le
 * StatusBadge générique de la bibliothèque core. Le mapping
 * « valeur → { variant, label, icon } » provient des constantes.
 *
 * Props :
 *   status   : valeur du statut
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point de statut (défaut : true)
 *   ...rest  : attributs transmis au StatusBadge (size, className, aria-*)
 */
import { StatusBadge } from '@/components/core';
import { getPartnerStatus } from '../constants';

const PartnerStatusBadge = ({ status, soft = true, showDot = true, ...rest }) => {
  const meta = getPartnerStatus(status);

  return (
    <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} soft={soft} dot={showDot} {...rest} />
  );
};

export default PartnerStatusBadge;
