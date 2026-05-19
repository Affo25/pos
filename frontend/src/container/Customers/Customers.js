/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Input, Select } from 'antd';
import {
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  GiftOutlined,
  BookOutlined,
} from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import CreateCustomer from './CreateCustomer';
import CustomerLedgerModal from './CustomerLedgerModal';
import { formatPkr } from '../../config/currency';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteCustomer, fetchAllCustomers } from '../../redux/customers/customerSlice';
import * as customerApi from '../../redux/customers/customerService';
import { getComponentPermissions } from '../../config/utils/permission';
import { ScreenWrap } from '../shared/procurementScreenStyles';
import { useBulkDelete } from '../../hooks/useBulkDelete';
import TableToolbarSearchRow from '../../components/bulk/TableToolbarSearchRow';
import ModernModalStyles from '../shared/modalStyles';

const COL_W = 156;

function Customers() {
  const dispatch = useDispatch();
  const { customers, loading } = useSelector((state) => state.customers);
  const { login: user } = useSelector((state) => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'Customers');

  const {
    selectedRowKeys,
    bulkDeleting,
    rowSelection,
    handleBulkDelete,
    removeFromSelection,
  } = useBulkDelete({
    deleteOne: customerApi.deleteCustomer,
    onSuccess: () => dispatch(fetchAllCustomers()),
    entityName: 'customer',
  });

  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    visible: false,
    selectedCustomer: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [ledgerCustomer, setLedgerCustomer] = useState(null);

  const { visible, selectedCustomer } = state;

  const handleEdit = useCallback((customer) => {
    const { _id: id, ...rest } = customer;
    setState({
      visible: true,
      selectedCustomer: {
        ...rest,
        id,
      },
    });
  }, []);

  const handleDelete = (id) => {
    dispatch(deleteCustomer(id));
    dispatch(fetchAllCustomers());
    removeFromSelection(id);
  };

  const showModal = () => {
    setState({
      visible: true,
      selectedCustomer: null,
    });
  };

  const onCancel = () => {
    setState({
      visible: false,
      selectedCustomer: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  useEffect(() => {
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  const filteredCustomers = useMemo(() => {
    if (!customers || !Array.isArray(customers)) return [];
    let filtered = [...customers];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q) ||
          item.address?.toLowerCase().includes(q),
      );
    }

    if (filterType === 'with_email') {
      filtered = filtered.filter((item) => item.email?.trim());
    } else if (filterType === 'with_loyalty') {
      filtered = filtered.filter((item) => Number(item.loyalty_points || 0) > 0);
    }

    filtered.sort((a, b) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (a.name?.toLowerCase().includes(q)) return -1;
        if (b.name?.toLowerCase().includes(q)) return 1;
      }
      return (a.name || '').localeCompare(b.name || '');
    });

    return filtered;
  }, [customers, searchTerm, filterType]);

  const customerStats = useMemo(() => {
    const list = filteredCustomers;
    const withEmail = list.filter((c) => c.email?.trim()).length;
    const withLoyalty = list.filter((c) => Number(c.loyalty_points || 0) > 0).length;
    const totalAll = Array.isArray(customers) ? customers.length : 0;
    return { inView: list.length, withEmail, withLoyalty, totalAll };
  }, [filteredCustomers, customers]);

  useEffect(() => {
    if (!filteredCustomers.length) {
      setDataSource([]);
      return;
    }

    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const paginatedData = filteredCustomers.slice(start, end);

    const formatted = paginatedData.map((customer) => {
      const {
        _id,
        id,
        name,
        email,
        phone,
        address,
        loyalty_points: loyaltyPoints = 0,
        opening_balance: openingBalance,
      } = customer;
      const customerId = _id || id;

      return {
        key: customerId,
        id: customerId,
        name: <span style={{ fontWeight: 600, color: '#0f172a' }}>{name}</span>,
        opening_balance: (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            {formatPkr(openingBalance || 0)}
          </span>
        ),
        email: email ? (
          <span style={{ color: '#475569' }}>{email}</span>
        ) : (
          <span style={{ color: '#94a3b8' }}>—</span>
        ),
        phone: phone ? (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{phone}</span>
        ) : (
          <span style={{ color: '#94a3b8' }}>—</span>
        ),
        address: address ? (
          <span style={{ color: '#64748b' }}>{address}</span>
        ) : (
          <span style={{ color: '#94a3b8' }}>—</span>
        ),
        loyalty_points: (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0f172a' }}>
            {Number(loyaltyPoints || 0)}
          </span>
        ),
        action: (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => setLedgerCustomer(customer)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                border: '1px solid #BFDBFE',
                background: '#EFF6FF',
                cursor: 'pointer',
                color: '#1D4ED8',
              }}
              title="View ledger"
            >
              <BookOutlined style={{ fontSize: 14 }} />
            </button>
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => handleEdit(customer)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                border: '1px solid #E5E7EB',
                background: '#fff',
                cursor: canEdit ? 'pointer' : 'not-allowed',
                color: '#2D3142',
                opacity: canEdit ? 1 : 0.5,
              }}
              title="Edit"
            >
              <EditOutlined style={{ fontSize: 14 }} />
            </button>
            <button
              type="button"
              disabled={!canDelete}
              onClick={() => handleDelete(customerId)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                border: '1px solid #FEE2E2',
                background: '#FEF2F2',
                cursor: canDelete ? 'pointer' : 'not-allowed',
                color: '#EF4444',
                opacity: canDelete ? 1 : 0.5,
              }}
              title="Delete"
            >
              <DeleteOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
        ),
      };
    });
    setDataSource(formatted);
  }, [filteredCustomers, pagination, canEdit, canDelete, handleEdit]);

  const handlePageChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  const handleSizeChange = (current, size) => {
    setPagination({
      current: 1,
      pageSize: size,
    });
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 52,
      align: 'center',
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Opening bal.',
      dataIndex: 'opening_balance',
      key: 'opening_balance',
      width: 110,
      align: 'center',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: COL_W,
      align: 'center',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: COL_W,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Loyalty pts',
      dataIndex: 'loyalty_points',
      key: 'loyalty_points',
      width: 100,
      align: 'center',
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: 128,
      align: 'center',
      fixed: 'right',
    },
  ];

  return (
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title={<span className="page-title">Customers</span>}
          subTitle={
            <span className="page-sub">
              {loading ? 'Loading…' : `${customerStats.inView} customers in current view`}
            </span>
          }
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> New customer
            </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <div className="kpi-row">
              <div className="kpi-tile">
                <div className="kpi-label">
                  <TeamOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  In view
                </div>
                <div className="kpi-value">{customerStats.inView}</div>
                <div className="kpi-hint">Matching filters</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <MailOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  With email
                </div>
                <div className="kpi-value" style={{ color: '#4f46e5' }}>
                  {customerStats.withEmail}
                </div>
                <div className="kpi-hint">In current results</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <GiftOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Loyalty members
                </div>
                <div className="kpi-value" style={{ color: '#d97706' }}>
                  {customerStats.withLoyalty}
                </div>
                <div className="kpi-hint">Points &gt; 0</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <PhoneOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Directory size
                </div>
                <div className="kpi-value">{customerStats.totalAll}</div>
                <div className="kpi-hint">All customers</div>
              </div>
            </div>

            <div className="table-shell">
              <div className="table-toolbar">
                <TableToolbarSearchRow
                  showBulkDelete={canDelete}
                  bulkCount={selectedRowKeys.length}
                  bulkLoading={bulkDeleting}
                  onBulkDelete={handleBulkDelete}
                >
                  <Input
                    prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
                    placeholder="Search name, email, phone or address"
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </TableToolbarSearchRow>
                <div className="table-toolbar__filters">
                  <span className="table-toolbar__label">Filter</span>
                  <Select value={filterType} onChange={setFilterType} style={{ minWidth: 140 }}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="with_email">With email</Select.Option>
                    <Select.Option value="with_loyalty">With loyalty points</Select.Option>
                  </Select>
                </div>
              </div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading || bulkDeleting}
                total={filteredCustomers.length}
                current={pagination.current}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
                size="middle"
                scroll={{ x: 52 + COL_W * 4 + 110 + 128 }}
                tableLayout="fixed"
                rowKey="key"
                rowSelection={canDelete ? rowSelection : undefined}
              />
            </div>
          </Col>
        </Row>
        <ModernModalStyles />
        <CreateCustomer
          visible={visible}
          onCancel={onCancel}
          customer={selectedCustomer}
          onSuccess={() => dispatch(fetchAllCustomers())}
        />
        <CustomerLedgerModal
          visible={ledgerCustomer != null}
          onCancel={() => setLedgerCustomer(null)}
          customer={ledgerCustomer}
        />
      </Main>
    </ScreenWrap>
  );
}

export default Customers;
