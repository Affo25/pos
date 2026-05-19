/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Input, message, Select, Tag, Modal, Button as AntdButton, Space, Spin, Alert, Tabs } from 'antd';

const { TabPane } = Tabs;
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  SearchOutlined,
  RollbackOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { netOrderTotal } from '../../utils/purchaseOrderCalc';
import PurchaseOrderReturnModal from './PurchaseOrderReturnModal';
import PurchaseOrderReturnPreviewModal from './PurchaseOrderReturnPreviewModal';
import { flattenPurchaseOrderReturns } from '../../utils/invoicePrintPayload';
import FeatherIcon from 'feather-icons-react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreatePurchaseOrder from './CreatePurchaseOrder';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deletePurchaseOrder, fetchAllPurchaseOrders } from '../../redux/purchaseorders/purchaseorderSlice';
import * as purchaseorderApi from '../../redux/purchaseorders/purchaseorderService';
import { getComponentPermissions } from '../../config/utils/permission';
import { useBulkDelete } from '../../hooks/useBulkDelete';
import TableToolbarSearchRow from '../../components/bulk/TableToolbarSearchRow';
import { fetchAllSuppliers } from '../../redux/suppliers/supplierSlice';
import { exportListToExcel, exportListToPdf } from '../../utils/listExport';
import { ScreenWrap } from '../shared/procurementScreenStyles';
import ModernModalStyles from '../shared/modalStyles';
import { API_BASE } from '../../config/apiBase';
import Cookies from 'js-cookie';
import { INVOICE_PDF_TEMPLATE, PURCHASE_ORDER_INVOICE_DOCUMENT_TITLE } from '../../utils/invoiceTemplates';
import {
  createPdfObjectUrl,
  fetchInvoicePdfBlob,
  saveInvoicePdfFromPreview,
} from '../../utils/invoicePdfPreview';
import { mapPurchaseOrderToInvoice } from '../../utils/invoicePrintPayload';
import { deferTask } from '../../utils/deferTask';
import PdfPreviewFrame from '../../components/pdf/PdfPreviewFrame';

function formatStatusLabel(status) {
  if (!status) return '—';
  const s = String(status);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PurchaseOrders() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { purchaseorders, loading } = useSelector((state) => state.purchaseorders);
  const { suppliers } = useSelector((state) => state.suppliers);
  const { login: user } = useSelector(state => state.auth);
  const { canEdit, canDelete } = getComponentPermissions(user, 'PurchaseOrders');

  const {
    selectedRowKeys,
    bulkDeleting,
    rowSelection,
    handleBulkDelete,
    removeFromSelection,
  } = useBulkDelete({
    deleteOne: purchaseorderApi.deletePurchaseOrder,
    onSuccess: () => dispatch(fetchAllPurchaseOrders()),
    entityName: 'purchase order',
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
    selectedPurchaseOrder: null,
    selectedPurchaseOrderId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('all');
  const [pdfModalPo, setPdfModalPo] = useState(null);
  const [pdfObjectUrl, setPdfObjectUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printSubmitting, setPrintSubmitting] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [printersLoading, setPrintersLoading] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(undefined);
  const [returnModalPo, setReturnModalPo] = useState(null);
  const [pdfPreviewError, setPdfPreviewError] = useState(null);
  const [listTab, setListTab] = useState('orders');
  const [returnPreview, setReturnPreview] = useState(null);
  const [returnsPagination, setReturnsPagination] = useState({ current: 1, pageSize: 10 });
  const [returnsDataSource, setReturnsDataSource] = useState([]);
  const [returnsSearchTerm, setReturnsSearchTerm] = useState('');

  const { notData, visible, selectedPurchaseOrder } = state;

  const handleEdit = (purchaseorder) => {
    const { _id: id, ...rest } = purchaseorder;

    setState({
      ...state,
      visible: true,
      selectedPurchaseOrder: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deletePurchaseOrder(id));
    removeFromSelection(id);
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedPurchaseOrder: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedPurchaseOrder: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  const closePdfModal = useCallback(() => {
    setPdfObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPdfModalPo(null);
    setPdfLoading(false);
  }, []);

  const loadPoPdfPreview = useCallback(async (po) => {
    if (!po) return;
    setPdfLoading(true);
    setPdfPreviewError(null);
    try {
      const token = Cookies.get('token');
      const invoice = mapPurchaseOrderToInvoice(po);
      const blob = await fetchInvoicePdfBlob(invoice, INVOICE_PDF_TEMPLATE, token);
      setPdfObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return createPdfObjectUrl(blob);
      });
    } catch (e) {
      const msg = e.message || 'Could not load PDF';
      setPdfPreviewError(msg);
      message.error(msg);
    } finally {
      setPdfLoading(false);
    }
  }, []);

  const openPoPdfModal = useCallback(
    (po) => {
      setPdfPreviewError(null);
      setPdfModalPo(po);
      deferTask(() => loadPoPdfPreview(po));
    },
    [loadPoPdfPreview],
  );

  const handleSavePurchasePdf = useCallback(async () => {
    if (!pdfModalPo) {
      message.warning('No purchase order to save');
      return;
    }
    const orderNo = pdfModalPo.order_number || `PO-${String(pdfModalPo._id || '').slice(-6)}`;
    const filename = `${orderNo}-purchase-order-invoice`;
    const token = Cookies.get('token');
    try {
      const invoice = mapPurchaseOrderToInvoice(pdfModalPo);
      await saveInvoicePdfFromPreview({
        objectUrl: pdfObjectUrl,
        invoice,
        template: INVOICE_PDF_TEMPLATE,
        token,
        filename,
      });
      message.success('PDF saved to your downloads');
    } catch (e) {
      message.error(e?.message || 'Could not save PDF');
    }
  }, [pdfModalPo, pdfObjectUrl]);

  const handlePrintPurchasePdf = useCallback(async () => {
    if (!pdfModalPo) return;
    const printer = selectedPrinter || localStorage.getItem('po_a4_printer');
    if (!printer) {
      message.warning('Select a printer');
      return;
    }
    localStorage.setItem('po_a4_printer', printer);
    const token = Cookies.get('token');
    if (!token) {
      message.error('Please sign in');
      return;
    }
    setPrintSubmitting(true);
    try {
      const invoice = mapPurchaseOrderToInvoice(pdfModalPo);
      const res = await fetch(`${API_BASE}/print/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice, printer, template: INVOICE_PDF_TEMPLATE }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.detail || 'Print failed');
      message.success(data.message || `Sent to ${printer}`);
    } catch (e) {
      message.error(e.message || 'Print failed');
    } finally {
      setPrintSubmitting(false);
    }
  }, [pdfModalPo, selectedPrinter]);

  useEffect(() => {
    if (!pdfModalPo) return undefined;
    let cancelled = false;
    setPrintersLoading(true);
    const token = Cookies.get('token');
    fetch(`${API_BASE}/print/printers`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.printers) return;
        setPrinters(data.printers);
        const saved = localStorage.getItem('po_a4_printer');
        const names = data.printers.map((p) => p.name);
        const pick = saved && names.includes(saved) ? saved : names[0];
        setSelectedPrinter(pick);
      })
      .catch(() => {
        if (!cancelled) setPrinters([]);
      })
      .finally(() => {
        if (!cancelled) setPrintersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pdfModalPo]);

  useEffect(() => {
    dispatch(fetchAllPurchaseOrders());
    dispatch(fetchAllSuppliers());
  }, []);

  const filteredPurchaseOrders = useMemo(() => {
    if (!purchaseorders || !Array.isArray(purchaseorders)) return [];
    let filtered = [...purchaseorders];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.status?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (sortStatus !== 'all') {
      filtered = filtered.filter((item) => item.status?.toLowerCase() === sortStatus.toLowerCase());
    }

    filtered.sort((a, b) => {
      if (searchTerm) {
        if (a.order_number?.toLowerCase().includes(searchTerm.toLowerCase())) return -1;
        if (b.order_number?.toLowerCase().includes(searchTerm.toLowerCase())) return 1;
      }
      return 0;
    });

    return filtered;
  }, [purchaseorders, searchTerm, sortStatus]);

  const poStats = useMemo(() => {
    const list = filteredPurchaseOrders;
    const pending = list.filter((p) => p.status === 'pending').length;
    const received = list.filter((p) => p.status === 'received').length;
    return { total: list.length, pending, received };
  }, [filteredPurchaseOrders]);

  const allReturns = useMemo(
    () => flattenPurchaseOrderReturns(purchaseorders),
    [purchaseorders],
  );

  const filteredReturns = useMemo(() => {
    if (!returnsSearchTerm.trim()) return allReturns;
    const q = returnsSearchTerm.trim().toLowerCase();
    return allReturns.filter(
      (r) =>
        r.order_number?.toLowerCase().includes(q) ||
        r.supplier?.toLowerCase().includes(q) ||
        r.product?.toLowerCase().includes(q) ||
        String(r.reason || '').toLowerCase().includes(q),
    );
  }, [allReturns, returnsSearchTerm]);

  const openReturnPreview = useCallback((purchaseorder, returnRecord) => {
    setReturnPreview({ purchaseorder, returnRecord });
  }, []);

  const closeReturnPreview = useCallback(() => {
    setReturnPreview(null);
  }, []);

  const handleReturnRecorded = useCallback(
    ({ purchaseorder: po, returnRecord }) => {
      dispatch(fetchAllPurchaseOrders());
      openReturnPreview(po, returnRecord);
    },
    [dispatch, openReturnPreview],
  );

  const PO_COL_W = 156;

  useEffect(() => {
    if (filteredPurchaseOrders.length) {
      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filteredPurchaseOrders.slice(start, end);

      const formatted = paginatedData.map((purchaseorder) => {
        const { _id, id, order_number,
          order_date,
          supplier_id,
          items,
          status, } = purchaseorder;

        const supplierName = supplier_id?.name || '—';
        const totalItems = items?.length || 0;
        const netTotal =
          purchaseorder.net_total != null
            ? Number(purchaseorder.net_total)
            : netOrderTotal(purchaseorder);
        const amountPaid = Number(purchaseorder.amount_paid || 0);
        const amountRemaining =
          purchaseorder.amount_remaining != null
            ? Number(purchaseorder.amount_remaining)
            : Math.max(0, netTotal - amountPaid);

        const statusLower = String(status || '').toLowerCase();
        const statusTagStyle =
          statusLower === 'received'
            ? { background: '#14532d', color: '#f8fafc', border: 'none' }
            : statusLower === 'pending'
              ? { background: '#b45309', color: '#f8fafc', border: 'none' }
              : statusLower === 'cancelled'
                ? { background: '#991b1b', color: '#f8fafc', border: 'none' }
                : { background: '#475569', color: '#f8fafc', border: 'none' };

        return {
          key: _id || id,
          id: _id || id,
          order_number,
          order_date: new Date(order_date).toLocaleDateString(),
          supplier: supplierName,
          total_items: totalItems,
          net_total: (
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {netTotal.toFixed(2)}
            </span>
          ),
          amount_paid: (
            <span style={{ fontVariantNumeric: 'tabular-nums', color: '#059669' }}>
              {amountPaid.toFixed(2)}
            </span>
          ),
          amount_remaining: (
            <span
              style={{
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: amountRemaining > 0 ? '#b45309' : '#64748b',
              }}
            >
              {amountRemaining.toFixed(2)}
            </span>
          ),
          status: (
            <Tag
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: '4px 12px',
                margin: 0,
                borderRadius: 6,
                ...statusTagStyle,
              }}
            >
              {formatStatusLabel(status)}
            </Tag>
          ),
          action: (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => openPoPdfModal(purchaseorder)}
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
                title="View PDF"
              >
                <EyeOutlined style={{ fontSize: 14 }} />
              </button>
              <button
                type="button"
                disabled={!canEdit || status === 'cancelled'}
                onClick={() => setReturnModalPo(purchaseorder)}
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
                title="Return items"
              >
                <RollbackOutlined style={{ fontSize: 14 }} />
              </button>
              <button type="button" disabled={!canEdit} onClick={() => handleEdit(purchaseorder)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#2D3142' }} title="Edit"><EditOutlined style={{ fontSize: 14 }} /></button>
              <button type="button" disabled={!canDelete} onClick={() => handleDelete(_id || id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #FEE2E2', background: '#FEF2F2', cursor: 'pointer', color: '#EF4444' }} title="Delete"><DeleteOutlined style={{ fontSize: 14 }} /></button>
            </div>
          ),
        };
      });
      setDataSource(formatted);
    } else {
      setDataSource([]);
    }
  }, [filteredPurchaseOrders, pagination, canEdit, canDelete, openPoPdfModal]);

  useEffect(() => {
    if (!filteredReturns.length) {
      setReturnsDataSource([]);
      return;
    }
    const start = (returnsPagination.current - 1) * returnsPagination.pageSize;
    const end = start + returnsPagination.pageSize;
    const paginated = filteredReturns.slice(start, end);

    const formatted = paginated.map((row) => {
      const lineTotal = Number(row.lineTotal || 0);
      return {
        key: row.key,
        order_number: row.order_number,
        return_date: row.return_date
          ? new Date(row.return_date).toLocaleDateString()
          : '—',
        supplier: row.supplier,
        product: row.product,
        quantity: row.quantity,
        price: Number(row.price || 0),
        line_total: lineTotal,
        reason: row.reason,
        action: (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => openReturnPreview(row.purchaseorder, row.returnRecord)}
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
            <button
              type="button"
              onClick={() => setReturnModalPo(row.purchaseorder)}
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
              title="Record another return on this order"
            >
              <RollbackOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
        ),
      };
    });
    setReturnsDataSource(formatted);
  }, [filteredReturns, returnsPagination, openReturnPreview]);

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
      title: 'Order No',
      dataIndex: 'order_number',
      key: 'order_number',
      width: PO_COL_W,
      align: 'center',
      ellipsis: true,
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{text}</span>,
    },
    {
      title: 'Return Date',
      dataIndex: 'return_date',
      key: 'return_date',
      width: PO_COL_W,
      align: 'center',
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      width: PO_COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      width: PO_COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: PO_COL_W,
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
      title: 'Total (PKR)',
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
      width: PO_COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: 168,
      align: 'center',
      fixed: 'right',
    },
  ];

  const handleExportExcel = () => {
    if (!filteredPurchaseOrders.length) {
      message.warning('No data to export');
      return;
    }
    const headers = ['Order No', 'Order Date', 'Supplier', 'Line items', 'Total (PKR)', 'Status'];
    const rows = filteredPurchaseOrders.map((po) => {
      const supplierName = po.supplier_id?.name || '—';
      const totalAmount = po.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
      return [
        po.order_number,
        new Date(po.order_date).toLocaleDateString(),
        supplierName,
        po.items?.length || 0,
        totalAmount.toFixed(2),
        po.status || '',
      ];
    });
    exportListToExcel({
      filename: `purchase-orders-${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Purchase orders',
      headers,
      rows,
    });
    message.success('Excel file downloaded');
  };

  const handleExportPdf = () => {
    if (!filteredPurchaseOrders.length) {
      message.warning('No data to export');
      return;
    }
    const headers = ['Order No', 'Order Date', 'Supplier', 'Line items', 'Total (PKR)', 'Status'];
    const rows = filteredPurchaseOrders.map((po) => {
      const supplierName = po.supplier_id?.name || '—';
      const totalAmount = po.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
      return [
        po.order_number,
        new Date(po.order_date).toLocaleDateString(),
        supplierName,
        po.items?.length || 0,
        totalAmount.toFixed(2),
        po.status || '',
      ];
    });
    exportListToPdf({
      title: 'Purchase orders (current filters)',
      filename: `purchase-orders-${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows,
    });
    message.success('PDF file downloaded');
  };

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

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 52,
      align: 'center',
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Order No',
      dataIndex: 'order_number',
      key: 'order_number',
      width: PO_COL_W,
      align: 'center',
      ellipsis: true,
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{text}</span>,
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      width: PO_COL_W,
      align: 'center',
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      width: PO_COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Items',
      dataIndex: 'total_items',
      key: 'total_items',
      width: PO_COL_W,
      align: 'center',
      render: (n) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{n}</span>
      ),
    },
    {
      title: 'Net (PKR)',
      dataIndex: 'net_total',
      key: 'net_total',
      width: 110,
      align: 'center',
    },
    {
      title: 'Paid',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      width: 100,
      align: 'center',
    },
    {
      title: 'Remaining',
      dataIndex: 'amount_remaining',
      key: 'amount_remaining',
      width: 110,
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: PO_COL_W,
      align: 'center',
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: 168,
      align: 'center',
      fixed: 'right',
    },
  ];


  return (
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title={<span className="page-title">Purchase orders</span>}
          subTitle={
            <span className="page-sub">
              {loading
                ? 'Loading…'
                : `${filteredPurchaseOrders.length} orders · ${allReturns.length} returns`}
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
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> New order
            </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
     
        <Row gutter={25}>
          <Col xs={24}>
            <div className="kpi-row">
              <div className="kpi-tile">
                <div className="kpi-label">
                  <ShoppingOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Total orders
                </div>
                <div className="kpi-value">{poStats.total}</div>
                <div className="kpi-hint">Matching filters</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <ClockCircleOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Pending
                </div>
                <div className="kpi-value" style={{ color: '#d97706' }}>
                  {poStats.pending}
                </div>
                <div className="kpi-hint">Awaiting receipt</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <CheckCircleOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Received
                </div>
                <div className="kpi-value" style={{ color: '#059669' }}>
                  {poStats.received}
                </div>
                <div className="kpi-hint">Completed lines</div>
              </div>
            </div>

            <div className="table-shell">
              <Tabs
                activeKey={listTab}
                onChange={setListTab}
                className="list-screen-tabs"
                style={{ padding: '0 16px' }}
              >
                <TabPane tab="Orders" key="orders" />
                <TabPane tab={`Returns (${allReturns.length})`} key="returns" />
              </Tabs>
              {listTab === 'orders' && (
              <>
              <div className="table-toolbar">
                <TableToolbarSearchRow
                  showBulkDelete={canDelete}
                  bulkCount={selectedRowKeys.length}
                  bulkLoading={bulkDeleting}
                  onBulkDelete={handleBulkDelete}
                >
                  <Input prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />} placeholder="Search by order # or status" allowClear onChange={(e) => handleSearch(e.target.value)} />
                </TableToolbarSearchRow>
                <div className="table-toolbar__filters">
                  <span className="table-toolbar__label">Status</span>
                  <Select defaultValue="all" onChange={(value) => setSortStatus(value)} style={{ minWidth: 140 }}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="received">Received</Select.Option>
                    <Select.Option value="cancelled">Cancelled</Select.Option>
                  </Select>
                </div>
              </div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading || bulkDeleting}
                total={filteredPurchaseOrders.length}
                current={pagination.current}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
                size="middle"
                scroll={{ x: 52 + PO_COL_W * 4 + 110 + 100 + 110 + 168 }}
                tableLayout="fixed"
                rowKey="key"
                rowSelection={canDelete ? rowSelection : undefined}
              />
              </>
              )}
              {listTab === 'returns' && (
                <>
                  <div className="table-toolbar">
                    <div className="table-toolbar__search">
                      <Input
                        prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
                        placeholder="Search by order #, supplier, product or reason"
                        allowClear
                        value={returnsSearchTerm}
                        onChange={(e) => {
                          setReturnsSearchTerm(e.target.value);
                          setReturnsPagination((p) => ({ ...p, current: 1 }));
                        }}
                      />
                    </div>
                  </div>
                  <ProjectLists
                    columns={returnColumns}
                    dataSource={returnsDataSource}
                    loading={loading}
                    total={filteredReturns.length}
                    current={returnsPagination.current}
                    pageSize={returnsPagination.pageSize}
                    onChange={(page, pageSize) =>
                      setReturnsPagination({ current: page, pageSize })
                    }
                    onShowSizeChange={(_, size) =>
                      setReturnsPagination({ current: 1, pageSize: size })
                    }
                    size="middle"
                    scroll={{ x: 52 + PO_COL_W * 5 + 110 + 110 + 168 }}
                    tableLayout="fixed"
                    locale={{
                      emptyText: 'No returns recorded yet. Use the return action on an order.',
                    }}
                  />
                </>
              )}
            </div>
          </Col>
        </Row>
        <ModernModalStyles />
        <Modal
          title={
            pdfModalPo ? (
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: 16 }}>
                {PURCHASE_ORDER_INVOICE_DOCUMENT_TITLE} · {pdfModalPo.order_number}
              </span>
            ) : (
              PURCHASE_ORDER_INVOICE_DOCUMENT_TITLE
            )
          }
          open={pdfModalPo != null}
          onCancel={closePdfModal}
          className="modern-modal"
          width={980}
          centered
          destroyOnClose
          bodyStyle={{ padding: 0 }}
          footer={
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
              }}
            >
              <Select
                showSearch
                placeholder="Select printer"
                style={{ minWidth: 280, maxWidth: '100%' }}
                value={selectedPrinter}
                loading={printersLoading}
                optionFilterProp="children"
                onChange={(v) => {
                  setSelectedPrinter(v);
                  localStorage.setItem('po_a4_printer', v);
                }}
              >
                {printers.map((p) => (
                  <Select.Option key={p.name} value={p.name}>
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
              <Space>
                <AntdButton onClick={closePdfModal}>Cancel</AntdButton>
                <AntdButton
                  icon={<DownloadOutlined />}
                  disabled={pdfLoading}
                  onClick={handleSavePurchasePdf}
                >
                  Save PDF
                </AntdButton>
                <AntdButton
                  type="primary"
                  icon={<PrinterOutlined />}
                  loading={printSubmitting}
                  onClick={handlePrintPurchasePdf}
                >
                  Print A4
                </AntdButton>
              </Space>
            </div>
          }
        >
          <div style={{ background: '#f1f5f9', minHeight: 480, position: 'relative' }}>
            {pdfPreviewError && (
              <Alert
                type="error"
                showIcon
                message="Could not load PDF preview"
                description={pdfPreviewError}
                style={{ margin: 12 }}
              />
            )}
            {pdfObjectUrl ? (
              <PdfPreviewFrame url={pdfObjectUrl} title={PURCHASE_ORDER_INVOICE_DOCUMENT_TITLE} />
            ) : (
              !pdfPreviewError &&
              !pdfLoading && (
                <div style={{ padding: 48, textAlign: 'center', color: '#64748b', minHeight: 480 }}>
                  PDF preview will appear here.
                </div>
              )
            )}
            {pdfLoading && (
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
                <Spin size="large" tip={`Generating ${PURCHASE_ORDER_INVOICE_DOCUMENT_TITLE}…`} />
              </div>
            )}
          </div>
        </Modal>
        <CreatePurchaseOrder
          visible={visible}
          onCancel={onCancel}
          purchaseorder={selectedPurchaseOrder}
          onSuccess={() => {
            dispatch(fetchAllPurchaseOrders());
          }}
        />
        <PurchaseOrderReturnModal
          visible={returnModalPo != null}
          onCancel={() => setReturnModalPo(null)}
          purchaseorder={returnModalPo}
          onSuccess={() => dispatch(fetchAllPurchaseOrders())}
          onReturnRecorded={handleReturnRecorded}
        />
        <PurchaseOrderReturnPreviewModal
          visible={returnPreview != null}
          onCancel={closeReturnPreview}
          purchaseorder={returnPreview?.purchaseorder}
          returnRecord={returnPreview?.returnRecord}
        />
      </Main>
    </ScreenWrap>
  );
}

export default PurchaseOrders;