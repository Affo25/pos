/* eslint-disable no-underscore-dangle */
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Input, Select, Tag, Popconfirm, DatePicker } from 'antd';
import {
  DollarOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { formatPkr } from '../../utils/purchaseOrderCalc';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { getComponentPermissions } from '../../config/utils/permission';
import { ScreenWrap } from '../shared/procurementScreenStyles';
import {
  fetchAllPayments,
  createPayment,
  cancelPayment,
} from '../../redux/payments/paymentSlice';
import * as paymentApi from '../../redux/payments/paymentService';
import { useBulkDelete } from '../../hooks/useBulkDelete';
import TableToolbarSearchRow from '../../components/bulk/TableToolbarSearchRow';
import { fetchAllSales } from '../../redux/sales/saleSlice';
import { fetchAllPurchaseOrders } from '../../redux/purchaseorders/purchaseorderSlice';
import { fetchAllCustomers } from '../../redux/customers/customerSlice';
import { fetchAllSuppliers } from '../../redux/suppliers/supplierSlice';
import RecordPaymentModal from './RecordPaymentModal';
import PaymentDetailModal from './PaymentDetailModal';
import {
  TYPE_TAG,
  PARTY_TAG,
  STATUS_TAG,
  METHOD_LABELS,
} from './paymentDisplayUtils';

const { Option } = Select;
const { RangePicker } = DatePicker;

function getEntityId(entity) {
  if (!entity) return null;
  return entity._id || entity.id || entity;
}

function paymentMatchesCustomer(payment, customerId, customers) {
  if (!customerId || customerId === 'all') return true;
  if (payment.payment_type !== 'sale') return false;

  const customer = (customers || []).find((c) => String(getEntityId(c)) === String(customerId));
  const customerName = customer?.name?.toLowerCase().trim();
  const paymentCustomerId = getEntityId(payment.customer);

  if (paymentCustomerId && String(paymentCustomerId) === String(customerId)) return true;
  if (customerName && payment.party_name?.toLowerCase().trim() === customerName) return true;
  if (payment.customer?.name && customerName && payment.customer.name.toLowerCase().trim() === customerName) {
    return true;
  }
  return false;
}

function paymentMatchesSupplier(payment, supplierId, suppliers) {
  if (!supplierId || supplierId === 'all') return true;
  if (payment.payment_type !== 'purchase') return false;

  const supplier = (suppliers || []).find((s) => String(getEntityId(s)) === String(supplierId));
  const supplierName = supplier?.name?.toLowerCase().trim();
  const paymentSupplierId = getEntityId(payment.supplier);

  if (paymentSupplierId && String(paymentSupplierId) === String(supplierId)) return true;
  if (supplierName && payment.party_name?.toLowerCase().trim() === supplierName) return true;
  if (payment.supplier?.name && supplierName && payment.supplier.name.toLowerCase().trim() === supplierName) {
    return true;
  }
  return false;
}

function paymentInDateRange(payment, dateRange) {
  if (!dateRange || !dateRange[0] || !dateRange[1]) return true;
  const d = moment(payment.payment_date || payment.createdAt);
  if (!d.isValid()) return false;
  return d.isBetween(
    dateRange[0].clone().startOf('day'),
    dateRange[1].clone().endOf('day'),
    null,
    '[]',
  );
}

function Payments() {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.payments);
  const { sales } = useSelector((state) => state.sales);
  const { purchaseorders } = useSelector((state) => state.purchaseorders);
  const { customers } = useSelector((state) => state.customers);
  const { suppliers } = useSelector((state) => state.suppliers);
  const { login: user } = useSelector((state) => state.auth);
  const { canAdd, canDelete } = getComponentPermissions(user, 'Payments');

  const {
    selectedRowKeys,
    bulkDeleting,
    rowSelection,
    handleBulkDelete,
    removeFromSelection,
  } = useBulkDelete({
    deleteOne: paymentApi.cancelPayment,
    onSuccess: () => dispatch(fetchAllPayments({})),
    entityName: 'payment',
    confirmTitle: 'Cancel selected payments?',
    confirmContent: (count) =>
      `This will cancel ${count} payment(s). Cancelled payments cannot be restored.`,
    successMessage: (count) => `Cancelled ${count} payment(s).`,
    getCheckboxProps: (record) => ({ disabled: record.bulkSelectDisabled }),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    dispatch(fetchAllPayments({}));
    dispatch(fetchAllSales());
    dispatch(fetchAllPurchaseOrders());
    dispatch(fetchAllCustomers());
    dispatch(fetchAllSuppliers());
  }, [dispatch]);

  const hasActiveFilters =
    searchTerm ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    customerFilter !== 'all' ||
    supplierFilter !== 'all' ||
    dateRange;

  const filtered = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    let list = [...payments];

    if (typeFilter !== 'all') {
      list = list.filter((p) => p.payment_type === typeFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (customerFilter !== 'all') {
      list = list.filter((p) => paymentMatchesCustomer(p, customerFilter, customers));
    }
    if (supplierFilter !== 'all') {
      list = list.filter((p) => paymentMatchesSupplier(p, supplierFilter, suppliers));
    }
    if (dateRange) {
      list = list.filter((p) => paymentInDateRange(p, dateRange));
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.payment_no?.toLowerCase().includes(q) ||
          p.party_name?.toLowerCase().includes(q) ||
          p.reference_no?.toLowerCase().includes(q) ||
          p.customer?.name?.toLowerCase().includes(q) ||
          p.supplier?.name?.toLowerCase().includes(q) ||
          p.transaction_id?.toLowerCase().includes(q) ||
          p.notes?.toLowerCase().includes(q),
      );
    }
    return list.sort(
      (a, b) => new Date(b.payment_date || b.createdAt) - new Date(a.payment_date || a.createdAt),
    );
  }, [
    payments,
    searchTerm,
    typeFilter,
    statusFilter,
    customerFilter,
    supplierFilter,
    dateRange,
    customers,
    suppliers,
  ]);

  const stats = useMemo(() => {
    const active = filtered.filter((p) => p.status !== 'cancelled');
    const saleRows = active.filter((p) => p.payment_type === 'sale');
    const purchaseRows = active.filter((p) => p.payment_type === 'purchase');
    const saleIn = saleRows.reduce((s, p) => s + Number(p.paid_amount || 0), 0);
    const purchaseOut = purchaseRows.reduce((s, p) => s + Number(p.paid_amount || 0), 0);
    return {
      count: filtered.length,
      saleCount: saleRows.length,
      purchaseCount: purchaseRows.length,
      saleIn,
      purchaseOut,
      netFlow: saleIn - purchaseOut,
    };
  }, [filtered]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [searchTerm, typeFilter, statusFilter, customerFilter, supplierFilter, dateRange]);

  const openPaymentDetail = (payment) => {
    setSelectedPayment(payment);
    setDetailVisible(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setCustomerFilter('all');
    setSupplierFilter('all');
    setDateRange(null);
  };

  useEffect(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    const page = filtered.slice(start, start + pagination.pageSize);
    setDataSource(
      page.map((p) => {
        const isCustomer = p.party_type === 'customer' || p.payment_type === 'sale';
        const partyLabel = isCustomer ? 'Customer' : 'Supplier';
        const partyName =
          p.party_name ||
          (isCustomer ? p.customer?.name : p.supplier?.name) ||
          '—';
        const invoiceOrOrderNo = p.reference_no || '—';
        return {
          key: p._id,
          id: p._id,
          bulkSelectDisabled: p.status === 'cancelled',
          payment_no: (
            <button
              type="button"
              onClick={() => openPaymentDetail(p)}
              style={{
                fontWeight: 600,
                color: '#1d4ed8',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
            >
              {p.payment_no}
            </button>
          ),
          type: (
            <Tag style={TYPE_TAG[p.payment_type] || darkTagStyle('#334155')}>
              {p.payment_type === 'sale' ? 'Sale' : 'Purchase'}
            </Tag>
          ),
          invoice_no: (
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
              {invoiceOrOrderNo}
            </span>
          ),
          party_type: (
            <Tag style={isCustomer ? PARTY_TAG.customer : PARTY_TAG.supplier}>
              {partyLabel}
            </Tag>
          ),
          party: <span style={{ fontWeight: 500 }}>{partyName}</span>,
          method: METHOD_LABELS[p.payment_method] || p.payment_method,
          amount: formatPkr(p.amount),
          paid: (
            <span style={{ fontWeight: 600, color: '#059669' }}>
              {formatPkr(p.paid_amount)}
            </span>
          ),
          remaining: formatPkr(p.remaining_amount),
          status: (
            <Tag style={STATUS_TAG[p.status] || STATUS_TAG.pending}>
              {(p.status || 'pending').toUpperCase()}
            </Tag>
          ),
          date: p.payment_date
            ? new Date(p.payment_date).toLocaleDateString()
            : '—',
          action: (
            <span style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <Button
                type="default"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => openPaymentDetail(p)}
              />
              {canDelete && p.status !== 'cancelled' && (
                <Popconfirm
                  title="Cancel this payment?"
                  onConfirm={() => {
                    dispatch(cancelPayment(p._id));
                    removeFromSelection(p._id);
                  }}
                >
                  <Button type="danger" size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              )}
            </span>
          ),
        };
      }),
    );
  }, [filtered, pagination, canDelete, dispatch, removeFromSelection]);

  const columns = [
    { title: 'Payment #', dataIndex: 'payment_no', key: 'payment_no' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Invoice / Order #', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: 'Party type', dataIndex: 'party_type', key: 'party_type', width: 110 },
    { title: 'Name', dataIndex: 'party', key: 'party' },
    { title: 'Method', dataIndex: 'method', key: 'method' },
    { title: 'Order total', dataIndex: 'amount', key: 'amount' },
    { title: 'Paid', dataIndex: 'paid', key: 'paid' },
    { title: 'Remaining', dataIndex: 'remaining', key: 'remaining' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: '', dataIndex: 'action', key: 'action', width: 88, align: 'center' },
  ];

  const handleCreate = async (payload) => {
    await dispatch(createPayment(payload));
    setModalVisible(false);
  };

  const customerOptions = useMemo(
    () =>
      [...(customers || [])]
        .filter((c) => c?.name)
        .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [customers],
  );

  const supplierOptions = useMemo(
    () =>
      [...(suppliers || [])]
        .filter((s) => s?.name)
        .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [suppliers],
  );

  return (
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title={<span className="page-title">Payments</span>}
          subTitle={
            <span className="page-sub">
              {loading ? 'Loading…' : `${stats.count} in view · ${Array.isArray(payments) ? payments.length : 0} total`}
            </span>
          }
          buttons={[
            canAdd && (
              <Button key="add" type="primary" onClick={() => setModalVisible(true)}>
                <PlusOutlined /> Record payment
              </Button>
            ),
          ]}
        />
      </ProjectHeader>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <div className="kpi-row">
              <div className="kpi-tile">
                
                <div className="kpi-label">
                  <DollarOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Payments
                </div>
                <div className="kpi-value">{stats.count}</div>
                <div className="kpi-hint">
                  {stats.saleCount} sale · {stats.purchaseCount} purchase
                </div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <ArrowUpOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Sales in
                </div>
                <div className="kpi-value" style={{ color: '#15803d' }}>
                  {formatPkr(stats.saleIn)}
                </div>
                <div className="kpi-hint">
                  {stats.saleCount} customer payment{stats.saleCount === 1 ? '' : 's'}
                </div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <ArrowDownOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Purchases out
                </div>
                <div className="kpi-value" style={{ color: '#9a3412' }}>
                  {formatPkr(stats.purchaseOut)}
                </div>
                
                <div className="kpi-hint">
                  {stats.purchaseCount} supplier payment{stats.purchaseCount === 1 ? '' : 's'}
                </div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <SwapOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Net flow
                </div>
                <div
                  className="kpi-value"
                  style={{ color: stats.netFlow >= 0 ? '#1d4ed8' : '#b91c1c' }}
                >
                  {formatPkr(stats.netFlow)}
                </div>
                <div className="kpi-hint">Sales in minus purchases out</div>
              </div>
            </div>

            <div className="table-shell">
              <div className="table-toolbar">
                <TableToolbarSearchRow
                  showBulkDelete={canDelete}
                  bulkCount={selectedRowKeys.length}
                  bulkLoading={bulkDeleting}
                  onBulkDelete={handleBulkDelete}
                  bulkLabel={
                    selectedRowKeys.length
                      ? `Cancel selected (${selectedRowKeys.length})`
                      : undefined
                  }
                >
                  <Input
                    prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
                    placeholder="Search payment no, invoice, party, notes…"
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </TableToolbarSearchRow>
                <div className="table-toolbar__filters" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <span className="table-toolbar__label">Date</span>
                  <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    allowClear
                    style={{ minWidth: 220 }}
                    format="DD MMM YYYY"
                  />
                  <span className="table-toolbar__label">Type</span>
                  <Select value={typeFilter} onChange={setTypeFilter} style={{ minWidth: 120 }}>
                    <Option value="all">All types</Option>
                    <Option value="sale">Sales</Option>
                    <Option value="purchase">Purchases</Option>
                  </Select>
                  <span className="table-toolbar__label">Status</span>
                  <Select value={statusFilter} onChange={setStatusFilter} style={{ minWidth: 120 }}>
                    <Option value="all">All statuses</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="partial">Partial</Option>
                    <Option value="paid">Paid</Option>
                    <Option value="overdue">Overdue</Option>
                  </Select>
                  <span className="table-toolbar__label">Customer</span>
                  <Select
                    showSearch
                    allowClear
                    placeholder="All customers"
                    value={customerFilter === 'all' ? undefined : customerFilter}
                    onChange={(v) => setCustomerFilter(v || 'all')}
                    style={{ minWidth: 160 }}
                    optionFilterProp="children"
                  >
                    {customerOptions.map((c) => (
                      <Option key={getEntityId(c)} value={String(getEntityId(c))}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                  <span className="table-toolbar__label">Supplier</span>
                  <Select
                    showSearch
                    allowClear
                    placeholder="All suppliers"
                    value={supplierFilter === 'all' ? undefined : supplierFilter}
                    onChange={(v) => setSupplierFilter(v || 'all')}
                    style={{ minWidth: 160 }}
                    optionFilterProp="children"
                  >
                    {supplierOptions.map((s) => (
                      <Option key={getEntityId(s)} value={String(getEntityId(s))}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                  {hasActiveFilters && (
                    <Button type="default" size="small" onClick={clearFilters} icon={<ClearOutlined />}>
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>

              <ProjectLists
                dataSource={dataSource}
                columns={columns}
                loading={loading || bulkDeleting}
                rowKey="key"
                rowSelection={canDelete ? rowSelection : undefined}
                pagination={{
                  ...pagination,
                  total: filtered.length,
                  onChange: (current, pageSize) => setPagination({ current, pageSize }),
                }}
              />
            </div>
          </Col>
        </Row>
      </Main>

      <RecordPaymentModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleCreate}
        sales={sales || []}
        purchaseOrders={purchaseorders || []}
        loading={loading}
      />

      <PaymentDetailModal
        visible={detailVisible}
        payment={selectedPayment}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedPayment(null);
        }}
      />
    </ScreenWrap>
  );
}

export default Payments;
