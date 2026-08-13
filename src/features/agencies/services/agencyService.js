/**
 * Navix Agencies — AgencyService
 * --------------------------------------------------------------------------
 * Description : gestion complète des agences / sites (multi-tenant), mock uniquement.
 * Responsabilité : fournir les données agences aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()                    → liste de toutes les agences
 *   getById(id)                 → détail d'une agence (404 si absente)
 *   create(payload)             → création (code unique par entreprise, ULID)
 *   update(id, payload)         → mise à jour (404/409 si conflit)
 *   remove(id)                  → suppression (404 si absente)
 *   activate(id) / deactivate(id) → bascule du statut Active / Inactive
 *   statistics(id)              → synthèse (véhicules, chauffeurs, mois, coûts)
 *   getVehicles(id)             → véhicules rattachés à l'agence
 *   getDrivers(id)              → chauffeurs rattachés à l'agence
 *   getActivity(id)             → flux d'activité récent de l'agence
 *
 * Règles métier simulées :
 *   - code d'agence unique au sein d'une même entreprise (409 sinon)
 *   - identifiant ULID et horodatages automatiques à la création
 *   - les véhicules sont rattachés à l'agence par nom (champ « agency »),
 *     les chauffeurs par agencyId ; trajets, pleins, entretiens et documents
 *     sont agrégés via les véhicules de l'agence.
 *
 * Exemple d'utilisation :
 *   import { agencyService } from '../services';
 *   const agencies = await agencyService.getAll();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_AGENCIES } from '../mocks';
import { MOCK_VEHICLES } from '@/features/vehicles/mocks';
import { MOCK_DRIVERS } from '@/features/drivers/mocks';
import { MOCK_TRIPS } from '@/features/trips/mocks';
import { MOCK_FUEL_RECORDS } from '@/features/fuel/mocks';
import { MOCK_MAINTENANCE_RECORDS } from '@/features/maintenance/mocks';
import { MOCK_DOCUMENTS } from '@/features/documents/mocks';

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

let agenciesCache = null;

const getAgenciesCache = () => {
  if (!agenciesCache) {
    agenciesCache = MOCK_AGENCIES.map((agency) => ({ ...agency }));
  }
  return agenciesCache;
};

const roundTo = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
};

/** Clé de mois (ex. « 2026-08 ») pour un horodatage. */
const monthKey = (value) => (value ? String(value).slice(0, 7) : '');

/** Véhicules rattachés à une agence (champ « agency » + entreprise). */
const vehiclesOfAgency = (agency) =>
  MOCK_VEHICLES.filter(
    (vehicle) => vehicle.companyId === agency.companyId && vehicle.agency === agency.name,
  );

/** Chauffeurs rattachés à une agence (agencyId). */
const driversOfAgency = (agency) => MOCK_DRIVERS.filter((driver) => driver.agencyId === agency.id);

/** Ids des véhicules d'une agence. */
const vehicleIdsOfAgency = (agency) => vehiclesOfAgency(agency).map((vehicle) => vehicle.id);

const isDuplicateCode = (code, companyId, excludedId) =>
  getAgenciesCache().some(
    (agency) =>
      agency.companyId === companyId &&
      agency.code.toLowerCase() === code.trim().toLowerCase() &&
      agency.id !== excludedId,
  );

export const agencyService = {
  /**
   * Liste des agences (copie — les mutations ultérieures du cache
   * n'affectent pas les consommateurs). Bornée à l'entreprise courante via
   * `companyScopeId` (multi-tenant simulé — vide pour super_admin).
   * @param {object} [query] — { companyScopeId }
   * @returns {Promise<Array<object>>}
   */
  async getAll({ companyScopeId = '' } = {}) {
    if (apiConfig.mock) {
      const agencies = companyScopeId
        ? getAgenciesCache().filter((agency) => agency.companyId === companyScopeId)
        : getAgenciesCache();
      return mockResponse([...agencies]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AGENCIES.LIST, { params: { companyScopeId } });
    return data;
  },

  /**
   * Détail d'une agence.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const agency = getAgenciesCache().find((item) => item.id === id);
      if (!agency) {
        return mockResponse(null, { error: ApiError.notFound('Agence introuvable.') });
      }
      return mockResponse(agency);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AGENCIES.DETAIL(id));
    return data;
  },

  /**
   * Création d'une agence (le code doit être unique au sein de l'entreprise).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      if (isDuplicateCode(payload.code, payload.companyId)) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'AGENCY_CODE_EXISTS',
            message: 'Ce code d’agence est déjà utilisé pour cette entreprise.',
          }),
        });
      }

      const now = new Date().toISOString();
      const agency = {
        ...payload,
        id: generateUlid(),
        vehicleCount: 0,
        driverCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      getAgenciesCache().unshift(agency);
      return mockResponse(agency);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.AGENCIES.LIST, payload);
    return data;
  },

  /**
   * Mise à jour d'une agence.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const index = getAgenciesCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Agence introuvable.') });
      }
      if (isDuplicateCode(payload.code, payload.companyId, id)) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'AGENCY_CODE_EXISTS',
            message: 'Ce code d’agence est déjà utilisé pour cette entreprise.',
          }),
        });
      }

      const updated = {
        ...getAgenciesCache()[index],
        ...payload,
        id,
        updatedAt: new Date().toISOString(),
      };
      getAgenciesCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.AGENCIES.DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'une agence.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    if (apiConfig.mock) {
      const exists = getAgenciesCache().some((item) => item.id === id);
      if (!exists) {
        return mockResponse(null, { error: ApiError.notFound('Agence introuvable.') });
      }
      agenciesCache = getAgenciesCache().filter((item) => item.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.AGENCIES.DETAIL(id));
    return data;
  },

  /**
   * Active une agence (statut → active).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async activate(id) {
    if (apiConfig.mock) {
      const index = getAgenciesCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Agence introuvable.') });
      }
      const updated = {
        ...getAgenciesCache()[index],
        status: 'active',
        updatedAt: new Date().toISOString(),
      };
      getAgenciesCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.AGENCIES.ACTIVATE(id));
    return data;
  },

  /**
   * Désactive une agence (statut → inactive).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async deactivate(id) {
    if (apiConfig.mock) {
      const index = getAgenciesCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Agence introuvable.') });
      }
      const updated = {
        ...getAgenciesCache()[index],
        status: 'inactive',
        updatedAt: new Date().toISOString(),
      };
      getAgenciesCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.AGENCIES.DEACTIVATE(id));
    return data;
  },

  /**
   * Véhicules rattachés à l'agence (source : mocks Véhicules).
   * @param {string} id
   * @returns {Promise<Array<object>>}
   */
  async getVehicles(id) {
    if (apiConfig.mock) {
      const agency = getAgenciesCache().find((item) => item.id === id);
      if (!agency) {
        return mockResponse([], { error: ApiError.notFound('Agence introuvable.') });
      }
      return mockResponse(vehiclesOfAgency(agency));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AGENCIES.VEHICLES(id));
    return data;
  },

  /**
   * Chauffeurs rattachés à l'agence (source : mocks Chauffeurs).
   * @param {string} id
   * @returns {Promise<Array<object>>}
   */
  async getDrivers(id) {
    if (apiConfig.mock) {
      const agency = getAgenciesCache().find((item) => item.id === id);
      if (!agency) {
        return mockResponse([], { error: ApiError.notFound('Agence introuvable.') });
      }
      return mockResponse(driversOfAgency(agency));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AGENCIES.DRIVERS(id));
    return data;
  },

  /**
   * Flux d'activité récent d'une agence (chauffeurs, véhicules, trajets,
   * pleins, entretiens, documents), trié de la date la plus récente à la plus
   * ancienne.
   * @param {string} id
   * @returns {Promise<Array<object>>}
   */
  async getActivity(id) {
    if (apiConfig.mock) {
      const agency = getAgenciesCache().find((item) => item.id === id);
      if (!agency) {
        return mockResponse([], { error: ApiError.notFound('Agence introuvable.') });
      }

      const vehicleIds = new Set(vehicleIdsOfAgency(agency));
      const events = [];

      driversOfAgency(agency).forEach((driver) => {
        events.push({
          id: `driver-${driver.id}`,
          type: 'driver_added',
          title: `Ajout du chauffeur ${driver.fullName}`,
          description: `${driver.employeeCode} · ${driver.city || ''}`.trim(),
          date: driver.createdAt,
          icon: 'bi-person-plus',
          variant: 'success',
        });
      });

      vehiclesOfAgency(agency).forEach((vehicle) => {
        events.push({
          id: `vehicle-${vehicle.id}`,
          type: 'vehicle_added',
          title: `Ajout du véhicule ${vehicle.registrationNumber}`,
          description: `${vehicle.brand} ${vehicle.model} · ${vehicle.agency}`,
          date: vehicle.createdAt,
          icon: 'bi-truck',
          variant: 'info',
        });
      });

      MOCK_TRIPS.filter((trip) => vehicleIds.has(trip.vehicleId)).forEach((trip) => {
        events.push({
          id: `trip-${trip.id}`,
          type: 'trip',
          title: `Trajet ${trip.tripNumber}`,
          description: `${trip.purpose || 'Mission'} · ${trip.departureLocation} → ${trip.arrivalLocation}`,
          date: trip.createdAt,
          icon: 'bi-sign-turn-right',
          variant: 'primary',
        });
      });

      MOCK_FUEL_RECORDS.filter((fuel) => vehicleIds.has(fuel.vehicleId)).forEach((fuel) => {
        events.push({
          id: `fuel-${fuel.id}`,
          type: 'fuel_purchase',
          title: `Plein ${fuel.fuelNumber}`,
          description: `${fuel.quantity} L · ${fuel.stationName} (${fuel.stationCity})`,
          date: fuel.createdAt,
          icon: 'bi-fuel-pump',
          variant: 'warning',
        });
      });

      MOCK_MAINTENANCE_RECORDS.filter((maintenance) => vehicleIds.has(maintenance.vehicleId)).forEach(
        (maintenance) => {
          events.push({
            id: `maintenance-${maintenance.id}`,
            type: 'maintenance',
            title: `Entretien ${maintenance.maintenanceNumber}`,
            description: `${maintenance.description || maintenance.workshop || 'Maintenance véhicule'}`,
            date: maintenance.createdAt,
            icon: 'bi-wrench-adjustable',
            variant: 'secondary',
          });
        },
      );

      MOCK_DOCUMENTS.filter(
        (document) =>
          document.associationType === 'vehicle' && vehicleIds.has(document.associationId),
      ).forEach((document) => {
        events.push({
          id: `document-${document.id}`,
          type: 'document_uploaded',
          title: `Document ajouté : ${document.name}`,
          description: `${document.category || 'Document'} · ${document.directory}`,
          date: document.createdAt,
          icon: 'bi-file-earmark-arrow-up',
          variant: 'info',
        });
      });

      const activity = events
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .slice(0, 20);

      return mockResponse(activity);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AGENCIES.ACTIVITY(id));
    return data;
  },

  /**
   * Synthèse statistique d'une agence (dérivée des mocks) : volumes de
   * véhicules / chauffeurs, répartitions (statut, groupe), indicateurs du
   * mois courant (trajets, distance, carburant, entretiens, documents) et
   * activité récente.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async statistics(id) {
    if (apiConfig.mock) {
      const agency = getAgenciesCache().find((item) => item.id === id);
      if (!agency) {
        return mockResponse(null, { error: ApiError.notFound('Agence introuvable.') });
      }

      const vehicles = vehiclesOfAgency(agency);
      const drivers = driversOfAgency(agency);
      const vehicleIds = new Set(vehicles.map((vehicle) => vehicle.id));
      const currentMonth = monthKey(new Date().toISOString());

      const trips = MOCK_TRIPS.filter((trip) => vehicleIds.has(trip.vehicleId));
      const monthTrips = trips.filter((trip) => monthKey(trip.createdAt) === currentMonth);
      const fuelRecords = MOCK_FUEL_RECORDS.filter((fuel) => vehicleIds.has(fuel.vehicleId));
      const monthFuel = fuelRecords.filter((fuel) => monthKey(fuel.createdAt) === currentMonth);
      const maintenanceRecords = MOCK_MAINTENANCE_RECORDS.filter((maintenance) =>
        vehicleIds.has(maintenance.vehicleId),
      );
      const monthMaintenance = maintenanceRecords.filter(
        (maintenance) => monthKey(maintenance.completedAt || maintenance.createdAt) === currentMonth,
      );
      const documents = MOCK_DOCUMENTS.filter(
        (document) =>
          document.associationType === 'vehicle' && vehicleIds.has(document.associationId),
      );
      const monthDocuments = documents.filter((document) => monthKey(document.createdAt) === currentMonth);

      const countBy = (values) =>
        values.reduce((groups, value) => {
          groups[value] = (groups[value] || 0) + 1;
          return groups;
        }, {});

      const vehicleStatusCounts = countBy(vehicles.map((vehicle) => vehicle.status));
      const driverAvailabilityCounts = countBy(drivers.map((driver) => driver.availability));
      const groupCounts = countBy(vehicles.map((vehicle) => vehicle.group));

      const groupDistribution = Object.keys(groupCounts)
        .map((group) => ({ group, count: groupCounts[group] }))
        .sort((a, b) => String(a.group).localeCompare(String(b.group)));

      const statusDistribution = Object.keys(vehicleStatusCounts)
        .map((status) => ({ status, count: vehicleStatusCounts[status] }))
        .sort((a, b) => b.count - a.count);

      const sum = (items, field) => items.reduce((total, item) => total + Number(item[field] || 0), 0);

      return mockResponse({
        agencyId: agency.id,
        vehicleCount: vehicles.length,
        driverCount: drivers.length,
        vehicleStatus: {
          available: vehicleStatusCounts.available || 0,
          inUse: vehicleStatusCounts.in_use || 0,
          maintenance: vehicleStatusCounts.maintenance || 0,
          outOfService: vehicleStatusCounts.out_of_service || 0,
        },
        driverAvailability: {
          available: driverAvailabilityCounts.available || 0,
          busy: driverAvailabilityCounts.busy || 0,
          unavailable: driverAvailabilityCounts.unavailable || 0,
        },
        groupDistribution,
        statusDistribution,
        monthTrips: monthTrips.length,
        monthDistance: roundTo(sum(monthTrips, 'actualDistance') || sum(monthTrips, 'plannedDistance')),
        monthFuelCost: roundTo(sum(monthFuel, 'totalCost')),
        monthFuelQuantity: roundTo(sum(monthFuel, 'quantity')),
        monthMaintenanceCount: monthMaintenance.length,
        monthMaintenanceCost: roundTo(
          sum(monthMaintenance.filter((maintenance) => maintenance.status === 'completed'), 'actualCost'),
        ),
        monthDocuments: monthDocuments.length,
        fuelYtd: roundTo(sum(fuelRecords, 'totalCost')),
        maintenanceYtd: roundTo(
          sum(
            maintenanceRecords.filter((maintenance) => maintenance.status === 'completed'),
            'actualCost',
          ),
        ),
        recentActivity: await agencyService.getActivity(id),
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AGENCIES.STATS, { params: { agencyId: id } });
    return data;
  },
};
