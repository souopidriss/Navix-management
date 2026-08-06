/**
 * Navix Audit — AuditStatusBadge
 * --------------------------------------------------------------------------
 * Badge du statut d'une entrée (success, failed, warning, info). La méta
 * (label, variante, icône) provient des constantes du module.
 */
import { StatusBadge } from '@/components/core';
import { getAuditStatus } from '../constants';

const AuditStatusBadge = ({ status, size = 'sm' }) => {
  const meta = getAuditStatus(status);
  return <StatusBadge variant={meta.variant} icon={meta.icon} label={meta.label} size={size} />;
};

export default AuditStatusBadge;
