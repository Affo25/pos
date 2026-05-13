import React, { useEffect, useState, useCallback } from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Upload,
  message,
  Table,
  Select,
  Spin,
  Tabs,
} from 'antd';
import FeatherIcon from 'feather-icons-react';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { API_BASE, API_ORIGIN, responseJson } from '../../config/apiBase';

const API_SETTINGS = `${API_BASE}/settings`;

const TEMPLATE_OPTIONS = [
  { value: 'report_a4', label: 'Full A4 report invoice' },
  { value: 'a4_80mm_strip', label: 'A4 page · 80mm left column (pharmacy style)' },
  { value: 'restaurant_80mm', label: '80mm narrow receipt (restaurant / thermal)' },
];

function templateLabel(value) {
  return TEMPLATE_OPTIONS.find((o) => o.value === value)?.label || value;
}

const InvoicePreviewWidget = ({ settings, logoUrl, template }) => {
  const invoiceTableData = [
    {
      key: '1',
      row: '1',
      details: (
        <div className="product-info">
          <h6 style={{ marginBottom: 4, fontWeight: 500, fontSize: 14 }}>
            Sample item A
          </h6>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: 12,
              color: '#8c90a4',
            }}
          >
            <li>
              <span style={{ marginRight: 8 }}>Note :</span>
              <span>Preview only</span>
            </li>
          </ul>
        </div>
      ),
      unit: <span style={{ fontWeight: 500 }}>PKR 100.00</span>,
      quantity: <span style={{ fontWeight: 500 }}>2</span>,
      total: <span style={{ fontWeight: 500 }}>PKR 200.00</span>,
    },
    {
      key: '2',
      row: '2',
      details: (
        <div className="product-info">
          <h6 style={{ marginBottom: 4, fontWeight: 500, fontSize: 14 }}>
            Sample item B
          </h6>
        </div>
      ),
      unit: <span style={{ fontWeight: 500 }}>PKR 50.00</span>,
      quantity: <span style={{ fontWeight: 500 }}>1</span>,
      total: <span style={{ fontWeight: 500 }}>PKR 50.00</span>,
    },
  ];

  const invoiceTableColumns = [
    { title: '#', dataIndex: 'row', key: 'row', width: 50 },
    { title: 'Product Details', dataIndex: 'details', key: 'details' },
    {
      title: 'Price Per Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      align: 'right',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center',
    },
    {
      title: 'Order Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      align: 'right',
    },
  ];

  const printInvoice = () => {
    const printContent = document.getElementById('print-invoice-content');
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const defaultLogo =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 40'%3E%3Crect width='120' height='40' fill='%231677ff' rx='8'/%3E%3Ctext x='12' y='26' fill='white' font-weight='bold' font-size='16'%3ELOGO%3C/text%3E%3C/svg%3E";

  const subtotal = 250;
  const discount = 10;
  const shipping = 0;
  const total = subtotal - discount + shipping;

  const narrowReceipt = template === 'restaurant_80mm';
  const stripNote = template === 'a4_80mm_strip';

  return (
    <div
      id="print-invoice-content"
      style={{
        background: 'white',
        borderRadius: 16,
        padding: narrowReceipt ? 16 : 24,
        maxWidth: narrowReceipt ? 320 : '100%',
        margin: narrowReceipt ? '0 auto' : undefined,
        height: '100%',
        overflowY: 'auto',
        boxShadow:
          '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      }}
    >
      <div
        style={{
          marginBottom: 12,
          fontSize: 11,
          color: '#64748b',
          textAlign: 'center',
        }}
      >
        Selected PDF template: <strong>{templateLabel(template)}</strong>
        {stripNote &&
          ' · PDF places the invoice in an 80mm column on the left of A4.'}
        {narrowReceipt && ' · PDF uses a tall 80mm-wide page.'}
      </div>

      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <img
              src={logoUrl || defaultLogo}
              alt="company logo"
              style={{ maxHeight: 55, objectFit: 'contain' }}
            />
          </Col>

          <Col xs={24} sm={12}>
            <address
              style={{
                textAlign: 'right',
                fontStyle: 'normal',
                lineHeight: 1.6,
                fontSize: 13,
                color: '#4B5563',
              }}
            >
              <strong style={{ fontSize: 14, color: '#1a1f36' }}>
                {settings.companyName || 'Company'}
              </strong>

              <br />

              {settings.tagline && (
                <span style={{ fontSize: 12, color: '#8c90a4' }}>
                  {settings.tagline}
                </span>
              )}

              {settings.tagline && <br />}

              {settings.address || '—'}

              <br />

              {settings.phone && (
                <>
                  {settings.phone}
                  <br />
                </>
              )}

              {settings.email && (
                <>
                  {settings.email}
                  <br />
                </>
              )}

              {(settings.regNumber || settings.gstin) && (
                <>
                  {settings.regNumber && (
                    <>
                      Reg: {settings.regNumber}
                      <br />
                    </>
                  )}

                  {settings.gstin && <>GSTIN: {settings.gstin}</>}
                </>
              )}
            </address>
          </Col>
        </Row>
      </div>

      <div
        style={{
          borderTop: '1px solid #e9eef3',
          borderBottom: '1px solid #e9eef3',
          padding: '20px 0',
          marginBottom: 24,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 26,
              fontWeight: 600,
              marginBottom: 8,
              color: '#1a1f36',
            }}
          >
            Invoice
          </h3>

          <p style={{ marginBottom: 4, color: '#4B5563' }}>
            No : #INV-PREVIEW
          </p>

          <p style={{ color: '#4B5563' }}>
            Date :
            {' '}
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h5
          style={{
            fontWeight: 600,
            marginBottom: 8,
            color: '#1a1f36',
          }}
        >
          Invoice To:
        </h5>

        <p style={{ color: '#4B5563', marginBottom: 4 }}>
          Walk-in Customer
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Table
          dataSource={invoiceTableData}
          columns={invoiceTableColumns}
          pagination={false}
          size="middle"
          style={{ fontSize: 13 }}
        />
      </div>

      <Row justify="end">
        <Col xs={24} sm={12} md={10} lg={8}>
          <div
            style={{
              background: '#f8f9fc',
              borderRadius: 12,
              padding: '16px 20px',
            }}
          >
            <ul style={{ listStyle: 'none', marginBottom: 16, padding: 0 }}>
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <span>Subtotal :</span>
                <span>PKR {subtotal.toFixed(2)}</span>
              </li>

              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <span>Discount :</span>
                <span>-PKR {discount.toFixed(2)}</span>
              </li>

              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Total :</span>
                <span style={{ fontWeight: 700, color: '#1677ff' }}>
                  PKR {total.toFixed(2)}
                </span>
              </li>
            </ul>
          </div>
        </Col>
      </Row>

      {settings.footerText && (
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            textAlign: 'center',
            borderTop: '1px solid #e9eef3',
            color: '#8c90a4',
            fontSize: 12,
          }}
        >
          {settings.footerText}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 24,
        }}
      >
        <Button onClick={printInvoice}>
          <FeatherIcon icon="printer" size={14} />
          Print preview
        </Button>
      </div>
    </div>
  );
};

InvoicePreviewWidget.propTypes = {
  settings: PropTypes.object,
  logoUrl: PropTypes.string,
  template: PropTypes.string,
};

InvoicePreviewWidget.defaultProps = {
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

      setSettings((s) => ({
        ...s,
        ...merged,
      }));

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
        body: JSON.stringify({
          invoiceDesign: values,
        }),
      });

      const data = await responseJson(res);

      if (!res.ok) {
        throw new Error(data.error || 'Save failed');
      }

      setSettings((s) => ({
        ...s,
        ...values,
      }));

      message.success('Invoice settings saved');
    } catch (e) {
      message.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadProps = {
    name: 'file',
    action: `${API_BASE}/settings/invoice-logo`,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    showUploadList: false,
    accept: 'image/*',

    onChange(info) {
      if (info.file.status === 'done') {
        const body = info.file.response;

        if (body?.settings?.invoiceDesign?.logoUrl) {
          setLogoUrl(
            `${API_ORIGIN}${body.settings.invoiceDesign.logoUrl}`,
          );

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
    setSettings((prev) => ({
      ...prev,
      ...all,
    }));
  };

  return (
    <>
      <PageHeader ghost title="Settings" />

      <Main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={25}>
            <Col xs={24} lg={12}>
              <Cards headless>
                <Form
                  form={form}
                  name="invoice_settings"
                  onFinish={onFinish}
                  onValuesChange={onValuesChange}
                  layout="vertical"
                  initialValues={settings}
                >
                  <Tabs
                    defaultActiveKey="1"
                    items={[
                      {
                        key: '1',
                        label: (
                          <span>
                            <FeatherIcon
                              icon="settings"
                              size={14}
                              style={{ marginRight: 6 }}
                            />
                            Invoice settings
                          </span>
                        ),
                        children: (
                          <>
                            <Form.Item
                              label="Invoice template (PDF)"
                              name="template"
                              rules={[
                                {
                                  required: true,
                                  message: 'Select a template',
                                },
                              ]}
                            >
                              <Select options={TEMPLATE_OPTIONS} />
                            </Form.Item>

                            <Row gutter={16}>
                              <Col md={12} xs={24}>
                                <Form.Item
                                  label="Company name"
                                  name="companyName"
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Company name is required',
                                    },
                                  ]}
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

                            <Form.Item
                              label="Address"
                              name="address"
                              rules={[
                                {
                                  required: true,
                                  message: 'Address is required',
                                },
                              ]}
                            >
                              <Input.TextArea
                                rows={3}
                                placeholder="Company address"
                              />
                            </Form.Item>

                            <Form.Item label="Footer text" name="footerText">
                              <Input.TextArea
                                rows={2}
                                placeholder="Thank-you message"
                              />
                            </Form.Item>

                            <Form.Item label="Company logo">
                              <Upload {...uploadProps}>
                                <Button
                                  icon={
                                    <FeatherIcon
                                      icon="upload"
                                      size={14}
                                    />
                                  }
                                >
                                  Upload logo
                                </Button>
                              </Upload>

                              {logoUrl && (
                                <div style={{ marginTop: 16 }}>
                                  <img
                                    src={logoUrl}
                                    alt="logo"
                                    style={{
                                      maxWidth: 150,
                                      borderRadius: 8,
                                    }}
                                  />
                                </div>
                              )}
                            </Form.Item>
                          </>
                        ),
                      },
                      {
                        key: '2',
                        label: (
                          <span>
                            <FeatherIcon
                              icon="layout"
                              size={14}
                              style={{ marginRight: 6 }}
                            />
                            POS display
                          </span>
                        ),
                        children: (
                          <div style={{ paddingTop: 4 }}>
                            <p
                              style={{
                                marginBottom: 16,
                                color: '#64748b',
                                fontSize: 14,
                                lineHeight: 1.6,
                              }}
                            >
                              Choose how the product catalog appears on the Point of Sale billing
                              screen: a scrollable list (tabular) or a card grid (gridview).
                            </p>

                            <Form.Item
                              label="Product catalog layout"
                              name="posLayout"
                              tooltip="Applies to the POS product list after you save."
                            >
                              <Select
                                placeholder="Select layout"
                                options={[
                                  { value: 'tabular', label: 'Tabular' },
                                  { value: 'gridview', label: 'Gridview' },
                                ]}
                              />
                            </Form.Item>

                            <div
                              style={{
                                marginTop: 20,
                                padding: 16,
                                borderRadius: 12,
                                background: '#f8fafc',
                                border: '1px solid #e5e7eb',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: '#64748b',
                                  marginBottom: 8,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                }}
                              >
                                Preview
                              </div>
                              <div
                                style={{
                                  fontSize: 17,
                                  fontWeight: 700,
                                  color: '#1e293b',
                                }}
                              >
                                {settings.posLayout === 'gridview'
                                  ? 'Gridview'
                                  : 'Tabular'}
                              </div>
                              <p style={{ marginTop: 8, marginBottom: 0, color: '#6b7280', fontSize: 13 }}>
                                {settings.posLayout === 'gridview'
                                  ? 'Products show as cards in a grid.'
                                  : 'Products show as a vertical list of rows.'}
                              </p>
                            </div>
                          </div>
                        ),
                      },
                    ]}
                  />

                  <Form.Item style={{ marginTop: 20, marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={saving}
                    >
                      <FeatherIcon icon="save" size={14} />
                      Save settings
                    </Button>
                  </Form.Item>
                </Form>
              </Cards>
            </Col>

            <Col xs={24} lg={12}>
              <Cards
                title={
                  <span>
                    <FeatherIcon
                      icon="eye"
                      size={14}
                      style={{ marginRight: 8 }}
                    />
                    Live preview
                  </span>
                }
              >
                <InvoicePreviewWidget
                  settings={settings}
                  logoUrl={logoUrl}
                  template={settings.template || 'a4_80mm_strip'}
                />
              </Cards>
            </Col>
          </Row>
        )}
      </Main>
    </>
  );
}

export default Settings;