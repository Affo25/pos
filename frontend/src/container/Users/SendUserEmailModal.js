import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Spin, Alert, Input, Typography } from 'antd';
import { MailOutlined, LinkOutlined } from '@ant-design/icons';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import ModernModalStyles from '../shared/modalStyles';
import { fetchUserEmailPreview, sendUserEmail } from '../../redux/users/userService';
import { toast } from 'react-toastify';

const { Text, Paragraph } = Typography;

function EmailPreviewCard({ preview }) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
        background: '#fff',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #2D3142 0%, #4F5D75 100%)',
          padding: '20px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)' }}>
          WELCOME
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 700, color: '#fff' }}>
          {preview.appName || 'Inventory Management'}
        </p>
      </div>
      <div style={{ padding: 24 }}>
        <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#0f172a' }}>
          Hello {preview.name || 'there'},
        </p>
        <Paragraph style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14 }}>
          {preview.welcomeMessage}
        </Paragraph>
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
              Login email
            </Text>
            <div style={{ marginTop: 4, fontWeight: 600, color: '#0f172a' }}>{preview.email}</div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
              Password
            </Text>
            <div style={{ marginTop: 4 }}>
              {preview.password ? (
                <Text copyable code style={{ fontSize: 14 }}>
                  {preview.password}
                </Text>
              ) : (
                <Text type="secondary">Set a password in Edit user first</Text>
              )}
            </div>
          </div>
        </div>
        {preview.appUrl ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                background: '#EF8354',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              Open application
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <LinkOutlined /> {preview.appUrl}
              </Text>
            </div>
          </div>
        ) : (
          <Alert type="warning" showIcon message="FRONTEND_URL is not set in backend .env — app link will be omitted from email." />
        )}
        <p style={{ margin: '20px 0 0', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          Keep this email private. Do not share your password.
        </p>
      </div>
    </div>
  );
}

function SendUserEmailModal({ visible, userId, userName, onCancel, onSent }) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (!visible || !userId) {
      setPreview(null);
      setError('');
      setSubject('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetchUserEmailPreview(userId)
      .then((data) => {
        if (!cancelled) {
          setPreview(data);
          setSubject(data.subject || `Welcome — ${data.name || userName || 'User'}`);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load preview');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, userId, userName]);

  const handleSend = async () => {
    if (!userId) return;
    setSending(true);
    try {
      await sendUserEmail(userId, { subject: subject || undefined });
      toast.success(`Welcome email sent to ${preview?.email || 'user'}`);
      if (onSent) onSent();
      onCancel();
    } catch (err) {
      toast.error(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <ModernModalStyles />
      <Modal
        title={
          <span>
            <MailOutlined style={{ marginRight: 8, color: '#EF8354' }} />
            Send welcome email
          </span>
        }
        visible={visible}
        onCancel={onCancel}
        width={560}
        className="modern-modal"
        footer={[
          <Button key="cancel" type="white" onClick={onCancel}>
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            loading={sending}
            disabled={loading || !!error || !preview?.email || !preview?.password}
            onClick={handleSend}
          >
            Send email
          </Button>,
        ]}
      >
        {loading && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Spin />
          </div>
        )}

        {!loading && error && <Alert type="error" showIcon message={error} />}

        {!loading && preview && (
          <>
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message={`Sending to ${preview.email}`}
              description="Only login email, password, app link, and a short welcome message — no license or subscription details."
            />

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Subject</span>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                style={{ marginTop: 6 }}
                prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
              />
            </div>

            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Preview
            </p>
            <EmailPreviewCard preview={preview} />
          </>
        )}
      </Modal>
    </>
  );
}

SendUserEmailModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  userName: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSent: PropTypes.func,
};

SendUserEmailModal.defaultProps = {
  userId: null,
  userName: '',
  onSent: null,
};

export default SendUserEmailModal;
