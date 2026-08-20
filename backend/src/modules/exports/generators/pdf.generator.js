import PDFDocument from 'pdfkit';
import { extractTableHeaders, extractTableKeys } from '../export.utils.js';

const COLORS = {
  primary: '#1A237E',
  text: '#212121',
  muted: '#757575',
  border: '#E0E0E0',
  headerBg: '#1A237E',
  headerText: '#FFFFFF',
  rowAlt: '#F5F5F5',
};

export function generatePdf(columns, rows, options = {}) {
  return new Promise((resolve, reject) => {
    const { title, company, period, filters } = options;
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40,
      bufferPages: true,
      info: {
        Title: title || 'Rapport Navix',
        Author: 'Navix Management',
        Creator: 'Navix Management API',
        CreationDate: new Date(),
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const headers = extractTableHeaders(columns);
    const keys = extractTableKeys(columns);
    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const startY = doc.page.margins.top;
    let y = startY;

    const colWidths = calculateColumnWidths(headers, usableWidth);

    doc.fontSize(18).fillColor(COLORS.primary).font('Helvetica-Bold');
    doc.text('NAVIX MANAGEMENT', 40, y);
    y += 24;

    if (title) {
      doc.fontSize(14).fillColor(COLORS.primary).font('Helvetica-Bold');
      doc.text(title, 40, y);
      y += 20;
    }

    if (company) {
      doc.fontSize(10).fillColor(COLORS.muted).font('Helvetica');
      doc.text(`Entreprise: ${company}`, 40, y);
      y += 14;
    }

    if (period?.from || period?.to) {
      doc.fontSize(10).fillColor(COLORS.muted).font('Helvetica');
      doc.text(`Période: ${period.from || '—'} au ${period.to || '—'}`, 40, y);
      y += 14;
    }

    if (filters && Object.keys(filters).length > 0) {
      const activeFilters = Object.entries(filters)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${k}=${v}`);
      if (activeFilters.length > 0) {
        doc.fontSize(9).fillColor(COLORS.muted).font('Helvetica-Oblique');
        doc.text(`Filtres: ${activeFilters.join(' | ')}`, 40, y);
        y += 12;
      }
    }

    y += 8;
    doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor(COLORS.border).lineWidth(1).stroke();
    y += 12;

    if (rows.length === 0) {
      doc.fontSize(11).fillColor(COLORS.muted).font('Helvetica');
      doc.text('Aucune donnée disponible.', 40, y);
      drawFooter(doc, 1);
      doc.end();
      return;
    }

    if (headers.length > 0) {
      let x = 40;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.headerText);
      doc.rect(40, y - 2, usableWidth, 18).fill(COLORS.headerBg);
      doc.fillColor(COLORS.headerText);
      for (let i = 0; i < headers.length; i++) {
        doc.text(truncate(headers[i], 30), x + 2, y + 2, {
          width: colWidths[i] - 4,
          lineBreak: false,
        });
        x += colWidths[i];
      }
      y += 18;
    }

    let rowCount = 0;

    for (const row of rows) {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = doc.page.margins.top;
        if (headers.length > 0) {
          let x = 40;
          doc.fontSize(9).font('Helvetica-Bold');
          doc.rect(40, y - 2, usableWidth, 18).fill(COLORS.headerBg);
          doc.fillColor(COLORS.headerText);
          for (let i = 0; i < headers.length; i++) {
            doc.text(truncate(headers[i], 30), x + 2, y + 2, {
              width: colWidths[i] - 4,
              lineBreak: false,
            });
            x += colWidths[i];
          }
          y += 18;
        }
        rowCount = 0;
      }

      if (rowCount % 2 === 1) {
        doc.rect(40, y - 2, usableWidth, 16).fill(COLORS.rowAlt);
      }

      let x = 40;
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.text);
      const actualKeys = keys.length > 0 ? keys : Object.keys(row);
      for (let i = 0; i < actualKeys.length; i++) {
        let val = row[actualKeys[i]];
        if (val === null || val === undefined) val = '';
        else if (typeof val === 'object') val = JSON.stringify(val);
        else val = String(val);
        doc.text(truncate(val, 35), x + 2, y, {
          width: (colWidths[i] || 60) - 4,
          lineBreak: false,
        });
        x += colWidths[i] || 60;
      }
      y += 16;
      rowCount++;
    }

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      drawFooter(doc, pageCount, i + 1);
    }

    doc.end();
  });
}

function drawFooter(doc, totalPages, pageNum) {
  const footerY = doc.page.height - 30;
  doc.fontSize(8).fillColor(COLORS.muted).font('Helvetica');
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} par Navix Management`,
    40, footerY,
    { width: 300, align: 'left' }
  );
  doc.text(
    `Page ${pageNum || doc.bufferedPageRange().count} / ${totalPages}`,
    doc.page.width - 200, footerY,
    { width: 160, align: 'right' }
  );
}

function calculateColumnWidths(headers, usableWidth) {
  if (headers.length === 0) return [];
  const charWeights = headers.map((h) => h.length);
  const totalWeight = charWeights.reduce((a, b) => a + b, 0) || 1;
  return charWeights.map((w) => Math.max(Math.floor((w / totalWeight) * usableWidth), 40));
}

function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}
