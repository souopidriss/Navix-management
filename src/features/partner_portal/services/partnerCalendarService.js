/**
 * Navix Partner Portal — Service Calendrier Opérationnel (PROMPT 076)
 * ────────────────────────────────────────────────────────────────────
 * Agrégateur read-only centralisant les événements de TOUTES les sources
 * métier existantes dans un format unifié pour le calendrier.
 *
 * Sources :
 *   - MOCK_PARTNER_MISSIONS  → missions (startDate / endDate)
 *   - MOCK_PARTNER_REQUESTS  → demandes (scheduledDate)
 *   - MOCK_PARTNER_CONTRACTS → contrats (startDate / endDate)
 *   - MOCK_PARTNER_DOCUMENTS → documents (expiresAt)
 *   - MOCK_PARTNER_INVOICES  → factures (issueDate / dueDate)
 *   - MOCK_PARTNER_VEHICLES  → maintenance (nextMaintenance, insuranceExpiry, inspectionExpiry)
 *   - MOCK_PARTNER_ALERTS    → alertes (expiresAt)
 *
 * IMPORTANT :
 *   - Aucune création/modification de données métier.
 *   - Aucune donnée parallèle persistante.
 *   - Lecture seule via PARTNER_COMPANY_ID.
 */

import {
  MOCK_PARTNER_MISSIONS,
  MOCK_PARTNER_REQUESTS,
  MOCK_PARTNER_DOCUMENTS,
  MOCK_PARTNER_INVOICES,
  MOCK_PARTNER_VEHICLES,
  MOCK_PARTNER_ALERTS,
} from '../mocks/partner.mock';
import { MOCK_PARTNER_CONTRACTS } from '../mocks/partnerContract.mock';
import { PARTNER_COMPANY_ID, PARTNER_PARTNER_ID } from '../constants/partner.constants';
import { ROUTES } from '@/routes/route.constants';

// ─── TYPES D'ÉVÉNEMENTS ─────────────────────────────────────────────

export const EVENT_TYPES = {
  MISSION: 'mission',
  REQUEST: 'request',
  CONTRACT: 'contract',
  DOCUMENT: 'document',
  INVOICE: 'invoice',
  MAINTENANCE: 'maintenance',
  ALERT: 'alert',
};

export const EVENT_TYPE_CONFIG = {
  [EVENT_TYPES.MISSION]: {
    label: 'Mission',
    icon: 'bi-signpost-split',
    color: '#3b82f6',
    bgClass: 'partner-calendar__event--mission',
  },
  [EVENT_TYPES.REQUEST]: {
    label: 'Demande',
    icon: 'bi-inbox',
    color: '#8b5cf6',
    bgClass: 'partner-calendar__event--request',
  },
  [EVENT_TYPES.CONTRACT]: {
    label: 'Contrat',
    icon: 'bi-file-earmark-text',
    color: '#06b6d4',
    bgClass: 'partner-calendar__event--contract',
  },
  [EVENT_TYPES.DOCUMENT]: {
    label: 'Document',
    icon: 'bi-folder2-open',
    color: '#f59e0b',
    bgClass: 'partner-calendar__event--document',
  },
  [EVENT_TYPES.INVOICE]: {
    label: 'Facture',
    icon: 'bi-receipt',
    color: '#10b981',
    bgClass: 'partner-calendar__event--invoice',
  },
  [EVENT_TYPES.MAINTENANCE]: {
    label: 'Maintenance',
    icon: 'bi-wrench',
    color: '#ef4444',
    bgClass: 'partner-calendar__event--maintenance',
  },
  [EVENT_TYPES.ALERT]: {
    label: 'Alerte',
    icon: 'bi-exclamation-triangle',
    color: '#f97316',
    bgClass: 'partner-calendar__event--alert',
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────

const toDayKey = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const STATUS_MAP = {
  pending: { label: 'En attente', variant: 'warning' },
  in_progress: { label: 'En cours', variant: 'primary' },
  completed: { label: 'Terminée', variant: 'success' },
  cancelled: { label: 'Annulée', variant: 'danger' },
  active: { label: 'Actif', variant: 'success' },
  expired: { label: 'Expiré', variant: 'danger' },
  paid: { label: 'Payée', variant: 'success' },
  overdue: { label: 'En retard', variant: 'danger' },
  draft: { label: 'Brouillon', variant: 'secondary' },
  accepted: { label: 'Acceptée', variant: 'success' },
  rejected: { label: 'Refusée', variant: 'danger' },
  reviewing: { label: 'En revue', variant: 'primary' },
};

const resolveStatus = (status) => STATUS_MAP[status] || { label: status, variant: 'secondary' };

// ─── AGRÉGATEUR ──────────────────────────────────────────────────────

/**
 * Récupère tous les événements calendrier pour une période donnée.
 * @param {Object} options
 * @param {string} options.from - YYYY-MM-DD début de période
 * @param {string} options.to   - YYYY-MM-DD fin de période
 * @param {string} options.type - filtre par type (tous si 'all')
 * @param {string} options.search - recherche textuelle
 * @returns {Promise<{ events: Array, summary: Object }>}
 */
export const getCalendarEvents = async ({
  from = '',
  to = '',
  type = 'all',
  search = '',
} = {}) => {
  await new Promise((r) => setTimeout(r, 200));

  const events = [];

  const inRange = (dayKey) => {
    if (!dayKey) return false;
    if (from && dayKey < from) return false;
    if (to && dayKey > to) return false;
    return true;
  };

  const matchesSearch = (text) => {
    if (!search.trim()) return true;
    if (!text) return false;
    return text.toLowerCase().includes(search.toLowerCase());
  };

  // ─── MISSIONS ───────────────────────────────────────────────────
  if (type === 'all' || type === EVENT_TYPES.MISSION) {
    MOCK_PARTNER_MISSIONS.forEach((m) => {
      const startKey = toDayKey(m.startDate);
      if (inRange(startKey) && matchesSearch(`${m.id} ${m.title || ''} ${m.client || ''} ${m.vehicle || ''}`)) {
        events.push({
          id: `cal-mis-${m.id}`,
          type: EVENT_TYPES.MISSION,
          title: m.title || `Mission ${m.id}`,
          description: m.description || '',
          start: startKey,
          end: toDayKey(m.endDate) || startKey,
          status: resolveStatus(m.status),
          priority: m.status === 'in_progress' ? 'high' : 'normal',
          source: 'missions',
          sourceId: m.id,
          sourcePath: ROUTES.PARTNER_MISSIONS + '/' + m.id,
          metadata: {
            clientName: m.client || '',
            vehicleName: m.vehicle || '',
            driverName: m.driver || '',
          },
          companyId: PARTNER_COMPANY_ID,
          partnerId: PARTNER_PARTNER_ID,
        });
      }
    });
  }

  // ─── DEMANDES ───────────────────────────────────────────────────
  if (type === 'all' || type === EVENT_TYPES.REQUEST) {
    MOCK_PARTNER_REQUESTS.forEach((r) => {
      const dayKey = toDayKey(r.scheduledDate);
      if (inRange(dayKey) && matchesSearch(`${r.id} ${r.subject || ''} ${r.clientName || ''}`)) {
        events.push({
          id: `cal-req-${r.id}`,
          type: EVENT_TYPES.REQUEST,
          title: r.subject || `Demande ${r.id}`,
          description: r.description || '',
          start: dayKey,
          end: dayKey,
          status: resolveStatus(r.status),
          priority: r.status === 'pending' ? 'high' : 'normal',
          source: 'requests',
          sourceId: r.id,
          sourcePath: ROUTES.PARTNER_REQUESTS + '/' + r.id,
          metadata: {
            clientName: r.clientName || '',
          },
          companyId: PARTNER_COMPANY_ID,
          partnerId: PARTNER_PARTNER_ID,
        });
      }
    });
  }

  // ─── CONTRATS ───────────────────────────────────────────────────
  if (type === 'all' || type === EVENT_TYPES.CONTRACT) {
    MOCK_PARTNER_CONTRACTS.forEach((c) => {
      const endKey = toDayKey(c.endDate);
      if (inRange(endKey) && matchesSearch(`${c.id} ${c.reference || ''} ${c.clientName || ''}`)) {
        events.push({
          id: `cal-ctr-${c.id}`,
          type: EVENT_TYPES.CONTRACT,
          title: c.title || c.reference || `Contrat ${c.id}`,
          description: `Expire le ${c.endDate}`,
          start: endKey,
          end: endKey,
          status: resolveStatus(c.status),
          priority: c.status === 'active' ? 'normal' : 'high',
          source: 'contracts',
          sourceId: c.id,
          sourcePath: ROUTES.PARTNER_CONTRACTS + '/' + c.id,
          metadata: {
            clientName: c.clientName || '',
            startDate: c.startDate || '',
            endDate: c.endDate || '',
          },
          companyId: PARTNER_COMPANY_ID,
          partnerId: PARTNER_PARTNER_ID,
        });
      }
    });
  }

  // ─── DOCUMENTS ──────────────────────────────────────────────────
  if (type === 'all' || type === EVENT_TYPES.DOCUMENT) {
    MOCK_PARTNER_DOCUMENTS.forEach((d) => {
      const dayKey = toDayKey(d.expiresAt);
      if (inRange(dayKey) && matchesSearch(`${d.id} ${d.name || ''} ${d.reference || ''}`)) {
        events.push({
          id: `cal-doc-${d.id}`,
          type: EVENT_TYPES.DOCUMENT,
          title: d.name || `Document ${d.id}`,
          description: `Expire le ${d.expiresAt ? new Date(d.expiresAt).toLocaleDateString('fr-FR') : '—'}`,
          start: dayKey,
          end: dayKey,
          status: resolveStatus(d.status),
          priority: d.status === 'expired' ? 'high' : 'normal',
          source: 'documents',
          sourceId: d.id,
          sourcePath: ROUTES.PARTNER_DOCUMENTS + '/' + d.id,
          metadata: {
            category: d.category || '',
          },
          companyId: PARTNER_COMPANY_ID,
          partnerId: PARTNER_PARTNER_ID,
        });
      }
    });
  }

  // ─── FACTURES ───────────────────────────────────────────────────
  if (type === 'all' || type === EVENT_TYPES.INVOICE) {
    MOCK_PARTNER_INVOICES.forEach((inv) => {
      const dayKey = toDayKey(inv.dueDate);
      if (inRange(dayKey) && matchesSearch(`${inv.id} ${inv.reference || ''} ${inv.clientName || ''}`)) {
        events.push({
          id: `cal-inv-${inv.id}`,
          type: EVENT_TYPES.INVOICE,
          title: inv.reference || `Facture ${inv.id}`,
          description: `Échéance le ${inv.dueDate}`,
          start: dayKey,
          end: dayKey,
          status: resolveStatus(inv.status),
          priority: inv.status === 'overdue' ? 'high' : 'normal',
          source: 'invoices',
          sourceId: inv.id,
          sourcePath: ROUTES.PARTNER_FINANCE_INVOICES + '/' + inv.id,
          metadata: {
            amount: inv.amount || inv.totalAmount || 0,
            clientName: inv.clientName || '',
          },
          companyId: PARTNER_COMPANY_ID,
          partnerId: PARTNER_PARTNER_ID,
        });
      }
    });
  }

  // ─── MAINTENANCE ────────────────────────────────────────────────
  if (type === 'all' || type === EVENT_TYPES.MAINTENANCE) {
    MOCK_PARTNER_VEHICLES.forEach((v) => {
      const nextKey = toDayKey(v.nextMaintenance);
      if (inRange(nextKey) && matchesSearch(`${v.id} ${v.registrationNumber || ''} ${v.brand || ''} ${v.model || ''}`)) {
        events.push({
          id: `cal-mnt-${v.id}-next`,
          type: EVENT_TYPES.MAINTENANCE,
          title: `Entretien ${v.brand || ''} ${v.model || ''}`.trim(),
          description: `Prochain entretien — ${v.registrationNumber || v.id}`,
          start: nextKey,
          end: nextKey,
          status: resolveStatus('pending'),
          priority: 'normal',
          source: 'vehicles',
          sourceId: v.id,
          sourcePath: ROUTES.PARTNER_VEHICLES,
          metadata: {
            registrationNumber: v.registrationNumber || '',
          },
          companyId: PARTNER_COMPANY_ID,
          partnerId: PARTNER_PARTNER_ID,
        });
      }

      const insKey = toDayKey(v.insuranceExpiry);
      if (inRange(insKey) && matchesSearch(`${v.id} ${v.registrationNumber || ''} assurance`)) {
        events.push({
          id: `cal-mnt-${v.id}-ins`,
          type: EVENT_TYPES.MAINTENANCE,
          title: `Assurance ${v.brand || ''} ${v.model || ''}`.trim(),
          description: `Expiration assurance — ${v.registrationNumber || v.id}`,
          start: insKey,
          end: insKey,
          status: resolveStatus('pending'),
          priority: 'normal',
          source: 'vehicles',
          sourceId: v.id,
          sourcePath: ROUTES.PARTNER_VEHICLES,
          metadata: {
            registrationNumber: v.registrationNumber || '',
          },
          companyId: PARTNER_COMPANY_ID,
          partnerId: PARTNER_PARTNER_ID,
        });
      }

      const inspKey = toDayKey(v.inspectionExpiry);
      if (inRange(inspKey) && matchesSearch(`${v.id} ${v.registrationNumber || ''} contrôle`)) {
        events.push({
          id: `cal-mnt-${v.id}-insp`,
          type: EVENT_TYPES.MAINTENANCE,
          title: `Contrôle technique ${v.brand || ''} ${v.model || ''}`.trim(),
          description: `Expiration contrôle technique — ${v.registrationNumber || v.id}`,
          start: inspKey,
          end: inspKey,
          status: resolveStatus('pending'),
          priority: 'normal',
          source: 'vehicles',
          sourceId: v.id,
          sourcePath: ROUTES.PARTNER_VEHICLES,
          metadata: {
            registrationNumber: v.registrationNumber || '',
          },
          companyId: PARTNER_COMPANY_ID,
          partnerId: PARTNER_PARTNER_ID,
        });
      }
    });
  }

  // ─── ALERTES ────────────────────────────────────────────────────
  if (type === 'all' || type === EVENT_TYPES.ALERT) {
    MOCK_PARTNER_ALERTS.forEach((a) => {
      const dayKey = toDayKey(a.expiresAt);
      if (inRange(dayKey) && matchesSearch(`${a.id} ${a.title || ''}`)) {
        events.push({
          id: `cal-alt-${a.id}`,
          type: EVENT_TYPES.ALERT,
          title: a.title || `Alerte ${a.id}`,
          description: a.message || '',
          start: dayKey,
          end: dayKey,
          status: resolveStatus(a.severity === 'critical' ? 'overdue' : a.severity === 'warning' ? 'pending' : 'draft'),
          priority: a.severity === 'critical' ? 'high' : 'normal',
          source: 'alerts',
          sourceId: a.id,
          sourcePath: ROUTES.PARTNER_ALERTS,
          metadata: {
            severity: a.severity || '',
          },
          companyId: PARTNER_COMPANY_ID,
          partnerId: PARTNER_PARTNER_ID,
        });
      }
    });
  }

  // Tri par date
  events.sort((a, b) => (a.start || '').localeCompare(b.start || ''));

  // Résumé
  const summary = {
    total: events.length,
    byType: Object.values(EVENT_TYPES).reduce((acc, t) => {
      acc[t] = events.filter((e) => e.type === t).length;
      return acc;
    }, {}),
  };

  return { events, summary };
};
