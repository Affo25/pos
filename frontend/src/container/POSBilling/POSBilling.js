/* eslint-disable camelcase */
import React, { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { 
  Button, Card, Col, Divider, InputNumber, Row, Select, Space, 
  Table, Typography, Input, Modal,
  Empty, Spin, DatePicker, Form,
    message,
} from 'antd';
import { 
   PlusOutlined, PrinterOutlined, 
   ProductOutlined,
  DeleteOutlined, ReloadOutlined,
  TagOutlined, 
   FileTextOutlined,
   SaveOutlined,
   CreditCardOutlined,
   DollarCircleOutlined,
   BankOutlined,
   WalletOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../../config/default/styled';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const API_PRODUCTS = 'http://localhost:5000/api/products';
const API_CUSTOMERS = 'http://localhost:5000/api/customers';
const API_BILLING = 'http://localhost:5000/api/sales/billing';

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
  const [discountType, setDiscountType] = useState('percentage'); // percentage or fixed
  const [paymentMode, setPaymentMode] = useState('cash');
  const [issuedDate, setIssuedDate] = useState(null);

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
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSearch = (value) => {
    if (!value.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => 
      product.name?.toLowerCase().includes(value.toLowerCase()) ||
      product.batch_number?.toLowerCase().includes(value.toLowerCase()) ||
      product.supplier_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const getEntityId = (entity) => entity?.id || entity?.id || null;

  const updateRow = (key, patch) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.key !== key) return r;
        const next = { ...r, ...patch };
        if (patch.product_id) {
          const product = products.find((p) => getEntityId(p) === patch.product_id);
          if (product) {
            next.unit_price = Number(product.unit_price || 0);
            next.product_details = product;
          }
        }
        return next;
      })
    );
  };

  const addProductToCart = (product, quantity = 1) => {
    if (new Date(product.expiry_date) < new Date()) {
      toast.error(`${product.name} is expired`);
      return;
    }
    
    if (product.available_quantity < quantity) {
      toast.error(`Insufficient stock. Available: ${product.available_quantity}`);
      return;
    }
    
    const productId = getEntityId(product);
    if (!productId) {
      toast.error('Invalid product selected');
      return;
    }

    const existingRow = rows.find(row => row.product_id === productId);
    
    if (existingRow) {
      const newQuantity = (existingRow.quantity || 0) + quantity;
      if (newQuantity > product.available_quantity) {
        toast.error(`Only ${product.available_quantity - existingRow.quantity} more available`);
        return;
      }
      updateRow(existingRow.key, { quantity: newQuantity });
    } else {
      setRows((prev) => [...prev, { 
        key: Date.now(), 
        product_id: productId, 
        quantity, 
        unit_price: Number(product.unit_price || 0),
        product_details: product
      }]);
    }
    message.success(`${product.name} added to cart`);
  };

  const removeRow = (key) => setRows((prev) => prev.filter((r) => r.key !== key));

  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, r) => {
      return sum + (Number(r.quantity || 0) * Number(r.unit_price || 0));
    }, 0);
    
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }
    
    const tax = (subtotal - discountAmount) * 0.05;
    const net = subtotal - discountAmount + tax;
    
    return { subtotal, discountAmount, tax, net };
  }, [rows, discount, discountType]);

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId);
    const customer = customers.find(c => getEntityId(c) === customerId);
    setCustomerDetails(customer);
  };

  const createBilling = async () => {
    if (!rows.length) {
      toast.error('Please add at least one item');
      return;
    }

    const invalidRow = rows.find((r) => !r.product_id || Number(r.quantity || 0) <= 0);
    if (invalidRow) {
      toast.error('Please ensure all selected products have valid quantity');
      return;
    }
    
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
      items: rows.map((r) => ({
        product_id: r.product_id,
        quantity: Number(r.quantity || 0),
        unit_price: Number(r.unit_price || 0),
      })),
    };

    setSaving(true);
    try {
      const response = await fetch(API_BILLING, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create invoice');
      setInvoice(data);
      toast.success('Invoice created successfully');
      setRows([]);
      setSelectedCustomer(null);
      setCustomerDetails(null);
      setDiscount(0);
      setPaymentMode('cash');
      setProjectDetail('');
      setIssuedDate(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const printInvoice = () => window.print();

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (_, product) => (
        <div>
          <Text strong>{product.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {product.batch_number || 'No batch'} | {product.supplier_name || 'No supplier'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 110,
      render: (value) => `₹${Number(value || 0).toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'available_quantity',
      key: 'available_quantity',
      width: 90,
      render: (qty, product) => {
        const isLowStock = qty <= (product.minimum_stock_alert || 5);
        return <Text style={{ color: isLowStock ? '#d4380d' : '#389e0d' }}>{qty}</Text>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, product) => (
        <Button
          type="primary"
          size="small"
          className="add-cart-btn"
          icon={<PlusOutlined />}
          onClick={() => addProductToCart(product, 1)}
          disabled={new Date(product.expiry_date) < new Date() || product.available_quantity === 0}
        >
          Add
        </Button>
      ),
    },
  ];

  const selectedItemsColumns = [
    {
      title: 'Item',
      dataIndex: 'product_id',
      key: 'item',
      render: (value, row) => {
        const product = row.product_details || products.find((p) => getEntityId(p) === value);
        return <Text>{product?.name || 'Product'}</Text>;
      },
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 82,
      render: (value, row) => (
        <InputNumber min={1} value={value} onChange={(val) => updateRow(row.key, { quantity: val })} style={{ width: '100%' }} />
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      width: 105,
      render: (_, row) => `₹${(Number(row.quantity || 0) * Number(row.unit_price || 0)).toFixed(2)}`,
    },
    {
      title: '',
      key: 'action',
      width: 44,
      render: (_, row) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeRow(row.key)} />,
    },
  ];

  return (
    <>
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .invoice-preview { padding: 20px; }
          }
          .print-only { display: none; }
          .invoice-layout {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 24px;
          }
          .themed-billing-screen {
            background: linear-gradient(180deg, #f7f9fc 0%, #f4f7fb 100%);
          }
          .billing-footer {
            margin-bottom: 0;
            padding: 10px 0 14px;
            min-height: 64px;
            display: flex;
            align-items: center;
          }
          .billing-footer .ant-space {
            width: 100%;
            justify-content: flex-end;
            gap: 10px;
          }
          .right-panel-card {
            border: 1px solid #e9edf4;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
          }
          .summary-wrap {
            background: #f8fafc;
            border: 1px solid #e6edf7;
            border-radius: 10px;
            padding: 12px;
          }
          .payment-mode-option {
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .product-list-card {
            border: 1px solid #e9edf4;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
          }
          .product-list-card .ant-card-head {
            background: #f8fbff;
            border-bottom: 1px solid #e6edf7;
          }
          .product-list-card .ant-card-body {
            padding: 0 !important;
            min-height: 620px;
            display: flex;
            flex-direction: column;
          }
          .product-table-wrap {
            padding: 12px;
            flex: 1;
          }
          .invoice-detail-card {
            border: 1px solid #e6edf7;
            border-radius: 10px;
            background: #fbfdff;
            margin-bottom: 12px;
          }
          .invoice-detail-card .ant-card-head {
            background: #f8fbff;
          }
          .add-cart-btn {
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
          }
          .widget-table .ant-table-thead > tr > th {
            background: #f8fbff !important;
            color: #475467;
            font-weight: 600;
          }
        `}
      </style>
      
      <div className="no-print">
        <PageHeader 
          ghost 
          title="Create Invoice" 
          subTitle="Generate professional invoices for your customers"
          buttons={[
            <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchInitialData}>
              Refresh
            </Button>
          ]}
        />
      </div>
      
      <Main style={{ paddingBottom: 0 }} className="themed-billing-screen">
        <Row gutter={24}>
          {/* Left Column - Products */}
          <Col xs={24} lg={14}>
            {/* Products Section */}
            <Card
              className="product-list-card"
              title={
                <Space>
                  <ProductOutlined />
                  <span>Products List</span>
                </Space>
              }
              extra={
                <Search
                  placeholder="Search products..."
                  allowClear
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: 250 }}
                  size="small"
                />
              }
              style={{ marginBottom: 20 }}
            >
              <div className="product-table-wrap">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <Empty description="No products found" />
                ) : (
                  <Table
                    className="widget-table"
                    columns={productColumns}
                    dataSource={filteredProducts}
                    rowKey={(record) => getEntityId(record)}
                    size="small"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    scroll={{ y: 490 }}
                  />
                )}
              </div>
            </Card>
          </Col>

          {/* Right Column - Invoice Information */}
          <Col xs={24} lg={10}>
            <Card title="Invoice Information & Payment" className="right-panel-card">
              <Form layout="vertical">
                <Card size="small" title="Invoice Details" className="invoice-detail-card">
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item label="Invoice Number" style={{ marginBottom: 10 }}>
                        <Input value={invoiceNumber} disabled prefix={<FileTextOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="P.O/S.O Number" style={{ marginBottom: 10 }}>
                        <Input value={poNumber} disabled prefix={<TagOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Project Detail" style={{ marginBottom: 0 }}>
                    <Input.TextArea
                      placeholder="Summary (e.g. project name, description of invoice)"
                      rows={2}
                      value={projectDetail}
                      onChange={(e) => setProjectDetail(e.target.value)}
                    />
                  </Form.Item>
                </Card>

                <Card size="small" title="Selected Products" className="invoice-detail-card">
                  <Table
                    className="widget-table"
                    columns={selectedItemsColumns}
                    dataSource={rows}
                    pagination={false}
                    rowKey="key"
                    size="small"
                    locale={{ emptyText: 'Add products from left list' }}
                  />
                </Card>

                <Form.Item label="Send To">
                  <Select
                    placeholder="Select one"
                    style={{ width: '100%' }}
                    value={selectedCustomer}
                    onChange={handleCustomerSelect}
                    showSearch
                  >
                    {customers.map((c) => (
                      <Select.Option key={getEntityId(c)} value={getEntityId(c)}>
                        {c.name} {c.phone && `(${c.phone})`}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {customerDetails && (
                  <Card size="small" style={{ marginBottom: 16, background: '#f0f5ff' }}>
                    <Text strong>{customerDetails.name}</Text><br />
                    <Text type="secondary">{customerDetails.email}</Text><br />
                    <Text type="secondary">{customerDetails.phone}</Text>
                    {customerDetails.address && (
                      <Text type="secondary">{customerDetails.address}</Text>
                    )}
                  </Card>
                )}

                <Card size="small" title="Payment & Schedule" className="invoice-detail-card">
                  <Form.Item label="Payment Mode">
                    <Select value={paymentMode} onChange={setPaymentMode}>
                      <Select.Option value="cash">
                        <span className="payment-mode-option"><DollarCircleOutlined />Cash</span>
                      </Select.Option>
                      <Select.Option value="card">
                        <span className="payment-mode-option"><CreditCardOutlined />Card</span>
                      </Select.Option>
                      <Select.Option value="bank_transfer">
                        <span className="payment-mode-option"><BankOutlined />Bank Transfer</span>
                      </Select.Option>
                      <Select.Option value="wallet">
                        <span className="payment-mode-option"><WalletOutlined />Wallet / UPI</span>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item label="Issued Date" style={{ marginBottom: 0 }}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" value={issuedDate} onChange={setIssuedDate} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Due Date" style={{ marginBottom: 0 }}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                <Divider />

                <div className="summary-wrap" style={{ textAlign: 'right' }}>
                  <Row>
                    <Col span={12}><Text>Subtotal</Text></Col>
                    <Col span={12}><Text strong>₹{totals.subtotal.toFixed(2)}</Text></Col>
                  </Row>
                  
                  <Row style={{ marginTop: 8 }}>
                    <Col span={8}>
                      <Text>Discount</Text>
                    </Col>
                    <Col span={4}>
                      <Select 
                        value={discountType} 
                        onChange={setDiscountType}
                        size="small"
                        style={{ width: '100%' }}
                      >
                        <Select.Option value="percentage">%</Select.Option>
                        <Select.Option value="fixed">₹</Select.Option>
                      </Select>
                    </Col>
                    <Col span={12}>
                      <InputNumber
                        value={discount}
                        onChange={setDiscount}
                        min={0}
                        max={discountType === 'percentage' ? 100 : totals.subtotal}
                        style={{ width: '100%', textAlign: 'right' }}
                        placeholder="0"
                      />
                    </Col>
                  </Row>
                  
                  <Row style={{ marginTop: 8 }}>
                    <Col span={12}><Text>Tax (5%)</Text></Col>
                    <Col span={12}><Text>₹{totals.tax.toFixed(2)}</Text></Col>
                  </Row>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <Row>
                    <Col span={12}><Text strong style={{ fontSize: 16 }}>Total</Text></Col>
                    <Col span={12}>
                      <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                        ₹{totals.net.toFixed(2)}
                      </Text>
                    </Col>
                  </Row>
                </div>

                <Divider style={{ margin: '12px 0 8px' }} />

                <div className="billing-footer">
                  <Space>
                    <Button
                      size="large"
                      onClick={printInvoice}
                      disabled={!invoice}
                      icon={<PrinterOutlined />}
                    >
                      Print
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      loading={saving}
                      onClick={createBilling}
                      icon={<SaveOutlined />}
                      disabled={!rows.length}
                    >
                      Create Invoice
                    </Button>
                  </Space>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Invoice Preview Modal */}
        <Modal
          title={`Invoice ${invoice?.invoice_no || ''}`}
          open={invoice}
          onCancel={() => setInvoice(null)}
          width={800}
          footer={[
            <Button key="print" type="primary" onClick={printInvoice} icon={<PrinterOutlined />}>
              Print Invoice
            </Button>,
            <Button key="close" onClick={() => setInvoice(null)}>
              Close
            </Button>
          ]}
        >
          {invoice && (
            <div className="invoice-preview" id="invoice-preview">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3}>INVOICE</Title>
                <Text type="secondary">#{invoice.invoice_no}</Text>
              </div>
              
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Text strong>Bill To:</Text>
                  <div>{invoice.customer_name || 'Walk-in Customer'}</div>
                  {invoice.customer_phone && <div>{invoice.customer_phone}</div>}
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <div><Text strong>Date:</Text> {new Date(invoice.sale_date).toLocaleDateString()}</div>
                  <div><Text strong>Invoice #:</Text> {invoice.invoice_no}</div>
                </Col>
              </Row>
              
              <Table
                dataSource={invoice.items}
                pagination={false}
                size="small"
                rowKey="product_id"
                columns={[
                  { title: 'Item', dataIndex: 'product_name', key: 'product_name' },
                  { title: 'QTY', dataIndex: 'quantity', key: 'quantity', align: 'center' },
                  { title: 'Price', dataIndex: 'unit_price', key: 'unit_price', align: 'right', render: (v) => `₹${Number(v).toFixed(2)}` },
                  { title: 'Total', dataIndex: 'line_total', key: 'line_total', align: 'right', render: (v) => `₹${Number(v).toFixed(2)}` },
                ]}
              />
              
              <Divider />
              
              <Row justify="end">
                <Col span={8}>
                  <Row><Col span={12}>Subtotal:</Col><Col span={12} style={{ textAlign: 'right' }}>₹{Number(invoice.subtotal || 0).toFixed(2)}</Col></Row>
                  <Row><Col span={12}>Tax:</Col><Col span={12} style={{ textAlign: 'right' }}>₹{Number(invoice.tax_amount || 0).toFixed(2)}</Col></Row>
                  <Divider style={{ margin: '8px 0' }} />
                  <Row><Col span={12}><Text strong>Total:</Text></Col><Col span={12} style={{ textAlign: 'right' }}><Text strong>₹{Number(invoice.net_amount || 0).toFixed(2)}</Text></Col></Row>
                </Col>
              </Row>
              
              <Divider />
              
              <Paragraph style={{ textAlign: 'center' }}>
                <Text type="secondary">Thank you for your business!</Text>
              </Paragraph>
            </div>
          )}
        </Modal>

      </Main>
    </>
  );
}

export default POSBilling;