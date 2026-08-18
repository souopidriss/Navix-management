/**
 * Navix Partner Portal — Schémas Zod Alertes & Échéances (PROMPT 075)
 * ─────────────────────────────────────────────────────────────────────
 * Validation pour les filtres et actions des alertes.
 */
import { z } from 'zod';

export const ALERT_SEVERITY_OPTIONS = [
  { value: 'all', label: 'Toutes les sévérités' },
  { value: 'critical', label: 'Urgent' },
  { value: 'warning', label: 'Attention' },
  { value: 'info', label: 'Info' },
];

export const ALERT_STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'acknowledged', label: 'Prise en compte' },
  { value: 'resolved', label: 'Traitée' },
  { value: 'dismissed', label: 'Ignorée' },
];

export const ALERT_TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les types' },
  { value: 'maintenance_urgent', label: 'Maintenance urgente' },
  { value: 'maintenance_due', label: 'Entretien à prévoir' },
  { value: 'document_expiring', label: 'Document expirant' },
  { value: 'document_expired', label: 'Document expiré' },
  { value: 'contract_expiring', label: 'Contrat expirant' },
  { value: 'contract_expired', label: 'Contrat expiré' },
  { value: 'contract_pending', label: 'Contrat en attente' },
  { value: 'invoice_overdue', label: 'Facture en retard' },
  { value: 'invoice_expiring', label: 'Facture à échéance' },
  { value: 'mission_delayed', label: 'Mission en retard' },
  { value: 'mission_cancelled', label: 'Mission annulée' },
  { value: 'request_pending', label: 'Demande en attente' },
  { value: 'fuel_anomaly', label: 'Anomalie carburant' },
];

export const ALERT_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'expiresAt', label: "Date d'échéance" },
  { value: 'severity', label: 'Sévérité' },
  { value: 'title', label: 'Titre' },
];

export const ALERT_STATUS_SCHEMA = z.enum([
  'pending',
  'acknowledged',
  'resolved',
  'dismissed',
]);

export const ALERT_SEVERITY_SCHEMA = z.enum([
  'critical',
  'warning',
  'info',
]);

export const alertFiltersSchema = z.object({
  search: z.string().default(''),
  severity: z.enum(['all', 'critical', 'warning', 'info']).default('all'),
  status: z.enum(['all', 'pending', 'acknowledged', 'resolved', 'dismissed']).default('all'),
  type: z.string().default('all'),
  sortBy: z.enum(['createdAt', 'expiresAt', 'severity', 'title']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

export const alertStatusUpdateSchema = z.object({
  alertId: z.string().min(1),
  status: ALERT_STATUS_SCHEMA,
});
