/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createSubCategory, updateSubCategory } from '../../redux/subcategorys/subcategorySlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { fetchAllCategorys } from '../../redux/categorys/categorySlice';

const { Option } = Select;
const { TextArea } = Input;
function CreateSubCategory({ visible, onCancel, subcategory, onSuccess }) {
  const { categorys } = useSelector((state) => state.categorys);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };
  useEffect(() => {
    dispatch(fetchAllCategorys());
  }, []);


  useEffect(() => {
    if (!visible) return;

    form.resetFields();

    if (subcategory) {
      form.setFieldsValue({
        category_id: subcategory.category_id,
        name: subcategory.name,
        description: subcategory.description,
        status: subcategory.status,
      });
    }
  }, [subcategory, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (subcategory) {
        await dispatch(updateSubCategory({ id: subcategory.id, data: values }));
      } else {
        await dispatch(createSubCategory(values));
      }
      onSuccess();
      form.resetFields();
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

              <Col span={12}>
                <Form.Item
                  name="category_id"
                  label="Category"
                  rules={[{ required: true, message: 'Category is required' }]}
                >
                  <Select placeholder="Select Category">
                    {categorys.map(cat => (
                      <Option key={cat._id} value={cat._id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Name */}
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Sub Category Name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter Sub Category Name" />
                </Form.Item>
              </Col>

              {/* Description */}
              <Col span={24}>
                <Form.Item name="description" label="Description">
                  <TextArea rows={3} placeholder="Optional description" />
                </Form.Item>
              </Col>

              {/* Status */}
              <Col span={12}>
                <Form.Item name="status" label="Status" initialValue="active">
                  <Select>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
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