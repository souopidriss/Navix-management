/**
 * Navix Audit — AuditSeverityBadge
 * --------------------------------------------------------------------------
 * Badge de la sévérité d'une entrée (low, medium, high, critical). La méta
 * (label, variante, icône) provient des constantes du module.
 */
import { StatusBadge } from '@/components/core';
import { getAuditSeverity } from '../constants';

const AuditSeverityBadge = ({ severity, size = 'sm' }) => {
  const meta = getAuditSeverity(severity);
  return <StatusBadge variant={meta.variant} icon={meta.icon} label={meta.label} size={size} />;
};

export default AuditSeverityBadge;
