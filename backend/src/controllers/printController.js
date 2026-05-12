const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const PDFDocument = require('pdfkit');

const TMP_DIR = path.join(os.tmpdir(), 'pos-invoices');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// ── colours ──
const C = { forest: '#1a3a34', dark: '#1e293b', mid: '#475569', light: '#64748b', muted: '#94a3b8', line: '#e2e8f0', bg: '#f8fafc', white: '#ffffff', green: '#16a34a' };

/**
 * GET /api/print/printers — list Windows printers via PowerShell
 */
exports.getPrinters = (req, res) => {
  const ps = `Get-Printer | Select-Object Name, DriverName, PrinterStatus, PortName | ConvertTo-Json -Compress`;
  exec(`powershell -NoProfile -Command "${ps}"`, { timeout: 10000 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: 'Could not list printers', detail: stderr || err.message });
    try {
      let printers = JSON.parse(stdout.trim());
      if (!Array.isArray(printers)) printers = [printers];
      return res.json({
        printers: printers.map((p) => ({
          name: p.Name,
          driver: p.DriverName,
          status: p.PrinterStatus === 0 ? 'ready' : `status-${p.PrinterStatus}`,
          port: p.PortName,
        })),
      });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse printer list', raw: stdout });
    }
  });
};

// ── PDF builder using pdfkit ──
function generateInvoicePDF(inv) {
  return new Promise((resolve, reject) => {
    const filename = `invoice-${(inv.invoice_no || Date.now()).toString().replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
    const filepath = path.join(TMP_DIR, filename);
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const ws = fs.createWriteStream(filepath);
    doc.pipe(ws);

    const W = doc.page.width - 100; // usable width (margin 50 each side)
    const LEFT = 50;

    const saleDate = new Date(inv.sale_date || Date.now());
    const fmtDate = saleDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmtTime = saleDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const items = inv.items || [];
    const subtotal = Number(inv.total_amount || 0);
    const discAmt = Number(inv.discount_amount || 0);
    const taxAmt = Number(inv.tax_amount || 0);
    const netAmt = Number(inv.net_amount || 0);

    // ── Header ──
    doc.fontSize(26).font('Helvetica-Bold').fillColor(C.forest).text('Aid+ Pharmacy', LEFT, 45, { align: 'center', width: W });
    doc.fontSize(9).font('Helvetica').fillColor(C.light).text('PHARMACY SUITE', LEFT, 75, { align: 'center', width: W, characterSpacing: 2 });
    doc.moveTo(LEFT, 92).lineTo(LEFT + W, 92).lineWidth(2.5).strokeColor(C.forest).stroke();

    // ── Date line ──
    doc.fontSize(9).fillColor(C.muted).text(`${fmtDate}  ·  ${fmtTime}`, LEFT, 100, { align: 'center', width: W });

    // ── Info bar ──
    const barY = 118;
    doc.roundedRect(LEFT, barY, W, 52, 6).fill('#f1f5f9');

    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.muted).text('BILL TO', LEFT + 14, barY + 10);
    doc.fontSize(12).font('Helvetica-Bold').fillColor(C.dark).text(inv.customer_name || 'Walk-in Customer', LEFT + 14, barY + 22);
    if (inv.customer_phone) doc.fontSize(9).font('Helvetica').fillColor(C.light).text(inv.customer_phone, LEFT + 14, barY + 38);

    const rX = LEFT + W - 14;
    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.muted).text('INVOICE', rX - 160, barY + 10, { width: 160, align: 'right' });
    doc.fontSize(12).font('Helvetica-Bold').fillColor(C.dark).text(inv.invoice_no || '—', rX - 160, barY + 22, { width: 160, align: 'right' });
    doc.fontSize(9).font('Helvetica').fillColor(C.light).text(`Payment: ${(inv.payment_mode || 'cash').toUpperCase()}`, rX - 160, barY + 38, { width: 160, align: 'right' });

    // ── Table ──
    const colWidths = [30, W - 30 - 50 - 85 - 85, 50, 85, 85];
    const tX = LEFT;
    let tY = barY + 66;

    // header row
    doc.roundedRect(tX, tY, W, 24, 3).fill(C.forest);
    const headers = ['#', 'Item', 'Qty', 'Price', 'Total'];
    const hAligns = ['center', 'left', 'center', 'right', 'right'];
    let cx = tX;
    headers.forEach((h, i) => {
      doc.fontSize(8).font('Helvetica-Bold').fillColor(C.white)
        .text(h, cx + 6, tY + 7, { width: colWidths[i] - 12, align: hAligns[i] });
      cx += colWidths[i];
    });
    tY += 24;

    // data rows
    items.forEach((it, idx) => {
      const rowH = 22;
      if (idx % 2 === 0) doc.rect(tX, tY, W, rowH).fill(C.bg);

      cx = tX;
      const vals = [
        String(idx + 1),
        it.product_name || '—',
        String(it.quantity || 0),
        `PKR ${Number(it.unit_price || 0).toFixed(2)}`,
        `PKR ${Number(it.line_total || 0).toFixed(2)}`,
      ];
      const colors = [C.light, C.dark, C.mid, C.mid, C.forest];
      const bolds = [false, false, false, false, true];

      vals.forEach((v, i) => {
        doc.fontSize(9).font(bolds[i] ? 'Helvetica-Bold' : 'Helvetica').fillColor(colors[i])
          .text(v, cx + 6, tY + 6, { width: colWidths[i] - 12, align: hAligns[i] });
        cx += colWidths[i];
      });

      doc.moveTo(tX, tY + rowH).lineTo(tX + W, tY + rowH).lineWidth(0.5).strokeColor(C.line).stroke();
      tY += rowH;
    });

    // ── Summary ──
    const sumX = LEFT + W - 230;
    tY += 16;

    const sumLine = (label, value, color, bold) => {
      doc.fontSize(10).font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(color || C.light).text(label, sumX, tY, { width: 120 });
      doc.font('Courier').text(value, sumX + 120, tY, { width: 110, align: 'right' });
      tY += 18;
    };

    sumLine('Subtotal', `PKR ${subtotal.toFixed(2)}`, C.light, false);
    if (discAmt > 0) sumLine('Discount', `-PKR ${discAmt.toFixed(2)}`, C.green, false);
    sumLine('Tax', `PKR ${taxAmt.toFixed(2)}`, C.light, false);

    doc.moveTo(sumX, tY).lineTo(sumX + 230, tY).lineWidth(2).strokeColor(C.forest).stroke();
    tY += 8;
    doc.fontSize(13).font('Helvetica-Bold').fillColor(C.forest).text('Grand Total', sumX, tY, { width: 120 });
    doc.fontSize(17).font('Courier-Bold').fillColor(C.forest).text(`PKR ${netAmt.toFixed(2)}`, sumX + 110, tY - 2, { width: 120, align: 'right' });

    // ── Footer ──
    tY += 40;
    doc.moveTo(LEFT, tY).lineTo(LEFT + W, tY).lineWidth(0.5).strokeColor(C.line).dash(4, { space: 3 }).stroke().undash();
    tY += 12;
    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.forest).text('Thank you for your purchase!', LEFT, tY, { align: 'center', width: W });
    doc.fontSize(8).font('Helvetica').fillColor(C.muted).text('This is a computer-generated invoice.', LEFT, tY + 16, { align: 'center', width: W });

    doc.end();
    ws.on('finish', () => resolve(filepath));
    ws.on('error', reject);
  });
}

/**
 * POST /api/print/invoice — generate PDF and send to Windows printer
 */
exports.printInvoice = async (req, res) => {
  try {
    const { invoice, printer } = req.body;
    if (!invoice) return res.status(400).json({ error: 'Invoice data is required' });

    const filepath = await generateInvoicePDF(invoice);

    if (!printer) {
      return res.json({ success: true, message: 'PDF generated (no printer specified)', filepath });
    }

    const pdfToPrinter = require('pdf-to-printer');
    await pdfToPrinter.print(filepath, { printer });

    setTimeout(() => { try { fs.unlinkSync(filepath); } catch { /* ok */ } }, 10000);

    return res.json({ success: true, message: `Sent to printer: ${printer}` });
  } catch (err) {
    console.error('Print error:', err);
    return res.status(500).json({ error: 'Print failed', detail: err.message });
  }
};

/**
 * POST /api/print/preview — return the PDF as a downloadable file
 */
exports.previewInvoice = async (req, res) => {
  try {
    const { invoice } = req.body;
    if (!invoice) return res.status(400).json({ error: 'Invoice data is required' });

    const filepath = await generateInvoicePDF(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.invoice_no || 'preview'}.pdf"`);

    const rs = fs.createReadStream(filepath);
    rs.pipe(res);
    rs.on('end', () => {
      setTimeout(() => { try { fs.unlinkSync(filepath); } catch { /* ok */ } }, 5000);
    });
  } catch (err) {
    console.error('Preview error:', err);
    return res.status(500).json({ error: 'Preview failed', detail: err.message });
  }
};
