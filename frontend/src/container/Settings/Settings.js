import React, { useEffect, useState, useCallback } from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Upload,
  message,
  Select,
  Spin,
  Tabs,
} from 'antd';
import FeatherIcon from 'feather-icons-react';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import { PageHeader } from '../../components/page-headers/page-headers';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../styled';
import { API_BASE, API_ORIGIN, responseJson } from '../../config/apiBase';
import { ScreenWrap } from '../shared/procurementScreenStyles';
import styled from 'styled-components';

const API_SETTINGS = `${API_BASE}/settings`;

const TEMPLATE_OPTIONS = [
  { value: 'report_a4', label: 'Full A4 report (green modern)' },
  { value: 'a4_80mm_strip', label: 'A4 page · 80mm left column (pharmacy style)' },
  { value: 'restaurant_80mm', label: '80mm narrow receipt (restaurant / thermal)' },
];

function templateLabel(value) {
  return TEMPLATE_OPTIONS.find((o) => o.value === value)?.label || value;
}

const SettingsPanel = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 24px;
`;

const PreviewShell = styled.div`
  position: sticky;
  top: 16px;
`;

const PreviewFrame = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  padding: 12px;
  overflow: hidden;
`;

const PreviewLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const CompactPreview = styled.div`
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: ${(p) => (p.$narrow ? '10px 10px 12px' : '12px 14px')};
  max-width: ${(p) => (p.$narrow ? '280px' : '100%')};
  margin: 0 auto;
  font-size: 11px;
  line-height: 1.45;
  color: #475569;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);

  .preview-logo {
    max-height: 32px;
    max-width: 120px;
    object-fit: contain;
    display: block;
    margin-bottom: 8px;
  }

  .preview-company {
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.3;
  }

  .preview-tagline {
    font-size: 10px;
    color: #94a3b8;
    margin-bottom: 4px;
  }

  .preview-meta {
    font-size: 10px;
    color: #64748b;
  }

  .preview-divider {
    border-top: 1px dashed #e2e8f0;
    margin: 10px 0;
  }

  .preview-invoice-title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px;
  }

  .preview-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 10px;
    padding: 3px 0;
  }

  .preview-row strong {
    color: #0f172a;
    font-weight: 600;
  }

  .preview-line-item {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    padding: 5px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 10px;

    &:last-of-type {
      border-bottom: none;
    }
  }

  .preview-line-name {
    font-weight: 600;
    color: #334155;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-totals {
    background: #f8fafc;
    border-radius: 6px;
    padding: 8px 10px;
    margin-top: 8px;
  }

  .preview-total-final {
    display: flex;
    justify-content: space-between;
    font-weight: 700;
    font-size: 11px;
    color: #0f172a;
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid #e2e8f0;
  }

  .preview-footer {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px dashed #e2e8f0;
    text-align: center;
    font-size: 9px;
    color: #94a3b8;
  }

  .preview-template-badge {
    font-size: 9px;
    color: #64748b;
    text-align: center;
    margin-bottom: 8px;
    padding: 4px 6px;
    background: #f1f5f9;
    border-radius: 4px;
  }
`;

function InvoicePreviewCompact({ settings, logoUrl, template }) {
  const defaultLogo =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 28'%3E%3Crect width='80' height='28' fill='%232d3142' rx='4'/%3E%3Ctext x='8' y='18' fill='white' font-weight='bold' font-size='11'%3ELOGO%3C/text%3E%3C/svg%3E";

  const narrowReceipt = template === 'restaurant_80mm';
  const subtotal = 250;
  const discount = 10;
  const total = subtotal - discount;

  const lineItems = [
    { name: 'Sample item A', qty: 2, price: 100, total: 200 },
    { name: 'Sample item B', qty: 1, price: 50, total: 50 },
  ];

  return (
    <CompactPreview $narrow={narrowReceipt}>
      <div className="preview-template-badge">{templateLabel(template)}</div>

      <img src={logoUrl || defaultLogo} alt="" className="preview-logo" />

      <div className="preview-company">{settings.companyName || 'Company name'}</div>
      {settings.tagline && <div className="preview-tagline">{settings.tagline}</div>}
      <div className="preview-meta">
        {settings.address && <div>{settings.address}</div>}
        {settings.phone && <div>{settings.phone}</div>}
        {settings.email && <div>{settings.email}</div>}
        {(settings.regNumber || settings.gstin) && (
          <div>
            {settings.regNumber && `Reg: ${settings.regNumber}`}
            {settings.regNumber && settings.gstin && ' · '}
            {settings.gstin && `GSTIN: ${settings.gstin}`}
          </div>
        )}
      </div>

      <div className="preview-divider" />

      <h4 className="preview-invoice-title">Invoice</h4>
      <div className="preview-row">
        <span>No.</span>
        <strong>#INV-PREVIEW</strong>
      </div>
      <div className="preview-row">
        <span>Date</span>
        <strong>{new Date().toLocaleDateString()}</strong>
      </div>
      <div className="preview-row" style={{ marginTop: 6 }}>
        <span>Customer</span>
        <strong>Walk-in</strong>
      </div>

      <div className="preview-divider" />

      {lineItems.map((item) => (
        <div key={item.name} className="preview-line-item">
          <span className="preview-line-name">
            {item.name} ×{item.qty}
          </span>
          <span>PKR {item.total}</span>
        </div>
      ))}

      <div className="preview-totals">
        <div className="preview-row">
          <span>Subtotal</span>
          <span>PKR {subtotal.toFixed(2)}</span>
        </div>
        <div className="preview-row">
          <span>Discount</span>
          <span>-PKR {discount.toFixed(2)}</span>
        </div>
        <div className="preview-total-final">
          <span>Total</span>
          <span>PKR {total.toFixed(2)}</span>
        </div>
      </div>

      {settings.footerText && <div className="preview-footer">{settings.footerText}</div>}
    </CompactPreview>
  );
}

InvoicePreviewCompact.propTypes = {
  settings: PropTypes.object,
  logoUrl: PropTypes.string,
  template: PropTypes.string,
};

InvoicePreviewCompact.defaultProps = {
  settings: {},
  logoUrl: '',
  template: 'a4_80mm_strip',
};

function Settings() {
  const [form] = Form.useForm();
  const token = Cookies.get('token');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('invoice');

  const [settings, setSettings] = useState({
    template: 'a4_80mm_strip',
    companyName: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    regNumber: '',
    footerText: '',
    primaryColor: '#2563eb',
    secondaryColor: '#1a3a34',
    posLayout: 'tabular',
  });

  const loadSettings = useCallback(async () => {
    if (!token) {
      message.error('Please sign in to load settings');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_SETTINGS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await responseJson(res);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load');
      }

      const inv = data.settings?.invoiceDesign || {};

      const normalizePosLayout = (raw) => {
        const s = String(raw ?? 'tabular').trim().toLowerCase();
        if (s === 'grid' || s === 'gridview') return 'gridview';
        return 'tabular';
      };

      const merged = {
        template: inv.template || 'a4_80mm_strip',
        companyName: inv.companyName,
        tagline: inv.tagline,
        address: inv.address,
        phone: inv.phone,
        email: inv.email,
        gstin: inv.gstin,
        regNumber: inv.regNumber,
        footerText: inv.footerText,
        primaryColor: inv.primaryColor || '#2563eb',
        secondaryColor: inv.secondaryColor || '#1a3a34',
        posLayout: normalizePosLayout(inv.posLayout ?? inv.viewType),
      };

      form.setFieldsValue(merged);
      setSettings((s) => ({ ...s, ...merged }));

      if (inv.logoUrl) {
        setLogoUrl(`${API_ORIGIN}${inv.logoUrl}`);
      } else {
        setLogoUrl('');
      }
    } catch (e) {
      message.error(e.message || 'Could not load settings');
    } finally {
      setLoading(false);
    }
  }, [token, form]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onFinish = async (values) => {
    if (!token) {
      message.error('Please sign in');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(API_SETTINGS, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceDesign: values }),
      });

      const data = await responseJson(res);

      if (!res.ok) {
        throw new Error(data.error || 'Save failed');
      }

      setSettings((s) => ({ ...s, ...values }));
      message.success('Settings saved');
    } catch (e) {
      message.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadProps = {
    name: 'file',
    action: `${API_BASE}/settings/invoice-logo`,
    headers: { Authorization: token ? `Bearer ${token}` : '' },
    showUploadList: false,
    accept: 'image/*',
    onChange(info) {
      if (info.file.status === 'done') {
        const body = info.file.response;
        if (body?.settings?.invoiceDesign?.logoUrl) {
          setLogoUrl(`${API_ORIGIN}${body.settings.invoiceDesign.logoUrl}`);
          message.success('Logo uploaded');
        } else if (body?.error) {
          message.error(body.error);
        }
      } else if (info.file.status === 'error') {
        message.error('Logo upload failed');
      }
    },
  };

  const onValuesChange = (_changed, all) => {
    setSettings((prev) => ({ ...prev, ...all }));
  };

  const invoiceTab = (
    <Row gutter={[24, 24]}>
      <Col xs={24} xl={15}>
        <SettingsPanel>
          <Form.Item
            label="Invoice template (PDF)"
            name="template"
            rules={[{ required: true, message: 'Select a template' }]}
          >
            <Select options={TEMPLATE_OPTIONS} />
          </Form.Item>

          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Form.Item
                label="Company name"
                name="companyName"
                rules={[{ required: true, message: 'Company name is required' }]}
              >
                <Input placeholder="Shown on invoice and POS" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="Tagline" name="tagline">
                <Input placeholder="Short line under company name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="Contact phone" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="Email" name="email">
                <Input placeholder="Contact email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Form.Item label="Registration no." name="regNumber">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="GSTIN" name="gstin">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Address is required' }]}
          >
            <Input.TextArea rows={2} placeholder="Company address" />
          </Form.Item>

          <Form.Item label="Footer text" name="footerText">
            <Input.TextArea rows={2} placeholder="Thank-you message" />
          </Form.Item>

          <Form.Item label="Company logo">
            <Upload {...uploadProps}>
              <Button icon={<FeatherIcon icon="upload" size={14} />}>Upload logo</Button>
            </Upload>
            {logoUrl && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={logoUrl}
                  alt="logo"
                  style={{ maxWidth: 120, maxHeight: 48, borderRadius: 6, objectFit: 'contain' }}
                />
              </div>
            )}
          </Form.Item>
        </SettingsPanel>
      </Col>

      <Col xs={24} xl={9}>
        <PreviewShell>
          <PreviewLabel>
            <span>Invoice preview</span>
            <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
              Compact
            </span>
          </PreviewLabel>
          <PreviewFrame>
            <InvoicePreviewCompact
              settings={settings}
              logoUrl={logoUrl}
              template={settings.template || 'a4_80mm_strip'}
            />
          </PreviewFrame>
        </PreviewShell>
      </Col>
    </Row>
  );

  const posTab = (
    <SettingsPanel style={{ maxWidth: 640 }}>
      <p style={{ marginBottom: 16, color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
        Choose how the product catalog appears on the Point of Sale billing screen: a scrollable
        list (tabular) or a card grid (grid view).
      </p>

      <Form.Item
        label="Product catalog layout"
        name="posLayout"
        tooltip="Applies to the POS product list after you save."
      >
        <Select
          placeholder="Select layout"
          options={[
            { value: 'tabular', label: 'Tabular — vertical list' },
            { value: 'gridview', label: 'Grid view — product cards' },
          ]}
        />
      </Form.Item>

      <div
        style={{
          marginTop: 16,
          padding: '14px 16px',
          borderRadius: 10,
          background: '#f8fafc',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 6,
          }}
        >
          Current selection
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
          {settings.posLayout === 'gridview' ? 'Grid view' : 'Tabular'}
        </div>
        <p style={{ marginTop: 6, marginBottom: 0, color: '#6b7280', fontSize: 13 }}>
          {settings.posLayout === 'gridview'
            ? 'Products show as cards in a grid.'
            : 'Products show as a vertical list of rows.'}
        </p>
      </div>
    </SettingsPanel>
  );

  return (
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title={<span className="page-title">Invoice &amp; branding</span>}
          subTitle={
            <span className="page-sub">
              Company details, PDF templates, and POS catalog layout
            </span>
          }
        />
      </ProjectHeader>

      <Main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" tip="Loading settings…" />
          </div>
        ) : (
          <Form
            form={form}
            name="invoice_settings"
            onFinish={onFinish}
            onValuesChange={onValuesChange}
            layout="vertical"
            initialValues={settings}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              size="large"
              style={{ marginBottom: 20 }}
              items={[
                {
                  key: 'invoice',
                  label: (
                    <span>
                      <FeatherIcon icon="file-text" size={14} style={{ marginRight: 8 }} />
                      Invoice &amp; branding
                    </span>
                  ),
                  children: invoiceTab,
                },
                {
                  key: 'pos',
                  label: (
                    <span>
                      <FeatherIcon icon="layout" size={14} style={{ marginRight: 8 }} />
                      POS display
                    </span>
                  ),
                  children: posTab,
                },
              ]}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '4px 0 8px',
              }}
            >
              <Button type="primary" htmlType="submit" size="large" loading={saving}>
                <FeatherIcon icon="save" size={14} style={{ marginRight: 8 }} />
                Save settings
              </Button>
            </div>
          </Form>
        )}
      </Main>
    </ScreenWrap>
  );
}

export default Settings;
