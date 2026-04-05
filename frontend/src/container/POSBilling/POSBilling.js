/* eslint-disable camelcase */
import React, { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import {
  Button, Col, InputNumber, Row, Select, Table,
  Input, Modal, Empty, Spin, DatePicker, 
  message,  Avatar
} from 'antd';
import {
 PrinterOutlined,
 ReloadOutlined,
  FileTextOutlined, SaveOutlined,
  CreditCardOutlined, DollarCircleOutlined, BankOutlined,
  PhoneOutlined, WalletOutlined, ShoppingCartOutlined,
  UserOutlined, CalendarOutlined, SearchOutlined,
  TagOutlined,  TeamOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../../config/default/styled';
import { API_BASE } from '../../config/apiBase';

const { Search } = Input;

const API_PRODUCTS = `${API_BASE}/products`;
const API_CUSTOMERS = `${API_BASE}/customers`;
const API_BILLING = `${API_BASE}/sales/billing`;

const TABS = [
  { key: 'items', label: 'Cart', icon: <ShoppingCartOutlined /> },
  { key: 'customer', label: 'Customer', icon: <TeamOutlined /> },
  { key: 'payment', label: 'Payment', icon: <CreditCardOutlined /> },
];

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: <DollarCircleOutlined /> },
  { key: 'card', label: 'Card', icon: <CreditCardOutlined /> },
  { key: 'bank_transfer', label: 'Bank', icon: <BankOutlined /> },
  { key: 'wallet', label: 'Wallet', icon: <WalletOutlined /> },
];

function POSBilling() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
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

  const token = Cookies.get('token');

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [pRes, cRes] = await Promise.all([
        fetch(API_PRODUCTS, { headers }),
        fetch(API_CUSTOMERS, { headers })
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      const productsArray = Array.isArray(pData) ? pData : [];
      const activeProducts = productsArray.filter(p => p.status === 'active');
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
      setCustomers(Array.isArray(cData) ? cData : []);
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
    if (new Date(product.expiry_date) < new Date()) { toast.error(`${product.name} is expired`); return; }
    if (product.available_quantity < quantity) { toast.error(`Insufficient stock. Available: ${product.available_quantity}`); return; }
    const productId = getEntityId(product);
    if (!productId) { toast.error('Invalid product'); return; }
    const existingRow = rows.find(row => row.product_id === productId);
    if (existingRow) {
      const newQty = (existingRow.quantity || 0) + quantity;
      if (newQty > product.available_quantity) { toast.error(`Only ${product.available_quantity - existingRow.quantity} more available`); return; }
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

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId);
    setCustomerDetails(customers.find(c => getEntityId(c) === customerId));
  };

  const createBilling = async () => {
    if (!rows.length) { toast.error('Please add at least one item'); return; }
    const invalidRow = rows.find(r => !r.product_id || Number(r.quantity || 0) <= 0);
    if (invalidRow) { toast.error('All items need valid quantities'); return; }
    const payload = {
      customer_id: selectedCustomer || null,
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
      toast.success('Invoice created successfully');
      setRows([]); setSelectedCustomer(null); setCustomerDetails(null);
      setDiscount(0); setPaymentMode('cash'); setProjectDetail(''); setIssuedDate(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const printInvoice = () => window.print();

  const productColumns = [
    {
      title: 'PRODUCT',
      dataIndex: 'name',
      key: 'name',
      render: (_, product) => (
        <div style={{ padding: '2px 0' }}>
          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>{product.name}</div>
          <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>
            {product.batch_number || '—'} · {product.supplier_name || 'No supplier'}
          </div>
        </div>
      ),
    },
    {
      title: 'PRICE',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      render: (v) => <span style={{ color: '#3b82f6', fontWeight: 700, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>PKR {Number(v || 0).toFixed(0)}</span>,
    },
    {
      title: 'STOCK',
      dataIndex: 'available_quantity',
      key: 'available_quantity',
      width: 72,
      align: 'center',
      render: (qty, product) => {
        const low = qty <= (product.minimum_stock_alert || 5);
        return (
          <span style={{
            display: 'inline-block', minWidth: 36, padding: '2px 8px', borderRadius: 20,
            fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            background: low ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            color: low ? '#dc2626' : '#16a34a',
            border: `1px solid ${low ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.25)'}`,
          }}>{qty}</span>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 56,
      render: (_, product) => {
        const expired = new Date(product.expiry_date) < new Date();
        const outOfStock = product.available_quantity === 0;
        return (
         <button
  type="button"
  onClick={() => addProductToCart(product, 1)}
  disabled={expired || outOfStock}
  style={{
    width: 32, height: 32, borderRadius: 8, border: 'none',
    background: expired || outOfStock ? '#e5e7eb' : '#dbeafe',
    color: expired || outOfStock ? '#9ca3af' : '#3b82f6',
    cursor: expired || outOfStock ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, transition: 'all 0.2s',
  }}
  onMouseEnter={e => { if (!expired && !outOfStock) e.currentTarget.style.background = '#bfdbfe'; }}
  onMouseLeave={e => { if (!expired && !outOfStock) e.currentTarget.style.background = '#dbeafe'; }}
>+</button>
        );
      },
    },
  ];

  const cartColumns = [
    {
      title: 'ITEM',
      key: 'item',
      render: (_, row) => {
        const product = row.product_details || products.find(p => getEntityId(p) === row.product_id);
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#374151', fontSize: 13 }}>{product?.name || 'Product'}</div>
            <div style={{ color: '#3b82f6', fontSize: 11, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>PKR {Number(row.unit_price || 0).toFixed(2)}/unit</div>
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
        <span style={{ color: '#8b5cf6', fontWeight: 700, fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 13 }}>
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
          background: #f3f4f6;
          min-height: 100vh;
          padding: 24px;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .pos-root * { box-sizing: border-box; }

        /* Left panel */
        .catalog-panel {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          overflow: hidden;
          height: 100%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .catalog-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: linear-gradient(135deg, #ffffff, #f9fafb);
        }

        .catalog-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .catalog-title-dot {
          width: 8px; height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          box-shadow: 0 0 8px #3b82f6;
          display: inline-block;
        }

        .search-dark input {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
          color: #111827 !important;
          border-radius: 10px !important;
          font-size: 13px;
        }

        .search-dark input::placeholder { color: #9ca3af !important; }
        .search-dark .ant-input-search-button {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
          color: #6b7280 !important;
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

        /* Right panel */
        .billing-panel {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .billing-header {
          background: linear-gradient(135deg, #f3e8ff 0%, #ffffff 100%);
          padding: 22px 24px 18px;
          border-bottom: 1px solid #e5e7eb;
          position: relative;
          overflow: hidden;
        }

        .billing-header::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 120px; height: 120px;
          background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }

        .billing-header-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 12px;
        }

        .inv-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .inv-chip {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 4px 12px;
          font-size: 11px;
          color: #6b7280;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          display: flex;
          align-items: center;
          gap: 6px;
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
          color: #8b5cf6;
          border-bottom-color: #8b5cf6;
          background: rgba(139,92,246,0.05);
        }

        .pos-tab-btn:hover:not(.active) { color: #6b7280; background: rgba(0,0,0,0.02); }

        .tab-badge {
          background: #8b5cf6;
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
          background: linear-gradient(135deg, #f3e8ff, #ffffff);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 14px;
          padding: 16px 20px;
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
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
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
          font-size: 26px;
          font-weight: 500;
          color: #8b5cf6;
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
          gap: 10px;
          margin-top: 14px;
        }

        .btn-print {
          flex: 0 0 auto;
          height: 44px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 600;
          cursor: pointer;
          padding: 0 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          font-size: 13px;
        }

        .btn-print:hover:not(:disabled) { border-color: #d1d5db; color: #374151; background: #f9fafb; }
        .btn-print:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-invoice {
          flex: 1;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          border: none;
          color: white;
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(139,92,246,0.3);
        }

        .btn-invoice:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(139,92,246,0.45);
          transform: translateY(-1px);
        }

        .btn-invoice:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Customer tab */
        .customer-select .ant-select-selector {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
          color: #111827 !important;
          border-radius: 10px !important;
        }
        .customer-select .ant-select-selection-placeholder { color: #9ca3af !important; }
        .customer-select .ant-select-arrow { color: #9ca3af !important; }

        .customer-info-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 14px 16px;
          margin-top: 12px;
          position: relative;
          overflow: hidden;
        }

        .customer-info-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #3b82f6, #8b5cf6);
        }

        .customer-name { font-weight: 700; color: #111827; font-size: 14px; margin-bottom: 6px; }
        .customer-meta { font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 6px; margin-top: 4px; }

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
          border-color: rgba(59,130,246,0.4);
          background: rgba(59,130,246,0.05);
          color: #3b82f6;
          box-shadow: 0 0 16px rgba(59,130,246,0.12);
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
        .loading-state .ant-spin-dot-item { background: #3b82f6 !important; }

        /* Empty */
        .dark-empty .ant-empty-image { opacity: 0.3; }
        .dark-empty .ant-empty-description { color: #9ca3af !important; font-size: 13px; }

        /* InputNumber in cart */
        .ant-input-number-input { font-family: 'JetBrains Mono', ui-monospace, monospace !important; }
      `}</style>

      <div className="no-print">
        <PageHeader
          ghost
          title={<span style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>Create Invoice</span>}
          subTitle={<span style={{ color: '#6b7280' }}>Point of Sale · Pharmacy Billing</span>}
          buttons={[
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={fetchInitialData}
              style={{ background: '#ffffff', borderColor: '#e5e7eb', color: '#374151', borderRadius: 10 }}
            >
              Refresh
            </Button>
          ]}
        />
      </div>

      <Main className="pos-root">
        <Row gutter={20} style={{ alignItems: 'stretch' }}>

          {/* ── LEFT: Catalog ── */}
          <Col xs={24} lg={14}>
            <div className="catalog-panel">
              <div className="catalog-header">
                <div className="catalog-title">
                  <span className="catalog-title-dot" />
                  Medicines Catalog
                </div>
                <Search
                  className="search-dark"
                  placeholder="Search name, batch, supplier…"
                  allowClear
                  prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                  onSearch={handleSearch}
                  onChange={e => handleSearch(e.target.value)}
                  style={{ width: 260 }}
                />
              </div>

              {loading ? (
                <div className="loading-state">
                  <Spin size="large" />
                  <span style={{ color: '#9ca3af', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>Loading catalog…</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ padding: 40 }}>
                  <Empty className="dark-empty" description="No products found" />
                </div>
              ) : (
                <Table
                  className="dark-table"
                  columns={productColumns}
                  dataSource={filteredProducts}
                  rowKey={record => getEntityId(record)}
                  size="small"
                  pagination={{ pageSize: 10, showSizeChanger: false, showTotal: total => `${total} products` }}
                  scroll={{ y: 500 }}
                />
              )}
            </div>
          </Col>

          {/* ── RIGHT: Billing ── */}
          <Col xs={24} lg={10}>
            <div className="billing-panel">

              {/* Header */}
              <div className="billing-header">
                <div className="billing-header-title">Billing Dashboard</div>
                <div className="inv-chips">
                  <div className="inv-chip"><FileTextOutlined />{invoiceNumber}</div>
                  <div className="inv-chip"><TagOutlined />{poNumber}</div>
                </div>
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
                      locale={{ emptyText: <span style={{ color: '#e5e7eb', fontSize: 12 }}>Cart is empty — add products from the catalog</span> }}
                    />
                  </div>
                )}

                {activeTab === 'customer' && (
                  <div style={{ minHeight: 260 }}>
                    <Select
                      className="customer-select"
                      placeholder="Select customer…"
                      style={{ width: '100%' }}
                      value={selectedCustomer}
                      onChange={handleCustomerSelect}
                      showSearch
                      size="large"
                      allowClear
                    >
                      {customers.map(c => (
                        <Select.Option key={getEntityId(c)} value={getEntityId(c)}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111827' }}>
                            <Avatar size={18} icon={<UserOutlined />} style={{ background: '#e5e7eb' }} />
                            {c.name}
                            {c.phone && <span style={{ color: '#9ca3af', fontSize: 11 }}>{c.phone}</span>}
                          </span>
                        </Select.Option>
                      ))}
                    </Select>

                    {customerDetails && (
                      <div className="customer-info-card">
                        <div className="customer-name">{customerDetails.name}</div>
                        {customerDetails.email && <div className="customer-meta"><UserOutlined />{customerDetails.email}</div>}
                        {customerDetails.phone && <div className="customer-meta"><PhoneOutlined />{customerDetails.phone}</div>}
                        {customerDetails.address && <div className="customer-meta">{customerDetails.address}</div>}
                      </div>
                    )}

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
                  </div>
                )}
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
  onClick={printInvoice}
  disabled={!invoice}
>
  <PrinterOutlined /> Print
</button>
<button
  type="button"
  className="btn-invoice"
  onClick={createBilling}
  disabled={!rows.length || saving}
>
  {saving ? <Spin size="small" style={{ filter: 'brightness(0)' }} /> : <SaveOutlined />}
  {saving ? 'Creating…' : 'Create Invoice'}
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
            <Button key="print" type="primary" onClick={printInvoice} icon={<PrinterOutlined />}
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', borderColor: 'transparent', borderRadius: 10 }}>
              Print Invoice
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
                  { title: 'TOTAL', dataIndex: 'line_total', key: 'line_total', align: 'right', width: 100, render: v => <span style={{ color: '#8b5cf6', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>PKR {Number(v).toFixed(2)}</span> },
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
                    <span style={{ color: '#8b5cf6', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18 }}>PKR {Number(invoice.net_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 24, color: '#9ca3af', fontSize: 12, fontStyle: 'italic' }}>
                Thank you for your business
              </div>
            </div>
          )}
        </Modal>
      </Main>
    </>
  );
}

export default POSBilling;