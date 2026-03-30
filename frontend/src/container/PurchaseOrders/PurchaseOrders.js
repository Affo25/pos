/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
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

function PurchaseOrders() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { purchaseorders, loading } = useSelector((state) => state.purchaseorders);
  const { suppliers } = useSelector((state) => state.suppliers);
  const { login: user } = useSelector(state => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'PurchaseOrders');

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
  const [sortStatus, setSortStatus] = useState('category');

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

  useEffect(() => {
    if (purchaseorders && Array.isArray(purchaseorders)) {
      let filtered = [...purchaseorders];

      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      if (sortStatus !== 'category') {
        filtered = filtered.filter((item) => item.status.toLowerCase() === sortStatus.toLowerCase());
      }

      filtered.sort((a, b) => {
        if (searchTerm) {
          if (a.name.toLowerCase().includes(searchTerm.toLowerCase())) return -1;
          if (b.name.toLowerCase().includes(searchTerm.toLowerCase())) return 1;
        }
        return 0;
      });

      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filtered.slice(start, end);

      const formatted = paginatedData.map((purchaseorder) => {
        const { _id, id, order_number,
          order_date,
          supplier_id,
          status, } = purchaseorder;

        const supplierName =
          suppliers.find(cat => cat._id === supplier_id)?.name || '—';

        return {
          key: _id || id,
          id: _id || id,
          order_number,
          order_date: new Date(order_date).toLocaleDateString(),
          supplier: supplierName,
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
    }
  }, [purchaseorders, pagination, searchTerm, sortStatus]);

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
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} PurchaseOrders`}</>}
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
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
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)}>
                    <Select.Option value="category">All</Select.Option>
                    <Select.Option value="Active">Active</Select.Option>
                    <Select.Option value="InActive">Inactive</Select.Option>
                  </Select>
                </div>
              </div>
            </ProjectSorting>
            <div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                total={purchaseorders?.length || 0}
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