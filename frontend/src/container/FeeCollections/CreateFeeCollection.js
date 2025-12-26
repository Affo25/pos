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
import { createFeeCollection, updateFeeCollection } from '../../redux/feecollections/feecollectionSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { fetchAllFeeHeads } from '../../redux/feeheads/feeheadsSlice';
import { fetchAllStudents } from '../../redux/students/studentSlice';

function CreateFeeCollection({ visible, onCancel, feecollection, onSuccess }) {
  const { feeHeads } = useSelector((state) => state.feeHeads);
  const { students } = useSelector((state) => state.students);

  const { selectedBranchId } = useSelector((state) => state.seletedBranch);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };
  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllFeeHeads(selectedBranchId));
      dispatch(fetchAllStudents(selectedBranchId));
    }
  }, [dispatch, selectedBranchId]);

  useEffect(() => {
    if (visible) {
      resetForm();
      if (feecollection) {
        form.setFieldsValue({
          studentId: feecollection.studentId,
          feeHeadCode: feecollection.feeHeadCode,
          amount: feecollection.amount,
          depositDate: feecollection.depositDate ? feecollection.depositDate : null,
          depositedBy: feecollection.depositedBy,
        });
      }
    }
  }, [feecollection, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const feecollectionData = {
        studentId: values.studentId,
        feeHeadCode: values.feeHeadCode,
        amount: values.amount,
        depositDate: values.depositDate ? moment(values.depositDate).format('YYYY-MM-DD') : null,
        depositedBy: values.depositedBy,
        branch_id: selectedBranchId,
      };

      if (feecollection) {
        await dispatch(updateFeeCollection(feecollection.id, feecollectionData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createFeeCollection(feecollectionData));
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
      title={feecollection ? 'Edit FeeCollection' : 'Create FeeCollection'}
      visible={visible}
      footer={[
        <div key="1" className="feecollection-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {feecollection ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="feecollection-modal">
        <BasicFormWrapper>
          <Form form={form} name="createFeeCollection" layout="vertical">
            <Row gutter={16}>
              <Col span={12} className="mt-2">
                <Form.Item name="studentId" label="Student Name">
                  <Select placeholder="Select Student">
                    {students?.map((stu) => (
                      <Select.Option key={stu._id} value={stu._id}>
                        {stu.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="feeHeadCode" label="Fee Head">
                  <Select placeholder="Select Fee Head">
                    {feeHeads?.map((feeh) => (
                      <Select.Option key={feeh.code} value={feeh.code}>
                        {feeh.name} ({feeh.code})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col className="mt-2" span={12}>
                <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                  <Input placeholder="Enter Amount" type="number" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item
                  name="depositDate"
                  label="Deposit Date"
                  rules={[{ required: true, message: 'Please select deposit date' }]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="Select Deposit Date" />
                </Form.Item>
              </Col>

              <Col className="mt-2" span={12}>
                <Form.Item name="depositedBy" label="Deposited By" rules={[{ required: true }]}>
                  <Input placeholder="Enter Depositor Name" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateFeeCollection.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  feecollection: propTypes.object,
  onSuccess: propTypes.func,
};

CreateFeeCollection.defaultProps = {
  feecollection: null,
};

export default CreateFeeCollection;
