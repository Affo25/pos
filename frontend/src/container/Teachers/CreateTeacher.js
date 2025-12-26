/* eslint-disable no-unused-vars */
   import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createTeacher, fetchAllTeachers, updateTeacher } from '../../redux/teachers/teacherSlice';
import { BasicFormWrapper } from '../../config/default/styled';

function CreateTeacher({ visible, onCancel, teacher, onSuccess}) {
    const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (teacher) {
        form.setFieldsValue({
          name: teacher.name,
          email: teacher.email,
          age: teacher.age,
          number: teacher.number
        });
      }
    }
  }, [teacher, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const teacherData = {
        name: values.name,
        email: values.email,
        age: values.age,
        number: values.number,
        branch_id: selectedBranchId
      };

      if (teacher) {
        await dispatch(updateTeacher(teacher.id, teacherData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createTeacher(teacherData));
        toast.success('Created successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      }

      await dispatch(fetchAllTeachers());
      resetForm();
      onCancel();
      onSuccess();
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
      title={teacher ? 'Edit Teacher' : 'Create Teacher'}
      visible={visible}
      footer={[
        <div key="1" className="teacher-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {teacher ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="teacher-modal">
        <BasicFormWrapper>
          <Form form={form} name="createTeacher" layout="vertical">
            <Row gutter={16}>
              
              <Col span={12}>
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter Name"  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                  <Input placeholder="Enter Email"  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="age" label="Age" rules={[{ required: true }]}>
                  <Input placeholder="Enter Age" type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
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

CreateTeacher.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  teacher: propTypes.object,
  onSuccess: propTypes.func,
};

CreateTeacher.defaultProps = {
  teacher: null,
};

export default CreateTeacher;