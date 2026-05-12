/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Form, Input, Row, Col, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createCustomer, updateCustomer } from '../../redux/customers/customerSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import ModernModalStyles from '../shared/modalStyles';

function CreateCustomer({ visible, onCancel, customer, onSuccess }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (visible) {
      form.resetFields();

      if (customer) {
        form.setFieldsValue({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        });
      }
    }
  }, [customer, visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const customerData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
      };

      if (customer) {
        await dispatch(
          updateCustomer({
            id: customer.id,
            data: customerData,
          })
        );
      } else {
        await dispatch(createCustomer(customerData));
      }

      message.success(customer ? 'Customer updated' : 'Customer created');
      onSuccess();
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error('Please check the form');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <>
      <ModernModalStyles />
      <Modal
        className="modern-modal"
        title={customer ? 'Edit Customer' : 'Create Customer'}
        visible={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="1" type="primary" onClick={handleOk}>
            {customer ? 'Update' : 'Save'}
          </Button>,
        ]}
      >
        <BasicFormWrapper>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: 'Name is required' }]}
                >
                  <Input placeholder="Enter name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="email" label="Email">
                  <Input placeholder="Enter email" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[{ required: true, message: 'Phone is required' }]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="address" label="Address">
                  <Input placeholder="Enter address" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
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
  onSuccess: () => { },
};

export default CreateCustomer;
