/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import {
  createBranchProfile,
  fetchAllBranchProfiles,
  updateBranchProfile,
} from '../../redux/branchprofiles/branchprofileSlice';
import { STATUS, countries } from '../../config/data/data';

import { BasicFormWrapper } from '../../config/default/styled';
import ModernModalStyles from '../shared/modalStyles';

function CreateBranchProfile({ visible, onCancel, branchprofile }) {
  const [form] = Form.useForm();
  const { Option } = Select;
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (branchprofile) {
        form.setFieldsValue({
          branch_name: branchprofile.branch_name,
          code: branchprofile.code,
          vp_name: branchprofile.vp_name,
          vp_title: branchprofile.vp_title,
          vp_contact: branchprofile.vp_contact,
          vp_email: branchprofile.vp_email,
          address: branchprofile.address,
          city: branchprofile.city,
          state: branchprofile.state,
          status: branchprofile.status,
          country: branchprofile.country,
        });
      }
    }
  }, [branchprofile, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const branchprofileData = {
        branch_name: values.branch_name,
        code: values.code,
        vp_name: values.vp_name,
        vp_title: values.vp_title,
        vp_contact: values.vp_contact,
        vp_email: values.vp_email,
        address: values.address,
        city: values.city,
        state: values.state,
        status: values.status,
        country: values.country,
      };

      if (branchprofile) {
        await dispatch(updateBranchProfile(branchprofile.id, branchprofileData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createBranchProfile(branchprofileData));
        toast.success('Created successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      }

      await dispatch(fetchAllBranchProfiles());
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
    <>
    <ModernModalStyles />
    <Modal
      title={branchprofile ? 'Edit BranchProfile' : 'Create BranchProfile'}
      visible={visible}
      className="modern-modal"
      footer={[
        <div key="1" className="branchprofile-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {branchprofile ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="branchprofile-modal">
        <BasicFormWrapper>
          <Form form={form} name="createBranchProfile" layout="vertical">
            <Row gutter={16}>
              <Col span={12} className="mt-2">
                <Form.Item name="branch_name" label="Branch Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter campus name" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                  <Input placeholder="Enter campus code" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="vp_name" label="VP Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter vp name" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="vp_title" label="VP Title" rules={[{ required: true }]}>
                  <Input placeholder="Enter vp title" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="vp_contact" label="VP Contact" rules={[{ required: true }]}>
                  <Input type="number" placeholder="Enter contact number" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="vp_email" label="VP Email" rules={[{ required: true }]}>
                  <Input placeholder="Enter vp email" />
                </Form.Item>
              </Col>

              <Col span={24} className="mt-2">
                <Form.Item name="address" label="Street Address">
                  <Input placeholder="Enter street address" />
                </Form.Item>
              </Col>

              <Col span={8} className="mt-2">
                <Form.Item name="city" label="City">
                  <Input placeholder="Enter city" />
                </Form.Item>
              </Col>
              <Col span={8} className="mt-2">
                <Form.Item name="state" label="State">
                  <Input placeholder="Enter state" />
                </Form.Item>
              </Col>
              <Col span={8} className="mt-2">
                <Form.Item name="status" label="Status" initialValue="active">
                  <Select>
                    {STATUS.map((option) => (
                      <Select.Option key={option.key} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="nationality" label="Nationality">
                  <Select placeholder="Select Nationality" showSearch optionFilterProp="label" allowClear>
                    {countries.map((country) => (
                      <Option key={country.code} value={country.name} label={country.name}>
                        {country.flag} {country.name}
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
    </>
  );
}

CreateBranchProfile.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  branchprofile: propTypes.object,
};

CreateBranchProfile.defaultProps = {
  branchprofile: null,
};

export default CreateBranchProfile;
