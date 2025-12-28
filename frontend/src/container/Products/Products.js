/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, Dropdown, Select } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateProduct from './CreateProduct';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteProduct, fetchAllProducts } from '../../redux/products/productSlice';

function Products() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [state, setState] = useState({
    notData: [],
    visible: false,
    selectedProduct: null,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { notData, visible, selectedProduct } = state;

  const handleEdit = (product) => {
    const { _id: id, ...rest } = product;

    setState({
      ...state,
      visible: true,
      selectedProduct: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
    toast.success('Deleted successfully 🎉', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedProduct: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedProduct: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products && Array.isArray(products)) {
      let filtered = [...products];

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((item) => (item.name || '').toLowerCase().includes(term));
      }

      if (sortStatus !== 'category') {
        filtered = filtered.filter((item) => item.status.toLowerCase() === sortStatus.toLowerCase());
      }

      filtered.sort((a, b) => {
        if (!searchTerm) return 0;
        const term = searchTerm.toLowerCase();
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (nameA.includes(term)) return -1;
        if (nameB.includes(term)) return 1;
        return 0;
      });

      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filtered.slice(start, end);

      const formatted = paginatedData.map((product) => {
        const {
          _id,
          id,
          name,
          sku,
          unit,
          cost_price,
          selling_price,
          total_stock,
          status,
        } = product;

        return {
          key: _id || id,
          id: _id || id,
          name,
          sku,
          unit,
          cost_price,
          selling_price,
          total_stock,
          status:
            status === 'active' ? (
              <span className="color-success">Active</span>
            ) : (
              <span className="color-danger">Inactive</span>
            ),
          action: (
            <Dropdown
              overlay={
                <Menu className="custom-dropdown-menu">
                  <Menu.Item key="edit" className="custom-menu-item" onClick={() => handleEdit(product)}>
                    <div className="custom-action-btn edit-btn">
                      <EditOutlined className="action-icon" />
                      <span className="action-label">Edit</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item key="delete" className="custom-menu-item" onClick={() => handleDelete(_id || id)}>
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
  }, [products, pagination, searchTerm, sortStatus]);

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
    { title: '#', key: 'index', render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1, width: 50 },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Product Name', dataIndex: 'name', key: 'name' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    { title: 'Cost Price', dataIndex: 'cost_price', key: 'cost_price' },
    { title: 'Selling Price', dataIndex: 'selling_price', key: 'selling_price' },
    { title: 'Total Stock', dataIndex: 'total_stock', key: 'total_stock' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Action', dataIndex: 'action', key: 'action' },
  ];

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title="Products"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Products`}</>}
          buttons={[
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create Product
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
                  <AutoComplete
                    onSearch={handleSearch}
                    dataSource={notData}
                    placeholder="Search products"
                    patterns
                  />
                </div>
                <div className="sort-group">
                  <span style={{ display: 'flex', alignItems: 'center' }}>Sort By:</span>
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)}>
                    <Select.Option value="category">All</Select.Option>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                  </Select>
                </div>
              </div>
            </ProjectSorting>
            <ProjectLists
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              total={products?.length || 0}
              pageSize={pagination.pageSize}
              onChange={handlePageChange}
              onShowSizeChange={handleSizeChange}
            />
          </Col>
        </Row>
        <CreateProduct visible={visible} onCancel={onCancel} product={selectedProduct} />
      </Main>
    </>
  );
}

export default Products;
