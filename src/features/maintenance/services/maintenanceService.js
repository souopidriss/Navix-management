/**
 * Navix Maintenance — MaintenanceService
 * --------------------------------------------------------------------------
 * Description : gestion complète des entretiens de véhicules, mock uniquement.
 * Responsabilité : fournir les données d'entretien aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()               → liste de tous les entretiens
 *   getById(id)            → détail d'un entretien (404 si absent)
 *   create(payload)        → création (n° auto MT-XXXX, horodatages)
 *   update(id, payload)    → mise à jour (404/409, entretien clôturé verrouillé)
 *   delete(id)             → suppression (404 si absent)
 *   statistics()           → synthèse (coût annuel, alertes, immobilisés…)
 *   calendar(from, to)     → événements calendrier (planifiés + prochains)
 *   history(vehicleId)     → historique complet d'un véhicule
 *
 * Règles métier simulées :
 *   - numéro d'entretien automatique (MT-XXXX) et ULID d'identifiant
 *   - un entretien TERMINÉ ou ANNULÉ ne peut plus être modifié (409 sinon)
 *   - un entretien « en cours » (in_progress) immobilise le véhicule
 *   - le statut TERMINÉ renseigne automatiquement completedAt ; « en cours »
 *     renseigne startedAt
 *   - la synthèse dérive les alertes « retard », « date proche »,
 *     « kilométrage proche », « urgence » et le coût cumulé (mois / année)
 *
 * Exemple d'utilisation :
 *   import { maintenanceService } from '../services';
 *   const records = await maintenanceService.getAll();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_MAINTENANCE_RECORDS, nextMaintenanceNumber } from '../mocks';
import { MOCK_VEHICLES } from '@/features/vehicles/mocks';
import {
  DEFAULT_CURRENCY,
  MAINTENANCE_TYPES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_PRIORITIES,
  isMaintenanceFinished,
  isMaintenanceImmobilizing,
  isMaintenanceLate,
  isMaintenanceDateDueSoon,
  isMaintenanceMileageDueSoon,
  isMaintenanceUrgent,
} from '../constants';

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

let maintenanceCache = null;
let maintenanceNumberCounter = Number(nextMaintenanceNumber);

const getMaintenanceCache = () => {
  if (!maintenanceCache) {
    maintenanceCache = MOCK_MAINTENANCE_RECORDS.map((record) => ({ ...record }));
  }
  return maintenanceCache;
};

const roundTo = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
};

/** Clé de mois (ex. « 2026-08 ») pour un horodatage. */
const monthKey = (value) => (value ? String(value).slice(0, 7) : '');

/** Année (ex. 2026) pour un horodatage. */
const yearOf = (value) => (value ? Number(String(value).slice(0, 4)) : null);

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

/** Clé de date locale (YYYY-MM-DD) d'un horodatage ISO ou d'une date simple. */
const dateKey = (value) => (value ? String(value).slice(0, 10) : '');

/**
 * Construit un enregistrement d'entretien à partir du payload du formulaire :
 * identifiant ULID, numéro automatique, monnaie par défaut, horodatages
 * dérivés du statut (in_progress → startedAt, completed → completedAt) et
 * créateur.
 */
const buildMaintenanceRecord = (payload) => {
  const now = new Date().toISOString();
  const record = {
    ...payload,
    id: generateUlid(),
    maintenanceNumber: `MT-${String(maintenanceNumberCounter).padStart(4, '0')}`,
    currency: payload.currency || DEFAULT_CURRENCY,
    createdBy: 'Utilisateur connecté',
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

export const maintenanceService = {
  /**
   * Liste de tous les entretiens (copie — les mutations ultérieures du cache
   * n'affectent pas les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    if (apiConfig.mock) {
      return mockResponse([...getMaintenanceCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.MAINTENANCE.LIST);
    return data;
  },

  /**
   * Détail d'un entretien.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const record = getMaintenanceCache().find((item) => item.id === id);
      if (!record) {
        return mockResponse(null, { error: ApiError.notFound('Entretien introuvable.') });
      }
      return mockResponse(record);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.MAINTENANCE.DETAIL(id));
    return data;
  },

  /**
   * Création d'un entretien (numéro automatique, horodatages dérivés du
   * statut). Aucune règle de blocage à la création.
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      maintenanceNumberCounter += 1;
      const record = buildMaintenanceRecord(payload);
      getMaintenanceCache().unshift(record);
      return mockResponse(record);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.MAINTENANCE.LIST, payload);
    return data;
  },

  /**
   * Mise à jour d'un entretien. Un entretien clôturé (TERMINÉ ou ANNULÉ) est
   * verrouillé (409). Les horodatages sont dérivés du statut.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const index = getMaintenanceCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Entretien introuvable.') });
      }

      const current = getMaintenanceCache()[index];
      if (isMaintenanceFinished(current)) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'MAINTENANCE_FINAL_LOCKED',
            message: 'Un entretien terminé ou annulé ne peut plus être modifié.',
          }),
        });
      }

      const now = new Date().toISOString();
      const updated = { ...current, ...payload, id, updatedAt: now };

      if (updated.status === 'in_progress' && !updated.startedAt) {
        updated.startedAt = now;
      }
      if (updated.status === 'completed' && !updated.completedAt) {
        updated.completedAt = now;
      }

      getMaintenanceCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.MAINTENANCE.DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'un entretien.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async delete(id) {
    if (apiConfig.mock) {
      const exists = getMaintenanceCache().some((item) => item.id === id);
      if (!exists) {
        return mockResponse(null, { error: ApiError.notFound('Entretien introuvable.') });
      }
      maintenanceCache = getMaintenanceCache().filter((item) => item.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.MAINTENANCE.DETAIL(id));
    return data;
  },

  /**
   * Synthèse statistique des entretiens (dérivée des données mockées) :
   * volume par statut, alertes (retard, proche, urgence), véhicules
   * immobilisés, coût cumulé (mois / année), coût moyen, distribution par
   * type, priorité, statut, évolution mensuelle (6 mois), ateliers et
   * véhicules les plus concernés.
   * @returns {Promise<object>}
   */
  async statistics() {
    if (apiConfig.mock) {
      const records = getMaintenanceCache();
      const now = new Date();
      const currentMonth = monthKey(now.toISOString());
      const currentYear = now.getFullYear();

      const sum = (items, field) => items.reduce((total, item) => total + Number(item[field] || 0), 0);

      const completed = records.filter((record) => record.status === 'completed');
      const monthCost = roundTo(
        sum(completed.filter((record) => monthKey(record.completedAt) === currentMonth), 'actualCost'),
      );
      const yearCost = roundTo(
        sum(completed.filter((record) => yearOf(record.completedAt) === currentYear), 'actualCost'),
      );
      const averageCost = completed.length
        ? roundTo(sum(completed, 'actualCost') / completed.length)
        : 0;

      const late = records.filter((record) => !isMaintenanceFinished(record) && isMaintenanceLate(record, getVehicle(record.vehicleId)));
      const dueSoon = records.filter((record) => {
        const vehicle = getVehicle(record.vehicleId);
        return isMaintenanceDateDueSoon(record) || isMaintenanceMileageDueSoon(record, vehicle);
      });
      const urgent = records.filter(isMaintenanceUrgent);
      const immobilized = records.filter(isMaintenanceImmobilizing);

      const countBy = (values) =>
        values.reduce((groups, value) => {
          groups[value] = (groups[value] || 0) + 1;
          return groups;
        }, {});

      const statusDistribution = Object.keys(MAINTENANCE_STATUSES).map((status) => ({
        status,
        count: records.filter((record) => record.status === status).length,
      }));

      const typeDistribution = Object.keys(MAINTENANCE_TYPES)
        .map((type) => {
          const items = records.filter((record) => record.maintenanceType === type);
          return { type, count: items.length, totalCost: roundTo(sum(items, 'actualCost')) };
        })
        .filter((group) => group.count > 0)
        .sort((a, b) => b.count - a.count);

      const priorityCounts = countBy(records.map((record) => record.priority));
      const priorityDistribution = Object.keys(MAINTENANCE_PRIORITIES)
        .map((priority) => ({ priority, count: priorityCounts[priority] || 0 }))
        .sort((a, b) => b.count - a.count);

      const monthlyEvolution = lastMonths(now, 6).map((month) => {
        const items = completed.filter((record) => monthKey(record.completedAt) === month);
        return {
          month,
          label: monthLabel(month),
          totalCost: roundTo(sum(items, 'actualCost')),
          count: items.length,
        };
      });

      const byWorkshop = records.reduce((groups, record) => {
        const name = record.workshop || 'Atelier inconnu';
        const current = groups.get(name) || { workshop: name, count: 0, totalCost: 0 };
        current.count += 1;
        current.totalCost += Number(record.actualCost || 0);
        groups.set(name, current);
        return groups;
      }, new Map());

      const topWorkshops = [...byWorkshop.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((group) => ({ ...group, totalCost: roundTo(group.totalCost) }));

      const byVehicle = records.reduce((groups, record) => {
        const current = groups.get(record.vehicleId) || { vehicleId: record.vehicleId, count: 0, totalCost: 0 };
        current.count += 1;
        current.totalCost += Number(record.actualCost || 0);
        groups.set(record.vehicleId, current);
        return groups;
      }, new Map());

      const topVehicles = [...byVehicle.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((group) => ({ ...group, totalCost: roundTo(group.totalCost) }));

      return mockResponse({
        totalCount: records.length,
        plannedCount: records.filter((record) => record.status === 'planned').length,
        pendingCount: records.filter((record) => record.status === 'pending').length,
        inProgressCount: records.filter((record) => record.status === 'in_progress').length,
        completedCount: completed.length,
        cancelledCount: records.filter((record) => record.status === 'cancelled').length,
        lateCount: late.length,
        dueSoonCount: dueSoon.length,
        urgentCount: urgent.length,
        immobilizedCount: immobilized.length,
        monthCost,
        yearCost,
        averageCost,
        statusDistribution,
        typeDistribution,
        priorityDistribution,
        monthlyEvolution,
        topWorkshops,
        topVehicles,
        nextDueSoon: dueSoon
          .map((record) => ({ ...record, eventDate: record.nextMaintenanceDate || record.scheduledDate }))
          .sort((a, b) => String(a.eventDate).localeCompare(String(b.eventDate)))
          .slice(0, 6),
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.MAINTENANCE.STATS);
    return data;
  },

  /**
   * Événements calendrier : entretiens dont la date prévue (scheduledDate)
   * ou le prochain entretien (nextMaintenanceDate) tombe dans la fenêtre
   * [from, to] (dates locales YYYY-MM-DD). Chaque événement porte `eventDate`.
   * @param {string} from
   * @param {string} to
   * @returns {Promise<Array<object>>}
   */
  async calendar(from = '', to = '') {
    if (apiConfig.mock) {
      const events = getMaintenanceCache()
        .flatMap((record) => {
          const dates = [
            record.scheduledDate ? { date: dateKey(record.scheduledDate), source: 'scheduledDate' } : null,
            record.nextMaintenanceDate ? { date: dateKey(record.nextMaintenanceDate), source: 'nextMaintenanceDate' } : null,
          ].filter(Boolean);

          return dates
            .filter(({ date }) => (!from || date >= from) && (!to || date <= to))
            .map(({ date, source }) => ({ ...record, eventDate: date, eventSource: source }));
        })
        .sort((a, b) => String(a.eventDate).localeCompare(String(b.eventDate)));

      return mockResponse(events);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.MAINTENANCE.CALENDAR, {
      params: { from, to },
    });
    return data;
  },

  /**
   * Historique complet d'un véhicule : tous ses entretiens, triés de la date
   * prévue la plus récente à la plus ancienne.
   * @param {string} vehicleId
   * @returns {Promise<Array<object>>}
   */
  async history(vehicleId) {
    if (apiConfig.mock) {
      const history = getMaintenanceCache()
        .filter((record) => record.vehicleId === vehicleId)
        .sort((a, b) => String(b.scheduledDate).localeCompare(String(a.scheduledDate)) || String(b.createdAt).localeCompare(String(a.createdAt)));
      return mockResponse(history);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.MAINTENANCE.HISTORY, {
      params: { vehicleId },
    });
    return data;
  },
};
