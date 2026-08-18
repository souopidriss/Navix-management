/**
 * Navix Client — Service Entretiens (Espace Client / Entreprise)
 * --------------------------------------------------------------------------
 * PROMPT 058 — Entretiens strictement isolés multi-tenant (companyId
 * Transports Express Cameroun). Les véhicules sont issus de la flotte client
 * (`clientVehicleService`). Les montants sont des DONNÉES DE COÛTS (FCFA /
 * XAF) — aucune transaction financière (wallet réservé au PROMPT 059).
 *
 * Règles :
 *   - numéro automatique MT-CLT-XXXX et identifiant dérivé ;
 *   - un entretien TERMINÉ ou ANNULÉ est verrouillé (409) ;
 *   - « en cours » (in_progress) immobilise le véhicule (cascade statut) ;
 *   - la clôture (complete) renseigne actualCost, completedAt et le prochain
 *     entretien (nextMaintenanceDate / nextMileage) ;
 *   - l'annulation est possible uniquement depuis un statut non final.
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { CLIENT_TYPES } from '../constants/client.constants';
import {
  MAINTENANCE_STATUSES,
  MAINTENANCE_FINISHED_STATUSES,
  isMaintenanceFinished,
} from '@/features/maintenance/constants';
import { MOCK_CLIENT_MAINTENANCE_RECORDS, nextMaintenanceNumber } from '../mocks/clientMaintenance.mock';
import { getVehiclesCache, setVehicleOperationalStatus } from './clientVehicleService';

const TEC_COMPANY_ID = '01J8A2B3C4D5E6F7G8H9J0K1L2';

const isEnterprise = (clientType) => clientType === CLIENT_TYPES.ENTERPRISE;

const inScope = (record) => record.companyId === TEC_COMPANY_ID;

const getVehicle = (id) => getVehiclesCache().find((vehicle) => vehicle.id === id) || null;

let maintenanceCache = null;
let maintenanceNumberCounter = Number(nextMaintenanceNumber);

const getMaintenanceCache = () => {
  if (!maintenanceCache) {
    maintenanceCache = MOCK_CLIENT_MAINTENANCE_RECORDS.map((record) => ({ ...record }));
  }
  return maintenanceCache;
};

export const getMaintenanceRecordsCache = () => getMaintenanceCache().map((record) => ({ ...record }));

const buildRecord = (payload) => {
  const now = new Date().toISOString();
  const record = {
    ...payload,
    id: `CLTMT-${String(maintenanceNumberCounter).padStart(4, '0')}`,
    maintenanceNumber: `MT-CLT-${String(maintenanceNumberCounter).padStart(4, '0')}`,
    currency: payload.currency || 'XAF',
    completedAt: payload.completedAt || '',
    createdBy: 'Direction Flotte TEC',
    createdAt: now,
    updatedAt: now,
  };

  if (record.status === 'in_progress' && !record.startedAt) {
    record.startedAt = now;
  }
  if (record.status === 'completed' && !record.completedAt) {
    record.completedAt = now;
  }

  return record;
};

const lockedError = () =>
  new ApiError({
    status: 409,
    code: 'MAINTENANCE_FINAL_LOCKED',
    message: 'Un entretien terminé ou annulé ne peut plus être modifié.',
  });

const applyVehicleImmobilization = (record, previousRecord) => {
  const vehicle = getVehicle(record.vehicleId);
  if (!vehicle) return;

  if (record.status === 'in_progress' && previousRecord?.status !== 'in_progress') {
    setVehicleOperationalStatus(record.vehicleId, 'maintenance');
  }

  if (isMaintenanceFinished(record) && previousRecord?.status === 'in_progress') {
    setVehicleOperationalStatus(record.vehicleId, 'available');
  }
};

export const clientMaintenanceService = {
  /**
   * Liste des entretiens du Client (isolés multi-tenant).
   * @param {string} [clientType]
   * @returns {Promise<Array<object>>}
   */
  async getAll(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse([], { latency: 300 });
    }
    return mockResponse(
      getMaintenanceCache()
        .filter(inScope)
        .map((record) => ({ ...record })),
      { latency: 400 },
    );
  },

  /**
   * Détail d'un entretien (404 hors portée / introuvable).
   * @param {string} id
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async getById(id, clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse(null, { error: ApiError.notFound('Entretien introuvable.') });
    }
    const record = getMaintenanceCache().find((item) => item.id === id && inScope(item));
    if (!record) {
      return mockResponse(null, { error: ApiError.notFound('Entretien introuvable.') });
    }
    return mockResponse({ ...record }, { latency: 350 });
  },

  /**
   * Création d'un entretien (statut initial `planned`).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    maintenanceNumberCounter += 1;
    const record = buildRecord(payload);
    getMaintenanceCache().unshift(record);
    return mockResponse({ ...record }, { latency: 400 });
  },

  /**
   * Mise à jour des métadonnées d'un entretien (verrouillé si final).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    const cache = getMaintenanceCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Entretien introuvable.') });
    }

    const current = cache[index];
    if (isMaintenanceFinished(current)) {
      return mockResponse(null, { error: lockedError() });
    }

    const now = new Date().toISOString();
    const updated = { ...current, ...payload, id, updatedAt: now };

    if (updated.status === 'in_progress' && !updated.startedAt) {
      updated.startedAt = now;
    }
    if (updated.status === 'completed' && !updated.completedAt) {
      updated.completedAt = now;
    }

    cache[index] = updated;
    applyVehicleImmobilization(updated, current);
    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Clôture d'un entretien (en cours / prévu → completed). Renvoie le
   * prochain entretien suggéré (nextMaintenanceDate / nextMileage).
   * @param {string} id
   * @param {object} payload — { actualCost, performedWork, replacedParts, completedAt, nextMaintenanceDate, nextMileage }
   * @returns {Promise<object>}
   */
  async complete(id, payload = {}) {
    const cache = getMaintenanceCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Entretien introuvable.') });
    }

    const current = cache[index];
    if (isMaintenanceFinished(current)) {
      return mockResponse(null, { error: lockedError() });
    }

    const now = new Date().toISOString();
    const updated = {
      ...current,
      ...payload,
      status: 'completed',
      actualCost: Number(payload.actualCost) || 0,
      performedWork: payload.performedWork || current.performedWork || '',
      replacedParts: payload.replacedParts || current.replacedParts || [],
      completedAt: payload.completedAt ? `${payload.completedAt}T00:00:00` : now,
      updatedAt: now,
    };

    cache[index] = updated;
    applyVehicleImmobilization(updated, current);
    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Annulation d'un entretien non final (→ cancelled).
   * @param {string} id
   * @param {object} [payload] — { reason }
   * @returns {Promise<object>}
   */
  async cancel(id, payload = {}) {
    const cache = getMaintenanceCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Entretien introuvable.') });
    }

    const current = cache[index];
    if (isMaintenanceFinished(current)) {
      return mockResponse(null, { error: lockedError() });
    }

    const now = new Date().toISOString();
    const updated = {
      ...current,
      status: 'cancelled',
      notes: payload.reason || current.notes || '',
      updatedAt: now,
    };

    cache[index] = updated;
    applyVehicleImmobilization(updated, current);
    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Suppression (logique dans le mock : retrait du cache). 404 si absent.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    const cache = getMaintenanceCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Entretien introuvable.') });
    }
    cache.splice(index, 1);
    return mockResponse({ id }, { latency: 350 });
  },

  /**
   * Synthèse des coûts et indicateurs (FCFA) — bornée à l'entreprise du
   * Client. Aucune donnée wallet : uniquement des coûts de maintenance.
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async statistics(clientType = CLIENT_TYPES.ENTERPRISE) {
    const records = isEnterprise(clientType)
      ? getMaintenanceCache().filter(inScope)
      : [];

    const sum = (items, field) => items.reduce((total, item) => total + Number(item[field] || 0), 0);
    const completed = records.filter((record) => record.status === 'completed');
    const monthKey = (value) => (value ? String(value).slice(0, 7) : '');
    const now = new Date();
    const currentMonth = monthKey(now.toISOString());

    const monthCost = sum(
      completed.filter((record) => monthKey(record.completedAt) === currentMonth),
      'actualCost',
    );
    const totalPlannedCost = sum(
      records.filter((record) => !MAINTENANCE_FINISHED_STATUSES.includes(record.status)),
      'estimatedCost',
    );

    const statusDistribution = Object.keys(MAINTENANCE_STATUSES).map((status) => ({
      status,
      count: records.filter((record) => record.status === status).length,
    }));

    const typeCounts = records.reduce((groups, record) => {
      groups[record.maintenanceType] = (groups[record.maintenanceType] || 0) + 1;
      return groups;
    }, {});

    return mockResponse(
      {
        totalCount: records.length,
        completedCount: completed.length,
        inProgressCount: records.filter((record) => record.status === 'in_progress').length,
        plannedCount: records.filter((record) => record.status === 'planned').length,
        pendingCount: records.filter((record) => record.status === 'pending').length,
        cancelledCount: records.filter((record) => record.status === 'cancelled').length,
        monthCost,
        totalPlannedCost,
        totalActualCost: sum(completed, 'actualCost'),
        statusDistribution,
        typeCounts,
        vehiclesInMaintenance: records.filter((record) => record.status === 'in_progress').length,
      },
      { latency: 350 },
    );
  },
};

export { MAINTENANCE_STATUSES };
