import moment from 'moment';
import { API_BASE } from '../config/apiBase';
import {
  INVOICE_PDF_TEMPLATE,
  SALE_INVOICE_DOCUMENT_TITLE,
  SALE_RETURN_DOCUMENT_TITLE,
  PURCHASE_ORDER_INVOICE_DOCUMENT_TITLE,
  PURCHASE_ORDER_RETURN_DOCUMENT_TITLE,
} from './invoiceTemplates';

function buildBillToLines(name, address, phone) {
  return [name, address, phone ? `Phone: ${phone}` : ''].filter(Boolean);
}

/** Max qty still returnable when line qty may already reflect remaining stock only. */
export function maxReturnableSaleQty(lineQty, returnedQty) {
  const line = Number(lineQty || 0);
  const returned = Number(returnedQty || 0);
  if (returned <= 0) return line;
  if (returned >= line) return line;
  return Math.max(0, line - returned);
}

export function getEffectiveSaleItems(sale) {
  const rq = sale?.returned_qty_by_product || {};
  const hasReturnTracking = Object.keys(rq).length > 0;

  return (sale?.items || [])
    .map((it) => {
      const pid = String(it.product_id?._id || it.product_id);
      const qty = Number(it.quantity || 0);
      if (qty <= 0) return null;

      const returned = hasReturnTracking
        ? Number(rq[pid] ?? rq[it.product_id] ?? 0)
        : 0;
      const remaining = maxReturnableSaleQty(qty, returned);
      if (remaining <= 0) return null;

      const unit = Number(it.unit_price || 0);
      const lineTotal =
        it.line_total != null && it.line_total !== ''
          ? Number(it.line_total)
          : remaining * unit;

      return {
        product_name: it.product_name || 'Item',
        description: it.description || it.product_description || '',
        quantity: remaining,
        unit_price: unit,
        line_total: lineTotal,
      };
    })
    .filter(Boolean);
}

/** Standard sale invoice PDF payload */
export function mapSaleToPrintInvoice(sale, customerList) {
  if (!sale) return null;
  const sid = String(sale._id || sale.id || '');
  let customer = null;
  if (sale.customer_id && Array.isArray(customerList)) {
    customer = customerList.find((x) => String(x._id) === String(sale.customer_id));
  }

  const customer_name = sale.customer_name || customer?.name || 'Walk-in Customer';
  const customer_phone = sale.customer_phone || customer?.phone || '';
  const customer_address = sale.customer_address || customer?.address || '';
  const billToLines = buildBillToLines(customer_name, customer_address, customer_phone);

  const items = getEffectiveSaleItems(sale);
  const subtotal = items.reduce((sum, it) => sum + Number(it.line_total || 0), 0);
  const origSub = Number(sale.total_amount || 0) || subtotal;
  const origTax = Number(sale.tax_amount || 0);
  const taxAmt = origSub > 0 && items.length ? (origTax * subtotal) / origSub : 0;
  const discAmt = Number(sale.discount_amount ?? sale.discount ?? 0);
  const netAmt =
    items.length > 0
      ? Number(sale.net_amount ?? Math.max(0, subtotal - discAmt + taxAmt))
      : 0;
  const returnedTotal = Number(sale.total_return_amount || 0);
  const saleDate = sale.sale_date || sale.createdAt;
  const dueDate = sale.due_date || (saleDate ? moment(saleDate).add(30, 'days').toISOString() : null);

  return {
    document_title: SALE_INVOICE_DOCUMENT_TITLE,
    invoice_no: sale.invoice_no || `INV-${sid.slice(-6)}`,
    customer_name,
    customer_phone,
    customer_address,
    bill_to_lines: billToLines,
    ship_to_lines: billToLines,
    payment_terms: sale.payment_terms || 'Due on receipt',
    due_date: dueDate,
    items,
    total_amount: subtotal,
    returned_total: returnedTotal,
    discount_amount: discAmt,
    tax_amount: taxAmt,
    tax_rate_percent: subtotal > 0 ? ((taxAmt / subtotal) * 100).toFixed(2) : '0',
    net_amount: netAmt,
    amount_paid: Number(sale.amount_paid || 0),
    amount_remaining: Math.max(0, netAmt - Number(sale.amount_paid || 0)),
    sale_date: saleDate,
  };
}

/** Return credit note for selected sale lines */
export function mapSaleReturnToPrintInvoice(sale, returnLines, customerList, returnReason = '', meta = {}) {
  if (!sale || !returnLines?.length) return null;

  const base = mapSaleToPrintInvoice(sale, customerList);
  if (!base) return null;

  const items = returnLines.map((line) => {
    const qty = Number(line.quantity || line.returnQuantity || 0);
    const unit = Number(line.unit_price || 0);
    return {
      product_name: line.product_name || 'Item',
      description: line.reason || line.returnReason || returnReason || 'Return',
      quantity: qty,
      unit_price: unit,
      line_total: qty * unit,
    };
  });

  const subtotal = items.reduce((s, it) => s + it.line_total, 0);
  const origNo = sale.invoice_no || `INV-${String(sale._id || '').slice(-6)}`;

  return {
    ...base,
    document_title: SALE_RETURN_DOCUMENT_TITLE,
    reference_label: 'Credit note #',
    invoice_no: meta.returnId
      ? `CN-${origNo}-${String(meta.returnId).slice(-6)}`
      : `CN-${origNo}-${Date.now().toString().slice(-6)}`,
    items,
    total_amount: subtotal,
    discount_amount: 0,
    tax_amount: 0,
    tax_rate_percent: '0',
    net_amount: subtotal,
    amount_paid: 0,
    amount_remaining: 0,
    returned_total: 0,
    sale_date: meta.returnDate || new Date(),
    terms_text: `Return against invoice ${origNo}.${returnReason ? ` Reason: ${returnReason}` : ''}`,
  };
}

export function saleReturnLineFromRecord(ret, sale) {
  const pid = ret.product_id?._id || ret.product_id;
  const saleItem = (sale?.items || []).find(
    (it) => String(it.product_id?._id || it.product_id) === String(pid),
  );
  return {
    product_name: ret.product_id?.name || saleItem?.product_name || 'Item',
    quantity: Number(ret.quantity || 0),
    unit_price: Number(ret.unit_price ?? 0),
    reason: ret.reason || '',
    returnQuantity: Number(ret.quantity || 0),
  };
}

export function resolveSaleForReturn(ret, sales) {
  const sid = ret.sale_id?._id || ret.sale_id;
  const fromStore = (sales || []).find((s) => String(s._id || s.id) === String(sid));
  if (fromStore) return fromStore;
  if (ret.sale_id && typeof ret.sale_id === 'object') {
    return { ...ret.sale_id, _id: ret.sale_id._id || sid };
  }
  return null;
}

export function buildSaleReturnInvoice(sale, returnRecords, customerList, fallbackReason = '') {
  if (!sale || !returnRecords) return null;
  const records = Array.isArray(returnRecords) ? returnRecords : [returnRecords];
  const lines = records.map((r) => saleReturnLineFromRecord(r, sale));
  const reason =
    fallbackReason || records.map((r) => r.reason).filter(Boolean).join('; ') || '';
  return mapSaleReturnToPrintInvoice(sale, lines, customerList, reason, {
    returnId: records[0]?._id,
    returnDate: records[0]?.return_date || records[0]?.createdAt,
  });
}

/** Standard purchase order invoice PDF payload */
export function mapPurchaseOrderToInvoice(po) {
  const items = (po.items || []).map((line) => {
    const pname =
      line.product_id && typeof line.product_id === 'object' && line.product_id.name
        ? line.product_id.name
        : 'Line item';
    const qty = Number(line.quantity || 0);
    const price = Number(line.price || 0);
    return {
      product_name: pname,
      quantity: qty,
      unit_price: price,
      line_total: qty * price,
    };
  });
  const subtotal = items.reduce((sum, it) => sum + it.line_total, 0);
  const returned =
    po.returned_total != null
      ? Number(po.returned_total)
      : (po.returns || []).reduce((s, r) => s + Number(r.quantity || 0) * Number(r.price || 0), 0);
  const net = po.net_total != null ? Number(po.net_total) : Math.max(0, subtotal - returned);
  const supplier = po.supplier_id && typeof po.supplier_id === 'object' ? po.supplier_id : {};
  const supplierName = supplier.name || 'Supplier';
  const vendorLines = [
    supplierName,
    supplier.address || '',
    supplier.phone ? `Phone: ${supplier.phone}` : '',
    supplier.email || '',
  ].filter(Boolean);

  return {
    document_type: 'invoice',
    document_title: PURCHASE_ORDER_INVOICE_DOCUMENT_TITLE,
    reference_label: 'Order #',
    invoice_no: po.order_number || '—',
    sale_date: po.order_date,
    customer_name: supplierName,
    bill_to_lines: vendorLines,
    ship_to_lines: vendorLines,
    payment_terms: 'Due on receipt',
    due_date: po.order_date,
    items,
    total_amount: subtotal,
    returned_total: returned,
    discount_amount: 0,
    tax_amount: 0,
    net_amount: net,
    balance_due: net,
    amount_paid: Number(po.amount_paid || 0),
    amount_remaining:
      po.amount_remaining != null
        ? Number(po.amount_remaining)
        : Math.max(0, net - Number(po.amount_paid || 0)),
  };
}

export function purchaseOrderReturnLineFromRecord(po, ret) {
  const pid = ret.product_id?._id || ret.product_id;
  const fromPoLine = (po.items || []).find((it) => String(it.product_id?._id || it.product_id) === String(pid));
  const pname =
    ret.product_id?.name ||
    fromPoLine?.product_id?.name ||
    fromPoLine?.name ||
    'Product';
  return {
    product_name: pname,
    quantity: Number(ret.quantity || 0),
    unit_price: Number(ret.price ?? 0),
    reason: ret.reason || '',
  };
}

/** Return note for purchase order line(s) */
export function mapPurchaseOrderReturnToInvoice(po, returnLines, reason = '', meta = {}) {
  if (!po || !returnLines?.length) return null;

  const base = mapPurchaseOrderToInvoice(po);
  if (!base) return null;

  const items = returnLines.map((line) => {
    const qty = Number(line.quantity || 0);
    const price = Number(line.unit_price ?? line.price ?? 0);
    return {
      product_name: line.product_name || 'Item',
      description: line.description || line.reason || reason || 'Return',
      quantity: qty,
      unit_price: price,
      line_total: qty * price,
    };
  });

  const subtotal = items.reduce((s, it) => s + it.line_total, 0);
  const orderNo = po.order_number || '—';
  const retSuffix = meta.returnId ? String(meta.returnId).slice(-6) : Date.now().toString().slice(-6);

  return {
    ...base,
    document_title: PURCHASE_ORDER_RETURN_DOCUMENT_TITLE,
    reference_label: 'Return #',
    invoice_no: `RET-${orderNo}-${retSuffix}`,
    items,
    total_amount: subtotal,
    returned_total: 0,
    discount_amount: 0,
    tax_amount: 0,
    net_amount: subtotal,
    amount_paid: 0,
    amount_remaining: 0,
    sale_date: meta.returnDate || new Date(),
    terms_text: `Return against order ${orderNo}.${reason ? ` Reason: ${reason}` : ''}`,
  };
}

export function buildPurchaseOrderReturnInvoice(po, returnRecord) {
  if (!po || !returnRecord) return null;
  const line = purchaseOrderReturnLineFromRecord(po, returnRecord);
  return mapPurchaseOrderReturnToInvoice(po, [line], line.reason, {
    returnId: returnRecord._id,
    returnDate: returnRecord.return_date,
  });
}

/** Flat list of all returns across purchase orders */
export function flattenPurchaseOrderReturns(purchaseorders) {
  const rows = [];
  (purchaseorders || []).forEach((po) => {
    const poId = po._id || po.id;
    (po.returns || []).forEach((ret, idx) => {
      const qty = Number(ret.quantity || 0);
      const price = Number(ret.price || 0);
      const line = purchaseOrderReturnLineFromRecord(po, ret);
      rows.push({
        key: `${poId}-${ret._id || idx}`,
        purchaseorder: po,
        returnRecord: ret,
        order_number: po.order_number || '—',
        supplier: po.supplier_id?.name || '—',
        product: line.product_name,
        quantity: qty,
        price,
        lineTotal: qty * price,
        return_date: ret.return_date || ret.createdAt,
        reason: ret.reason || '—',
      });
    });
  });
  return rows.sort((a, b) => new Date(b.return_date || 0) - new Date(a.return_date || 0));
}

/** Send invoice payload to Windows printer via API */
export async function printInvoicePayload(invoice, token, printerStorageKey = 'pos_printer') {
  if (!invoice) throw new Error('No invoice data');
  if (!token) throw new Error('Please sign in');

  const printer = localStorage.getItem(printerStorageKey);
  if (!printer) {
    const err = new Error('Select a printer first');
    err.code = 'PRINTER_REQUIRED';
    throw err;
  }

  const res = await fetch(`${API_BASE}/print/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ invoice, printer, template: INVOICE_PDF_TEMPLATE }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.detail || 'Print failed');
  return data;
}
