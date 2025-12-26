/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select, DatePicker } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createTransaction, updateTransaction } from '../../redux/transactions/transactionSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { fetchAllAccounts } from '../../redux/accounts/accountSlice';

function CreateTransaction({ visible, onCancel, transaction, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const { accounts } = useSelector((state) => state.accounts);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };
  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllAccounts(selectedBranchId));
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (visible) {
      resetForm();
      if (transaction) {
        form.setFieldsValue({
          transactionDate: transaction.transactionDate ? moment(transaction.transactionDate) : null,
          description: transaction.description,
          debit: transaction.debit,
          credit: transaction.credit,
          accountId: transaction.accountId,
        });
      }
    }
  }, [transaction, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const transactionData = {
        transactionDate: values.transactionDate?.format('YYYY-MM-DD'),
        description: values.description,
        debit: values.debit,
        credit: values.credit,
        accountId: values.accountId,
        branch_id: selectedBranchId,
      };

      if (transaction) {
        await dispatch(updateTransaction(transaction.id, transactionData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createTransaction(transactionData));
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
      title={transaction ? 'Edit Transaction' : 'Create Transaction'}
      visible={visible}
      footer={[
        <div key="1" className="transaction-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {transaction ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="transaction-modal">
        <BasicFormWrapper>
          <Form form={form} name="createTransaction" layout="vertical">
            <Row gutter={16}>
              <Col className="mt-2" span={12}>
                <Form.Item
                  name="transactionDate"
                  label="Transaction Date"
                  rules={[{ required: true, message: 'Please select transaction date!' }]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="Select Date" />
                </Form.Item>
              </Col>

              <Col className="mt-2" span={12}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: 'Please enter description!' }]}
                >
                  <Input placeholder="Enter Transaction Description" />
                </Form.Item>
              </Col>

              <Col className="mt-2" span={12}>
                <Form.Item
                  name="debit"
                  label="Debit"
                  rules={[{ required: true, message: 'Please enter debit amount!' }]}
                >
                  <Input placeholder="Enter Account Debit" type="number" />
                </Form.Item>
              </Col>

              <Col className="mt-2" span={12}>
                <Form.Item
                  name="credit"
                  label="Credit"
                  rules={[{ required: true, message: 'Please enter credit amount!' }]}
                >
                  <Input placeholder="Enter Account Credit" type="number" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="accountId" label="Account Name">
                  <Select placeholder="Select Account Name">
                    {accounts?.map((account) => (
                      <Select.Option key={account._id} value={account._id}>
                        {account.accountName}
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

CreateTransaction.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  transaction: propTypes.object,
  onSuccess: propTypes.func,
};

CreateTransaction.defaultProps = {
  transaction: null,
};

export default CreateTransaction;
