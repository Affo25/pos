/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Select, Tag, Badge, Tooltip, Input } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { useHistory, useRouteMatch } from 'react-router-dom';
import CreateUser from './CreateUser';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteUser, fetchAllUsers } from '../../redux/users/userSlice';
import ProjectLists from '../../config/default/List';
import { getComponentPermissions } from '../../config/utils/permission';
import { ScreenWrap } from '../shared/procurementScreenStyles';

function Users() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);
  const { login: loggedInUser } = useSelector((state) => state.auth);
  const history = useHistory();
  const { path } = useRouteMatch();
  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    selectedUser: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterSubscriptionStatus, setFilterSubscriptionStatus] = useState('all');

  const { visible, selectedUser } = state;

  const handleEdit = (user) => {
    const { _id: id } = user;
    setState({
      ...state,
      visible: true,
      selectedUser: {
        ...user,
        id: id || user.id,
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteUser(id));
      toast.success('User deleted successfully 🎉');
      dispatch(fetchAllUsers());
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedUser: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedUser: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'success', icon: <CheckCircleOutlined />, text: 'Active' },
      inactive: { color: 'error', icon: <CloseCircleOutlined />, text: 'Inactive' },
      expired: { color: 'warning', icon: <CloseCircleOutlined />, text: 'Expired' },
      cancelled: { color: 'default', icon: <CloseCircleOutlined />, text: 'Cancelled' },
      blocked: { color: 'error', icon: <CloseCircleOutlined />, text: 'Blocked' },
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Badge status={config.color} text={config.text} />;
  };

  // Helper function to get plan badge
 // Helper function to get plan badge
const getPlanBadge = (plan) => {
  if (plan === 'premium') {
    return <Tag color="gold" style={{ color: 'green', fontWeight: 'bold' }} icon={<span role="img" aria-label="premium">⭐</span>}>Premium</Tag>;
  }
  return <Tag style={{ color: 'orange', fontWeight: 'bold' }} color="default">Free</Tag>;
};
  useEffect(() => {
    if (users && Array.isArray(users)) {
      const roleHierarchy = ['superAdmin', 'admin', 'modertor', 'client', 'user'];
      const loggedInIndex = roleHierarchy.indexOf(loggedInUser?.user_type);
      let filtered = users.filter((item) => {
        const itemIndex = roleHierarchy.indexOf(item.user_type);
        return itemIndex > loggedInIndex;
      });

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.license_key && item.license_key.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Apply status filter
      if (sortStatus !== 'all') {
        filtered = filtered.filter((item) => item.status.toLowerCase() === sortStatus.toLowerCase());
      }

      // Apply plan filter
      if (filterPlan !== 'all') {
        filtered = filtered.filter((item) => (item.plan || 'free') === filterPlan);
      }

      // Apply subscription status filter
      if (filterSubscriptionStatus !== 'all') {
        filtered = filtered.filter((item) => (item.subscription_status || 'active') === filterSubscriptionStatus);
      }

      filtered.sort((a, b) => {
        if (searchTerm) {
          if (a.name.toLowerCase().includes(searchTerm.toLowerCase())) return -1;
          if (b.name.toLowerCase().includes(searchTerm.toLowerCase())) return 1;
        }
        return 0;
      });

      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filtered.slice(start, end);

      const formatted = paginatedData.map((user, index) => {
        const {
          _id,
          id,
          name,
          email,
          status,
          user_type: userType,
          plan = 'free',
          subscription_status: subscriptionStatus = 'active',
          subscription_start: subscriptionStart,
          subscription_end: subscriptionEnd,
          license_key: licenseKey,
          license_status: licenseStatus = 'active',
          allowed_devices: allowedDevices = 1,
          is_blocked: isBlocked,
          permissions,
          allowed_pages: allowedPages,
        } = user;

        return {
          key: _id || id,
          index: start + index + 1,
          id: _id || id,
          name,
          email,
          user_type: userType,
          status,
          plan,
          subscription_status: subscriptionStatus,
          subscription_start: subscriptionStart,
          subscription_end: subscriptionEnd,
          subscription_dates: (
            <Tooltip title={`Start: ${formatDate(subscriptionStart)} | End: ${formatDate(subscriptionEnd)}`}>
              <span style={{ fontSize: '12px' }}>
                {formatDate(subscriptionStart)} - {formatDate(subscriptionEnd)}
              </span>
            </Tooltip>
          ),
          license_key: licenseKey,
          license_status: licenseStatus,
          allowed_devices: allowedDevices,
          is_blocked: isBlocked,
          permissions,
          allowed_pages: allowedPages,
          action: (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <button type="button" onClick={() => handleEdit(user)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#2D3142' }} title="Edit"><EditOutlined style={{ fontSize: 14 }} /></button>
              <button type="button" onClick={() => history.push(`${path}/${_id || id}`)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#2D3142' }} title="Details"><EditOutlined style={{ fontSize: 14 }} /></button>
              <button type="button" onClick={() => handleDelete(_id || id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #FEE2E2', background: '#FEF2F2', cursor: 'pointer', color: '#EF4444' }} title="Delete"><DeleteOutlined style={{ fontSize: 14 }} /></button>
            </div>
          ),
        };
      });
      setDataSource(formatted);
    }
  }, [users, pagination, searchTerm, sortStatus, filterPlan, filterSubscriptionStatus, loggedInUser]);

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      fixed: 'left',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'User Type',
      dataIndex: 'user_type',
      key: 'user_type',
      width: 120,
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
      ],
      onFilter: (value, record) => record.user_type === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value) => getStatusBadge(value),
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      width: 100,
      render: (value) => getPlanBadge(value),
    },
    {
      title: 'Subscription',
      dataIndex: 'subscription_status',
      key: 'subscription_status',
      width: 120,
      render: (value) => getStatusBadge(value),
    },
    {
      title: 'Subscription Dates',
      dataIndex: 'subscription_dates',
      key: 'subscription_dates',
      width: 180,
    },
    {
      title: 'License Key',
      dataIndex: 'license_key',
      key: 'license_key',
      width: 150,
      render: (value) =>
        value ? (
          <Tooltip title={value}>
            <span
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                background: '#f5f5f5',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {value.substring(0, 8)}...
            </span>
          </Tooltip>
        ) : (
          'N/A'
        ),
    },
    {
      title: 'License Status',
      dataIndex: 'license_status',
      key: 'license_status',
      width: 120,
      render: (value) =>
        value === 'active' ? <Tag color="success">Active</Tag> : <Tag color="error">Blocked</Tag>,
    },
    {
      title: 'Allowed Devices',
      dataIndex: 'allowed_devices',
      key: 'allowed_devices',
      width: 120,
      align: 'center',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      fixed: 'right',
    },
  ];

  return (
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title="Users"
          subTitle={<>{loading ? 'Loading...' : `${dataSource?.length || 0} Running Users`}</>}
          buttons={[
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create User
            </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <div className="table-shell">
              <div className="table-toolbar">
                <div className="table-toolbar__search">
                  <Input
                    prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
                    placeholder="Search by name, email or license key"
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="table-toolbar__filters">
                  <span className="table-toolbar__label">Status</span>
                  <Select defaultValue="all" onChange={setSortStatus} style={{ minWidth: 120 }}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                  </Select>
                  <span className="table-toolbar__label">Plan</span>
                  <Select defaultValue="all" onChange={setFilterPlan} style={{ minWidth: 120 }}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="free">Free</Select.Option>
                    <Select.Option value="premium">Premium</Select.Option>
                  </Select>
                  <span className="table-toolbar__label">Subscription</span>
                  <Select defaultValue="all" onChange={setFilterSubscriptionStatus} style={{ minWidth: 120 }}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="expired">Expired</Select.Option>
                    <Select.Option value="cancelled">Cancelled</Select.Option>
                  </Select>
                </div>
              </div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                scroll={{ x: 1500 }}
                pagination={{
                  ...pagination,
                  total: users?.length || 0,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
                  onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                  onShowSizeChange: (current, size) => setPagination({ current: 1, pageSize: size }),
                }}
              />
            </div>
          </Col>
        </Row>
        <CreateUser visible={visible} onCancel={onCancel} user={selectedUser} />
      </Main>
    </ScreenWrap>
  );
}

export default Users;