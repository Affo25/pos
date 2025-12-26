/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createClient, fetchAllClients, updateClient } from '../../redux/clients/clientSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { STATUS_OPTIONS } from '../../config/data/data';
import { createUser } from '../../redux/users/userSlice';

function CreateClient({ visible, onCancel, client }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);

  const isEditMode = !!client;

  const resetForm = () => {
    form.resetFields();
    if (!isEditMode) setStep(1);
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (client) {
        form.setFieldsValue({
          code: client.code,
          name: client.name,
          email: client.email,
          contact: client.contact,
          status: client.status,
          package_name: client.package_name,
          company_name: client.company_name,
          address: client.address,
          country: client.country,
        });
      }
    }
  }, [client, form, visible]);

  const handleNext = async () => {
    try {
      await form.validateFields();
      setStep(2);
    } catch (error) {
      message.error('Please fill all required fields before proceeding.');
    }
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const userData = {
        name: values.name,
        email: values.email,
        contact: values.contact,
        password: values.password,
      };

      const clientData = {
        code: values.code,
        name: values.name,
        email: values.email,
        contact: values.contact,
        status: values.status,
        package_name: values.package_name,
        company_name: values.company_name,
        address: values.address,
        country: values.country,
      };

      if (isEditMode) {
        await dispatch(updateClient(client.id, clientData));
        toast.success('Client updated successfully 🎉');
      } else {
        await dispatch(createUser(userData));
        toast.success('User created successfully 🎉');
        await dispatch(createClient(clientData));
        toast.success('Client created successfully 🎉');
      }

      await dispatch(fetchAllClients());
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
      title={isEditMode ? 'Edit Client' : 'Create Client'}
      visible={visible}
      footer={[
        <div key="footer" className="client-modal-footer">
          {isEditMode ? (
            <Button size="default" type="primary" onClick={handleSave}>
              Save
            </Button>
          ) : step === 1 ? (
            <Button size="default" type="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button size="default" type="primary" onClick={handleSave}>
              Save
            </Button>
          )}
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="client-modal">
        <BasicFormWrapper>
          <Form form={form} name="createClient" layout="vertical">
            <Row gutter={16}>
              {/* Common Fields */}
              {(step === 1 || isEditMode) && (
                <>
                  <Col span={12}>
                    <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                      <Input placeholder="Enter Code" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                      <Input placeholder="Enter Name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                      <Input placeholder="Enter Email" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="contact" label="Contact" rules={[{ required: true }]}>
                      <Input placeholder="Enter Contact" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="status" label="Status" initialValue="active">
                      <Select>
                        {STATUS_OPTIONS.map((option) => (
                          <Select.Option key={option.key} value={option.value}>
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="package_name" label="Package Name">
                      <Input placeholder="Enter Package Name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="company_name" label="Company Name">
                      <Input placeholder="Enter Company Name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="address" label="Address">
                      <Input placeholder="Enter Address" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="country" label="Country">
                      <Input placeholder="Enter Country" />
                    </Form.Item>
                  </Col>
                </>
              )}

              {/* Password Field Only in Create Step 2 */}
              {!isEditMode && step === 2 && (
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Please input password' }]}
                  >
                    <Input.Password placeholder="Enter Password" />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateClient.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  client: propTypes.object,
};

CreateClient.defaultProps = {
  client: null,
};

export default CreateClient;
