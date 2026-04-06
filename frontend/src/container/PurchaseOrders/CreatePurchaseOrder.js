/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  message,
  Select,
  DatePicker,
  Table,
  InputNumber,
  Space,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import {
  createPurchaseOrder,
  updatePurchaseOrder,
  fetchAllPurchaseOrders,
} from '../../redux/purchaseorders/purchaseorderSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { ProcurementFormStyles } from '../shared/procurementScreenStyles';
import { fetchAllSuppliers } from '../../redux/suppliers/supplierSlice';
import { fetchAllProducts } from '../../redux/products/productSlice';

const { Option } = Select;

function CreatePurchaseOrder({ visible, onCancel, purchaseorder, onSuccess }) {
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const dispatch = useDispatch();

  const { suppliers } = useSelector((state) => state.suppliers);
  const { products } = useSelector((state) => state.products);
  const [items, setItems] = useState([]);

  const resetForm = () => {
    form.resetFields();
    itemForm.resetFields();
    setItems([]);
  };

  useEffect(() => {
    dispatch(fetchAllSuppliers());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (!visible) return;
    resetForm();

    if (purchaseorder) {
      form.setFieldsValue({
        supplier_id: purchaseorder.supplier_id?._id || purchaseorder.supplier_id,
        order_number: purchaseorder.order_number,
        order_date: purchaseorder.order_date
          ? moment(purchaseorder.order_date)
          : null,
        status: purchaseorder.status,
      });
      setItems(purchaseorder.items || []);
    }
  }, [purchaseorder, visible]);

  const handleAddItem = async () => {
    try {
      const values = await itemForm.validateFields();
      const product = products.find((p) => p._id === values.product_id);
      
      const newItem = {
        product_id: values.product_id,
        name: product?.name,
        quantity: values.quantity,
        price: values.price,
      };

      setItems([...items, newItem]);
      itemForm.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (items.length === 0) {
        message.error('Please add at least one item');
        return;
      }

      const payload = {
        supplier_id: values.supplier_id,
        order_number: values.order_number,
        order_date: values.order_date
          ? values.order_date.format('YYYY-MM-DD')
          : null,
        status: values.status,
        items: items.map(item => ({
          product_id: typeof item.product_id === 'object' ? item.product_id._id : item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
      };

      if (purchaseorder) {
        await dispatch(updatePurchaseOrder(purchaseorder.id || purchaseorder._id, payload));
      } else {
        await dispatch(createPurchaseOrder(payload));
      }

      await dispatch(fetchAllPurchaseOrders());
      if (onSuccess) onSuccess();
      resetForm();
      onCancel();
    } catch (error) {
      message.error(
        error?.response?.data?.error ||
        error.message ||
        'Operation failed'
      );
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => record.name || record.product_id?.name,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => (record.quantity * record.price).toFixed(2),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, __, index) => (
        <Button onClick={() => handleRemoveItem(index)} type="danger" shape="circle">
          <DeleteOutlined />
        </Button>
      ),
    },
  ];

  return (
    <Modal
      type="primary"
      title={purchaseorder ? 'Edit Purchase Order' : 'Create Purchase Order'}
      visible={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleOk}>
          {purchaseorder ? 'Update' : 'Save'}
        </Button>,
      ]}
    >
      <ProcurementFormStyles>
        <BasicFormWrapper>
          <Form form={form} layout="vertical" size="large">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="supplier_id"
                label="Supplier"
                rules={[{ required: true, message: 'Supplier is required' }]}
              >
                <Select placeholder="Select Supplier">
                  {suppliers.map((sup) => (
                    <Option key={sup._id} value={sup._id}>
                      {sup.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="order_number"
                label="Order Number"
                rules={[{ required: true, message: 'Order number is required' }]}
              >
                <Input placeholder="Enter Order Number" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="order_date"
                label="Order Date"
                rules={[{ required: true, message: 'Order date is required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Status" initialValue="pending">
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="received">Received</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
        <div className="section-heading">Line items</div>

        <Form form={itemForm} layout="vertical" size="large">
          <Row gutter={16} align="bottom">
            <Col span={8}>
              <Form.Item
                name="product_id"
                label="Product"
                rules={[{ required: true, message: 'Product is required' }]}
              >
                <Select 
                  placeholder="Select Product" 
                  showSearch
                  optionFilterProp="children"
                  onChange={(val) => {
                    const product = products.find(p => p._id === val);
                    if (product) {
                      itemForm.setFieldsValue({ price: product.unit_price });
                    }
                  }}
                >
                  {products.map((prod) => (
                    <Option key={prod._id} value={prod._id}>
                      {prod.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Qty required' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Qty" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: 'Price required' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Price" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item>
                <Button type="primary" onClick={handleAddItem} block>
                  <PlusOutlined /> Add
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Table 
          dataSource={items} 
          columns={columns} 
          pagination={false} 
          rowKey={(record, index) => index}
          size="middle"
          style={{ marginTop: 20 }}
        />
        </BasicFormWrapper>
      </ProcurementFormStyles>
    </Modal>
  );
}

CreatePurchaseOrder.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  onSuccess: propTypes.func,
  purchaseorder: propTypes.object,
};

CreatePurchaseOrder.defaultProps = {
  purchaseorder: null,
  onSuccess: () => {},
};

export default CreatePurchaseOrder;
