import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Spin, Alert, Typography } from 'antd';
import { WhatsAppOutlined, LinkOutlined } from '@ant-design/icons';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import ModernModalStyles from '../shared/modalStyles';
import { fetchUserWhatsAppPreview, sendUserWhatsApp } from '../../redux/users/userService';
import { toast } from 'react-toastify';

const { Paragraph } = Typography;

function WhatsAppPreviewBubble({ preview }) {
  return (
    <div
      style={{
        background: '#e7ffdb',
        borderRadius: '12px 12px 12px 4px',
        padding: '14px 16px',
        maxWidth: 420,
        margin: '0 auto',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        whiteSpace: 'pre-wrap',
        fontSize: 14,
        lineHeight: 1.55,
        color: '#111b21',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
      }}
    >
      {preview.messageText}
    </div>
  );
}

function SendUserWhatsAppModal({ visible, userId, userName, onCancel, onSent }) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible || !userId) {
      setPreview(null);
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetchUserWhatsAppPreview(userId)
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load preview');
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
      await sendUserWhatsApp(userId);
      toast.success(`WhatsApp sent to ${preview?.phone || 'user'}`);
      if (onSent) onSent();
      onCancel();
    } catch (err) {
      toast.error(err.message || 'Failed to send WhatsApp');
    } finally {
      setSending(false);
    }
  };

  const canSend =
    preview?.whatsappConfigured &&
    preview?.phoneDigits &&
    preview?.password;

  return (
    <>
      <ModernModalStyles />
      <Modal
        title={
          <span>
            <WhatsAppOutlined style={{ marginRight: 8, color: '#25D366' }} />
            Send welcome WhatsApp
          </span>
        }
        visible={visible}
        onCancel={onCancel}
        width={520}
        className="modern-modal"
        footer={[
          <Button key="cancel" type="white" onClick={onCancel}>
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            loading={sending}
            disabled={loading || !!error || !canSend}
            onClick={handleSend}
            style={canSend ? { background: '#25D366', borderColor: '#25D366' } : undefined}
          >
            Send WhatsApp
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
            {!preview.whatsappConfigured && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="WhatsApp API not configured"
                description="Add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to backend/.env, then restart the server."
              />
            )}

            {!preview.phone && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="No phone number"
                description="Add a WhatsApp number on the user (e.g. +92329852247) before sending."
              />
            )}

            {!preview.password && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="No password stored"
                description="Edit the user and set a password — the same one sent by email."
              />
            )}

            {preview.whatsappConfigured && preview.phone && (
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message={`Sending to ${preview.phone}`}
                description={
                  preview.messageMode === 'template'
                    ? `Template: ${preview.templateName} (Meta-approved). Same credentials as email.`
                    : 'Text mode — works for test numbers or within 24h of user messaging you.'
                }
              />
            )}

            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Message preview
            </p>
            <div style={{ background: '#f0f2f5', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <WhatsAppPreviewBubble preview={preview} />
            </div>

            {preview.appUrl && (
              <Paragraph style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                <LinkOutlined /> App link included: {preview.appUrl}
              </Paragraph>
            )}
          </>
        )}
      </Modal>
    </>
  );
}

SendUserWhatsAppModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  userName: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSent: PropTypes.func,
};

SendUserWhatsAppModal.defaultProps = {
  userId: null,
  userName: '',
  onSent: null,
};

export default SendUserWhatsAppModal;
