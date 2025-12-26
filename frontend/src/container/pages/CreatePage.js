/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Row, Col, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { STATUS_OPTIONS } from '../../config/data/data';
import { createPage, fetchAllPages, updatePage } from '../../redux/pages/pageSlice';
import { BasicFormWrapper } from '../../config/default/styled';

function CreatePage({ visible, onCancel, page }) {
  const [form] = Form.useForm();
  const [pageKey, setPageKey] = useState('');
  const [isUrlManuallyEdited, setIsUrlManuallyEdited] = useState(false);

  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
    setPageKey('');
  };

  useEffect(() => {
    if (visible) {
      resetForm();

      if (page) {
        form.setFieldsValue({
          title: page.title,
          status: page.status,
          data_key: page.data_key,
        });
        const slug = page.title.toLowerCase().replace(/\s+/g, '-');
        setPageKey(`${slug}`);
      } else {
        resetForm();
      }
    }
  }, [page, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const pageData = {
        title: values.title,
        status: values.status,
        data_key: values.data_key,
        page_key: pageKey || values.title.toLowerCase().replace(/\s+/g, '-'),
      };

      if (page) {
        await dispatch(updatePage(page.id, pageData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createPage(pageData));
        toast.success('Created successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      }

      await dispatch(fetchAllPages());
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

  const handleValuesChange = (changedValues) => {
    if (changedValues.title !== undefined) {
      const slug = changedValues.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/^-+|-+$/g, '');

      setPageKey(slug);
      setIsUrlManuallyEdited(false);
    }
  };

  return (
    <Modal
      type="primary"
      title={page ? 'Edit page' : 'Create page'}
      visible={visible}
      footer={[
        <div key="1" className="page-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {page ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="page-modal">
        <BasicFormWrapper>
          <Form form={form} name="createPage" layout="vertical" onValuesChange={handleValuesChange}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="title" label="Page Title" rules={[{ required: true }]}>
                  <Input placeholder="Enter Page Title" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Page Key">
                  <Input
                    value={pageKey}
                    onChange={(e) => {
                      setPageKey(e.target.value);
                      setIsUrlManuallyEdited(true);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12} className="mt-2">
                <Form.Item name="status" label="Status" initialValue="active">
                  <Select>
                    {STATUS_OPTIONS.map((option) => (
                      <Select.Option key={option.key} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2">
                <Form.Item
                  name="data_key"
                  label="Data Key"
                  rules={[
                    { required: true, message: 'Data Key is required' },
                    {
                      pattern: /^[A-Za-z_]+$/,
                      message:
                        'Only letters, numbers, and underscores (_) are allowed. No spaces or other special characters.',
                    },
                  ]}
                >
                  <Input placeholder="Enter Data Key" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreatePage.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  page: propTypes.object,
};

CreatePage.defaultProps = {
  page: null,
};

export default CreatePage;
