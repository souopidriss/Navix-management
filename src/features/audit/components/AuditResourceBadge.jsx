/**
 * Navix Audit — AuditResourceBadge
 * --------------------------------------------------------------------------
 * Badge de la ressource ciblée (vehicle, invoice, …). La méta (label,
 * icône) provient des constantes du module.
 */
import { StatusBadge } from '@/components/core';
import { getAuditResource } from '../constants';

const AuditResourceBadge = ({ resourceType, size = 'sm' }) => {
  const meta = getAuditResource(resourceType);
  return <StatusBadge variant="secondary" icon={meta.icon} label={meta.label} size={size} dot={false} />;
};

export default AuditResourceBadge;
