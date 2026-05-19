/* eslint-disable camelcase */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, InputNumber, Select, DatePicker, Row, Col } from 'antd';
import moment from 'moment';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';

const { Option } = Select;

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'debit_card', label: 'Debit card' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'online', label: 'Online' },
  { value: 'wallet', label: 'Wallet' },
];

function RecordPaymentModal({ visible, onCancel, onSubmit, sales, purchaseOrders, loading }) {
  const [form] = Form.useForm();
  const paymentType = Form.useWatch('payment_type', form);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const referenceType =
      values.payment_type === 'sale' ? 'sale_order' : 'purchase_order';
    const selected =
      values.payment_type === 'sale'
        ? sales.find((s) => String(s._id) === String(values.reference_id))
        : purchaseOrders.find((p) => String(p._id) === String(values.reference_id));

    const orderTotal =
      values.payment_type === 'sale'
        ? Number(selected?.net_amount || 0)
        : Number(selected?.net_total ?? selected?.order_total ?? 0);

    const customerName =
      values.payment_type === 'sale'
        ? selected?.customer_name || 'Walk-in Customer'
        : '';
    const supplierName =
      values.payment_type === 'purchase'
        ? selected?.supplier_name || selected?.supplier_id?.name || 'Supplier'
        : '';

    await onSubmit({
      payment_type: values.payment_type,
      reference_type: referenceType,
      reference_id: values.reference_id,
      payment_method: values.payment_method,
      paid_amount: Number(values.paid_amount),
      amount: orderTotal,
      customer_name: customerName,
      supplier_name: supplierName,
      reference_no:
        values.payment_type === 'sale'
          ? selected?.invoice_no || ''
          : selected?.order_number || '',
      payment_date: values.payment_date ? values.payment_date.toISOString() : new Date().toISOString(),
      transaction_id: values.transaction_id || '',
      bank_name: values.bank_name || '',
      cheque_no: values.cheque_no || '',
      notes: values.notes || '',
    });
    form.resetFields();
  };

  const referenceOptions =
    paymentType === 'sale'
      ? (sales || []).map((s) => ({
          value: s._id,
          label: `${s.invoice_no || s._id} — ${s.customer_name || 'Customer'} (${Number(s.net_amount || 0).toFixed(0)} PKR)`,
        }))
      : (purchaseOrders || []).map((p) => ({
          value: p._id,
          label: `${p.order_number} — ${p.supplier_name || p.supplier_id?.name || 'Supplier'} (${Number(p.net_total || 0).toFixed(0)} PKR)`,
        }));

  return (
    <Modal
      title="Record payment"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" type="default" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          Save payment
        </Button>,
      ]}
      width={640}
    >
      <Form form={form} layout="vertical" initialValues={{ payment_method: 'cash', payment_date: moment() }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="payment_type"
              label="Payment type"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select placeholder="Sale or purchase">
                <Option value="sale">Sale (money in)</Option>
                <Option value="purchase">Purchase (money out)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="reference_id"
              label="Order"
              rules={[{ required: true, message: 'Select an order' }]}
            >
              <Select
                showSearch
                placeholder={paymentType ? 'Select order' : 'Choose type first'}
                disabled={!paymentType}
                optionFilterProp="label"
                options={referenceOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="paid_amount"
              label="Amount (PKR)"
              rules={[{ required: true, message: 'Enter amount' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="payment_method" label="Method" rules={[{ required: true }]}>
              <Select options={PAYMENT_METHODS} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="payment_date" label="Payment date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="transaction_id" label="Transaction ID">
              <Input placeholder="Optional" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="bank_name" label="Bank name">
              <Input placeholder="For transfers / cheques" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="cheque_no" label="Cheque no.">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} maxLength={1000} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

RecordPaymentModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  sales: PropTypes.array,
  purchaseOrders: PropTypes.array,
  loading: PropTypes.bool,
};

export default RecordPaymentModal;
