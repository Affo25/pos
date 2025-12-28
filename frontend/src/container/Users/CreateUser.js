/* eslint-disable camelcase */
// container/Users/CreateUser.js
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Row, Col, Select, Table, Checkbox } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
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
    { title: 'Component', dataIndex: 'component', key: 'component' },
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
  const resetForm = () => form.resetFields();

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
      };

      if (user) {
        const { _id: id } = user;
        if (values.password) {
          userData.password = values.password;
        }
        await dispatch(updateUser(id || user.id, userData));
      } else {
        userData.password = values.password;
        await dispatch(createUser(userData));
      }

      onCancel();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  return (
    <Modal
      type="primary"
      title={user ? 'Edit User' : 'Create User'}
      visible={visible}
      footer={[
        <div key="1" className="page-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {user ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={() => {
        resetForm();
        onCancel();
      }}
    >
      <div className="page-modal">
        <BasicFormWrapper>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12} className="mt-2 pb-0">
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: 'Please enter name' }]}
                >
                  <Input placeholder="Name" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2 pb-0">
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Invalid email' },
                  ]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2 pb-0">
                <Form.Item
                  name="password"
                  label="Password"
                  rules={user ? [] : [{ required: true, message: 'Please enter password' }]}
                >
                  <Input.Password placeholder="Leave blank to keep current password" />
                </Form.Item>
              </Col>
              <Col span={12} className="mt-2 pb-0">
                <Form.Item
                  name="user_type"
                  label="User Type"
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
              <Col span={12} className="mt-2 pb-0">
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select status">
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {/* Permissions Table */}
          <Table
            style={{ marginTop: 24 }}
            columns={permissionsColumns}
            dataSource={permissionsData}
            pagination={false}
            bordered
            size="small"
          />
        </BasicFormWrapper>
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