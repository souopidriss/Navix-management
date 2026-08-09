/**
 * Navix Reports — ReportService
 * --------------------------------------------------------------------------
 * Description : agrège les données mockées en rapports (fleet, vehicles,
 * drivers, assignments, trips, fuel, maintenance, documents, financial,
 * subscriptions, audit, companies, custom) et gère les rapports enregistrés.
 * Responsabilité : exposer les calculs purs de `report.aggregate.js` et les
 * persistances simulées (rapports sauvegardés en mémoire de session).
 * Mode mock : aucune requête HTTP.
 *
 * Multi-tenant simulé : la portée est bornée à l'entreprise de l'utilisateur
 * courant (simulation UX). La sécurité réelle sera appliquée côté Express.js.
 *
 * Méthodes :
 *   getReport(type, query)   → rapport calculé + comparaison de période
 *   getFleetReport / getVehicleReport / getDriverReport / getAssignmentReport /
 *   getTripReport / getFuelReport / getMaintenanceReport / getDocumentReport /
 *   getFinancialReport / getSubscriptionReport / getAuditReport / getCompanyReport
 *                           → raccourcis typés par catégorie de rapport
 *   getDashboardMetrics()   → aperçu analytique du dashboard (overview)
 *   getCustomReport(config) → rapport personnalisé (source + indicateurs)
 *   getReports(filters)     → rapports enregistrés (listables, filtrables)
 *   getSavedReport(id)      → détail d'un rapport enregistré
 *   saveReport(payload)     → crée/mise à jour un rapport enregistré
 *   deleteReport(id)        → supprime un rapport enregistré
 *   exportReport(query)     → export simulé (architecture uniquement)
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_SAVED_REPORTS } from '../mocks';
import { sanitizeReportFilters, sanitizeReportConfiguration, sanitizeReport, getReportSchema, dashboardMetricsSchema } from '../schemas';
import { getReportType, getReportPeriod } from '../constants';
import { MOCK_VEHICLES } from '@/features/vehicles/mocks';
import { MOCK_DRIVERS } from '@/features/drivers/mocks';
import { MOCK_AGENCIES } from '@/features/agencies/mocks';
import {
  AGGREGATE_FUNCTIONS,
  aggregateOverviewReport,
  buildCustomReport,
  resolveReportDateRange,
  buildPreviousRange,
  buildCompaniesOptions,
  buildAgenciesOptions,
  buildVehiclesOptions,
  buildDriversOptions,
} from './report.aggregate';

/* --------------------------------------------------------------------------
   Rapports calculés
   -------------------------------------------------------------------------- */

/**
 * Construit le contexte de portée + filtres.
 * @param {object} query
 * @returns {{ companyScopeId: string, filters: object }}
 */
const buildContext = (query) => ({
  companyScopeId: query.companyScopeId ?? '',
  filters: sanitizeReportFilters(query.filters ?? {}),
});

/**
 * Génère un rapport de catégorie avec comparaison de période précédente.
 * @param {string} reportType — catégorie de rapport (fleet, fuel, …)
 * @param {object} [query] — { companyScopeId, filters }
 * @returns {Promise<object>}
 */
export const reportService = {
  async getReport(reportType = 'fleet', query = {}) {
    if (apiConfig.mock) {
      const aggregate = AGGREGATE_FUNCTIONS[reportType];
      if (!aggregate) return mockResponse(null, { error: ApiError.notFound('Catégorie de rapport inconnue.') });

      const ctx = buildContext(query);
      const filters = ctx.filters;
      const range = resolveReportDateRange(filters.period, filters.dateFrom, filters.dateTo);
      const previousRange = buildPreviousRange(range);
      const rawReport = aggregate(ctx, range, previousRange);
      const report = sanitizeReport(rawReport, getReportSchema(reportType));

      const meta = getReportType(reportType);
      return mockResponse({
        ...report,
        meta: {
          id: meta.id,
          label: meta.label,
          description: meta.description,
          icon: meta.icon,
          variant: meta.variant,
        },
        periodLabel: filters.period ? getReportPeriodLabel(filters.period) : 'Personnalisée',
        comparison: {
          current: range,
          previous: previousRange,
        },
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.REPORTS[reportType.toUpperCase()] ?? API_ENDPOINTS.REPORTS.FLEET, {
      params: query,
    });
    return data;
  },

  /* --------------------------------------------------------------------------
     Méthodes métier nommées (rapports réellement présents dans le module)
     -------------------------------------------------------------------------- */

  async getFleetReport(query = {}) {
    return this.getReport('fleet', query);
  },

  async getVehicleReport(query = {}) {
    return this.getReport('vehicles', query);
  },

  async getDriverReport(query = {}) {
    return this.getReport('drivers', query);
  },

  async getAssignmentReport(query = {}) {
    return this.getReport('assignments', query);
  },

  async getTripReport(query = {}) {
    return this.getReport('trips', query);
  },

  async getFuelReport(query = {}) {
    return this.getReport('fuel', query);
  },

  async getMaintenanceReport(query = {}) {
    return this.getReport('maintenance', query);
  },

  async getDocumentReport(query = {}) {
    return this.getReport('documents', query);
  },

  async getFinancialReport(query = {}) {
    return this.getReport('financial', query);
  },

  async getSubscriptionReport(query = {}) {
    return this.getReport('subscriptions', query);
  },

  async getAuditReport(query = {}) {
    return this.getReport('audit', query);
  },

  async getCompanyReport(query = {}) {
    return this.getReport('companies', query);
  },

  /**
   * Indicateurs de pilotage du dashboard (aperçu cross-domaines).
   * @param {object} [query] — { companyScopeId, filters }
   * @returns {Promise<object>}
   */
  async getDashboardMetrics(query = {}) {
    if (apiConfig.mock) {
      const ctx = buildContext(query);
      const filters = ctx.filters;
      const range = resolveReportDateRange(filters.period, filters.dateFrom, filters.dateTo);
      const previousRange = buildPreviousRange(range);
      const rawReport = aggregateOverviewReport(ctx, range, previousRange);
      const report = sanitizeReport(rawReport, dashboardMetricsSchema);

      return mockResponse({
        ...report,
        meta: {
          id: 'overview',
          label: 'Aperçu analytique',
          description: 'Indicateurs de pilotage consolidés de la flotte.',
          icon: 'bi-speedometer2',
          variant: 'info',
        },
        periodLabel: filters.period ? getReportPeriodLabel(filters.period) : 'Personnalisée',
        comparison: {
          current: range,
          previous: previousRange,
        },
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.REPORTS.STATISTICS, { params: query });
    return data;
  },

  /**
   * Rapport personnalisé construit par l'utilisateur.
   * @param {object} config — { source, indicators, period, dateFrom, dateTo, filters }
   * @param {object} [query] — { companyScopeId }
   * @returns {Promise<object>}
   */
  async getCustomReport(config = {}, query = {}) {
    if (apiConfig.mock) {
      const safeConfig = {
        ...config,
        filters: sanitizeReportFilters(config.filters ?? {}),
      };
      const report = buildCustomReport(safeConfig, { companyScopeId: query.companyScopeId ?? '' });
      return mockResponse(report);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.REPORTS.CUSTOM, config, { params: query });
    return data;
  },

  /* --------------------------------------------------------------------------
     Rapports enregistrés
     -------------------------------------------------------------------------- */

  async getReports(query = {}) {
    if (apiConfig.mock) {
      const companyScopeId = query.companyScopeId ?? '';
      const companyId = query.companyId ?? '';
      const reportType = query.reportType ?? '';
      const status = query.status ?? '';
      const search = (query.search ?? '').trim().toLowerCase();

      const items = MOCK_SAVED_REPORTS.filter((report) => {
        if (companyScopeId && report.companyId !== companyScopeId) return false;
        if (companyId && report.companyId !== companyId) return false;
        if (reportType && report.reportType !== reportType) return false;
        if (status && report.status !== status) return false;
        if (search) {
          const haystack = [report.name, report.description, report.reportType].join(' ').toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      }).map((report) => ({ ...report }));

      return mockResponse({ items, total: items.length });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.REPORTS.LIST, { params: query });
    return data;
  },

  async getSavedReport(id) {
    if (apiConfig.mock) {
      const report = MOCK_SAVED_REPORTS.find((item) => item.id === id);
      if (!report) return mockResponse(null, { error: ApiError.notFound('Rapport introuvable.') });
      return mockResponse({ ...report });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.REPORTS.DETAIL(id));
    return data;
  },

  /**
   * Crée ou met à jour un rapport enregistré (simulé, en mémoire).
   * @param {object} payload — { id?, name, description, reportType, status, configuration }
   * @param {object} [query] — { companyScopeId, userId }
   * @returns {Promise<object>}
   */
  async saveReport(payload = {}, query = {}) {
    if (apiConfig.mock) {
      const configuration = sanitizeReportConfiguration(payload.configuration ?? {});
      if (payload.id) {
        const index = MOCK_SAVED_REPORTS.findIndex((item) => item.id === payload.id);
        if (index === -1) return mockResponse(null, { error: ApiError.notFound('Rapport introuvable.') });
        MOCK_SAVED_REPORTS[index] = {
          ...MOCK_SAVED_REPORTS[index],
          ...payload,
          configuration,
          updatedAt: new Date().toISOString(),
        };
        return mockResponse({ ...MOCK_SAVED_REPORTS[index] });
      }

      const report = {
        id: `01JR${Date.now().toString(36).toUpperCase()}`,
        companyId: query.companyScopeId ?? '',
        name: payload.name ?? 'Rapport sans titre',
        description: payload.description ?? '',
        reportType: payload.reportType ?? 'fleet',
        status: payload.status ?? 'draft',
        configuration,
        createdBy: query.userId ?? 'usr_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_SAVED_REPORTS.unshift(report);
      return mockResponse({ ...report });
    }

    const { data } = await apiClient.post(
      payload.id ? API_ENDPOINTS.REPORTS.UPDATE(payload.id) : API_ENDPOINTS.REPORTS.SAVE,
      payload,
      { params: query },
    );
    return data;
  },

  async deleteReport(id) {
    if (apiConfig.mock) {
      const index = MOCK_SAVED_REPORTS.findIndex((item) => item.id === id);
      if (index === -1) return mockResponse(null, { error: ApiError.notFound('Rapport introuvable.') });
      const [removed] = MOCK_SAVED_REPORTS.splice(index, 1);
      return mockResponse({ success: true, id: removed.id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.REPORTS.DELETE(id));
    return data;
  },

  /**
   * Export simulé d'un rapport. Architecture uniquement : la génération réelle
   * (CSV/Excel/PDF serveur) sera implémentée côté Express.js. Aucune
   * bibliothèque d'export n'est installée.
   * @param {object} query — { reportType, companyScopeId, filters, format }
   * @returns {Promise<{ success: boolean, format: string, count: number, exportedAt: string }>}
   */
  async exportReport(query = {}) {
    if (apiConfig.mock) {
      const report = await this.getReport(query.reportType ?? 'fleet', query);
      const rows = Array.isArray(report?.rows) ? report.rows : [];
      return mockResponse({
        success: true,
        format: query.format ?? 'csv',
        count: rows.length,
        exportedAt: new Date().toISOString(),
      });
    }

    const { data } = await apiClient.post(
      API_ENDPOINTS.REPORTS.EXPORT,
      { format: query.format ?? 'csv', filters: query },
      { responseType: 'blob' },
    );
    return data;
  },

  /* --------------------------------------------------------------------------
     Options de filtres (entreprises, agences, véhicules, chauffeurs)
     -------------------------------------------------------------------------- */

  async getReportOptions(query = {}) {
    if (apiConfig.mock) {
      const companyScopeId = query.companyScopeId ?? '';
      const options = {
        companies: buildCompaniesOptions(),
        agencies: buildAgenciesOptions(),
        vehicles: buildVehiclesOptions(),
        drivers: buildDriversOptions(),
      };
      if (companyScopeId) {
        options.vehicles = options.vehicles.filter(
          (option) => MOCK_VEHICLE_COMPANIES[option.value] === companyScopeId,
        );
        options.drivers = options.drivers.filter(
          (option) => MOCK_DRIVER_COMPANIES[option.value] === companyScopeId,
        );
        options.agencies = options.agencies.filter(
          (option) => MOCK_AGENCY_COMPANIES[option.value] === companyScopeId,
        );
      }
      return mockResponse(options);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.REPORTS.CATEGORIES, { params: query });
    return data;
  },
};

const getReportPeriodLabel = (period) => getReportPeriod(period)?.label ?? 'Personnalisée';

const MOCK_VEHICLE_COMPANIES = MOCK_VEHICLES.reduce((acc, vehicle) => {
  acc[vehicle.id] = vehicle.companyId;
  return acc;
}, {});

const MOCK_DRIVER_COMPANIES = MOCK_DRIVERS.reduce((acc, driver) => {
  acc[driver.id] = driver.companyId;
  return acc;
}, {});

const MOCK_AGENCY_COMPANIES = MOCK_AGENCIES.reduce((acc, agency) => {
  acc[agency.id] = agency.companyId ?? '';
  return acc;
}, {});
