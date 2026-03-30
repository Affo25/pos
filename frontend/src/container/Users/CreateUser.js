/* eslint-disable camelcase */
// container/Users/CreateUser.js
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Row, Col, Select, Table, Checkbox, Tabs, Button as AntButton, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { KeyOutlined, ReloadOutlined,  } from '@ant-design/icons';
import { Button } from '../../components/buttons/buttons';
import { Modal } from '../../components/modals/antd-modals';
import { createUser, updateUser } from '../../redux/users/userSlice';
import { allowedPages } from '../../config/data/data';
import { BasicFormWrapper } from '../../config/default/styled';

function CreateUser({ visible, onCancel, user }) {
  const { Option } = Select;
  const { login: loggedInUser } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { TabPane } = Tabs;

  // Ant Design date input expects YYYY-MM-DD strings.
  const toDateInputValue = (dateValue) => {
    if (!dateValue) return null;
    try {
      if (typeof dateValue === 'string') return dateValue.split('T')[0];
      return new Date(dateValue).toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  // Function to generate random license key
  const generateLicenseKey = () => {
    const prefix = 'LIC';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const checksum = Math.floor(Math.random() * 9000 + 1000);
    return `${prefix}-${timestamp}-${random}-${checksum}`;
  };

  // Function to handle generate license key button click
  const handleGenerateLicenseKey = () => {
    const newLicenseKey = generateLicenseKey();
    form.setFieldsValue({ license_key: newLicenseKey });
    toast.success('License key generated successfully!');
  };

  const generatePermissions = () => {
    return allowedPages.map((page, index) => ({
      key: `${index + 1}`,
      component: page.charAt(0).toUpperCase() + page.slice(1),
      allowed: false,
      add: false,
      edit: false,
      delete: false,
    }));
  };

  const [permissionsData, setPermissionsData] = useState(generatePermissions());
  const [checkAll, setCheckAll] = useState(false);

  const handlePermissionChange = (index, type, value) => {
    let updated = permissionsData.map((item, idx) =>
      idx === index
        ? {
          ...item,
          [type]: value,
        }
        : item
    );

    if (type === 'allowed') {
      updated = updated.map((item, idx) =>
        idx === index
          ? {
            ...item,
            allowed: value,
            add: value,
            edit: value,
            delete: value,
          }
          : item
      );
    }

    setPermissionsData(updated);
    setCheckAll(updated.every((item) => item.allowed));
  };

  const handleCheckAllChange = (e) => {
    const { checked } = e.target;
    setCheckAll(checked);

    const updated = permissionsData.map((item) => ({
      ...item,
      allowed: checked,
      add: checked,
      edit: checked,
      delete: checked,
    }));

    setPermissionsData(updated);
  };

  const permissionsColumns = [
    {
      title: (
        <Checkbox
          checked={checkAll}
          onChange={handleCheckAllChange}
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          Check all
        </Checkbox>
      ),
      dataIndex: 'allowed',
      key: 'allowed',
      width: 120,
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
      render: (text) => <span style={{ fontSize: '14px', fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Add',
      dataIndex: 'add',
      key: 'add',
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
    setPermissionsData(generatePermissions());
    setCheckAll(false);
  };

  useEffect(() => {
    if (visible) {
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
        });

        if (user.permissions && Array.isArray(user.permissions)) {
          const updatedPermissions = generatePermissions().map((perm) => {
            const existing = user.permissions.find(
              (p) => p.component.toLowerCase() === perm.component.toLowerCase()
            );
            return existing
              ? {
                ...perm,
                ...existing,
                allowed: true,
              }
              : perm;
          });
          setPermissionsData(updatedPermissions);
          setCheckAll(updatedPermissions.every((p) => p.allowed));
        } else {
          setPermissionsData(generatePermissions());
          setCheckAll(false);
        }
      } else {
        setPermissionsData(generatePermissions());
        setCheckAll(false);
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
      };

      if (user) {
        // Keep current blocked state; updateUser expects `is_blocked`.
        userData.is_blocked = user.is_blocked ?? false;

        const { _id: id } = user;
        if (values.password) {
          userData.password = values.password;
        }
        await dispatch(updateUser(id || user.id, userData));
        toast.success('User updated successfully!');
      } else {
        userData.password = values.password;
        await dispatch(createUser(userData));
        toast.success('User created successfully!');
      }

      onCancel();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  // Custom styles for larger text
  const tabHeaderStyle = {
    fontSize: '16px',
    fontWeight: 600,
  };

  const formLabelStyle = {
    fontSize: '14px',
    fontWeight: 500,
  };

  // Custom header with light blue background
  const customHeader = (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      padding: '16px 24px',
      margin: '-24px -24px 0 -24px',
      borderBottom: '2px solid #91d5ff',
      borderRadius: '8px 8px 0 0'
    }}>
      <div style={{ 
        fontSize: '20px', 
        fontWeight: 700, 
        color: '#0050b3',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>
          {user ? '✏️' : '➕'}
        </span>
        <span style={{color:"white"}}>{user ? 'Edit User' : 'Create New User'}</span>
      </div>
      {/* <AntButton
        type="text"
        icon={<CloseOutlined style={{ fontSize: '18px', color: '#0050b3' }} />}
        onClick={() => {
          resetForm();
          onCancel();
        }}
        style={{ 
          width: '32px', 
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      /> */}
    </div>
  );

  return (
    <Modal
      visible={visible}
      width={1000}
      footer={null}
      closable={false}
      onCancel={() => {
        resetForm();
        onCancel();
      }}
      style={{ top: 20 }}
      bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
      title={null}
    >
      {/* Custom Header */}
      {customHeader}
      
      <div className="page-modal" style={{ marginTop: '24px' }}>
        <BasicFormWrapper>
          <Form 
            form={form} 
            layout="vertical"
            style={{ fontSize: '15px' }}
          >
            <Tabs 
              defaultActiveKey="1"
              size="large"
              tabBarStyle={{ 
                marginBottom: '24px',
                borderBottom: '2px solid #e8e8e8'
              }}
            >
              {/* Basic Information Tab */}
              <TabPane 
                tab={<span style={tabHeaderStyle}>📋 Basic Information</span>} 
                key="1"
              >
                <Row gutter={24}>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="name"
                      label={<span style={formLabelStyle}>Full Name</span>}
                      rules={[{ required: true, message: 'Please enter name' }]}
                    >
                      <Input 
                        placeholder="Enter full name" 
                        size="large"
                        style={{ fontSize: '14px', height: '42px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="email"
                      label={<span style={formLabelStyle}>Email Address</span>}
                      rules={[
                        { required: true, message: 'Please enter email' },
                        { type: 'email', message: 'Invalid email' },
                      ]}
                    >
                      <Input 
                        placeholder="Enter email address" 
                        size="large"
                        style={{ fontSize: '14px', height: '42px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="password"
                      label={<span style={formLabelStyle}>Password</span>}
                      rules={user ? [] : [{ required: true, message: 'Please enter password' }]}
                      extra={user ? "Leave blank to keep current password" : ""}
                    >
                      <Input.Password 
                        placeholder={user ? "Enter new password (optional)" : "Enter password"} 
                        size="large"
                        style={{ fontSize: '14px', height: '42px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="user_type"
                      label={<span style={formLabelStyle}>User Type</span>}
                      rules={[{ required: true, message: 'Please select user type' }]}
                    >
                      <Select 
                        placeholder="Select user type" 
                        size="large"
                        style={{ fontSize: '14px' }}
                      >
                        {getUserTypeOptions().map((type) => (
                          <Option key={type} value={type} style={{ fontSize: '14px' }}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="status"
                      label={<span style={formLabelStyle}>Account Status</span>}
                      rules={[{ required: true, message: 'Please select status' }]}
                    >
                      <Select 
                        placeholder="Select status" 
                        size="large"
                        style={{ fontSize: '14px' }}
                      >
                        <Option value="active" style={{ fontSize: '14px' }}>✅ Active</Option>
                        <Option value="inactive" style={{ fontSize: '14px' }}>⛔ Inactive</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              {/* Permissions Tab */}
              <TabPane 
                tab={<span style={tabHeaderStyle}>🔐 Permissions</span>} 
                key="2"
              >
                <div style={{ 
                  background: '#f0f5ff', 
                  padding: '12px 16px', 
                  borderRadius: '8px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #1890ff'
                }}>
                  <span style={{ fontSize: '14px', color: '#1890ff', fontWeight: 500 }}>
                    💡 Configure access permissions for each module
                  </span>
                </div>
                <Table
                  style={{ marginTop: 8 }}
                  columns={permissionsColumns}
                  dataSource={permissionsData}
                  pagination={false}
                  bordered
                  size="middle"
                />
              </TabPane>

              {/* Subscription & License Tab */}
              <TabPane 
                tab={<span style={tabHeaderStyle}>💳 Subscription & License</span>} 
                key="3"
              >
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  padding: '12px 16px', 
                  borderRadius: '8px',
                  marginBottom: '24px',
                  color: 'white'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    🎯 Manage user subscription and license details
                  </span>
                </div>
                <Row gutter={24}>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="plan"
                      label={<span style={formLabelStyle}>Subscription Plan</span>}
                    >
                      <Select 
                        placeholder="Select plan" 
                        size="large"
                        style={{ fontSize: '14px' }}
                      >
                        <Option value="free" style={{ fontSize: '14px' }}>🆓 Free</Option>
                        <Option value="premium" style={{ fontSize: '14px' }}>⭐ Premium</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="subscription_status"
                      label={<span style={formLabelStyle}>Subscription Status</span>}
                    >
                      <Select 
                        placeholder="Select subscription status" 
                        size="large"
                        style={{ fontSize: '14px' }}
                      >
                        <Option value="active" style={{ fontSize: '14px' }}>🟢 Active</Option>
                        <Option value="expired" style={{ fontSize: '14px' }}>🔴 Expired</Option>
                        <Option value="cancelled" style={{ fontSize: '14px' }}>⚪ Cancelled</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="subscription_start"
                      label={<span style={formLabelStyle}>Subscription Start Date</span>}
                    >
                      <Input 
                        type="date" 
                        placeholder="YYYY-MM-DD" 
                        size="large"
                        style={{ fontSize: '14px', height: '42px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="subscription_end"
                      label={<span style={formLabelStyle}>Subscription End Date</span>}
                    >
                      <Input 
                        type="date" 
                        placeholder="YYYY-MM-DD" 
                        size="large"
                        style={{ fontSize: '14px', height: '42px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24} className="mt-2 pb-0">
                    <Form.Item
                      name="license_key"
                      label={<span style={formLabelStyle}>License Key</span>}
                      extra="Click the generate button to create a unique license key"
                    >
                      <Space.Compact style={{ width: '100%' }}>
                        <Input 
                          placeholder="License key will be generated automatically" 
                          size="large"
                          style={{ fontSize: '14px', height: '42px', fontFamily: 'monospace' }}
                          readOnly
                        />
                        <AntButton 
                          type="primary" 
                          icon={<KeyOutlined />}
                          onClick={handleGenerateLicenseKey}
                          size="large"
                          style={{ height: '42px' }}
                        >
                          Generate
                        </AntButton>
                        <AntButton 
                          icon={<ReloadOutlined />}
                          onClick={() => form.setFieldsValue({ license_key: '' })}
                          size="large"
                          style={{ height: '42px' }}
                        >
                          Clear
                        </AntButton>
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="license_status"
                      label={<span style={formLabelStyle}>License Status</span>}
                    >
                      <Select 
                        placeholder="Select license status" 
                        size="large"
                        style={{ fontSize: '14px' }}
                      >
                        <Option value="active" style={{ fontSize: '14px' }}>✅ Active</Option>
                        <Option value="blocked" style={{ fontSize: '14px' }}>🚫 Blocked</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12} className="mt-2 pb-0">
                    <Form.Item
                      name="allowed_devices"
                      label={<span style={formLabelStyle}>Allowed Devices</span>}
                      extra="Maximum number of devices that can use this account"
                    >
                      <Input 
                        type="number" 
                        min={1} 
                        max={10}
                        placeholder="Number of allowed devices" 
                        size="large"
                        style={{ fontSize: '14px', height: '42px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Form>
        </BasicFormWrapper>
      </div>

      {/* Footer Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '12px',
        padding: '16px 24px',
        margin: '24px -24px -24px -24px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
        borderRadius: '0 0 8px 8px'
      }}>
        <Button 
          size="default" 
          onClick={() => {
            resetForm();
            onCancel();
          }}
          style={{ fontSize: '14px', height: '40px', padding: '0 24px' }}
        >
          Cancel
        </Button>
        <Button 
          size="default" 
          type="primary" 
          onClick={handleOk}
          style={{ fontSize: '14px', fontWeight: 600, height: '40px', padding: '0 32px' }}
        >
          {user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </Modal>
  );
}

CreateUser.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  user: PropTypes.object,
};

CreateUser.defaultProps = {
  user: null,
};

export default CreateUser;