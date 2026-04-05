/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import Styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select, Modal, Table, Tag, Tabs, Divider, Skeleton, InputNumber, Typography, Space, Button as AntButton, Descriptions, Input, Form, DatePicker } from 'antd';
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
import { deleteSale, fetchAllSales, updateSale, processReturn } from '../../redux/sales/saleSlice';
import { getComponentPermissions } from '../../config/utils/permission';
import { fetchAllCustomers } from '../../redux/customers/customerSlice';
import { exportListToExcel, exportListToPdf } from '../../utils/listExport';
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

const CustomTableWrapper = Styled.div`
  .ant-table-tbody > tr > td {
    padding: 12px 10px !important;
    vertical-align: middle !important;
  }
  .ant-table-thead > tr > th {
    padding: 12px 10px !important;
    font-weight: 600 !important;
    background-color: #fafafa !important;
  }
  .ant-table {
    font-size: 14px !important;
  }
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
  const [salesHistory, setSalesHistory] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    totalRevenue: 0,
    completedOrders: 0,
    returnedOrders: 0
  });

  const { notData, visible, selectedSale } = state;

  // Calculate statistics
  useEffect(() => {
    if (sales && Array.isArray(sales)) {
      const completed = sales.filter(s => s.status === 'completed');
      const returned = sales.filter(s => s.status === 'returned');
      const totalRevenue = completed.reduce((sum, sale) => sum + (sale.net_amount || 0), 0);
      
      setStatistics({
        totalSales: sales.length,
        totalRevenue,
        completedOrders: completed.length,
        returnedOrders: returned.length
      });
    }
  }, [sales]);

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

  const handleViewInvoice = (sale) => {
    setSelectedInvoice(sale);
    setInvoiceModalVisible(true);
  };

  const handleProcessReturn = (sale) => {
    setSelectedReturnSale(sale);
    const initialReturnItems = sale.items?.map(item => ({
      ...item,
      returnQuantity: 0,
      returnReason: '',
      selected: false
    })) || [];
    setReturnItems(initialReturnItems);
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

    Modal.confirm({
      title: 'Confirm Return',
      content: `Total return amount: ₹${selectedItems.reduce((sum, item) => sum + (item.returnQuantity * item.unit_price), 0).toFixed(2)}. This will update stock and sale status.`,
      onOk: async () => {
        try {
          await dispatch(processReturn(returnData));
          setReturnModalVisible(false);
          dispatch(fetchAllSales());
        } catch (error) {
          message.error('Failed to process return');
        }
      }
    });
  };

  const printInvoice = () => {
    const printContent = document.getElementById('invoice-print-area');
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
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
        filtered = filtered.filter(item => item.status === 'completed');
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

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filtered.slice(start, end);

      const formatted = paginatedData.map((sale, index) => {
        const { _id, id, customer_id, total_amount, net_amount, status, invoice_no, createdAt } = sale;
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
          total_amount: `₹${(total_amount || 0).toFixed(2)}`,
          net_amount: `₹${(net_amount || 0).toFixed(2)}`,
          date: new Date(createdAt).toLocaleDateString(),
          status: getStatusTag(),
          action: (
                     <Space size="small">
              <AntButton 
                type="text" 
                icon={<EyeOutlined style={{ color: '#00b4d8' }} />} 
                onClick={() => handleViewInvoice(sale)}
                title="View Invoice"
              />
              {status === 'completed' && (
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
  }, [sales, pagination, searchTerm, sortStatus, customers, activeTab, canDelete]);

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
    const headers = ['Invoice No', 'Customer', 'Date', 'Total (PKR)', 'Net (PKR)', 'Status'];
    const rows = salesHistory.map((sale) => {
      const customer = customers.find((c) => c._id === sale.customer_id);
      const customerName = customer?.name || sale.customer_name || 'Walk-in Customer';
      return [
        sale.invoice_no || `INV-${String(sale._id || '').slice(-6)}`,
        customerName,
        new Date(sale.createdAt || sale.sale_date).toLocaleDateString(),
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
    const headers = ['Invoice No', 'Customer', 'Date', 'Total (PKR)', 'Net (PKR)', 'Status'];
    const rows = salesHistory.map((sale) => {
      const customer = customers.find((c) => c._id === sale.customer_id);
      const customerName = customer?.name || sale.customer_name || 'Walk-in Customer';
      return [
        sale.invoice_no || `INV-${String(sale._id || '').slice(-6)}`,
        customerName,
        new Date(sale.createdAt || sale.sale_date).toLocaleDateString(),
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
      title: 'Customer', 
      dataIndex: 'customer', 
      key: 'customer',
      width: 200,
      ellipsis: true
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date',
      width: 120
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
    <KpiGrid>
      <KpiCard>
        <KpiMain>
          {loading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <>
              <KpiValue>{statistics.totalSales}</KpiValue>
              <KpiLabel>Total sales</KpiLabel>
              <KpiTrendMuted>All invoices</KpiTrendMuted>
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
              <KpiValue style={{ fontSize: 20 }}>{formatPkr(statistics.totalRevenue)}</KpiValue>
              <KpiLabel>Total revenue</KpiLabel>
              <KpiTrendMuted>Net from completed</KpiTrendMuted>
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
  );

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title="Sales Management"
          subTitle={<>{loading ? 'Loading...' : `${salesHistory?.length || 0} Sales Records`}</>}
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
              </div>
            </ProjectSorting>
            
            <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: 16 }}>
              <TabPane tab="Active Sales" key="active" />
              <TabPane tab="Sales History" key="history" />
              <TabPane tab="Returns" key="returns" />
              <TabPane tab="All Sales" key="all" />
            </Tabs>
            
            <CustomTableWrapper>
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
            </CustomTableWrapper>
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
            <AntButton key="print" type="primary" onClick={printInvoice} icon={<PrinterOutlined />}>
              Print Invoice
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
                    <div><strong>Date:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> {selectedInvoice.status}</div>
                  </Col>
                </Row>
                
                <Table
                  dataSource={selectedInvoice.items}
                  pagination={false}
                  size="small"
                  rowKey="product_id"
                  columns={[
                    { title: 'Item', dataIndex: 'product_name', key: 'product_name' },
                    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', align: 'center' },
                    { title: 'Unit Price', dataIndex: 'unit_price', key: 'unit_price', align: 'right', render: (v) => `₹${Number(v).toFixed(2)}` },
                    { title: 'Total', dataIndex: 'line_total', key: 'line_total', align: 'right', render: (v) => `₹${Number(v).toFixed(2)}` },
                  ]}
                />
                
                <Divider />
                
                <Row justify="end">
                  <Col span={8}>
                    <Row><Col span={12}>Subtotal:</Col><Col span={12} style={{ textAlign: 'right' }}>₹{Number(selectedInvoice.total_amount || 0).toFixed(2)}</Col></Row>
                    {selectedInvoice.discount > 0 && (
                      <Row><Col span={12}>Discount:</Col><Col span={12} style={{ textAlign: 'right' }}>₹{Number(selectedInvoice.discount || 0).toFixed(2)}</Col></Row>
                    )}
                    <Row><Col span={12}>Tax:</Col><Col span={12} style={{ textAlign: 'right' }}>₹{Number((selectedInvoice.net_amount - (selectedInvoice.total_amount - (selectedInvoice.discount || 0))) || 0).toFixed(2)}</Col></Row>
                    <Divider style={{ margin: '8px 0' }} />
                    <Row><Col span={12}><strong>Total:</strong></Col><Col span={12} style={{ textAlign: 'right' }}><strong>₹{Number(selectedInvoice.net_amount || 0).toFixed(2)}</strong></Col></Row>
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
                <Descriptions.Item label="Original Amount">₹{Number(selectedReturnSale.net_amount).toFixed(2)}</Descriptions.Item>
              </Descriptions>
              
              <h4>Select Items to Return</h4>
              <Table
                dataSource={returnItems}
                pagination={false}
                size="small"
                rowKey="product_id"
                columns={[
                  {
                    title: 'Select',
                    key: 'select',
                    width: 60,
                    render: (_, record, index) => (
                      <input
                        type="checkbox"
                        checked={record.selected}
                        onChange={(e) => {
                          const newItems = [...returnItems];
                          newItems[index].selected = e.target.checked;
                          if (!e.target.checked) {
                            newItems[index].returnQuantity = 0;
                          } else {
                            newItems[index].returnQuantity = record.quantity;
                          }
                          setReturnItems(newItems);
                        }}
                      />
                    )
                  },
                  { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
                  { title: 'Original Qty', dataIndex: 'quantity', key: 'quantity', align: 'center', width: 100 },
                  {
                    title: 'Return Qty',
                    key: 'returnQuantity',
                    width: 120,
                    render: (_, record, index) => (
                      <InputNumber
                        min={0}
                        max={record.quantity}
                        value={record.returnQuantity}
                        disabled={!record.selected}
                        onChange={(value) => {
                          const newItems = [...returnItems];
                          newItems[index].returnQuantity = value;
                          setReturnItems(newItems);
                        }}
                        style={{ width: '100%' }}
                      />
                    )
                  },
                  { title: 'Unit Price', dataIndex: 'unit_price', key: 'unit_price', align: 'right', render: (v) => `₹${Number(v).toFixed(2)}` },
                  {
                    title: 'Return Amount',
                    key: 'returnAmount',
                    align: 'right',
                    render: (_, record) => `₹${(record.returnQuantity * record.unit_price).toFixed(2)}`
                  }
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
                  Total Return Amount: ₹{returnItems.reduce((sum, item) => 
                    sum + (item.selected ? item.returnQuantity * item.unit_price : 0), 0
                  ).toFixed(2)}
                </Typography.Text>
              </div>
            </div>
          )}
        </Modal>
      </Main>
    </>
  );
}

export default Sales;