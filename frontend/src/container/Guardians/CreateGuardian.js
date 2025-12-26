/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createGuardian, updateGuardian } from '../../redux/guardians/guardianSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { IDENTITY_TYPE_OPTIONS } from '../../config/data/data';

function CreateGuardian({ visible, onCancel, guardian, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (guardian) {
        form.setFieldsValue({
          guardianCode: guardian.guardianCode,
          name: guardian.name,
          fatherName: guardian.fatherName,
          identityType: guardian.identityType,
          identityNo: guardian.identityNo,
          contactNo: guardian.contactNo,
          email: guardian.email,
          streetAddress: guardian.streetAddress,
          city: guardian.city,
          fatherCNIC: guardian.fatherCNIC,
          state: guardian.state,
          country: guardian.country,
        });
      }
    }
  }, [guardian, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const guardianData = {
        guardianCode: values.guardianCode,
        name: values.name,
        fatherName: values.fatherName,
        identityType: values.identityType,
        identityNo: values.identityNo,
        contactNo: values.contactNo,
        email: values.email,
        streetAddress: values.streetAddress,
        city: values.city,
        state: values.state,
        country: values.country,
        fatherCNIC: values.fatherCNIC,
        branch_id: selectedBranchId,
      };

      if (guardian) {
        await dispatch(updateGuardian(guardian.id, guardianData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createGuardian(guardianData));
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
      title={guardian ? 'Edit Guardian' : 'Create Guardian'}
      visible={visible}
      footer={[
        <div key="1" className="guardian-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {guardian ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="guardian-modal">
        <BasicFormWrapper>
          <Form form={form} name="createGuardian" layout="vertical">
            <Row gutter={16}>
              <Col span={12} className='mt-2'>
                <Form.Item name="guardianCode" label="Guardian Code" rules={[{ required: true }]}>
                  <Input type="number" placeholder="Enter Guardian Code" />
                </Form.Item>
              </Col>
              <Col span={12} className='mt-2'>
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter Name" />
                </Form.Item>
              </Col>
              <Col span={12} className='mt-2'>
                <Form.Item name="fatherName" label="Father Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter Father Name" />
                </Form.Item>
              </Col>
               <Col span={12} className='mt-2'>
                <Form.Item name="fatherCNIC" label="Father CNIC" rules={[{ required: true }]}>
                  <Input  placeholder="Enter CNIC" />
                </Form.Item>
              </Col>
              <Col span={12} className='mt-2'>
                <Form.Item name="identityType" label="Identity Type">
                  <Select placeholder="Select Identity Type" options={IDENTITY_TYPE_OPTIONS} allowClear />
                </Form.Item>
              </Col>
              <Col span={12} className='mt-2'>
                <Form.Item name="identityNo" label="Identity No" rules={[{ required: true }]}>
                  <Input type='number' placeholder="Enter Identity Number" />
                </Form.Item>
              </Col>
              <Col span={12} className='mt-2'>
                <Form.Item name="contactNo" label="Contact No" rules={[{ required: true }]}>
                  <Input type='number' placeholder="Enter Contact Number" />
                </Form.Item>
              </Col>
              <Col span={12} className='mt-2'>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="Enter Email" />
                </Form.Item>
              </Col>
              <Col span={12} className='mt-2'>
                <Form.Item name="streetAddress" label="Street Address">
                  <Input placeholder="Enter Street Address" />
                </Form.Item>
              </Col>
              <Col span={12} className='mt-2'>
                <Form.Item name="city" label="City">
                  <Input placeholder="Enter City" />
                </Form.Item>
              </Col>
              <Col span={12} className='mt-2'>
                <Form.Item name="state" label="State">
                  <Input placeholder="Enter State" />
                </Form.Item>
              </Col>
              <Col span={12} className='mt-2'>
                <Form.Item name="country" label="Country">
                  <Input placeholder="Enter Country" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateGuardian.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  guardian: propTypes.object,
  onSuccess: propTypes.func,
};

CreateGuardian.defaultProps = {
  guardian: null,
};

export default CreateGuardian;
