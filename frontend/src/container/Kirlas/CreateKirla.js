/* eslint-disable no-unused-vars */
   import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createKirla, fetchAllKirlas, updateKirla } from '../../redux/kirlas/kirlaSlice';
import { BasicFormWrapper } from '../../config/default/styled';

function CreateKirla({ visible, onCancel, kirla }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (kirla) {
        form.setFieldsValue({
          name: kirla.name,
          email: kirla.email,
          age: kirla.age,
          number: kirla.number
        });
      }
    }
  }, [kirla, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const kirlaData = {
        name: values.name,
        email: values.email,
        age: values.age,
        number: values.number
      };

      if (kirla) {
        await dispatch(updateKirla(kirla.id, kirlaData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createKirla(kirlaData));
        toast.success('Created successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      }

      await dispatch(fetchAllKirlas());
      resetForm();
      onCancel();
    } catch (error) {
      message.error(error.response?.data?.error || error.message || 'Operation failed');
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Modal
      type="primary"
      title={kirla ? 'Edit Kirla' : 'Create Kirla'}
      visible={visible}
      footer={[
        <div key="1" className="kirla-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {kirla ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="kirla-modal">
        <BasicFormWrapper>
          <Form form={form} name="createKirla" layout="vertical">
            <Row gutter={16}>
              
              <Col span={12}>
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter Name"  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                  <Input placeholder="Enter Email"  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="age" label="Age" rules={[{ required: true }]}>
                  <Input placeholder="Enter Age" type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="number" label="Number" rules={[{ required: true }]}>
                  <Input placeholder="Enter Number" type="number" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateKirla.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  kirla: propTypes.object,
};

CreateKirla.defaultProps = {
  kirla: null,
};

export default CreateKirla;