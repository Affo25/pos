import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button, Col,  Modal, Row,  Tag, Tooltip, Card,  Badge, Space, Avatar, Typography, Progress } from 'antd';
import { EditOutlined, ExclamationCircleOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, SafetyOutlined, MobileOutlined, CrownOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';

import CreateUser from './CreateUser';
import { fetchAllUsers, updateUser } from '../../redux/users/userSlice';
import { Main } from '../../config/default/styled';
import { PageHeader } from '../../components/page-headers/page-headers';

const { Text, Title } = Typography;
const msInDay = 24 * 60 * 60 * 1000;
const { confirm } = Modal;

function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function maskLicenseKey(licenseKey) {
  if (!licenseKey) return 'N/A';
  if (licenseKey.length <= 12) return licenseKey;
  return `${licenseKey.substring(0, 8)}...${licenseKey.substring(licenseKey.length - 4)}`;
}

function getSubscriptionStatus(status) {
  const statusMap = {
    active: { color: 'success', icon: <CheckCircleOutlined />, label: 'Active' },
    expired: { color: 'warning', icon: <ExclamationCircleOutlined />, label: 'Expired' },
    cancelled: { color: 'error', icon: <CloseCircleOutlined />, label: 'Cancelled' },
  };
  return statusMap[status] || { color: 'default', icon: null, label: status };
}

function getLicenseStatus(status) {
  const statusMap = {
    active: { color: 'success', icon: <CheckCircleOutlined />, label: 'Active' },
    blocked: { color: 'error', icon: <CloseCircleOutlined />, label: 'Blocked' },
  };
  return statusMap[status] || { color: 'default', icon: null, label: status };
}

function getDaysRemaining(endDate) {
  if (!endDate) return 'N/A';
  const diff = new Date(endDate).getTime() - Date.now();
  const days = Math.ceil(diff / msInDay);
  if (days > 30) return `${Math.floor(days / 30)} months ${days % 30} days`;
  if (days > 0) return `${days} days`;
  return 'Expired';
}

function getProgressPercent(endDate) {
  if (!endDate) return 0;
  const start = new Date();
  const end = new Date(endDate);
  const total = 30 * msInDay;
  const remaining = end.getTime() - start.getTime();
  const percent = (remaining / total) * 100;
  return Math.min(100, Math.max(0, percent));
}

function UserDetails() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);
  const { id } = useParams();

  const [editVisible, setEditVisible] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);

  useEffect(() => {
    if (!users || users.length === 0) dispatch(fetchAllUsers());
  }, [dispatch, users]);

  const user = useMemo(() => {
    if (!users || !Array.isArray(users)) return null;
    return users.find((u) => u._id === id || u.id === id) || null;
  }, [users, id]);

  const accessAllowed = useMemo(() => {
    if (!user) return false;
    const now = new Date();
    const subscriptionEnd = user.subscription_end ? new Date(user.subscription_end) : null;
    const baseOk = user.license_status === 'active' && !user.is_blocked;
    if (!baseOk) return false;

    if (user.plan === 'free') return true;

    return (
      user.subscription_status === 'active' &&
      subscriptionEnd &&
      subscriptionEnd > now
    );
  }, [user]);

  const handleSetAccess = async (enabled) => {
    if (!user) return;
    setAccessLoading(true);
    
    if (enabled) {
      // Enable: unblock + activate license + extend subscription
      const now = new Date();
      const subscriptionStart = new Date(now);
      const subscriptionEnd = new Date(now.getTime() + 30 * msInDay);

      const updatedUser = {
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        allowed_pages: user.allowed_pages || [],
        status: user.status,
        permissions: user.permissions || [],
        plan: 'premium',
        subscription_status: 'active',
        subscription_start: subscriptionStart,
        subscription_end: subscriptionEnd,
        license_key: user.license_key,
        license_status: 'active',
        allowed_devices: user.allowed_devices ?? 1,
        is_blocked: false,
      };

      await dispatch(updateUser(user._id, updatedUser));
      setAccessLoading(false);
      return;
    }

    // Disable: show modern confirm dialog
    confirm({
      title: 'Disable User Access',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      content: (
        <div>
          <Text>This action will:</Text>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>Block the user account</li>
            <li>Deactivate the license key</li>
            <li>Revoke software access immediately</li>
          </ul>
        </div>
      ),
      okText: 'Confirm Disable',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        const now = new Date();
        const updatedUser = {
          name: user.name,
          email: user.email,
          user_type: user.user_type,
          allowed_pages: user.allowed_pages || [],
          status: user.status,
          permissions: user.permissions || [],
          plan: 'free',
          subscription_status: 'cancelled',
          subscription_start: now,
          subscription_end: now,
          license_key: user.license_key,
          license_status: 'blocked',
          allowed_devices: user.allowed_devices ?? 1,
          is_blocked: true,
        };

        await dispatch(updateUser(user._id, updatedUser));
        setAccessLoading(false);
      },
      onCancel() {
        setAccessLoading(false);
      },
    });
  };

  if (!user && loading) {
    return (
      <Main>
        <div style={{ padding: 48, textAlign: 'center' }}>
          <Text type="secondary">Loading user details...</Text>
        </div>
      </Main>
    );
  }

  if (!user) {
    return (
      <Main>
        <div style={{ padding: 48, textAlign: 'center' }}>
          <Text type="secondary">User not found.</Text>
        </div>
      </Main>
    );
  }

  const subscriptionStatus = getSubscriptionStatus(user.subscription_status);
  const licenseStatus = getLicenseStatus(user.license_status);
  const daysRemaining = getDaysRemaining(user.subscription_end);
  const progressPercent = getProgressPercent(user.subscription_end);

  return (
    <>
      <PageHeader
        ghost
        title="User Management"
        subTitle={<Text type="secondary">Manage subscription, license and access permissions</Text>}
        buttons={[
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            size="large"
          >
            Edit Profile
          </Button>,
        ]}
      />

      <Main>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Profile Header Card */}
          <Card 
            style={{ 
              marginBottom: 24, 
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              padding: 32,
              borderRadius: '16px 16px 0 0',
              color: 'white'
            }}>
              <Row gutter={24} align="middle">
                <Col>
                  <Avatar 
                    size={80} 
                    icon={<UserOutlined />} 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      border: '3px solid rgba(255,255,255,0.3)'
                    }}
                  />
                </Col>
                <Col flex="auto">
                  <Title level={3} style={{ color: 'white', marginBottom: 4 }}>{user.name}</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{user.email}</Text>
                  <div style={{ marginTop: 12 }}>
                    <Tag icon={<CrownOutlined />} color="gold" style={{ borderRadius: 12 }}>
                      {user.plan?.toUpperCase() || 'FREE'}
                    </Tag>
                    <Tag icon={<UserOutlined />} color="blue" style={{ borderRadius: 12, marginLeft: 8 }}>
                      {user.user_type || 'User'}
                    </Tag>
                  </div>
                </Col>
                <Col>
                  <Space direction="vertical" align="end">
                    <Badge 
                      status={accessAllowed ? 'success' : 'error'} 
                      text={accessAllowed ? 'Access Active' : 'Access Disabled'}
                      style={{ color: 'white' }}
                    />
                    <Button 
                      type={accessAllowed ? 'default' : 'primary'}
                      danger={!accessAllowed}
                      icon={accessAllowed ? <LockOutlined /> : <UnlockOutlined />}
                      loading={accessLoading}
                      onClick={() => handleSetAccess(!accessAllowed)}
                      style={{ 
                        borderRadius: 20,
                        fontWeight: 500
                      }}
                    >
                      {accessAllowed ? 'Disable Access' : 'Enable Access'}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            <div style={{ padding: 24 }}>
              <Row gutter={24}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Subscription Plan</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color={user.plan === 'premium' ? 'gold' : 'blue'} style={{ fontSize: 14, padding: '4px 12px' }}>
                        {user.plan?.toUpperCase() || 'FREE'}
                      </Tag>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Allowed Devices</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 20 }}>{user.allowed_devices ?? 1}</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Days Remaining</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 20, color: daysRemaining.includes('Expired') ? '#ff4d4f' : '#52c41a' }}>
                        {daysRemaining}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          {/* Subscription & License Cards */}
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card 
                title={
                  <Space>
                    <CalendarOutlined />
                    <span>Subscription Details</span>
                  </Space>
                }
                style={{ borderRadius: 12, height: '100%' }}
                headStyle={{ borderBottom: '2px solid #f0f0f0', fontWeight: 600 }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text type="secondary">Status</Text>
                      <Tag color={subscriptionStatus.color} icon={subscriptionStatus.icon}>
                        {subscriptionStatus.label}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text type="secondary">Start Date</Text>
                      <Text strong>{formatDate(user.subscription_start)}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text type="secondary">End Date</Text>
                      <Text strong>{formatDate(user.subscription_end)}</Text>
                    </div>
                    {user.plan === 'premium' && (
                      <div style={{ marginTop: 12 }}>
                        <Progress 
                          percent={Math.round(progressPercent)} 
                          status={progressPercent > 0 ? 'active' : 'exception'}
                          strokeColor="#52c41a"
                        />
                      </div>
                    )}
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card 
                title={
                  <Space>
                    <SafetyOutlined />
                    <span>License Information</span>
                  </Space>
                }
                style={{ borderRadius: 12, height: '100%' }}
                headStyle={{ borderBottom: '2px solid #f0f0f0', fontWeight: 600 }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text type="secondary">License Status</Text>
                      <Tag color={licenseStatus.color} icon={licenseStatus.icon}>
                        {licenseStatus.label}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text type="secondary">License Key</Text>
                      <Tooltip title={user.license_key}>
                        <Text code style={{ fontSize: 12 }}>{maskLicenseKey(user.license_key)}</Text>
                      </Tooltip>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Account Status</Text>
                      <Badge 
                        status={user.is_blocked ? 'error' : 'success'} 
                        text={user.is_blocked ? 'Blocked' : 'Active'}
                      />
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Permissions Section */}
          <Card 
            title={
              <Space>
                <SafetyOutlined />
                <span>User Permissions</span>
              </Space>
            }
            style={{ borderRadius: 12, marginBottom: 24 }}
            headStyle={{ borderBottom: '2px solid #f0f0f0', fontWeight: 600 }}
          >
            {(user.allowed_pages || []).length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.allowed_pages.map((p) => (
                  <Tag key={p} color="blue" style={{ borderRadius: 6, padding: '4px 12px' }}>
                    {p}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">No permissions configured for this user.</Text>
            )}
          </Card>

          {/* Device Management Card */}
          <Card 
            title={
              <Space>
                <MobileOutlined />
                <span>Device Management</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
            headStyle={{ borderBottom: '2px solid #f0f0f0', fontWeight: 600 }}
          >
            <Row gutter={24} align="middle">
              <Col xs={24} md={16}>
                <Text type="secondary">
                  Maximum number of devices that can be simultaneously logged in with this account.
                </Text>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: 24, color: '#1677ff' }}>{user.allowed_devices ?? 1}</Text>
                  <Text type="secondary"> devices</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </div>

        <CreateUser
          visible={editVisible}
          onCancel={() => setEditVisible(false)}
          user={user}
        />
      </Main>
    </>
  );
}

export default UserDetails;