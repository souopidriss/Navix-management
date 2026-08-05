/**
 * Navix Agencies — AgencyStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'une agence (Active, Inactive, En maintenance,
 * Temporairement fermée), construit sur le StatusBadge générique de la
 * bibliothèque core. Le mapping « valeur → { variant, label, icon } »
 * provient des constantes métier.
 *
 * Props :
 *   status   : valeur du statut
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point de statut (défaut : true)
 *   ...rest  : attributs transmis au StatusBadge (size, className, aria-*, etc.)
 */
import { StatusBadge } from '@/components/core';
import { getAgencyStatus } from '../constants';

const AgencyStatusBadge = ({ status, soft = true, showDot = true, ...rest }) => {
  const meta = getAgencyStatus(status);

  return (
    <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} soft={soft} dot={showDot} {...rest} />
  );
};

export default AgencyStatusBadge;
