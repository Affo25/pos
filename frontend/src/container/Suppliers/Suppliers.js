/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Input, Select } from 'antd';
import { TeamOutlined, MailOutlined, PhoneOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import CreateSupplier from './CreateSupplier';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteSupplier, fetchAllSuppliers } from '../../redux/suppliers/supplierSlice';
import { getComponentPermissions } from '../../config/utils/permission';
import { ScreenWrap } from '../shared/procurementScreenStyles';

function Suppliers() {
  const dispatch = useDispatch();
  const { suppliers, loading } = useSelector((state) => state.suppliers);
  const { login: user } = useSelector(state => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'Suppliers');

  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedSupplier: null,
    selectedSupplierId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { notData, visible, selectedSupplier } = state;

  const handleEdit = (supplier) => {
    const { _id: id, ...rest } = supplier;

    setState({
      ...state,
      visible: true,
      selectedSupplier: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteSupplier(id));

  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedSupplier: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedSupplier: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllSuppliers());
  }, []);

  const filteredSuppliers = useMemo(() => {
    if (!suppliers || !Array.isArray(suppliers)) return [];
    let filtered = [...suppliers];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          (item.status && item.status.toLowerCase().includes(q)) ||
          item.email?.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q),
      );
    }

    if (sortStatus !== 'category') {
      filtered = filtered.filter(
        (item) => item.status?.toLowerCase() === sortStatus.toLowerCase(),
      );
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
  }, [suppliers, searchTerm, sortStatus]);

  const supplierStats = useMemo(() => {
    const all = Array.isArray(suppliers) ? suppliers.length : 0;
    const withEmail = filteredSuppliers.filter((s) => s.email?.trim()).length;
    return { totalAll: all, inView: filteredSuppliers.length, withEmail };
  }, [suppliers, filteredSuppliers]);

  useEffect(() => {
    if (!filteredSuppliers.length) {
      setDataSource([]);
      return;
    }

    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const paginatedData = filteredSuppliers.slice(start, end);

    const formatted = paginatedData.map((supplier) => {
      const { _id, id, name, email, phone, address } = supplier;
      return {
        key: _id || id,
        id: _id || id,
        name: <span style={{ fontWeight: 600, color: '#0f172a' }}>{name}</span>,
        email: email || <span style={{ color: '#94a3b8' }}>—</span>,
        phone: phone || <span style={{ color: '#94a3b8' }}>—</span>,
        address: address || <span style={{ color: '#94a3b8' }}>—</span>,
        action: (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button type="button" disabled={!canEdit} onClick={() => handleEdit(supplier)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#2D3142' }} title="Edit"><EditOutlined style={{ fontSize: 14 }} /></button>
            <button type="button" disabled={!canDelete} onClick={() => handleDelete(_id || id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #FEE2E2', background: '#FEF2F2', cursor: 'pointer', color: '#EF4444' }} title="Delete"><DeleteOutlined style={{ fontSize: 14 }} /></button>
          </div>
        ),
      };
    });
    setDataSource(formatted);
  }, [filteredSuppliers, pagination, canEdit, canDelete]);

  const handlePageChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  const handleSizeChange = (current, size) => {
    setPagination({
      ...pagination,
      current: 1,
      pageSize: size,
    });
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 56,
      align: 'center',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Supplier',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 90,
      align: 'center',
      fixed: 'right',
    },
  ];

  return (
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title={<span className="page-title">Suppliers</span>}
          subTitle={
            <span className="page-sub">
              {loading ? 'Loading…' : `${supplierStats.inView} in view · ${supplierStats.totalAll} total`}
            </span>
          }
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Add supplier
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
                <div className="kpi-value">{supplierStats.inView}</div>
                <div className="kpi-hint">After search & filters</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <MailOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  With email
                </div>
                <div className="kpi-value" style={{ color: '#4f46e5' }}>
                  {supplierStats.withEmail}
                </div>
                <div className="kpi-hint">In current results</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <PhoneOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Directory size
                </div>
                <div className="kpi-value">{supplierStats.totalAll}</div>
                <div className="kpi-hint">All suppliers</div>
              </div>
            </div>

            <div className="table-shell">
              <div className="table-toolbar">
                <div className="table-toolbar__search">
                  <Input
                    prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
                    placeholder="Search name, email, or phone"
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="table-toolbar__filters">
                  <span className="table-toolbar__label">Status</span>
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)} style={{ minWidth: 140 }}>
                    <Select.Option value="category">All</Select.Option>
                    <Select.Option value="Active">Active</Select.Option>
                    <Select.Option value="InActive">Inactive</Select.Option>
                  </Select>
                </div>
              </div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                total={filteredSuppliers.length}
                current={pagination.current}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
                size="middle"
                scroll={{ x: 960 }}
              />
            </div>
          </Col>
        </Row>
        <CreateSupplier
          visible={visible}
          onCancel={onCancel}
          supplier={selectedSupplier}
          onSuccess={() => {
            dispatch(fetchAllSuppliers());
          }}
        />
      </Main>
    </ScreenWrap>
  );
}

export default Suppliers;