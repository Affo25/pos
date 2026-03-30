/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Form, Input, Row, Col, DatePicker, Select, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createSale, updateSale } from '../../redux/sales/saleSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { fetchAllCustomers } from '../../redux/customers/customerSlice';

const { Option } = Select;
function CreateSale({ visible, onCancel, sale, onSuccess }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { customers } = useSelector((state) => state.customers);

  useEffect(() => {
    dispatch(fetchAllCustomers());
  }, []);

  useEffect(() => {
    if (visible) {
      form.resetFields();

      if (sale) {
        form.setFieldsValue({
          customer_id: sale.customer_id,
          total_amount: sale.total_amount,
          discount_amount: sale.discount_amount,
          tax_amount: sale.tax_amount,
          sale_date: sale.sale_date ? dayjs(sale.sale_date) : null,
        });
      }
    }
  }, [sale, visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const total = Number(values.total_amount);
      const discount = Number(values.discount_amount || 0);
      const tax = Number(values.tax_amount || 0);

      const saleData = {
        customer_id: values.customer_id,
        total_amount: total,
        discount_amount: discount,
        tax_amount: tax,
        net_amount: total - discount + tax,
        status: 'completed',
        sale_date: values.sale_date.toDate(),
      };

      if (sale) {
        dispatch(updateSale({ id: sale._id, data: saleData }));
      } else {
        dispatch(createSale(saleData));
      }

      message.success(sale ? 'Sale updated successfully' : 'Sale created successfully');
      onSuccess();
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error('Please check the form fields');
    }
  };

  return (
    <Modal
      type="primary"
      title={sale ? 'Edit Sale' : 'Create Sale'}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="submit" type="primary" onClick={handleOk}>
          {sale ? 'Update' : 'Save'}
        </Button>,
      ]}
    >
      <BasicFormWrapper>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer_id"
                label="Customer"
                rules={[{ required: true, message: 'Customer is required' }]}
              >
                <Select placeholder="Select Category">
                  {customers.map(cat => (
                    <Option key={cat._id} value={cat._id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="sale_date"
                label="Sale Date"
                rules={[{ required: true, message: 'Sale date is required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="total_amount"
                label="Total Amount"
                rules={[{ required: true, message: 'Total amount is required' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="discount_amount" label="Discount Amount">
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="tax_amount" label="Tax Amount">
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BasicFormWrapper>
    </Modal>
  );
}

CreateSale.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  sale: propTypes.object,
  onSuccess: propTypes.func,
};

CreateSale.defaultProps = {
  sale: null,
  onSuccess: () => { },
};

export default CreateSale;
