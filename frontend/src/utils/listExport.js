import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF as JsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * @param {Object} options
 * @param {string} options.filename - without extension
 * @param {string} [options.sheetName]
 * @param {string[]} options.headers - column titles
 * @param {Array<Array<string|number>>} options.rows - data rows (same order as headers)
 */
export function exportListToExcel({ filename, sheetName = 'Export', headers, rows }) {
  const safeName = (filename || 'export').replace(/[/\\?%*:|"<>]/g, '-');
  const aoa = [headers, ...rows.map((r) => r.map((cell) => (cell == null ? '' : cell)))];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31) || 'Sheet1');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${safeName}.xlsx`);
}

/**
 * @param {Object} options
 * @param {string} options.title - shown above the table
 * @param {string} options.filename - without extension
 * @param {string[]} options.headers
 * @param {Array<Array<string|number>>} options.rows
 */
export function exportListToPdf({ title, filename, headers, rows }) {
  const safeName = (filename || 'export').replace(/[/\\?%*:|"<>]/g, '-');
  const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFontSize(12);
  doc.text(title || 'Export', 14, 12);
  autoTable(doc, {
    head: [headers],
    body: rows.map((r) => r.map((cell) => (cell == null ? '' : String(cell)))),
    startY: 16,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [95, 99, 242], fontSize: 8 },
    margin: { left: 10, right: 10 },
  });
  doc.save(`${safeName}.pdf`);
}

/**
 * @param {Object} options
 * @param {string} options.filename
 * @param {{ name: string, headers: string[], rows: Array<Array> }[]} options.sheets
 */
export function exportWorkbookToExcel({ filename, sheets }) {
  const safeName = (filename || 'export').replace(/[/\\?%*:|"<>]/g, '-');
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, headers, rows }) => {
    const aoa = [headers, ...rows.map((r) => r.map((cell) => (cell == null ? '' : cell)))];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, (name || 'Sheet').slice(0, 31));
  });
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${safeName}.xlsx`);
}

/**
 * @param {Object} options
 * @param {string} options.filename
 * @param {string} options.title - document title
 * @param {{ heading: string, headers: string[], rows: Array<Array> }[]} options.sections
 */
export function exportMultiSectionPdf({ filename, title, sections }) {
  const safeName = (filename || 'export').replace(/[/\\?%*:|"<>]/g, '-');
  const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFontSize(12);
  doc.text(title || 'Report', 14, 12);
  let startY = 18;
  sections.forEach((sec, idx) => {
    if (idx > 0) {
      doc.addPage();
      startY = 14;
    }
    doc.setFontSize(10);
    doc.text(sec.heading || `Section ${idx + 1}`, 14, startY);
    autoTable(doc, {
      head: [sec.headers],
      body: (sec.rows || []).map((r) => r.map((cell) => (cell == null ? '' : String(cell)))),
      startY: startY + 4,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [95, 99, 242], fontSize: 8 },
      margin: { left: 10, right: 10 },
    });
  });
  doc.save(`${safeName}.pdf`);
}
