import React, { useEffect, useState } from 'react';
import { Modal, Spin, Table, Descriptions } from 'antd';
import propTypes from 'prop-types';
import { fetchCustomerLedger } from '../../redux/customers/customerService';
import { formatPkr } from '../../config/currency';
import ModernModalStyles from '../shared/modalStyles';

function CustomerLedgerModal({ visible, onCancel, customer }) {
  const [loading, setLoading] = useState(false);
  const [ledger, setLedger] = useState(null);

  useEffect(() => {
    if (!visible || !customer) return;
    const id = customer._id || customer.id;
    setLoading(true);
    fetchCustomerLedger(id)
      .then(setLedger)
      .catch(() => setLedger(null))
      .finally(() => setLoading(false));
  }, [visible, customer]);

  const summary = ledger?.summary;
  const sales = ledger?.sales || [];

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoice_no',
      key: 'invoice_no',
      width: 120,
      render: (v, row) => v || `INV-${String(row._id || '').slice(-6)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => String(s || '').toUpperCase(),
    },
    {
      title: 'Net total',
      dataIndex: 'net_total',
      key: 'net_total',
      align: 'right',
      render: (v) => formatPkr(v),
    },
    {
      title: 'Received',
      dataIndex: 'amount_received',
      key: 'amount_received',
      align: 'right',
      render: (v) => formatPkr(v),
    },
    {
      title: 'Remaining',
      dataIndex: 'amount_remaining',
      key: 'amount_remaining',
      align: 'right',
      render: (v) => (
        <span style={{ fontWeight: 600, color: Number(v) > 0 ? '#b45309' : '#059669' }}>
          {formatPkr(v)}
        </span>
      ),
    },
  ];

  return (
    <>
      <ModernModalStyles />
      <Modal
        className="modern-modal"
        title={customer ? `Customer ledger · ${customer.name}` : 'Customer ledger'}
        visible={visible}
        onCancel={onCancel}
        width={900}
        footer={null}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : summary ? (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Opening balance">{formatPkr(summary.opening_balance)}</Descriptions.Item>
              <Descriptions.Item label="Net sales">{formatPkr(summary.net_sales)}</Descriptions.Item>
              <Descriptions.Item label="Total received">{formatPkr(summary.total_received)}</Descriptions.Item>
              <Descriptions.Item label="Remaining on sales">
                {formatPkr(summary.total_remaining_on_sales)}
              </Descriptions.Item>
              <Descriptions.Item label="Returns credited" span={2}>
                {formatPkr(summary.total_returned)}
              </Descriptions.Item>
              <Descriptions.Item label="Balance (opening + remaining)" span={2}>
                <strong style={{ fontSize: 16, color: '#0f172a' }}>
                  {formatPkr(summary.customer_balance)}
                </strong>
              </Descriptions.Item>
            </Descriptions>
            <Table
              size="small"
              columns={columns}
              dataSource={sales.filter((s) => s.status !== 'cancelled')}
              rowKey={(r) => r._id || r.id}
              pagination={{ pageSize: 8 }}
              scroll={{ x: 540 }}
            />
          </>
        ) : (
          <p style={{ color: '#94a3b8' }}>Could not load ledger.</p>
        )}
      </Modal>
    </>
  );
}

CustomerLedgerModal.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  customer: propTypes.object,
};

CustomerLedgerModal.defaultProps = {
  customer: null,
};

export default CustomerLedgerModal;
