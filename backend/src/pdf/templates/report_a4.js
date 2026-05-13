const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { TMP_DIR } = require('../paths');
const { money } = require('../shared');

/** A4 size */
const PW = 595.28;
const PH = 841.89;

/** Colors (match image style) */
const ORANGE_TOP = '#f6a23c';
const ORANGE_BOTTOM = '#f2c14e';
const WHITE = '#ffffff';
const GREEN = '#2d6a4f';
const DARK = '#1f2937';
const GREY = '#6b7280';
const LINE = '#e5e7eb';

/**
 * Modern Hotel Invoice (matches provided design)
 */
function generate(inv, B) {
  return new Promise((resolve, reject) => {

    const filename = `invoice-${(inv.invoice_no || Date.now())
      .toString()
      .replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;

    const filepath = path.join(TMP_DIR, filename);

    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const ws = fs.createWriteStream(filepath);
    doc.pipe(ws);

    const items = inv.items || [];

    const subtotal = Number(inv.total_amount || 0);
    const discAmt = Number(inv.discount_amount || 0);
    const taxAmt = Number(inv.tax_amount || 0);
    const netAmt = Number(inv.net_amount || 0);

    const saleDate = new Date(inv.sale_date || Date.now());
    const fmtDate = saleDate.toLocaleDateString('en-GB');

    const docTitle = String(inv.document_title || 'INVOICE').trim().toUpperCase() || 'INVOICE';
    const refLabel = inv.reference_label
      || (/\bORDER\b/i.test(docTitle) ? 'Order No' : 'Invoice No');

    // =========================
    // 🔶 TOP ORANGE BACKGROUND
    // =========================
    doc.rect(0, 0, PW, 180).fill(ORANGE_TOP);

    doc.fillColor(WHITE);

    doc.fontSize(26)
      .font('Helvetica-Bold')
      .text(docTitle, 0, 60, { align: 'center' });

    doc.fontSize(14)
      .font('Helvetica')
      .text(B.name || 'Hotel', 0, 95, { align: 'center' });

    // =========================
    // 🧾 WHITE CARD
    // =========================
    const cardX = 50;
    const cardY = 130;
    const cardW = PW - 100;
    const cardH = PH - 180;

    doc.roundedRect(cardX, cardY, cardW, cardH, 10)
      .fill(WHITE);

    let y = cardY + 25;
    const x = cardX + 25;
    const w = cardW - 50;

    doc.fillColor(DARK);

    // =========================
    // CUSTOMER INFO
    // =========================
    doc.fontSize(10).text('Invoice To:', x, y);
    y += 14;

    doc.fontSize(14)
      .font('Helvetica-Bold')
      .text(inv.customer_name || 'Walk-in Customer', x, y);
    y += 20;

    doc.fontSize(9)
      .font('Helvetica')
      .fillColor(GREY)
      .text(`Date: ${fmtDate}`, x, y);

    doc.text(`${refLabel}: ${inv.invoice_no || '—'}`, x + 250, y);

    y += 25;
    doc.fillColor(DARK);

    // =========================
    // TABLE HEADER
    // =========================
    const tableTop = y;

    doc.rect(x, tableTop, w, 28).fill(GREEN);

    doc.fillColor(WHITE).fontSize(10).font('Helvetica-Bold');

    doc.text('Item', x + 10, tableTop + 8);
    doc.text('Qty', x + 260, tableTop + 8);
    doc.text('Price', x + 320, tableTop + 8);
    doc.text('Total', x + 420, tableTop + 8);

    y = tableTop + 35;

    // =========================
    // ITEMS
    // =========================
    doc.fillColor(DARK).font('Helvetica');

    items.forEach((it) => {
      const name = it.product_name || '—';
      const qty = Number(it.quantity || 0);
      const price = Number(it.unit_price || 0);
      const total = Number(it.line_total || qty * price);

      doc.fontSize(10).text(name, x + 10, y);
      doc.text(qty, x + 270, y);
      doc.text(money(price), x + 320, y);
      doc.text(money(total), x + 420, y);

      y += 22;

      doc.strokeColor(LINE)
        .moveTo(x, y - 5)
        .lineTo(x + w, y - 5)
        .stroke();
    });

    // =========================
    // TOTALS
    // =========================
    y += 20;

    const totalsX = x + 300;

    doc.fontSize(10).fillColor(DARK);

    doc.text('Subtotal', totalsX, y);
    doc.text(money(subtotal), totalsX + 120, y);
    y += 18;

    if (discAmt > 0) {
      doc.text('Discount', totalsX, y);
      doc.text(`-${money(discAmt)}`, totalsX + 120, y);
      y += 18;
    }

    doc.text('Tax', totalsX, y);
    doc.text(money(taxAmt), totalsX + 120, y);
    y += 25;

    // TOTAL BOX
    doc.roundedRect(totalsX - 10, y - 5, 200, 35, 8)
      .stroke(GREEN);

    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(GREEN)
      .text('TOTAL', totalsX + 5, y + 6);

    doc.text(money(netAmt), totalsX + 100, y + 6);

    // =========================
    // THANK YOU
    // =========================
    y += 70;

    doc.fillColor(GREEN)
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('THANK YOU', x, y);

    y += 25;

    doc.fillColor(GREY)
      .fontSize(10)
      .font('Helvetica')
      .text(B.footerText || 'Visit Again!', x, y);

    // =========================
    // FOOTER CONTACT BAR
    // =========================
    const footerY = PH - 90;

    doc.rect(0, footerY, PW, 90).fill(GREEN);

    doc.fillColor(WHITE);

    doc.fontSize(9)
      .text(B.phone || '', 50, footerY + 20);

    doc.text(B.address || '', 50, footerY + 40);

    doc.text(B.email || '', 50, footerY + 60);

    doc.end();

    ws.on('finish', () => resolve(filepath));
    ws.on('error', reject);
  });
}

module.exports = { generate };