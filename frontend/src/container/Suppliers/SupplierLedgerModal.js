import React, { useEffect, useState } from 'react';
import { Modal, Spin, Table, Descriptions } from 'antd';
import propTypes from 'prop-types';
import { fetchSupplierLedger } from '../../redux/suppliers/supplierService';
import { formatPkr } from '../../utils/purchaseOrderCalc';
import ModernModalStyles from '../shared/modalStyles';

function SupplierLedgerModal({ visible, onCancel, supplier }) {
  const [loading, setLoading] = useState(false);
  const [ledger, setLedger] = useState(null);

  useEffect(() => {
    if (!visible || !supplier) return;
    const id = supplier._id || supplier.id;
    setLoading(true);
    fetchSupplierLedger(id)
      .then(setLedger)
      .catch(() => setLedger(null))
      .finally(() => setLoading(false));
  }, [visible, supplier]);

  const summary = ledger?.summary;
  const orders = ledger?.orders || [];

  const columns = [
    { title: 'Order #', dataIndex: 'order_number', key: 'order_number', width: 110 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 90,
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
      title: 'Paid',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
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
        title={supplier ? `Supplier ledger · ${supplier.name}` : 'Supplier ledger'}
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
              <Descriptions.Item label="Net purchases">{formatPkr(summary.net_purchases)}</Descriptions.Item>
              <Descriptions.Item label="Total paid">{formatPkr(summary.total_paid)}</Descriptions.Item>
              <Descriptions.Item label="Remaining on orders">
                {formatPkr(summary.total_remaining_on_orders)}
              </Descriptions.Item>
              <Descriptions.Item label="Returns credited" span={2}>
                {formatPkr(summary.total_returned)}
              </Descriptions.Item>
              <Descriptions.Item label="Balance (opening + remaining)" span={2}>
                <strong style={{ fontSize: 16, color: '#0f172a' }}>
                  {formatPkr(summary.supplier_balance)}
                </strong>
              </Descriptions.Item>
            </Descriptions>
            <Table
              size="small"
              columns={columns}
              dataSource={orders.filter((o) => o.status !== 'cancelled')}
              rowKey={(r) => r._id || r.id}
              pagination={{ pageSize: 8 }}
              scroll={{ x: 520 }}
            />
          </>
        ) : (
          <p style={{ color: '#94a3b8' }}>Could not load ledger.</p>
        )}
      </Modal>
    </>
  );
}

SupplierLedgerModal.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  supplier: propTypes.object,
};

SupplierLedgerModal.defaultProps = {
  supplier: null,
};

export default SupplierLedgerModal;
