import { sanitizeCsvValue, extractTableHeaders, extractTableKeys } from '../export.utils.js';

export function generateCsv(columns, rows, options = {}) {
  const { title, company, period, filters } = options;
  const lines = [];

  if (title) lines.push(`"Rapport","${sanitizeCsvValue(title)}"`);
  if (company) lines.push(`"Entreprise","${sanitizeCsvValue(company)}"`);
  if (period?.from) lines.push(`"Date début","${sanitizeCsvValue(period.from)}"`);
  if (period?.to) lines.push(`"Date fin","${sanitizeCsvValue(period.to)}"`);
  if (filters && Object.keys(filters).length > 0) {
    const activeFilters = Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}=${v}`);
    if (activeFilters.length > 0) {
      lines.push(`"Filtres","${sanitizeCsvValue(activeFilters.join(', '))}"`);
    }
  }
  if (lines.length > 0) lines.push('');

  const headers = extractTableHeaders(columns);
  if (headers.length === 0 && rows.length === 0) {
    lines.push('Aucune donnée');
    return lines.join('\r\n');
  }

  if (headers.length > 0) {
    lines.push(headers.map((h) => sanitizeCsvValue(h)).join(','));
  }

  if (rows.length === 0) return lines.join('\r\n');

  const keys = columns && columns.length > 0 ? extractTableKeys(columns) : Object.keys(rows[0]);

  for (const row of rows) {
    const values = keys.map((key) => {
      const val = row[key];
      if (typeof val === 'object' && val !== null) return sanitizeCsvValue(JSON.stringify(val));
      return sanitizeCsvValue(val);
    });
    lines.push(values.join(','));
  }

  return lines.join('\r\n');
}

export function generateCsvBuffer(columns, rows, options = {}) {
  const csv = generateCsv(columns, rows, options);
  return Buffer.from('\uFEFF' + csv, 'utf-8');
}
