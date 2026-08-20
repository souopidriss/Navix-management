import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8112;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let server;
let token;
let companyId;

function auth(t) { return { Authorization: `Bearer ${t}` }; }

async function req(method, path, body = null, headers = {}) {
  const options = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (body && method !== 'GET') options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

describe('Reports & Analytics (Integration)', () => {
  before(async () => {
    createPool();
    await new Promise((resolve) => { server = app.listen(PORT, resolve); });

    const ts = Date.now();
    const reg = await req('POST', '/auth/register', {
      firstName: 'Report', lastName: 'Admin',
      email: `report_inttest_${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'ReportIntTest Corp', role: 'client_enterprise',
    });
    assert.strictEqual(reg.status, 201);
    token = reg.data.data.tokens.accessToken;
    companyId = reg.data.data.company.id;
  });

  after(async () => {
    const pool = getPool();
    if (companyId) {
      await pool.query('DELETE FROM saved_reports WHERE company_id = ?', [companyId]);
      await pool.query('DELETE FROM users WHERE email LIKE ?', ['%report_inttest_%']);
      await pool.query('DELETE FROM companies WHERE name LIKE ?', ['ReportIntTest%']);
    }
    if (server) await new Promise((resolve) => server.close(resolve));
    await closePool();
  });

  describe('Dashboard Metrics', () => {
    it('GET /reports/statistics returns overview data', async () => {
      const res = await req('GET', '/reports/statistics', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.data);
      assert.equal(res.data.data.reportType, 'overview');
      assert.ok(Array.isArray(res.data.data.statistics));
      assert.ok(res.data.data.series);
      assert.ok(res.data.data.breakdown);
    });

    it('GET /reports/statistics with period filter', async () => {
      const res = await req('GET', '/reports/statistics?period=last30', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.data.period);
    });
  });

  describe('Fleet Report', () => {
    it('GET /reports/fleet returns fleet report', async () => {
      const res = await req('GET', '/reports/fleet', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'fleet');
      assert.ok(Array.isArray(res.data.data.statistics));
      assert.ok(Array.isArray(res.data.data.rows));
      assert.ok(res.data.data.summary);
      assert.equal(typeof res.data.data.summary.count, 'number');
    });

    it('GET /reports/fleet with period thisMonth', async () => {
      const res = await req('GET', '/reports/fleet?period=thisMonth', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.data.reportType, 'fleet');
    });
  });

  describe('Vehicle Report', () => {
    it('GET /reports/vehicles returns vehicle report', async () => {
      const res = await req('GET', '/reports/vehicles', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'vehicles');
      assert.ok(Array.isArray(res.data.data.rows));
      assert.equal(typeof res.data.data.summary.count, 'number');
      assert.equal(typeof res.data.data.summary.tripCount, 'number');
    });
  });

  describe('Driver Report', () => {
    it('GET /reports/drivers returns driver report', async () => {
      const res = await req('GET', '/reports/drivers', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'drivers');
      assert.ok(Array.isArray(res.data.data.rows));
    });
  });

  describe('Assignment Report', () => {
    it('GET /reports/assignments returns assignment report', async () => {
      const res = await req('GET', '/reports/assignments', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'assignments');
      assert.ok(Array.isArray(res.data.data.rows));
    });
  });

  describe('Trip Report', () => {
    it('GET /reports/trips returns trip report', async () => {
      const res = await req('GET', '/reports/trips', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'trips');
      assert.ok(Array.isArray(res.data.data.rows));
      assert.ok(res.data.data.series);
    });
  });

  describe('Fuel Report', () => {
    it('GET /reports/fuel returns fuel report', async () => {
      const res = await req('GET', '/reports/fuel', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'fuel');
      assert.ok(Array.isArray(res.data.data.rows));
    });
  });

  describe('Maintenance Report', () => {
    it('GET /reports/maintenance returns maintenance report', async () => {
      const res = await req('GET', '/reports/maintenance', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'maintenance');
      assert.ok(Array.isArray(res.data.data.rows));
    });
  });

  describe('Document Report', () => {
    it('GET /reports/documents returns document report', async () => {
      const res = await req('GET', '/reports/documents', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'documents');
      assert.ok(Array.isArray(res.data.data.rows));
    });
  });

  describe('Financial Report', () => {
    it('GET /reports/financial returns financial report', async () => {
      const res = await req('GET', '/reports/financial', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'financial');
      assert.ok(Array.isArray(res.data.data.rows));
    });
  });

  describe('Subscription Report', () => {
    it('GET /reports/subscriptions returns subscription report', async () => {
      const res = await req('GET', '/reports/subscriptions', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'subscriptions');
      assert.ok(Array.isArray(res.data.data.rows));
    });
  });

  describe('Audit Report', () => {
    it('GET /reports/audit returns audit report', async () => {
      const res = await req('GET', '/reports/audit', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'audit');
      assert.ok(Array.isArray(res.data.data.rows));
    });
  });

  describe('Company Report', () => {
    it('GET /reports/companies returns company report', async () => {
      const res = await req('GET', '/reports/companies', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'companies');
      assert.ok(Array.isArray(res.data.data.rows));
    });
  });

  describe('Custom Report', () => {
    it('POST /reports/custom creates custom report', async () => {
      const res = await req('POST', '/reports/custom', {
        source: 'fleet',
        indicators: ['total', 'availabilityRate'],
        period: 'thisMonth',
      }, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.reportType, 'custom');
      assert.equal(res.data.data.source, 'fleet');
    });

    it('POST /reports/custom rejects invalid source', async () => {
      const res = await req('POST', '/reports/custom', {
        source: 'invalid',
        indicators: ['total'],
      }, auth(token));
      assert.equal(res.status, 422);
    });
  });

  describe('Export Report', () => {
    it('POST /reports/export returns export data', async () => {
      const res = await req('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
        filters: { period: 'thisMonth' },
      }, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.format, 'csv');
      assert.equal(typeof res.data.data.count, 'number');
      assert.ok(res.data.data.exportedAt);
    });
  });

  describe('Categories', () => {
    it('GET /reports/categories returns filter options', async () => {
      const res = await req('GET', '/reports/categories', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.data);
      assert.ok(Array.isArray(res.data.data.agencies));
      assert.ok(Array.isArray(res.data.data.vehicles));
      assert.ok(Array.isArray(res.data.data.drivers));
    });
  });

  describe('Saved Reports', () => {
    let savedReportId;

    it('POST /reports creates a saved report', async () => {
      const res = await req('POST', '/reports', {
        name: 'Test Rapport Flotte',
        description: 'Rapport de test pour la flotte',
        reportType: 'fleet',
        status: 'draft',
      }, auth(token));
      assert.equal(res.status, 201);
      assert.equal(res.data.success, true);
      assert.ok(res.data.data.id);
      assert.equal(res.data.data.name, 'Test Rapport Flotte');
      assert.equal(res.data.data.report_type, 'fleet');
      savedReportId = res.data.data.id;
    });

    it('GET /reports lists saved reports', async () => {
      const res = await req('GET', '/reports', null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.pagination);
    });

    it('GET /reports/:id returns a saved report', async () => {
      const res = await req('GET', `/reports/${savedReportId}`, null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.id, savedReportId);
    });

    it('POST /reports/:id updates a saved report', async () => {
      const res = await req('POST', `/reports/${savedReportId}`, {
        name: 'Test Rapport Flotte Updated',
        status: 'active',
      }, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.name, 'Test Rapport Flotte Updated');
    });

    it('DELETE /reports/:id deletes a saved report', async () => {
      const res = await req('DELETE', `/reports/${savedReportId}`, null, auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
    });

    it('GET /reports/:id returns 404 for deleted report', async () => {
      const res = await req('GET', `/reports/${savedReportId}`, null, auth(token));
      assert.equal(res.status, 404);
    });
  });

  describe('Authentication', () => {
    it('GET /reports/fleet returns 401 without token', async () => {
      const res = await req('GET', '/reports/fleet');
      assert.equal(res.status, 401);
    });

    it('GET /reports/statistics returns 401 without token', async () => {
      const res = await req('GET', '/reports/statistics');
      assert.equal(res.status, 401);
    });
  });

  describe('Response Structure Validation', () => {
    it('all report types return consistent structure', async () => {
      const reportTypes = ['fleet', 'vehicles', 'drivers', 'assignments', 'trips',
        'fuel', 'maintenance', 'documents', 'financial', 'subscriptions', 'audit', 'companies'];

      for (const type of reportTypes) {
        const res = await req('GET', `/reports/${type}`, null, auth(token));
        assert.equal(res.status, 200, `GET /reports/${type} should return 200`);
        assert.equal(res.data.success, true);

        const report = res.data.data;
        assert.equal(report.reportType, type, `reportType should be '${type}'`);
        assert.ok(report.period, `should have period`);
        assert.ok(Array.isArray(report.statistics), `should have statistics array`);
        assert.ok(report.series, `should have series`);
        assert.ok(report.breakdown, `should have breakdown`);
        assert.ok(Array.isArray(report.top), `should have top array`);
        assert.ok(Array.isArray(report.rows), `should have rows array`);
        assert.ok(report.summary, `should have summary`);

        for (const stat of report.statistics) {
          assert.ok(stat.key, `stat should have key`);
          assert.ok(stat.label, `stat should have label`);
          assert.equal(typeof stat.value, 'string', `stat.value should be string`);
          assert.equal(typeof stat.raw, 'number', `stat.raw should be number`);
        }
      }
    });
  });
});
