/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
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
  PauseCircleOutlined,
  PlayCircleOutlined,
  FallOutlined,
  EditOutlined,
  ColumnWidthOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import { Main } from '../../config/default/styled';
import { API_BASE } from '../../config/apiBase';
import { formatPkr } from '../../config/currency';

const { Search } = Input;

const API_PRODUCTS = `${API_BASE}/products`;
const API_BILLING = `${API_BASE}/sales/billing`;
const API_PRINTERS = `${API_BASE}/print/printers`;
const API_PRINT_INVOICE = `${API_BASE}/print/invoice`;
const API_PRINT_PREVIEW = `${API_BASE}/print/preview`;

const TABS = [
  { key: 'items', label: 'Cart', icon: <ShoppingCartOutlined /> },
  { key: 'payment', label: 'Payment', icon: <CreditCardOutlined /> },
];

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: <DollarCircleOutlined /> },
  { key: 'card', label: 'Card', icon: <CreditCardOutlined /> },
  { key: 'bank_transfer', label: 'Bank', icon: <BankOutlined /> },
  { key: 'wallet', label: 'Wallet', icon: <WalletOutlined /> },
];

function POSBilling() {
  const { login } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invoiceNumber] = useState(`INV-${Date.now()}`);
  const [poNumber] = useState(`PO-${Date.now()}`);
  const [projectDetail, setProjectDetail] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [issuedDate, setIssuedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('items');
  const [activeCategory, setActiveCategory] = useState('All');
  const [customerName, setCustomerName] = useState('Walk-in');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerDraft, setCustomerDraft] = useState('Walk-in');
  const [printerModalOpen, setPrinterModalOpen] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(localStorage.getItem('pos_printer') || '');
  const [printersLoading, setPrintersLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

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

  const holdCart = () => {
    if (!rows.length) {
      message.info('Cart is empty');
      return;
    }
    try {
      sessionStorage.setItem('pos_hold_order', JSON.stringify(rows));
      setRows([]);
      message.success('Order held');
    } catch {
      message.error('Could not hold order');
    }
  };

  const resumeCart = () => {
    const raw = sessionStorage.getItem('pos_hold_order');
    if (!raw) {
      message.info('No held order');
      return;
    }
    try {
      const held = JSON.parse(raw);
      if (Array.isArray(held) && held.length) {
        setRows(held);
        sessionStorage.removeItem('pos_hold_order');
        message.success('Order resumed');
      }
    } catch {
      message.error('Could not resume order');
    }
  };

  const clearTicket = () => {
    setRows([]);
    setDiscount(0);
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
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  const handleSearch = (value) => {
    if (!value.trim()) { setFilteredProducts(products); return; }
    const filtered = products.filter(p =>
      p.name?.toLowerCase().includes(value.toLowerCase()) ||
      p.batch_number?.toLowerCase().includes(value.toLowerCase()) ||
      p.supplier_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
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
      toast.warning(`${product.name}: past expiry date — confirm before sale`);
    }
    const avail = Number(product.available_quantity);
    if (Number.isFinite(avail) && avail < quantity) {
      toast.error(`Insufficient stock. Available: ${avail}`);
      return;
    }
    const productId = getEntityId(product);
    if (!productId) { toast.error('Invalid product'); return; }
    const existingRow = rows.find(row => row.product_id === productId);
    if (existingRow) {
      const newQty = (existingRow.quantity || 0) + quantity;
      if (Number.isFinite(avail) && newQty > avail) {
        toast.error(`Only ${avail - existingRow.quantity} more available`);
        return;
      }
      updateRow(existingRow.key, { quantity: newQty });
    } else {
      setRows(prev => [...prev, { key: Date.now(), product_id: productId, quantity, unit_price: Number(product.unit_price || 0), product_details: product }]);
    }
    message.success(`${product.name} added`);
  };

  const removeRow = (key) => setRows(prev => prev.filter(r => r.key !== key));

  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, r) => sum + (Number(r.quantity || 0) * Number(r.unit_price || 0)), 0);
    const discountAmount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
    const tax = (subtotal - discountAmount) * 0.05;
    const net = subtotal - discountAmount + tax;
    return { subtotal, discountAmount, tax, net };
  }, [rows, discount, discountType]);

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
      } else {
        message.error(data.error || 'Could not load printers');
      }
    } catch (err) {
      message.error('Failed to connect to print service');
    } finally {
      setPrintersLoading(false);
    }
  };

  const openPrinterDialog = () => {
    fetchPrinters();
    setPrinterModalOpen(true);
  };

  const printInvoiceData = async (inv) => {
    if (!inv) { message.warning('No invoice to print'); return; }

    const printer = selectedPrinter || localStorage.getItem('pos_printer');
    if (!printer) {
      message.info('Please select a printer first');
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
      } else {
        message.error(data.error || 'Print failed');
      }
    } catch (err) {
      message.error('Print service unavailable');
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
      if (!res.ok) { message.error('Preview failed'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      message.error('Could not generate preview');
    }
  };

  const createBilling = async () => {
    if (!rows.length) { toast.error('Please add at least one item'); return; }
    const invalidRow = rows.find(r => !r.product_id || Number(r.quantity || 0) <= 0);
    if (invalidRow) { toast.error('All items need valid quantities'); return; }
    const payload = {
      customer_id: null,
      invoice_number: invoiceNumber,
      po_number: poNumber,
      project_detail: projectDetail,
      payment_mode: paymentMode,
      discount_amount: Number(totals.discountAmount || 0),
      tax_amount: Number(totals.tax || 0),
      sale_date: issuedDate ? issuedDate.toDate() : new Date(),
      discount_type: discountType,
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
      toast.success('Invoice created — printing…');
      setRows([]);
      setDiscount(0); setPaymentMode('cash'); setProjectDetail(''); setIssuedDate(null);
      setTimeout(() => {
        if (data) printInvoiceData(data);
      }, 400);
    } catch (e) {
      toast.error(e.message);
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
        <div className="pos-product-card__name">{product.name}</div>
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
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .catalog-header {
          padding: 16px 20px 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: linear-gradient(180deg, #ffffff 0%, #F9FAFB 100%);
        }

        .catalog-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--pos-forest);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .catalog-title-dot {
          width: 8px; height: 8px;
          background: var(--pos-forest);
          border-radius: 50%;
          display: inline-block;
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
        .catalog-toolbar-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .btn-tea-outline {
          border-radius: 8px !important;
          border-color: rgba(0, 0, 0, 0.25) !important;
          color: var(--pos-forest) !important;
          font-weight: 600 !important;
          background: #fff !important;
        }
        .btn-tea-outline:hover {
          border-color: var(--pos-forest) !important;
          color: var(--pos-forest) !important;
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

        .pos-product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 16px;
          max-height: min(56vh, 560px);
          overflow-y: auto;
        }
        @media (max-width: 1199px) {
          .pos-product-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 575px) {
          .pos-product-grid { grid-template-columns: 1fr; }
        }

        .pos-product-card {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          text-align: left;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          padding: 12px 14px;
          min-height: 104px;
          cursor: pointer;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
          font-family: inherit;
        }
        .pos-product-card:hover:not(:disabled) {
          border-color: rgba(0, 0, 0, 0.35);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
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
        .pos-product-card__name {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.35;
          flex: 1;
          margin-bottom: 10px;
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
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 14px rgba(0, 0, 0, 0.07);
          min-height: 520px;
        }

        .ticket-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: linear-gradient(180deg, #ffffff 0%, #F9FAFB 100%);
        }
        .ticket-header-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--pos-forest);
          margin: 0;
        }
        .ticket-clear-btn {
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .ticket-clear-btn:hover {
          color: var(--pos-forest);
          background: rgba(0, 0, 0, 0.06);
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

        .ticket-quick-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          background: #fff;
        }
        .ticket-quick-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--pos-forest);
          background: var(--pos-cream);
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .ticket-quick-btn:hover {
          background: #fff;
          border-color: var(--pos-forest);
        }
        .ticket-quick-btn .anticon {
          font-size: 14px;
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
        <Row gutter={20} style={{ alignItems: 'flex-start' }}>

          {/* ── LEFT: Catalog ── */}
          <Col xs={24} lg={14}>
            <div className="catalog-panel">
              <div className="catalog-header">
                <div className="catalog-title">
                  <span className="catalog-title-dot" />
                  Catalog
                </div>
              </div>
              <div className="catalog-toolbar">
                <Search
                  className="search-tea"
                  placeholder="Search by name, SKU or batch…"
                  allowClear
                  prefix={<SearchOutlined style={{ color: '#64748b' }} />}
                  onSearch={handleSearch}
                  onChange={e => handleSearch(e.target.value)}
                />
                <div className="catalog-toolbar-actions">
                  <Button className="btn-tea-outline" icon={<PauseCircleOutlined />} onClick={holdCart}>
                    Hold
                  </Button>
                  <Button className="btn-tea-outline" icon={<PlayCircleOutlined />} onClick={resumeCart}>
                    Resume
                  </Button>
                </div>
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
                <div className="pos-product-grid">{displayedProducts.map(renderProductCard)}</div>
              )}
            </div>
          </Col>

          {/* ── RIGHT: Billing ── */}
          <Col xs={24} lg={10}>
            <div className="billing-panel">

              <div className="ticket-header">
                <div className="ticket-header-title">The Ticket</div>
                <button type="button" className="ticket-clear-btn" onClick={clearTicket}>
                  Clear
                </button>
              </div>

              <div className="ticket-customer-row">
                <div className="ticket-customer-label">
                  <UserOutlined />
                  <span>
                    <strong>Customer:</strong> {customerName}
                  </span>
                </div>
                <button
                  type="button"
                  className="ticket-change-btn"
                  onClick={() => {
                    setCustomerDraft(customerName);
                    setCustomerModalOpen(true);
                  }}
                >
                  Change
                </button>
              </div>

              <div className="ticket-meta-chips">
                <span className="ticket-chip"><FileTextOutlined />{invoiceNumber}</span>
                <span className="ticket-chip"><TagOutlined />{poNumber}</span>
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
                  <div style={{ minHeight: 260 }}>
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
                  <div style={{ minHeight: 260 }}>
                    <div className="payment-grid">
                      {PAYMENT_METHODS.map(m => (
                      <button
  type="button"
  key={m.key}
  className={`pay-btn ${paymentMode === m.key ? 'active' : ''}`}
  onClick={() => setPaymentMode(m.key)}
>
  <span className="pay-icon">{m.icon}</span>
  {m.label}
</button>
                      ))}
                    </div>

                    <div className="date-row">
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

                    <div style={{ marginTop: 16 }}>
                      <div className="date-label">Notes / Project Detail</div>
                      <Input.TextArea
                        className="notes-area"
                        placeholder="Optional notes…"
                        rows={3}
                        value={projectDetail}
                        onChange={e => setProjectDetail(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="ticket-quick-actions">
                <button type="button" className="ticket-quick-btn" onClick={() => document.querySelector('.disc-input input')?.focus()}>
                  <FallOutlined />
                  Discount
                </button>
                <button type="button" className="ticket-quick-btn" onClick={() => setActiveTab('payment')}>
                  <EditOutlined />
                  Notes
                </button>
                <button type="button" className="ticket-quick-btn" onClick={() => message.info('Split payment — coming soon')}>
                  <ColumnWidthOutlined />
                  Split Pay
                </button>
                <button
                  type="button"
                  className="ticket-quick-btn"
                  onClick={() => {
                    setPaymentMode('cash');
                    setActiveTab('payment');
                  }}
                >
                  <DollarOutlined />
                  Payment
                </button>
              </div>

              {/* Summary */}
              <div className="summary-section">
                <div className="divider-dark" />

                <div className="summary-row">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-value">PKR {totals.subtotal.toFixed(2)}</span>
                </div>

                <div className="discount-row">
                  <div className="discount-left">
                    Discount
                    <Select
                      className="disc-select"
                      value={discountType}
                      onChange={setDiscountType}
                      style={{ width: 56 }}
                      size="small"
                    >
                      <Select.Option value="percentage">%</Select.Option>
                      <Select.Option value="fixed">PKR</Select.Option>
                    </Select>
                  </div>
                  <InputNumber
                    className="disc-input"
                    value={discount}
                    onChange={setDiscount}
                    min={0}
                    max={discountType === 'percentage' ? 100 : totals.subtotal}
                    style={{ width: 90 }}
                    size="small"
                    placeholder="0"
                  />
                </div>

                {totals.discountAmount > 0 && (
                  <div className="summary-row">
                    <span className="summary-label" style={{ color: '#16a34a' }}>Discount Applied</span>
                    <span className="summary-value" style={{ color: '#16a34a' }}>−PKR {totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}

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

        <Modal
          title="Customer"
          open={customerModalOpen}
          onOk={() => {
            setCustomerName((customerDraft || '').trim() || 'Walk-in');
            setCustomerModalOpen(false);
          }}
          onCancel={() => setCustomerModalOpen(false)}
          okText="Save"
          cancelText="Cancel"
        >
          <Input
            value={customerDraft}
            onChange={(e) => setCustomerDraft(e.target.value)}
            placeholder="Walk-in or customer name"
          />
        </Modal>

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
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>INVOICE</div>
                <div style={{ color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, marginTop: 4 }}>#{invoice.invoice_no}</div>
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
              onClick={() => { localStorage.setItem('pos_printer', selectedPrinter); setPrinterModalOpen(false); message.success(`Printer set: ${selectedPrinter}`); }}
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