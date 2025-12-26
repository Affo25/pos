/* eslint-disable no-underscore-dangle */
import React, { useEffect } from 'react';
import { Form, Input, Row, Col, message, Card, Select, DatePicker, Tabs, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import GuardiansTab from './GuardiansTab';

import { Button } from '../../components/buttons/buttons';
import { createStudent, updateStudent } from '../../redux/students/studentSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { Main } from '../styled';
import { countries, BLOOD_GROUP } from '../../config/data/data';
import { fetchAllClassTypes } from '../../redux/classtypes/classtypeSlice';

function CreateStudent() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  const { Option } = Select;

  const { students } = useSelector((state) => state.students);
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const { classtypes } = useSelector((state) => state.classtypes);

  const editingStudent = students.find((s) => (s._id || s.id) === id);

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllClassTypes(selectedBranchId));
    }
  }, [dispatch, selectedBranchId]);

  useEffect(() => {
    if (editingStudent) {
      form.setFieldsValue({
        ...editingStudent,
        regDate: editingStudent.regDate ? moment(editingStudent.regDate) : null,
        dob: editingStudent.dob ? moment(editingStudent.dob) : null,
      });
      const siblings = students
        .filter((s) => s.fatherCNIC === editingStudent.fatherCNIC && (s._id || s.id) !== editingStudent._id)
        .map((s) => ({
          name: s.name,
          regNo: s.regNo,
          rollNo: s.rollNo,
          classCode: s.classCode,
        }));

      form.setFieldsValue({
        siblings,
      });
    } else {
      form.resetFields();
    }
  }, [editingStudent, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const studentData = {
        ...values,
        regDate: values.regDate?.toISOString(),
        dob: values.dob?.toISOString(),
        branch_id: selectedBranchId,
      };

      if (id) {
        await dispatch(updateStudent({ id, data: studentData }));
        toast.success('Student updated successfully!');
      } else {
        await dispatch(createStudent(studentData));
        toast.success('Student created successfully!');
      }

      history.push('/students');
    } catch (error) {
      message.error(error.response?.data?.error || error.message || 'Operation failed');
    }
  };

  return (
    <Main style={{ marginTop: '20px' }}>
      <Row gutter={25}>
        <Col xs={24}>
          <BasicFormWrapper>
            <Form form={form} layout="vertical">
              <Card title={id ? 'Edit Student setup' : 'Create Student setup'}>
                <Row gutter={16}>
                  <Form.Item name="guardianId" hidden>
                    <Input type="hidden" />
                  </Form.Item>

                  <Col span={12} className="mt-2">
                    <Form.Item name="name" label="Student Name" rules={[{ required: true }]}>
                      <Input placeholder="Enter Name" />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2">
                    <Form.Item name="fatherName" label="Father's Name" rules={[{ required: true }]}>
                      <Input placeholder="Enter Father's Name" />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2">
                    <Form.Item name="fatherCNIC" label="Father's CNIC" rules={[{ required: true }]}>
                      <Input type='number' placeholder="Enter CNIC" />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2">
                    <Form.Item name="regNo" label="Registration Number" rules={[{ required: true }]}>
                      <Input type='number' placeholder="Enter Registration Number" />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2">
                    <Form.Item name="regDate" label="Registration Date">
                      <DatePicker style={{ width: '100%' }} placeholder="Select Registration Date" />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2">
                    <Form.Item name="rollNo" label="Roll Number" rules={[{ required: true }]}>
                      <Input type='number' placeholder="Enter Roll Number" />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2">
                    <Form.Item name="classCode" label="Class Type" rules={[{ required: true }]}>
                      <Select placeholder="Select Class">
                        {classtypes?.map((classType) => (
                          <Select.Option key={classType.code} value={classType.code}>
                            {classType.name} ({classType.code})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              <Tabs defaultActiveKey="1" className="mt-3">
                <Tabs.TabPane tab="Personal Info" key="1">
                  <Card title="Personal Information">
                    <Row gutter={16}>
                      <Col span={12} className="mt-2">
                        <Form.Item name="gender" label="Gender">
                          <Select placeholder="Select Gender">
                            <Option value="Male">Male</Option>
                            <Option value="Female">Female</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={12} className="mt-2">
                        <Form.Item name="dob" label="Date of Birth">
                          <DatePicker style={{ width: '100%' }} placeholder="mm/dd/yyyy" />
                        </Form.Item>
                      </Col>

                      <Col span={12} className="mt-2">
                        <Form.Item name="birthPlace" label="Birth Place">
                          <Input placeholder="Birth place" />
                        </Form.Item>
                      </Col>

                      <Col span={12} className="mt-2">
                        <Form.Item name="religion" label="religion">
                          <Select placeholder="Select religion">
                            <Option value="Muslim">Muslim</Option>
                            <Option value="Non Muslim">Non Muslim</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={12} className="mt-2">
                        <Form.Item name="nationality" label="Nationality">
                          <Select placeholder="Select Nationality" showSearch optionFilterProp="label" allowClear>
                            {countries.map((country) => (
                              <Option key={country.code} value={country.name} label={country.name}>
                                {country.flag} {country.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={12} className="mt-2">
                        <Form.Item name="bloodGroup" label="Blood Group">
                          <Select>
                            {BLOOD_GROUP.map((option) => (
                              <Select.Option key={option.key} value={option.value}>
                                {option.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={24} className="mt-2">
                        <Form.Item name="streetAddress" label="Street Address">
                          <Input placeholder="Full street Address" />
                        </Form.Item>
                      </Col>

                      <Col span={12} className="mt-2">
                        <Form.Item name="city" label="City">
                          <Input placeholder="City" />
                        </Form.Item>
                      </Col>

                      <Col span={12} className="mt-2">
                        <Form.Item name="state" label="State">
                          <Input placeholder="State" />
                        </Form.Item>
                      </Col>

                      <Col span={12} className="mt-2">
                        <Form.Item name="country" label="Country">
                          <Select placeholder="Select Country" showSearch optionFilterProp="label" allowClear>
                            {countries.map((country) => (
                              <Option key={country.code} value={country.name} label={country.name}>
                                {country.flag} {country.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={12} className="mt-2">
                        <Form.Item name="email" label="Email">
                          <Input placeholder="Email streetAddress" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16} className="mt-2">
                      <Col xs={24}>
                        <p className="mt-3">
                          <b>
                            <u>In Case of Emergency:</u>
                          </b>
                        </p>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="emergencyContactName" label="Name">
                          <Input placeholder="Enter name" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="emergencyContactNo" label="Contact Number">
                          <Input type='number' placeholder="Enter contact number" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Guardians" key="2">
                  <GuardiansTab />
                </Tabs.TabPane>

                <Tabs.TabPane tab="Siblings" key="3">
                  <Card className="mt-3" title="Siblings Information">
                    <Row gutter={16}>
                      {/* <Col span={4}>
                        <Form.Item name="fatherCNIC" label="Father's CNIC">
                          <Input disabled />
                        </Form.Item>
                      </Col> */}

                      <Col className="mt-2" span={24}>
                        <Table
                          dataSource={students.filter(
                            (s) => s.fatherCNIC === form.getFieldValue('fatherCNIC') && (s._id || s.id) !== id,
                          )}
                          rowKey={(record) => record._id || record.id}
                          pagination={false}
                          bordered
                          columns={[
                            {
                              title: 'Name',
                              dataIndex: 'name',
                              key: 'name',
                            },
                            {
                              title: 'Father Name',
                              dataIndex: 'fatherName',
                              key: 'fatherName',
                            },
                            {
                              title: 'Registration No',
                              dataIndex: 'regNo',
                              key: 'regNo',
                            },
                            {
                              title: 'Roll No',
                              dataIndex: 'rollNo',
                              key: 'rollNo',
                            },
                          ]}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Tabs.TabPane>
              </Tabs>

              <Row justify="end" gutter={16} style={{ marginTop: 20 }}>
                <Col>
                  <Button onClick={() => history.push('/students')} type="default">
                    Cancel
                  </Button>
                </Col>
                <Col>
                  <Button onClick={handleSubmit} type="primary">
                    {id ? 'Update' : 'Save'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </BasicFormWrapper>
        </Col>
      </Row>
    </Main>
  );
}

export default CreateStudent;
