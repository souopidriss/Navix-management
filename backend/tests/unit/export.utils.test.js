import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  sanitizeCsvValue,
  sanitizeFilename,
  buildExportFilename,
  getContentType,
  getContentDisposition,
  formatValue,
  extractTableHeaders,
  extractTableKeys,
} from '../../src/modules/exports/export.utils.js';
import {
  generateCsv,
  generateCsvBuffer,
} from '../../src/modules/exports/generators/csv.generator.js';
import { EXPORT_FORMATS, REPORT_EXPORT_COLUMNS, MAX_EXPORT_ROWS } from '../../src/modules/exports/index.js';
import { exportQuerySchema, exportSourceParamSchema, exportReportBodySchema } from '../../src/modules/exports/export.schema.js';

/* -----------------------------------------------------------------------
   EXPORT UTILS
   ----------------------------------------------------------------------- */

describe('Export Utils', () => {
  describe('sanitizeCsvValue', () => {
    it('returns empty string for null', () => {
      assert.strictEqual(sanitizeCsvValue(null), '');
    });
    it('returns empty string for undefined', () => {
      assert.strictEqual(sanitizeCsvValue(undefined), '');
    });
    it('returns plain string for simple values', () => {
      assert.strictEqual(sanitizeCsvValue('hello'), 'hello');
    });
    it('escapes commas', () => {
      assert.strictEqual(sanitizeCsvValue('a,b'), '"a,b"');
    });
    it('escapes double quotes', () => {
      assert.strictEqual(sanitizeCsvValue('say "hi"'), '"say ""hi"""');
    });
    it('escapes newlines', () => {
      assert.strictEqual(sanitizeCsvValue('line1\nline2'), '"line1\nline2"');
    });
    it('prefixes CSV formula injection: =SUM()', () => {
      const result = sanitizeCsvValue('=SUM(A1)');
      assert.ok(result.startsWith('\t'));
      assert.ok(!result.startsWith('='));
    });
    it('prefixes CSV formula injection: +cmd()', () => {
      const result = sanitizeCsvValue('+cmd()');
      assert.ok(result.startsWith('\t'));
    });
    it('prefixes CSV formula injection: -2+3', () => {
      const result = sanitizeCsvValue('-2+3');
      assert.ok(result.startsWith('\t'));
    });
    it('prefixes CSV formula injection: @SUM()', () => {
      const result = sanitizeCsvValue('@SUM(A1)');
      assert.ok(result.startsWith('\t'));
    });
    it('handles numbers', () => {
      assert.strictEqual(sanitizeCsvValue(42), '42');
    });
    it('handles boolean values', () => {
      assert.strictEqual(sanitizeCsvValue(true), 'true');
    });
    it('handles French characters', () => {
      assert.strictEqual(sanitizeCsvValue('éèàçùœ'), 'éèàçùœ');
    });
    it('handles tab prefix injection', () => {
      const result = sanitizeCsvValue('\tformula');
      assert.ok(result.startsWith('\t'));
    });
  });

  describe('sanitizeFilename', () => {
    it('removes special characters', () => {
      assert.strictEqual(sanitizeFilename('report@#$.csv'), 'reportcsv');
    });
    it('replaces spaces with hyphens', () => {
      assert.strictEqual(sanitizeFilename('my report'), 'my-report');
    });
    it('lowercases', () => {
      assert.strictEqual(sanitizeFilename('REPORT'), 'report');
    });
    it('truncates at 80 chars', () => {
      const long = 'a'.repeat(100);
      assert.strictEqual(sanitizeFilename(long).length, 80);
    });
    it('handles French characters', () => {
      const result = sanitizeFilename('rapport vélo');
      assert.ok(!result.includes('é'));
    });
  });

  describe('buildExportFilename', () => {
    it('builds correct filename for csv', () => {
      const name = buildExportFilename('fleet', 'csv', '2026-08-20');
      assert.strictEqual(name, 'navix-fleet-2026-08-20.csv');
    });
    it('builds correct filename for xlsx', () => {
      const name = buildExportFilename('vehicles', 'xlsx', '2026-01-01');
      assert.strictEqual(name, 'navix-vehicles-2026-01-01.xlsx');
    });
    it('builds correct filename for pdf', () => {
      const name = buildExportFilename('drivers', 'pdf', '2026-12-31');
      assert.strictEqual(name, 'navix-drivers-2026-12-31.pdf');
    });
    it('uses today date if no date provided', () => {
      const name = buildExportFilename('fleet', 'csv');
      const today = new Date().toISOString().slice(0, 10);
      assert.ok(name.includes(today));
    });
  });

  describe('getContentType', () => {
    it('returns csv mime', () => {
      assert.ok(getContentType('csv').includes('text/csv'));
    });
    it('returns xlsx mime', () => {
      assert.ok(getContentType('xlsx').includes('spreadsheetml'));
    });
    it('returns pdf mime', () => {
      assert.strictEqual(getContentType('pdf'), 'application/pdf');
    });
  });

  describe('getContentDisposition', () => {
    it('returns attachment with filename', () => {
      const result = getContentDisposition('test.csv');
      assert.ok(result.includes('attachment'));
      assert.ok(result.includes('test.csv'));
    });
  });

  describe('formatValue', () => {
    it('formats money', () => {
      const result = formatValue(1234567, 'money');
      assert.ok(result.includes('1'));
      assert.ok(result.includes('234'));
    });
    it('formats percent', () => {
      assert.strictEqual(formatValue(85.3, 'percent'), '85.3 %');
    });
    it('formats distance', () => {
      assert.ok(formatValue(1500, 'distance').includes('km'));
    });
    it('returns empty for null', () => {
      assert.strictEqual(formatValue(null, 'money'), '');
    });
    it('passes through unknown format', () => {
      assert.strictEqual(formatValue('test', 'unknown'), 'test');
    });
  });

  describe('extractTableHeaders', () => {
    it('returns labels', () => {
      const cols = [{ key: 'a', label: 'Alpha' }, { key: 'b', label: 'Beta' }];
      assert.deepStrictEqual(extractTableHeaders(cols), ['Alpha', 'Beta']);
    });
    it('returns empty for empty columns', () => {
      assert.deepStrictEqual(extractTableHeaders([]), []);
    });
    it('returns empty for null', () => {
      assert.deepStrictEqual(extractTableHeaders(null), []);
    });
  });

  describe('extractTableKeys', () => {
    it('returns keys', () => {
      const cols = [{ key: 'a', label: 'Alpha' }, { key: 'b', label: 'Beta' }];
      assert.deepStrictEqual(extractTableKeys(cols), ['a', 'b']);
    });
  });
});

/* -----------------------------------------------------------------------
   CSV GENERATOR
   ----------------------------------------------------------------------- */

describe('CSV Generator', () => {
  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'value', label: 'Valeur' },
  ];
  const rows = [
    { name: 'Test', value: 100 },
    { name: 'Dangerous', value: '=SUM(A1)' },
    { name: 'French', value: 'café' },
  ];

  it('generates CSV string with headers', () => {
    const csv = generateCsv(columns, rows);
    assert.ok(csv.includes('Nom,Valeur'));
    assert.ok(csv.includes('Test,100'));
  });
  it('protects against CSV injection', () => {
    const csv = generateCsv(columns, rows);
    assert.ok(!csv.startsWith('=SUM'));
    assert.ok(csv.includes('\t=SUM(A1)'));
  });
  it('handles empty rows', () => {
    const csv = generateCsv(columns, []);
    assert.ok(csv.includes('Nom,Valeur'));
    assert.ok(!csv.includes('Test'));
  });
  it('includes title if provided', () => {
    const csv = generateCsv(columns, rows, { title: 'Rapport Test' });
    assert.ok(csv.includes('Rapport Test'));
  });
  it('includes company if provided', () => {
    const csv = generateCsv(columns, rows, { company: 'Navix Corp' });
    assert.ok(csv.includes('Navix Corp'));
  });
  it('includes period if provided', () => {
    const csv = generateCsv(columns, rows, { period: { from: '2026-01-01', to: '2026-12-31' } });
    assert.ok(csv.includes('2026-01-01'));
    assert.ok(csv.includes('2026-12-31'));
  });
  it('includes filters if provided', () => {
    const csv = generateCsv(columns, rows, { filters: { status: 'active' } });
    assert.ok(csv.includes('status=active'));
  });
  it('generates buffer with UTF-8 BOM', () => {
    const buf = generateCsvBuffer(columns, rows);
    assert.ok(Buffer.isBuffer(buf));
    assert.strictEqual(buf[0], 0xEF);
    assert.strictEqual(buf[1], 0xBB);
    assert.strictEqual(buf[2], 0xBF);
  });
  it('returns "Aucune donnée" for empty columns and rows', () => {
    const csv = generateCsv([], []);
    assert.ok(csv.includes('Aucune donnée'));
  });
  it('handles French characters', () => {
    const csv = generateCsv(columns, [{ name: 'café', value: 'résumé' }]);
    assert.ok(csv.includes('café'));
    assert.ok(csv.includes('résumé'));
  });
  it('handles nested objects', () => {
    const csv = generateCsv(columns, [{ name: 'test', value: { a: 1 } }]);
    assert.ok(csv.includes('test'));
    assert.ok(csv.includes('"a"'));
  });
  it('handles null values', () => {
    const csv = generateCsv(columns, [{ name: null, value: undefined }]);
    assert.ok(csv);
  });
});

/* -----------------------------------------------------------------------
   EXPORT SCHEMA
   ----------------------------------------------------------------------- */

describe('Export Schemas', () => {
  describe('exportQuerySchema', () => {
    it('accepts valid query', () => {
      const result = exportQuerySchema.safeParse({ format: 'csv', period: 'last30' });
      assert.ok(result.success);
    });
    it('defaults format to csv', () => {
      const result = exportQuerySchema.safeParse({});
      assert.ok(result.success);
      assert.strictEqual(result.data.format, 'csv');
    });
    it('accepts xlsx format', () => {
      const result = exportQuerySchema.safeParse({ format: 'xlsx' });
      assert.ok(result.success);
    });
    it('accepts pdf format', () => {
      const result = exportQuerySchema.safeParse({ format: 'pdf' });
      assert.ok(result.success);
    });
    it('rejects invalid format', () => {
      const result = exportQuerySchema.safeParse({ format: 'exe' });
      assert.ok(!result.success);
    });
  });

  describe('exportSourceParamSchema', () => {
    it('accepts valid source', () => {
      const result = exportSourceParamSchema.safeParse({ source: 'fleet' });
      assert.ok(result.success);
    });
    it('accepts all valid sources', () => {
      const sources = Object.keys(REPORT_EXPORT_COLUMNS);
      for (const source of sources) {
        const result = exportSourceParamSchema.safeParse({ source });
        assert.ok(result.success, `Source ${source} should be valid`);
      }
    });
    it('rejects invalid source', () => {
      const result = exportSourceParamSchema.safeParse({ source: 'malicious' });
      assert.ok(!result.success);
    });
  });

  describe('exportReportBodySchema', () => {
    it('accepts valid body', () => {
      const result = exportReportBodySchema.safeParse({ format: 'pdf', reportType: 'fleet' });
      assert.ok(result.success);
    });
    it('defaults format to csv', () => {
      const result = exportReportBodySchema.safeParse({});
      assert.ok(result.success);
      assert.strictEqual(result.data.format, 'csv');
    });
  });
});

/* -----------------------------------------------------------------------
   EXPORT CONSTANTS
   ----------------------------------------------------------------------- */

describe('Export Constants', () => {
  it('has all export formats', () => {
    assert.deepStrictEqual(EXPORT_FORMATS, ['csv', 'xlsx', 'pdf']);
  });
  it('has columns for all report types', () => {
    const types = ['fleet', 'vehicles', 'drivers', 'assignments', 'trips', 'fuel', 'maintenance', 'documents', 'financial', 'subscriptions', 'audit', 'companies'];
    for (const type of types) {
      assert.ok(REPORT_EXPORT_COLUMNS[type], `Missing columns for ${type}`);
      assert.ok(REPORT_EXPORT_COLUMNS[type].length > 0, `Empty columns for ${type}`);
    }
  });
  it('has MAX_EXPORT_ROWS set', () => {
    assert.strictEqual(MAX_EXPORT_ROWS, 50000);
  });
  it('columns have key and label', () => {
    for (const [type, cols] of Object.entries(REPORT_EXPORT_COLUMNS)) {
      for (const col of cols) {
        assert.ok(col.key, `Column in ${type} missing key`);
        assert.ok(col.label, `Column in ${type} missing label`);
      }
    }
  });
});
