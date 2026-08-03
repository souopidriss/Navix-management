/**
 * Navix Fuel — FuelStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'un plein (En attente, Validé, Annulé), construit sur le
 * StatusBadge générique de la bibliothèque core. Le mapping « valeur →
 * { variant, label } » provient des constantes métier.
 *
 * Props :
 *   status   : valeur du statut
 *   soft     : badge doux (défaut : true)
 *   showDot  : affiche un point de statut (défaut : true)
 *   ...rest  : attributs transmis au StatusBadge (size, className, aria-*, etc.)
 */
import { StatusBadge } from '@/components/core';
import { getFuelStatus } from '../constants';

const FuelStatusBadge = ({ status, soft = true, showDot = true, ...rest }) => {
  const meta = getFuelStatus(status);

  return <StatusBadge variant={meta.variant} label={meta.label} soft={soft} dot={showDot} {...rest} />;
};

export default FuelStatusBadge;
