import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { ulid } from 'ulid';

const PORT = 8113;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let serverProcess;
let authToken;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  return res;
}

async function apiBlob(method, path, body = null, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  return res;
}

before(async () => {
  process.env.PORT = PORT;
  process.env.JWT_SECRET = 'test-export-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-export-refresh-secret';
  const mod = await import('../../src/app.js');
  const app = mod.default;
  serverProcess = app.listen(PORT);
  await sleep(500);

  const testId = ulid().slice(0, 8);
  const regRes = await api('POST', '/auth/register', {
    firstName: 'Export',
    lastName: 'Testeur',
    email: `export-${testId}@example.com`,
    password: 'Test1234!',
    confirmPassword: 'Test1234!',
    companyName: 'Export Corp',
    role: 'client_enterprise',
  });
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  authToken = regData.data.tokens.accessToken;
});

after(async () => {
  if (serverProcess) {
    await new Promise((resolve) => serverProcess.close(resolve));
  }
  const { getPool } = await import('../../src/database/index.js');
  await getPool().end();
});

/* -----------------------------------------------------------------------
   REPORT EXPORT (POST /reports/export)
   ----------------------------------------------------------------------- */

describe('Exports & Document Reporting (Integration)', () => {
  describe('Report Export — CSV', () => {
    it('POST /reports/export returns CSV file', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
      }, authToken);
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('content-type').includes('text/csv'));
      assert.ok(res.headers.get('content-disposition').includes('attachment'));
      assert.ok(res.headers.get('content-disposition').includes('.csv'));
      const text = await res.text();
      assert.ok(text.length > 0);
    });
    it('POST /reports/export returns CSV with BOM', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
      }, authToken);
      const buf = Buffer.from(await res.arrayBuffer());
      assert.strictEqual(buf[0], 0xEF);
      assert.strictEqual(buf[1], 0xBB);
      assert.strictEqual(buf[2], 0xBF);
    });
    it('POST /reports/export CSV includes header row', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
      }, authToken);
      const text = await res.text();
      assert.ok(text.includes('Immatriculation') || text.includes('Aucune donnée'));
    });
  });

  describe('Report Export — XLSX', () => {
    it('POST /reports/export returns XLSX file', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'xlsx',
        reportType: 'fleet',
      }, authToken);
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('content-type').includes('spreadsheetml'));
      assert.ok(res.headers.get('content-disposition').includes('.xlsx'));
      const buf = Buffer.from(await res.arrayBuffer());
      assert.ok(buf.length > 0);
      assert.strictEqual(buf[0], 0x50);
      assert.strictEqual(buf[1], 0x4B);
    });
  });

  describe('Report Export — PDF', () => {
    it('POST /reports/export returns PDF file', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'pdf',
        reportType: 'fleet',
      }, authToken);
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('content-type').includes('application/pdf'));
      assert.ok(res.headers.get('content-disposition').includes('.pdf'));
      const buf = Buffer.from(await res.arrayBuffer());
      assert.ok(buf.length > 0);
      const header = buf.toString('ascii', 0, 5);
      assert.strictEqual(header, '%PDF-');
    });
  });

  describe('Report Export — All Types', () => {
    const reportTypes = ['fleet', 'vehicles', 'drivers', 'assignments', 'trips', 'fuel', 'maintenance', 'documents', 'financial', 'subscriptions', 'audit', 'companies'];
    for (const type of reportTypes) {
      it(`exports ${type} report as CSV`, async () => {
        const res = await apiBlob('POST', '/reports/export', {
          format: 'csv',
          reportType: type,
        }, authToken);
        assert.strictEqual(res.status, 200);
        assert.ok(res.headers.get('content-type').includes('text/csv'));
        const text = await res.text();
        assert.ok(text.length > 0);
      });
    }
  });

  describe('Export via GET /exports/:source', () => {
    it('GET /exports/fleet?format=csv returns CSV', async () => {
      const res = await apiBlob('GET', '/exports/fleet?format=csv', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('content-type').includes('text/csv'));
    });
    it('GET /exports/vehicles?format=xlsx returns XLSX', async () => {
      const res = await apiBlob('GET', '/exports/vehicles?format=xlsx', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('content-type').includes('spreadsheetml'));
    });
    it('GET /exports/drivers?format=pdf returns PDF', async () => {
      const res = await apiBlob('GET', '/exports/drivers?format=pdf', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('content-type').includes('application/pdf'));
    });
    it('rejects invalid source', async () => {
      const res = await apiBlob('GET', '/exports/malicious?format=csv', null, authToken);
      assert.ok(res.status >= 400);
    });
    it('rejects invalid format', async () => {
      const res = await apiBlob('GET', '/exports/fleet?format=exe', null, authToken);
      assert.ok(res.status >= 400);
    });
  });

  describe('Report Export with Filters', () => {
    it('exports with period filter', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
        filters: { period: 'last30' },
      }, authToken);
      assert.strictEqual(res.status, 200);
    });
    it('exports with status filter', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'vehicles',
        filters: { status: 'available' },
      }, authToken);
      assert.strictEqual(res.status, 200);
    });
  });

  describe('Export Headers', () => {
    it('returns X-Export-Count header', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
      }, authToken);
      assert.ok(res.headers.get('x-export-count') !== null);
    });
    it('returns X-Export-Format header', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
      }, authToken);
      assert.strictEqual(res.headers.get('x-export-format'), 'csv');
    });
    it('returns X-Exported-At header', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
      }, authToken);
      assert.ok(res.headers.get('x-exported-at'));
    });
  });

  describe('Authentication', () => {
    it('returns 401 without token for report export', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
      });
      assert.strictEqual(res.status, 401);
    });
    it('returns 401 without token for GET export', async () => {
      const res = await apiBlob('GET', '/exports/fleet?format=csv');
      assert.strictEqual(res.status, 401);
    });
  });

  describe('CSV Injection Protection', () => {
    it('CSV content is safe from formula injection', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
      }, authToken);
      const text = await res.text();
      const lines = text.split('\r\n').filter((l) => l.trim());
      for (const line of lines) {
        const firstChar = line.charAt(0);
        assert.ok(!['=', '+', '-'].includes(firstChar),
          `Line starts with dangerous char: ${firstChar} — ${line.slice(0, 50)}`);
      }
    });
  });

  describe('Empty Export', () => {
    it('returns CSV with headers for empty results', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
        filters: { vehicleId: '0000000000000000000000000' },
      }, authToken);
      assert.strictEqual(res.status, 200);
      const text = await res.text();
      assert.ok(text.length > 0);
    });
  });

  describe('Export File Naming', () => {
    it('CSV disposition has .csv filename', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'csv',
        reportType: 'fleet',
      }, authToken);
      const disposition = res.headers.get('content-disposition');
      assert.ok(disposition.includes('.csv'));
      assert.ok(disposition.includes('navix'));
    });
    it('XLSX disposition has .xlsx filename', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'xlsx',
        reportType: 'fleet',
      }, authToken);
      const disposition = res.headers.get('content-disposition');
      assert.ok(disposition.includes('.xlsx'));
    });
    it('PDF disposition has .pdf filename', async () => {
      const res = await apiBlob('POST', '/reports/export', {
        format: 'pdf',
        reportType: 'fleet',
      }, authToken);
      const disposition = res.headers.get('content-disposition');
      assert.ok(disposition.includes('.pdf'));
    });
  });
});
