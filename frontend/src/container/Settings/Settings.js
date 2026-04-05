import React, { useState } from 'react';
import { Row, Col, Form, Input, Button, Upload, message, Table } from 'antd';
import FeatherIcon from 'feather-icons-react';
import PropTypes from 'prop-types';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';

// Invoice Preview Component - Live preview widget
const InvoicePreviewWidget = ({ settings, logoUrl }) => {
  const invoiceTableData = [
    {
      key: '1',
      row: '1',
      details: (
        <div className="product-info">
          <h6 style={{ marginBottom: 4, fontWeight: 500, fontSize: 14 }}>Fiber Base Chair</h6>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, color: '#8c90a4' }}>
            <li><span style={{ marginRight: 8 }}>Size :</span> <span>Large</span></li>
            <li><span style={{ marginRight: 8 }}>Color :</span> <span>Brown</span></li>
          </ul>
        </div>
      ),
      unit: <span style={{ fontWeight: 500 }}>$248.66</span>,
      quantity: <span style={{ fontWeight: 500 }}>3</span>,
      total: <span style={{ fontWeight: 500 }}>$745.98</span>,
    },
    {
      key: '2',
      row: '2',
      details: (
        <div className="product-info">
          <h6 style={{ marginBottom: 4, fontWeight: 500, fontSize: 14 }}>Panton Tunior Chair</h6>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, color: '#8c90a4' }}>
            <li><span style={{ marginRight: 8 }}>Size :</span> <span>Medium</span></li>
            <li><span style={{ marginRight: 8 }}>Color :</span> <span>Black</span></li>
          </ul>
        </div>
      ),
      unit: <span style={{ fontWeight: 500 }}>$189.99</span>,
      quantity: <span style={{ fontWeight: 500 }}>2</span>,
      total: <span style={{ fontWeight: 500 }}>$379.98</span>,
    },
    {
      key: '3',
      row: '3',
      details: (
        <div className="product-info">
          <h6 style={{ marginBottom: 4, fontWeight: 500, fontSize: 14 }}>Eames Lounge Chair</h6>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, color: '#8c90a4' }}>
            <li><span style={{ marginRight: 8 }}>Size :</span> <span>Standard</span></li>
            <li><span style={{ marginRight: 8 }}>Color :</span> <span>Walnut</span></li>
          </ul>
        </div>
      ),
      unit: <span style={{ fontWeight: 500 }}>$1,299.00</span>,
      quantity: <span style={{ fontWeight: 500 }}>1</span>,
      total: <span style={{ fontWeight: 500 }}>$1,299.00</span>,
    },
  ];

  const invoiceTableColumns = [
    { title: '#', dataIndex: 'row', key: 'row', width: 50 },
    { title: 'Product Details', dataIndex: 'details', key: 'details' },
    { title: 'Price Per Unit', dataIndex: 'unit', key: 'unit', width: 120, align: 'right' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'center' },
    { title: 'Order Total', dataIndex: 'total', key: 'total', width: 120, align: 'right' },
  ];

  const printInvoice = () => {
    const printContent = document.getElementById('print-invoice-content');
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const defaultLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 40'%3E%3Crect width='120' height='40' fill='%231677ff' rx='8'/%3E%3Ctext x='12' y='26' fill='white' font-weight='bold' font-size='16'%3EAdminCo%3C/text%3E%3C/svg%3E";

  const subtotal = 745.98 + 379.98 + 1299.00;
  const discount = 50.00;
  const shipping = 30.00;
  const total = subtotal - discount + shipping;

  return (
    <div 
      id="print-invoice-content" 
      style={{ 
        background: 'white', 
        borderRadius: 16, 
        padding: 24,
        height: '100%',
        overflowY: 'auto',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
      }}
    >
      {/* Invoice Header */}
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
            <address style={{ 
              textAlign: 'right', 
              fontStyle: 'normal', 
              lineHeight: 1.6, 
              fontSize: 13, 
              color: '#5a5f7d' 
            }}>
              <strong style={{ fontSize: 14, color: '#1a1f36' }}>
                {settings.companyName || 'Admin Company'}
              </strong>
              <br />
              {settings.address || '795 Folsom Ave, Suite 600, San Francisco, CA 94107, USA'}
              <br />
              Reg. number : {settings.regNumber || '245000003513'}
            </address>
          </Col>
        </Row>
      </div>

      {/* Invoice Letter Box */}
      <div style={{ 
        borderTop: '1px solid #e9eef3', 
        borderBottom: '1px solid #e9eef3', 
        padding: '20px 0', 
        marginBottom: 24,
        position: 'relative' 
      }}>
        <div>
          <h3 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8, color: '#1a1f36' }}>Invoice</h3>
          <p style={{ marginBottom: 4, color: '#5a5f7d' }}>No : #INV-2024-001</p>
          <p style={{ color: '#5a5f7d' }}>
            Date : {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ 
          position: 'absolute', 
          right: 0, 
          top: '50%', 
          transform: 'translateY(-50%)', 
          textAlign: 'center', 
          width: 140 
        }}>
          <div style={{ 
            background: '#f8f9fc', 
            padding: '8px 12px', 
            borderRadius: 8,
            fontSize: 11,
            color: '#8c90a4'
          }}>
            <div style={{ marginBottom: 4 }}>SCAN ME</div>
            <div style={{ 
              width: 60, 
              height: 60, 
              background: '#1a1f36', 
              margin: '0 auto',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 10
            }}>
              QR
            </div>
            <div style={{ marginTop: 6, fontSize: 10 }}>8364297359912267</div>
          </div>
        </div>
      </div>

      {/* Invoice To */}
      <div style={{ marginBottom: 24 }}>
        <h5 style={{ fontWeight: 600, marginBottom: 8, color: '#1a1f36' }}>Invoice To:</h5>
        <p style={{ color: '#5a5f7d', marginBottom: 4 }}>Stanley Jones</p>
        <p style={{ color: '#5a5f7d', marginBottom: 4 }}>795 Folsom Ave, Suite 600</p>
        <p style={{ color: '#5a5f7d' }}>San Francisco, CA 94107, USA</p>
      </div>

      {/* Products Table */}
      <div style={{ marginBottom: 24 }}>
        <Table 
          dataSource={invoiceTableData} 
          columns={invoiceTableColumns} 
          pagination={false} 
          size="middle"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* Order Summary */}
      <Row justify="end">
        <Col xs={24} sm={12} md={10} lg={8}>
          <div style={{ 
            background: '#f8f9fc', 
            borderRadius: 12, 
            padding: '16px 20px',
            marginTop: 8
          }}>
            <ul style={{ listStyle: 'none', marginBottom: 16, padding: 0 }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: '#5a5f7d' }}>Subtotal :</span>
                <span style={{ fontWeight: 500, color: '#1a1f36' }}>${subtotal.toFixed(2)}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: '#5a5f7d' }}>Discount :</span>
                <span style={{ fontWeight: 500, color: '#e53e3e' }}>-${discount.toFixed(2)}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: '#5a5f7d' }}>Shipping Charge :</span>
                <span style={{ fontWeight: 500, color: '#1a1f36' }}>${shipping.toFixed(2)}</span>
              </li>
            </ul>
            <div style={{ 
              borderTop: '1px solid #e9eef3', 
              paddingTop: 12, 
              display: 'flex', 
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: 16,
              color: '#1a1f36'
            }}>
              <span>Total :</span>
              <span style={{ color: '#1677ff' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Footer Text */}
      {settings.footerText && (
        <div style={{ 
          marginTop: 24, 
          paddingTop: 20, 
          textAlign: 'center', 
          borderTop: '1px solid #e9eef3',
          color: '#8c90a4',
          fontSize: 12
        }}>
          {settings.footerText}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
        <Button onClick={printInvoice}>
          <FeatherIcon icon="printer" size={14} />
          Print
        </Button>
        <Button>
          <FeatherIcon icon="send" size={14} />
          Send Invoice
        </Button>
        <Button type="primary">
          <FeatherIcon icon="download" size={14} />
          Download
        </Button>
      </div>
    </div>
  );
};

// Add PropTypes validation
InvoicePreviewWidget.propTypes = {
  settings: PropTypes.shape({
    companyName: PropTypes.string,
    address: PropTypes.string,
    regNumber: PropTypes.string,
    footerText: PropTypes.string,
  }),
  logoUrl: PropTypes.string,
};

InvoicePreviewWidget.defaultProps = {
  settings: {
    companyName: 'Admin Company',
    address: '795 Folsom Ave, Suite 600, San Francisco, CA 94107, USA',
    regNumber: '245000003513',
    footerText: 'Thank you for your business!',
  },
  logoUrl: '',
};

function Settings() {
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState('');
  const [settings, setSettings] = useState({
    companyName: 'Admin Company',
    address: '795 Folsom Ave, Suite 600, San Francisco, CA 94107, USA',
    regNumber: '245000003513',
    footerText: 'Thank you for your business!',
  });

  const onFinish = (values) => {
    setSettings(values);
    message.success('Invoice settings updated successfully! Preview updated.');
  };

  const uploadProps = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        // Mock URL for demo
        const mockUrl = URL.createObjectURL(info.file.originFileObj);
        setLogoUrl(mockUrl);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <>
      <PageHeader
        ghost
        title="Invoice Settings"
        buttons={[
          <div key="1" className="page-header-actions">
            <Button size="small" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          {/* Settings Form Column */}
          <Col xs={24} lg={12}>
            <Cards title="Invoice Design Settings" headless>
              <Form
                form={form}
                name="invoice_settings"
                onFinish={onFinish}
                layout="vertical"
                initialValues={settings}
              >
                <Row gutter={16}>
                  <Col md={12} xs={24}>
                    <Form.Item
                      label="Company Name"
                      name="companyName"
                      rules={[{ required: true, message: 'Please input your company name!' }]}
                    >
                      <Input placeholder="Enter company name" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item
                      label="Registration Number"
                      name="regNumber"
                    >
                      <Input placeholder="Enter registration number" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Company Address"
                  name="address"
                  rules={[{ required: true, message: 'Please input your company address!' }]}
                >
                  <Input.TextArea rows={3} placeholder="Enter full company address" />
                </Form.Item>

                <Form.Item
                  label="Invoice Footer Text"
                  name="footerText"
                >
                  <Input.TextArea rows={2} placeholder="Thank you message or footer notes" />
                </Form.Item>

                <Form.Item label="Company Logo">
                  <Upload {...uploadProps}>
                    <Button icon={<FeatherIcon icon="upload" size={14} />}>
                      Click to Upload Logo
                    </Button>
                  </Upload>
                  {logoUrl && (
                    <div style={{ marginTop: 16 }}>
                      <img src={logoUrl} alt="logo" style={{ maxWidth: '150px', borderRadius: 8 }} />
                    </div>
                  )}
                  <div style={{ marginTop: 8, fontSize: 12, color: '#8c90a4' }}>
                    Recommended: PNG or SVG, max 200px height
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block>
                    <FeatherIcon icon="save" size={14} />
                    Save & Preview Changes
                  </Button>
                </Form.Item>
              </Form>
            </Cards>
          </Col>

          {/* Live Preview Column */}
          <Col xs={24} lg={12}>
            <Cards 
              title={
                <span>
                  <FeatherIcon icon="eye" size={14} style={{ marginRight: 8 }} />
                  Live Invoice Preview
                </span>
              }
              headless={false}
            >
              <InvoicePreviewWidget settings={settings} logoUrl={logoUrl} />
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Settings;