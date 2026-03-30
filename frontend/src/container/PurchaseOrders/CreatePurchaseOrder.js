/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  message,
  Select,
  DatePicker,
} from 'antd';
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
import { fetchAllSuppliers } from '../../redux/suppliers/supplierSlice';

const { Option } = Select;

function CreatePurchaseOrder({ visible, onCancel, purchaseorder }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { suppliers } = useSelector((state) => state.suppliers);

  const resetForm = () => form.resetFields();

  useEffect(() => {
    dispatch(fetchAllSuppliers());
  }, []);

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
    }
  }, [purchaseorder, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        supplier_id: values.supplier_id,
        order_number: values.order_number,
        order_date: values.order_date
          ? values.order_date.format('YYYY-MM-DD')
          : null,
        status: values.status,
      };

      if (purchaseorder) {
        await dispatch(updatePurchaseOrder(purchaseorder._id, payload));
      } else {
        await dispatch(createPurchaseOrder(payload));
      }

      await dispatch(fetchAllPurchaseOrders());
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

  return (
    <Modal
      type="primary"
      title={purchaseorder ? 'Edit Purchase Order' : 'Create Purchase Order'}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="save" type="primary" onClick={handleOk}>
          {purchaseorder ? 'Update' : 'Save'}
        </Button>,
      ]}
    >
      <BasicFormWrapper>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
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

            <Col span={12}>
              <Form.Item
                name="order_number"
                label="Order Number"
                rules={[{ required: true, message: 'Order number is required' }]}
              >
                <Input placeholder="Enter Order Number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="order_date"
                label="Order Date"
                rules={[{ required: true, message: 'Order date is required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
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
      </BasicFormWrapper>
    </Modal>
  );
}

CreatePurchaseOrder.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  purchaseorder: propTypes.object,
};

CreatePurchaseOrder.defaultProps = {
  purchaseorder: null,
};

export default CreatePurchaseOrder;
