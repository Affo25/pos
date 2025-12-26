/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, DatePicker, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import moment from 'moment';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createNotice, updateNotice } from '../../redux/notices/noticeSlice';
import { BasicFormWrapper } from '../../config/default/styled';

const { Option } = Select;


function CreateNotice({ visible, onCancel, notice, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (notice) {
        form.setFieldsValue({
          message: notice.message,
          periority: notice.periority,
          vFrom: notice.vFrom ? moment(notice.vFrom) : null,
          vTo: notice.vTo ? moment(notice.vTo) : null,
        });
      }
    }
  }, [notice, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const noticeData = {
        message: values.message,
        periority: values.periority,
        vFrom: values.vFrom?.format('YYYY-MM-DD'),
        vTo: values.vTo?.format('YYYY-MM-DD'),
        branch_id: selectedBranchId,
      };

      if (notice) {
        await dispatch(updateNotice(notice.id, noticeData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createNotice(noticeData));
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
      title={notice ? 'Edit Notice' : 'Create Notice'}
      visible={visible}
      footer={[
        <div key="1" className="notice-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {notice ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="notice-modal">
        <BasicFormWrapper>
          <Form form={form} name="createNotice" layout="vertical">
            <Row gutter={16}>
              <Col className="mt-2" span={12}>
                <Form.Item name="message" label="Message" rules={[{ required: true }]}>
                  <Input placeholder="Enter mMssage" />
                </Form.Item>
              </Col>
             <Col span={12} className="mt-2">
                <Form.Item name="periority" label="Priority">
                  <Select placeholder="Select Priority">
                    <Option  value="low">Low</Option>
                    <Option  value="medium">Medium</Option>
                    <Option  value="high">High</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col className="mt-2" span={12}>
                <Form.Item
                  name="vFrom"
                  label="Valid From"
                  rules={[{ required: true, message: 'Please select transaction date!' }]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="Select Date" />
                </Form.Item>
              </Col>
              <Col className="mt-2" span={12}>
                <Form.Item
                  name="vTo"
                  label="Valid To"
                  rules={[{ required: true, message: 'Please select transaction date!' }]}
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

CreateNotice.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  notice: propTypes.object,
  onSuccess: propTypes.func,
};

CreateNotice.defaultProps = {
  notice: null,
};

export default CreateNotice;
