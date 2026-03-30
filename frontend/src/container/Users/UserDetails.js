import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button, Col, Divider, Modal, Row, Switch, Tag, Tooltip } from 'antd';
import { EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import CreateUser from './CreateUser';
import { fetchAllUsers, updateUser } from '../../redux/users/userSlice';
import { Main } from '../../config/default/styled';
import { PageHeader } from '../../components/page-headers/page-headers';

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
  return `${licenseKey.substring(0, 8)}...`;
}

function getSubscriptionTone(status) {
  if (status === 'active') return { bg: '#e6fffb', border: '#87e8de', text: '#006d75', label: 'Active' };
  if (status === 'expired') return { bg: '#fffbe6', border: '#ffe58f', text: '#ad6800', label: 'Expired' };
  return { bg: '#fff1f0', border: '#ffa39e', text: '#a8071a', label: 'Cancelled' };
}

function getLicenseTone(status) {
  if (status === 'active') return { bg: '#f6ffed', border: '#b7eb8f', text: '#237804', label: 'Active' };
  return { bg: '#fff1f0', border: '#ffa39e', text: '#a8071a', label: 'Blocked' };
}

function getDaysRemaining(endDate) {
  if (!endDate) return 'N/A';
  const diff = new Date(endDate).getTime() - Date.now();
  const days = Math.ceil(diff / msInDay);
  return days > 0 ? `${days} days` : 'Expired';
}

function UserDetails() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);
  const { id } = useParams();

  const [editVisible, setEditVisible] = useState(false);

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

    // Premium: require active subscription with a valid end date.
    return (
      user.subscription_status === 'active' &&
      subscriptionEnd &&
      subscriptionEnd > now
    );
  }, [user]);

  const handleSetAccess = async (enabled) => {
    if (!user) return;
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
      return;
    }

    // Disable: show modern confirm dialog, then block account/license on confirm.
    confirm({
      title: 'Block this user account?',
      icon: <ExclamationCircleOutlined />,
      content:
        'This will disable software access by setting blocked account to true and blocking the license.',
      okText: 'Confirm Block',
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
      },
    });
  };

  if (!user && loading) {
    return (
      <Main>
        <div style={{ padding: 24 }}>Loading...</div>
      </Main>
    );
  }

  if (!user) {
    return (
      <Main>
        <div style={{ padding: 24 }}>User not found.</div>
      </Main>
    );
  }

  return (
    <>
      <PageHeader
        ghost
        title="Subscription Settings"
        subTitle={<span>Manage user account access, license, and subscription</span>}
        buttons={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditVisible(true)}
          >
            Edit User
          </Button>,
        ]}
      />

      <Main>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #f0f0f0',
            overflow: 'hidden',
          }}
        >
          <Row gutter={0}>
            <Col xs={24} lg={6} style={{ borderRight: '1px solid #f0f0f0', background: '#fafcff' }}>
              <div style={{ padding: 20, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>USER PROFILE</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
                <div style={{ color: '#595959', marginTop: 2, wordBreak: 'break-word' }}>{user.email}</div>
              </div>

              <div style={{ padding: 14 }}>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    color: '#0050b3',
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Subscription
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 8, color: '#595959' }}>License</div>
                <div style={{ padding: '10px 12px', borderRadius: 8, color: '#595959' }}>Permissions</div>
              </div>
            </Col>

            <Col xs={24} lg={18}>
              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>General Settings</div>
                  <div style={{ color: '#8c8c8c' }}>Manage subscription and access preferences</div>
                </div>

                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col xs={24} md={8}>
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 14 }}>
                      <div style={{ color: '#8c8c8c', fontSize: 12 }}>Plan</div>
                      <div style={{ fontWeight: 700, marginTop: 4, textTransform: 'capitalize' }}>{user.plan}</div>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 14 }}>
                      <div style={{ color: '#8c8c8c', fontSize: 12 }}>Days Remaining</div>
                      <div style={{ fontWeight: 700, marginTop: 4 }}>{getDaysRemaining(user.subscription_end)}</div>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 14 }}>
                      <div style={{ color: '#8c8c8c', fontSize: 12 }}>Allowed Devices</div>
                      <div style={{ fontWeight: 700, marginTop: 4 }}>{user.allowed_devices ?? 1}</div>
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <div
                      style={{
                        border: `1px solid ${getSubscriptionTone(user.subscription_status).border}`,
                        background: getSubscriptionTone(user.subscription_status).bg,
                        borderRadius: 10,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>Subscription Status</div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: getSubscriptionTone(user.subscription_status).text,
                          marginTop: 4,
                        }}
                      >
                        {getSubscriptionTone(user.subscription_status).label}
                      </div>
                      <div style={{ marginTop: 10, color: '#595959' }}>
                        {formatDate(user.subscription_start)} - {formatDate(user.subscription_end)}
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} md={12}>
                    <div
                      style={{
                        border: `1px solid ${getLicenseTone(user.license_status).border}`,
                        background: getLicenseTone(user.license_status).bg,
                        borderRadius: 10,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>License Status</div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: getLicenseTone(user.license_status).text,
                          marginTop: 4,
                        }}
                      >
                        {getLicenseTone(user.license_status).label}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <Tooltip title={user.license_key || 'No license key'}>
                          <span style={{ fontFamily: 'monospace', color: '#595959' }}>
                            Key: {maskLicenseKey(user.license_key)}
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider />

                <Row gutter={16} align="middle">
                  <Col xs={24} md={15}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Software Access</div>
                    <div style={{ color: '#8c8c8c' }}>
                      Turn this on to allow blocked users to access software (auto-activates subscription and license).
                    </div>
                  </Col>
                  <Col xs={24} md={9} style={{ textAlign: 'right' }}>
                    <Tag color={accessAllowed ? 'success' : 'error'} style={{ marginBottom: 10 }}>
                      {accessAllowed ? 'Access Enabled' : 'Access Disabled'}
                    </Tag>
                    <div>
                      <Switch checked={accessAllowed} onChange={(checked) => handleSetAccess(checked)} />
                    </div>
                  </Col>
                </Row>

                <Divider />

                <div style={{ marginBottom: 8, fontWeight: 600 }}>Permissions</div>
                {(user.allowed_pages || []).length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {user.allowed_pages.map((p) => (
                      <Tag key={p}>{p}</Tag>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#8c8c8c' }}>No allowed pages set.</div>
                )}
              </div>
            </Col>
          </Row>
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

