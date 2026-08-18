/**
 * Navix Partner Portal — Service Alertes & Échéances (PROMPT 075)
 * ────────────────────────────────────────────────────────────────
 * Gestion des alertes, notifications d'échéances et suivi des délais.
 * Multi-tenant strict : lecture/seulement PARTNER_COMPANY_ID.
 *
 * Sources de données :
 *   - MOCK_PARTNER_ALERTS (alertes prédéfinies)
 *   - MOCK_PARTNER_DOCUMENTS (échéances documents)
 *   - MOCK_PARTNER_CONTRACTS (échéances contrats)
 *   - MOCK_PARTNER_INVOICES (factures en retard)
 *   - MOCK_PARTNER_VEHICLES (maintenance véhicules)
 *   - MOCK_PARTNER_MISSIONS (missions en retard)
 *   - MOCK_PARTNER_REQUESTS (demandes en attente)
 */

import { useAuthStore } from '@/features/auth/store';
import {
  MOCK_PARTNER_ALERTS,
  MOCK_PARTNER_DOCUMENTS,
  MOCK_PARTNER_INVOICES,
  MOCK_PARTNER_VEHICLES,
  MOCK_PARTNER_MISSIONS,
  MOCK_PARTNER_REQUESTS,
} from '../mocks/partner.mock';
import { MOCK_PARTNER_CONTRACTS } from '../mocks/partnerContract.mock';
import { PARTNER_COMPANY_ID, PARTNER_PARTNER_ID } from '../constants/partner.constants';

const assertPartnerRole = () => {
  const state = useAuthStore.getState();
  if (state.currentRole !== 'partner' && state.currentRole !== 'super_admin') {
    throw new Error('Accès réservé au rôle Partenaire');
  }
};

const simulateDelay = () => new Promise((r) => setTimeout(r, 250));

const today = () => new Date().toISOString().split('T')[0];

const getDaysLeft = (dateStr) => {
  if (!dateStr) return null;
  const now = new Date(today());
  const target = new Date(dateStr);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
};

const getExpiryStatus = (dateStr) => {
  const days = getDaysLeft(dateStr);
  if (days === null) return 'unknown';
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  return 'valid';
};

const getExpiryLabel = (dateStr) => {
  const days = getDaysLeft(dateStr);
  if (days === null) return '—';
  if (days < 0) return `Expiré il y a ${Math.abs(days)} j`;
  if (days === 0) return "Expire aujourd'hui";
  if (days === 1) return 'Expire demain';
  return `Expire dans ${days} j`;
};

// ─── GENERATION DYNAMIQUE DES ALERTES ────────────────────────────────

/**
 * Génère des alertes à partir des documents du partenaire.
 */
const generateDocumentAlerts = () => {
  const alerts = [];
  const now = new Date(today());
  const scopedDocs = MOCK_PARTNER_DOCUMENTS.filter(
    (d) => (!d.companyId || d.companyId === PARTNER_COMPANY_ID) && (!d.partnerId || d.partnerId === PARTNER_PARTNER_ID)
  );

  scopedDocs.forEach((doc) => {
    if (!doc.expiresAt) return;
    const expiryDate = new Date(doc.expiresAt);
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0 && doc.status !== 'valid') {
      alerts.push({
        id: `ALT-DOC-${doc.id}`,
        type: 'document_expired',
        severity: 'critical',
        title: 'Document expiré',
        message: `${doc.name} (${doc.reference || doc.fileType}) : expiré le ${new Date(doc.expiresAt).toLocaleDateString('fr-FR')}.`,
        entityType: 'document',
        entityId: doc.id,
        entityLabel: doc.name,
        status: 'pending',
        createdAt: doc.expiresAt,
        expiresAt: doc.expiresAt,
        actionRequired: true,
      });
    } else if (daysLeft >= 0 && daysLeft <= 30) {
      alerts.push({
        id: `ALT-DOC-${doc.id}`,
        type: 'document_expiring',
        severity: daysLeft <= 7 ? 'critical' : 'warning',
        title: 'Document expirant bientôt',
        message: `${doc.name} (${doc.reference || doc.fileType}) : expire le ${new Date(doc.expiresAt).toLocaleDateString('fr-FR')} (${daysLeft} jour${daysLeft > 1 ? 's' : ''}).`,
        entityType: 'document',
        entityId: doc.id,
        entityLabel: doc.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: doc.expiresAt,
        actionRequired: daysLeft <= 7,
      });
    }
  });

  return alerts;
};

/**
 * Génère des alertes à partir des contrats du partenaire.
 */
const generateContractAlerts = () => {
  const alerts = [];
  const now = new Date(today());
  const scopedContracts = MOCK_PARTNER_CONTRACTS.filter(
    (c) => (!c.companyId || c.companyId === PARTNER_COMPANY_ID) && (!c.partnerId || c.partnerId === PARTNER_PARTNER_ID)
  );

  scopedContracts.forEach((contract) => {
    if (!contract.endDate) return;
    const expiryDate = new Date(contract.endDate);
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0 && contract.status !== 'active') {
      alerts.push({
        id: `ALT-CTR-${contract.id}`,
        type: 'contract_expired',
        severity: 'critical',
        title: 'Contrat expiré',
        message: `${contract.reference} — ${contract.title || contract.clientName} : contrat expiré le ${new Date(contract.endDate).toLocaleDateString('fr-FR')}.`,
        entityType: 'contract',
        entityId: contract.id,
        entityLabel: contract.reference,
        status: 'pending',
        createdAt: contract.endDate,
        expiresAt: contract.endDate,
        actionRequired: true,
      });
    } else if (daysLeft >= 0 && daysLeft <= 30) {
      alerts.push({
        id: `ALT-CTR-${contract.id}`,
        type: 'contract_expiring',
        severity: daysLeft <= 7 ? 'critical' : 'warning',
        title: 'Contrat expirant bientôt',
        message: `${contract.reference} — ${contract.title || contract.clientName} : expire le ${new Date(contract.endDate).toLocaleDateString('fr-FR')} (${daysLeft} jour${daysLeft > 1 ? 's' : ''}).`,
        entityType: 'contract',
        entityId: contract.id,
        entityLabel: contract.reference,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: contract.endDate,
        actionRequired: daysLeft <= 7,
      });
    }

    if (contract.status === 'pending') {
      alerts.push({
        id: `ALT-CTR-PEND-${contract.id}`,
        type: 'contract_pending',
        severity: 'info',
        title: 'Contrat en attente',
        message: `${contract.reference} — ${contract.title || contract.clientName} : en attente de signature.`,
        entityType: 'contract',
        entityId: contract.id,
        entityLabel: contract.reference,
        status: 'pending',
        createdAt: contract.createdAt || new Date().toISOString(),
        expiresAt: null,
        actionRequired: false,
      });
    }
  });

  return alerts;
};

/**
 * Génère des alertes à partir des factures du partenaire.
 */
const generateInvoiceAlerts = () => {
  const alerts = [];
  const now = new Date(today());
  const scopedInvoices = MOCK_PARTNER_INVOICES.filter(
    (inv) => (!inv.companyId || inv.companyId === PARTNER_COMPANY_ID) && (!inv.partnerId || inv.partnerId === PARTNER_PARTNER_ID)
  );

  scopedInvoices.forEach((invoice) => {
    if (!invoice.dueDate) return;
    const dueDate = new Date(invoice.dueDate);
    const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0 && invoice.status !== 'paid') {
      alerts.push({
        id: `ALT-INV-${invoice.id}`,
        type: 'invoice_overdue',
        severity: 'critical',
        title: 'Facture en retard',
        message: `${invoice.reference} — ${formatAmount(invoice.amount || invoice.totalAmount)} : échéance dépassée depuis ${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? 's' : ''}.`,
        entityType: 'invoice',
        entityId: invoice.id,
        entityLabel: invoice.reference,
        status: 'pending',
        createdAt: invoice.dueDate,
        expiresAt: invoice.dueDate,
        actionRequired: true,
      });
    } else if (daysLeft >= 0 && daysLeft <= 7 && invoice.status !== 'paid') {
      alerts.push({
        id: `ALT-INV-EXP-${invoice.id}`,
        type: 'invoice_expiring',
        severity: 'warning',
        title: 'Facture à échéance proche',
        message: `${invoice.reference} — ${formatAmount(invoice.amount || invoice.totalAmount)} : échéance le ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')} (${daysLeft} jour${daysLeft > 1 ? 's' : ''}).`,
        entityType: 'invoice',
        entityId: invoice.id,
        entityLabel: invoice.reference,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: invoice.dueDate,
        actionRequired: true,
      });
    }
  });

  return alerts;
};

/**
 * Génère des alertes à partir des véhicules du partenaire.
 */
const generateVehicleAlerts = () => {
  const alerts = [];
  const scopedVehicles = MOCK_PARTNER_VEHICLES.filter(
    (v) => (!v.companyId || v.companyId === PARTNER_COMPANY_ID) && (!v.partnerId || v.partnerId === PARTNER_PARTNER_ID)
  );

  scopedVehicles.forEach((vehicle) => {
    const plate = vehicle.registrationNumber || vehicle.plateNumber || '';
    if (vehicle.status === 'maintenance') {
      alerts.push({
        id: `ALT-VH-MNT-${vehicle.id}`,
        type: 'maintenance_urgent',
        severity: 'critical',
        title: 'Véhicule en maintenance',
        message: `${plate} — ${vehicle.brand} ${vehicle.model} : en maintenance. Véhicule indisponible.`,
        entityType: 'vehicle',
        entityId: vehicle.id,
        entityLabel: `${plate} — ${vehicle.brand} ${vehicle.model}`,
        status: 'pending',
        createdAt: vehicle.updatedAt || new Date().toISOString(),
        expiresAt: null,
        actionRequired: true,
      });
    }

    if (vehicle.insuranceExpiry) {
      const daysLeft = getDaysLeft(vehicle.insuranceExpiry);
      if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 30) {
        alerts.push({
          id: `ALT-VH-INS-${vehicle.id}`,
          type: 'document_expiring',
          severity: daysLeft <= 7 ? 'critical' : 'warning',
          title: 'Assurance expirant bientôt',
          message: `${plate} — ${vehicle.brand} ${vehicle.model} : assurance expire le ${new Date(vehicle.insuranceExpiry).toLocaleDateString('fr-FR')} (${daysLeft} jour${daysLeft > 1 ? 's' : ''}).`,
          entityType: 'vehicle',
          entityId: vehicle.id,
          entityLabel: `${plate} — ${vehicle.brand} ${vehicle.model}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: vehicle.insuranceExpiry,
          actionRequired: daysLeft <= 7,
        });
      }
    }

    if (vehicle.inspectionExpiry) {
      const daysLeft = getDaysLeft(vehicle.inspectionExpiry);
      if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 30) {
        alerts.push({
          id: `ALT-VH-INS2-${vehicle.id}`,
          type: 'document_expiring',
          severity: daysLeft <= 7 ? 'critical' : 'warning',
          title: 'Contrôle technique expirant',
          message: `${plate} — ${vehicle.brand} ${vehicle.model} : contrôle technique expire le ${new Date(vehicle.inspectionExpiry).toLocaleDateString('fr-FR')} (${daysLeft} jour${daysLeft > 1 ? 's' : ''}).`,
          entityType: 'vehicle',
          entityId: vehicle.id,
          entityLabel: `${plate} — ${vehicle.brand} ${vehicle.model}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: vehicle.inspectionExpiry,
          actionRequired: daysLeft <= 7,
        });
      }
    }
  });

  return alerts;
};

/**
 * Génère des alertes à partir des missions du partenaire.
 */
const generateMissionAlerts = () => {
  const alerts = [];
  const scopedMissions = MOCK_PARTNER_MISSIONS.filter(
    (m) => (!m.companyId || m.companyId === PARTNER_COMPANY_ID) && (!m.partnerId || m.partnerId === PARTNER_PARTNER_ID)
  );

  scopedMissions.forEach((mission) => {
    if (mission.status === 'cancelled') {
      alerts.push({
        id: `ALT-MSN-CANC-${mission.id}`,
        type: 'mission_cancelled',
        severity: 'warning',
        title: 'Mission annulée',
        message: `${mission.id} — ${mission.title || mission.description} : mission annulée.`,
        entityType: 'mission',
        entityId: mission.id,
        entityLabel: mission.id,
        status: 'pending',
        createdAt: mission.updatedAt || new Date().toISOString(),
        expiresAt: null,
        actionRequired: false,
      });
    }

    if (mission.status === 'in_progress' && mission.endDate) {
      const daysLeft = getDaysLeft(mission.endDate);
      if (daysLeft !== null && daysLeft < 0) {
        alerts.push({
          id: `ALT-MSN-DEL-${mission.id}`,
          type: 'mission_delayed',
          severity: 'critical',
          title: 'Mission en retard',
          message: `${mission.id} — ${mission.title || mission.description} : date de livraison dépassée depuis ${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? 's' : ''}.`,
          entityType: 'mission',
          entityId: mission.id,
          entityLabel: mission.id,
          status: 'pending',
          createdAt: mission.endDate,
          expiresAt: mission.endDate,
          actionRequired: true,
        });
      } else if (daysLeft !== null && daysLeft === 0) {
        alerts.push({
          id: `ALT-MSN-TODAY-${mission.id}`,
          type: 'mission_delayed',
          severity: 'warning',
          title: 'Mission à livrer aujourd\'hui',
          message: `${mission.id} — ${mission.title || mission.description} : livraison prévue aujourd'hui.`,
          entityType: 'mission',
          entityId: mission.id,
          entityLabel: mission.id,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: mission.endDate,
          actionRequired: false,
        });
      }
    }
  });

  return alerts;
};

/**
 * Génère des alertes à partir des demandes du partenaire.
 */
const generateRequestAlerts = () => {
  const alerts = [];
  const scopedRequests = MOCK_PARTNER_REQUESTS.filter(
    (r) => (!r.companyId || r.companyId === PARTNER_COMPANY_ID) && (!r.partnerId || r.partnerId === PARTNER_PARTNER_ID)
  );

  scopedRequests.forEach((request) => {
    if (request.status === 'pending') {
      alerts.push({
        id: `ALT-REQ-PEND-${request.id}`,
        type: 'request_pending',
        severity: 'info',
        title: 'Demande en attente',
        message: `${request.reference || request.id} — ${request.title || request.description} : en attente de traitement.`,
        entityType: 'request',
        entityId: request.id,
        entityLabel: request.reference || request.id,
        status: 'pending',
        createdAt: request.createdAt || new Date().toISOString(),
        expiresAt: null,
        actionRequired: false,
      });
    }
  });

  return alerts;
};

const formatAmount = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

// ─── READ ────────────────────────────────────────────────────────────

/**
 * Récupère toutes les alertes du partenaire.
 * Fusionne les alertes statiques (MOCK_PARTNER_ALERTS) avec les alertes
 * générées dynamiquement à partir des données existantes.
 */
export const getAlerts = async ({
  search = '',
  severity = 'all',
  status = 'all',
  type = 'all',
  sortBy = 'createdAt',
  sortDirection = 'desc',
  page = 1,
  pageSize = 10,
} = {}) => {
  await simulateDelay();
  assertPartnerRole();

  // Fusionner alertes statiques + dynamiques
  const inScope = (a) =>
    (!a.companyId || a.companyId === PARTNER_COMPANY_ID) &&
    (!a.partnerId || a.partnerId === PARTNER_PARTNER_ID);
  const staticAlerts = MOCK_PARTNER_ALERTS.filter(inScope);

  const dynamicAlerts = [
    ...generateDocumentAlerts(),
    ...generateContractAlerts(),
    ...generateInvoiceAlerts(),
    ...generateVehicleAlerts(),
    ...generateMissionAlerts(),
    ...generateRequestAlerts(),
  ];

  // Éviter les doublons (par id)
  const seen = new Set(staticAlerts.map((a) => a.id));
  const allAlerts = [...staticAlerts];
  dynamicAlerts.forEach((a) => {
    if (!seen.has(a.id)) {
      allAlerts.push(a);
      seen.add(a.id);
    }
  });

  // Filtres
  let filtered = [...allAlerts];

  if (severity !== 'all') {
    filtered = filtered.filter((a) => a.severity === severity);
  }
  if (status !== 'all') {
    filtered = filtered.filter((a) => a.status === status);
  }
  if (type !== 'all') {
    filtered = filtered.filter((a) => a.type === type);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.message?.toLowerCase().includes(q) ||
        a.entityLabel?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q)
    );
  }

  // Tri
  filtered.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (sortBy === 'createdAt' || sortBy === 'expiresAt') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }
    if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  return {
    data: paginated,
    total,
    totalPages,
    page,
    pageSize,
  };
};

/**
 * Récupère une alerte par son ID.
 */
export const getAlertById = async (alertId) => {
  await simulateDelay();
  assertPartnerRole();

  const allAlerts = [...MOCK_PARTNER_ALERTS, ...generateDocumentAlerts(), ...generateContractAlerts(), ...generateInvoiceAlerts(), ...generateVehicleAlerts(), ...generateMissionAlerts(), ...generateRequestAlerts()];
  const alert = allAlerts.find((a) => a.id === alertId);
  if (!alert) throw new Error('Alerte introuvable');
  return { ...alert };
};

/**
 * Statistiques des alertes (KPI).
 */
export const getAlertStats = async () => {
  await simulateDelay();
  assertPartnerRole();

  const allAlerts = [...MOCK_PARTNER_ALERTS, ...generateDocumentAlerts(), ...generateContractAlerts(), ...generateInvoiceAlerts(), ...generateVehicleAlerts(), ...generateMissionAlerts(), ...generateRequestAlerts()];

  const total = allAlerts.length;
  const critical = allAlerts.filter((a) => a.severity === 'critical').length;
  const warning = allAlerts.filter((a) => a.severity === 'warning').length;
  const info = allAlerts.filter((a) => a.severity === 'info').length;
  const pending = allAlerts.filter((a) => a.status === 'pending').length;
  const acknowledged = allAlerts.filter((a) => a.status === 'acknowledged').length;
  const resolved = allAlerts.filter((a) => a.status === 'resolved').length;
  const actionRequired = allAlerts.filter((a) => a.actionRequired).length;

  const byType = {};
  allAlerts.forEach((a) => {
    byType[a.type] = (byType[a.type] || 0) + 1;
  });

  return {
    total,
    critical,
    warning,
    info,
    pending,
    acknowledged,
    resolved,
    actionRequired,
    byType,
  };
};

// ─── UPDATE ───────────────────────────────────────────────────────────

/**
 * Met à jour le statut d'une alerte.
 */
export const updateAlertStatus = async (alertId, newStatus) => {
  await simulateDelay();
  assertPartnerRole();

  const validStatuses = ['pending', 'acknowledged', 'resolved', 'dismissed'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Statut invalide : ${newStatus}`);
  }

  const alert = MOCK_PARTNER_ALERTS.find((a) => a.id === alertId);
  if (alert) {
    alert.status = newStatus;
  }

  return { success: true, alertId, status: newStatus };
};

/**
 * Marque toutes les alertes comme lues (acknowledged).
 */
export const acknowledgeAllAlerts = async () => {
  await simulateDelay();
  assertPartnerRole();

  MOCK_PARTNER_ALERTS.forEach((a) => {
    if (a.status === 'pending') {
      a.status = 'acknowledged';
    }
  });

  return { success: true, acknowledged: MOCK_PARTNER_ALERTS.filter((a) => a.status === 'acknowledged').length };
};

// ─── EXPORTS UTILITAIRES ─────────────────────────────────────────────

export { getDaysLeft, getExpiryStatus, getExpiryLabel, formatAmount };
