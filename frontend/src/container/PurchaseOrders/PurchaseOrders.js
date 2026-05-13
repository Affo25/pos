/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Input, message, Select, Tag, Modal, Button as AntdButton, Space, Spin } from 'antd';
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
} from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreatePurchaseOrder from './CreatePurchaseOrder';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deletePurchaseOrder, fetchAllPurchaseOrders } from '../../redux/purchaseorders/purchaseorderSlice';
import { getComponentPermissions } from '../../config/utils/permission';
import { fetchAllSuppliers } from '../../redux/suppliers/supplierSlice';
import { exportListToExcel, exportListToPdf } from '../../utils/listExport';
import { ScreenWrap } from '../shared/procurementScreenStyles';
import ModernModalStyles from '../shared/modalStyles';
import { API_BASE } from '../../config/apiBase';
import Cookies from 'js-cookie';

const PO_PDF_TEMPLATE = 'report_a4';

/** Maps a populated purchase order to the invoice payload used by A4 PDF generator */
function mapPurchaseOrderToInvoice(po) {
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
  const supplierName = po.supplier_id?.name || 'Supplier';
  return {
    invoice_no: po.order_number || '—',
    sale_date: po.order_date,
    customer_name: `${supplierName} (Purchase order)`,
    items,
    total_amount: subtotal,
    discount_amount: 0,
    tax_amount: 0,
    net_amount: subtotal,
  };
}

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

  const openPoPdfModal = useCallback(async (po) => {
    setPdfModalPo(po);
    setPdfLoading(true);
    setPdfObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('Please sign in');
        setPdfModalPo(null);
        return;
      }
      const invoice = mapPurchaseOrderToInvoice(po);
      const res = await fetch(`${API_BASE}/print/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice, template: PO_PDF_TEMPLATE }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || 'Could not generate PDF');
      }
      const blob = await res.blob();
      setPdfObjectUrl(URL.createObjectURL(blob));
    } catch (e) {
      message.error(e.message || 'Could not load PDF');
      setPdfModalPo(null);
    } finally {
      setPdfLoading(false);
    }
  }, []);

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
        body: JSON.stringify({ invoice, printer, template: PO_PDF_TEMPLATE }),
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
        const totalAmount = items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;

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
          total_amount: (
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {totalAmount.toFixed(2)}
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

  const PO_COL_W = 156;

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
      title: 'Total (PKR)',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: PO_COL_W,
      align: 'center',
      ellipsis: true,
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
      width: 132,
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
              {loading ? 'Loading…' : `${filteredPurchaseOrders.length} orders in current view`}
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
              <div className="table-toolbar">
                <div className="table-toolbar__search">
                  <Input prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />} placeholder="Search by order # or status" allowClear onChange={(e) => handleSearch(e.target.value)} />
                </div>
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
                loading={loading}
                total={filteredPurchaseOrders.length}
                current={pagination.current}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
                size="middle"
                scroll={{ x: 52 + PO_COL_W * 6 + 132 }}
                tableLayout="fixed"
              />
            </div>
          </Col>
        </Row>
        <ModernModalStyles />
        <Modal
          title={
            pdfModalPo ? (
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                Purchase order · {pdfModalPo.order_number}
              </span>
            ) : (
              'Purchase order'
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
          <div style={{ background: '#f1f5f9', minHeight: 420 }}>
            {pdfLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 420 }}>
                <Spin size="large" tip="Generating PDF…" />
              </div>
            ) : pdfObjectUrl ? (
              <iframe
                title="Purchase order PDF"
                src={`${pdfObjectUrl}#toolbar=0`}
                style={{
                  width: '100%',
                  height: '70vh',
                  maxHeight: 640,
                  minHeight: 420,
                  border: 'none',
                  display: 'block',
                  background: '#525659',
                }}
              />
            ) : (
              <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>No preview</div>
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
      </Main>
    </ScreenWrap>
  );
}

export default PurchaseOrders;