/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Tag, Divider } from 'antd';
import styled, { createGlobalStyle } from 'styled-components';
import {
  CreditCardOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  BankOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { formatPkr } from '../../utils/purchaseOrderCalc';
import ModernModalStyles from '../shared/modalStyles';
import {
  TYPE_TAG,
  PARTY_TAG,
  STATUS_TAG,
  METHOD_LABELS,
  formatPaymentDate,
  getPartyDisplay,
} from './paymentDisplayUtils';

const PaymentDetailModalStyles = createGlobalStyle`
  .payment-detail-modal .ant-modal-header {
    display: none;
  }
  .payment-detail-modal .ant-modal-body {
    padding-top: 0 !important;
  }
`;

const DetailWrap = styled.div`
  .hero {
    margin: -16px -24px 20px;
    padding: 24px 24px 20px;
    background: linear-gradient(135deg, #1e293b 0%, #334155 55%, #475569 100%);
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  .hero::after {
    content: '';
    position: absolute;
    right: -40px;
    top: -40px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
  }

  .hero-top {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  .payment-no {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.75;
    margin-bottom: 4px;
  }

  .hero-title {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .hero-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }

  .amount-block {
    text-align: right;
    position: relative;
    z-index: 1;
  }

  .amount-label {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 2px;
  }

  .amount-value {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .amount-sub {
    font-size: 12px;
    opacity: 0.75;
    margin-top: 4px;
  }

  .summary-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  .summary-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 16px;
  }

  .summary-card.highlight {
    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
    border-color: #bbf7d0;
  }

  .summary-card.warn {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-color: #fde68a;
  }

  .summary-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-bottom: 6px;
  }

  .summary-value {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    font-variant-numeric: tabular-nums;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 20px;
    margin-bottom: 20px;
    @media (max-width: 520px) {
      grid-template-columns: 1fr;
    }
  }

  .detail-item {
    min-width: 0;
  }

  .detail-label {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
  }

  .detail-value {
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
    word-break: break-word;
  }

  .detail-value.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight: 600;
  }

  .notes-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 16px;
    font-size: 14px;
    color: #475569;
    line-height: 1.55;
    white-space: pre-wrap;
  }

  .flow-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.12);
  }
`;

function DetailItem({ label, value, mono }) {
  return (
    <div className="detail-item">
      <div className="detail-label">{label}</div>
      <div className={`detail-value${mono ? ' mono' : ''}`}>{value || '—'}</div>
    </div>
  );
}

DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
  mono: PropTypes.bool,
};

function PaymentDetailModal({ visible, payment, onCancel }) {
  if (!payment) {
    return (
      <>
        <ModernModalStyles />
        <PaymentDetailModalStyles />
        <Modal
          className="modern-modal payment-detail-modal"
          title="Payment details"
          visible={visible}
          onCancel={onCancel}
          footer={null}
          width={640}
          destroyOnClose
        />
      </>
    );
  }

  const party = getPartyDisplay(payment);
  const isSale = payment.payment_type === 'sale';
  const refLabel = payment.reference_type === 'sale_order' ? 'Sale invoice' : 'Purchase order';
  const txnLabel =
    payment.transaction_type === 'credit' ? 'Money in (credit)' : 'Money out (debit)';

  return (
    <>
      <ModernModalStyles />
      <Modal
        className="modern-modal payment-detail-modal"
        title={null}
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={680}
        destroyOnClose
        bodyStyle={{ padding: '16px 24px 24px' }}
      >
        <DetailWrap>
          <div className="hero">
            <div className="hero-top">
              <div>
                <div className="payment-no">Payment</div>
                <h2 className="hero-title">{payment.payment_no}</h2>
                <div className="hero-tags">
                  <Tag style={TYPE_TAG[payment.payment_type]}>
                    {isSale ? 'Sale' : 'Purchase'}
                  </Tag>
                  <Tag style={PARTY_TAG[party.isCustomer ? 'customer' : 'supplier']}>
                    {party.type}
                  </Tag>
                  <Tag style={STATUS_TAG[payment.status] || STATUS_TAG.pending}>
                    {(payment.status || 'pending').toUpperCase()}
                  </Tag>
                  <span className="flow-badge">
                    {payment.transaction_type === 'credit' ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}
                    {txnLabel}
                  </span>
                </div>
              </div>
              <div className="amount-block">
                <div className="amount-label">Paid this entry</div>
                <div className="amount-value">{formatPkr(payment.paid_amount)}</div>
                <div className="amount-sub">
                  of {formatPkr(payment.amount)} order total
                </div>
              </div>
            </div>
          </div>

          <div className="summary-row">
            <div className="summary-card">
              <div className="summary-label">Order total</div>
              <div className="summary-value">{formatPkr(payment.amount)}</div>
            </div>
            <div className="summary-card highlight">
              <div className="summary-label">Paid</div>
              <div className="summary-value" style={{ color: '#15803d' }}>
                {formatPkr(payment.paid_amount)}
              </div>
            </div>
            <div className={`summary-card${Number(payment.remaining_amount) > 0 ? ' warn' : ''}`}>
              <div className="summary-label">Remaining</div>
              <div
                className="summary-value"
                style={{ color: Number(payment.remaining_amount) > 0 ? '#b45309' : '#059669' }}
              >
                {formatPkr(payment.remaining_amount)}
              </div>
            </div>
          </div>

          <div className="section-title">
            <FileTextOutlined />
            Order reference
          </div>
          <div className="detail-grid">
            <DetailItem label={refLabel} value={payment.reference_no} mono />
            <DetailItem
              label="Reference type"
              value={payment.reference_type?.replace(/_/g, ' ')}
            />
          </div>

          <Divider style={{ margin: '4px 0 16px' }} />

          <div className="section-title">
            <UserOutlined />
            {party.type}
          </div>
          <div className="detail-grid">
            <DetailItem label="Name" value={party.label} />
            <DetailItem label="Party type" value={party.type} />
            {party.isCustomer && payment.customer?.phone && (
              <DetailItem label="Phone" value={payment.customer.phone} />
            )}
            {!party.isCustomer && payment.supplier?.phone && (
              <DetailItem label="Phone" value={payment.supplier.phone} />
            )}
            {party.isCustomer && payment.customer?.email && (
              <DetailItem label="Email" value={payment.customer.email} />
            )}
            {!party.isCustomer && payment.supplier?.email && (
              <DetailItem label="Email" value={payment.supplier.email} />
            )}
          </div>

          <Divider style={{ margin: '4px 0 16px' }} />

          <div className="section-title">
            <CreditCardOutlined />
            Payment info
          </div>
          <div className="detail-grid">
            <DetailItem
              label="Method"
              value={METHOD_LABELS[payment.payment_method] || payment.payment_method}
            />
            <DetailItem label="Transaction" value={txnLabel} />
            <DetailItem label="Payment date" value={formatPaymentDate(payment.payment_date)} />
            <DetailItem label="Due date" value={formatPaymentDate(payment.due_date)} />
          </div>

          {(payment.transaction_id || payment.bank_name || payment.cheque_no) && (
            <>
              <Divider style={{ margin: '4px 0 16px' }} />
              <div className="section-title">
                <BankOutlined />
                Banking
              </div>
              <div className="detail-grid">
                <DetailItem label="Transaction ID" value={payment.transaction_id} mono />
                <DetailItem label="Bank" value={payment.bank_name} />
                <DetailItem label="Cheque no." value={payment.cheque_no} />
              </div>
            </>
          )}

          {(payment.notes || payment.branch?.branch_name || payment.created_by?.name) && (
            <>
              <Divider style={{ margin: '4px 0 16px' }} />
              <div className="section-title">
                <CalendarOutlined />
                Other
              </div>
              <div className="detail-grid">
                {payment.branch?.branch_name && (
                  <DetailItem label="Branch" value={payment.branch.branch_name} />
                )}
                {payment.created_by?.name && (
                  <DetailItem label="Recorded by" value={payment.created_by.name} />
                )}
                <DetailItem label="Created" value={formatPaymentDate(payment.createdAt)} />
                <DetailItem label="Updated" value={formatPaymentDate(payment.updatedAt)} />
              </div>
            </>
          )}

          {payment.notes && (
            <>
              <div className="section-title" style={{ marginTop: 8 }}>
                Notes
              </div>
              <div className="notes-box">{payment.notes}</div>
            </>
          )}
        </DetailWrap>
      </Modal>
    </>
  );
}

PaymentDetailModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  payment: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
};

export default PaymentDetailModal;
