/* eslint-disable camelcase */
import React, { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import Styled from 'styled-components';
import { 
  Col, Row, Tag, Button as AntdButton, Space, 
  Modal, Form, Input, Select, InputNumber, DatePicker, 
  message, Popconfirm, Tooltip, Badge, Switch, Divider, Skeleton
} from 'antd';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, ReloadOutlined, BarcodeOutlined,
  WarningOutlined, FileExcelOutlined, FilePdfOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button } from '../../components/buttons/buttons';
import { Main } from '../../config/default/styled';
import { exportListToExcel, exportListToPdf } from '../../utils/listExport';
import ProjectLists from '../../config/default/List';
import { ProjectSorting } from '../../config/default/style';
import {
  KpiGrid,
  KpiCard,
  KpiMain,
  KpiValue,
  KpiLabel,
  KpiSparkWrap,
  KpiTrendMuted,
} from '../dashboard/dashboardStyles';
import { formatPkr } from '../../config/currency';
import { ScreenWrap } from '../shared/procurementScreenStyles';
import { API_BASE } from '../../config/apiBase';
import moment from 'moment';

const StockKpiWrap = Styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  ${KpiValue} {
    font-size: 28px !important;
  }
  ${KpiLabel} {
    font-size: 14px !important;
  }
  ${KpiTrendMuted} {
    font-size: 13px !important;
  }
  ${KpiGrid} {
    min-width: min(100%, 320px);
  }
`;

/** Keeps table + cards within viewport; stacked cells use these classes */
const StockTableOuter = Styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  .stock-cell-title {
    font-weight: 600;
    color: #0f172a;
    font-size: 14px;
    line-height: 1.35;
    word-break: break-word;
  }
  .stock-cell-line {
    font-size: 12px;
    color: #64748b;
    line-height: 1.45;
    margin-top: 2px;
  }
  .stock-cell-stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
`;

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const API_PRODUCTS = `${API_BASE}/products`;

const API_CATEGORYS = `${API_BASE}/categorys`;

function categoryDisplayLabel(category) {
  if (category && typeof category === 'object' && category.name != null) return category.name;
  return String(category || '');
}

function categoryId(product) {
  const c = product?.category;
  if (c && typeof c === 'object' && c._id != null) return String(c._id);
  if (c != null) return String(c);
  return '';
}

function isLowStock(product) {
  const q = Number(product?.available_quantity) || 0;
  const min = Number(product?.minimum_stock_alert) || 5;
  return q <= min;
}

function expiryPresetMatch(product, preset) {
  if (preset === 'all') return true;
  const value = product?.expiry_date;
  if (!value) return preset === 'all';
  const d = new Date(value);
  const now = new Date();
  const soonEnd = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  if (preset === 'expired') return d < now;
  if (preset === 'soon') return d >= now && d <= soonEnd;
  if (preset === 'ok') return d > soonEnd;
  return true;
}

function renderExpiryTag(value) {
  if (!value) {
    return (
      <Tag color="default" style={{ margin: 0, fontSize: 12 }}>
        —
      </Tag>
    );
  }
  const expired = new Date(value) < new Date();
  const expiringSoon =
    new Date(value) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && !expired;
  const label = new Date(value).toLocaleDateString();
  if (expired) {
    return (
      <Tag color="error" style={{ margin: 0, fontSize: 12 }}>
        {label} · Expired
      </Tag>
    );
  }
  if (expiringSoon) {
    return (
      <Tag color="warning" style={{ margin: 0, fontSize: 12 }}>
        {label} · Soon
      </Tag>
    );
  }
  return (
    <Tag color="blue" style={{ margin: 0, fontSize: 12 }}>
      {label}
    </Tag>
  );
}

const KPI_SPARK_COLORS = ['#c4b5fd', '#fca5a5', '#86efac', '#93c5fd'];

/** Vertical mini bars — same pattern as dashboard KPI strip */
function MiniSpark({ data, color }) {
  const bars = (data || []).map((v, i) => ({ i, v: Math.max(0, v) }));
  if (!bars.length) {
    return <div style={{ height: 56, background: 'linear-gradient(90deg,#f3f4f6,#fff)' }} />;
  }
  return (
    <ResponsiveContainer width="100%" height={56}>
      <BarChart data={bars} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Bar dataKey="v" fill={color} radius={[3, 3, 0, 0]} maxBarSize={10} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function StockManagement() {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [expiryDateRange, setExpiryDateRange] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStockLevel, setFilterStockLevel] = useState('all');
  const [filterExpiryPreset, setFilterExpiryPreset] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterPrescription, setFilterPrescription] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [form] = Form.useForm();

  const token = Cookies.get('token');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_PRODUCTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load products');
      
      const productsArray = Array.isArray(data) ? data : [];
      setProducts(productsArray);
      
      // Calculate summary
      const totalProducts = productsArray.length;
      const lowStockCount = productsArray.filter(p => p.available_quantity <= (p.minimum_stock_alert || 5)).length;
      const totalStockValue = productsArray.reduce((sum, p) => sum + (p.total_value || 0), 0);
      
      setSummary({
        total_products: totalProducts,
        low_stock_count: lowStockCount,
        total_stock_value: totalStockValue
      });
    } catch (e) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const response = await fetch(API_CATEGORYS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchReport();
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      batch_number: product.batch_number,
      expiry_date: product.expiry_date ? require('moment')(product.expiry_date) : null,
      available_quantity: product.available_quantity,
      minimum_stock_alert: product.minimum_stock_alert,
      unit_price: product.unit_price,
      supplier_name: product.supplier_name,
      manufacturer: product.manufacturer,
      category: product.category?._id ?? product.category,
      rack_location: product.rack_location,
      discount: product.discount,
      gst: product.gst,
      is_prescription_required: product.is_prescription_required,
      status: product.status,
      storage_instructions: product.storage_instructions,
      notes: product.notes,
      manufacturer_license_no: product.manufacturer_license_no,
      medicine_size: product.medicine_size,
      manufacturer_registration_no: product.manufacturer_registration_no
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_PRODUCTS}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Delete failed');
      message.success('Product deleted successfully');
      fetchReport();
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const toNonNegNumber = (v, fallback = 0) => {
    if (v === undefined || v === null || v === '') return fallback;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const handleSubmit = async (values) => {
    try {
      const unitPrice = toNonNegNumber(values.unit_price, NaN);
      const availQty = toNonNegNumber(values.available_quantity, NaN);
      if (!Number.isFinite(unitPrice)) {
        message.error('Please enter a valid selling price');
        return;
      }
      if (!Number.isFinite(availQty)) {
        message.error('Please enter a valid current stock quantity');
        return;
      }

      const formattedValues = {
        ...values,
        expiry_date: values.expiry_date ? values.expiry_date.format('YYYY-MM-DD') : null,
        unit_price: unitPrice,
        available_quantity: availQty,
        minimum_stock_alert: toNonNegNumber(values.minimum_stock_alert, 0),
        discount: toNonNegNumber(values.discount, 0),
        gst: toNonNegNumber(values.gst, 0),
      };
      if (values.purchase_price != null && values.purchase_price !== '') {
        formattedValues.purchase_price = toNonNegNumber(values.purchase_price, 0);
      }

      const productId = editingProduct?._id || editingProduct?.id;

      let response;
      if (editingProduct) {
        response = await fetch(`${API_PRODUCTS}/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedValues),
        });
      } else {
        response = await fetch(API_PRODUCTS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedValues),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Operation failed');
      }
      message.success(editingProduct ? 'Product updated successfully' : 'Product added successfully');
      setModalVisible(false);
      fetchReport();
    } catch (error) {
      message.error(error?.message || 'Failed to save product');
    }
  };

  const generateBarcode = () => {
    const barcode = `BAR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    form.setFieldsValue({ barcode });
    message.success('Barcode generated');
  };

  const supplierOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const n = p.supplier_name?.trim();
      if (n) set.add(n);
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (expiryDateRange?.[0] && expiryDateRange?.[1]) n += 1;
    if (filterExpiryPreset !== 'all') n += 1;
    if (filterCategory !== 'all') n += 1;
    if (filterStatus !== 'all') n += 1;
    if (filterStockLevel !== 'all') n += 1;
    if (filterSupplier !== 'all') n += 1;
    if (filterPrescription !== 'all') n += 1;
    return n;
  }, [
    expiryDateRange,
    filterExpiryPreset,
    filterCategory,
    filterStatus,
    filterStockLevel,
    filterSupplier,
    filterPrescription,
  ]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const catLabel = categoryDisplayLabel(product.category).toLowerCase();
      const term = searchText.toLowerCase();
      const textOk =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.batch_number?.toLowerCase().includes(term) ||
        catLabel.includes(term) ||
        product.supplier_name?.toLowerCase().includes(term);

      if (!textOk) return false;

      if (filterCategory !== 'all' && categoryId(product) !== String(filterCategory)) return false;

      if (filterStatus !== 'all' && (product.status || 'active') !== filterStatus) return false;

      if (filterStockLevel === 'low' && !isLowStock(product)) return false;
      if (filterStockLevel === 'ok' && isLowStock(product)) return false;

      if (!expiryPresetMatch(product, filterExpiryPreset)) return false;

      if (filterSupplier !== 'all' && (product.supplier_name?.trim() || '') !== filterSupplier) {
        return false;
      }

      if (filterPrescription === 'yes' && !product.is_prescription_required) return false;
      if (filterPrescription === 'no' && product.is_prescription_required) return false;

      if (expiryDateRange?.[0] && expiryDateRange?.[1] && product.expiry_date) {
        const exp = moment(product.expiry_date).startOf('day');
        const start = expiryDateRange[0].clone().startOf('day');
        const end = expiryDateRange[1].clone().endOf('day');
        if (exp.isBefore(start) || exp.isAfter(end)) return false;
      } else if (expiryDateRange?.[0] && expiryDateRange?.[1] && !product.expiry_date) {
        return false;
      }

      return true;
    });
  }, [
    products,
    searchText,
    filterCategory,
    filterStatus,
    filterStockLevel,
    filterExpiryPreset,
    filterSupplier,
    filterPrescription,
    expiryDateRange,
  ]);

  const paginatedProducts = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return filteredProducts.slice(start, start + pagination.pageSize);
  }, [filteredProducts, pagination.current, pagination.pageSize]);

  useEffect(() => {
    setPagination((p) => ({ ...p, current: 1 }));
  }, [
    searchText,
    expiryDateRange,
    filterCategory,
    filterStatus,
    filterStockLevel,
    filterExpiryPreset,
    filterSupplier,
    filterPrescription,
  ]);

  const clearFilters = () => {
    setExpiryDateRange(null);
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterStockLevel('all');
    setFilterExpiryPreset('all');
    setFilterSupplier('all');
    setFilterPrescription('all');
  };

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pagination.pageSize) || 1);
    setPagination((p) => (p.current > totalPages ? { ...p, current: totalPages } : p));
  }, [filteredProducts.length, pagination.pageSize]);

  const handlePageChange = (page, pageSize) => {
    setPagination({ current: page, pageSize: pageSize || pagination.pageSize });
  };

  const handleSizeChange = (current, size) => {
    setPagination({ current: 1, pageSize: size });
  };

  const activeMedicinesCount = useMemo(
    () => products.filter((p) => p.status === 'active').length,
    [products]
  );

  const sparkTotal = useMemo(() => {
    const n = summary?.total_products ?? 0;
    return Array.from({ length: 7 }, (_, i) => Math.max(1, n * (0.85 + ((i * 13) % 20) / 100)));
  }, [summary?.total_products]);

  const sparkLow = useMemo(() => {
    const n = summary?.low_stock_count ?? 0;
    return Array.from({ length: 7 }, (_, i) => Math.max(0, n * (0.5 + ((i * 11) % 50) / 100)));
  }, [summary?.low_stock_count]);

  const sparkValue = useMemo(() => {
    const v = Number(summary?.total_stock_value) || 0;
    return Array.from({ length: 7 }, (_, i) => Math.max(0, v * (0.4 + ((i * 17) % 40) / 100)));
  }, [summary?.total_stock_value]);

  const sparkActive = useMemo(() => {
    const n = activeMedicinesCount;
    return Array.from({ length: 7 }, (_, i) => Math.max(0, n * (0.55 + ((i * 19) % 40) / 100)));
  }, [activeMedicinesCount]);

  const handleExportExcel = () => {
    if (!filteredProducts.length) {
      message.warning('No data to export');
      return;
    }
    const headers = [
      'Product Name',
      'Batch No',
      'Category',
      'Stock',
      'Min Alert',
      'Selling Price (PKR)',
      'Purchase Price (PKR)',
      'Expiry Date',
      'Status',
    ];
    const rows = filteredProducts.map((p) => [
      p.name ?? '',
      p.batch_number ?? '',
      categoryDisplayLabel(p.category),
      p.available_quantity ?? '',
      p.minimum_stock_alert ?? '',
      p.unit_price != null ? Number(p.unit_price).toFixed(2) : '',
      p.purchase_price != null ? Number(p.purchase_price).toFixed(2) : '',
      p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : '',
      p.status ?? '',
    ]);
    exportListToExcel({
      filename: `stock-list-${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Stock',
      headers,
      rows,
    });
    message.success('Excel file downloaded');
  };

  const handleExportPdf = () => {
    if (!filteredProducts.length) {
      message.warning('No data to export');
      return;
    }
    const headers = [
      'Product',
      'Batch',
      'Category',
      'Stock',
      'Min',
      'Sell PKR',
      'Buy PKR',
      'Expiry',
      'Status',
    ];
    const rows = filteredProducts.map((p) => [
      String(p.name ?? '').slice(0, 40),
      p.batch_number ?? '',
      String(categoryDisplayLabel(p.category)).slice(0, 20),
      p.available_quantity ?? '',
      p.minimum_stock_alert ?? '',
      p.unit_price != null ? Number(p.unit_price).toFixed(2) : '',
      p.purchase_price != null ? Number(p.purchase_price).toFixed(2) : '',
      p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : '',
      p.status ?? '',
    ]);
    exportListToPdf({
      title: 'Stock / inventory list (current search filter)',
      filename: `stock-list-${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows,
    });
    message.success('PDF file downloaded');
  };

  const columns = [
    {
      title: '#',
      key: 'sno',
      width: 44,
      align: 'center',
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Product',
      key: 'product_block',
      ellipsis: true,
      render: (_, record) => (
        <div className="stock-cell-stack">
          <div className="stock-cell-title">{record.name || '—'}</div>
          <div className="stock-cell-line">Batch: {record.batch_number || '—'}</div>
          <div className="stock-cell-line">{categoryDisplayLabel(record.category) || '—'}</div>
        </div>
      ),
    },
    {
      title: 'Stock & prices',
      key: 'stock_prices',
      render: (_, record) => {
        const value = record.available_quantity;
        const low = Number(value) <= Number(record.minimum_stock_alert || 5);
        return (
          <div className="stock-cell-stack">
            <div>
              <Badge status={low ? 'error' : 'success'} />
              <span style={{ color: low ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                {value ?? 0} units
              </span>
              <span className="stock-cell-line" style={{ display: 'inline', marginLeft: 6 }}>
                · Min alert: {record.minimum_stock_alert ?? '—'}
              </span>
            </div>
            <div className="stock-cell-line">Sell: {formatPkr(record.unit_price)}</div>
            <div className="stock-cell-line">
              Buy:{' '}
              {record.purchase_price != null && record.purchase_price !== ''
                ? formatPkr(record.purchase_price)
                : '—'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Expiry & status',
      key: 'expiry_status',
      width: 150,
      render: (_, record) => (
        <div className="stock-cell-stack">
          {renderExpiryTag(record.expiry_date)}
          <Tag color={record.status === 'active' ? 'success' : 'default'} style={{ margin: 0, fontSize: 12, width: 'fit-content' }}>
            {record.status === 'active' ? 'Active' : 'Inactive'}
          </Tag>
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 88,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <AntdButton type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Product"
              description="Are you sure you want to delete this product?"
              onConfirm={() => handleDelete(record._id || record.id)}
              okText="Yes"
              cancelText="No"
            >
              <AntdButton type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <ScreenWrap>
      <PageHeader 
        ghost 
        title={<span className="page-title">Medicine & inventory</span>}
        subTitle={<span className="page-sub">Stock levels, batches, expiry, and valuation</span>}
        buttons={[
          <Button key="excel" outlined type="primary" size="default" onClick={handleExportExcel}>
            <FileExcelOutlined style={{ marginRight: 8 }} />
            Excel
          </Button>,
          <Button key="pdf" outlined type="primary" size="default" onClick={handleExportPdf}>
            <FilePdfOutlined style={{ marginRight: 8 }} />
            PDF
          </Button>,
          <Button key="add" type="primary" size="default" onClick={handleAdd}>
            <PlusOutlined style={{ marginRight: 8 }} />
            Add Medicine
          </Button>,
          <Button key="refresh" outlined type="primary" size="default" onClick={fetchReport}>
            <ReloadOutlined style={{ marginRight: 8 }} />
            Refresh
          </Button>
        ]}
      />
      <Main>
     
        <StockKpiWrap>
        <KpiGrid>
          <KpiCard>
            <KpiMain>
              {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <>
                  <KpiValue>{summary?.total_products ?? 0}</KpiValue>
                  <KpiLabel>Total medicines</KpiLabel>
                  <KpiTrendMuted>SKUs in catalog</KpiTrendMuted>
                </>
              )}
            </KpiMain>
            <KpiSparkWrap>
              <MiniSpark data={sparkTotal} color={KPI_SPARK_COLORS[0]} />
            </KpiSparkWrap>
          </KpiCard>

          <KpiCard>
            <KpiMain>
              {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <>
                  <KpiValue style={{ color: (summary?.low_stock_count ?? 0) > 0 ? '#dc2626' : undefined }}>
                    {summary?.low_stock_count ?? 0}
                    {(summary?.low_stock_count ?? 0) > 0 && (
                      <WarningOutlined style={{ marginLeft: 8, color: '#dc2626', fontSize: 18 }} />
                    )}
                  </KpiValue>
                  <KpiLabel>Low stock items</KpiLabel>
                  <KpiTrendMuted>At or below minimum</KpiTrendMuted>
                </>
              )}
            </KpiMain>
            <KpiSparkWrap>
              <MiniSpark data={sparkLow} color={KPI_SPARK_COLORS[1]} />
            </KpiSparkWrap>
          </KpiCard>

          <KpiCard>
            <KpiMain>
              {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <>
                  <KpiValue>{formatPkr(summary?.total_stock_value ?? 0)}</KpiValue>
                  <KpiLabel>Total stock value</KpiLabel>
                  <KpiTrendMuted>At cost / valuation</KpiTrendMuted>
                </>
              )}
            </KpiMain>
            <KpiSparkWrap>
              <MiniSpark data={sparkValue} color={KPI_SPARK_COLORS[2]} />
            </KpiSparkWrap>
          </KpiCard>

          <KpiCard>
            <KpiMain>
              {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <>
                  <KpiValue>{activeMedicinesCount}</KpiValue>
                  <KpiLabel>Active medicines</KpiLabel>
                  <KpiTrendMuted>Available to sell</KpiTrendMuted>
                </>
              )}
            </KpiMain>
            <KpiSparkWrap>
              <MiniSpark data={sparkActive} color={KPI_SPARK_COLORS[3]} />
            </KpiSparkWrap>
          </KpiCard>
        </KpiGrid>
        </StockKpiWrap>

        <Row gutter={[20, 20]} style={{ width: '100%', maxWidth: '100%', marginInline: 0 }}>
          <Col xs={24} style={{ maxWidth: '100%', paddingInline: 0 }}>
            <div className="toolbar-card">
            <ProjectSorting>
              <div className="project-sort-bar">
                <div
                  className="toolbar-section-label"
                  style={{
                    padding: '0 10px',
                    flexShrink: 0,
                    alignSelf: 'center',
                  }}
                >
                  Medicine list
                </div>
                <div className="project-sort-search" style={{ flex: 1, minWidth: 200, maxWidth: 520 }}>
                  <Input
                    placeholder="Search by medicine name, batch number, category or supplier..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </div>
                <div className="project-sort-group" style={{ flexShrink: 0, padding: '0 10px' }}>
                  <Badge count={activeFilterCount} size="small" offset={[0, 0]} showZero={false}>
                    <AntdButton icon={<FilterOutlined />} onClick={() => setFilterModalVisible(true)}>
                      Filters
                    </AntdButton>
                  </Badge>
                </div>
              </div>
            </ProjectSorting>
            </div>

            <Modal
              title="Filter medicines"
              open={filterModalVisible}
              onCancel={() => setFilterModalVisible(false)}
              width={560}
              footer={
                <Space>
                  <AntdButton
                    onClick={() => {
                      clearFilters();
                    }}
                  >
                    Clear all
                  </AntdButton>
                  <AntdButton type="primary" onClick={() => setFilterModalVisible(false)}>
                    Done
                  </AntdButton>
                </Space>
              }
              destroyOnClose={false}
            >
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>
                    Expiry date range
                  </div>
                  <RangePicker
                    value={expiryDateRange}
                    onChange={(v) => setExpiryDateRange(v)}
                    format="YYYY-MM-DD"
                    allowClear
                    placeholder={['Expiry from', 'Expiry to']}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>
                    Expiry status
                  </div>
                  <Select
                    value={filterExpiryPreset}
                    onChange={setFilterExpiryPreset}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">All expiry states</Option>
                    <Option value="expired">Expired</Option>
                    <Option value="soon">Expiring ≤ 90 days</Option>
                    <Option value="ok">Expiry &gt; 90 days</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>
                    Category
                  </div>
                  <Select
                    value={filterCategory}
                    onChange={setFilterCategory}
                    style={{ width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                    placeholder="Category"
                  >
                    <Option value="all">All categories</Option>
                    {categories.map((c) => (
                      <Option key={c._id} value={c._id}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>
                    Status
                  </div>
                  <Select value={filterStatus} onChange={setFilterStatus} style={{ width: '100%' }}>
                    <Option value="all">All statuses</Option>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>
                    Stock level
                  </div>
                  <Select value={filterStockLevel} onChange={setFilterStockLevel} style={{ width: '100%' }}>
                    <Option value="all">All stock levels</Option>
                    <Option value="low">Low stock</Option>
                    <Option value="ok">Stock OK</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>
                    Supplier
                  </div>
                  <Select
                    value={filterSupplier}
                    onChange={setFilterSupplier}
                    style={{ width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                    placeholder="Supplier"
                  >
                    <Option value="all">All suppliers</Option>
                    {supplierOptions.map((name) => (
                      <Option key={name} value={name}>
                        {name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>
                    Prescription
                  </div>
                  <Select value={filterPrescription} onChange={setFilterPrescription} style={{ width: '100%' }}>
                    <Option value="all">All</Option>
                    <Option value="yes">Rx required</Option>
                    <Option value="no">Rx not required</Option>
                  </Select>
                </Col>
              </Row>
            </Modal>

            <StockTableOuter className="stock-table-outer">
              <div className="table-shell">
                <ProjectLists
                  size="middle"
                  columns={columns}
                  dataSource={paginatedProducts}
                  loading={loading}
                  total={filteredProducts.length}
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  onChange={handlePageChange}
                  onShowSizeChange={handleSizeChange}
                  scroll={{ x: 720 }}
                  rowKey={(r) => r._id || r.id}
                />
              </div>
            </StockTableOuter>
          </Col>
        </Row>

        {/* Add/Edit Medicine Modal */}
        <Modal
          title={editingProduct ? 'Edit Medicine' : 'Add New Medicine'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          width={800}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: 'active',
              is_prescription_required: false,
              discount: 0,
              gst: 0,
              available_quantity: 0,
              minimum_stock_alert: 5
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Medicine Name"
                  rules={[{ required: true, message: 'Please enter medicine name' }]}
                >
                  <Input placeholder="Enter medicine name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="batch_number"
                  label="Batch Number"
                  rules={[{ required: true, message: 'Please enter batch number' }]}
                >
                  <Input placeholder="Enter batch number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select placeholder="Select category" showSearch optionFilterProp="children">
                    {categories.map((c) => (
                      <Option key={c._id} value={c._id}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="supplier_name"
                  label="Supplier Name"
                  rules={[{ required: true, message: 'Please enter supplier name' }]}
                >
                  <Input placeholder="Enter supplier name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="unit_price"
                  label="Selling Price"
                  rules={[{ required: true, message: 'Please enter selling price' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    placeholder="Enter selling price"
                    addonBefore="Rs."
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="purchase_price"
                  label="Purchase Price"
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    placeholder="Enter purchase price"
                    addonBefore="Rs."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="available_quantity"
                  label="Current Stock"
                  rules={[{ required: true, message: 'Please enter current stock' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter quantity" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="minimum_stock_alert"
                  label="Minimum Stock Alert"
                  rules={[{ required: true, message: 'Please enter minimum stock alert' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter alert level" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="expiry_date"
                  label="Expiry Date"
                  rules={[{ required: true, message: 'Please select expiry date' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="manufacturer"
                  label="Manufacturer"
                >
                  <Input placeholder="Enter manufacturer name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="rack_location"
                  label="Rack Location"
                >
                  <Input placeholder="Enter rack location" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="medicine_size"
                  label="Medicine Size/Dosage"
                >
                  <Input placeholder="e.g., 500mg, 10ml" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="discount"
                  label="Discount (%)"
                >
                  <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="Enter discount" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="gst"
                  label="GST (%)"
                >
                  <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="Enter GST" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="barcode"
                  label="Barcode"
                >
                  <Space style={{ width: '100%' }}>
                    <Input placeholder="Enter or generate barcode" style={{ width: 'calc(100% - 100px)' }} />
                    <AntdButton onClick={generateBarcode} icon={<BarcodeOutlined />}>Generate</AntdButton>
                  </Space>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                >
                  <Select>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="manufacturer_license_no"
                  label="Manufacturer License No"
                >
                  <Input placeholder="Enter manufacturer license number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="manufacturer_registration_no"
                  label="Manufacturer Registration No"
                >
                  <Input placeholder="Enter manufacturer registration number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="storage_instructions"
                  label="Storage Instructions"
                >
                  <TextArea rows={2} placeholder="Enter storage instructions" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="notes"
                  label="Additional Notes"
                >
                  <TextArea rows={2} placeholder="Enter any additional notes" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="is_prescription_required"
                  label="Prescription Required"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <AntdButton onClick={() => setModalVisible(false)}>Cancel</AntdButton>
                <AntdButton type="primary" htmlType="submit">
                  {editingProduct ? 'Update' : 'Add'} Medicine
                </AntdButton>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Main>
    </ScreenWrap>
  );
}

export default StockManagement;