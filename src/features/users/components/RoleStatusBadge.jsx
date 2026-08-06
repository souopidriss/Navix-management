/**
 * Navix Users — RoleStatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut de rôle (Actif / Inactif) construit sur le StatusBadge
 * générique de Core UI.
 *
 * Props : isActive, className
 */
import { StatusBadge } from '@/components/core';
import { getRoleStatus } from '../constants';

const RoleStatusBadge = ({ isActive, className }) => {
  const meta = getRoleStatus(isActive ? 'active' : 'inactive');
  return (
    <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} className={className} />
  );
};

export default RoleStatusBadge;
