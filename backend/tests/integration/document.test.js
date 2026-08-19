import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8106;
const BASE_URL = `http://localhost:${PORT}/api/v1`;
let server;

async function req(method, path, body, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

before(async () => {
  createPool();
  await new Promise((resolve) => { server = app.listen(PORT, resolve); });
  const pool = getPool();
  await pool.query('DELETE FROM files WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['DocIntTest%']);
  await pool.query('DELETE FROM companies WHERE name LIKE ?', ['DocIntTest%']);
  await pool.query('DELETE FROM users WHERE email LIKE ?', ['%doc_inttest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Documents Integration', () => {
  let tokenA, tokenB, companyIdA;
  let pdfTypeId, jpgTypeId;

  before(async () => {
    const ts = Date.now();

    const reg1 = await req('POST', '/auth/register', {
      firstName: 'Doc', lastName: 'AdminA',
      email: `doc_inttest_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'DocIntTest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    tokenA = reg1.data.data.tokens.accessToken;
    companyIdA = reg1.data.data.company.id;

    const reg2 = await req('POST', '/auth/register', {
      firstName: 'Doc', lastName: 'AdminB',
      email: `doc_inttest_b${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'DocIntTest Corp B', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    tokenB = reg2.data.data.tokens.accessToken;

    const ft1 = await req('GET', '/documents/file-types', null, {
      Authorization: `Bearer ${tokenA}`,
    });
    assert.strictEqual(ft1.status, 200);
    const pdfType = ft1.data.data.find((ft) => ft.title === 'PDF');
    pdfTypeId = pdfType?.id;
    const jpgType = ft1.data.data.find((ft) => ft.title === 'JPEG');
    jpgTypeId = jpgType?.id;
  });

  describe('File Types CRUD', () => {
    let customFileTypeId;

    it('should list default file types', async () => {
      const res = await req('GET', '/documents/file-types', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length >= 9);
    });

    it('should create a custom file type', async () => {
      const res = await req('POST', '/documents/file-types', {
        title: 'Custom Test Type',
        description: 'Test type',
        extensions: ['.tst'],
        mimeTypes: ['application/test'],
        maxSize: 5000000,
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.title, 'Custom Test Type');
      assert.deepStrictEqual(res.data.data.extensions, ['.tst']);
      customFileTypeId = res.data.data.id;
    });

    it('should reject duplicate file type title', async () => {
      const res = await req('POST', '/documents/file-types', {
        title: 'Custom Test Type',
        extensions: ['.tst'],
        maxSize: 5000000,
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 409);
    });

    it('should update file type', async () => {
      const res = await req('PUT', `/documents/file-types/${customFileTypeId}`, {
        title: 'Updated Test Type',
        description: 'Updated description',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.title, 'Updated Test Type');
    });

    it('should get file type by id', async () => {
      const res = await req('GET', `/documents/file-types/${pdfTypeId}`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.title, 'PDF');
    });

    it('should return 404 for unknown file type', async () => {
      const res = await req('GET', '/documents/file-types/01ZZZZZZZZZZZZZZZZZZZZZZZZ', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 404);
    });

    it('should delete unused file type', async () => {
      const res = await req('DELETE', `/documents/file-types/${customFileTypeId}`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, customFileTypeId);
    });
  });

  describe('Documents CRUD', () => {
    let documentId;

    it('should create a document (metadata only)', async () => {
      const res = await req('POST', '/documents', {
        companyId: companyIdA,
        fileTypeId: pdfTypeId,
        name: 'Facture.pdf',
        description: 'Facture du mois d\'août',
        visibility: 'private',
        associationType: 'vehicle',
        category: 'facture',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.data.id);
      assert.strictEqual(res.data.data.name, 'Facture.pdf');
      assert.strictEqual(res.data.data.visibility, 'private');
      assert.strictEqual(res.data.data.isPublic, false);
      assert.strictEqual(res.data.data.extension, '.pdf');
      assert.strictEqual(res.data.data.version, 1);
      assert.ok(res.data.data.fileNumber.startsWith('FL-'));
      documentId = res.data.data.id;
    });

    it('should create a public document', async () => {
      const res = await req('POST', '/documents', {
        companyId: companyIdA,
        fileTypeId: pdfTypeId,
        name: 'Doc Public',
        visibility: 'public',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.data.isPublic, true);
    });

    it('should create restricted document', async () => {
      const res = await req('POST', '/documents', {
        companyId: companyIdA,
        fileTypeId: jpgTypeId,
        name: 'Photo voiture',
        visibility: 'restricted',
        associationType: 'vehicle',
        category: 'photo',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.data.visibility, 'restricted');
    });

    it('should list all documents for company A', async () => {
      const res = await req('GET', '/documents', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length >= 3);
    });

    it('should get document by id', async () => {
      const res = await req('GET', `/documents/${documentId}`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, documentId);
      assert.strictEqual(res.data.data.name, 'Facture.pdf');
    });

    it('should return 404 for unknown document', async () => {
      const res = await req('GET', '/documents/01ZZZZZZZZZZZZZZZZZZZZZZZZ', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 404);
    });

    it('should update document metadata', async () => {
      const res = await req('PUT', `/documents/${documentId}`, {
        name: 'Facture Août 2026.pdf',
        description: 'Facture mise à jour',
        visibility: 'public',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.name, 'Facture Août 2026.pdf');
      assert.strictEqual(res.data.data.isPublic, true);
    });

    it('should download document (add downloadedAt)', async () => {
      const res = await req('GET', `/documents/${documentId}/download`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data.downloadedAt);
    });

    it('should preview document', async () => {
      const res = await req('GET', `/documents/${documentId}/preview`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, documentId);
    });

    it('should not see company A documents from company B', async () => {
      const res = await req('GET', `/documents/${documentId}`, null, {
        Authorization: `Bearer ${tokenB}`,
      });
      assert.strictEqual(res.status, 404);
    });

    it('should delete document', async () => {
      const res = await req('DELETE', `/documents/${documentId}`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, documentId);
    });

    it('should not find deleted document', async () => {
      const res = await req('GET', `/documents/${documentId}`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('File Type deletion protection', () => {
    it('should block deletion of file type used by documents', async () => {
      const createRes = await req('POST', '/documents', {
        companyId: companyIdA,
        fileTypeId: pdfTypeId,
        name: 'Test protection.pdf',
        visibility: 'private',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);

      const deleteRes = await req('DELETE', `/documents/file-types/${pdfTypeId}`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(deleteRes.status, 409);
      assert.strictEqual(deleteRes.data.error.code, 'FILE_TYPE_IN_USE');
    });
  });

  describe('Document Statistics', () => {
    it('should return statistics for company', async () => {
      const res = await req('GET', '/documents/stats', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(typeof res.data.data.totalCount === 'number');
      assert.ok(typeof res.data.data.totalSize === 'number');
      assert.ok(typeof res.data.data.monthCount === 'number');
      assert.ok(typeof res.data.data.yearCount === 'number');
      assert.ok(typeof res.data.data.vehicleCount === 'number');
      assert.ok(typeof res.data.data.maintenanceCount === 'number');
      assert.ok(typeof res.data.data.driverCount === 'number');
      assert.ok(typeof res.data.data.tripCount === 'number');
      assert.ok(typeof res.data.data.fuelCount === 'number');
      assert.ok(typeof res.data.data.publicCount === 'number');
      assert.ok(typeof res.data.data.privateCount === 'number');
      assert.ok(typeof res.data.data.restrictedCount === 'number');
      assert.ok(Array.isArray(res.data.data.typeDistribution));
      assert.ok(Array.isArray(res.data.data.visibilityDistribution));
      assert.ok(Array.isArray(res.data.data.sizeByType));
      assert.ok(typeof res.data.data.categoryDistribution === 'object');
      assert.ok(res.data.data.generatedAt);
    });
  });

  describe('Validation', () => {
    it('should reject document with invalid fileTypeId', async () => {
      const res = await req('POST', '/documents', {
        companyId: companyIdA,
        fileTypeId: '01ZZZZZZZZZZZZZZZZZZZZZZZZ',
        visibility: 'private',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject document with missing companyId', async () => {
      const res = await req('POST', '/documents', {
        fileTypeId: pdfTypeId,
        visibility: 'private',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject document with invalid visibility', async () => {
      const res = await req('POST', '/documents', {
        companyId: companyIdA,
        fileTypeId: pdfTypeId,
        visibility: 'hidden',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });
  });

  describe('Multi-tenant isolation', () => {
    it('should isolate file type lists by scope', async () => {
      const resA = await req('GET', '/documents/file-types', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      const resB = await req('GET', '/documents/file-types', null, {
        Authorization: `Bearer ${tokenB}`,
      });
      assert.strictEqual(resA.status, 200);
      assert.strictEqual(resB.status, 200);
      assert.strictEqual(resA.data.data.length, resB.data.data.length);
    });
  });
});
