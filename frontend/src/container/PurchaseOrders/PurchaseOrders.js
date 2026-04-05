/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
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

        return {
          key: _id || id,
          id: _id || id,
          order_number,
          order_date: new Date(order_date).toLocaleDateString(),
          supplier: supplierName,
          total_items: totalItems,
          total_amount: totalAmount.toFixed(2),
          status: (
            <span
              className={
                status === 'received'
                  ? 'color-success'
                  : status === 'pending'
                    ? 'color-warning'
                    : 'color-danger'
              }
            >
              {status}
            </span>
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
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Order No',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Items',
      dataIndex: 'total_items',
      key: 'total_items',
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
  ];


  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title="PurchaseOrders"
          subTitle={<>{loading ? 'Loading...' : `${filteredPurchaseOrders.length} Purchase orders`}</>}
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
              <FeatherIcon icon="plus" size={16} /> Create PurchaseOrder
            </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <ProjectSorting>
              <div className="project-sort-bar">
                <div className="project-sort-search">
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search purchaseorders" patterns />
                </div>
                <div className="sort-group">
                  <span style={{ display: 'flex', alignItems: 'center' }}>Sort By:</span>
                  <Select defaultValue="all" onChange={(value) => setSortStatus(value)}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="received">Received</Select.Option>
                    <Select.Option value="cancelled">Cancelled</Select.Option>
                  </Select>
                </div>
              </div>
            </ProjectSorting>
            <div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                total={filteredPurchaseOrders.length}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
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
    </>
  );
}

export default PurchaseOrders;