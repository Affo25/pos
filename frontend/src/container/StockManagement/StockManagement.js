/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { 
  Card, Col, Row, Table, Tag, Typography, Button, Space, 
  Modal, Form, Input, Select, InputNumber, DatePicker, 
  message, Popconfirm, Tooltip, Badge, Switch, Divider
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, ReloadOutlined, BarcodeOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../../config/default/styled';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const API_PRODUCTS = 'http://localhost:5000/api/products';
// const API_STOCK = 'http://localhost:5000/api/products/stock-report';

function StockManagement() {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
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

  useEffect(() => {
    fetchReport();
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
      category: product.category,
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

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        expiry_date: values.expiry_date ? values.expiry_date.format('YYYY-MM-DD') : null,
        unit_price: Number(values.unit_price),
        available_quantity: Number(values.available_quantity),
        minimum_stock_alert: Number(values.minimum_stock_alert),
        discount: Number(values.discount || 0),
        gst: Number(values.gst || 0)
      };

      let response;
      if (editingProduct) {
        response = await fetch(`${API_PRODUCTS}/${editingProduct.id}`, {
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

      if (!response.ok) throw new Error('Operation failed');
      message.success(editingProduct ? 'Product updated successfully' : 'Product added successfully');
      setModalVisible(false);
      fetchReport();
    } catch (error) {
      message.error('Failed to save product');
    }
  };

  const generateBarcode = () => {
    const barcode = `BAR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    form.setFieldsValue({ barcode });
    message.success('Barcode generated');
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    product.batch_number?.toLowerCase().includes(searchText.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchText.toLowerCase()) ||
    product.supplier_name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'S.No', key: 'sno', render: (_, __, index) => index + 1, width: 60 },
    { title: 'Product Name', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Batch No', dataIndex: 'batch_number', key: 'batch_number', width: 120 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 120 },
    {
      title: 'Stock',
      dataIndex: 'available_quantity',
      key: 'available_quantity',
      width: 100,
      render: (value, record) => {
        const isLowStock = value <= (record.minimum_stock_alert || 5);
        return (
          <Badge 
            status={isLowStock ? 'error' : 'success'} 
            text={
              <span style={{ color: isLowStock ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
                {value} units
              </span>
            }
          />
        );
      },
    },
    { title: 'Min Alert', dataIndex: 'minimum_stock_alert', key: 'minimum_stock_alert', width: 80 },
    { title: 'Selling Price', dataIndex: 'unit_price', key: 'unit_price', width: 120, render: (v) => `₹${Number(v).toFixed(2)}` },
    { title: 'Purchase Price', dataIndex: 'purchase_price', key: 'purchase_price', width: 120, render: (v) => v ? `₹${Number(v).toFixed(2)}` : '-' },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 120,
      render: (value) => {
        const expired = value && new Date(value) < new Date();
        const expiringSoon = value && new Date(value) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        let color = 'blue';
        let text = value ? new Date(value).toLocaleDateString() : '-';
        
        if (expired) {
          color = 'error';
          text = <span style={{ color: '#ff4d4f' }}>{text} (Expired)</span>;
        } else if (expiringSoon) {
          color = 'warning';
          text = <span style={{ color: '#faad14' }}>{text} (Expiring Soon)</span>;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value) => (
        <Tag color={value === 'active' ? 'success' : 'default'}>
          {value === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Product"
              description="Are you sure you want to delete this product?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader 
        ghost 
        title="Medicine / Inventory Management" 
        subTitle="Manage medicines, stock levels, batch numbers and expiry dates"
        buttons={[
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Medicine
          </Button>,
          <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchReport}>
            Refresh
          </Button>
        ]}
      />
      <Main>
        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Text type="secondary">Total Medicines</Text>
              <h2 style={{ margin: '8px 0 0 0', color: '#1890ff' }}>{summary?.total_products || 0}</h2>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Text type="secondary">Low Stock Items</Text>
              <h2 style={{ margin: '8px 0 0 0', color: summary?.low_stock_count > 0 ? '#ff4d4f' : '#52c41a' }}>
                {summary?.low_stock_count || 0}
                {summary?.low_stock_count > 0 && <WarningOutlined style={{ marginLeft: 8, color: '#ff4d4f' }} />}
              </h2>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Text type="secondary">Total Stock Value</Text>
              <h2 style={{ margin: '8px 0 0 0', color: '#3f8600' }}>
                ₹{Number(summary?.total_stock_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Text type="secondary">Active Medicines</Text>
              <h2 style={{ margin: '8px 0 0 0', color: '#52c41a' }}>
                {products.filter(p => p.status === 'active').length}
              </h2>
            </Card>
          </Col>
        </Row>

        {/* Search Bar */}
        <Card style={{ marginBottom: 16 }}>
          <Space style={{ width: '100%' }} direction="vertical">
            <Input
              placeholder="Search by medicine name, batch number, category or supplier..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </Space>
        </Card>

        {/* Medicine List Table */}
        <Card title="Medicine List">
          <Table
            loading={loading}
            rowKey="_id"
            columns={columns}
            dataSource={filteredProducts}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} medicines`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

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
                  <Select placeholder="Select category">
                    <Option value="tablet">Tablet</Option>
                    <Option value="syrup">Syrup</Option>
                    <Option value="injection">Injection</Option>
                    <Option value="ointment">Ointment</Option>
                    <Option value="capsule">Capsule</Option>
                    <Option value="other">Other</Option>
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
                    prefix="₹"
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
                    prefix="₹"
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
                    <Button onClick={generateBarcode} icon={<BarcodeOutlined />}>Generate</Button>
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
                <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  {editingProduct ? 'Update' : 'Add'} Medicine
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Main>
    </>
  );
}

export default StockManagement;