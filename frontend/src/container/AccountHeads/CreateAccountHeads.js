/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { STATUS } from '../../config/data/data';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import {
  createAccountHeads,
  updateAccountHeads,
} from '../../redux/accountheads/accountheadsSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { generateSubjectCode } from '../../config/utils/codeGenerator';

function CreateAccountHeads({ visible, onCancel, accountheads, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (accountheads) {
        form.setFieldsValue({
          name: accountheads.name,
          status: accountheads.status,
        });
      }
    }
  }, [accountheads, form, visible]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setFieldsValue({
      code: generateSubjectCode(name),
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const accountheadsData = {
        name: values.name,
        status: values.status,
        branch_id: selectedBranchId,
      };

      if (accountheads) {
        await dispatch(updateAccountHeads(accountheads.id, accountheadsData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createAccountHeads(accountheadsData));
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
      title={accountheads ? 'Edit AccountHeads' : 'Create AccountHeads'}
      visible={visible}
      footer={[
        <div key="1" className="accountheads-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {accountheads ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="accountheads-modal">
        <BasicFormWrapper>
          <Form form={form} name="createAccountHeads" layout="vertical">
            <Row gutter={16}>
              <Col className="mt-2" span={12}>
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter Name" onChange={handleNameChange} />
                </Form.Item>
              </Col>

              <Col className="mt-2" span={12}>
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
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateAccountHeads.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  accountheads: propTypes.object,
  onSuccess: propTypes.func,
};

CreateAccountHeads.defaultProps = {
  accountheads: null,
};

export default CreateAccountHeads;
