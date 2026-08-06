/**
 * Navix Users — UserStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut d'utilisateur (Actif / Inactif / Suspendu / En attente /
 * Invité) construit sur le StatusBadge générique de Core UI.
 *
 * Props : status (clé USER_STATUSES), className
 */
import { StatusBadge } from '@/components/core';
import { getUserStatus } from '../constants';

const UserStatusBadge = ({ status, className }) => {
  const meta = getUserStatus(status);
  return (
    <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} className={className} />
  );
};

export default UserStatusBadge;
