import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, useRouteMatch } from 'react-router-dom';
import {
  Button as AntButton,
  Col,
  Modal,
  Row,
  Tag,
  Tooltip,
  Table,
  Space,
  Avatar,
  Typography,
  Progress,
  Spin,
} from 'antd';
import {
  EditOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  SafetyOutlined,
  MobileOutlined,
  CrownOutlined,
  LockOutlined,
  UnlockOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import FeatherIcon from 'feather-icons-react';

import CreateUser from './CreateUser';
import { fetchAllUsers, updateUser } from '../../redux/users/userSlice';
import { Main } from '../../config/default/styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { ProjectHeader } from '../../config/default/style';
import { Button } from '../../components/buttons/buttons';
import { ScreenWrap } from '../shared/procurementScreenStyles';
import ModernModalStyles from '../shared/modalStyles';

const { Text, Title } = Typography;
const msInDay = 24 * 60 * 60 * 1000;
const { confirm } = Modal;

const DetailsWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0;
  border: none;
  background: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #2d3142;
  }
`;

const ProfileHero = styled.div`
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: #fff;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
`;

const ProfileHeroTop = styled.div`
  padding: 28px 28px 24px;
  background: linear-gradient(135deg, #2d3142 0%, #4f5d75 100%);
  color: #fff;
`;

const ProfileHeroBody = styled.div`
  padding: 20px 28px 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  border-top: 1px solid #f1f5f9;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

const HeroStat = styled.div`
  text-align: center;
  padding: 12px 8px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
`;

const HeroStatLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin-bottom: 6px;
`;

const HeroStatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #2d3142;
  font-variant-numeric: tabular-nums;
`;

const Panel = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  height: 100%;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
`;

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 700;
  color: #2d3142;

  .anticon {
    color: #4f5d75;
    font-size: 16px;
  }
`;

const PanelBody = styled.div`
  padding: 18px 20px 20px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const DetailLabel = styled.span`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 13px;
  color: #0f172a;
  font-weight: 600;
  text-align: right;
`;

const AccessPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: ${(p) => (p.$active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)')};
  color: ${(p) => (p.$active ? '#15803d' : '#b91c1c')};
  border: 1px solid ${(p) => (p.$active ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.3)')};
`;

const LicenseCode = styled.code`
  font-size: 12px;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 6px;
  color: #334155;
  font-family: ui-monospace, 'Cascadia Code', monospace;
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
`;

const PermTag = styled(Tag)`
  margin: 0 !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  padding: 2px 10px !important;
`;

function formatDate(dateValue) {
  if (!dateValue) return '—';
  const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatStatusLabel(status) {
  if (!status) return '—';
  const s = String(status);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusPillStyle(status) {
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

function StatusPill({ status }) {
  return (
    <Tag
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: '3px 10px',
        margin: 0,
        borderRadius: 6,
        ...statusPillStyle(status),
      }}
    >
      {formatStatusLabel(status)}
    </Tag>
  );
}

function maskLicenseKey(licenseKey) {
  if (!licenseKey) return '—';
  if (licenseKey.length <= 12) return licenseKey;
  return `${licenseKey.substring(0, 8)}…${licenseKey.substring(licenseKey.length - 4)}`;
}

function getDaysRemaining(endDate) {
  if (!endDate) return '—';
  const diff = new Date(endDate).getTime() - Date.now();
  const days = Math.ceil(diff / msInDay);
  if (days > 30) return `${Math.floor(days / 30)} mo ${days % 30} d`;
  if (days > 0) return `${days} days`;
  return 'Expired';
}

function getProgressPercent(startDate, endDate) {
  if (!endDate || !startDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const total = end - start;
  if (total <= 0) return 0;
  const elapsed = now - start;
  const remaining = end - now;
  const percent = (remaining / total) * 100;
  return Math.min(100, Math.max(0, percent));
}

function UserDetails() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { path } = useRouteMatch();
  const { users, loading } = useSelector((state) => state.users);
  const { id } = useParams();

  const [editVisible, setEditVisible] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

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
    return user.subscription_status === 'active' && subscriptionEnd && subscriptionEnd > now;
  }, [user]);

  const permissionRows = useMemo(() => {
    if (!user?.permissions?.length) return [];
    return user.permissions
      .filter((p) => p.allowed)
      .map((p, i) => ({
        key: p.key || `${p.component}-${i}`,
        component: p.component,
        add: p.add ? 'Yes' : '—',
        edit: p.edit ? 'Yes' : '—',
        delete: p.delete ? 'Yes' : '—',
      }));
  }, [user]);

  const handleSetAccess = async (enabled) => {
    if (!user) return;
    setAccessLoading(true);

    if (enabled) {
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
      dispatch(fetchAllUsers());
      setAccessLoading(false);
      return;
    }

    confirm({
      title: 'Disable user access',
      icon: <ExclamationCircleOutlined style={{ color: '#d97706' }} />,
      content: (
        <div style={{ color: '#475569', fontSize: 14 }}>
          <p style={{ marginBottom: 8 }}>This will:</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Block the account</li>
            <li>Deactivate the license</li>
            <li>Revoke software access immediately</li>
          </ul>
        </div>
      ),
      okText: 'Disable access',
      okType: 'danger',
      cancelText: 'Cancel',
      className: 'modern-modal',
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
        dispatch(fetchAllUsers());
        setAccessLoading(false);
      },
      onCancel() {
        setAccessLoading(false);
      },
    });
  };

  const usersListPath = path.endsWith('/') ? `${path}users` : `${path}/users`;

  if (loading && !user) {
    return (
      <ScreenWrap>
        <Main>
          <EmptyState>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading user…</div>
          </EmptyState>
        </Main>
      </ScreenWrap>
    );
  }

  if (!user) {
    return (
      <ScreenWrap>
        <Main>
          <BackLink type="button" onClick={() => history.push(usersListPath)}>
            <ArrowLeftOutlined /> Back to users
          </BackLink>
          <EmptyState>User not found.</EmptyState>
        </Main>
      </ScreenWrap>
    );
  }

  const daysRemaining = getDaysRemaining(user.subscription_end);
  const progressPercent = getProgressPercent(user.subscription_start, user.subscription_end);
  const isExpired = daysRemaining === 'Expired';
  const planLabel = user.plan === 'premium' ? 'Premium' : 'Free';

  const permColumns = [
    { title: 'Module', dataIndex: 'component', key: 'component', render: (t) => <Text strong>{t}</Text> },
    { title: 'Add', dataIndex: 'add', key: 'add', width: 72, align: 'center' },
    { title: 'Edit', dataIndex: 'edit', key: 'edit', width: 72, align: 'center' },
    { title: 'Delete', dataIndex: 'delete', key: 'delete', width: 72, align: 'center' },
  ];

  return (
    <ScreenWrap>
      <ModernModalStyles />
      <ProjectHeader>
        <PageHeader
          ghost
          title={<span className="page-title">User profile</span>}
          subTitle={
            <span className="page-sub">
              Subscription, license, and permissions for {user.name}
            </span>
          }
          buttons={[
            <Button
              key="edit"
              type="primary"
              size="default"
              onClick={() => setEditVisible(true)}
            >
              <EditOutlined style={{ marginRight: 8 }} />
              Edit user
            </Button>,
          ]}
        />
      </ProjectHeader>

      <Main>
        <DetailsWrap>
          <BackLink type="button" onClick={() => history.push(usersListPath)}>
            <ArrowLeftOutlined /> Back to users
          </BackLink>

          <ProfileHero>
            <ProfileHeroTop>
              <Row gutter={[24, 16]} align="middle">
                <Col flex="none">
                  <Avatar
                    size={72}
                    icon={<UserOutlined />}
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      border: '2px solid rgba(255,255,255,0.25)',
                    }}
                  />
                </Col>
                <Col flex="auto" xs={24} sm={24} md={12}>
                  <Title level={3} style={{ color: '#fff', margin: '0 0 4px', fontWeight: 700 }}>
                    {user.name}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                    <MailOutlined style={{ marginRight: 8 }} />
                    {user.email}
                  </Text>
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Tag
                      style={{
                        margin: 0,
                        borderRadius: 6,
                        fontWeight: 600,
                        background: user.plan === 'premium' ? '#b45309' : 'rgba(255,255,255,0.15)',
                        color: '#fff',
                        border: 'none',
                      }}
                    >
                      {user.plan === 'premium' && <CrownOutlined style={{ marginRight: 4 }} />}
                      {planLabel}
                    </Tag>
                    <Tag
                      style={{
                        margin: 0,
                        borderRadius: 6,
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.12)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {user.user_type || 'user'}
                    </Tag>
                    <StatusPill status={user.status} />
                  </div>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                  <Space direction="vertical" align="end" size={12}>
                    <AccessPill $active={accessAllowed}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: accessAllowed ? '#22c55e' : '#ef4444',
                        }}
                      />
                      {accessAllowed ? 'Access active' : 'Access disabled'}
                    </AccessPill>
                    <AntButton
                      type={accessAllowed ? 'default' : 'primary'}
                      danger={accessAllowed}
                      icon={accessAllowed ? <LockOutlined /> : <UnlockOutlined />}
                      loading={accessLoading}
                      onClick={() => handleSetAccess(!accessAllowed)}
                      style={{ borderRadius: 8, fontWeight: 600 }}
                    >
                      {accessAllowed ? 'Disable access' : 'Enable access'}
                    </AntButton>
                  </Space>
                </Col>
              </Row>
            </ProfileHeroTop>
            <ProfileHeroBody>
              <HeroStat>
                <HeroStatLabel>Plan</HeroStatLabel>
                <HeroStatValue>{planLabel}</HeroStatValue>
              </HeroStat>
              <HeroStat>
                <HeroStatLabel>Allowed devices</HeroStatLabel>
                <HeroStatValue>{user.allowed_devices ?? 1}</HeroStatValue>
              </HeroStat>
              <HeroStat>
                <HeroStatLabel>Time remaining</HeroStatLabel>
                <HeroStatValue style={{ color: isExpired ? '#dc2626' : '#059669' }}>
                  {daysRemaining}
                </HeroStatValue>
              </HeroStat>
            </ProfileHeroBody>
          </ProfileHero>

          <div className="kpi-row" style={{ marginBottom: 20 }}>
            <div className="kpi-tile">
              <div className="kpi-label">
                <CalendarOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                Subscription
              </div>
              <div className="kpi-value">
                <StatusPill status={user.subscription_status} />
              </div>
              <div className="kpi-hint">{formatDate(user.subscription_start)} – {formatDate(user.subscription_end)}</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-label">
                <KeyOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                License
              </div>
              <div className="kpi-value" style={{ fontSize: 16 }}>
                <StatusPill status={user.license_status} />
              </div>
              <div className="kpi-hint">
                <Tooltip title={user.license_key}>
                  <LicenseCode>{maskLicenseKey(user.license_key)}</LicenseCode>
                </Tooltip>
              </div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-label">
                <SafetyOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                Permissions
              </div>
              <div className="kpi-value">{permissionRows.length}</div>
              <div className="kpi-hint">Modules with access</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-label">
                <MobileOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                Account
              </div>
              <div className="kpi-value" style={{ fontSize: 16 }}>
                {user.is_blocked ? (
                  <span style={{ color: '#dc2626' }}>Blocked</span>
                ) : (
                  <span style={{ color: '#059669' }}>Active</span>
                )}
              </div>
              <div className="kpi-hint">Login eligibility</div>
            </div>
          </div>

          <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
            <Col xs={24} lg={12}>
              <Panel>
                <PanelHead>
                  <CalendarOutlined />
                  Subscription
                </PanelHead>
                <PanelBody>
                  <DetailRow>
                    <DetailLabel>Status</DetailLabel>
                    <DetailValue>
                      <StatusPill status={user.subscription_status} />
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Start date</DetailLabel>
                    <DetailValue>{formatDate(user.subscription_start)}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>End date</DetailLabel>
                    <DetailValue>{formatDate(user.subscription_end)}</DetailValue>
                  </DetailRow>
                  {user.plan === 'premium' && user.subscription_end && (
                    <div style={{ marginTop: 14 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                          fontSize: 12,
                          color: '#64748b',
                        }}
                      >
                        <span>Period remaining</span>
                        <span style={{ fontWeight: 600 }}>{Math.round(progressPercent)}%</span>
                      </div>
                      <Progress
                        percent={Math.round(progressPercent)}
                        showInfo={false}
                        strokeColor={isExpired ? '#ef4444' : '#2d3142'}
                        trailColor="#e5e7eb"
                        size="small"
                      />
                    </div>
                  )}
                </PanelBody>
              </Panel>
            </Col>
            <Col xs={24} lg={12}>
              <Panel>
                <PanelHead>
                  <SafetyOutlined />
                  License & security
                </PanelHead>
                <PanelBody>
                  <DetailRow>
                    <DetailLabel>License status</DetailLabel>
                    <DetailValue>
                      <StatusPill status={user.license_status} />
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>License key</DetailLabel>
                    <DetailValue>
                      <Tooltip title={user.license_key || 'No key assigned'}>
                        <LicenseCode>{maskLicenseKey(user.license_key)}</LicenseCode>
                      </Tooltip>
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Account blocked</DetailLabel>
                    <DetailValue>{user.is_blocked ? 'Yes' : 'No'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Max devices</DetailLabel>
                    <DetailValue>{user.allowed_devices ?? 1}</DetailValue>
                  </DetailRow>
                </PanelBody>
              </Panel>
            </Col>
          </Row>

          <Row gutter={[20, 20]}>
            <Col xs={24} lg={14}>
              <Panel>
                <PanelHead>
                  <SafetyOutlined />
                  Module permissions
                </PanelHead>
                <PanelBody style={{ padding: permissionRows.length ? '0' : undefined }}>
                  {permissionRows.length > 0 ? (
                    <Table
                      columns={permColumns}
                      dataSource={permissionRows}
                      pagination={false}
                      size="small"
                      bordered={false}
                    />
                  ) : (
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      No granular permissions configured.
                    </Text>
                  )}
                </PanelBody>
              </Panel>
            </Col>
            <Col xs={24} lg={10}>
              <Panel>
                <PanelHead>
                  <FeatherIcon icon="layout" size={16} />
                  Allowed pages
                </PanelHead>
                <PanelBody>
                  {(user.allowed_pages || []).length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {user.allowed_pages.map((p) => (
                        <PermTag key={p} color="processing">
                          {p}
                        </PermTag>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      No pages assigned.
                    </Text>
                  )}
                </PanelBody>
              </Panel>
            </Col>
          </Row>
        </DetailsWrap>

        <CreateUser
          visible={editVisible}
          onCancel={() => setEditVisible(false)}
          user={user}
          onSuccess={() => {
            dispatch(fetchAllUsers());
            setEditVisible(false);
          }}
        />
      </Main>
    </ScreenWrap>
  );
}

export default UserDetails;
