/**
 * Navix Users — RoleTypeBadge
 * --------------------------------------------------------------------------
 * Badge de type de rôle (Système / Personnalisé) construit sur le StatusBadge
 * générique de Core UI.
 *
 * Props : isSystem, className
 */
import { StatusBadge } from '@/components/core';
import { getRoleType } from '../constants';

const RoleTypeBadge = ({ isSystem, className }) => {
  const meta = getRoleType(isSystem ? 'system' : 'custom');
  return (
    <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} className={className} />
  );
};

export default RoleTypeBadge;
