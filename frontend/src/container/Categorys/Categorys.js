/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateCategory from './CreateCategory';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteCategory, fetchAllCategorys } from '../../redux/categorys/categorySlice';
import { getComponentPermissions } from '../../config/utils/permission';

function Categorys() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { categorys, loading } = useSelector((state) => state.categorys);
  const { login: user } = useSelector(state => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'Categorys');

  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedCategory: null,
    selectedCategoryId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { notData, visible, selectedCategory } = state;

  const handleEdit = (category) => {
    const { _id: id, ...rest } = category;

    setState({
      ...state,
      visible: true,
      selectedCategory: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteCategory(id));
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedCategory: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedCategory: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllCategorys());
  }, []);

  useEffect(() => {
    if (categorys && Array.isArray(categorys)) {
      let filtered = [...categorys];

      if (searchTerm) {
        filtered = filtered.filter((item) => {
          // ✅ Safe check for undefined values
          const itemName = item?.name || '';
          const itemStatus = item?.status || '';
          const searchTermLower = searchTerm.toLowerCase();
          
          return (
            itemName.toLowerCase().includes(searchTermLower) ||
            itemStatus.toLowerCase().includes(searchTermLower)
          );
        });
      }

      if (sortStatus !== 'category') {
        filtered = filtered.filter((item) => {
          // ✅ Safe check for status
          const itemStatus = item?.status || '';
          return itemStatus.toLowerCase() === sortStatus.toLowerCase();
        });
      }

      filtered.sort((a, b) => {
        if (searchTerm) {
          const aName = a?.name || '';
          const bName = b?.name || '';
          const searchTermLower = searchTerm.toLowerCase();
          
          if (aName.toLowerCase().includes(searchTermLower)) return -1;
          if (bName.toLowerCase().includes(searchTermLower)) return 1;
        }
        return 0;
      });

      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filtered.slice(start, end);

      const formatted = paginatedData.map((category) => {
        const { _id, id, name, description, status } = category;
        return {
          key: _id || id,
          id: _id || id,
          name: name || 'Unnamed Category', // ✅ Fallback for undefined name
          description: description || 'No description', // ✅ Fallback for undefined description
          status: status || 'inactive', // ✅ Fallback for undefined status
          action: (
            <Dropdown
              overlay={
                <Menu className="custom-dropdown-menu">
                  <Menu.Item disabled={!canEdit} key="edit" className="custom-menu-item" onClick={() => handleEdit(category)}>
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
  }, [categorys, pagination, searchTerm, sortStatus, canEdit, canDelete]);

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
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 50,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
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
          title="Categories"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Categories`}</>}
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create Category
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
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search categories" patterns />
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
            <div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                total={categorys?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
              />
            </div>
          </Col>
        </Row>
        <CreateCategory
          visible={visible}
          onCancel={onCancel}
          category={selectedCategory}
          onSuccess={() => {
            dispatch(fetchAllCategorys());
          }}
        />
      </Main>
    </>
  );
}

export default Categorys;