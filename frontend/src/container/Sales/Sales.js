/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import moment from 'moment';
import Cookies from 'js-cookie';
import Styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select, Modal, Table, Tag, Tabs, Divider, Skeleton, Spin, InputNumber, Typography, Space, Button as AntButton, Descriptions, Input, Form, DatePicker, Radio, Alert } from 'antd';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';
import { 
  EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined, 
  EyeOutlined, UndoOutlined, FileTextOutlined, PrinterOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  HistoryOutlined, ReloadOutlined,
  FileExcelOutlined, FilePdfOutlined, SearchOutlined, DownloadOutlined,
} from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateSale from './CreateSale';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteSale, fetchAllSales, updateSale, fetchSalesSuccess } from '../../redux/sales/saleSlice';
import * as saleService from '../../redux/sales/saleService';
import { getComponentPermissions } from '../../config/utils/permission';
import { fetchAllCustomers } from '../../redux/customers/customerSlice';
import { exportListToExcel, exportListToPdf } from '../../utils/listExport';
import { API_BASE } from '../../config/apiBase';
import { INVOICE_PDF_TEMPLATE, SALE_INVOICE_DOCUMENT_TITLE } from '../../utils/invoiceTemplates';
import {
  createPdfObjectUrl,
  fetchInvoicePdfBlob,
  saveInvoicePdfFromPreview,
} from '../../utils/invoicePdfPreview';
import { mapSaleToPrintInvoice, resolveSaleForReturn, maxReturnableSaleQty } from '../../utils/invoicePrintPayload';
import SaleReturnPreviewModal from './SaleReturnPreviewModal';
import { deferTask } from '../../utils/deferTask';
import PdfPreviewFrame from '../../components/pdf/PdfPreviewFrame';
import { useBulkDelete } from '../../hooks/useBulkDelete';
import TableToolbarSearchRow from '../../components/bulk/TableToolbarSearchRow';
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
import ModernModalStyles from '../shared/modalStyles';

const API_SETTINGS = `${API_BASE}/settings`;

/** Larger KPI type — aligned with supplier / procurement screens */
const StatisticsKpiWrap = Styled.div`
  ${KpiValue} {
    font-size: 28px !important;
  }
  ${KpiLabel} {
    font-size: 14px !important;
  }
  ${KpiTrendMuted} {
    font-size: 13px !important;
  }
`;

/** Table shell from ScreenWrap handles cell typography; keep action cluster compact */
const SalesTableActions = Styled.div`
  .action-buttons {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: nowrap;
  }
  .action-buttons .ant-btn {
    margin: 0 !important;
    padding: 4px 8px !important;
    min-width: auto !important;
  }
`;

const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

/** Prefer business sale_date, fallback to createdAt */
function saleMoment(sale) {
  return moment(sale?.sale_date || sale?.createdAt);
}

function formatSaleDateTime(sale) {
  const m = saleMoment(sale);
  return m.isValid() ? m.format('DD MMM YYYY, hh:mm A') : '—';
}

const KPI_SPARK_COLORS = ['#c4b5fd', '#fca5a5', '#86efac', '#93c5fd'];

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

function Sales() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { sales, loading } = useSelector((state) => state.sales);
  const { customers } = useSelector((state) => state.customers);
  const { login: user } = useSelector(state => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'Sales');

  const {
    selectedRowKeys,
    bulkDeleting,
    rowSelection,
    handleBulkDelete,
    removeFromSelection,
  } = useBulkDelete({
    deleteOne: saleService.deleteSale,
    onSuccess: () => dispatch(fetchAllSales()),
    entityName: 'sale',
    confirmTitle: 'Delete selected sales?',
    confirmContent: (count) =>
      `This will permanently delete ${count} sale(s). This cannot be undone.`,
  });

  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedSale: null,
    selectedSaleId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [selectedReturnSale, setSelectedReturnSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [allReturnRecords, setAllReturnRecords] = useState([]);
  const [returnsDataSource, setReturnsDataSource] = useState([]);
  const [returnsPagination, setReturnsPagination] = useState({ current: 1, pageSize: 10 });
  const [returnsSearchTerm, setReturnsSearchTerm] = useState('');
  const [returnPreview, setReturnPreview] = useState(null);
  /** today | range | all — default: today’s sales only */
  const [dateMode, setDateMode] = useState('today');
  const [dateRange, setDateRange] = useState(() => [moment().startOf('day'), moment().endOf('day')]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [printing, setPrinting] = useState(false);
  const [printerModalOpen, setPrinterModalOpen] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(localStorage.getItem('pos_printer') || '');
  const [printersLoading, setPrintersLoading] = useState(false);
  const [invoicePdfUrl, setInvoicePdfUrl] = useState(null);
  const [invoicePdfLoading, setInvoicePdfLoading] = useState(false);
  const [invoiceBranding, setInvoiceBranding] = useState(null);
  const [invoicePreviewError, setInvoicePreviewError] = useState(null);
  const invoicePdfReqId = useRef(0);
  const [registerPrinting, setRegisterPrinting] = useState(false);
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    totalRevenue: 0,
    completedOrders: 0,
    returnedOrders: 0
  });

  const { notData, visible, selectedSale } = state;

  const onDateModeChange = useCallback((e) => {
    const mode = e.target.value;
    setDateMode(mode);
    setPagination((p) => ({ ...p, current: 1 }));
    if (mode === 'today') {
      setDateRange([moment().startOf('day'), moment().endOf('day')]);
    } else if (mode === 'range') {
      setDateRange([moment().startOf('day'), moment().endOf('day')]);
    }
  }, []);

  const sparkTotalSales = useMemo(() => {
    const n = statistics.totalSales;
    return Array.from({ length: 7 }, (_, i) => Math.max(1, n * (0.85 + ((i * 13) % 20) / 100)));
  }, [statistics.totalSales]);

  const sparkRevenue = useMemo(() => {
    const v = Number(statistics.totalRevenue) || 0;
    return Array.from({ length: 7 }, (_, i) => Math.max(0, v * (0.4 + ((i * 17) % 40) / 100)));
  }, [statistics.totalRevenue]);

  const sparkCompleted = useMemo(() => {
    const n = statistics.completedOrders;
    return Array.from({ length: 7 }, (_, i) => Math.max(0, n * (0.55 + ((i * 19) % 40) / 100)));
  }, [statistics.completedOrders]);

  const sparkReturns = useMemo(() => {
    const n = statistics.returnedOrders;
    return Array.from({ length: 7 }, (_, i) => Math.max(0, n * (0.5 + ((i * 11) % 50) / 100)));
  }, [statistics.returnedOrders]);

  const handleEdit = (sale) => {
    const { _id: id, ...rest } = sale;
    setState({
      ...state,
      visible: true,
      selectedSale: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure?',
      content: 'This action cannot be undone. This will permanently delete the sale.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteSale(id));
          message.success('Sale deleted successfully');
          removeFromSelection(id);
          dispatch(fetchAllSales());
        } catch (error) {
          message.error('Failed to delete sale');
        }
      }
    });
  };

  const getSaleByIdFromStore = (sale) => {
    const sid = String(sale?._id || sale?.id || '');
    if (!sid || !Array.isArray(sales)) return sale;
    return sales.find((s) => String(s._id || s.id) === sid) || sale;
  };

  const handleViewInvoice = (sale) => {
    setInvoicePreviewError(null);
    setSelectedInvoice(getSaleByIdFromStore(sale));
    setInvoiceModalVisible(true);
  };

  const buildReturnModalItems = (sale) => {
    const rqMap = sale?.returned_qty_by_product || {};
    const hasReturnTracking = Object.keys(rqMap).length > 0;

    return (sale?.items || [])
      .map((item) => {
        const pid = String(item.product_id?._id || item.product_id);
        const qty = Number(item.quantity || 0);
        if (qty <= 0) return null;

        const returnedQty = hasReturnTracking ? Number(rqMap[pid] ?? rqMap[item.product_id] ?? 0) : 0;
        const remainingQty = maxReturnableSaleQty(qty, returnedQty);
        if (remainingQty <= 0) return null;

        const soldQty =
          returnedQty > 0 && returnedQty >= qty ? qty + returnedQty : qty;

        return {
          ...item,
          product_id: pid,
          soldQty,
          returnedQty,
          remainingQty,
          returnQuantity: 0,
          returnReason: '',
          selected: false,
        };
      })
      .filter(Boolean);
  };

  const handleProcessReturn = (sale) => {
    const src = getSaleByIdFromStore(sale);
    const returnable = buildReturnModalItems(src);
    if (!returnable.length) {
      message.info('All items on this sale have already been fully returned.');
      return;
    }
    setSelectedReturnSale(src);
    setReturnItems(returnable);
    setReturnReason('');
    setReturnModalVisible(true);
  };

  const handleReturnSubmit = async () => {
    const selectedItems = returnItems.filter(item => item.selected && item.returnQuantity > 0);
    
    if (selectedItems.length === 0) {
      message.warning('Please select at least one item to return');
      return;
    }

    if (!returnReason && selectedItems.length > 0) {
      message.warning('Please provide a reason for return');
      return;
    }

    const returnData = {
      sale_id: selectedReturnSale._id,
      items: selectedItems.map(item => ({
        product_id: item.product_id,
        quantity: item.returnQuantity,
        unit_price: item.unit_price,
        reason: item.returnReason || returnReason
      })),
      reason: returnReason
    };

    const refundTotal = selectedItems.reduce(
      (sum, item) => sum + item.returnQuantity * Number(item.unit_price || 0),
      0
    );

    Modal.confirm({
      title: 'Confirm Return',
      content: `Total return amount: ${formatPkr(refundTotal)}. Stock and invoice totals will be updated.`,
      onOk: async () => {
        try {
          const result = await saleService.processReturn(returnData);
          const freshList = await saleService.fetchAllSales();
          dispatch(fetchSalesSuccess(freshList));

          const sid = String(returnData.sale_id);
          const updated = Array.isArray(freshList)
            ? freshList.find((s) => String(s._id || s.id) === sid)
            : null;
          if (updated) {
            setSelectedInvoice((prev) =>
              prev && String(prev._id || prev.id) === sid ? updated : prev
            );
          }

          try {
            const retList = await saleService.fetchAllReturns();
            setAllReturnRecords(retList);
          } catch {
            /* keep existing return list */
          }

          const created = result?.returns || [];
          if (updated && created.length) {
            setReturnPreview({
              sale: updated,
              returnRecords: created,
              returnReason,
            });
          }

          message.success('Return processed — invoice totals updated.');
          setReturnModalVisible(false);
          setSelectedReturnSale(null);
          setReturnItems([]);
        } catch (error) {
          message.error(error?.message || 'Failed to process return');
        }
      },
    });
  };

  const openReturnPreview = useCallback((returnRecord) => {
    const sale = resolveSaleForReturn(returnRecord, sales);
    if (!sale) {
      message.warning('Sale not found for this return');
      return;
    }
    setReturnPreview({
      sale,
      returnRecords: [returnRecord],
      returnReason: returnRecord.reason || '',
    });
  }, [sales]);

  const closeReturnPreview = useCallback(() => {
    setReturnPreview(null);
  }, []);

  const filteredReturnRecords = useMemo(() => {
    if (!returnsSearchTerm.trim()) return allReturnRecords;
    const q = returnsSearchTerm.trim().toLowerCase();
    return allReturnRecords.filter((ret) => {
      const inv =
        ret.sale_id?.invoice_no ||
        (typeof ret.sale_id === 'object' ? ret.sale_id.invoice_no : '') ||
        '';
      const customer =
        ret.sale_id?.customer_name ||
        customers.find((c) => c._id === ret.sale_id?.customer_id)?.name ||
        '';
      const product = ret.product_id?.name || '';
      return (
        String(inv).toLowerCase().includes(q) ||
        String(customer).toLowerCase().includes(q) ||
        String(product).toLowerCase().includes(q) ||
        String(ret.reason || '').toLowerCase().includes(q)
      );
    });
  }, [allReturnRecords, returnsSearchTerm, customers]);

  const token = Cookies.get('token');

  const loadInvoicePdfPreview = useCallback(async (sale) => {
    if (!sale) return;
    const req = ++invoicePdfReqId.current;
    setInvoicePdfLoading(true);
    setInvoicePreviewError(null);
    try {
      const invoice = mapSaleToPrintInvoice(sale, customers);
      if (!invoice) throw new Error('Could not build invoice data');
      const blob = await fetchInvoicePdfBlob(invoice, INVOICE_PDF_TEMPLATE, token);
      if (invoicePdfReqId.current !== req) return;
      setInvoicePdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return createPdfObjectUrl(blob);
      });
    } catch (e) {
      if (invoicePdfReqId.current === req) {
        const msg = e.message || 'Could not generate preview';
        setInvoicePreviewError(msg);
        message.error(msg);
      }
    } finally {
      if (invoicePdfReqId.current === req) {
        setInvoicePdfLoading(false);
      }
    }
  }, [customers, token]);

  const closeInvoiceModal = useCallback(() => {
    invoicePdfReqId.current += 1;
    setInvoicePdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setInvoicePdfLoading(false);
    setInvoiceModalVisible(false);
  }, []);

  const fetchPrinters = async () => {
    setPrintersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/print/printers`, { headers: { Authorization: `Bearer ${token}` } });
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

  const openPrinterDialog = () => { fetchPrinters(); setPrinterModalOpen(true); };

  const printInvoice = async (inv) => {
    const raw = inv || selectedInvoice;
    if (!raw) { message.warning('No invoice to print'); return; }
    const printer = selectedPrinter || localStorage.getItem('pos_printer');
    if (!printer) { message.info('Please select a printer first'); openPrinterDialog(); return; }

    const invoicePayload = mapSaleToPrintInvoice(raw, customers);
    if (!invoicePayload) { message.warning('No invoice to print'); return; }

    setPrinting(true);
    try {
      const res = await fetch(`${API_BASE}/print/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice: invoicePayload, printer, template: INVOICE_PDF_TEMPLATE }),
      });
      const data = await res.json();
      if (res.ok && data.success) message.success(`Sale order PDF sent to ${printer}`);
      else message.error(data.error || 'Print failed');
    } catch (err) {
      message.error('Print service unavailable');
    } finally {
      setPrinting(false);
    }
  };

  const previewInvoicePDF = async (inv) => {
    const raw = inv || selectedInvoice;
    if (!raw) return;
    await loadInvoicePdfPreview(raw);
    message.success('PDF preview updated');
  };

  const handleSaveInvoicePdf = async () => {
    const raw = selectedInvoice;
    if (!raw) {
      message.warning('No invoice to save');
      return;
    }
    const invoiceNo = raw.invoice_no || `INV-${String(raw._id || raw.id || '').slice(-6)}`;
    const filename = `${invoiceNo}-sale-invoice-report`;
    try {
      const invoicePayload = mapSaleToPrintInvoice(raw, customers);
      await saveInvoicePdfFromPreview({
        objectUrl: invoicePdfUrl,
        invoice: invoicePayload,
        template: INVOICE_PDF_TEMPLATE,
        token,
        filename,
      });
      message.success('PDF saved to your downloads');
    } catch (e) {
      message.error(e?.message || 'Could not save PDF');
    }
  };

  const selectedInvoiceId = selectedInvoice ? String(selectedInvoice._id || selectedInvoice.id || '') : '';

  useEffect(() => {
    if (!invoiceModalVisible || !selectedInvoiceId) {
      setInvoicePdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setInvoicePdfLoading(false);
      setInvoicePreviewError(null);
      return undefined;
    }
    const sale =
      (Array.isArray(sales) && sales.find((s) => String(s._id || s.id) === selectedInvoiceId)) ||
      selectedInvoice;
    return deferTask(() => {
      if (invoiceModalVisible && selectedInvoiceId) {
        loadInvoicePdfPreview(sale);
      }
    });
  }, [invoiceModalVisible, selectedInvoiceId, loadInvoicePdfPreview, sales, selectedInvoice]);

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedSale: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedSale: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllSales());
    dispatch(fetchAllCustomers());
    saleService
      .fetchAllReturns()
      .then(setAllReturnRecords)
      .catch(() => setAllReturnRecords([]));
  }, [dispatch]);

  useEffect(() => {
    if (!token) return undefined;
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
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (sales && Array.isArray(sales)) {
      let filtered = [...sales];

      if (activeTab === 'active') {
        filtered = filtered.filter((item) =>
          ['completed', 'partially_returned'].includes(item.status)
        );
      } else if (activeTab === 'history') {
        filtered = filtered.filter(item => ['returned', 'partially_returned', 'cancelled'].includes(item.status));
      } else if (activeTab === 'all') {
        // Show all
      } else if (activeTab === 'returns') {
        setDataSource([]);
        setSalesHistory([]);
        return;
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (item) => {
            const customer = customers.find(c => c._id === item.customer_id);
            return customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase());
          }
        );
      }

      if (sortStatus !== 'category') {
        filtered = filtered.filter((item) => item.status?.toLowerCase() === sortStatus.toLowerCase());
      }

      if (dateMode === 'today') {
        const start = moment().startOf('day');
        const end = moment().endOf('day');
        filtered = filtered.filter((item) => {
          const m = saleMoment(item);
          return m.isValid() && m.isSameOrAfter(start) && m.isSameOrBefore(end);
        });
      } else if (dateMode === 'range' && dateRange?.[0] && dateRange?.[1]) {
        const start = dateRange[0].clone().startOf('day');
        const end = dateRange[1].clone().endOf('day');
        filtered = filtered.filter((item) => {
          const m = saleMoment(item);
          return m.isValid() && m.isSameOrAfter(start) && m.isSameOrBefore(end);
        });
      }

      const completedForStats = filtered.filter((s) =>
        ['completed', 'partially_returned'].includes(s.status)
      );
      const returnedForStats = filtered.filter((s) => s.status === 'returned');
      const totalRevenue = completedForStats.reduce((sum, sale) => sum + (sale.net_amount || 0), 0);
      setStatistics({
        totalSales: filtered.length,
        totalRevenue,
        completedOrders: completedForStats.length,
        returnedOrders: returnedForStats.length,
      });

      filtered.sort((a, b) => saleMoment(b).valueOf() - saleMoment(a).valueOf());

      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filtered.slice(start, end);

      const formatted = paginatedData.map((sale, index) => {
        const { _id, id, customer_id, total_amount, net_amount, status, invoice_no } = sale;
        const customer = customers.find(cat => cat._id === customer_id);
        const customerName = customer?.name || 'Walk-in Customer';
        
        const getStatusTag = () => {
          switch(status) {
            case 'completed':
              return <Tag style={{color:"green"}} color="success" icon={<CheckCircleOutlined />}>Completed</Tag>;
            case 'returned':
              return <Tag style={{color:"red"}} color="error" icon={<CloseCircleOutlined />}>Returned</Tag>;
            case 'partially_returned':
              return <Tag style={{color:"orange"}} color="warning">Partially Returned</Tag>;
            case 'cancelled':
              return <Tag style={{color:"gray"}} color="default">Cancelled</Tag>;
            default:
              return <Tag color="processing">Pending</Tag>;
          }
        };

        return {
          key: _id || id,
          id: _id || id,
          invoice_no: invoice_no || `INV-${_id?.slice(-6)}`,
          customer: customerName,
          total_amount: `₹${Number(total_amount ?? 0).toFixed(2)}`,
          net_amount: `₹${Number(net_amount ?? 0).toFixed(2)}`,
          date: formatSaleDateTime(sale),
          status: getStatusTag(),
          action: (
                     <Space size="small">
              <AntButton 
                type="text" 
                icon={<EyeOutlined style={{ color: '#00b4d8' }} />} 
                onClick={() => handleViewInvoice(sale)}
                title="View Invoice"
              />
              <AntButton
                type="text"
                icon={<PrinterOutlined style={{ color: '#2D3142' }} />}
                onClick={() => printInvoice(sale)}
                title="Print Invoice"
              />
              {['completed', 'partially_returned'].includes(status) && (
                <AntButton 
                  type="text" 
                  icon={<UndoOutlined style={{ color: '#ff9800' }} />} 
                  onClick={() => handleProcessReturn(sale)}
                  title="Process Return"
                />
              )}
              {/* <AntButton 
                className="delete-btn"
                type="text" 
                icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} 
                onClick={() => handleDelete(_id || id)}
                title="Delete Sale"
                disabled={!canDelete}
              /> */}
            </Space>
          ),
        };
      });
      setDataSource(formatted);
      setSalesHistory(filtered);
    }
  }, [sales, pagination, searchTerm, sortStatus, customers, activeTab, canDelete, dateMode, dateRange]);

  const SALE_COL_W = 156;

  useEffect(() => {
    if (activeTab !== 'returns') return;
    if (!filteredReturnRecords.length) {
      setReturnsDataSource([]);
      return;
    }
    const start = (returnsPagination.current - 1) * returnsPagination.pageSize;
    const end = start + returnsPagination.pageSize;
    const paginated = filteredReturnRecords.slice(start, end);

    const formatted = paginated.map((ret) => {
      const sale = resolveSaleForReturn(ret, sales);
      const customer =
        ret.sale_id?.customer_name ||
        customers.find((c) => String(c._id) === String(sale?.customer_id))?.name ||
        'Walk-in Customer';
      const invoiceNo =
        ret.sale_id?.invoice_no ||
        sale?.invoice_no ||
        `INV-${String(ret.sale_id?._id || ret.sale_id || '').slice(-6)}`;
      const qty = Number(ret.quantity || 0);
      const price = Number(ret.unit_price || 0);
      const lineTotal = Number(ret.refund_amount ?? qty * price);

      return {
        key: ret._id,
        invoice_no: invoiceNo,
        return_date: ret.return_date
          ? new Date(ret.return_date).toLocaleDateString()
          : ret.createdAt
            ? new Date(ret.createdAt).toLocaleDateString()
            : '—',
        customer,
        product: ret.product_id?.name || '—',
        quantity: qty,
        price,
        line_total: lineTotal,
        reason: ret.reason || '—',
        action: (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => openReturnPreview(ret)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                border: '1px solid #BFDBFE',
                background: '#EFF6FF',
                cursor: 'pointer',
                color: '#1D4ED8',
              }}
              title="View return invoice"
            >
              <EyeOutlined style={{ fontSize: 14 }} />
            </button>
            {sale && ['completed', 'partially_returned'].includes(sale.status) && (
              <button
                type="button"
                onClick={() => handleProcessReturn(sale)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  border: '1px solid #FDE68A',
                  background: '#FFFBEB',
                  cursor: 'pointer',
                  color: '#B45309',
                }}
                title="Process another return on this sale"
              >
                <UndoOutlined style={{ fontSize: 14 }} />
              </button>
            )}
          </div>
        ),
      };
    });
    setReturnsDataSource(formatted);
  }, [
    activeTab,
    filteredReturnRecords,
    returnsPagination,
    sales,
    customers,
    openReturnPreview,
  ]);

  const returnColumns = [
    {
      title: '#',
      key: 'index',
      width: 52,
      align: 'center',
      render: (text, record, index) =>
        (returnsPagination.current - 1) * returnsPagination.pageSize + index + 1,
    },
    {
      title: 'Invoice No',
      dataIndex: 'invoice_no',
      key: 'invoice_no',
      width: SALE_COL_W,
      align: 'center',
      ellipsis: true,
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{text}</span>,
    },
    {
      title: 'Return Date',
      dataIndex: 'return_date',
      key: 'return_date',
      width: SALE_COL_W,
      align: 'center',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: SALE_COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      width: SALE_COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center',
      render: (n) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{n}</span>
      ),
    },
    {
      title: 'Price (PKR)',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      align: 'center',
      render: (v) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v).toFixed(2)}</span>
      ),
    },
    {
      title: 'Refund (PKR)',
      dataIndex: 'line_total',
      key: 'line_total',
      width: 110,
      align: 'center',
      render: (v) => (
        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#b45309' }}>
          {Number(v).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: SALE_COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
    },
  ];

  const handlePageChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  const handleSizeChange = (current, size) => {
    setPagination({
      ...pagination,
      current: 1,
      pageSize: size,
    });
  };

  const handleExportExcel = () => {
    if (!salesHistory?.length) {
      message.warning('No data to export');
      return;
    }
    const headers = ['Invoice No', 'Customer', 'Date & time', 'Total (PKR)', 'Net (PKR)', 'Status'];
    const rows = salesHistory.map((sale) => {
      const customer = customers.find((c) => c._id === sale.customer_id);
      const customerName = customer?.name || sale.customer_name || 'Walk-in Customer';
      const dt = formatSaleDateTime(sale);
      return [
        sale.invoice_no || `INV-${String(sale._id || '').slice(-6)}`,
        customerName,
        dt === '—' ? '' : dt,
        Number(sale.total_amount || 0).toFixed(2),
        Number(sale.net_amount || 0).toFixed(2),
        sale.status || '',
      ];
    });
    exportListToExcel({
      filename: `sales-${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Sales',
      headers,
      rows,
    });
    message.success('Excel file downloaded');
  };

  const handleExportPdf = () => {
    if (!salesHistory?.length) {
      message.warning('No data to export');
      return;
    }
    const headers = ['Invoice No', 'Customer', 'Date & time', 'Total (PKR)', 'Net (PKR)', 'Status'];
    const rows = salesHistory.map((sale) => {
      const customer = customers.find((c) => c._id === sale.customer_id);
      const customerName = customer?.name || sale.customer_name || 'Walk-in Customer';
      const dt = formatSaleDateTime(sale);
      return [
        sale.invoice_no || `INV-${String(sale._id || '').slice(-6)}`,
        customerName,
        dt === '—' ? '' : dt,
        Number(sale.total_amount || 0).toFixed(2),
        Number(sale.net_amount || 0).toFixed(2),
        sale.status || '',
      ];
    });
    exportListToPdf({
      title: 'Sales list (current filters)',
      filename: `sales-${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows,
    });
    message.success('PDF file downloaded');
  };

  const buildSalesRegisterPayload = useCallback(() => {
    if (!salesHistory?.length) return null;
    const records = salesHistory.map((sale) => {
      const customer = customers.find((c) => c._id === sale.customer_id);
      const customerName = sale.customer_name || customer?.name || 'Walk-in Customer';
      return {
        invoice_no: sale.invoice_no || `INV-${String(sale._id || '').slice(-6)}`,
        customer_name: customerName,
        date_label: formatSaleDateTime(sale),
        total_amount: Number(sale.total_amount || 0),
        net_amount: Number(sale.net_amount || 0),
        status: sale.status || '',
      };
    });
    const subtitleParts = [];
    if (activeTab === 'active') subtitleParts.push('Active sales');
    else if (activeTab === 'history') subtitleParts.push('Sales history');
    else if (activeTab === 'returns') subtitleParts.push('Returns');
    else subtitleParts.push('All sales');
    if (dateMode === 'today') subtitleParts.push('Today');
    else if (dateMode === 'range' && dateRange?.[0] && dateRange?.[1]) {
      subtitleParts.push(`${dateRange[0].format('DD/MM/YYYY')} – ${dateRange[1].format('DD/MM/YYYY')}`);
    } else subtitleParts.push('All dates');
    if (searchTerm) subtitleParts.push(`Search: "${searchTerm}"`);
    if (sortStatus !== 'category') subtitleParts.push(`Status filter: ${sortStatus}`);
    return {
      records,
      subtitle: subtitleParts.join(' · '),
      generated_at: moment().format('DD/MM/YYYY, HH:mm'),
    };
  }, [salesHistory, customers, activeTab, dateMode, dateRange, searchTerm, sortStatus]);

  const handlePreviewSalesRegister = useCallback(async () => {
    const payload = buildSalesRegisterPayload();
    if (!payload) {
      message.warning('No sales in current view');
      return;
    }
    if (!token) {
      message.error('Please sign in');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/print/sales-register/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || 'Preview failed');
      }
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer');
    } catch (e) {
      message.error(e.message || 'Could not generate register PDF');
    }
  }, [buildSalesRegisterPayload, token]);

  const handlePrintAllSales = useCallback(() => {
    const payload = buildSalesRegisterPayload();
    if (!payload) {
      message.warning('No sales in current view');
      return;
    }
    const printer = selectedPrinter || localStorage.getItem('pos_printer');
    if (!printer) {
      message.info('Choose a printer first');
      openPrinterDialog();
      return;
    }
    if (!token) {
      message.error('Please sign in');
      return;
    }
    Modal.confirm({
      title: 'Print full sales register?',
      content: `Send ${payload.records.length} row(s) from the current filters to ${printer} as one multi-page A4 PDF.`,
      okText: 'Print',
      onOk: async () => {
        setRegisterPrinting(true);
        try {
          const res = await fetch(`${API_BASE}/print/sales-register/print`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...payload, printer }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || data.detail || 'Print failed');
          message.success(data.message || `Sent to ${printer}`);
        } catch (e) {
          message.error(e.message || 'Print failed');
        } finally {
          setRegisterPrinting(false);
        }
      },
    });
  }, [buildSalesRegisterPayload, selectedPrinter, token]);

  const columns = [
    { 
      title: '#', 
      key: 'index', 
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1, 
      width: 50,
      align: 'center'
    },
    { 
      title: 'Invoice No', 
      dataIndex: 'invoice_no', 
      key: 'invoice_no',
      width: 150,
      ellipsis: true
    },
    { 
      title: 'Date & time', 
      dataIndex: 'date', 
      key: 'date',
      width: 190
    },
    { 
      title: 'Customer', 
      dataIndex: 'customer', 
      key: 'customer',
      width: 200,
      ellipsis: true
    },
    { 
      title: 'Total Amount', 
      dataIndex: 'total_amount', 
      key: 'total_amount', 
      align: 'right',
      width: 120
    },
    { 
      title: 'Net Amount', 
      dataIndex: 'net_amount', 
      key: 'net_amount', 
      align: 'right',
      width: 120
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      width: 150,
      align: 'center'
    },
    { 
      title: 'Action', 
      dataIndex: 'action', 
      key: 'action', 
      width: 140,
      align: 'center',
      fixed: 'right'
    },
  ];

  // Statistics — same KPI strip as dashboard / stock management
  const StatisticsCards = () => (
    <StatisticsKpiWrap>
    <KpiGrid>
      <KpiCard>
        <KpiMain>
          {loading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <>
              <KpiValue>{statistics.totalSales}</KpiValue>
              <KpiLabel>Total sales</KpiLabel>
              <KpiTrendMuted>Matching filters</KpiTrendMuted>
            </>
          )}
        </KpiMain>
        <KpiSparkWrap>
          <MiniSpark data={sparkTotalSales} color={KPI_SPARK_COLORS[0]} />
        </KpiSparkWrap>
      </KpiCard>

      <KpiCard>
        <KpiMain>
          {loading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <>
              <KpiValue>{formatPkr(statistics.totalRevenue)}</KpiValue>
              <KpiLabel>Total revenue</KpiLabel>
              <KpiTrendMuted>Net from completed (filtered)</KpiTrendMuted>
            </>
          )}
        </KpiMain>
        <KpiSparkWrap>
          <MiniSpark data={sparkRevenue} color={KPI_SPARK_COLORS[1]} />
        </KpiSparkWrap>
      </KpiCard>

      <KpiCard>
        <KpiMain>
          {loading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <>
              <KpiValue>{statistics.completedOrders}</KpiValue>
              <KpiLabel>Completed orders</KpiLabel>
              <KpiTrendMuted>Successful sales</KpiTrendMuted>
            </>
          )}
        </KpiMain>
        <KpiSparkWrap>
          <MiniSpark data={sparkCompleted} color={KPI_SPARK_COLORS[2]} />
        </KpiSparkWrap>
      </KpiCard>

      <KpiCard>
        <KpiMain>
          {loading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <>
              <KpiValue style={{ color: statistics.returnedOrders > 0 ? '#ea580c' : undefined }}>
                {statistics.returnedOrders}
              </KpiValue>
              <KpiLabel>Returns</KpiLabel>
              <KpiTrendMuted>Returned / refund flow</KpiTrendMuted>
            </>
          )}
        </KpiMain>
        <KpiSparkWrap>
          <MiniSpark data={sparkReturns} color={KPI_SPARK_COLORS[3]} />
        </KpiSparkWrap>
      </KpiCard>
    </KpiGrid>
    </StatisticsKpiWrap>
  );

  return (
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title={<span className="page-title">Sales Management</span>}
          subTitle={
            <span className="page-sub">
              {loading ? 'Loading…' : `${salesHistory?.length || 0} sales in current view`}
            </span>
          }
          buttons={[
            <Button key="excel" outlined type="primary" size="default" onClick={handleExportExcel}>
              <FileExcelOutlined style={{ marginRight: 8 }} />
              Excel
            </Button>,
            <Button key="pdf" outlined type="primary" size="default" onClick={handleExportPdf}>
              <FilePdfOutlined style={{ marginRight: 8 }} />
              PDF
            </Button>,
            <AntButton key="preview-register" size="default" onClick={handlePreviewSalesRegister} icon={<FileTextOutlined />}>
              Preview register
            </AntButton>,
            <AntButton
              key="print-all"
              type="primary"
              size="default"
              loading={registerPrinting}
              onClick={handlePrintAllSales}
              icon={<PrinterOutlined />}
              style={{ background: '#2D3142', borderColor: 'transparent' }}
            >
              Print all (A4)
            </AntButton>,
            // <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
            //   <FeatherIcon icon="plus" size={16} /> New Sale
            // </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
        <StatisticsCards />

        <Row gutter={25}>
          <Col xs={24}>
            <div className="table-shell">
              <div className="table-toolbar">
                <TableToolbarSearchRow
                  showBulkDelete={canDelete && activeTab !== 'returns'}
                  bulkCount={selectedRowKeys.length}
                  bulkLoading={bulkDeleting}
                  onBulkDelete={handleBulkDelete}
                >
                  <Input
                    prefix={<SearchOutlined style={{ color: '#BFC0C0' }} />}
                    placeholder="Search by customer or invoice"
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </TableToolbarSearchRow>
                <div className="table-toolbar__filters">
                  <span className="table-toolbar__label">Status</span>
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)} style={{ minWidth: 130 }}>
                    <Select.Option value="category">All Status</Select.Option>
                    <Select.Option value="completed">Completed</Select.Option>
                    <Select.Option value="returned">Returned</Select.Option>
                    <Select.Option value="partially_returned">Partial Return</Select.Option>
                  </Select>
                  <span className="table-toolbar__label" style={{ marginLeft: 8 }}>Date</span>
                  <Radio.Group value={dateMode} onChange={onDateModeChange} size="small">
                    <Radio.Button value="today">Today</Radio.Button>
                    <Radio.Button value="range">Range</Radio.Button>
                    <Radio.Button value="all">All</Radio.Button>
                  </Radio.Group>
                  {dateMode === 'range' && (
                    <RangePicker
                      value={dateRange}
                      onChange={(dates) => {
                        if (dates?.[0] && dates?.[1]) {
                          setDateRange(dates);
                          setPagination((p) => ({ ...p, current: 1 }));
                        }
                      }}
                      format="DD/MM/YYYY"
                      style={{ minWidth: 220 }}
                    />
                  )}
                </div>
              </div>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="list-screen-tabs"
                style={{ padding: '0 16px' }}
              >
                <TabPane tab="Active Sales" key="active" />
                <TabPane tab="Sales History" key="history" />
                <TabPane tab={`Returns (${allReturnRecords.length})`} key="returns" />
                <TabPane tab="All Sales" key="all" />
              </Tabs>
              {activeTab === 'returns' ? (
                <>
                  <div className="table-toolbar" style={{ marginTop: 8 }}>
                    <div className="table-toolbar__search">
                      <Input
                        prefix={<SearchOutlined style={{ color: '#BFC0C0' }} />}
                        placeholder="Search by invoice, customer, product or reason"
                        allowClear
                        value={returnsSearchTerm}
                        onChange={(e) => {
                          setReturnsSearchTerm(e.target.value);
                          setReturnsPagination((p) => ({ ...p, current: 1 }));
                        }}
                      />
                    </div>
                  </div>
                  <SalesTableActions>
                    <ProjectLists
                      size="middle"
                      columns={returnColumns}
                      dataSource={returnsDataSource}
                      loading={loading}
                      total={filteredReturnRecords.length}
                      current={returnsPagination.current}
                      pageSize={returnsPagination.pageSize}
                      onChange={(page, pageSize) =>
                        setReturnsPagination({ current: page, pageSize })
                      }
                      onShowSizeChange={(_, size) =>
                        setReturnsPagination({ current: 1, pageSize: size })
                      }
                      scroll={{ x: 52 + SALE_COL_W * 4 + 80 + 110 + 110 + 100 }}
                      tableLayout="fixed"
                      locale={{
                        emptyText: 'No returns recorded yet. Process a return from an active sale.',
                      }}
                    />
                  </SalesTableActions>
                </>
              ) : (
                <SalesTableActions>
                  <ProjectLists
                    size="middle"
                    columns={columns}
                    dataSource={dataSource}
                    loading={loading || bulkDeleting}
                    total={salesHistory?.length || 0}
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    onChange={handlePageChange}
                    onShowSizeChange={handleSizeChange}
                    scroll={{ x: 1100 }}
                    rowKey="key"
                    rowSelection={canDelete ? rowSelection : undefined}
                  />
                </SalesTableActions>
              )}
            </div>
          </Col>
        </Row>
        
        <CreateSale
          visible={visible}
          onCancel={onCancel}
          sale={selectedSale}
          onSuccess={() => {
            dispatch(fetchAllSales());
          }}
        />

        <ModernModalStyles />
        {/* Invoice view: embedded A4 sale order PDF only */}
        <Modal
          title={
            selectedInvoice ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: 16 }}>
                  {SALE_INVOICE_DOCUMENT_TITLE} · {selectedInvoice.invoice_no || ''}
                </span>
              </div>
            ) : (
              SALE_INVOICE_DOCUMENT_TITLE
            )
          }
          open={invoiceModalVisible}
          onCancel={closeInvoiceModal}
          width={980}
          centered
          destroyOnClose
          bodyStyle={{ padding: 0 }}
          className="modern-modal"
          footer={[
            <AntButton
              key="save"
              onClick={handleSaveInvoicePdf}
              icon={<DownloadOutlined />}
              disabled={invoicePdfLoading}
              style={{ borderColor: '#059669', color: '#059669', borderRadius: 10 }}
            >
              Save PDF
            </AntButton>,
            <AntButton key="print" type="primary" loading={printing} onClick={() => printInvoice()} icon={<PrinterOutlined />}
              style={{ background: '#2D3142', borderColor: 'transparent', borderRadius: 10 }}>
              {selectedPrinter ? `Print → ${selectedPrinter}` : 'Print invoice'}
            </AntButton>,
            <AntButton key="preview" onClick={() => previewInvoicePDF()} icon={<FileTextOutlined />}
              style={{ borderColor: '#2D3142', color: '#2D3142', borderRadius: 10 }}>
              Refresh PDF
            </AntButton>,
            <AntButton key="printer" onClick={openPrinterDialog}
              style={{ borderColor: '#e5e7eb', color: '#374151', borderRadius: 10 }}>
              ⚙ Printer
            </AntButton>,
            <AntButton key="close" onClick={closeInvoiceModal}>
              Close
            </AntButton>,
          ]}
        >
          <div style={{ background: '#f1f5f9', minHeight: 480, position: 'relative' }}>
            {invoicePreviewError && (
              <Alert
                type="error"
                showIcon
                message="Could not load PDF preview"
                description={invoicePreviewError}
                style={{ margin: 12 }}
              />
            )}
            {invoicePdfUrl ? (
              <PdfPreviewFrame url={invoicePdfUrl} title={SALE_INVOICE_DOCUMENT_TITLE} />
            ) : (
              !invoicePreviewError &&
              !invoicePdfLoading && (
                <div style={{ padding: 48, textAlign: 'center', color: '#64748b', minHeight: 480 }}>
                  PDF preview will appear here. Use Refresh PDF if it does not load.
                </div>
              )
            )}
            {invoicePdfLoading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(241, 245, 249, 0.88)',
                  zIndex: 2,
                }}
              >
                <Spin size="large" tip={`Generating ${SALE_INVOICE_DOCUMENT_TITLE}…`} />
              </div>
            )}
          </div>
        </Modal>

        {/* Return Processing Modal */}
        <Modal
          title="Process Return"
          open={returnModalVisible}
          onCancel={() => setReturnModalVisible(false)}
          width={800}
          footer={[
            <AntButton key="cancel" onClick={() => setReturnModalVisible(false)}>
              Cancel
            </AntButton>,
            <AntButton key="submit" type="primary" onClick={handleReturnSubmit}>
              Process Return
            </AntButton>,
          ]}
        >
          {selectedReturnSale && (
            <div>
              <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Invoice No">{selectedReturnSale.invoice_no}</Descriptions.Item>
                <Descriptions.Item label="Customer">
                  {customers.find(c => c._id === selectedReturnSale.customer_id)?.name || 'Walk-in Customer'}
                </Descriptions.Item>
                <Descriptions.Item label="Current net (invoice)">
                  {formatPkr(selectedReturnSale.net_amount)}
                </Descriptions.Item>
                {Number(selectedReturnSale.total_return_amount) > 0 && (
                  <Descriptions.Item label="Returned so far">
                    {formatPkr(selectedReturnSale.total_return_amount)}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <h4>Select items to return</h4>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                Only quantities not already returned can be selected. The invoice net amount updates after you confirm.
              </Typography.Text>
              <Table
                dataSource={returnItems}
                pagination={false}
                size="small"
                rowKey={(r, i) => `ret-${r.product_id}-${i}`}
                columns={[
                  {
                    title: 'Select',
                    key: 'select',
                    width: 56,
                    render: (_, record, index) => (
                      <input
                        type="checkbox"
                        disabled={record.remainingQty <= 0}
                        checked={record.selected}
                        onChange={(e) => {
                          const newItems = [...returnItems];
                          newItems[index].selected = e.target.checked;
                          if (!e.target.checked) {
                            newItems[index].returnQuantity = 0;
                          } else {
                            newItems[index].returnQuantity = record.remainingQty;
                          }
                          setReturnItems(newItems);
                        }}
                      />
                    ),
                  },
                  { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
                  {
                    title: 'Sold',
                    key: 'soldQty',
                    align: 'center',
                    width: 72,
                    render: (_, record) => record.soldQty ?? record.quantity ?? 0,
                  },
                  {
                    title: 'Already returned',
                    key: 'returnedQty',
                    align: 'center',
                    width: 120,
                    render: (_, record) => record.returnedQty || 0,
                  },
                  {
                    title: 'Can return',
                    key: 'remainingQty',
                    align: 'center',
                    width: 96,
                    render: (_, record) => record.remainingQty ?? 0,
                  },
                  {
                    title: 'Return qty',
                    key: 'returnQuantity',
                    width: 120,
                    render: (_, record, index) => (
                      <InputNumber
                        min={0}
                        max={record.remainingQty}
                        value={record.returnQuantity}
                        disabled={!record.selected || record.remainingQty <= 0}
                        onChange={(value) => {
                          const newItems = [...returnItems];
                          newItems[index].returnQuantity = value ?? 0;
                          setReturnItems(newItems);
                        }}
                        style={{ width: '100%' }}
                      />
                    ),
                  },
                  {
                    title: 'Unit',
                    dataIndex: 'unit_price',
                    key: 'unit_price',
                    align: 'right',
                    width: 100,
                    render: (v) => formatPkr(v),
                  },
                  {
                    title: 'Return amount',
                    key: 'returnAmount',
                    align: 'right',
                    width: 120,
                    render: (_, record) =>
                      formatPkr(Number(record.returnQuantity || 0) * Number(record.unit_price || 0)),
                  },
                ]}
              />
              
              <Form.Item label="Return Reason" style={{ marginTop: 16 }}>
                <TextArea
                  rows={3}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Please provide reason for return"
                />
              </Form.Item>
              
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Typography.Text strong>
                  Total return amount:{' '}
                  {formatPkr(
                    returnItems.reduce(
                      (sum, item) =>
                        sum +
                        (item.selected
                          ? Number(item.returnQuantity || 0) * Number(item.unit_price || 0)
                          : 0),
                      0
                    )
                  )}
                </Typography.Text>
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
            <AntButton key="refresh" onClick={fetchPrinters} loading={printersLoading} icon={<ReloadOutlined />}
              style={{ borderRadius: 10 }}>
              Refresh
            </AntButton>,
            <AntButton key="ok" type="primary" disabled={!selectedPrinter}
              onClick={() => { localStorage.setItem('pos_printer', selectedPrinter); setPrinterModalOpen(false); message.success(`Printer set: ${selectedPrinter}`); }}
              style={{ background: '#2D3142', borderColor: 'transparent', borderRadius: 10 }}>
              Connect
            </AntButton>,
          ]}
        >
          {printersLoading ? (
            <div style={{ textAlign: 'center', padding: 32 }}><Skeleton active paragraph={{ rows: 2 }} /><div style={{ marginTop: 12, color: '#64748b' }}>Detecting printers…</div></div>
          ) : printers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No printers found. Click Refresh to scan.</div>
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
                        {p.driver || 'Unknown driver'} · {p.status}{p.port ? ` · ${p.port}` : ''}
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

        <SaleReturnPreviewModal
          visible={returnPreview != null}
          onCancel={closeReturnPreview}
          sale={returnPreview?.sale}
          returnRecords={returnPreview?.returnRecords}
          returnReason={returnPreview?.returnReason || ''}
        />
      </Main>
    </ScreenWrap>
  );
}

export default Sales;