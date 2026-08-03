/**
 * Navix Maintenance — MaintenanceStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'un entretien (Prévu, En attente, En cours, Terminé,
 * Annulé), construit sur le StatusBadge générique de la bibliothèque core.
 * Le mapping « valeur → { variant, label, icon } » provient des constantes.
 *
 * Props :
 *   status   : valeur du statut
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point de statut (défaut : true)
 *   ...rest  : attributs transmis au StatusBadge (size, className, aria-*, etc.)
 */
import { StatusBadge } from '@/components/core';
import { getMaintenanceStatus } from '../constants';

const MaintenanceStatusBadge = ({ status, soft = true, showDot = true, ...rest }) => {
  const meta = getMaintenanceStatus(status);

  return (
    <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} soft={soft} dot={showDot} {...rest} />
  );
};

export default MaintenanceStatusBadge;
