/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllCustomers } from '../../redux/customers/customerSlice';
import Cookies from 'js-cookie';
import {
  Button, Col, InputNumber, Row, Select, Table,
  Input, Modal, Empty, Spin, DatePicker,
  message,
} from 'antd';
import {
 PrinterOutlined,
  FileTextOutlined,
  CreditCardOutlined, DollarCircleOutlined, BankOutlined,
  WalletOutlined, ShoppingCartOutlined,
  UserOutlined, CalendarOutlined, SearchOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Main } from '../../config/default/styled';
import { API_BASE, API_ORIGIN } from '../../config/apiBase';
import { formatPkr } from '../../config/currency';
import { fetchNextInvoiceNumber } from '../../redux/sales/saleService';

const { Search } = Input;

const API_PRODUCTS = `${API_BASE}/products`;
const API_BILLING = `${API_BASE}/sales/billing`;
const API_PRINTERS = `${API_BASE}/print/printers`;
const API_PRINT_INVOICE = `${API_BASE}/print/invoice`;
const API_PRINT_PREVIEW = `${API_BASE}/print/preview`;
const API_SETTINGS = `${API_BASE}/settings`;

function invoiceTemplateLabel(t) {
  switch (t) {
    case 'report_a4': return 'Full A4 invoice';
    case 'restaurant_80mm': return '80mm receipt';
    case 'pos_receipt': return 'POS receipt';
    case 'a4_80mm_strip':
    default: return 'A4 · 80mm strip';
  }
}

const TABS = [
  { key: 'items', label: 'Cart', icon: <ShoppingCartOutlined /> },
  { key: 'payment', label: 'Payment', icon: <CreditCardOutlined /> },
];

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: <DollarCircleOutlined /> },
  { key: 'cheque', label: 'Cheque', icon: <FileTextOutlined /> },
  { key: 'card', label: 'Card', icon: <CreditCardOutlined /> },
  { key: 'bank_transfer', label: 'Bank Transfer', icon: <BankOutlined /> },
  { key: 'wallet', label: 'Wallet', icon: <WalletOutlined /> },
];

const WALK_IN_CUSTOMER_ID = 'walk-in';

function formatSaleDateParam(date) {
  if (!date) return new Date().toISOString().slice(0, 10);
  if (date.format) return date.format('YYYY-MM-DD');
  if (date.toDate) return date.toDate().toISOString().slice(0, 10);
  return new Date(date).toISOString().slice(0, 10);
}

function POSBilling() {
  const dispatch = useDispatch();
  const { login } = useSelector((state) => state.auth);
  const { customers, loading: customersLoading } = useSelector((state) => state.customers);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('—');
  const [poNumber] = useState(`PO-${Date.now()}`);
  const [projectDetail, setProjectDetail] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [issuedDate, setIssuedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('items');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState(WALK_IN_CUSTOMER_ID);
  const [printerModalOpen, setPrinterModalOpen] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(localStorage.getItem('pos_printer') || '');
  const [printersLoading, setPrintersLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [invoiceBranding, setInvoiceBranding] = useState(null);
  const [posSearchQuery, setPosSearchQuery] = useState('');
  /** Latest query for Enter/submit (DOM ref in antd Search can be unreliable on some mobile keyboards). */
  const posSearchQueryRef = useRef('');

  const refreshBillNo = async (date) => {
    try {
      const no = await fetchNextInvoiceNumber(formatSaleDateParam(date));
      setInvoiceNumber(no);
    } catch {
      setInvoiceNumber('—');
    }
  };

  useEffect(() => {
    refreshBillNo(issuedDate);
  }, [issuedDate]);

  const token = Cookies.get('token');

  const productCategoryName = (p) => {
    const c = p?.category;
    if (c && typeof c === 'object' && c.name) return String(c.name);
    return 'General';
  };

  const categoryOptions = useMemo(() => {
    const names = new Set();
    products.forEach((p) => names.add(productCategoryName(p)));
    return ['All', ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const displayedProducts = useMemo(() => {
    if (activeCategory === 'All') return filteredProducts;
    return filteredProducts.filter((p) => productCategoryName(p) === activeCategory);
  }, [filteredProducts, activeCategory]);

  const customerOptions = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    return [
      { value: WALK_IN_CUSTOMER_ID, label: 'Walk-in' },
      ...list.map((c) => ({
        value: String(c._id || c.id),
        label: c.name || 'Unnamed',
      })),
    ];
  }, [customers]);

  const selectedCustomerName = useMemo(() => {
    if (!selectedCustomerId || selectedCustomerId === WALK_IN_CUSTOMER_ID) return 'Walk-in';
    const c = (Array.isArray(customers) ? customers : []).find(
      (x) => String(x._id || x.id) === String(selectedCustomerId),
    );
    return c?.name || 'Walk-in';
  }, [customers, selectedCustomerId]);

  const clearTicket = () => {
    setRows([]);
    setProjectDetail('');
    setPaymentMode('cash');
    setSelectedCustomerId(WALK_IN_CUSTOMER_ID);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const pRes = await fetch(API_PRODUCTS, { headers });
      const pData = await pRes.json();
      const productsArray = Array.isArray(pData) ? pData : [];
      const activeProducts = productsArray.filter(p => p.status === 'active');
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
    } catch {
      /* silent — avoid toasts except printer success */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);
  useEffect(() => { dispatch(fetchAllCustomers()); }, [dispatch]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_SETTINGS, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!cancelled && res.ok && data.settings?.invoiceDesign) {
          setInvoiceBranding(data.settings.invoiceDesign);
        }
      } catch {
        /* optional branding */
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const filterProductsByQuery = (query) => {
    const v = String(query ?? '').trim();
    if (!v) return products;
    const lower = v.toLowerCase();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(lower) ||
      p.batch_number?.toLowerCase().includes(lower) ||
      (p.sku != null && String(p.sku).toLowerCase().includes(lower)) ||
      p.supplier_name?.toLowerCase().includes(lower)
    );
  };

  const handleSearch = (value) => {
    const v = typeof value === 'string' ? value : '';
    posSearchQueryRef.current = v;
    setPosSearchQuery(v);
    setFilteredProducts(filterProductsByQuery(v));
  };

  const getEntityId = (entity) => entity?._id || entity?.id || null;

  const getProductExpiry = (product) => product?.expiry_date ?? product?.expiryDate;

  /**
   * Calendar-day expiry (local): selling is allowed on the printed expiry day.
   * Ignores bad sentinels: `null`, `''`, `false`, `0` → `new Date(false)` / `Date(0)` = 1970 → wrongly "expired".
   */
  const isExpiryPassed = (raw) => {
    if (raw == null || raw === '' || raw === false) return false;
    if (typeof raw === 'number' && raw === 0) return false;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime()) || d.getTime() === 0) return false;
    const expDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return expDay < todayDay;
  };

  const isOutOfStock = (product) => {
    const q = product?.available_quantity;
    if (q == null || q === '') return false;
    const n = Number(q);
    return Number.isFinite(n) && n <= 0;
  };

  const updateRow = (key, patch) => {
    setRows(prev => prev.map(r => {
      if (r.key !== key) return r;
      const next = { ...r, ...patch };
      if (patch.product_id) {
        const product = products.find(p => getEntityId(p) === patch.product_id);
        if (product) { next.unit_price = Number(product.unit_price || 0); next.product_details = product; }
      }
      return next;
    }));
  };

  const addProductToCart = (product, quantity = 1) => {
    const expRaw = getProductExpiry(product);
    if (isExpiryPassed(expRaw)) {
      return false;
    }
    const avail = Number(product.available_quantity);
    if (Number.isFinite(avail) && avail < quantity) {
      return false;
    }
    const productId = getEntityId(product);
    if (!productId) return false;
    const existingRow = rows.find(row => row.product_id === productId);
    if (existingRow) {
      const newQty = (existingRow.quantity || 0) + quantity;
      if (Number.isFinite(avail) && newQty > avail) {
        return false;
      }
      updateRow(existingRow.key, { quantity: newQty });
    } else {
      setRows(prev => [...prev, { key: Date.now(), product_id: productId, quantity, unit_price: Number(product.unit_price || 0), product_details: product }]);
    }
    return true;
  };

  /** Enter / search icon: filter, then add if exact SKU or a single visible catalog match. */
  const handleSearchSubmit = (value) => {
    const q = value !== undefined && value !== null
      ? String(value)
      : (posSearchQueryRef.current ?? posSearchQuery ?? '');
    posSearchQueryRef.current = q;
    setPosSearchQuery(q);
    const filtered = filterProductsByQuery(q);
    setFilteredProducts(filtered);
    const v = q.trim();
    if (!v) return;

    const lower = v.toLowerCase();
    const skuHit = products.find(
      (p) => p.sku != null && String(p.sku).trim().toLowerCase() === lower
    );
    if (skuHit) {
      const added = addProductToCart(skuHit, 1);
      if (added) {
        posSearchQueryRef.current = '';
        setPosSearchQuery('');
        setFilteredProducts(products);
      }
      return;
    }

    const inCategory = activeCategory === 'All'
      ? filtered
      : filtered.filter((p) => productCategoryName(p) === activeCategory);
    if (inCategory.length === 1) {
      const added = addProductToCart(inCategory[0], 1);
      if (added) {
        posSearchQueryRef.current = '';
        setPosSearchQuery('');
        setFilteredProducts(products);
      }
    }
  };

  const removeRow = (key) => setRows(prev => prev.filter(r => r.key !== key));

  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, r) => sum + (Number(r.quantity || 0) * Number(r.unit_price || 0)), 0);
    const tax = subtotal * 0.05;
    const net = subtotal + tax;
    return { subtotal, tax, net };
  }, [rows]);

  const fetchPrinters = async () => {
    setPrintersLoading(true);
    try {
      const res = await fetch(API_PRINTERS, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.printers) {
        setPrinters(data.printers);
        const epson = data.printers.find((p) => /epson.*l8050/i.test(p.name) || /l8050/i.test(p.name));
        if (epson && !selectedPrinter) {
          setSelectedPrinter(epson.name);
          localStorage.setItem('pos_printer', epson.name);
        }
      }
    } catch {
      /* silent */
    } finally {
      setPrintersLoading(false);
    }
  };

  const openPrinterDialog = () => {
    fetchPrinters();
    setPrinterModalOpen(true);
  };

  const printInvoiceData = async (inv) => {
    if (!inv) return;

    const printer = selectedPrinter || localStorage.getItem('pos_printer');
    if (!printer) {
      openPrinterDialog();
      return;
    }

    setPrinting(true);
    try {
      const res = await fetch(API_PRINT_INVOICE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice: inv, printer }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        message.success(`Sent to ${printer}`);
      }
    } catch {
      /* silent — only success toast is shown */
    } finally {
      setPrinting(false);
    }
  };

  const previewInvoicePDF = async (inv) => {
    if (!inv) return;
    try {
      const res = await fetch(API_PRINT_PREVIEW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice: inv }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      /* silent */
    }
  };

  const createBilling = async () => {
    if (!rows.length) return;
    const invalidRow = rows.find(r => !r.product_id || Number(r.quantity || 0) <= 0);
    if (invalidRow) return;
    const payload = {
      customer_id:
        selectedCustomerId && selectedCustomerId !== WALK_IN_CUSTOMER_ID
          ? selectedCustomerId
          : null,
      po_number: poNumber,
      project_detail: projectDetail,
      payment_mode: paymentMode,
      amount_received: Number(totals.net || 0),
      discount_amount: 0,
      tax_amount: Number(totals.tax || 0),
      sale_date: issuedDate ? issuedDate.toDate() : new Date(),
      items: rows.map(r => ({ product_id: r.product_id, quantity: Number(r.quantity || 0), unit_price: Number(r.unit_price || 0) })),
    };
    setSaving(true);
    try {
      const response = await fetch(API_BILLING, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create invoice');
      setInvoice(data);
      setRows([]);
      setPaymentMode('cash');
      setProjectDetail('');
      setIssuedDate(null);
      setSelectedCustomerId(WALK_IN_CUSTOMER_ID);
      refreshBillNo(null);
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const renderProductCard = (product) => {
    const pid = getEntityId(product);
    const expired = isExpiryPassed(getProductExpiry(product));
    const outOfStock = isOutOfStock(product);
    const disabled = outOfStock;
    const qty = product.available_quantity;
    const stockNum = Number(qty);
    const low = Number.isFinite(stockNum) && stockNum <= (product.minimum_stock_alert || 5);
    const catUpper = productCategoryName(product).toUpperCase();
    const priceStr = formatPkr(Number(product.unit_price || 0));
    const stockLabel = Number.isFinite(stockNum) ? `${stockNum} left` : '—';
    const skuTrim = product.sku != null ? String(product.sku).trim() : '';
    const skuLabel = skuTrim ? `SKU ${skuTrim}` : null;

    return (
      <button
        key={pid}
        type="button"
        className={`pos-product-card${disabled ? ' is-disabled' : ''}${expired ? ' is-expired' : ''}`}
        onClick={() => !disabled && addProductToCart(product, 1)}
        disabled={disabled}
        title={disabled ? 'Out of stock' : expired ? 'Past expiry — tap to add (confirm)' : 'Add to ticket'}
      >
        <div className="pos-product-card__cat">{catUpper}</div>
        <div className="pos-product-card__top">
          <div className="pos-product-card__name">{product.name}</div>
          {skuLabel && <div className="pos-product-card__sku">{skuLabel}</div>}
        </div>
        <div className="pos-product-card__row">
          <span className="pos-product-card__price">{priceStr}</span>
          <span className={`pos-product-card__stock${low ? ' is-low' : ''}`}>{stockLabel}</span>
        </div>
      </button>
    );
  };

  const cartColumns = [
    {
      title: 'ITEM',
      key: 'item',
      render: (_, row) => {
        const product = row.product_details || products.find(p => getEntityId(p) === row.product_id);
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#374151', fontSize: 13 }}>{product?.name || 'Product'}</div>
            <div style={{ color: '#64748b', fontSize: 11, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>PKR {Number(row.unit_price || 0).toFixed(2)}/unit</div>
          </div>
        );
      },
    },
    {
      title: 'QTY',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 88,
      render: (value, row) => (
        <InputNumber
          min={1} value={value}
          onChange={val => updateRow(row.key, { quantity: val })}
          size="small"
          style={{ width: 72, background: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' }}
        />
      ),
    },
    {
      title: 'TOTAL',
      key: 'amount',
      width: 90,
      align: 'right',
      render: (_, row) => (
        <span style={{ color: '#2D3142', fontWeight: 700, fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 13 }}>
          PKR {(Number(row.quantity || 0) * Number(row.unit_price || 0)).toFixed(0)}
        </span>
      ),
    },
    {
      title: '',
      key: 'del',
      width: 36,
      render: (_, row) => (
       <button
  type="button"
  onClick={() => removeRow(row.key)}
  style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}
>×</button>
      ),
    },
  ];

  const renderPosReceiptPreview = (inv) => {
    const saleDate = new Date(inv.sale_date || Date.now());
    const fmtDate = saleDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmtTime = saleDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    const paymentModeLabel = String(inv.payment_mode || 'cash').toUpperCase();
    const paid = Number(inv.amount_tendered ?? inv.amount_paid ?? inv.amount_received ?? inv.net_amount ?? 0);
    const net = Number(inv.net_amount || 0);
    const change = paymentModeLabel === 'CASH' ? Math.max(0, paid - net) : 0;

    return (
      <div
        style={{
          maxWidth: 360,
          margin: '0 auto',
          border: '1px solid #d1d5db',
          background: '#fff',
          padding: 12,
          color: '#111827',
          fontFamily: "'Courier New', monospace",
        }}
      >
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 16 }}>
          {invoiceBranding?.companyName || 'STORE'}
        </div>
        {invoiceBranding?.phone && (
          <div style={{ textAlign: 'center', fontWeight: 600, marginTop: 2 }}>
            Mob: {invoiceBranding.phone}
          </div>
        )}
        {invoiceBranding?.address && (
          <div style={{ textAlign: 'center', fontSize: 12, marginTop: 2 }}>
            {invoiceBranding.address}
          </div>
        )}
        <div style={{ borderTop: '1px solid #111', margin: '8px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span>{fmtDate}</span>
          <span>{fmtTime}</span>
          <span>{login?.name || 'Cashier'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 2 }}>
          <span>Customer: {inv.customer_name || 'Walk-in'}</span>
          <span>No: {inv.invoice_no}</span>
        </div>

        <div style={{ textAlign: 'center', fontWeight: 700, marginTop: 8 }}>DUPLICATE</div>

        <div style={{ borderTop: '1px solid #111', borderBottom: '1px solid #111', marginTop: 6, padding: '4px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .5fr .45fr .7fr .45fr', fontSize: 11, fontWeight: 700 }}>
            <span>Description</span>
            <span style={{ textAlign: 'right' }}>Rate</span>
            <span style={{ textAlign: 'right' }}>Qty</span>
            <span style={{ textAlign: 'right' }}>Amount</span>
            <span style={{ textAlign: 'right' }}>Srv</span>
          </div>
        </div>

        <div>
          {(inv.items || []).map((item, idx) => (
            <div key={`${item.product_id || idx}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '1.4fr .5fr .45fr .7fr .45fr', fontSize: 11, padding: '4px 0' }}>
              <span title={item.product_name}>{String(item.product_name || 'Item').slice(0, 20)}</span>
              <span style={{ textAlign: 'right' }}>{Number(item.unit_price || 0).toFixed(1)}</span>
              <span style={{ textAlign: 'right' }}>{Number(item.quantity || 0).toFixed(1)}</span>
              <span style={{ textAlign: 'right' }}>{Number(item.line_total || 0).toFixed(1)}</span>
              <span style={{ textAlign: 'right' }}>{Number(item.tax || 0).toFixed(1)}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #111', marginTop: 4, paddingTop: 4, fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Items: {(inv.items || []).length}</span>
            <span>Sub Total: {Number(inv.subtotal || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span>Grand Total</span>
            <strong>{net.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span>Payment {paymentModeLabel}</span>
            <span>{paid.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span>Change</span>
            <span>{change.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #111', marginTop: 6, paddingTop: 6, textAlign: 'center', fontWeight: 700, fontSize: 12 }}>
          RUPEES {Math.round(net)} ONLY
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }

        .pos-root {
          --pos-cream: #F9FAFB;
          --pos-cream-deep: #F3F4F6;
          --pos-forest: #2D3142;
          --pos-forest-muted: rgba(0, 0, 0, 0.55);
          background: var(--pos-cream);
          min-height: 100vh;
          padding: 0 12px 20px !important;
          margin: 0 !important;
          width: 100%;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .pos-root * { box-sizing: border-box; }

        /* Left panel */
        .catalog-panel {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          overflow: hidden;
          width: 100%;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 88px);
          max-height: calc(100vh - 64px);
        }

        .catalog-body {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .catalog-body .loading-state,
        .catalog-body .pos-catalog-empty {
          flex: 1;
          min-height: 240px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .catalog-header {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }
        .catalog-header-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .catalog-header-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .catalog-header .catalog-company {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .catalog-header .catalog-title {
          font-family: 'Inter', system-ui, sans-serif;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475467;
          font-size: 13px;
          font-weight: 600;
        }
        .catalog-header .catalog-title-dot {
          background: #2d3142;
          box-shadow: 0 0 0 2px rgba(45, 49, 66, 0.12);
        }
        .catalog-header .catalog-header-muted {
          font-size: 11px;
          font-weight: 500;
          color: #667085;
        }
        .catalog-header .catalog-tagline {
          font-size: 11px;
          color: #667085;
          margin-top: 0;
        }
        .catalog-header .catalog-header-logo {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 4px 8px;
        }

        .catalog-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px 10px;
          flex-wrap: wrap;
          background: #fff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .catalog-toolbar .search-tea {
          flex: 1;
          min-width: 200px;
        }

        .category-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px 16px 12px;
          background: var(--pos-cream-deep);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .category-chip {
          border: 1px solid rgba(0, 0, 0, 0.2);
          background: #fff;
          color: var(--pos-forest-muted);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .category-chip:hover {
          border-color: var(--pos-forest);
          color: var(--pos-forest);
        }
        .category-chip.active {
          background: var(--pos-forest);
          border-color: var(--pos-forest);
          color: #fff;
        }

        .catalog-body .pos-product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          padding: 16px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
        @media (max-width: 1199px) {
          .catalog-body .pos-product-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 575px) {
          .catalog-body .pos-product-grid { grid-template-columns: 1fr; }
        }

        .catalog-body .pos-product-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px 14px 16px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
        /* Tabular: three-column row, no stacked overlap */
        .catalog-body .pos-product-list .pos-product-card {
          display: grid;
          grid-template-columns: minmax(96px, 24%) minmax(0, 1fr) minmax(108px, auto);
          grid-template-rows: auto;
          align-items: center;
          column-gap: 16px;
          min-height: 100px;
          height: auto;
          padding: 16px 20px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
          flex-direction: unset;
          text-align: left;
          width: 100%;
        }
        .pos-product-list .pos-product-card:hover:not(:disabled) {
          border-color: #cbd5e1;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);
        }
        .pos-product-list .pos-product-card__cat {
          grid-column: 1;
          grid-row: 1;
          margin: 0;
          align-self: stretch;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 10px 8px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #475569;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1.3;
          word-break: break-word;
          overflow-wrap: anywhere;
          hyphens: auto;
        }
        .pos-product-list .pos-product-card__top {
          grid-column: 2;
          grid-row: 1;
          flex: unset;
          min-width: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .pos-product-list .pos-product-card__name {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.45;
          margin-bottom: 6px;
          word-break: break-word;
          overflow-wrap: anywhere;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pos-product-list .pos-product-card__sku {
          margin-bottom: 0;
          font-size: 12px;
          line-height: 1.35;
          color: #64748b;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pos-product-list .pos-product-card__row {
          grid-column: 3;
          grid-row: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          gap: 6px;
          margin-top: 0;
          min-width: 0;
        }
        .pos-product-list .pos-product-card__price {
          font-size: 16px;
          font-weight: 700;
          color: var(--pos-forest);
          white-space: nowrap;
        }
        .pos-product-list .pos-product-card__stock {
          white-space: nowrap;
        }

        .pos-product-card {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          text-align: left;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          padding: 14px 16px;
          min-height: 128px;
          cursor: pointer;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
          font-family: inherit;
          width: 100%;
          -webkit-tap-highlight-color: transparent;
        }
        .pos-product-card:hover:not(:disabled) {
          border-color: rgba(0, 0, 0, 0.35);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
        }
        .pos-product-card:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        .pos-product-card.is-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pos-product-card.is-expired:not(.is-disabled) {
          border-color: rgba(180, 83, 9, 0.35);
          background: #fffbeb;
        }
        .pos-product-card__cat {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .pos-product-card__top {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .pos-product-card__name {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.35;
          margin-bottom: 4px;
        }
        .pos-product-card__sku {
          font-size: 11px;
          font-weight: 500;
          font-family: ui-monospace, 'Cascadia Code', 'Segoe UI Mono', monospace;
          color: #64748b;
          letter-spacing: 0.02em;
          margin-bottom: 8px;
          word-break: break-all;
        }
        .pos-product-card__row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
          margin-top: auto;
        }
        .pos-product-card__price {
          font-size: 15px;
          font-weight: 700;
          color: var(--pos-forest);
        }
        .pos-product-card__stock {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
        }
        .pos-product-card__stock.is-low {
          color: #dc2626;
        }

        .pos-catalog-empty {
          padding: 48px 24px;
          text-align: center;
        }
        .loading-text {
          color: var(--pos-forest-muted);
          font-size: 13px;
        }

        .search-tea input {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
          color: #111827 !important;
          border-radius: 10px !important;
          font-size: 13px;
        }

        .search-tea input::placeholder { color: #94a3b8 !important; }
        .search-tea .ant-input-search-button {
          background: #ffffff !important;
          border-color: rgba(0, 0, 0, 0.18) !important;
          color: var(--pos-forest) !important;
          border-radius: 0 10px 10px 0 !important;
        }

        /* Dark table overrides - now light theme */
        .dark-table .ant-table {
          background: transparent !important;
          color: #374151;
          font-size: 13px;
        }
        .dark-table .ant-table-thead > tr > th {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          color: #6b7280 !important;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          padding: 10px 12px;
        }
        .dark-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6 !important;
          background: transparent !important;
          padding: 10px 12px !important;
        }
        .dark-table .ant-table-tbody > tr:hover > td {
          background: #f9fafb !important;
        }
        .dark-table .ant-table-body {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .dark-table .ant-table-pagination {
          background: transparent !important;
          padding: 12px 16px !important;
          margin: 0 !important;
          border-top: 1px solid #e5e7eb;
        }
        .dark-table .ant-pagination-item {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
        }
        .dark-table .ant-pagination-item a { color: #6b7280 !important; }
        .dark-table .ant-pagination-item-active { border-color: #3b82f6 !important; background: rgba(59,130,246,0.05) !important; }
        .dark-table .ant-pagination-item-active a { color: #3b82f6 !important; }
        .dark-table .ant-pagination-prev button, .dark-table .ant-pagination-next button {
          background: #ffffff !important; border-color: #e5e7eb !important; color: #6b7280 !important;
        }
        .dark-table .ant-select-selector {
          background: #ffffff !important; border-color: #e5e7eb !important; color: #6b7280 !important;
        }
        .dark-table .ant-pagination-total-text { color: #9ca3af; font-size: 12px; }

        /* Right panel — The Ticket */
        .billing-panel {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 14px rgba(0, 0, 0, 0.07);
          min-height: calc(100vh - 132px);
          max-height: calc(100vh - 96px);
        }

        .ticket-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding: 14px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }
        .ticket-header-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          justify-content: flex-end;
          min-width: 0;
        }
        .ticket-payment-select {
          min-width: 148px;
          max-width: 220px;
        }
        .ticket-payment-select .ant-select-selector {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          height: 34px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #2d3142 !important;
        }
        .ticket-customer-select {
          flex: 1;
          min-width: 0;
        }
        .ticket-customer-select .ant-select-selector {
          border-radius: 8px !important;
          border-color: rgba(0, 0, 0, 0.12) !important;
          min-height: 36px !important;
        }
        .ticket-note-row {
          padding: 10px 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          background: #fff;
        }
        .ticket-note-input {
          font-size: 13px !important;
          border-radius: 8px !important;
        }
        .ticket-note-input::placeholder {
          color: #94a3b8;
        }
        .ticket-header-title {
          font-size: 17px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .ticket-clear-btn {
          border: 1px solid #d0d5dd;
          background: #ffffff;
          color: #344054;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .ticket-clear-btn:hover {
          color: #1f2937;
          border-color: #98a2b3;
          background: #f9fafb;
        }

        .ticket-customer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          gap: 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: #fff;
        }
        .ticket-customer-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #475569;
        }
        .ticket-customer-label .anticon {
          color: var(--pos-forest);
        }
        .ticket-change-btn {
          border: 1px solid rgba(0, 0, 0, 0.25);
          background: #fff;
          color: var(--pos-forest);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        .ticket-change-btn:hover {
          border-color: var(--pos-forest);
          background: rgba(0, 0, 0, 0.04);
        }

        .ticket-meta-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px 18px;
          background: var(--pos-cream-deep);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .ticket-chip {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11px;
          color: var(--pos-forest-muted);
          font-family: ui-monospace, monospace;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ticket-chip--muted {
          font-size: 10px;
          opacity: 0.9;
        }

        .ticket-empty {
          padding: 28px 16px;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
        }
        .ticket-empty-icon {
          font-size: 28px;
          display: block;
          margin-bottom: 10px;
          opacity: 0.85;
        }

        /* Tab nav */
        .pos-tab-nav {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .pos-tab-btn {
          flex: 1;
          padding: 12px 8px;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Inter', system-ui, sans-serif;
          letter-spacing: 0.04em;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-bottom: 2px solid transparent;
          position: relative;
          bottom: -1px;
        }

        .pos-tab-btn.active {
          color: #2D3142;
          border-bottom-color: #2D3142;
          background: rgba(0, 0, 0, 0.06);
        }

        .pos-tab-btn:hover:not(.active) { color: #6b7280; background: rgba(0,0,0,0.02); }

        .tab-badge {
          background: var(--pos-forest);
          color: white;
          border-radius: 10px;
          font-size: 10px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          padding: 0 6px;
          min-width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .tab-content {
          padding: 16px 20px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        /* Cart table */
        .cart-table .ant-table { background: transparent !important; font-size: 12px; }
        .cart-table .ant-table-thead > tr > th {
          background: transparent !important;
          border-bottom: 1px solid #e5e7eb !important;
          color: #9ca3af !important;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          padding: 6px 8px;
        }
        .cart-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6 !important;
          background: transparent !important;
          padding: 8px 8px !important;
        }
        .cart-table .ant-table-tbody > tr:hover > td { background: #f9fafb !important; }
        .cart-table .ant-table-placeholder { background: transparent !important; }
        .cart-table .ant-empty-description { color: #9ca3af !important; font-size: 12px; }

        /* Summary */
        .summary-section {
          padding: 0 20px 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
        }

        .summary-label { color: #6b7280; font-size: 13px; }
        .summary-value { color: #374151; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; }

        .divider-dark {
          height: 1px;
          background: #e5e7eb;
          margin: 12px 0;
        }

        .total-block {
          background: linear-gradient(135deg, #F3F4F6, #ffffff);
          border: 1px solid rgba(0, 0, 0, 0.18);
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .total-block::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.2), transparent);
        }

        .total-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .total-amount {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 24px;
          font-weight: 700;
          color: var(--pos-forest);
          letter-spacing: -0.02em;
        }

        /* Discount inline */
        .discount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          gap: 8px;
        }

        .discount-left { display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 13px; }

        .discount-right { display: flex; align-items: center; gap: 6px; }

        .disc-select .ant-select-selector {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
          color: #374151 !important;
          border-radius: 6px !important;
          font-size: 11px !important;
          height: 28px !important;
          padding: 0 8px !important;
          display: flex !important;
          align-items: center !important;
        }

        .disc-input .ant-input-number-input {
          background: #ffffff !important;
          color: #374151 !important;
          font-family: 'JetBrains Mono', ui-monospace, monospace !important;
          font-size: 12px;
        }

        .disc-input .ant-input-number {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
          border-radius: 6px !important;
        }

        /* Action buttons */
        .action-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }

        .btn-print {
          width: 100%;
          height: 40px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.18);
          color: var(--pos-forest-muted);
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 600;
          cursor: pointer;
          padding: 0 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          font-size: 13px;
        }

        .btn-print:hover:not(:disabled) { border-color: var(--pos-forest); color: var(--pos-forest); background: rgba(0, 0, 0, 0.04); }
        .btn-print:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-charge {
          width: 100%;
          min-height: 52px;
          border-radius: 10px;
          background: var(--pos-forest);
          border: none;
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.02em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
        }

        .btn-charge:hover:not(:disabled) {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .btn-charge:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .btn-charge .ant-spin-dot-item { background: #fff !important; }

        .notes-area textarea {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
          color: #374151 !important;
          border-radius: 10px !important;
          font-size: 12px !important;
          resize: none !important;
        }

        .notes-area textarea::placeholder { color: #9ca3af !important; }

        /* Payment tab */
        .payment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }

        .pay-btn {
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 10px;
          padding: 12px 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s;
          color: #9ca3af;
          font-size: 12px;
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 600;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .pay-btn .pay-icon { font-size: 22px; transition: all 0.25s; }

        .pay-btn.active {
          border-color: rgba(0, 0, 0, 0.45);
          background: rgba(0, 0, 0, 0.06);
          color: var(--pos-forest);
          box-shadow: 0 0 16px rgba(0, 0, 0, 0.12);
        }

        .pay-btn:hover:not(.active) { border-color: #d1d5db; color: #6b7280; background: #f9fafb; }

        .date-row { display: flex; gap: 10px; margin-top: 4px; }

        .date-field { flex: 1; }
        .date-label { font-size: 11px; color: #9ca3af; margin-bottom: 5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }

        .dark-datepicker { width: 100% !important; }
        .dark-datepicker .ant-picker {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
          border-radius: 10px !important;
          width: 100% !important;
        }
        .dark-datepicker .ant-picker-input input { color: #111827 !important; font-size: 12px !important; }
        .dark-datepicker .ant-picker-suffix { color: #9ca3af !important; }
        .dark-datepicker .ant-picker-clear { background: #ffffff !important; color: #9ca3af !important; }

        /* Modal dark - now light */
        .inv-modal .ant-modal-content {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 20px !important;
        }
        .inv-modal .ant-modal-header {
          background: #ffffff !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-radius: 20px 20px 0 0 !important;
        }
        .inv-modal .ant-modal-title { color: #111827 !important; font-family: 'Inter', system-ui, sans-serif; }
        .inv-modal .ant-modal-close-x { color: #9ca3af !important; }
        .inv-modal .ant-modal-footer { border-top: 1px solid #e5e7eb !important; background: #ffffff !important; }
        .inv-modal .ant-table { background: transparent !important; color: #374151 !important; }
        .inv-modal .ant-table-thead > tr > th {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          color: #6b7280 !important;
          font-size: 10px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
        }
        .inv-modal .ant-table-tbody > tr > td { border-bottom: 1px solid #f3f4f6 !important; background: transparent !important; }
        .inv-modal .ant-table-tbody > tr:hover > td { background: #f9fafb !important; }
        .inv-modal .ant-divider { border-color: #e5e7eb !important; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

        /* Loading */
        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 32px; gap: 16px; }
        .loading-state .ant-spin-dot-item { background: var(--pos-forest) !important; }

        /* Empty */
        .dark-empty .ant-empty-image { opacity: 0.3; }
        .dark-empty .ant-empty-description { color: #9ca3af !important; font-size: 13px; }

        /* InputNumber in cart */
        .ant-input-number-input { font-family: 'JetBrains Mono', ui-monospace, monospace !important; }
      `}      </style>

      <Main className="pos-root">
        <Row gutter={0} style={{ alignItems: 'stretch' }}>

          {/* ── LEFT: Catalog ── */}
          <Col xs={24} lg={16} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="catalog-panel" style={{ flex: 1 }}>
              <div className="catalog-header">
                <div className="catalog-header-main">
                  {invoiceBranding?.logoUrl && (
                    <div className="catalog-header-logo">
                      <img
                        src={`${API_ORIGIN}${invoiceBranding.logoUrl}`}
                        alt=""
                        style={{ height: 34, maxWidth: 110, objectFit: 'contain' }}
                      />
                    </div>
                  )}
                  <div className="catalog-header-row">
                    <div className="catalog-company">
                      {invoiceBranding?.companyName || 'Point of Sale'}
                    </div>
                    <div className="catalog-title">
                      <span className="catalog-title-dot" />
                      Catalog
                    </div>
                    {invoiceBranding?.template && (
                      <span className="catalog-header-muted">
                        PDF: {invoiceTemplateLabel(invoiceBranding.template)}
                      </span>
                    )}
                    {invoiceBranding?.tagline && (
                      <span className="catalog-tagline">{invoiceBranding.tagline}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="catalog-toolbar">
                <Search
                  className="search-tea"
                  placeholder="Search by name, SKU or batch — Enter adds if one match"
                  allowClear
                  value={posSearchQuery}
                  prefix={<SearchOutlined style={{ color: '#64748b' }} />}
                  enterKeyHint="go"
                  onPressEnter={(e) => {
                    /* Enter is handled in onKeyDown (real INPUT target); avoid antd also firing onSearch. */
                    e.preventDefault();
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== 'NumpadEnter') return;
                    if (String(e.target?.tagName).toUpperCase() !== 'INPUT') return;
                    if (e.nativeEvent?.isComposing) return;
                    e.preventDefault();
                    const v = e.target?.value ?? posSearchQueryRef.current;
                    handleSearchSubmit(v);
                  }}
                  onSearch={(v) => {
                    const resolved = v !== undefined && v !== null ? String(v) : posSearchQueryRef.current;
                    handleSearchSubmit(resolved);
                  }}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div className="category-chips">
                {categoryOptions.map((c) => (
                 <button
                    key={c}
                    type="button"
                    className={`category-chip${activeCategory === c ? ' active' : ''}`}
                    onClick={() => setActiveCategory(c)}
                  > 
                    {c}
                  </button>
                ))}
              </div>

              <div className="catalog-body">
              {loading ? (
                <div className="loading-state">
                  <Spin size="large" />
                  <span className="loading-text">Loading catalog…</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="pos-catalog-empty">
                  <Empty description="No products found" />
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="pos-catalog-empty">
                  <Empty description="No products in this category" />
                </div>
              ) : (
                <div
                  className={
                    ['gridview', 'grid'].includes(
                      String(invoiceBranding?.posLayout || 'tabular').toLowerCase(),
                    )
                      ? 'pos-product-grid'
                      : 'pos-product-list'
                  }
                >
                  {displayedProducts.map(renderProductCard)}
                </div>
              )}
              </div>
            </div>
          </Col>

          {/* ── RIGHT: Billing ── */}
          <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="billing-panel" style={{ flex: 1 }}>

              <div className="ticket-header">
                <div className="ticket-header-title">The Ticket</div>
                <div className="ticket-header-controls">
                  <Select
                    className="ticket-payment-select"
                    value={paymentMode}
                    onChange={setPaymentMode}
                    optionLabelProp="label"
                    popupMatchSelectWidth={false}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <Select.Option key={m.key} value={m.key} label={m.label}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          {m.icon}
                          {m.label}
                        </span>
                      </Select.Option>
                    ))}
                  </Select>
                  <button type="button" className="ticket-clear-btn" onClick={clearTicket}>
                    Clear
                  </button>
                </div>
              </div>

              <div className="ticket-customer-row">
                <div className="ticket-customer-label" style={{ flexShrink: 0 }}>
                  <UserOutlined />
                  <strong>Customer</strong>
                </div>
                <Select
                  className="ticket-customer-select"
                  showSearch
                  placeholder="Select customer"
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  loading={customersLoading}
                  optionFilterProp="label"
                  options={customerOptions}
                  filterOption={(input, option) =>
                    String(option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </div>

              <div className="ticket-meta-chips">
                <span className="ticket-chip"><FileTextOutlined />{invoiceNumber}</span>
                <span className="ticket-chip"><TagOutlined />{poNumber}</span>
                <span className="ticket-chip ticket-chip--muted">{selectedCustomerName}</span>
                <span className="ticket-chip ticket-chip--muted">Cashier: {login?.name || 'Staff'}</span>
              </div>

              {/* Tab Nav */}
              <div className="pos-tab-nav">
                {TABS.map(tab => (
                <button
  type="button"
  key={tab.key}
  className={`pos-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
  onClick={() => setActiveTab(tab.key)}
>
  {tab.icon}
  {tab.label}
  {tab.key === 'items' && rows.length > 0 && (
    <span className="tab-badge">{rows.length}</span>
  )}
</button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="tab-content">

                {activeTab === 'items' && (
                  <div style={{ minHeight: 200 }}>
                    <Table
                      className="cart-table"
                      columns={cartColumns}
                      dataSource={rows}
                      pagination={false}
                      rowKey="key"
                      size="small"
                      locale={{
                        emptyText: (
                          <div className="ticket-empty">
                            <span className="ticket-empty-icon" aria-hidden>🍃</span>
                            <p>Empty ticket. Tap a product to begin.</p>
                          </div>
                        ),
                      }}
                    />
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div style={{ minHeight: 200 }}>
                    <div className="date-row" style={{ marginTop: 0 }}>
                      <div className="date-field">
                        <div className="date-label">Issued Date</div>
                        <div className="dark-datepicker">
                          <DatePicker
                            format="DD/MM/YYYY"
                            value={issuedDate}
                            onChange={setIssuedDate}
                            suffixIcon={<CalendarOutlined style={{ color: '#9ca3af' }} />}
                          />
                        </div>
                      </div>
                      <div className="date-field">
                        <div className="date-label">Due Date</div>
                        <div className="dark-datepicker">
                          <DatePicker
                            format="DD/MM/YYYY"
                            suffixIcon={<CalendarOutlined style={{ color: '#9ca3af' }} />}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="ticket-note-row">
                <Input
                  className="ticket-note-input"
                  placeholder="Note (optional)"
                  value={projectDetail}
                  onChange={(e) => setProjectDetail(e.target.value)}
                  allowClear
                  maxLength={200}
                />
              </div>

              {/* Summary */}
              <div className="summary-section">
                <div className="divider-dark" />

                <div className="summary-row">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-value">PKR {totals.subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">GST (5%)</span>
                  <span className="summary-value">PKR {totals.tax.toFixed(2)}</span>
                </div>

                <div className="divider-dark" />

                <div className="total-block">
                  <div className="total-label">Grand Total</div>
                  <div className="total-amount">PKR {totals.net.toFixed(2)}</div>
                </div>

                <div className="action-row">
                 <button
  type="button"
  className="btn-print"
  onClick={() => printInvoiceData(invoice)}
  disabled={!invoice || printing}
  title={selectedPrinter ? `Print to: ${selectedPrinter}` : 'Select a printer first'}
>
  {printing ? <Spin size="small" /> : <PrinterOutlined />} {printing ? 'Printing…' : 'Print'}
</button>
<button
  type="button"
  className="btn-print"
  onClick={openPrinterDialog}
  style={{ minWidth: 36, padding: '0 8px', marginLeft: 4, fontSize: 12 }}
  title="Printer settings"
>
  ⚙
</button>
<button
  type="button"
  className="btn-charge"
  onClick={createBilling}
  disabled={!rows.length || saving}
>
  {saving ? <Spin size="small" /> : null}
  {saving ? 'Processing…' : `Charge — ${formatPkr(totals.net)}`}
</button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Invoice Modal */}
        <Modal
          className="inv-modal"
          title={`Invoice ${invoice?.invoice_no || ''}`}
          open={!!invoice}
          onCancel={() => setInvoice(null)}
          width={760}
          footer={[
            <Button key="print" type="primary" loading={printing} onClick={() => printInvoiceData(invoice)} icon={<PrinterOutlined />}
              style={{ background: '#2D3142', borderColor: 'transparent', borderRadius: 10 }}>
              {selectedPrinter ? `Print → ${selectedPrinter}` : 'Print Invoice'}
            </Button>,
            <Button key="preview" onClick={() => previewInvoicePDF(invoice)} icon={<FileTextOutlined />}
              style={{ borderColor: '#2D3142', color: '#2D3142', borderRadius: 10 }}>
              Preview PDF
            </Button>,
            <Button key="printer" onClick={openPrinterDialog}
              style={{ borderColor: '#e5e7eb', color: '#374151', borderRadius: 10 }}>
              ⚙ Printer
            </Button>,
            <Button key="close" onClick={() => setInvoice(null)}
              style={{ background: '#ffffff', borderColor: '#e5e7eb', color: '#374151', borderRadius: 10 }}>
              Close
            </Button>
          ]}
        >
          {invoice && (
            <div style={{ padding: '8px 0' }} id="invoice-preview">
              {invoiceBranding?.template === 'pos_receipt' ? (
                renderPosReceiptPreview(invoice)
              ) : (
                <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {invoiceBranding?.logoUrl && (
                    <img
                      src={`${API_ORIGIN}${invoiceBranding.logoUrl}`}
                      alt=""
                      style={{ height: 48, maxWidth: 140, objectFit: 'contain' }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                      {invoiceBranding?.companyName || 'Invoice'}
                    </div>
                    {invoiceBranding?.tagline && (
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{invoiceBranding.tagline}</div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>INVOICE</div>
                  <div style={{ color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, marginTop: 4 }}>#{invoice.invoice_no}</div>
                  {invoiceBranding?.template && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Print layout: {invoiceTemplateLabel(invoiceBranding.template)}</div>
                  )}
                </div>
              </div>

              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Bill To</div>
                  <div style={{ color: '#111827', fontWeight: 600 }}>{invoice.customer_name || 'Walk-in Customer'}</div>
                  {invoice.customer_phone && <div style={{ color: '#6b7280', fontSize: 13 }}>{invoice.customer_phone}</div>}
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Details</div>
                  <div style={{ color: '#374151', fontSize: 13 }}>{new Date(invoice.sale_date).toLocaleDateString()}</div>
                  <div style={{ color: '#6b7280', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{invoice.invoice_no}</div>
                </Col>
              </Row>

              <Table
                dataSource={invoice.items}
                pagination={false}
                size="small"
                rowKey="product_id"
                className="dark-table"
                columns={[
                  { title: 'ITEM', dataIndex: 'product_name', key: 'product_name', render: v => <span style={{ color: '#374151' }}>{v}</span> },
                  { title: 'QTY', dataIndex: 'quantity', key: 'quantity', align: 'center', width: 60, render: v => <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6b7280' }}>{v}</span> },
                  { title: 'PRICE', dataIndex: 'unit_price', key: 'unit_price', align: 'right', width: 100, render: v => <span style={{ color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace' }}>PKR {Number(v).toFixed(2)}</span> },
                  { title: 'TOTAL', dataIndex: 'line_total', key: 'line_total', align: 'right', width: 100, render: v => <span style={{ color: '#2D3142', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>PKR {Number(v).toFixed(2)}</span> },
                ]}
              />

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#6b7280', fontSize: 13 }}>
                    <span>Subtotal</span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>PKR {Number(invoice.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#6b7280', fontSize: 13 }}>
                    <span>Tax</span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>PKR {Number(invoice.tax_amount || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ height: 1, background: '#e5e7eb', margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ color: '#111827', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>Total</span>
                    <span style={{ color: '#2D3142', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18 }}>PKR {Number(invoice.net_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 24, color: '#9ca3af', fontSize: 12, fontStyle: 'italic' }}>
                Thank you for your business
              </div>
              </>
              )}
            </div>
          )}
        </Modal>

        {/* Printer Selection Modal */}
        <Modal
          title="Connect Printer"
          open={printerModalOpen}
          onCancel={() => setPrinterModalOpen(false)}
          width={520}
          footer={[
            <Button key="refresh" onClick={fetchPrinters} loading={printersLoading} icon={<SearchOutlined />}
              style={{ borderRadius: 10 }}>
              Refresh
            </Button>,
            <Button key="ok" type="primary" disabled={!selectedPrinter}
              onClick={() => { localStorage.setItem('pos_printer', selectedPrinter); setPrinterModalOpen(false); }}
              style={{ background: '#2D3142', borderColor: 'transparent', borderRadius: 10 }}>
              Connect
            </Button>,
          ]}
        >
          {printersLoading ? (
            <div style={{ textAlign: 'center', padding: 32 }}><Spin size="large" /><div style={{ marginTop: 12, color: '#64748b' }}>Detecting printers…</div></div>
          ) : printers.length === 0 ? (
            <Empty description="No printers found. Make sure your Epson L8050 is connected and the driver is installed." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {printers.map((p) => {
                const isEpson = /epson/i.test(p.name) || /l8050/i.test(p.name);
                const isSelected = selectedPrinter === p.name;
                return (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => setSelectedPrinter(p.name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      border: isSelected ? '2px solid #2D3142' : '1px solid #e5e7eb',
                      borderRadius: 10, background: isSelected ? '#f0fdf4' : '#fff',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <PrinterOutlined style={{ fontSize: 22, color: isEpson ? '#2D3142' : '#94a3b8' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>
                        {p.name}
                        {isEpson && <span style={{ marginLeft: 8, fontSize: 10, background: '#2D3142', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>RECOMMENDED</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {p.driver || 'Unknown driver'} · {p.status}
                        {p.port ? ` · ${p.port}` : ''}
                      </div>
                    </div>
                    {isSelected && <span style={{ color: '#2D3142', fontWeight: 700, fontSize: 18 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
          {selectedPrinter && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
              Selected: <strong style={{ color: '#2D3142' }}>{selectedPrinter}</strong>
            </div>
          )}
        </Modal>
      </Main>
    </>
  );
}

export default POSBilling;