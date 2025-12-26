/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, Select, DatePicker, Card, Tabs } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';

import SubjectTab from './SubjectTab';
import { Main } from '../styled';
import { Button } from '../../components/buttons/buttons';
import { createClassList, updateClassList } from '../../redux/classLists/classListSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { fetchAllClassTypes } from '../../redux/classtypes/classtypeSlice';

function CreateClassList() {
  const { id } = useParams();
  const { Option } = Select;

  const dispatch = useDispatch();
  const history = useHistory();

  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const { classLists } = useSelector((state) => state.classLists);
  const { classtypes } = useSelector((state) => state.classtypes);

  const editingClassList = id ? classLists.find((c) => (c._id || c.id) === id) : null;

  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllClassTypes(selectedBranchId));
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (editingClassList) {
      form.setFieldsValue({
        code: editingClassList.code,
        name: editingClassList.name,
        classCode: editingClassList.classCode,
        dateFrom: editingClassList.dateFrom ? moment(editingClassList.dateFrom) : null,
        dateTo: editingClassList.dateTo ? moment(editingClassList.dateTo) : null,
        subjectId: editingClassList.subjectId || [],
      });
    } else {
      form.resetFields();
    }
  }, [editingClassList, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        code: values.code,
        name: values.name,
        classCode: values.classCode,
        dateFrom: values.dateFrom?.format('YYYY-MM-DD'),
        dateTo: values.dateTo?.format('YYYY-MM-DD'),
        subjectId: values.subjectId,
        branch_id: selectedBranchId,
      };

      if (editingClassList) {
        await dispatch(updateClassList(editingClassList._id || editingClassList.id, data));
      } else {
        await dispatch(createClassList(data));
      }

      history.push('/classlists');
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
              <Card title={editingClassList ? 'Edit Class List' : 'Create Class List'}>
                <Row gutter={16}>
                  <Form.Item name="subjectId" hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <Col span={8}>
                    <Form.Item
                      name="code"
                      label="Code"
                      rules={[{ required: true, message: 'Please enter code' }]}
                    >
                      <Input placeholder="Enter code" />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      name="name"
                      label="Name"
                      rules={[{ required: true, message: 'Please enter name' }]}
                    >
                      <Input placeholder="Enter name" />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="classCode" label="Class Type" >
                      <Select placeholder="Select Class">
                        {classtypes?.map((classType) => (
                          <Select.Option key={classType.code} value={classType.code}>
                            {classType.name} ({classType.code})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12} className='mt-2'>
                    <Form.Item
                      name="dateFrom"
                      label="Date From"
                      rules={[{ required: true, message: 'Please select start date' }]}
                    >
                      <DatePicker style={{ width: '100%' }} placeholder="mm/dd/yyyy" />
                    </Form.Item>
                  </Col>

                  <Col span={12} className='mt-2'>
                    <Form.Item
                      name="dateTo"
                      label="Date To"
                      rules={[{ required: true, message: 'Please select end date' }]}
                    >
                      <DatePicker style={{ width: '100%' }} placeholder="mm/dd/yyyy" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              <Tabs defaultActiveKey="1" className="mt-3">
                <Tabs.TabPane tab="Subjects" key="2">
                  <SubjectTab form={form} />
                </Tabs.TabPane>

                <Tabs.TabPane tab="Sessions Breakdown" key="3">
                  <Card className="mt-3" title="Sessions Breakdown">
                    <Form.List name="Sessions Breakdown">
                      { }
                    </Form.List>
                  </Card>
                </Tabs.TabPane>
              </Tabs>
              <Row justify="end" gutter={16} style={{ marginTop: 20 }}>
                <Col>
                  <Button onClick={() => history.push('/classlists')} type="default">
                    Cancel
                  </Button>
                </Col>
                <Col>
                  <Button onClick={handleSubmit} type="primary">
                    {editingClassList ? 'Update' : 'Save'}
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

export default CreateClassList;
