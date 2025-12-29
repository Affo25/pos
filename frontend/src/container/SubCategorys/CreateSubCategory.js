/* eslint-disable no-unused-vars */
   import React, { useState, useEffect  } from 'react';
import { Form, Input, Row, Col, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createSubCategory, updateSubCategory } from '../../redux/subcategorys/subcategorySlice';
import { BasicFormWrapper } from '../../config/default/styled';

function CreateSubCategory({ visible, onCancel, subcategory, onSuccess }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (subcategory) {
        form.setFieldsValue({
          name: subcategory.name,
          email: subcategory.email,
          age: subcategory.age,
          number: subcategory.number,
        });
      }
    }
  }, [subcategory, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const subcategoryData = {
        name: values.name,
        email: values.email,
        age: values.age,
        number: values.number,
       
      };

      if (subcategory) {
        await dispatch(updateSubCategory(subcategory.id, subcategoryData));
      } else {
        await dispatch(createSubCategory(subcategoryData));
      }

      onSuccess();
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
      title={subcategory ? 'Edit SubCategory' : 'Create SubCategory'}
      visible={visible}
      footer={[
        <div key="1" className="subcategory-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {subcategory ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="subcategory-modal">
        <BasicFormWrapper>
          <Form form={form} name="createSubCategory" layout="vertical">
            <Row gutter={16}>
              
              <Col className='mt-2' span={12}>
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter Name"  />
                </Form.Item>
              </Col>
              <Col className='mt-2' span={12}>
                <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                  <Input placeholder="Enter Email"  />
                </Form.Item>
              </Col>
              <Col className='mt-2' span={12}>
                <Form.Item name="age" label="Age" rules={[{ required: true }]}>
                  <Input placeholder="Enter Age" type="number" />
                </Form.Item>
              </Col>
              <Col className='mt-2' span={12}>
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

CreateSubCategory.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  subcategory: propTypes.object,
  onSuccess: propTypes.func,
};

CreateSubCategory.defaultProps = {
  subcategory: null,
};

export default CreateSubCategory;