/* eslint-disable no-underscore-dangle */
import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, Row, Col, message } from 'antd';
import propTypes from 'prop-types';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { addPurchaseOrderReturn } from '../../redux/purchaseorders/purchaseorderService';
import { ProcurementFormStyles } from '../shared/procurementScreenStyles';
import ModernModalStyles from '../shared/modalStyles';

const { Option } = Select;
const { TextArea } = Input;

function findNewestReturn(updatedPo, productId, quantity) {
  const list = updatedPo?.returns || [];
  const match = [...list]
    .reverse()
    .find(
      (r) =>
        String(r.product_id?._id || r.product_id) === String(productId) &&
        Number(r.quantity) === Number(quantity),
    );
  return match || list[list.length - 1] || null;
}

function PurchaseOrderReturnModal({ visible, onCancel, purchaseorder, onSuccess, onReturnRecorded }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
  }, [visible, form]);

  if (!purchaseorder) return null;

  const items = (purchaseorder.items || []).map((line) => {
    const pid = line.product_id?._id || line.product_id;
    const name = line.product_id?.name || line.name || 'Product';
    const ordered = Number(line.quantity || 0);
    const returned = (purchaseorder.returns || [])
      .filter((r) => String(r.product_id?._id || r.product_id) === String(pid))
      .reduce((s, r) => s + Number(r.quantity || 0), 0);
    return { pid, name, ordered, returned, maxReturn: Math.max(0, ordered - returned), price: line.price };
  }).filter((it) => it.maxReturn > 0);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const poId = purchaseorder.id || purchaseorder._id;
      const updatedPo = await addPurchaseOrderReturn(poId, {
        product_id: values.product_id,
        quantity: values.quantity,
        price: values.price,
        reason: values.reason,
      });
      message.success('Return recorded');
      form.resetFields();

      const returnRecord = findNewestReturn(updatedPo, values.product_id, values.quantity);
      if (returnRecord && onReturnRecorded) {
        onReturnRecorded({ purchaseorder: updatedPo, returnRecord });
      }

      onSuccess?.(updatedPo);
      onCancel();
    } catch (e) {
      if (!e.errorFields) {
        message.error(e.message || 'Failed to record return');
      }
    }
  };

  return (
    <>
      <ModernModalStyles />
      <Modal
        className="modern-modal"
        title={`Return items · ${purchaseorder.order_number || ''}`}
        visible={visible}
        onCancel={onCancel}
        width={560}
        footer={[
          <Button key="cancel" type="white" onClick={onCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleOk} disabled={!items.length}>
            Record return
          </Button>,
        ]}
      >
        <ProcurementFormStyles>
          {!items.length ? (
            <p style={{ color: '#64748b', margin: 0 }}>All items on this order have been fully returned.</p>
          ) : (
            <Form form={form} layout="vertical" size="middle">
              <Form.Item
                name="product_id"
                label="Product"
                rules={[{ required: true, message: 'Select a product' }]}
              >
                <Select
                  placeholder="Select product to return"
                  onChange={(pid) => {
                    const row = items.find((it) => String(it.pid) === String(pid));
                    if (row) form.setFieldsValue({ price: row.price, quantity: 1 });
                  }}
                >
                  {items.map((it) => (
                    <Option key={it.pid} value={it.pid}>
                      {it.name} (max {it.maxReturn})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="quantity"
                    label="Quantity"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="price" label="Unit price (PKR)">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="reason" label="Reason">
                <TextArea rows={2} placeholder="Optional" />
              </Form.Item>
            </Form>
          )}
        </ProcurementFormStyles>
      </Modal>
    </>
  );
}

PurchaseOrderReturnModal.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  purchaseorder: propTypes.object,
  onSuccess: propTypes.func,
  onReturnRecorded: propTypes.func,
};

PurchaseOrderReturnModal.defaultProps = {
  purchaseorder: null,
  onSuccess: null,
  onReturnRecorded: null,
};

export default PurchaseOrderReturnModal;
