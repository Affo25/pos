/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select, Tag } from 'antd';
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreatePurchaseOrder from './CreatePurchaseOrder';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deletePurchaseOrder, fetchAllPurchaseOrders } from '../../redux/purchaseorders/purchaseorderSlice';
import { getComponentPermissions } from '../../config/utils/permission';
import { fetchAllSuppliers } from '../../redux/suppliers/supplierSlice';
import { exportListToExcel, exportListToPdf } from '../../utils/listExport';
import { ScreenWrap } from '../shared/procurementScreenStyles';

function formatStatusLabel(status) {
  if (!status) return '—';
  const s = String(status);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PurchaseOrders() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { purchaseorders, loading } = useSelector((state) => state.purchaseorders);
  const { suppliers } = useSelector((state) => state.suppliers);
  const { login: user } = useSelector(state => state.auth);
  const { canEdit, canDelete } = getComponentPermissions(user, 'PurchaseOrders');

  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedPurchaseOrder: null,
    selectedPurchaseOrderId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('all');

  const { notData, visible, selectedPurchaseOrder } = state;

  const handleEdit = (purchaseorder) => {
    const { _id: id, ...rest } = purchaseorder;

    setState({
      ...state,
      visible: true,
      selectedPurchaseOrder: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deletePurchaseOrder(id));

  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedPurchaseOrder: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedPurchaseOrder: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllPurchaseOrders());
    dispatch(fetchAllSuppliers());
  }, []);

  const filteredPurchaseOrders = useMemo(() => {
    if (!purchaseorders || !Array.isArray(purchaseorders)) return [];
    let filtered = [...purchaseorders];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.status?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (sortStatus !== 'all') {
      filtered = filtered.filter((item) => item.status?.toLowerCase() === sortStatus.toLowerCase());
    }

    filtered.sort((a, b) => {
      if (searchTerm) {
        if (a.order_number?.toLowerCase().includes(searchTerm.toLowerCase())) return -1;
        if (b.order_number?.toLowerCase().includes(searchTerm.toLowerCase())) return 1;
      }
      return 0;
    });

    return filtered;
  }, [purchaseorders, searchTerm, sortStatus]);

  const poStats = useMemo(() => {
    const list = filteredPurchaseOrders;
    const pending = list.filter((p) => p.status === 'pending').length;
    const received = list.filter((p) => p.status === 'received').length;
    return { total: list.length, pending, received };
  }, [filteredPurchaseOrders]);

  useEffect(() => {
    if (filteredPurchaseOrders.length) {
      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filteredPurchaseOrders.slice(start, end);

      const formatted = paginatedData.map((purchaseorder) => {
        const { _id, id, order_number,
          order_date,
          supplier_id,
          items,
          status, } = purchaseorder;

        const supplierName = supplier_id?.name || '—';
        const totalItems = items?.length || 0;
        const totalAmount = items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;

        const statusColor =
          status === 'received' ? 'success' : status === 'pending' ? 'warning' : 'error';

        return {
          key: _id || id,
          id: _id || id,
          order_number,
          order_date: new Date(order_date).toLocaleDateString(),
          supplier: supplierName,
          total_items: totalItems,
          total_amount: (
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {totalAmount.toFixed(2)}
            </span>
          ),
          status: (
            <Tag
              color={statusColor}
              style={{ fontSize: 14, padding: '4px 12px', margin: 0, borderRadius: 8 }}
            >
              {formatStatusLabel(status)}
            </Tag>
          ),
          action: (
            <Dropdown
              overlay={
                <Menu className="custom-dropdown-menu">
                  <Menu.Item disabled={!canEdit} key="edit" className="custom-menu-item" onClick={() => handleEdit(purchaseorder)}>
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
    } else {
      setDataSource([]);
    }
  }, [filteredPurchaseOrders, pagination, canEdit, canDelete]);

  const handleExportExcel = () => {
    if (!filteredPurchaseOrders.length) {
      message.warning('No data to export');
      return;
    }
    const headers = ['Order No', 'Order Date', 'Supplier', 'Line items', 'Total (PKR)', 'Status'];
    const rows = filteredPurchaseOrders.map((po) => {
      const supplierName = po.supplier_id?.name || '—';
      const totalAmount = po.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
      return [
        po.order_number,
        new Date(po.order_date).toLocaleDateString(),
        supplierName,
        po.items?.length || 0,
        totalAmount.toFixed(2),
        po.status || '',
      ];
    });
    exportListToExcel({
      filename: `purchase-orders-${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Purchase orders',
      headers,
      rows,
    });
    message.success('Excel file downloaded');
  };

  const handleExportPdf = () => {
    if (!filteredPurchaseOrders.length) {
      message.warning('No data to export');
      return;
    }
    const headers = ['Order No', 'Order Date', 'Supplier', 'Line items', 'Total (PKR)', 'Status'];
    const rows = filteredPurchaseOrders.map((po) => {
      const supplierName = po.supplier_id?.name || '—';
      const totalAmount = po.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
      return [
        po.order_number,
        new Date(po.order_date).toLocaleDateString(),
        supplierName,
        po.items?.length || 0,
        totalAmount.toFixed(2),
        po.status || '',
      ];
    });
    exportListToPdf({
      title: 'Purchase orders (current filters)',
      filename: `purchase-orders-${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows,
    });
    message.success('PDF file downloaded');
  };

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
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Order No',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 160,
      ellipsis: true,
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{text}</span>,
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      width: 130,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      ellipsis: true,
    },
    {
      title: 'Items',
      dataIndex: 'total_items',
      key: 'total_items',
      width: 88,
      align: 'center',
    },
    {
      title: 'Total (PKR)',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 130,
      align: 'right',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
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
          title={<span className="page-title">Purchase orders</span>}
          subTitle={
            <span className="page-sub">
              {loading ? 'Loading…' : `${filteredPurchaseOrders.length} orders in current view`}
            </span>
          }
          buttons={[
            <Button key="excel" outlined type="primary" size="default" onClick={handleExportExcel}>
              <FileExcelOutlined style={{ marginRight: 8 }} />
              Excel
            </Button>,
            <Button key="pdf" outlined type="primary" size="default" onClick={handleExportPdf}>
              <FilePdfOutlined style={{ marginRight: 8 }} />
              PDF
            </Button>,
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> New order
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
                  <ShoppingOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Total orders
                </div>
                <div className="kpi-value">{poStats.total}</div>
                <div className="kpi-hint">Matching filters</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <ClockCircleOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Pending
                </div>
                <div className="kpi-value" style={{ color: '#d97706' }}>
                  {poStats.pending}
                </div>
                <div className="kpi-hint">Awaiting receipt</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">
                  <CheckCircleOutlined style={{ marginRight: 6, opacity: 0.85 }} />
                  Received
                </div>
                <div className="kpi-value" style={{ color: '#059669' }}>
                  {poStats.received}
                </div>
                <div className="kpi-hint">Completed lines</div>
              </div>
            </div>

            <div className="toolbar-card">
              <ProjectSorting>
                <div className="project-sort-bar">
                  <div className="project-sort-search">
                    <AutoComplete
                      onSearch={handleSearch}
                      dataSource={notData}
                      placeholder="Search by order # or status"
                      patterns
                    />
                  </div>
                  <div className="sort-group">
                    <span style={{ display: 'flex', alignItems: 'center' }}>Status</span>
                    <Select defaultValue="all" onChange={(value) => setSortStatus(value)} style={{ minWidth: 140 }}>
                      <Select.Option value="all">All</Select.Option>
                      <Select.Option value="pending">Pending</Select.Option>
                      <Select.Option value="received">Received</Select.Option>
                      <Select.Option value="cancelled">Cancelled</Select.Option>
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
                total={filteredPurchaseOrders.length}
                current={pagination.current}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
                size="middle"
                scroll={{ x: 1020 }}
              />
            </div>
          </Col>
        </Row>
        <CreatePurchaseOrder
          visible={visible}
          onCancel={onCancel}
          purchaseorder={selectedPurchaseOrder}
          onSuccess={() => {
            dispatch(fetchAllPurchaseOrders());
          }}
        />
      </Main>
    </ScreenWrap>
  );
}

export default PurchaseOrders;