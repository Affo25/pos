/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select, Modal, Table, Tag, Tabs,Divider,Statistic,InputNumber,Text, Card, Space, Button as AntButton, Descriptions, Input, Form, DatePicker } from 'antd';
import { Link } from 'react-router-dom';
import { 
  EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined, 
  EyeOutlined, UndoOutlined, FileTextOutlined, PrinterOutlined,
  CheckCircleOutlined, CloseCircleOutlined, DollarOutlined,
  HistoryOutlined, ShoppingCartOutlined, ReloadOutlined
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
import { deleteSale, fetchAllSales, updateSale } from '../../redux/sales/saleSlice';
import { getComponentPermissions } from '../../config/utils/permission';
import { fetchAllCustomers } from '../../redux/customers/customerSlice';

const { TabPane } = Tabs;
const { TextArea } = Input;

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
      totalRevenue,  // Fixed: using shorthand instead of totalRevenue: totalRevenue
      completedOrders: completed.length,
      returnedOrders: returned.length
    });
  }
}, [sales]);

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
    // Initialize return items with all items from the sale
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
  saleId: selectedReturnSale._id,
  items: selectedItems.map(item => ({
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.returnQuantity,
    unit_price: item.unit_price,
    reason: item.returnReason || returnReason
  })),
  totalReturnAmount: selectedItems.reduce((sum, item) => 
    sum + (item.returnQuantity * item.unit_price), 0
  ),
  returnReason,  // Fixed: using shorthand instead of returnReason: returnReason
  returnDate: new Date().toISOString()
};

    Modal.confirm({
      title: 'Confirm Return',
      content: `Total return amount: ₹${returnData.totalReturnAmount.toFixed(2)}. This will update the sale status.`,
      onOk: async () => {
        try {
          // Update sale status to returned or partially returned
          const updatedSale = {
            ...selectedReturnSale,
            status: selectedItems.length === selectedReturnSale.items?.length ? 'returned' : 'partially_returned',
            returned_items: returnData.items,
            return_amount: returnData.totalReturnAmount,
            return_reason: returnReason
          };
          
          await dispatch(updateSale({ id: selectedReturnSale._id, saleData: updatedSale }));
          message.success('Return processed successfully');
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

      // Filter by status based on active tab
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
              return <Tag style={{color:"black"}} color="cyan" icon={<CheckCircleOutlined />}>Completed</Tag>;
            case 'returned':
              return <Tag style={{color:"black"}} color="error" icon={<CloseCircleOutlined />}>Returned</Tag>;
            case 'partially_returned':
              return <Tag style={{color:"black"}} color="warning">Partially Returned</Tag>;
            case 'cancelled':
              return <Tag style={{color:"black"}} color="default">Cancelled</Tag>;
            default:
              return <Tag  style={{color:"black"}}color="processing">Pending</Tag>;
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
                icon={<EyeOutlined />} 
                onClick={() => handleViewInvoice(sale)}
                title="View Invoice"
              />
              {status === 'completed' && (
                <AntButton 
                  type="text" 
                  icon={<UndoOutlined />} 
                  onClick={() => handleProcessReturn(sale)}
                  title="Process Return"
                  style={{ color: '#ff9800' }}
                />
              )}
              <Dropdown
                overlay={
                  <Menu className="custom-dropdown-menu">
                    <Menu.Item disabled={!canEdit} key="edit" onClick={() => handleEdit(sale)}>
                      <div className="custom-action-btn edit-btn">
                        <EditOutlined className="action-icon" />
                        <span className="action-label">Edit</span>
                      </div>
                    </Menu.Item>
                    <Menu.Item disabled={!canDelete} key="delete" onClick={() => handleDelete(_id || id)}>
                      <div className="custom-action-btn delete-btn">
                        <DeleteOutlined className="action-icon" />
                        <span className="action-label">Delete</span>
                      </div>
                    </Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <AntButton type="text" icon={<FeatherIcon icon="more-horizontal" size={18} />} />
              </Dropdown>
            </Space>
          ),
        };
      });
      setDataSource(formatted);
      setSalesHistory(filtered);
    }
  }, [sales, pagination, searchTerm, sortStatus, customers, activeTab]);

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
    { title: '#', key: 'index', render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1, width: 50 },
    { title: 'Invoice No', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Total Amount', dataIndex: 'total_amount', key: 'total_amount', align: 'right' },
    { title: 'Net Amount', dataIndex: 'net_amount', key: 'net_amount', align: 'right' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Action', dataIndex: 'action', key: 'action', width: 120 },
  ];

  // Statistics Cards
  const StatisticsCards = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Total Sales"
            value={statistics.totalSales}
            prefix={<ShoppingCartOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Total Revenue"
            value={statistics.totalRevenue}
            prefix={<DollarOutlined />}
            precision={2}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Completed Orders"
            value={statistics.completedOrders}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Returns"
            value={statistics.returnedOrders}
            prefix={<UndoOutlined />}
            valueStyle={{ color: '#ff9800' }}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title="Sales Management"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Sales Records`}</>}
          buttons={[
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
            
            <div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                total={salesHistory?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
              />
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
                <Text strong>
                  Total Return Amount: ₹{returnItems.reduce((sum, item) => 
                    sum + (item.selected ? item.returnQuantity * item.unit_price : 0), 0
                  ).toFixed(2)}
                </Text>
              </div>
            </div>
          )}
        </Modal>
      </Main>
    </>
  );
}

export default Sales;