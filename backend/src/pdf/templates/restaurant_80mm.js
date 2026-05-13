const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { TMP_DIR } = require('../paths');
const {
  C,
  MM_TO_PT,
  RECEIPT_WIDTH_MM,
  money,
  dottedRule,
  thickDashedRule,
  vDottedLine,
  solidRuleBlack,
  drawLogoCircular,
} = require('../shared');

const DEFAULT_POWERED = 'Code5 Tech';
const DEFAULT_WEB = 'www.code5.com.pk';

/**
 * 80mm thermal strip — layout aligned to restaurant receipt (logo, bill block,
 * Item Name | Qty | Rate | Service | Amount, totals ladder, Code5 footer).
 */
function generate(inv, B) {
  return new Promise((resolve, reject) => {
    const filename = `invoice-${(inv.invoice_no || Date.now()).toString().replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
    const filepath = path.join(TMP_DIR, filename);

    const items = inv.items || [];
    const outTotal = Number(inv.total_amount || 0);
    const extraCharges = Number(inv.extra_charges ?? inv.service_charge ?? 0);
    const discAmt = Number(inv.discount_amount || 0);
    const taxAmt = Number(inv.tax_amount || 0);
    const netAmt = Number(inv.net_amount || 0);
    const saleDate = new Date(inv.sale_date || Date.now());
    const fmtDate = saleDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmtTime = saleDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    const fmtDateRight = `${fmtDate} ${fmtTime}`;

    const paymentMode = (inv.payment_mode || 'cash').toString();
    const typeLabel = paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1).toLowerCase();
    const customerName = inv.customer_name || 'Walk-in';
    const notesRaw = (inv.notes || inv.project_detail || '').toString().trim();
    const notesDisplay = notesRaw || '—';

    const tender = Number(inv.amount_tendered ?? inv.amount_paid ?? inv.tender ?? netAmt);
    const isCash = String(inv.payment_mode || 'cash').toLowerCase() === 'cash';
    const changeBack = isCash ? Math.max(0, tender - netAmt) : null;

    const wPt = RECEIPT_WIDTH_MM * MM_TO_PT;
    const side = 12;
    const innerW = wPt - 2 * side;
    const cx = side + innerW / 2;

    const colItem = innerW * 0.38;
    const colQty = innerW * 0.11;
    const colRate = innerW * 0.17;
    const colSvc = innerW * 0.17;
    const colAmt = innerW * 0.17;
    const xL = side;
    const xQty = xL + colItem;
    const xRate = xQty + colQty;
    const xSvc = xRate + colRate;
    const xAmt = xSvc + colSvc;

    const estNotesH = notesDisplay.length > 42 ? 22 : 14;
    const estH =
      48 +
      (B.logoPath ? 58 : 0) +
      120 +
      estNotesH +
      items.length * 34 +
      220 +
      (B.address ? 28 : 0);
    const pageH = Math.min(72 * 72, Math.max(72 * 18, estH));

    const doc = new PDFDocument({ size: [wPt, pageH], margin: 0, bufferPages: true });
    const ws = fs.createWriteStream(filepath);
    doc.pipe(ws);

    let y = side;
    const yReceiptTop = 6;
    const bottom = () => doc.page.height - side;

    const newPage = () => {
      doc.addPage({ size: [wPt, 72 * 36], margin: 0 });
      y = side;
    };

    const ensureSpace = (h) => {
      if (y + h <= bottom()) return;
      newPage();
    };

    const addrLines = (() => {
      const raw = (B.address || '').trim();
      if (!raw) return [];
      const byNl = raw.split(/\n/).map((s) => s.trim()).filter(Boolean);
      if (byNl.length > 1) return byNl.slice(0, 3);
      return [raw];
    })();

    if (B.logoPath) {
      ensureSpace(52);
      y = drawLogoCircular(doc, B.logoPath, cx, y, 44);
    }

    ensureSpace(40);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.dark).text(B.name, side, y, { width: innerW, align: 'center' });
    y = doc.y + 4;
    doc.fontSize(8).font('Helvetica').fillColor(C.dark);
    addrLines.forEach((line) => {
      doc.text(line, side, y, { width: innerW, align: 'center' });
      y = doc.y + 2;
    });
    if (B.phone) {
      doc.text(B.phone, side, y, { width: innerW, align: 'center' });
      y = doc.y + 3;
    }
    y += 4;
    y = dottedRule(doc, side, side + innerW, y);

    /* Bill info — solid row separators */
    ensureSpace(22);
    y = solidRuleBlack(doc, side, side + innerW, y);
    doc.fontSize(8).font('Helvetica').fillColor(C.dark);
    const billRow1 = y;
    doc.text(`Bill No: ${inv.invoice_no || '—'}`, side, billRow1, { width: innerW * 0.62, align: 'left' });
    doc.text(fmtDateRight, side, billRow1, { width: innerW, align: 'right' });
    y = billRow1 + 12;
    y = solidRuleBlack(doc, side, side + innerW, y);

    const billRow2 = y;
    doc.text(`Type: ${typeLabel}`, side, billRow2, { width: innerW * 0.5, align: 'left' });
    doc.text(`Customer : ${customerName}`, side, billRow2, { width: innerW, align: 'right' });
    y = billRow2 + 12;
    y = solidRuleBlack(doc, side, side + innerW, y);

    ensureSpace(20);
    doc.fontSize(8).font('Helvetica').fillColor(C.dark);
    doc.text(`Notes: ${notesDisplay}`, side, y, { width: innerW, align: 'left' });
    y = doc.y + 4;
    y = solidRuleBlack(doc, side, side + innerW, y);
    y += 2;

    /* Item table */
    const th = 14;
    ensureSpace(th + 8);
    const tableTop = y;
    y = solidRuleBlack(doc, side, side + innerW, tableTop);
    const headerY = y;
    doc.fontSize(7.2).font('Helvetica-Bold').fillColor(C.dark);
    doc.text('Item Name', xL, headerY + 2, { width: colItem - 1, align: 'left' });
    doc.text('Qty', xQty, headerY + 2, { width: colQty, align: 'center' });
    doc.text('Rate', xRate, headerY + 2, { width: colRate - 1, align: 'right' });
    doc.text('Service', xSvc, headerY + 2, { width: colSvc - 1, align: 'right' });
    doc.text('Amount', xAmt, headerY + 2, { width: colAmt, align: 'right' });
    const headerBot = headerY + th;
    vDottedLine(doc, xQty, headerY, headerBot);
    vDottedLine(doc, xRate, headerY, headerBot);
    vDottedLine(doc, xSvc, headerY, headerBot);
    vDottedLine(doc, xAmt, headerY, headerBot);
    y = solidRuleBlack(doc, side, side + innerW, headerBot);

    items.forEach((it) => {
      const name = it.product_name || '—';
      const qty = Number(it.quantity || 0);
      const unit = Number(it.unit_price || 0);
      const line = Number(it.line_total != null ? it.line_total : qty * unit);
      const lineTax = Number(it.tax || 0);

      ensureSpace(30);
      const rowTop = y;
      doc.fontSize(7.8).font('Helvetica').fillColor(C.dark);
      doc.text(name, xL, rowTop, { width: colItem - 2, align: 'left' });
      const line1H = Math.max(10, doc.y - rowTop);
      const secondY = rowTop + line1H + 1;
      doc.fontSize(7.5);
      doc.text(String(qty), xQty, secondY, { width: colQty, align: 'center' });
      doc.text(money(unit), xRate, secondY, { width: colRate - 1, align: 'right' });
      doc.text(money(lineTax), xSvc, secondY, { width: colSvc - 1, align: 'right' });
      doc.font('Helvetica-Bold').text(money(line), xAmt, secondY, { width: colAmt, align: 'right' });
      y = secondY + 12;
    });

    if (items.length === 0) {
      ensureSpace(18);
      doc.fontSize(8).font('Helvetica').fillColor(C.muted).text('No items', side, y, { width: innerW, align: 'center' });
      y = doc.y + 10;
    }

    y = solidRuleBlack(doc, side, side + innerW, y);
    y += 4;

    /* Totals — dotted between rows; label / value split */
    const splitX = side + innerW * 0.56;
    const totalRow = (label, val, opts = {}) => {
      const { bold = false, size = 8 } = opts;
      ensureSpace(16);
      y = dottedRule(doc, side, side + innerW, y);
      const ry = y;
      const f = bold ? 'Helvetica-Bold' : 'Helvetica';
      doc.fontSize(size).font(f).fillColor(C.dark);
      doc.text(label, side, ry, { width: splitX - side - 4, align: 'left' });
      vDottedLine(doc, splitX, ry, ry + 11);
      doc.font(f).text(val, splitX + 3, ry, { width: side + innerW - (splitX + 3), align: 'right' });
      y = ry + 12;
    };

    totalRow('Out Total', money(outTotal));
    totalRow('Extra Charges', money(extraCharges));
    totalRow('Discount/Promotion', discAmt > 0 ? `−${money(discAmt)}` : money(0));
    totalRow('Total GST', money(taxAmt));
    totalRow('Net Total', money(netAmt), { bold: true, size: 9 });
    totalRow('Amount Paid', money(tender));
    totalRow('Change back (Cash)', changeBack != null ? money(changeBack) : '—');

    y += 4;
    y = thickDashedRule(doc, side, side + innerW, y);
    y += 6;

    /* Footer — powered by + website */
    const poweredBrand = (B.receiptPoweredBy && String(B.receiptPoweredBy).trim()) || DEFAULT_POWERED;
    ensureSpace(36);
    doc.fontSize(8).font('Helvetica').fillColor(C.dark);
    const pre = 'powered by ';
    doc.font('Helvetica');
    const wPre = doc.widthOfString(pre);
    doc.font('Helvetica-Bold');
    const wBrand = doc.widthOfString(poweredBrand);
    const startPowered = cx - (wPre + wBrand) / 2;
    doc.font('Helvetica').text(pre, startPowered, y, { continued: true, lineBreak: false });
    doc.font('Helvetica-Bold').text(poweredBrand, { lineBreak: false });
    y = doc.y + 5;
    const web = (B.receiptWebsite && String(B.receiptWebsite).trim()) || DEFAULT_WEB;
    doc.font('Helvetica').fontSize(7.5).fillColor(C.mid).text(web, side, y, { width: innerW, align: 'center' });
    y = doc.y + 10;

    /* Outer border */
    const borderPad = 3;
    const hBorder = y - yReceiptTop + borderPad;
    doc.rect(borderPad, yReceiptTop, wPt - 2 * borderPad, hBorder).lineWidth(0.55).strokeColor('#000000').stroke();

    doc.end();
    ws.on('finish', () => resolve(filepath));
    ws.on('error', reject);
  });
}

module.exports = { generate };
