/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, DatePicker, Select, Upload } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { toast } from 'react-toastify';
import { EyeOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createTaskManagement, updateTaskManagement } from '../../redux/taskmanagements/taskmanagementSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { fetchAllStaffs } from '../../redux/staffs/staffSlice';
import FileUpload from '../../components/common/fileUpload';

const { Option } = Select;

function CreateTaskManagement({ visible, onCancel, taskmanagement, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const { staffs } = useSelector((state) => state.staffs);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllStaffs(selectedBranchId));
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (visible) {
      resetForm();
      if (taskmanagement) {
        form.setFieldsValue({
          title: taskmanagement.title,
          description: taskmanagement.description,
          periority: taskmanagement.periority,
          assignedTo: taskmanagement.assignedTo,
          assignedDate: taskmanagement.assignedDate ? moment(taskmanagement.assignedDate) : null,
          endDate: taskmanagement.endDate ? moment(taskmanagement.endDate) : null,
          status: taskmanagement.status,
          taskImage: taskmanagement.taskImage
            ? taskmanagement.taskImage.a((file, index) => ({
              uid: index.toString(),
              name: file.split('/').pop(),
              status: 'done',
              url: `${process.env.REACT_APP_API_URL}${file}`,
            }))
            : [],

        });
      }
    }
  }, [taskmanagement, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const taskmanagementData = {
        title: values.title,
        description: values.description,
        periority: values.periority,
        assignedTo: values.assignedTo,
        assignedDate: values.assignedDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        status: values.status,
        branch_id: selectedBranchId,
      };

      if (values.taskImage && values.taskImage.length > 0) {
        const file = values.taskImage[0].originFileObj;
        taskmanagementData.taskImage = file;
      }

      if (taskmanagement) {
        await dispatch(updateTaskManagement(taskmanagement.id, taskmanagementData));
        toast.success('Updated successfully 🎉', { position: 'top-right', autoClose: 3000 });
      } else {
        await dispatch(createTaskManagement(taskmanagementData));
        toast.success('Created successfully 🎉', { position: 'top-right', autoClose: 3000 });
      }

      onSuccess();
      resetForm();
      onCancel();
    } catch (error) {
      console.error('Error:', error);
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
      title={taskmanagement ? 'Edit Task Management' : 'Create Task Management'}
      visible={visible}
      footer={[
        <div key="1" className="taskmanagement-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {taskmanagement ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="taskmanagement-modal">
        <BasicFormWrapper>
          <Form form={form} name="createTaskManagement" layout="vertical">
            <Row gutter={16}>
              <Col span={12} className="mt-2">
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                  <Input placeholder="Enter Task Title" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="periority" label="Priority">
                  <Select placeholder="Select Priority">
                    <Option value="low">Low</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="high">High</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24} className="mt-2">
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} placeholder="Enter Task Description" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="assignedTo" label="Assigned To">
                  <Select placeholder="Select Staff">
                    {staffs?.map((staf) => (
                      <Select.Option key={staf.code} value={staf.code}>
                        {staf.name} ({staf.code})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="status" label="Status">
                  <Select placeholder="Select Status">
                    <Option value="assigned">Assigned</Option>
                    <Option value="in-progress">In Progress</Option>
                    <Option value="review">Review</Option>
                    <Option value="completed">Approved</Option>

                  </Select>
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="assignedDate" label="Assigned Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={24} className="mt-2">
                <Form.Item
                  name="taskImage"
                  label="Task File"
                  valuePropName="value"
                  getValueFromEvent={(e) => e}
                >
                  <FileUpload maxCount={1} buttonText="Upload Task File" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal >
  );
}

CreateTaskManagement.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  taskmanagement: propTypes.object,
  onSuccess: propTypes.func,
};

CreateTaskManagement.defaultProps = {
  taskmanagement: null,
};

export default CreateTaskManagement;
