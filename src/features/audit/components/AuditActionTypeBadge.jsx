/**
 * Navix Audit — AuditActionTypeBadge
 * --------------------------------------------------------------------------
 * Badge de la famille d'action (crud, billing, security, …). La méta
 * (label, variante, icône) provient des constantes du module.
 */
import { StatusBadge } from '@/components/core';
import { getAuditActionType } from '../constants';

const AuditActionTypeBadge = ({ actionType, size = 'sm' }) => {
  const meta = getAuditActionType(actionType);
  return <StatusBadge variant={meta.variant} icon={meta.icon} label={meta.label} size={size} dot={false} />;
};

export default AuditActionTypeBadge;
