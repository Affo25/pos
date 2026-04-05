/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createCategory, updateCategory } from '../../redux/categorys/categorySlice';
import { BasicFormWrapper } from '../../config/default/styled';

const { TextArea } = Input;

function CreateCategory({ visible, onCancel, category, onSuccess, currentUser }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (category) {
        form.setFieldsValue({
          name: category.name,
          description: category.description || '',
        });
      } else {
        form.setFieldsValue({
          created_by: currentUser?._id || currentUser?.id,
        });
      }
    }
  }, [category, form, visible, currentUser]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const categoryData = {
        name: values.name,
        description: values.description,
      };

      if (category) {
        console.log('Updating category with data:', categoryData);
        await dispatch(updateCategory({ id: category.id, data: categoryData }));
      } else {
        await dispatch(createCategory(categoryData));
      }

      onSuccess();
      resetForm();
      onCancel();
    } catch (error) {
      message.error(error.response?.data?.error || error.message || 'Operation failed');
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Modal
      type="primary"
      title={category ? 'Edit Category' : 'Create Category'}
      visible={visible}
      footer={[
        <div key="1" className="category-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {category ? 'Update' : 'Create Category'}
          </Button>
          <Button size="default" type="default" onClick={handleCancel} style={{ marginLeft: '8px' }}>
            Cancel
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
      width={600}
    >
      <div className="category-modal">
        <BasicFormWrapper>
          <Form
            form={form}
            name="createCategory"
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Category Name"
                  rules={[
                    { required: true, message: 'Please enter category name' },
                    { max: 100, message: 'Name cannot exceed 100 characters' }
                  ]}
                >
                  <Input placeholder="Enter category name" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea
                    placeholder="Enter category description (optional)"
                    rows={3}
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateCategory.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  category: propTypes.object,
  onSuccess: propTypes.func,
  currentUser: propTypes.object.isRequired,
};

CreateCategory.defaultProps = {
  category: null,
};

export default CreateCategory;