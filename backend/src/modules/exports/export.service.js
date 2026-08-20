import * as reportService from '../reports/report.service.js';
import companyRepository from '../../repositories/CompanyRepository.js';
import { generateCsvBuffer } from './generators/csv.generator.js';
import { generateExcel } from './generators/excel.generator.js';
import { generatePdf } from './generators/pdf.generator.js';
import { buildExportFilename, getContentType, getContentDisposition } from './export.utils.js';
import { REPORT_EXPORT_COLUMNS, REPORT_TYPE_LABELS, MAX_EXPORT_ROWS } from './index.js';
import { resolvePeriod } from '../../utils/report.utils.js';

const EXPORT_SOURCES = [
  'fleet', 'vehicles', 'drivers', 'assignments', 'trips',
  'fuel', 'maintenance', 'documents', 'financial',
  'subscriptions', 'audit', 'companies',
];

function getColumnsForSource(source) {
  return REPORT_EXPORT_COLUMNS[source] || REPORT_EXPORT_COLUMNS.fleet;
}

function getTitleForSource(source) {
  return REPORT_TYPE_LABELS[source] || source;
}

async function fetchReportData(source, companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const report = await reportService.generateReportByType(source, companyId, {
    ...filters,
    period: filters.period || undefined,
    dateFrom: range.from || undefined,
    dateTo: range.to || undefined,
  });

  const rows = Array.isArray(report.rows) ? report.rows.slice(0, MAX_EXPORT_ROWS) : [];
  return { report, rows };
}

async function getCompanyInfo(companyId) {
  if (!companyId) return null;
  try {
    return await companyRepository.findById(companyId);
  } catch {
    return null;
  }
}

export async function generateExport(source, format, companyId, filters) {
  if (!EXPORT_SOURCES.includes(source)) {
    throw new Error(`Source d'export inconnue: ${source}`);
  }

  const columns = getColumnsForSource(source);
  const { rows } = await fetchReportData(source, companyId, filters);
  const company = await getCompanyInfo(companyId);

  const period = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const genOptions = {
    title: getTitleForSource(source),
    company: company?.name || '',
    period: { from: period.from || '', to: period.to || '' },
    filters,
    reportType: source,
  };

  let buffer;
  switch (format) {
    case 'csv':
      buffer = generateCsvBuffer(columns, rows, genOptions);
      break;
    case 'xlsx':
      buffer = await generateExcel(columns, rows, genOptions);
      break;
    case 'pdf':
      buffer = await generatePdf(columns, rows, genOptions);
      break;
    default:
      throw new Error(`Format non supporté: ${format}`);
  }

  const filename = buildExportFilename(source, format);
  const contentType = getContentType(format);
  const contentDisposition = getContentDisposition(filename);

  return {
    buffer,
    filename,
    contentType,
    contentDisposition,
    count: rows.length,
    format,
    exportedAt: new Date().toISOString(),
  };
}

export async function generateReportExport(reportType, format, companyId, filters) {
  return generateExport(reportType, format, companyId, filters);
}

export async function generateAuditExport(format, companyId, filters) {
  return generateExport('audit', format, companyId, filters);
}
