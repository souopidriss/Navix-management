/**
 * Navix Client — Service Carburant (Espace Client / Entreprise)
 * --------------------------------------------------------------------------
 * PROMPT 058 — Pleins de carburant strictement isolés multi-tenant
 * (companyId Transports Express Cameroun). Les véhicules / chauffeurs /
 * trajets sont issus des modules Client (flotte, opérations). Les montants
 * (`totalCost`) sont des DONNÉES DE COÛTS (FCFA / XAF) — aucune transaction
 * financière (wallet réservé au PROMPT 059).
 *
 * Règles :
 *   - le montant total est calculé automatiquement (quantité × prix unitaire) ;
 *   - la consommation moyenne est calculée depuis le dernier plein du véhicule ;
 *   - le kilométrage d'un nouveau plein doit être supérieur au dernier plein
 *     connu du véhicule (409 sinon) ;
 *   - un plein VALIDÉ ou ANNULÉ ne peut plus être modifié (409).
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { CLIENT_TYPES } from '../constants/client.constants';
import { FUEL_STATUSES, isAbnormalFuelConsumption } from '@/features/fuel/constants';
import { MOCK_CLIENT_FUEL_RECORDS, nextFuelNumber } from '../mocks/clientFuel.mock';
import { getVehiclesCache } from './clientVehicleService';

const TEC_COMPANY_ID = '01J8A2B3C4D5E6F7G8H9J0K1L2';

const isEnterprise = (clientType) => clientType === CLIENT_TYPES.ENTERPRISE;

const inScope = (record) => record.companyId === TEC_COMPANY_ID;

const getVehicle = (id) => getVehiclesCache().find((vehicle) => vehicle.id === id) || null;

let fuelCache = null;
let fuelNumberCounter = Number(nextFuelNumber);

const getFuelCache = () => {
  if (!fuelCache) {
    fuelCache = MOCK_CLIENT_FUEL_RECORDS.map((record) => ({ ...record }));
  }
  return fuelCache;
};

export const getFuelRecordsCache = () => getFuelCache().map((record) => ({ ...record }));

const roundTo = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
};

/** Dernier plein connu d'un véhicule (avant le plein courant, si exclusion). */
const findLastRecord = (vehicleId, excludeId = '') =>
  getFuelCache()
    .filter((item) => item.vehicleId === vehicleId && item.id !== excludeId && item.status !== 'cancelled')
    .sort((a, b) => String(b.fuelDate).localeCompare(String(a.fuelDate)))[0] || null;

/** Vérifie la règle « kilométrage croissant » entre pleins d'un même véhicule. */
const findMileageError = (vehicleId, mileage, excludeId = '') => {
  const last = findLastRecord(vehicleId, excludeId);
  if (last && Number(mileage) <= Number(last.mileage)) {
    return new ApiError({
      status: 409,
      code: 'FUEL_MILEAGE_CONFLICT',
      message: `Le kilométrage doit être supérieur au dernier plein connu de ce véhicule (${last.mileage} km).`,
    });
  }
  return null;
};

/** Consommation moyenne (L/100 km) depuis le dernier plein du véhicule. */
const computeConsumption = (record, excludeId = '') => {
  const last = findLastRecord(record.vehicleId, excludeId);
  const distance = last ? Number(record.mileage) - Number(last.mileage) : 0;

  if (!Number.isFinite(distance) || distance <= 0 || Number(record.quantity) <= 0) {
    return 0;
  }
  return roundTo((Number(record.quantity) / distance) * 100, 1);
};

const monthKey = (value) => (value ? String(value).slice(0, 7) : '');

const monthLabel = (key) => {
  const [year, month] = String(key).split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('fr-FR', { month: 'short' });
};

const lastMonths = (from = new Date(), count = 6) => {
  const months = [];
  const cursor = new Date(from.getFullYear(), from.getMonth() + 1, 1);
  for (let index = 0; index < count; index += 1) {
    cursor.setMonth(cursor.getMonth() - 1);
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
  }
  return months.reverse();
};

const buildRecord = (payload) => {
  fuelNumberCounter += 1;
  const now = new Date().toISOString();
  const quantity = Number(payload.quantity) || 0;
  const unitPrice = Number(payload.unitPrice) || 0;
  const record = {
    ...payload,
    id: `CLTFU-${String(fuelNumberCounter).padStart(4, '0')}`,
    fuelNumber: `FU-CLT-${String(fuelNumberCounter).padStart(4, '0')}`,
    companyId: TEC_COMPANY_ID,
    totalCost: roundTo(quantity * unitPrice, 0),
    consumptionAverage: 0,
    status: payload.status || 'pending',
    currency: payload.currency || 'XAF',
    createdAt: now,
    updatedAt: now,
  };
  record.consumptionAverage = computeConsumption(record);
  return record;
};

const lockedError = () =>
  new ApiError({
    status: 409,
    code: 'FUEL_FINAL_LOCKED',
    message: 'Un plein validé ou annulé ne peut plus être modifié.',
  });

export const clientFuelService = {
  /**
   * Liste des pleins du Client (isolés multi-tenant).
   * @param {string} [clientType]
   * @returns {Promise<Array<object>>}
   */
  async getAll(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse([], { latency: 300 });
    }
    return mockResponse(
      getFuelCache()
        .filter(inScope)
        .map((record) => ({ ...record })),
      { latency: 400 },
    );
  },

  /**
   * Détail d'un plein (404 hors portée / introuvable).
   * @param {string} id
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async getById(id, clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse(null, { error: ApiError.notFound('Plein introuvable.') });
    }
    const record = getFuelCache().find((item) => item.id === id && inScope(item));
    if (!record) {
      return mockResponse(null, { error: ApiError.notFound('Plein introuvable.') });
    }
    return mockResponse({ ...record }, { latency: 350 });
  },

  /**
   * Enregistrement d'un plein (montant et consommation calculés, contrôle
   * du kilométrage). Statut initial : `pending`.
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    const mileageError = findMileageError(payload.vehicleId, payload.mileage);
    if (mileageError) {
      return mockResponse(null, { error: mileageError });
    }
    const record = buildRecord(payload);
    getFuelCache().unshift(record);
    return mockResponse({ ...record }, { latency: 400 });
  },

  /**
   * Validation d'un plein (pending → validated).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async validate(id) {
    return this.update(id, { status: 'validated' });
  },

  /**
   * Mise à jour d'un plein (verrouillé si validé ou annulé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    const cache = getFuelCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Plein introuvable.') });
    }

    const current = cache[index];
    if (current.status === 'validated' || current.status === 'cancelled') {
      return mockResponse(null, { error: lockedError() });
    }

    const mileage = Number(payload.mileage) || current.mileage || 0;
    const mileageError = findMileageError(current.vehicleId, mileage, id);
    if (mileageError) {
      return mockResponse(null, { error: mileageError });
    }

    const quantity = Number(payload.quantity) || current.quantity || 0;
    const unitPrice = Number(payload.unitPrice) || current.unitPrice || 0;
    const now = new Date().toISOString();
    const updated = {
      ...current,
      ...payload,
      id,
      mileage,
      totalCost: roundTo(quantity * unitPrice, 0),
      updatedAt: now,
    };
    updated.consumptionAverage = computeConsumption(updated, id);

    cache[index] = updated;
    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Annulation d'un plein non final (→ cancelled).
   * @param {string} id
   * @param {object} [payload] — { reason }
   * @returns {Promise<object>}
   */
  async cancel(id, payload = {}) {
    const cache = getFuelCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Plein introuvable.') });
    }

    const current = cache[index];
    if (current.status === 'validated' || current.status === 'cancelled') {
      return mockResponse(null, { error: lockedError() });
    }

    const updated = {
      ...current,
      status: 'cancelled',
      notes: payload.reason || current.notes || '',
      updatedAt: new Date().toISOString(),
    };
    cache[index] = updated;
    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Suppression (logique dans le mock : retrait du cache). 404 si absent.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    const cache = getFuelCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Plein introuvable.') });
    }
    cache.splice(index, 1);
    return mockResponse({ id }, { latency: 350 });
  },

  /**
   * Statistiques carburant (coûts FCFA + évolution mensuelle pour le
   * graphique). Aucune donnée wallet : uniquement des coûts.
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async statistics(clientType = CLIENT_TYPES.ENTERPRISE) {
    const records = isEnterprise(clientType)
      ? getFuelCache().filter(inScope)
      : [];

    const sum = (items, field) => items.reduce((total, item) => total + Number(item[field] || 0), 0);
    const validated = records.filter((record) => record.status === 'validated');
    const now = new Date();
    const currentMonth = monthKey(now.toISOString());

    const monthCost = sum(
      validated.filter((record) => monthKey(record.createdAt) === currentMonth),
      'totalCost',
    );

    const monthlyEvolution = lastMonths(now, 6).map((month) => {
      const items = validated.filter((record) => monthKey(record.createdAt) === month);
      return {
        month,
        label: monthLabel(month),
        totalCost: roundTo(sum(items, 'totalCost'), 0),
        quantity: roundTo(sum(items, 'quantity'), 0),
      };
    });

    const statusDistribution = Object.keys(FUEL_STATUSES).map((status) => ({
      status,
      count: records.filter((record) => record.status === status).length,
    }));

    const typeDistribution = records.reduce((groups, record) => {
      groups[record.fuelType] = (groups[record.fuelType] || 0) + 1;
      return groups;
    }, {});

    const abnormal = validated.filter((record) =>
      isAbnormalFuelConsumption(record.consumptionAverage, getVehicle(record.vehicleId)?.category),
    );

    return mockResponse(
      {
        totalCount: records.length,
        validatedCount: validated.length,
        pendingCount: records.filter((record) => record.status === 'pending').length,
        cancelledCount: records.filter((record) => record.status === 'cancelled').length,
        totalQuantity: roundTo(sum(validated, 'quantity'), 0),
        monthCost,
        totalCost: sum(validated, 'totalCost'),
        averageCost: validated.length ? roundTo(sum(validated, 'totalCost') / validated.length, 0) : 0,
        abnormalCount: abnormal.length,
        statusDistribution,
        typeDistribution,
        monthlyEvolution,
      },
      { latency: 350 },
    );
  },
};

export { FUEL_STATUSES };
