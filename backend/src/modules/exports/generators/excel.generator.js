import ExcelJS from 'exceljs';
import { extractTableHeaders, extractTableKeys } from '../export.utils.js';

export async function generateExcel(columns, rows, options = {}) {
  const { title, company, period, filters } = options;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Navix Management';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title || 'Rapport');

  let currentRow = 1;

  if (title) {
    sheet.mergeCells(currentRow, 1, currentRow, Math.max(columns?.length || 1, 2));
    const titleCell = sheet.getCell(currentRow, 1);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF1A237E' } };
    currentRow++;
  }

  if (company) {
    sheet.mergeCells(currentRow, 1, currentRow, Math.max(columns?.length || 1, 2));
    const companyCell = sheet.getCell(currentRow, 1);
    companyCell.value = `Entreprise: ${company}`;
    companyCell.font = { size: 11, color: { argb: 'FF616161' } };
    currentRow++;
  }

  if (period?.from || period?.to) {
    sheet.mergeCells(currentRow, 1, currentRow, Math.max(columns?.length || 1, 2));
    const periodCell = sheet.getCell(currentRow, 1);
    periodCell.value = `Période: ${period.from || ''} — ${period.to || ''}`;
    periodCell.font = { size: 10, color: { argb: 'FF757575' } };
    currentRow++;
  }

  if (filters && Object.keys(filters).length > 0) {
    const activeFilters = Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}: ${v}`);
    if (activeFilters.length > 0) {
      sheet.mergeCells(currentRow, 1, currentRow, Math.max(columns?.length || 1, 2));
      const filterCell = sheet.getCell(currentRow, 1);
      filterCell.value = `Filtres: ${activeFilters.join(' | ')}`;
      filterCell.font = { size: 10, italic: true, color: { argb: 'FF9E9E9E' } };
      currentRow++;
    }
  }

  currentRow++;

  const headers = extractTableHeaders(columns);
  const keys = extractTableKeys(columns);

  if (headers.length > 0) {
    const headerRow = sheet.getRow(currentRow);
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: 'FF1A237E' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF1A237E' } },
      };
    });
    sheet.autoFilter = {
      from: { row: currentRow, column: 1 },
      to: { row: currentRow, column: headers.length },
    };
    currentRow++;
  }

  if (rows.length > 0) {
    const actualKeys = keys.length > 0 ? keys : Object.keys(rows[0]);
    for (const row of rows) {
      const dataRow = sheet.getRow(currentRow);
      actualKeys.forEach((key, i) => {
        const cell = dataRow.getCell(i + 1);
        const val = row[key];
        if (val === null || val === undefined) {
          cell.value = '';
        } else if (typeof val === 'number') {
          cell.value = val;
          cell.numFmt = '#,##0.##';
        } else if (typeof val === 'object') {
          cell.value = JSON.stringify(val);
        } else {
          cell.value = String(val);
        }
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };
      });
      currentRow++;
    }
  }

  if (headers.length > 0) {
    for (let i = 1; i <= headers.length; i++) {
      const col = sheet.getColumn(i);
      const headerLen = headers[i - 1]?.length || 10;
      let maxLen = headerLen;
      const dataRows = sheet.getColumn(i).values || [];
      for (const cell of dataRows) {
        const len = cell ? String(cell).length : 0;
        if (len > maxLen) maxLen = len;
      }
      col.width = Math.min(maxLen + 4, 50);
    }
  }

  currentRow++;
  const footerRow = currentRow;
  sheet.mergeCells(footerRow, 1, footerRow, Math.max(headers.length, 2));
  const footerCell = sheet.getCell(footerRow, 1);
  footerCell.value = `Généré le ${new Date().toLocaleDateString('fr-FR')} par Navix Management`;
  footerCell.font = { size: 9, italic: true, color: { argb: 'FF9E9E9E' } };

  sheet.views = [{ state: 'frozen', ySplit: headers.length > 0 ? (currentRow - rows.length - 2) : 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
