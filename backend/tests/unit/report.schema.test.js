import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  reportFilterSchema, reportQuerySchema, customReportSchema,
  savedReportSchema, savedReportIdParamSchema, savedReportQuerySchema,
  exportReportSchema,
} from '../../src/modules/reports/report.schema.js';

describe('Report Schemas', () => {
  describe('reportFilterSchema', () => {
    it('accepts valid filter with all fields', () => {
      const result = reportFilterSchema.safeParse({
        companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
        agencyId: '01J8A2B3C4D5E6F7G8H9J0K1L3',
        vehicleGroup: 'A',
        vehicleId: '01J8A2B3C4D5E6F7G8H9J0K1L4',
        driverId: '01J8A2B3C4D5E6F7G8H9J0K1L5',
        status: 'active',
        planCode: 'starter',
        tripType: 'mission',
        maintenanceType: 'vidange',
        documentCategory: 'contrat',
        period: 'thisMonth',
        dateFrom: '2026-01-01',
        dateTo: '2026-08-20',
      });
      assert.ok(result.success);
    });

    it('accepts empty filter', () => {
      const result = reportFilterSchema.safeParse({});
      assert.ok(result.success);
    });

    it('accepts filter with only period', () => {
      const result = reportFilterSchema.safeParse({ period: 'last30' });
      assert.ok(result.success);
    });

    it('rejects invalid period', () => {
      const result = reportFilterSchema.safeParse({ period: 'invalid' });
      assert.ok(!result.success);
    });
  });

  describe('reportQuerySchema', () => {
    it('accepts valid query params', () => {
      const result = reportQuerySchema.safeParse({
        period: 'last90',
        dateFrom: '2026-01-01',
        dateTo: '2026-08-20',
      });
      assert.ok(result.success);
    });

    it('accepts empty query', () => {
      const result = reportQuerySchema.safeParse({});
      assert.ok(result.success);
    });

    it('accepts query with all valid period values', () => {
      const periods = ['today', 'yesterday', 'last7', 'last30', 'last90', 'last180', 'last365',
        'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisQuarter', 'lastQuarter', 'thisYear', 'lastYear'];
      for (const period of periods) {
        const result = reportQuerySchema.safeParse({ period });
        assert.ok(result.success, `Period '${period}' should be valid`);
      }
    });
  });

  describe('customReportSchema', () => {
    it('accepts valid custom report config', () => {
      const result = customReportSchema.safeParse({
        source: 'fleet',
        indicators: ['total', 'availabilityRate'],
        period: 'thisMonth',
      });
      assert.ok(result.success);
    });

    it('accepts custom report with dateFrom/dateTo', () => {
      const result = customReportSchema.safeParse({
        source: 'fuel',
        indicators: ['totalCost'],
        period: 'custom',
        dateFrom: '2026-01-01',
        dateTo: '2026-06-30',
      });
      assert.ok(result.success);
    });

    it('rejects missing source', () => {
      const result = customReportSchema.safeParse({
        indicators: ['total'],
      });
      assert.ok(!result.success);
    });

    it('rejects empty indicators', () => {
      const result = customReportSchema.safeParse({
        source: 'fleet',
        indicators: [],
      });
      assert.ok(!result.success);
    });

    it('rejects invalid source', () => {
      const result = customReportSchema.safeParse({
        source: 'invalid_source',
        indicators: ['total'],
      });
      assert.ok(!result.success);
    });

    it('accepts all valid custom report sources', () => {
      const sources = ['fleet', 'vehicles', 'drivers', 'assignments', 'trips',
        'fuel', 'maintenance', 'documents', 'invoices', 'payments', 'audit'];
      for (const source of sources) {
        const result = customReportSchema.safeParse({ source, indicators: ['total'] });
        assert.ok(result.success, `Source '${source}' should be valid`);
      }
    });
  });

  describe('savedReportSchema', () => {
    it('accepts valid saved report', () => {
      const result = savedReportSchema.safeParse({
        name: 'Rapport mensuel flotte',
        description: 'Rapport de la flotte pour le mois',
        reportType: 'fleet',
        status: 'draft',
      });
      assert.ok(result.success);
    });

    it('accepts saved report with minimal fields', () => {
      const result = savedReportSchema.safeParse({
        name: 'Mon rapport',
        reportType: 'fuel',
      });
      assert.ok(result.success);
    });

    it('rejects name too short', () => {
      const result = savedReportSchema.safeParse({
        name: 'ab',
        reportType: 'fleet',
      });
      assert.ok(!result.success);
    });

    it('rejects name too long', () => {
      const result = savedReportSchema.safeParse({
        name: 'a'.repeat(81),
        reportType: 'fleet',
      });
      assert.ok(!result.success);
    });

    it('rejects invalid reportType', () => {
      const result = savedReportSchema.safeParse({
        name: 'Mon rapport',
        reportType: 'invalid',
      });
      assert.ok(!result.success);
    });

    it('rejects invalid status', () => {
      const result = savedReportSchema.safeParse({
        name: 'Mon rapport',
        reportType: 'fleet',
        status: 'invalid',
      });
      assert.ok(!result.success);
    });

    it('accepts valid statuses', () => {
      for (const status of ['draft', 'active', 'archived']) {
        const result = savedReportSchema.safeParse({
          name: 'Mon rapport',
          reportType: 'fleet',
          status,
        });
        assert.ok(result.success, `Status '${status}' should be valid`);
      }
    });

    it('accepts configuration object', () => {
      const result = savedReportSchema.safeParse({
        name: 'Mon rapport',
        reportType: 'fuel',
        configuration: { period: 'last30', filters: { status: 'active' } },
      });
      assert.ok(result.success);
    });
  });

  describe('savedReportIdParamSchema', () => {
    it('accepts valid ID', () => {
      const result = savedReportIdParamSchema.safeParse({ id: '01J8A2B3C4D5E6F7G8H9J0K1L2' });
      assert.ok(result.success);
    });

    it('rejects empty ID', () => {
      const result = savedReportIdParamSchema.safeParse({ id: '' });
      assert.ok(!result.success);
    });
  });

  describe('savedReportQuerySchema', () => {
    it('accepts valid query', () => {
      const result = savedReportQuerySchema.safeParse({
        page: 1,
        limit: 20,
        reportType: 'fleet',
        status: 'active',
        search: 'rapport',
      });
      assert.ok(result.success);
    });

    it('accepts empty query', () => {
      const result = savedReportQuerySchema.safeParse({});
      assert.ok(result.success);
    });

    it('applies defaults', () => {
      const result = savedReportQuerySchema.safeParse({});
      assert.equal(result.data.page, 1);
      assert.equal(result.data.limit, 20);
    });

    it('rejects invalid page', () => {
      const result = savedReportQuerySchema.safeParse({ page: 0 });
      assert.ok(!result.success);
    });

    it('rejects limit over 100', () => {
      const result = savedReportQuerySchema.safeParse({ limit: 101 });
      assert.ok(!result.success);
    });
  });

  describe('exportReportSchema', () => {
    it('accepts valid export request', () => {
      const result = exportReportSchema.safeParse({
        format: 'csv',
        reportType: 'fleet',
        filters: { period: 'thisMonth' },
      });
      assert.ok(result.success);
    });

    it('defaults format to csv', () => {
      const result = exportReportSchema.safeParse({});
      assert.equal(result.data.format, 'csv');
    });

    it('accepts all formats', () => {
      for (const format of ['csv', 'json', 'xlsx', 'pdf']) {
        const result = exportReportSchema.safeParse({ format });
        assert.ok(result.success, `Format '${format}' should be valid`);
      }
    });

    it('rejects invalid format', () => {
      const result = exportReportSchema.safeParse({ format: 'xml' });
      assert.ok(!result.success);
    });
  });
});
