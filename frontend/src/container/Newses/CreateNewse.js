/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, DatePicker, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createNewse, updateNewse } from '../../redux/newses/newseSlice';
import { BasicFormWrapper } from '../../config/default/styled';

function CreateNewse({ visible, onCancel, newse, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (newse) {
        form.setFieldsValue({
          message: newse.message,
          // vFrom: newse.vFrom,
          // vTo: newse.vTo,
          // number: newse.number,
          vFrom: newse.vFrom ? moment(newse.vFrom) : null,
          vTo: newse.vTo ? moment(newse.vTo) : null,
        });
      }
    }
  }, [newse, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newseData = {
        message: values.message,
        vFrom: values.vFrom?.format('YYYY-MM-DD'),
        vTo: values.vTo?.format('YYYY-MM-DD'),
        branch_id: selectedBranchId,
      };

      if (newse) {
        await dispatch(updateNewse(newse.id, newseData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createNewse(newseData));
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
      title={newse ? 'Edit Newse' : 'Create News'}
      visible={visible}
      footer={[
        <div key="1" className="newse-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {newse ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="newse-modal">
        <BasicFormWrapper>
          <Form form={form} name="createNewse" layout="vertical">
            <Row gutter={16}>
              <Col className="mt-2" span={12}>
                <Form.Item name="message" label="Message" rules={[{ required: true }]}>
                  <Input placeholder="Enter Message" />
                </Form.Item>
              </Col>

              <Col className="mt-2" span={12}>
                <Form.Item
                  name="vFrom"
                  label="Valid From"
                  rules={[{ required: true}]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="Select Date" />
                </Form.Item>
              </Col>
              <Col className="mt-2" span={12}>
                <Form.Item
                  name="vTo"
                  label="Valid To"
                  rules={[{ required: true}]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="Select Date" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateNewse.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  newse: propTypes.object,
  onSuccess: propTypes.func,
};

CreateNewse.defaultProps = {
  newse: null,
};

export default CreateNewse;
