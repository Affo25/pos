/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Form, Input, Row, Col, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createSupplier, updateSupplier } from '../../redux/suppliers/supplierSlice';
import { BasicFormWrapper } from '../../config/default/styled';

function CreateSupplier({ visible, onCancel, supplier, onSuccess }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (supplier) {
        form.setFieldsValue({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
        });
      }
    }
  }, [supplier, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // ✅ ONLY backend-allowed fields
      const supplierData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
      };

      if (supplier) {
        await dispatch(updateSupplier({ id: supplier.id, data: supplierData }));
      } else {
        await dispatch(createSupplier(supplierData));
      }

      onSuccess?.();
      resetForm();
      onCancel();
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
        error.message ||
        'Operation failed'
      );
    }
  };

  return (
    <Modal
      type="primary"
      title={supplier ? 'Edit Supplier' : 'Create Supplier'}
      visible={visible}
      footer={[
        <div key="1">
          <Button type="primary" onClick={handleOk}>
            {supplier ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={() => {
        resetForm();
        onCancel();
      }}
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
                <Input placeholder="Enter Name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Invalid email' }]}
              >
                <Input placeholder="Enter Email" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Phone is required' }]}
              >
                <Input placeholder="Enter Phone Number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="address" label="Address">
                <Input placeholder="Enter Address" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BasicFormWrapper>
    </Modal>
  );
}

CreateSupplier.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  supplier: propTypes.object,
  onSuccess: propTypes.func,
};

CreateSupplier.defaultProps = {
  supplier: null,
};

export default CreateSupplier;
