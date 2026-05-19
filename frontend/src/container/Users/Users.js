/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Select, Tag, Tooltip, Input } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  EyeOutlined,
  MailOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { useHistory, useRouteMatch } from 'react-router-dom';
import CreateUser from './CreateUser';
import SendUserEmailModal from './SendUserEmailModal';
import SendUserWhatsAppModal from './SendUserWhatsAppModal';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteUser, fetchAllUsers } from '../../redux/users/userSlice';
import * as userApi from '../../redux/users/userService';
import ProjectLists from '../../config/default/List';
import { ScreenWrap } from '../shared/procurementScreenStyles';
import { getComponentPermissions } from '../../config/utils/permission';
import { useBulkDelete } from '../../hooks/useBulkDelete';
import TableToolbarSearchRow from '../../components/bulk/TableToolbarSearchRow';
import ModernModalStyles from '../shared/modalStyles';

const roleHierarchy = ['superAdmin', 'admin', 'modertor', 'client', 'user'];
const USER_COL_W = 140;

function formatStatusLabel(status) {
  if (!status) return '—';
  const s = String(status);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusTagStyle(status) {
  const statusLower = String(status || '').toLowerCase();
  if (statusLower === 'active') {
    return { background: '#14532d', color: '#f8fafc', border: 'none' };
  }
  if (statusLower === 'inactive' || statusLower === 'blocked') {
    return { background: '#991b1b', color: '#f8fafc', border: 'none' };
  }
  if (statusLower === 'expired') {
    return { background: '#b45309', color: '#f8fafc', border: 'none' };
  }
  if (statusLower === 'cancelled') {
    return { background: '#475569', color: '#f8fafc', border: 'none' };
  }
  return { background: '#475569', color: '#f8fafc', border: 'none' };
}

function Users() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);
  const { login: loggedInUser } = useSelector((state) => state.auth);
  const { canDelete } = getComponentPermissions(loggedInUser, 'Users');
  const history = useHistory();
  const { path } = useRouteMatch();

  const {
    selectedRowKeys,
    bulkDeleting,
    rowSelection,
    handleBulkDelete,
    removeFromSelection,
  } = useBulkDelete({
    deleteOne: userApi.deleteUser,
    onSuccess: () => dispatch(fetchAllUsers()),
    entityName: 'user',
  });

  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    visible: false,
    selectedUser: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterSubscriptionStatus, setFilterSubscriptionStatus] = useState('all');
  const [emailModal, setEmailModal] = useState({ visible: false, userId: null, userName: '' });
  const [whatsappModal, setWhatsappModal] = useState({ visible: false, userId: null, userName: '' });

  const { visible, selectedUser } = state;

  const handleSendEmail = useCallback((user) => {
    const userId = user._id || user.id;
    setEmailModal({
      visible: true,
      userId: String(userId),
      userName: user.name || '',
    });
  }, []);

  const handleSendWhatsApp = useCallback((user) => {
    const userId = user._id || user.id;
    setWhatsappModal({
      visible: true,
      userId: String(userId),
      userName: user.name || '',
    });
  }, []);

  const handleEdit = useCallback((user) => {
    const { _id: id } = user;
    setState({
      visible: true,
      selectedUser: {
        ...user,
        id: id || user.id,
      },
    });
  }, []);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteUser(id));
      toast.success('User deleted successfully');
      dispatch(fetchAllUsers());
      removeFromSelection(id);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const showModal = () => {
    setState({
      visible: true,
      selectedUser: null,
    });
  };

  const onCancel = () => {
    setState({
      visible: false,
      selectedUser: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    const loggedInIndex = roleHierarchy.indexOf(loggedInUser?.user_type);
    let filtered = users.filter((item) => {
      const itemIndex = roleHierarchy.indexOf(item.user_type);
      return itemIndex > loggedInIndex;
    });

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.license_key && item.license_key.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    if (sortStatus !== 'all') {
      filtered = filtered.filter((item) => item.status?.toLowerCase() === sortStatus.toLowerCase());
    }

    if (filterPlan !== 'all') {
      filtered = filtered.filter((item) => (item.plan || 'free') === filterPlan);
    }

    if (filterSubscriptionStatus !== 'all') {
      filtered = filtered.filter(
        (item) => (item.subscription_status || 'active') === filterSubscriptionStatus,
      );
    }

    filtered.sort((a, b) => {
      if (searchTerm) {
        if (a.name?.toLowerCase().includes(searchTerm.toLowerCase())) return -1;
        if (b.name?.toLowerCase().includes(searchTerm.toLowerCase())) return 1;
      }
      return 0;
    });

    return filtered;
  }, [users, searchTerm, sortStatus, filterPlan, filterSubscriptionStatus, loggedInUser]);

  const userStats = useMemo(() => {
    const list = filteredUsers;
    const active = list.filter((u) => u.status === 'active').length;
    const premium = list.filter((u) => u.plan === 'premium').length;
    return { total: list.length, active, premium };
  }, [filteredUsers]);

  useEffect(() => {
    if (!filteredUsers.length) {
      setDataSource([]);
      return;
    }

    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const paginatedData = filteredUsers.slice(start, end);

    const formatted = paginatedData.map((user) => {
      const {
        _id,
        id,
        name,
        email,
        phone,
        status,
        user_type: userType,
        plan = 'free',
        subscription_status: subscriptionStatus = 'active',
        subscription_start: subscriptionStart,
        subscription_end: subscriptionEnd,
        license_key: licenseKey,
        license_status: licenseStatus = 'active',
        allowed_devices: allowedDevices = 1,
      } = user;

      const planLower = String(plan || 'free').toLowerCase();
      const planTagStyle =
        planLower === 'premium'
          ? { background: '#b45309', color: '#f8fafc', border: 'none' }
          : { background: '#e2e8f0', color: '#334155', border: 'none' };

      const userId = _id || id;

      return {
        key: userId,
        id: userId,
        name: <span style={{ fontWeight: 600, color: '#0f172a' }}>{name}</span>,
        email,
        phone: phone || '—',
        user_type: (
          <span style={{ textTransform: 'capitalize', color: '#475569', fontWeight: 500 }}>
            {userType || '—'}
          </span>
        ),
        status: (
          <Tag
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '4px 12px',
              margin: 0,
              borderRadius: 6,
              ...statusTagStyle(status),
            }}
          >
            {formatStatusLabel(status)}
          </Tag>
        ),
        plan: (
          <Tag
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '4px 12px',
              margin: 0,
              borderRadius: 6,
              ...planTagStyle,
            }}
          >
            {planLower === 'premium' ? 'Premium' : 'Free'}
          </Tag>
        ),
        subscription_status: (
          <Tag
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '4px 12px',
              margin: 0,
              borderRadius: 6,
              ...statusTagStyle(subscriptionStatus),
            }}
          >
            {formatStatusLabel(subscriptionStatus)}
          </Tag>
        ),
        subscription_dates: (
          <Tooltip title={`Start: ${formatDate(subscriptionStart)} | End: ${formatDate(subscriptionEnd)}`}>
            <span style={{ fontSize: 12, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
              {formatDate(subscriptionStart)} – {formatDate(subscriptionEnd)}
            </span>
          </Tooltip>
        ),
        license_key: licenseKey ? (
          <Tooltip title={licenseKey}>
            <span
              style={{
                fontSize: 12,
                fontFamily: 'ui-monospace, monospace',
                background: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: 6,
                color: '#334155',
              }}
            >
              {licenseKey.substring(0, 8)}…
            </span>
          </Tooltip>
        ) : (
          '—'
        ),
        license_status: (
          <Tag
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '4px 12px',
              margin: 0,
              borderRadius: 6,
              ...(licenseStatus === 'active'
                ? { background: '#14532d', color: '#f8fafc', border: 'none' }
                : { background: '#991b1b', color: '#f8fafc', border: 'none' }),
            }}
          >
            {licenseStatus === 'active' ? 'Active' : 'Blocked'}
          </Tag>
        ),
        allowed_devices: (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{allowedDevices}</span>
        ),
        action: (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => history.push(`${path}/${userId}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                border: '1px solid #BFDBFE',
                background: '#EFF6FF',
                cursor: 'pointer',
                color: '#1D4ED8',
              }}
              title="View details"
            >
              <EyeOutlined style={{ fontSize: 14 }} />
            </button>
            <button
              type="button"
              onClick={() => handleSendEmail(user)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                border: '1px solid #FDE68A',
                background: '#FFFBEB',
                cursor: 'pointer',
                color: '#B45309',
              }}
              title="Send email"
            >
              <MailOutlined style={{ fontSize: 14 }} />
            </button>
            <button
              type="button"
              onClick={() => handleSendWhatsApp(user)}
              disabled={!phone}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                border: '1px solid #BBF7D0',
                background: phone ? '#F0FDF4' : '#f3f4f6',
                cursor: phone ? 'pointer' : 'not-allowed',
                color: phone ? '#15803D' : '#9ca3af',
              }}
              title={phone ? 'Send WhatsApp' : 'Add phone number to send WhatsApp'}
            >
              <WhatsAppOutlined style={{ fontSize: 14 }} />
            </button>
            <button
              type="button"
              onClick={() => handleEdit(user)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                border: '1px solid #E5E7EB',
                background: '#fff',
                cursor: 'pointer',
                color: '#2D3142',
              }}
              title="Edit"
            >
              <EditOutlined style={{ fontSize: 14 }} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(userId)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                border: '1px solid #FEE2E2',
                background: '#FEF2F2',
                cursor: 'pointer',
                color: '#EF4444',
              }}
              title="Delete"
            >
              <DeleteOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
        ),
      };
    });
    setDataSource(formatted);
  }, [filteredUsers, pagination, handleEdit, handleSendEmail, handleSendWhatsApp, history, path]);

  const handlePageChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  const handleSizeChange = (current, size) => {
    setPagination({
      current: 1,
      pageSize: size,
    });
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 52,
      align: 'center',
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: USER_COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'User type',
      dataIndex: 'user_type',
      key: 'user_type',
      width: 110,
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: USER_COL_W,
      align: 'center',
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      width: 100,
      align: 'center',
    },
    {
      title: 'Subscription',
      dataIndex: 'subscription_status',
      key: 'subscription_status',
      width: USER_COL_W,
      align: 'center',
    },
    {
      title: 'Subscription dates',
      dataIndex: 'subscription_dates',
      key: 'subscription_dates',
      width: 180,
      align: 'center',
    },
    {
      title: 'License key',
      dataIndex: 'license_key',
      key: 'license_key',
      width: 120,
      align: 'center',
    },
    {
      title: 'License',
      dataIndex: 'license_status',
      key: 'license_status',
      width: 100,
      align: 'center',
    },
    {
      title: 'Devices',
      dataIndex: 'allowed_devices',
      key: 'allowed_devices',
      width: 88,
      align: 'center',
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: 204,
      align: 'center',
      fixed: 'right',
    },
  ];

  return (
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title={<span className="page-title">Users</span>}
          subTitle={
            <span className="page-sub">
              {loading ? 'Loading…' : `${filteredUsers.length} users in current view`}
            </span>
          }
          buttons={[
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> New user
            </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <div className="kpi-row">
              <div className="kpi-tile">
                <div className="kpi-label">
                  <TeamOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Total users
                </div>
                <div className="kpi-value">{userStats.total}</div>
                <div className="kpi-hint">Matching filters</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <CheckCircleOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Active
                </div>
                <div className="kpi-value" style={{ color: '#059669' }}>
                  {userStats.active}
                </div>
                <div className="kpi-hint">Account status active</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <CrownOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Premium
                </div>
                <div className="kpi-value" style={{ color: '#d97706' }}>
                  {userStats.premium}
                </div>
                <div className="kpi-hint">Premium plan</div>
              </div>
            </div>

            <div className="table-shell">
              <div className="table-toolbar">
                <TableToolbarSearchRow
                  showBulkDelete={canDelete}
                  bulkCount={selectedRowKeys.length}
                  bulkLoading={bulkDeleting}
                  onBulkDelete={handleBulkDelete}
                >
                  <Input
                    prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
                    placeholder="Search by name, email or license key"
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </TableToolbarSearchRow>
                <div className="table-toolbar__filters">
                  <span className="table-toolbar__label">Status</span>
                  <Select value={sortStatus} onChange={setSortStatus} style={{ minWidth: 120 }}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                  </Select>
                  <span className="table-toolbar__label">Plan</span>
                  <Select value={filterPlan} onChange={setFilterPlan} style={{ minWidth: 120 }}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="free">Free</Select.Option>
                    <Select.Option value="premium">Premium</Select.Option>
                  </Select>
                  <span className="table-toolbar__label">Subscription</span>
                  <Select
                    value={filterSubscriptionStatus}
                    onChange={setFilterSubscriptionStatus}
                    style={{ minWidth: 120 }}
                  >
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
                loading={loading || bulkDeleting}
                total={filteredUsers.length}
                current={pagination.current}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
                size="middle"
                scroll={{ x: 52 + USER_COL_W * 4 + 180 + 120 + 100 + 88 + 204 }}
                tableLayout="fixed"
                rowKey="key"
                rowSelection={canDelete ? rowSelection : undefined}
              />
            </div>
          </Col>
        </Row>
        <ModernModalStyles />
        <CreateUser
          visible={visible}
          onCancel={onCancel}
          user={selectedUser}
          onSuccess={() => dispatch(fetchAllUsers())}
        />
        <SendUserEmailModal
          visible={emailModal.visible}
          userId={emailModal.userId}
          userName={emailModal.userName}
          onCancel={() => setEmailModal({ visible: false, userId: null, userName: '' })}
        />
        <SendUserWhatsAppModal
          visible={whatsappModal.visible}
          userId={whatsappModal.userId}
          userName={whatsappModal.userName}
          onCancel={() => setWhatsappModal({ visible: false, userId: null, userName: '' })}
        />
      </Main>
    </ScreenWrap>
  );
}

export default Users;
