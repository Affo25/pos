/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createAccount, updateAccount } from '../../redux/accounts/accountSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { fetchAllAccountheads } from '../../redux/accountheads/accountheadsSlice';

function CreateAccount({ visible, onCancel, account, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const { accountheads } = useSelector((state) => state.accountheads);
  
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllAccountheads(selectedBranchId));
    }
  }, [dispatch, selectedBranchId]);

  useEffect(() => {
    if (visible) {
      resetForm();
      if (account) {
        form.setFieldsValue({
          accountName: account.accountName,
          openingBalance: account.openingBalance,
          accountHeadId: account.accountHeadId,
          accountType: account.accountType,
        });
      }
    }
  }, [account, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const accountData = {
        accountName: values.accountName,
        openingBalance: values.openingBalance,
        accountHeadId: values.accountHeadId,
        accountType: values.accountType,
        branch_id: selectedBranchId,
      };

      if (account) {
        await dispatch(updateAccount(account.id, accountData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createAccount(accountData));
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
      title={account ? 'Edit Account' : 'Create Account'}
      visible={visible}
      footer={[
        <div key="1" className="account-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {account ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="account-modal">
        <BasicFormWrapper>
          <Form form={form} name="createAccount" layout="vertical">
            <Row gutter={16}>
              <Col className="mt-2" span={12}>
                <Form.Item
                  name="accountName"
                  label="Account Name"
                  rules={[{ required: true, message: 'Please enter account name' }]}
                >
                  <Input placeholder="Enter account name" />
                </Form.Item>
              </Col>
              <Col className="mt-2" span={12}>
                <Form.Item
                  name="accountType"
                  label="Account Type"
                  rules={[{ required: true, message: 'Please select account type' }]}
                >
                  <Input placeholder="Enter Account Type" />
                </Form.Item>
              </Col>

              <Col className="mt-2" span={12}>
                <Form.Item
                  name="openingBalance"
                  label="Opening Balance"
                  rules={[{ required: true, message: 'Please enter opening balance' }]}
                >
                  <Input placeholder="Enter Account OpeningBalance" type="number" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="accountHeadId" label="Account Head">
                  <Select placeholder="Select Account Head">
                    {accountheads?.map((accunthead) => (
                      <Select.Option key={accunthead._id} value={accunthead._id}>
                        {accunthead.name}
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

CreateAccount.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  account: propTypes.object,
  onSuccess: propTypes.func,
};

CreateAccount.defaultProps = {
  account: null,
};

export default CreateAccount;
