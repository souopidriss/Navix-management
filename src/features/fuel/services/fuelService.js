/**
 * Navix Fuel — FuelService
 * --------------------------------------------------------------------------
 * Description : gestion complète de la consommation de carburant, mock
 * uniquement.
 * Responsabilité : fournir les données de carburant aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()        → liste de tous les pleins
 *   getById(id)     → détail d'un plein (404 si absent)
 *   create(payload) → création (n° auto, calculs automatiques, contrôle km)
 *   update(id, …)   → mise à jour (404/409, plein validé/annulé verrouillé)
 *   delete(id)      → suppression (404 si absent)
 *   statistics()    → statistiques (coût du mois, top 5, anomalies, évolution)
 *
 * Règles métier simulées :
 *   - le montant total est calculé automatiquement (quantité × prix unitaire)
 *   - la consommation moyenne est calculée automatiquement (distance depuis
 *     le dernier plein du même véhicule)
 *   - le kilométrage d'un nouveau plein doit être supérieur au dernier plein
 *     connu du véhicule (409 sinon)
 *   - un plein VALIDÉ ou ANNULÉ ne peut plus être modifié (409 sinon)
 *
 * Exemple d'utilisation :
 *   import { fuelService } from '../services';
 *   const records = await fuelService.getAll();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_FUEL_RECORDS, nextFuelNumber } from '../mocks';
import { MOCK_VEHICLES } from '@/features/vehicles/mocks';
import { DEFAULT_CURRENCY, isAbnormalFuelConsumption } from '../constants';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Génère un identifiant ULID plausible (horodatage + aléa Crockford). */
const generateUlid = () => {
  const time = Date.now().toString(36).toUpperCase().padStart(10, '0').slice(0, 10);
  let random = '';
  for (let i = 0; i < 16; i += 1) {
    random += CROCKFORD[Math.floor(Math.random() * CROCKFORD.length)];
  }
  return `${time}${random}`;
};

const getVehicle = (id) => MOCK_VEHICLES.find((vehicle) => vehicle.id === id) || null;

let fuelCache = null;
let fuelNumberCounter = Number(nextFuelNumber);

const getFuelCache = () => {
  if (!fuelCache) {
    fuelCache = MOCK_FUEL_RECORDS.map((record) => ({ ...record }));
  }
  return fuelCache;
};

const roundTo = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
};

/** Dernier plein connu d'un véhicule (avant le plein courant, si exclusion). */
const findLastRecord = (vehicleId, excludeId = '') =>
  getFuelCache()
    .filter((item) => item.vehicleId === vehicleId && item.id !== excludeId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;

/**
 * Vérifie que le kilométrage du plein est supérieur au dernier plein connu du
 * véhicule (règle métier « kilométrage croissant »).
 */
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

/**
 * Calcule la consommation moyenne (L/100 km) d'un plein à partir de la
 * distance parcourue depuis le dernier plein du même véhicule. Retourne 0 si
 * la distance est inconnue ou nulle (ex. véhicule électrique).
 */
const computeConsumption = (record, excludeId = '') => {
  const last = findLastRecord(record.vehicleId, excludeId);
  const distance = last ? Number(record.mileage) - Number(last.mileage) : 0;

  if (!Number.isFinite(distance) || distance <= 0 || Number(record.quantity) <= 0) {
    return 0;
  }

  return roundTo((Number(record.quantity) / distance) * 100, 1);
};

/** Clé de mois (ex. « 2026-08 ») pour un enregistrement. */
const monthKey = (value) => (value ? String(value).slice(0, 7) : '');

/** Libellé court du mois (ex. « août »). */
const monthLabel = (key) => {
  const [year, month] = String(key).split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('fr-FR', { month: 'long' });
};

/** Les N derniers mois (clé 'YYYY-MM') à partir d'une date donnée. */
const lastMonths = (from = new Date(), count = 6) => {
  const months = [];
  const cursor = new Date(from.getFullYear(), from.getMonth() + 1, 1);

  for (let index = 0; index < count; index += 1) {
    cursor.setMonth(cursor.getMonth() - 1);
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
  }

  return months.reverse();
};

const buildFuelRecord = (payload) => ({
  ...payload,
  id: generateUlid(),
  fuelNumber: `FL-${String(fuelNumberCounter).padStart(4, '0')}`,
  currency: payload.currency || DEFAULT_CURRENCY,
  receiptImage: payload.receiptImage || '',
  status: 'pending',
  createdBy: 'Utilisateur connecté',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const fuelService = {
  /**
   * Liste des pleins (copie — les mutations ultérieures du cache
   * n'affectent pas les consommateurs). Bornée à l'entreprise courante via
   * `companyScopeId` (multi-tenant simulé — vide pour super_admin).
   * @param {object} [query] — { companyScopeId }
   * @returns {Promise<Array<object>>}
   */
  async getAll({ companyScopeId = '' } = {}) {
    if (apiConfig.mock) {
      const records = companyScopeId
        ? getFuelCache().filter((record) => record.companyId === companyScopeId)
        : getFuelCache();
      return mockResponse([...records]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.FUEL.LIST, { params: { companyScopeId } });
    return data;
  },

  /**
   * Détail d'un plein.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const record = getFuelCache().find((item) => item.id === id);
      if (!record) {
        return mockResponse(null, { error: ApiError.notFound('Plein de carburant introuvable.') });
      }
      return mockResponse(record);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.FUEL.DETAIL(id));
    return data;
  },

  /**
   * Création d'un plein (calcul automatique du coût total et de la
   * consommation moyenne ; contrôle du kilométrage par rapport au dernier
   * plein du véhicule).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      const mileageError = findMileageError(payload.vehicleId, payload.mileage);
      if (mileageError) {
        return mockResponse(null, { error: mileageError });
      }

      fuelNumberCounter += 1;
      const record = buildFuelRecord(payload);
      record.totalCost = roundTo(Number(payload.quantity) * Number(payload.unitPrice));
      record.consumptionAverage = computeConsumption(record);

      getFuelCache().unshift(record);
      return mockResponse(record);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.FUEL.LIST, payload);
    return data;
  },

  /**
   * Mise à jour d'un plein (plein validé ou annulé verrouillé ; kilométrage
   * croissant ; coût total et consommation recalculés).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const index = getFuelCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Plein de carburant introuvable.') });
      }

      const current = getFuelCache()[index];
      if (current.status === 'validated' || current.status === 'cancelled') {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'FUEL_FINAL_LOCKED',
            message: 'Un plein validé ou annulé ne peut plus être modifié.',
          }),
        });
      }

      const mileageError = findMileageError(payload.vehicleId, payload.mileage, id);
      if (mileageError) {
        return mockResponse(null, { error: mileageError });
      }

      const updated = {
        ...current,
        ...payload,
        id,
        currency: payload.currency || current.currency || DEFAULT_CURRENCY,
        totalCost: roundTo(Number(payload.quantity) * Number(payload.unitPrice)),
        consumptionAverage: computeConsumption(
          { ...payload, vehicleId: payload.vehicleId },
          id,
        ),
        updatedAt: new Date().toISOString(),
      };
      getFuelCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.FUEL.DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'un plein.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async delete(id) {
    if (apiConfig.mock) {
      const exists = getFuelCache().some((item) => item.id === id);
      if (!exists) {
        return mockResponse(null, { error: ApiError.notFound('Plein de carburant introuvable.') });
      }
      fuelCache = getFuelCache().filter((item) => item.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.FUEL.DETAIL(id));
    return data;
  },

  /**
   * Statistiques de consommation de carburant (dérivées des données mockées) :
   * coût total du mois, litres consommés du mois, coût moyen par véhicule,
   * consommation moyenne, top 5 des véhicules les plus consommateurs,
   * évolution mensuelle (6 derniers mois) et consommations anormales.
   * Bornées à l'entreprise courante via `companyScopeId` (vide : toutes).
   * @param {string} [companyScopeId]
   * @returns {Promise<object>}
   */
  async statistics(companyScopeId = '') {
    if (apiConfig.mock) {
      const records = companyScopeId
        ? getFuelCache().filter((record) => record.companyId === companyScopeId)
        : getFuelCache();
      const now = new Date();
      const currentMonth = monthKey(now.toISOString());

      const monthRecords = records.filter((record) => monthKey(record.createdAt) === currentMonth);
      const validated = records.filter((record) => record.status === 'validated');

      const sum = (items, field) => items.reduce((total, item) => total + Number(item[field] || 0), 0);
      const totalCost = sum(records, 'totalCost');
      const monthTotalCost = sum(monthRecords, 'totalCost');
      const monthQuantity = sum(monthRecords, 'quantity');

      const vehicleIds = [...new Set(records.map((record) => record.vehicleId))];
      const averageCostPerVehicle = vehicleIds.length ? roundTo(totalCost / vehicleIds.length) : 0;

      const consumptions = validated
        .map((record) => Number(record.consumptionAverage))
        .filter((value) => Number.isFinite(value) && value > 0);
      const averageConsumption = consumptions.length
        ? roundTo(consumptions.reduce((total, value) => total + value, 0) / consumptions.length, 1)
        : 0;

      const byVehicle = records.reduce((groups, record) => {
        const current = groups.get(record.vehicleId) || { vehicleId: record.vehicleId, quantity: 0, totalCost: 0, count: 0 };
        current.quantity += Number(record.quantity || 0);
        current.totalCost += Number(record.totalCost || 0);
        current.count += 1;
        groups.set(record.vehicleId, current);
        return groups;
      }, new Map());

      const topVehicles = [...byVehicle.values()]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
        .map((group) => ({
          ...group,
          quantity: roundTo(group.quantity),
          totalCost: roundTo(group.totalCost),
        }));

      const monthlyEvolution = lastMonths(now, 6).map((month) => {
        const items = records.filter((record) => monthKey(record.createdAt) === month);
        return {
          month,
          label: monthLabel(month),
          totalCost: roundTo(sum(items, 'totalCost')),
          quantity: roundTo(sum(items, 'quantity')),
        };
      });

      const abnormal = validated.filter((record) => {
        const vehicle = getVehicle(record.vehicleId);
        return isAbnormalFuelConsumption(record.consumptionAverage, vehicle?.category || '');
      });

      const anomalies = abnormal
        .sort((a, b) => Number(b.consumptionAverage) - Number(a.consumptionAverage))
        .slice(0, 5)
        .map((record) => ({
          id: record.id,
          fuelNumber: record.fuelNumber,
          vehicleId: record.vehicleId,
          stationName: record.stationName,
          stationCity: record.stationCity,
          fuelType: record.fuelType,
          quantity: record.quantity,
          unitPrice: record.unitPrice,
          totalCost: record.totalCost,
          mileage: record.mileage,
          consumptionAverage: record.consumptionAverage,
          createdAt: record.createdAt,
        }));

      return mockResponse({
        totalCost: roundTo(totalCost),
        fuelCount: records.length,
        validatedCount: validated.length,
        pendingCount: records.filter((record) => record.status === 'pending').length,
        cancelledCount: records.filter((record) => record.status === 'cancelled').length,
        monthTotalCost: roundTo(monthTotalCost),
        monthQuantity: roundTo(monthQuantity),
        averageCostPerVehicle,
        averageConsumption,
        topVehicles,
        monthlyEvolution,
        anomalies,
        anomaliesCount: abnormal.length,
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.FUEL.STATS, { params: { companyScopeId } });
    return data;
  },
};
