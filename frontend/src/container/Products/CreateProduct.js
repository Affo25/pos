/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  message,
  Select,
  DatePicker,
} from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
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
import { fetchAllCategorys } from '../../redux/categorys/categorySlice';

const { Option } = Select;
const { TextArea } = Input;

function CreateProduct({ visible, onCancel, product }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { categorys } = useSelector((state) => state.categorys);

  const resetForm = () => form.resetFields();

  useEffect(() => {
    dispatch(fetchAllCategorys());
  }, []);

  useEffect(() => {
    if (!visible) return;

    resetForm();

    if (product) {
      form.setFieldsValue({
        ...product,
        last_purchase_date: product.last_purchase_date
          ? moment(product.last_purchase_date)
          : null,
      });
    }
  }, [product, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        last_purchase_date: values.last_purchase_date
          ? values.last_purchase_date.format('YYYY-MM-DD')
          : null,
      };

      if (product) {
        await dispatch(updateProduct(product.id, payload));
      } else {
        await dispatch(createProduct(payload));
      }

      await dispatch(fetchAllProducts());
      resetForm();
      onCancel();
    } catch (error) {
      message.error(
        error.response?.data?.error || error.message || 'Operation failed'
      );
    }
  };

  return (
    <Modal
      type="primary"
      title={product ? 'Edit Product' : 'Create Product'}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="save" type="primary" onClick={handleOk}>
          {product ? 'Update' : 'Save'}
        </Button>,
      ]}
    >
      <BasicFormWrapper>
        <Form form={form} layout="vertical">

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select Category">
                  {categorys.map(cat => (
                    <Option key={cat._id} value={cat._id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

            </Col>

            <Col span={12}>
              <Form.Item name="sub_category_id" label="Sub Category" rules={[{ required: true }]}>
                <Select placeholder="Select Sub Category">
                  {subCategories.map(sub => (
                    <Option key={sub.id} value={sub.id}>{sub.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                <Input placeholder="Enter SKU" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Optional description" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="unit" label="Unit">
                <Input placeholder="e.g. pcs, kg" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="cost_price" label="Cost Price" initialValue={0}>
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  onFocus={(e) => e.target?.select?.()}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="selling_price" label="Selling Price" initialValue={0}>
                <InputNumber min={0} onFocus={(e) => e.target?.select?.()} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="tax_rate" label="Tax Rate (%)" initialValue={0}>
                <InputNumber min={0} max={100} onFocus={(e) => e.target?.select?.()} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="reorder_level" label="Reorder Level" initialValue={0}>
                <InputNumber min={0} onFocus={(e) => e.target?.select?.()} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="total_stock" label="Total Stock" initialValue={0}>
                <InputNumber min={0} onFocus={(e) => e.target?.select?.()} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="last_purchase_price" label="Last Purchase Price" initialValue={0}>
                <InputNumber onFocus={(e) => e.target?.select?.()} min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="last_purchase_date" label="Last Purchase Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" initialValue="active">
                <Select>
                  {STATUS.map(opt => (
                    <Option key={opt.key} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BasicFormWrapper>
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
