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
  Tabs,
} from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import {
  createProduct,
  fetchAllProducts,
  fetchAllCategories,
  fetchAllSuppliers,
  updateProduct,
} from '../../redux/products/productSlice';
import { STATUS } from '../../config/data/data';
import { BasicFormWrapper } from '../../config/default/styled';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

function CreateProduct({ visible, onCancel, product }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // ✅ GET DATA FROM REDUX
  const { categories, suppliers } = useSelector((state) => state.products);

  const resetForm = () => form.resetFields();

  // ✅ FETCH CATEGORIES & SUPPLIERS
  useEffect(() => {
    if (!visible) return;

    dispatch(fetchAllCategories());
    dispatch(fetchAllSuppliers());
  }, [visible, dispatch]);

  // ✅ EDIT MODE SET VALUES
  useEffect(() => {
    if (!visible) return;

    resetForm();

    if (product) {
      form.setFieldsValue({
        ...product,
        category: product.category?._id || product.category,
        supplier_name: product.supplier_name?._id || product.supplier_name,
        expiry_date: product.expiry_date ? moment(product.expiry_date) : null,
      });
    }
  }, [product, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        category: values.category, // ID
        supplier_name: values.supplier_name, // ID
        expiry_date: values.expiry_date
          ? values.expiry_date.format('YYYY-MM-DD')
          : null,
        total_value: values.unit_price * values.available_quantity,
      };

      if (product) {
        await dispatch(updateProduct({ id: product.id, data: payload }));
      } else {
        await dispatch(createProduct(payload));
      }

      await dispatch(fetchAllProducts());
      resetForm();
      onCancel();
    } catch (error) {
      message.error(
        error.response?.data?.error ||
          error.message ||
          'Operation failed'
      );
    }
  };

  return (
    <Modal
      type="primary"
      title={product ? 'Edit Medicine' : 'Create Medicine'}
      visible={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="save" type="primary" onClick={handleOk}>
          {product ? 'Update' : 'Save'}
        </Button>,
      ]}
    >
      <BasicFormWrapper>
        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="1" type="card">
            
            {/* ===== BASIC INFO ===== */}
            <TabPane tab="Basic Info" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Medicine Name" rules={[{ required: true }]}>
                    <Input placeholder="Enter medicine name" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                    <Select showSearch placeholder="Select Category">
                      {categories?.map((cat) => (
                        <Option key={cat._id} value={cat._id}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="batch_number" label="Batch Number" rules={[{ required: true }]}>
                    <Input placeholder="Enter batch number" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="expiry_date" label="Expiry Date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="supplier_name" label="Supplier Name" rules={[{ required: true }]}>
                    <Select showSearch placeholder="Select Supplier">
                      {suppliers?.map((sup) => (
                        <Option key={sup._id} value={sup._id}>
                          {sup.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="rack_location" label="Rack Location">
                    <Input placeholder="Enter rack location" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="medicine_size" label="Medicine Size" rules={[{ required: true }]}>
                    <Input placeholder="Enter medicine size" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* ===== MANUFACTURER ===== */}
            <TabPane tab="Manufacturer Info" key="2">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="manufacturer" label="Manufacturer Name" rules={[{ required: true }]}>
                    <Input placeholder="Enter manufacturer name" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="manufacturer_license_no" label="License No">
                    <Input placeholder="Enter license number" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="manufacturer_registration_no" label="Registration No">
                    <Input placeholder="Enter registration number" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="manufacturer_details" label="Details">
                    <TextArea rows={2} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* ===== STOCK ===== */}
            <TabPane tab="Pricing & Stock" key="3">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="available_quantity" label="Quantity" initialValue={0} rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name="unit_price" label="Price" initialValue={0} rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name="minimum_stock_alert" label="Min Alert" initialValue={0}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="discount" label="Discount %" initialValue={0}>
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name="gst" label="GST %" initialValue={0}>
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name="status" label="Status" initialValue="active">
                    <Select>
                      {STATUS.map((opt) => (
                        <Option key={opt.key} value={opt.value}>
                          {opt.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* ===== EXTRA ===== */}
            <TabPane tab="Additional Info" key="4">
              <Form.Item name="alternative_medicines" label="Alternatives">
                <Select mode="tags" />
              </Form.Item>

              <Form.Item name="image" label="Image URL">
                <Input />
              </Form.Item>
            </TabPane>

          </Tabs>
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