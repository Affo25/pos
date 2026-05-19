/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col, message, Space } from 'antd';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createCustomer, updateCustomer } from '../../redux/customers/customerSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { ProcurementFormStyles } from '../shared/procurementScreenStyles';
import ModernModalStyles from '../shared/modalStyles';

const { TextArea } = Input;

function CreateCustomer({ visible, onCancel, customer, onSuccess }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({ loyalty_points: 0, opening_balance: 0 });
  };

  useEffect(() => {
    if (!visible) return;

    resetForm();

    if (customer) {
      form.setFieldsValue({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        loyalty_points: customer.loyalty_points ?? 0,
        opening_balance: customer.opening_balance ?? 0,
        opening_balance_note: customer.opening_balance_note || '',
      });
    }
  }, [customer, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const customerData = {
        name: values.name,
        email: values.email?.trim() || undefined,
        phone: values.phone,
        address: values.address?.trim() || undefined,
        loyalty_points: Number(values.loyalty_points ?? 0),
        opening_balance: Number(values.opening_balance || 0),
        opening_balance_note: values.opening_balance_note?.trim() || '',
      };

      if (customer) {
        await dispatch(
          updateCustomer({
            id: customer.id,
            data: customerData,
          }),
        );
        message.success('Customer updated');
      } else {
        await dispatch(createCustomer(customerData));
        message.success('Customer created');
      }

      onSuccess?.();
      resetForm();
      onCancel();
    } catch (error) {
      message.error(error?.message || 'Please check the form');
    }
  };

  return (
    <>
      <ModernModalStyles />
      <Modal
        className="modern-modal"
        title={customer ? 'Edit customer' : 'Create customer'}
        visible={visible}
        onCancel={() => {
          resetForm();
          onCancel();
        }}
        width={720}
        bodyStyle={{
          maxHeight: '72vh',
          overflowY: 'auto',
        }}
        footer={[
          <Space key="actions" direction="horizontal" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              key="cancel"
              type="white"
              onClick={() => {
                resetForm();
                onCancel();
              }}
            >
              Cancel
            </Button>
            <Button key="save" type="primary" onClick={handleOk}>
              {customer ? 'Update' : 'Save'}
            </Button>
          </Space>,
        ]}
      >
        <ProcurementFormStyles>
          <BasicFormWrapper>
            <Form
              form={form}
              layout="vertical"
              size="middle"
              initialValues={{ loyalty_points: 0, opening_balance: 0 }}
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Full name"
                    rules={[{ required: true, message: 'Name is required' }]}
                  >
                    <Input placeholder="Enter customer name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[{ required: true, message: 'Phone is required' }]}
                  >
                    <Input placeholder="Enter phone number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ type: 'email', message: 'Invalid email' }]}
                  >
                    <Input placeholder="Enter email (optional)" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="loyalty_points" label="Loyalty points">
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="address" label="Address">
                    <TextArea rows={2} placeholder="Street, city (optional)" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="opening_balance"
                    label="Opening balance (PKR)"
                    tooltip="Amount this customer owed you before sales in the system"
                    initialValue={0}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="opening_balance_note" label="Opening balance note" style={{ marginBottom: 0 }}>
                    <Input placeholder="e.g. Brought forward from ledger" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </BasicFormWrapper>
        </ProcurementFormStyles>
      </Modal>
    </>
  );
}

CreateCustomer.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  customer: propTypes.object,
  onSuccess: propTypes.func,
};

CreateCustomer.defaultProps = {
  customer: null,
  onSuccess: null,
};

export default CreateCustomer;
