/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
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
import ModernModalStyles from '../shared/modalStyles';
import { fetchAllSuppliers } from '../../redux/suppliers/supplierSlice';
import { fetchAllProducts } from '../../redux/products/productSlice';
import { netOrderTotal, orderItemsTotal, returnsTotal, formatPkr } from '../../utils/purchaseOrderCalc';
import PurchaseOrderReturnModal from './PurchaseOrderReturnModal';
import { fetchNextOrderNumber } from '../../redux/purchaseorders/purchaseorderService';

const { Option } = Select;

function CreatePurchaseOrder({ visible, onCancel, purchaseorder, onSuccess }) {
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const dispatch = useDispatch();

  const { suppliers } = useSelector((state) => state.suppliers);
  const { products } = useSelector((state) => state.products);
  const [items, setItems] = useState([]);
  const [returns, setReturns] = useState([]);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [orderNumberLoading, setOrderNumberLoading] = useState(false);

  const resetForm = () => {
    form.resetFields();
    itemForm.resetFields();
    setItems([]);
    setReturns([]);
  };

  const watchedStatus = Form.useWatch('status', form);
  const watchedPaid = Form.useWatch('amount_paid', form);

  const draftPo = useMemo(
    () => ({
      items,
      returns,
      status: watchedStatus || 'pending',
    }),
    [items, returns, watchedStatus],
  );

  const orderTotal = useMemo(() => orderItemsTotal(items), [items]);
  const returnedTotal = useMemo(() => returnsTotal(returns), [returns]);
  const netTotal = useMemo(() => netOrderTotal(draftPo), [draftPo]);

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
        amount_paid: purchaseorder.amount_paid ?? 0,
      });
      setItems(purchaseorder.items || []);
      setReturns(purchaseorder.returns || []);
      return;
    }

    const today = moment();
    form.setFieldsValue({
      order_date: today,
      status: 'pending',
      amount_paid: 0,
    });

    let cancelled = false;
    setOrderNumberLoading(true);
    fetchNextOrderNumber(today.format('YYYY-MM-DD'))
      .then((order_number) => {
        if (!cancelled) {
          form.setFieldsValue({ order_number });
        }
      })
      .catch(() => {
        if (!cancelled) {
          message.warning('Could not load order number. Save will auto-generate one.');
        }
      })
      .finally(() => {
        if (!cancelled) setOrderNumberLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [purchaseorder, visible, form]);

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
        amount_paid: Number(values.amount_paid || 0),
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
      width: '28%',
      ellipsis: true,
      align: 'left',
      render: (text, record) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{record.name || record.product_id?.name || '—'}</span>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '18%',
      align: 'center',
      render: (q) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(q || 0)}</span>,
    },
    {
      title: 'Price (PKR)',
      dataIndex: 'price',
      key: 'price',
      width: '18%',
      align: 'right',
      render: (p) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(p || 0).toFixed(2)}</span>,
    },
    {
      title: 'Line total',
      key: 'total',
      width: '18%',
      align: 'right',
      render: (_, record) => (
        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {(Number(record.quantity || 0) * Number(record.price || 0)).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '18%',
      align: 'center',
      render: (_, __, index) => (
        <Button onClick={() => handleRemoveItem(index)} type="danger" shape="circle">
          <DeleteOutlined />
        </Button>
      ),
    },
  ];

  return (
    <>
    <ModernModalStyles />
    <Modal
      title={purchaseorder ? 'Edit Purchase Order' : 'Create Purchase Order'}
      visible={visible}
      onCancel={onCancel}
      className="modern-modal"
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
                extra={!purchaseorder ? 'Auto-generated (yyMMdd-001). You can edit before save.' : undefined}
              >
                <Input
                  placeholder="yyMMdd-001"
                  readOnly={!purchaseorder}
                  disabled={!purchaseorder && orderNumberLoading}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="order_date"
                label="Order Date"
                rules={[{ required: true, message: 'Order date is required' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={(date) => {
                    if (purchaseorder || !date) return;
                    setOrderNumberLoading(true);
                    fetchNextOrderNumber(date.format('YYYY-MM-DD'))
                      .then((order_number) => form.setFieldsValue({ order_number }))
                      .catch(() => {})
                      .finally(() => setOrderNumberLoading(false));
                  }}
                />
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
            <Col span={8}>
              <Form.Item
                name="amount_paid"
                label="Amount paid (PKR)"
                tooltip="Payment made to supplier for this order"
                initialValue={0}
              >
                <InputNumber min={0} max={netTotal} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <div
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              fontSize: 13,
            }}
          >
            <span>
              Order total: <strong>{formatPkr(orderTotal)}</strong>
            </span>
            <span>
              Returned: <strong>{formatPkr(returnedTotal)}</strong>
            </span>
            <span>
              Net: <strong>{formatPkr(netTotal)}</strong>
            </span>
            <span>
              Remaining:{' '}
              <strong style={{ color: '#b45309' }}>
                {formatPkr(Math.max(0, netTotal - Number(watchedPaid || 0)))}
              </strong>
            </span>
          </div>
        </Form>

        {purchaseorder && returns.length > 0 && (
          <>
            <div className="section-heading" style={{ marginTop: 8 }}>
              Returns on this order
            </div>
            <Table
              size="small"
              pagination={false}
              dataSource={returns.map((r, i) => ({
                key: r._id || i,
                product: r.product_id?.name || 'Product',
                qty: r.quantity,
                price: r.price,
                reason: r.reason || '—',
              }))}
              columns={[
                { title: 'Product', dataIndex: 'product', key: 'product' },
                { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 64 },
                { title: 'Price', dataIndex: 'price', key: 'price', width: 90 },
                { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
              ]}
              style={{ marginBottom: 12 }}
            />
            <Button type="white" size="small" onClick={() => setReturnModalOpen(true)}>
              Record another return
            </Button>
          </>
        )}

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
          tableLayout="fixed"
          style={{ marginTop: 20 }}
        />
        </BasicFormWrapper>
      </ProcurementFormStyles>
    </Modal>
    {purchaseorder && (
      <PurchaseOrderReturnModal
        visible={returnModalOpen}
        onCancel={() => setReturnModalOpen(false)}
        purchaseorder={{ ...purchaseorder, items, returns }}
        onSuccess={async (updatedPo) => {
          await dispatch(fetchAllPurchaseOrders());
          if (updatedPo?.returns) setReturns(updatedPo.returns);
          setReturnModalOpen(false);
        }}
      />
    )}
    </>
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
