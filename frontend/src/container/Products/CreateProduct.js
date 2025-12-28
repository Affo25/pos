/* eslint-disable no-unused-vars */
   import React, { useState, useEffect  } from 'react';
import { Form, Input, Row, Col, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createProduct, updateProduct } from '../../redux/products/productSlice';
import { BasicFormWrapper } from '../../config/default/styled';

function CreateProduct({ visible, onCancel, product, onSuccess }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (product) {
        form.setFieldsValue({
          name: product.name,
          email: product.email,
          age: product.age,
          number: product.number,
        });
      }
    }
  }, [product, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const productData = {
        name: values.name,
        email: values.email,
        age: values.age,
        number: values.number,
       
      };

      if (product) {
        await dispatch(updateProduct(product.id, productData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createProduct(productData));
        toast.success('Created successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
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

CreateProduct.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  product: propTypes.object,
  onSuccess: propTypes.func,
};

CreateProduct.defaultProps = {
  product: null,
};

export default CreateProduct;