/**
 * Navix Audit — AuditActionBadge
 * --------------------------------------------------------------------------
 * Badge de l'action effectuée (CREATE, UPDATE, PAYMENT, …). La méta
 * (label, variante, icône) provient des constantes du module.
 */
import { StatusBadge } from '@/components/core';
import { getAuditAction } from '../constants';

const AuditActionBadge = ({ action, size = 'sm' }) => {
  const meta = getAuditAction(action);
  return <StatusBadge variant={meta.variant} icon={meta.icon} label={meta.label} size={size} />;
};

export default AuditActionBadge;
