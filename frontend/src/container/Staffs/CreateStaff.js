/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { message, DatePicker, Input, Form, Row, Col, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createStaff, updateStaff } from '../../redux/staffs/staffSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { fetchAllFaculties } from '../../redux/faculties/facultiesSlice';
import { fetchAllDepartments } from '../../redux/departments/departmentSlice';
import { countries, STATUS } from '../../config/data/data';

function CreateStaff({ visible, onCancel, staff, onSuccess }) {
  const { faculties } = useSelector((state) => state.faculties);
  const { departments } = useSelector((state) => state.departments);
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllFaculties(selectedBranchId));
      dispatch(fetchAllDepartments(selectedBranchId));
    }
  }, [dispatch, selectedBranchId]);

  useEffect(() => {
    if (visible) {
      resetForm();
      if (staff) {
        form.setFieldsValue({
          id: staff.id,
          code: staff.code,
          name: staff.name,
          fatherName: staff.fatherName,
          title: staff.title,
          staffType: staff.staffType,
          departmentCode: staff.departmentCode,
          facultyCode: staff.facultyCode,
          jobTitle: staff.jobTitle,
          identityNo: staff.identityNo,
          identityType: staff.identityType,
          gender: staff.gender,
          religion: staff.religion,
          nationality: staff.nationality,
          contactNo: staff.contactNo,
          email: staff.email,
          address: staff.address,
          city: staff.city,
          state: staff.state,
          country: staff.country,
          status: staff.status,
        });
      }
    }
  }, [staff, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const staffData = {
        id: values.id,
        code: values.code,
        name: values.name,
        fatherName: values.fatherName,
        title: values.title,
        staffType: values.staffType,
        departmentCode: values.departmentCode,
        facultyCode: values.facultyCode,
        jobTitle: values.jobTitle,
        identityNo: values.identityNo,
        identityType: values.identityType,
        gender: values.gender,
        religion: values.religion,
        nationality: values.nationality,
        contactNo: values.contactNo,
        email: values.email,
        address: values.address,
        city: values.city,
        state: values.state,
        country: values.country,
        status: values.status,
        branch_id: selectedBranchId,
      };

      if (staff) {
        await dispatch(updateStaff(staff.id, staffData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createStaff(staffData));
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
      title={staff ? 'Edit Staff' : 'Create Staff'}
      visible={visible}
      footer={[
        <div key="1" className="staff-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {staff ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="staff-modal">
        <BasicFormWrapper>
          <Form form={form} name="createStaff" layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                  <Input placeholder="Enter Code" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter Name" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="fatherName" label="Father Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter Father Name" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                  <Input placeholder="Enter Title" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="staffType" label="Staff Type">
                  <Select placeholder="Select Staff Type">
                    <Select.Option value="teacher">Teacher</Select.Option>
                    <Select.Option value="accountant">Accountant</Select.Option>
                    <Select.Option value="admin">Admin</Select.Option>
                    <Select.Option value="peon">Peon</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="departmentCode" label="Departments">
                  <Select placeholder="Select Department">
                    {departments?.map((department) => (
                      <Select.Option key={department.code} value={department.code}>
                        {department.name} ({department.code})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="facultyCode" label="Faculties">
                  <Select placeholder="Select Faculty">
                    {faculties?.map((faculty) => (
                      <Select.Option key={faculty.code} value={faculty.code}>
                        {faculty.name} ({faculty.code})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="jobTitle" label="Job Title" rules={[{ required: true }]}>
                  <Input placeholder="Enter Job Title" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="identityNo" label="Identity No">
                  <Input type='number' placeholder="Enter Identity No" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="identityType" label="Identity Type">
                  <Select placeholder="Select Identity Type">
                    <Select.Option value="cnic">CNIC</Select.Option>
                    <Select.Option value="bform">B-Form</Select.Option>
                    <Select.Option value="passport">Passport</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item name="gender" label="Gender">
                  <Select placeholder="Select Gender" allowClear>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="dob" label="Date of Birth">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="religion" label="Religion">
                  <Select placeholder="Select Religion" allowClear>
                    <Option value="Muslim">Muslim</Option>
                    <Option value="Non-Muslim">Non-Muslim</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="nationality" label="Nationality">
                  <Select
                    placeholder="Select Nationality"
                    showSearch
                    optionFilterProp="value"
                    filterOption={(input, option) => option.value.toLowerCase().includes(input.toLowerCase())}
                  >
                    {countries.map((country) => (
                      <Option key={country.code} value={country.name}>
                        {country.name} ({country.code})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="contactNo" label="Contact No">
                  <Input type='number' placeholder="Enter Contact No" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="email" label="Email">
                  <Input placeholder="Enter Email" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="address" label="Address">
                  <Input placeholder="Enter Address" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="city" label="City">
                  <Input placeholder="Enter City" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="state" label="State">
                  <Input placeholder="Enter State" />
                </Form.Item>
              </Col>

              <Col span={12} className="mt-2">
                <Form.Item name="country" label="Country">
                  <Input placeholder="Enter Country" />
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

CreateStaff.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  staff: propTypes.object,
  onSuccess: propTypes.func,
};

CreateStaff.defaultProps = {
  staff: null,
};

export default CreateStaff;
