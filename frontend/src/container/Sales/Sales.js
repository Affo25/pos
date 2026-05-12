/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import moment from 'moment';
import Cookies from 'js-cookie';
import Styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select, Modal, Table, Tag, Tabs, Divider, Skeleton, InputNumber, Typography, Space, Button as AntButton, Descriptions, Input, Form, DatePicker, Radio } from 'antd';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';
import { 
  EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined, 
  EyeOutlined, UndoOutlined, FileTextOutlined, PrinterOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  HistoryOutlined, ReloadOutlined,
  FileExcelOutlined, FilePdfOutlined,
} from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateSale from './CreateSale';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteSale, fetchAllSales, updateSale, fetchSalesSuccess } from '../../redux/sales/saleSlice';
import * as saleService from '../../redux/sales/saleService';
import { getComponentPermissions } from '../../config/utils/permission';
import { fetchAllCustomers } from '../../redux/customers/customerSlice';
import { exportListToExcel, exportListToPdf } from '../../utils/listExport';
import { API_BASE } from '../../config/apiBase';
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
  /** today | range | all — default: today’s sales only */
  const [dateMode, setDateMode] = useState('today');
  const [dateRange, setDateRange] = useState(() => [moment().startOf('day'), moment().endOf('day')]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [printing, setPrinting] = useState(false);
  const [printerModalOpen, setPrinterModalOpen] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(localStorage.getItem('pos_printer') || '');
  const [printersLoading, setPrintersLoading] = useState(false);
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
    setSelectedInvoice(getSaleByIdFromStore(sale));
    setInvoiceModalVisible(true);
  };

  const handleProcessReturn = (sale) => {
    const src = getSaleByIdFromStore(sale);
    setSelectedReturnSale(src);
    const rqMap = src.returned_qty_by_product || {};
    const initialReturnItems =
      src.items?.map((item) => {
        const pid = String(item.product_id);
        const returnedQty = Number(rqMap[pid] ?? rqMap[item.product_id] ?? 0);
        const remainingQty = Math.max(0, Number(item.quantity) - returnedQty);
        return {
          ...item,
          returnedQty,
          remainingQty,
          returnQuantity: 0,
          returnReason: '',
          selected: false,
        };
      }) || [];
    setReturnItems(initialReturnItems);
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
          await saleService.processReturn(returnData);
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

  const token = Cookies.get('token');

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
    const invoiceData = inv || selectedInvoice;
    if (!invoiceData) { message.warning('No invoice to print'); return; }
    const printer = selectedPrinter || localStorage.getItem('pos_printer');
    if (!printer) { message.info('Please select a printer first'); openPrinterDialog(); return; }

    setPrinting(true);
    try {
      const res = await fetch(`${API_BASE}/print/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice: invoiceData, printer }),
      });
      const data = await res.json();
      if (res.ok && data.success) message.success(`Sent to ${printer}`);
      else message.error(data.error || 'Print failed');
    } catch (err) {
      message.error('Print service unavailable');
    } finally {
      setPrinting(false);
    }
  };

  const previewInvoicePDF = async (inv) => {
    const invoiceData = inv || selectedInvoice;
    if (!invoiceData) return;
    try {
      const res = await fetch(`${API_BASE}/print/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice: invoiceData }),
      });
      if (!res.ok) { message.error('Preview failed'); return; }
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (err) {
      message.error('Could not generate preview');
    }
  };

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
  }, []);

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
        filtered = filtered.filter(item => ['returned', 'partially_returned'].includes(item.status));
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
                icon={<PrinterOutlined style={{ color: '#1a3a34' }} />}
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
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> New Sale
            </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
        <StatisticsCards />

        <Row gutter={25}>
          <Col xs={24}>
            <div className="toolbar-card">
            <ProjectSorting>
              <div className="project-sort-bar">
                <div className="project-sort-search">
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search by customer or invoice" patterns />
                </div>
                <div className="sort-group">
                  <span style={{ display: 'flex', alignItems: 'center' }}>Filter:</span>
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)} style={{ width: 120 }}>
                    <Select.Option value="category">All Status</Select.Option>
                    <Select.Option value="completed">Completed</Select.Option>
                    <Select.Option value="returned">Returned</Select.Option>
                    <Select.Option value="partially_returned">Partially Returned</Select.Option>
                  </Select>
                </div>
                <div className="sort-group" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>Sale date:</span>
                  <Radio.Group value={dateMode} onChange={onDateModeChange} size="small">
                    <Radio.Button value="today">Today</Radio.Button>
                    <Radio.Button value="range">Date range</Radio.Button>
                    <Radio.Button value="all">All dates</Radio.Button>
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
                    />
                  )}
                </div>
              </div>
            </ProjectSorting>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="list-screen-tabs"
              style={{ marginTop: 8 }}
            >
              <TabPane tab="Active Sales" key="active" />
              <TabPane tab="Sales History" key="history" />
              <TabPane tab="Returns" key="returns" />
              <TabPane tab="All Sales" key="all" />
            </Tabs>

            <div className="table-shell" style={{ marginTop: 12 }}>
              <SalesTableActions>
                <ProjectLists
                  size="middle"
                  columns={columns}
                  dataSource={dataSource}
                  loading={loading}
                  total={salesHistory?.length || 0}
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  onChange={handlePageChange}
                  onShowSizeChange={handleSizeChange}
                  scroll={{ x: 1100 }}
                />
              </SalesTableActions>
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

        {/* Invoice View Modal */}
        <Modal
          title={`Invoice ${selectedInvoice?.invoice_no || ''}`}
          open={invoiceModalVisible}
          onCancel={() => setInvoiceModalVisible(false)}
          width={800}
          footer={[
            <AntButton key="print" type="primary" loading={printing} onClick={() => printInvoice()} icon={<PrinterOutlined />}
              style={{ background: '#1a3a34', borderColor: 'transparent', borderRadius: 10 }}>
              {selectedPrinter ? `Print → ${selectedPrinter}` : 'Print Invoice'}
            </AntButton>,
            <AntButton key="preview" onClick={() => previewInvoicePDF()} icon={<FileTextOutlined />}
              style={{ borderColor: '#1a3a34', color: '#1a3a34', borderRadius: 10 }}>
              Preview PDF
            </AntButton>,
            <AntButton key="printer" onClick={openPrinterDialog}
              style={{ borderColor: '#e5e7eb', color: '#374151', borderRadius: 10 }}>
              ⚙ Printer
            </AntButton>,
            <AntButton key="close" onClick={() => setInvoiceModalVisible(false)}>
              Close
            </AntButton>
          ]}
        >
          <div id="invoice-print-area">
            {selectedInvoice && (
              <div style={{ padding: 24 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <h2>INVOICE</h2>
                  <p>{selectedInvoice.invoice_no}</p>
                </div>
                
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <strong>Bill To:</strong>
                    <div>{selectedInvoice.customer_name || 'Walk-in Customer'}</div>
                    {selectedInvoice.customer_phone && <div>{selectedInvoice.customer_phone}</div>}
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <div>
                      <strong>Date & time:</strong> {formatSaleDateTime(selectedInvoice)}
                    </div>
                    <div><strong>Status:</strong> {selectedInvoice.status}</div>
                  </Col>
                </Row>
                
                <Table
                  dataSource={selectedInvoice.items}
                  pagination={false}
                  size="small"
                  rowKey={(row, i) => `inv-${row.product_id}-${i}`}
                  columns={[
                    { title: 'Item', dataIndex: 'product_name', key: 'product_name' },
                    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center' },
                    {
                      title: 'Unit',
                      dataIndex: 'unit_price',
                      key: 'unit_price',
                      align: 'right',
                      render: (v) => formatPkr(v),
                    },
                    {
                      title: 'Line total',
                      dataIndex: 'line_total',
                      key: 'line_total',
                      align: 'right',
                      render: (v) => formatPkr(v),
                    },
                  ]}
                />

                {Number(selectedInvoice.total_return_amount) > 0 &&
                  Array.isArray(selectedInvoice.return_items) &&
                  selectedInvoice.return_items.length > 0 && (
                    <>
                      <Divider orientation="left">Returns</Divider>
                      <Table
                        dataSource={selectedInvoice.return_items.map((row, idx) => {
                          const pid = String(row.product_id || '');
                          const line = selectedInvoice.items?.find(
                            (it) => String(it.product_id) === pid
                          );
                          return { ...row, key: `ret-${idx}`, productLabel: line?.product_name || pid };
                        })}
                        pagination={false}
                        size="small"
                        rowKey={(row) => row.key}
                        columns={[
                          { title: 'Product', dataIndex: 'productLabel', key: 'productLabel', ellipsis: true },
                          { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center' },
                          {
                            title: 'Refund',
                            dataIndex: 'refund_amount',
                            key: 'refund_amount',
                            align: 'right',
                            render: (v) => formatPkr(v),
                          },
                        ]}
                      />
                    </>
                  )}

                <Divider />

                <Row justify="end">
                  <Col span={10}>
                    <Row>
                      <Col span={12}>Subtotal (lines):</Col>
                      <Col span={12} style={{ textAlign: 'right' }}>
                        {formatPkr(selectedInvoice.total_amount)}
                      </Col>
                    </Row>
                    {Number(selectedInvoice.discount_amount ?? selectedInvoice.discount ?? 0) > 0 && (
                      <Row>
                        <Col span={12}>Discount:</Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          {formatPkr(selectedInvoice.discount_amount ?? selectedInvoice.discount)}
                        </Col>
                      </Row>
                    )}
                    <Row>
                      <Col span={12}>Tax:</Col>
                      <Col span={12} style={{ textAlign: 'right' }}>
                        {formatPkr(selectedInvoice.tax_amount)}
                      </Col>
                    </Row>
                    {Number(selectedInvoice.total_return_amount) > 0 && (
                      <Row>
                        <Col span={12}>Returns / refunds:</Col>
                        <Col span={12} style={{ textAlign: 'right', color: '#b45309' }}>
                          −{formatPkr(selectedInvoice.total_return_amount)}
                        </Col>
                      </Row>
                    )}
                    <Divider style={{ margin: '8px 0' }} />
                    <Row>
                      <Col span={12}>
                        <strong>Net (after returns):</strong>
                      </Col>
                      <Col span={12} style={{ textAlign: 'right' }}>
                        <strong>
                          {formatPkr(
                            Number(selectedInvoice.net_amount ?? 0)
                          )}
                        </strong>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                
                <Divider />
                
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <p>Thank you for your business!</p>
                </div>
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
          okText="Process Return"
          cancelText="Cancel"
          onOk={handleReturnSubmit}
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
                    dataIndex: 'quantity',
                    key: 'quantity',
                    align: 'center',
                    width: 72,
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
              style={{ background: '#1a3a34', borderColor: 'transparent', borderRadius: 10 }}>
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
                      border: isSelected ? '2px solid #1a3a34' : '1px solid #e5e7eb',
                      borderRadius: 10, background: isSelected ? '#f0fdf4' : '#fff',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <PrinterOutlined style={{ fontSize: 22, color: isEpson ? '#1a3a34' : '#94a3b8' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>
                        {p.name}
                        {isEpson && <span style={{ marginLeft: 8, fontSize: 10, background: '#1a3a34', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>RECOMMENDED</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {p.driver || 'Unknown driver'} · {p.status}{p.port ? ` · ${p.port}` : ''}
                      </div>
                    </div>
                    {isSelected && <span style={{ color: '#1a3a34', fontWeight: 700, fontSize: 18 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
          {selectedPrinter && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
              Selected: <strong style={{ color: '#1a3a34' }}>{selectedPrinter}</strong>
            </div>
          )}
        </Modal>
      </Main>
    </ScreenWrap>
  );
}

export default Sales;