/**
 * Navix Maintenance — MaintenancePriorityBadge
 * --------------------------------------------------------------------------
 * Badge de priorité d'un entretien (Faible, Normale, Haute, Urgente),
 * construit sur le StatusBadge générique de la bibliothèque core.
 *
 * Props :
 *   priority : valeur de la priorité
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point (défaut : false — remplacé par l'icône)
 *   ...rest  : attributs transmis au StatusBadge
 */
import { StatusBadge } from '@/components/core';
import { getMaintenancePriority } from '../constants';

const MaintenancePriorityBadge = ({ priority, soft = true, showDot = false, ...rest }) => {
  const meta = getMaintenancePriority(priority);

  return (
    <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} soft={soft} dot={showDot} {...rest} />
  );
};

export default MaintenancePriorityBadge;
