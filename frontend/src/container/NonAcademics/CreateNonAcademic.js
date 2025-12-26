/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, DatePicker, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createNonAcademic, updateNonAcademic } from '../../redux/nonacademics/nonacademicSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { countries, STATUS } from '../../config/data/data';
import { fetchAllDepartments } from '../../redux/departments/departmentSlice';
import { fetchAllFaculties } from '../../redux/faculties/facultiesSlice';

const { Option } = Select;

function CreateNonAcademic({ visible, onCancel, nonacademic, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const { departments } = useSelector((state) => state.departments);
  const { faculties } = useSelector((state) => state.faculties);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };
  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllDepartments(selectedBranchId));
      dispatch(fetchAllFaculties(selectedBranchId));
    }
  }, [dispatch, selectedBranchId]);
  useEffect(() => {
    if (visible) {
      resetForm();
      if (nonacademic) {
        // Setting form values when editing
        form.setFieldsValue({
          code: nonacademic.code,
          name: nonacademic.name,
          fatherName: nonacademic.fatherName,
          departmentId: nonacademic.departmentId,
          facultyId: nonacademic.facultyId,
          jobTitle: nonacademic.jobTitle,
          identityNo: nonacademic.identityNo,
          identityType: nonacademic.identityType,
          gender: nonacademic.gender,
          dob: nonacademic.dob ? moment(nonacademic.dob) : null,

          religion: nonacademic.religion,
          nationality: nonacademic.nationality,
          contactNo: nonacademic.contactNo,
          email: nonacademic.email,
          address: nonacademic.address,
          city: nonacademic.city,
          state: nonacademic.state,
          country: nonacademic.country,
          status: nonacademic.status,
        });
      }
    }
  }, [nonacademic, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const nonacademicData = {
        code: values.code,
        name: values.name,
        fatherName: values.fatherName,
        departmentId: values.departmentId,
        facultyId: values.facultyId,
        jobTitle: values.jobTitle,
        identityNo: values.identityNo,
        identityType: values.identityType,
        gender: values.gender,
        dob: values.dob,
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

      if (nonacademic) {
        await dispatch(updateNonAcademic(nonacademic.id, nonacademicData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createNonAcademic(nonacademicData));
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
      title={nonacademic ? 'Edit NonAcademic' : 'Create NonAcademic'}
      visible={visible}
      footer={[
        <div key="1" className="nonacademic-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {nonacademic ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="nonacademic-modal">
        <BasicFormWrapper>
          <Form form={form} name="createNonAcademic" layout="vertical">
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
                <Form.Item name="departmentId" label="Select Department">
                  <Select placeholder="Select Department">
                    {departments?.map((department) => (
                      <Select.Option key={department.id} value={department.id}>
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
                  <Input type="number" placeholder="Enter Identity No" />
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
                <Form.Item
                  name="dob"
                  label="Date of Birth"
                  rules={[{ required: true, message: 'Please select date of birth!' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Select DOB" />
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
                  <Input placeholder="Enter Contact No" />
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
                  <Select
                    placeholder="Select Country"
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

CreateNonAcademic.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  nonacademic: propTypes.object,
  onSuccess: propTypes.func,
};

CreateNonAcademic.defaultProps = {
  nonacademic: null,
};

export default CreateNonAcademic;
