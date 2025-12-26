/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createFeeStructure, updateFeeStructure } from '../../redux/feestructures/feestructureSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { fetchAllClassLists } from '../../redux/classLists/classListSlice';
import { fetchAllFeeHeads } from '../../redux/feeheads/feeheadsSlice';
import { fetchAllAccounts } from '../../redux/accounts/accountSlice';

function CreateFeeStructure({ visible, onCancel, feestructure, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const { classLists } = useSelector((state) => state.classLists);
  const { feeHeads } = useSelector((state) => state.feeHeads);
  const { accounts } = useSelector((state) => state.accounts);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };
  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllClassLists(selectedBranchId));
      dispatch(fetchAllFeeHeads(selectedBranchId));
      dispatch(fetchAllAccounts(selectedBranchId));
    }
  }, [selectedBranchId]);
  useEffect(() => {
    if (visible) {
      resetForm();
      if (feestructure) {
        form.setFieldsValue({
          classListId: feestructure.classListId,
          feeTypeCode: feestructure.feeTypeCode,
          accountId: feestructure.accountId,
          feeAmount: feestructure.feeAmount,
        });
      }
    }
  }, [feestructure, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const feestructureData = {
        classListId: values.classListId,
        feeTypeCode: values.feeTypeCode,
        accountId: values.accountId,
        feeAmount: values.feeAmount,
        branch_id: selectedBranchId,
      };

      if (feestructure) {
        await dispatch(updateFeeStructure(feestructure.id, feestructureData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createFeeStructure(feestructureData));
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
      title={feestructure ? 'Edit FeeStructure' : 'Create FeeStructure'}
      visible={visible}
      footer={[
        <div key="1" className="feestructure-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {feestructure ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="feestructure-modal">
        <BasicFormWrapper>
          <Form form={form} name="createFeeStructure" layout="vertical">
            <Row gutter={16}>
              <Col className="mt-2" span={12}>
                <Form.Item name="classListId" label="Class Name">
                  <Select placeholder="Select Class Name">
                    {classLists?.map((classlists) => (
                      <Select.Option key={classlists._id} value={classlists._id}>
                        {classlists.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col className="mt-2" span={12}>
                <Form.Item name="feeTypeCode" label="Fee Type">
                  <Select placeholder="Select Fee Type">
                    {feeHeads?.map((fee) => (
                      <Select.Option key={fee.code} value={fee.code}>
                        {fee.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col className="mt-2" span={12}>
                <Form.Item name="accountId" label="Account Name">
                  <Select placeholder="Enter Account Name">
                    {accounts?.map((acc) => (
                      <Select.Option key={acc._id} value={acc._id}>
                        {acc.accountName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col className="mt-2" span={12}>
                <Form.Item name="feeAmount" label="Fee Amount">
                  <Input placeholder="Enter Fee Amount" type="number" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateFeeStructure.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  feestructure: propTypes.object,
  onSuccess: propTypes.func,
};

CreateFeeStructure.defaultProps = {
  feestructure: null,
};

export default CreateFeeStructure;
