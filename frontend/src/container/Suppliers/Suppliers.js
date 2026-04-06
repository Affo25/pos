/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select } from 'antd';
import { TeamOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateSupplier from './CreateSupplier';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteSupplier, fetchAllSuppliers } from '../../redux/suppliers/supplierSlice';
import { getComponentPermissions } from '../../config/utils/permission';
import { ScreenWrap } from '../shared/procurementScreenStyles';

function Suppliers() {
  const history = useHistory();
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
          <Dropdown
            overlay={
              <Menu className="custom-dropdown-menu">
                <Menu.Item disabled={!canEdit} key="edit" className="custom-menu-item" onClick={() => handleEdit(supplier)}>
                  <div className="custom-action-btn edit-btn">
                    <EditOutlined className="action-icon" />
                    <span className="action-label">Edit</span>
                  </div>
                </Menu.Item>
                <Menu.Item disabled={!canDelete} key="delete" className="custom-menu-item" onClick={() => handleDelete(_id || id)}>
                  <div className="custom-action-btn delete-btn">
                    <DeleteOutlined className="action-icon" />
                    <span className="action-label">Delete</span>
                  </div>
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
            overlayClassName="custom-dropdown-overlay"
          >
            <Link to="#" className="text-dark dropdown-trigger">
              <FeatherIcon icon="more-horizontal" size={18} />
            </Link>
          </Dropdown>
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
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: 56,
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

            <div className="toolbar-card">
              <ProjectSorting>
                <div className="project-sort-bar">
                  <div className="project-sort-search">
                    <AutoComplete
                      onSearch={handleSearch}
                      dataSource={notData}
                      placeholder="Search name, email, or phone"
                      patterns
                    />
                  </div>
                  <div className="sort-group">
                    <span style={{ display: 'flex', alignItems: 'center' }}>Status</span>
                    <Select defaultValue="category" onChange={(value) => setSortStatus(value)} style={{ minWidth: 140 }}>
                      <Select.Option value="category">All</Select.Option>
                      <Select.Option value="Active">Active</Select.Option>
                      <Select.Option value="InActive">Inactive</Select.Option>
                    </Select>
                  </div>
                </div>
              </ProjectSorting>
            </div>

            <div className="table-shell">
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