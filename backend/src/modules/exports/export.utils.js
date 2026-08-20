import { EXPORT_EXTENSIONS, EXPORT_MIME } from './index.js';

const DANGEROUS_CSV_CHARS = /^[=+\-@\t\r]/;

export function sanitizeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (DANGEROUS_CSV_CHARS.test(str)) {
    return `\t${str}`;
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 80);
}

export function buildExportFilename(reportType, format, dateStr) {
  const safe = sanitizeFilename(reportType);
  const ext = EXPORT_EXTENSIONS[format];
  const date = dateStr || new Date().toISOString().slice(0, 10);
  return `navix-${safe}-${date}.${ext}`;
}

export function getContentType(format) {
  return EXPORT_MIME[format] || EXPORT_MIME.csv;
}

export function getContentDisposition(filename) {
  return `attachment; filename="${filename}"`;
}

export function formatValue(value, format) {
  if (value === null || value === undefined) return '';
  if (format === 'money') {
    const num = Number(value);
    return isNaN(num) ? value : num.toLocaleString('fr-FR');
  }
  if (format === 'percent') {
    const num = Number(value);
    return isNaN(num) ? value : `${num.toFixed(1)} %`;
  }
  if (format === 'distance') {
    const num = Number(value);
    return isNaN(num) ? value : `${num.toLocaleString('fr-FR')} km`;
  }
  return value;
}

export function extractTableRows(report, columns) {
  if (!report || !Array.isArray(report.rows)) return [];
  if (!columns || columns.length === 0) {
    if (report.rows.length === 0) return [];
    const keys = Object.keys(report.rows[0]);
    return report.rows.map((row) => keys.map((k) => row[k] ?? ''));
  }
  return report.rows.map((row) => columns.map((col) => row[col.key] ?? ''));
}

export function extractTableHeaders(columns) {
  if (!columns || columns.length === 0) return [];
  return columns.map((col) => col.label);
}

export function extractTableKeys(columns) {
  if (!columns || columns.length === 0) return [];
  return columns.map((col) => col.key);
}
