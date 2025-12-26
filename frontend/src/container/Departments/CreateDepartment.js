/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { STATUS } from '../../config/data/data';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createDepartment, updateDepartment } from '../../redux/departments/departmentSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { generateSubjectCode } from '../../config/utils/codeGenerator';

function CreateDepartment({ visible, onCancel, department, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (department) {
        form.setFieldsValue({
          name: department.name,
          code: department.code,
          status: department.status,
        });
      }
    }
  }, [department, form, visible]);
  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setFieldsValue({
      code: generateSubjectCode(name),
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const departmentData = {
        name: values.name,
        code: values.code,
        status: values.status,
        branch_id: selectedBranchId,
      };

      if (department) {
        await dispatch(updateDepartment(department.id, departmentData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createDepartment(departmentData));
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
      title={department ? 'Edit Department' : 'Create Department'}
      visible={visible}
      footer={[
        <div key="1" className="department-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {department ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="department-modal">
        <BasicFormWrapper>
          <Form form={form} name="createDepartment" layout="vertical">
            <Row gutter={16}>
              <Col className="mt-2" span={12}>
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter Name" onChange={handleNameChange} />
                </Form.Item>
              </Col>
              <Col className="mt-2" span={12}>
                <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                  <Input placeholder="Enter Code" />
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

CreateDepartment.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  department: propTypes.object,
  onSuccess: propTypes.func,
};

CreateDepartment.defaultProps = {
  department: null,
};

export default CreateDepartment;
