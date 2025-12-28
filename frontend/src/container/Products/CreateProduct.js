/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { useEffect } from 'react';
import { Form, Input, Row, Col, message, Select, DatePicker } from 'antd';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import {
  createProduct,
  fetchAllProducts,
  updateProduct,
} from '../../redux/products/productSlice';
import { STATUS, categories, subCategories } from '../../config/data/data';
import { BasicFormWrapper } from '../../config/default/styled';

function CreateProduct({ visible, onCancel, product }) {
  const [form] = Form.useForm();
  const { Option } = Select;
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (product) {
        form.setFieldsValue({
          category_id: product.category_id,
          sub_category_id: product.sub_category_id,
          name: product.name,
          sku: product.sku,
          description: product.description,
          unit: product.unit,
          cost_price: product.cost_price,
          selling_price: product.selling_price,
          tax_rate: product.tax_rate,
          reorder_level: product.reorder_level,
          total_stock: product.total_stock,
          last_purchase_price: product.last_purchase_price,
          last_purchase_date: product.last_purchase_date ? moment(product.last_purchase_date) : null,
          status: product.status,
        });
      }
    }
  }, [product, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const productData = {
        category_id: values.category_id,
        sub_category_id: values.sub_category_id,
        name: values.name,
        sku: values.sku,
        description: values.description,
        unit: values.unit,
        cost_price: values.cost_price,
        selling_price: values.selling_price,
        tax_rate: values.tax_rate,
        reorder_level: values.reorder_level,
        total_stock: values.total_stock,
        last_purchase_price: values.last_purchase_price,
        last_purchase_date: values.last_purchase_date ? values.last_purchase_date.format('YYYY-MM-DD') : null,
        status: values.status,
      };

      if (product) {
        await dispatch(updateProduct(product.id, productData));
        toast.success('Product updated successfully 🎉', { position: 'top-right', autoClose: 3000 });
      } else {
        await dispatch(createProduct(productData));
        toast.success('Product created successfully 🎉', { position: 'top-right', autoClose: 3000 });
      }

      await dispatch(fetchAllProducts());
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
      title={product ? 'Edit Product' : 'Create Product'}
      visible={visible}
      footer={[
        <div key="1" className="product-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {product ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="product-modal">
        <BasicFormWrapper>
          <Form form={form} name="createProduct" layout="vertical">
            <Row gutter={16}>
              <Col span={12} className="mt-2">
                <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
                  <Select placeholder="Select Category">
                    {categories.map((cat) => (
                      <Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="sub_category_id" label="Sub Category" rules={[{ required: true }]}>
                  <Select placeholder="Select Sub Category">
                    {subCategories.map((sub) => (
                      <Option key={sub.id} value={sub.id}>
                        {sub.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter product name" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                  <Input placeholder="Enter SKU" />
                </Form.Item>
              </Col>

              <Col span={24} className="mt-2">
                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                  <Input.TextArea placeholder="Enter description" rows={3} />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
                  <Input placeholder="Enter unit" />
                </Form.Item>
              </Col>
              <Col span={8} className="mt-2">
                <Form.Item name="cost_price" label="Cost Price" rules={[{ required: true }]}>
                  <Input type="number" placeholder="Enter cost price" />
                </Form.Item>
              </Col>
              <Col span={8} className="mt-2">
                <Form.Item name="selling_price" label="Selling Price" rules={[{ required: true }]}>
                  <Input type="number" placeholder="Enter selling price" />
                </Form.Item>
              </Col>

             <Col span={12} className="mt-2">
                <Form.Item name="tax_rate" label="Tax Rate" rules={[{ required: true }]}>
                  <Input placeholder="Enter tax rate" />
                </Form.Item>
              </Col>
              <Col span={8} className="mt-2">
                <Form.Item name="reorder_level" label="Reorder Level" rules={[{ required: true }]}>
                  <Input type="number" placeholder="Enter reorder level" />
                </Form.Item>
              </Col>
              <Col span={8} className="mt-2">
                <Form.Item name="total_stock" label="Total Stock" rules={[{ required: true }]}>
                  <Input type="number" placeholder="Enter total stock" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="last_purchase_price" label="Last Purchase Price" rules={[{ required: true }]}>
                  <Input type="number" placeholder="Enter last purchase price" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="last_purchase_date" label="Last Purchase Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="status" label="Status" initialValue="active">
                  <Select>
                    {STATUS.map((option) => (
                      <Option key={option.key} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
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

CreateProduct.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  product: propTypes.object,
};

CreateProduct.defaultProps = {
  product: null,
};

export default CreateProduct;
