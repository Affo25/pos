/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Select,
  Table,
  Checkbox,
  Tabs,
  Button as AntButton,
  Space,
  Divider,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { KeyOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Button } from '../../components/buttons/buttons';
import { Modal } from '../../components/modals/antd-modals';
import { createUser, updateUser } from '../../redux/users/userSlice';
import { allowedPages } from '../../config/data/data';
import { BasicFormWrapper } from '../../config/default/styled';
import ModernModalStyles from '../shared/modalStyles';
import {
  normalizePhone,
  pkPhoneFormRules,
  toPkNationalPart,
  fromPkNationalDigits,
  PK_PHONE_DEFAULT_E164,
} from '../../utils/phoneValidation';

const { Option } = Select;
const { TabPane } = Tabs;

const UserModalForm = styled.div`
  padding: 0;

  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
    font-size: 14px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 8px 8px 0 0;
    border-color: #E5E7EB;
  }

  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
    border-bottom-color: #fff;
  }

  .ant-tabs-content-holder {
    padding-top: 4px;
  }

  .ant-tabs-tabpane {
    padding-top: 6px;
  }

  .ant-form-item {
    margin-bottom: 14px !important;
  }

  .ant-form-item-label > label {
    font-weight: 600;
    color: #374151;
    font-size: 13px;
  }

  .ant-input,
  .ant-input-number,
  .ant-picker,
  .ant-input-affix-wrapper {
    border-radius: 8px !important;
    border-color: #D1D5DB !important;
    &:hover {
      border-color: #9CA3AF !important;
    }
    &:focus,
    &-focused {
      border-color: #EF8354 !important;
      box-shadow: 0 0 0 2px rgba(239, 131, 84, 0.12) !important;
    }
  }

  .ant-select-selector {
    border-radius: 8px !important;
    border-color: #D1D5DB !important;
    &:hover {
      border-color: #9CA3AF !important;
    }
  }

  .ant-select-focused .ant-select-selector {
    border-color: #EF8354 !important;
    box-shadow: 0 0 0 2px rgba(239, 131, 84, 0.12) !important;
  }

  .permissions-table .ant-table-thead > tr > th {
    background: #f9fafb;
    font-weight: 600;
    font-size: 12px;
    color: #64748b;
  }
`;

function CreateUser({ visible, onCancel, user, onSuccess }) {
  const { login: loggedInUser } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const toDateInputValue = (dateValue) => {
    if (!dateValue) return null;
    try {
      if (typeof dateValue === 'string') return dateValue.split('T')[0];
      return new Date(dateValue).toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  const generateLicenseKey = () => {
    const prefix = 'LIC';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const checksum = Math.floor(Math.random() * 9000 + 1000);
    return `${prefix}-${timestamp}-${random}-${checksum}`;
  };

  const handleGenerateLicenseKey = () => {
    const newLicenseKey = generateLicenseKey();
    form.setFieldsValue({ license_key: newLicenseKey });
    toast.success('License key generated');
  };

  const generatePermissions = () =>
    allowedPages.map((page, index) => ({
      key: `${index + 1}`,
      component: page.charAt(0).toUpperCase() + page.slice(1),
      allowed: false,
      add: false,
      edit: false,
      delete: false,
    }));

  const [permissionsData, setPermissionsData] = useState(generatePermissions());
  const [checkAll, setCheckAll] = useState(false);

  const handlePermissionChange = (index, type, value) => {
    let updated = permissionsData.map((item, idx) =>
      idx === index ? { ...item, [type]: value } : item,
    );

    if (type === 'allowed') {
      updated = updated.map((item, idx) =>
        idx === index
          ? { ...item, allowed: value, add: value, edit: value, delete: value }
          : item,
      );
    }

    setPermissionsData(updated);
    setCheckAll(updated.every((item) => item.allowed));
  };

  const handleCheckAllChange = (e) => {
    const { checked } = e.target;
    setCheckAll(checked);
    setPermissionsData(
      permissionsData.map((item) => ({
        ...item,
        allowed: checked,
        add: checked,
        edit: checked,
        delete: checked,
      })),
    );
  };

  const permissionsColumns = [
    {
      title: (
        <Checkbox checked={checkAll} onChange={handleCheckAllChange}>
          All
        </Checkbox>
      ),
      dataIndex: 'allowed',
      key: 'allowed',
      width: 100,
      render: (_, record, index) => (
        <Checkbox
          checked={record.allowed}
          onChange={(e) => handlePermissionChange(index, 'allowed', e.target.checked)}
        />
      ),
    },
    {
      title: 'Component',
      dataIndex: 'component',
      key: 'component',
    },
    {
      title: 'Add',
      dataIndex: 'add',
      key: 'add',
      width: 72,
      align: 'center',
      render: (_, record, index) => (
        <Checkbox
          checked={record.add}
          onChange={(e) => handlePermissionChange(index, 'add', e.target.checked)}
          disabled={!record.allowed}
        />
      ),
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      key: 'edit',
      width: 72,
      align: 'center',
      render: (_, record, index) => (
        <Checkbox
          checked={record.edit}
          onChange={(e) => handlePermissionChange(index, 'edit', e.target.checked)}
          disabled={!record.allowed}
        />
      ),
    },
    {
      title: 'Delete',
      dataIndex: 'delete',
      key: 'delete',
      width: 72,
      align: 'center',
      render: (_, record, index) => (
        <Checkbox
          checked={record.delete}
          onChange={(e) => handlePermissionChange(index, 'delete', e.target.checked)}
          disabled={!record.allowed}
        />
      ),
    },
  ];

  const getUserTypeOptions = () => {
    if (!loggedInUser) return [];
    const { user_type } = loggedInUser;
    if (user_type === 'superAdmin') return ['admin'];
    if (user_type === 'admin') return ['user'];
    return [];
  };

  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({ phone: PK_PHONE_DEFAULT_E164 });
    setPermissionsData(generatePermissions());
    setCheckAll(false);
  };

  useEffect(() => {
    if (!visible) return;

    resetForm();

    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        status: user.status,
        password: user.plain_password,
        plan: user.plan || 'free',
        subscription_status: user.subscription_status || 'active',
        subscription_start: toDateInputValue(user.subscription_start),
        subscription_end: toDateInputValue(user.subscription_end),
        license_key: user.license_key,
        license_status: user.license_status || 'active',
        allowed_devices: user.allowed_devices || 1,
        phone: user.phone ? normalizePhone(user.phone) : '',
        address: user.address || '',
      });

      if (user.permissions && Array.isArray(user.permissions)) {
        const updatedPermissions = generatePermissions().map((perm) => {
          const existing = user.permissions.find(
            (p) => p.component.toLowerCase() === perm.component.toLowerCase(),
          );
          return existing ? { ...perm, ...existing, allowed: true } : perm;
        });
        setPermissionsData(updatedPermissions);
        setCheckAll(updatedPermissions.every((p) => p.allowed));
      }
    }
  }, [user, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const allowedPagesFromPermissions = permissionsData
        .filter((item) => item.allowed)
        .map((item) => item.component.toLowerCase());

      const filteredPermissions = permissionsData
        .filter((item) => item.allowed)
        .map(({ key, component, allowed, add, edit, delete: del }) => ({
          key,
          component,
          allowed,
          add,
          edit,
          delete: del,
        }));

      const userData = {
        name: values.name,
        email: values.email,
        user_type: values.user_type,
        allowed_pages: allowedPagesFromPermissions,
        status: values.status,
        permissions: filteredPermissions,
        plan: values.plan,
        subscription_status: values.subscription_status,
        subscription_start: values.subscription_start,
        subscription_end: values.subscription_end,
        license_key: values.license_key,
        license_status: values.license_status,
        allowed_devices: values.allowed_devices,
        phone: normalizePhone(values.phone),
        address: values.address ? String(values.address).trim() : '',
      };

      if (user) {
        userData.is_blocked = user.is_blocked ?? false;
        const { _id: id } = user;
        if (values.password) {
          userData.password = values.password;
        }
        await dispatch(updateUser(id || user.id, userData));
        toast.success('User updated successfully');
      } else {
        userData.password = values.password;
        await dispatch(createUser(userData));
        toast.success('User created successfully');
      }

      resetForm();
      onCancel();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  return (
    <>
      <ModernModalStyles />
      <Modal
        title={user ? 'Edit user' : 'Create user'}
        visible={visible}
        onCancel={() => {
          resetForm();
          onCancel();
        }}
        width={1000}
        className="modern-modal"
        bodyStyle={{
          maxHeight: '72vh',
          overflowY: 'auto',
        }}
        footer={[
          <Space key="actions" direction="horizontal" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              key="cancel"
              type="white"
              onClick={() => {
                resetForm();
                onCancel();
              }}
            >
              Cancel
            </Button>
            <Button key="save" type="primary" onClick={handleOk}>
              {user ? 'Update' : 'Save'}
            </Button>
          </Space>,
        ]}
      >
        <BasicFormWrapper>
          <UserModalForm>
            <Form
              form={form}
              layout="vertical"
              size="middle"
              initialValues={{
                status: 'active',
                plan: 'free',
                subscription_status: 'active',
                license_status: 'active',
                allowed_devices: 1,
                phone: PK_PHONE_DEFAULT_E164,
              }}
            >
              <Tabs defaultActiveKey="1" type="card">
                <TabPane tab="Basic info" key="1">
                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Full name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                      >
                        <Input placeholder="Enter full name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: 'Please enter email' },
                          { type: 'email', message: 'Invalid email' },
                        ]}
                      >
                        <Input placeholder="Enter email address" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="password"
                        label="Password"
                        rules={user ? [] : [{ required: true, message: 'Please enter password' }]}
                        extra={user ? 'Leave blank to keep current password' : undefined}
                      >
                        <Input.Password placeholder={user ? 'New password (optional)' : 'Enter password'} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="user_type"
                        label="User type"
                        rules={[{ required: true, message: 'Please select user type' }]}
                      >
                        <Select placeholder="Select user type">
                          {getUserTypeOptions().map((type) => (
                            <Option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="status"
                        label="Account status"
                        rules={[{ required: true, message: 'Please select status' }]}
                      >
                        <Select placeholder="Select status">
                          <Option value="active">Active</Option>
                          <Option value="inactive">Inactive</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label="Phone (WhatsApp)"
                        rules={pkPhoneFormRules}
                        extra="Country code +92 is fixed. Enter 10 digits (e.g. 3247890891)."
                        getValueProps={(value) => ({ value: toPkNationalPart(value) })}
                        getValueFromEvent={(e) => {
                          const digits = String(e?.target?.value ?? '').replace(/\D/g, '').slice(0, 10);
                          return digits ? fromPkNationalDigits(digits) : '';
                        }}
                      >
                        <Input
                          addonBefore="+92"
                          placeholder="3247890891"
                          maxLength={10}
                          inputMode="numeric"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="address" label="Address">
                        <Input.TextArea rows={2} placeholder="Street, city, country" maxLength={500} showCount />
                      </Form.Item>
                    </Col>
                  </Row>
                </TabPane>

                <TabPane tab="Permissions" key="2">
                  <Table
                    className="permissions-table"
                    columns={permissionsColumns}
                    dataSource={permissionsData}
                    pagination={false}
                    bordered
                    size="small"
                  />
                </TabPane>

                <TabPane tab="Subscription & license" key="3">
                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="plan" label="Subscription plan">
                        <Select placeholder="Select plan">
                          <Option value="free">Free</Option>
                          <Option value="premium">Premium</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="subscription_status" label="Subscription status">
                        <Select placeholder="Select subscription status">
                          <Option value="active">Active</Option>
                          <Option value="expired">Expired</Option>
                          <Option value="cancelled">Cancelled</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider plain orientation="left" style={{ fontSize: 13, color: '#64748b', margin: '10px 0' }}>
                    Subscription period
                  </Divider>

                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="subscription_start" label="Start date">
                        <Input type="date" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="subscription_end" label="End date">
                        <Input type="date" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider plain orientation="left" style={{ fontSize: 13, color: '#64748b', margin: '10px 0' }}>
                    License
                  </Divider>

                  <Row gutter={[16, 0]}>
                    <Col span={24}>
                      <Form.Item
                        name="license_key"
                        label="License key"
                        extra="Generate a unique key or leave empty"
                      >
                        <Space.Compact style={{ width: '100%' }}>
                          <Input
                            placeholder="License key"
                            style={{ fontFamily: 'ui-monospace, monospace' }}
                          />
                          <AntButton type="primary" icon={<KeyOutlined />} onClick={handleGenerateLicenseKey}>
                            Generate
                          </AntButton>
                          <AntButton icon={<ReloadOutlined />} onClick={() => form.setFieldsValue({ license_key: '' })}>
                            Clear
                          </AntButton>
                        </Space.Compact>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="license_status" label="License status">
                        <Select placeholder="Select license status">
                          <Option value="active">Active</Option>
                          <Option value="blocked">Blocked</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="allowed_devices"
                        label="Allowed devices"
                        extra="Maximum devices for this account"
                      >
                        <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="Devices" />
                      </Form.Item>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </Form>
          </UserModalForm>
        </BasicFormWrapper>
      </Modal>
    </>
  );
}

CreateUser.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  user: PropTypes.object,
  onSuccess: PropTypes.func,
};

CreateUser.defaultProps = {
  user: null,
  onSuccess: null,
};

export default CreateUser;
