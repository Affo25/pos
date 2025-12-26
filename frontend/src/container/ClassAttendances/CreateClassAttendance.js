/* eslint-disable no-unused-vars */
   import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createClassAttendance, updateClassAttendance } from '../../redux/classattendances/classattendanceSlice';
import { BasicFormWrapper } from '../../config/default/styled';

function CreateClassAttendance({ visible, onCancel, classattendance, onSuccess }) {
const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (classattendance) {
        form.setFieldsValue({
          name: classattendance.name,
          email: classattendance.email,
          age: classattendance.age,
          number: classattendance.number,
        });
      }
    }
  }, [classattendance, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const classattendanceData = {
        name: values.name,
        email: values.email,
        age: values.age,
        number: values.number,
         branch_id: selectedBranchId,
      };

      if (classattendance) {
        await dispatch(updateClassAttendance(classattendance.id, classattendanceData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createClassAttendance(classattendanceData));
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
      title={classattendance ? 'Edit ClassAttendance' : 'Create ClassAttendance'}
      visible={visible}
      footer={[
        <div key="1" className="classattendance-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {classattendance ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="classattendance-modal">
        <BasicFormWrapper>
          <Form form={form} name="createClassAttendance" layout="vertical">
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

CreateClassAttendance.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  classattendance: propTypes.object,
  onSuccess: propTypes.func,
};

CreateClassAttendance.defaultProps = {
  classattendance: null,
};

export default CreateClassAttendance;