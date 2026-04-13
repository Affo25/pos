/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Styled from 'styled-components';
import { Row, Col, Menu, message, Dropdown, Select, Tag } from 'antd';
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
import { ScreenWrap } from '../shared/procurementScreenStyles';

/** Matches stock table: keeps grid within viewport; stacked cells */
const CategoryTableOuter = Styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  .category-cell-title {
    font-weight: 600;
    color: #0f172a;
    font-size: 14px;
    line-height: 1.35;
    word-break: break-word;
  }
  .category-cell-line {
    font-size: 12px;
    color: #64748b;
    line-height: 1.45;
    margin-top: 2px;
  }
  .category-cell-stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
`;

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

  const filteredCategories = useMemo(() => {
    if (!categorys || !Array.isArray(categorys)) return [];
    let filtered = [...categorys];

    if (searchTerm) {
      filtered = filtered.filter((item) => {
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
      return (a?.name || '').localeCompare(b?.name || '');
    });

    return filtered;
  }, [categorys, searchTerm, sortStatus]);

  useEffect(() => {
    if (filteredCategories.length) {
      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filteredCategories.slice(start, end);

      const formatted = paginatedData.map((category) => {
        const { _id, id, name, description, status } = category;
        return {
          key: _id || id,
          id: _id || id,
          name: name || 'Unnamed Category',
          description: description || 'No description',
          status: status || 'inactive',
          sourceCategory: category,
        };
      });
      setDataSource(formatted);
    } else {
      setDataSource([]);
    }
  }, [filteredCategories, pagination]);

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
      width: 44,
      align: 'center',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Category',
      key: 'category_block',
      ellipsis: true,
      render: (_, record) => (
        <div className="category-cell-stack">
          <div className="category-cell-title">{record.name}</div>
          <div className="category-cell-line">{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'success' : 'default'} style={{ margin: 0 }}>
          {record.status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 56,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const cat = record.sourceCategory;
        const cid = record.id;
        return (
          <Dropdown
            overlay={
              <Menu className="custom-dropdown-menu">
                <Menu.Item disabled={!canEdit} key="edit" className="custom-menu-item" onClick={() => handleEdit(cat)}>
                  <div className="custom-action-btn edit-btn">
                    <EditOutlined className="action-icon" />
                    <span className="action-label">Edit</span>
                  </div>
                </Menu.Item>
                <Menu.Item disabled={!canDelete} key="delete" className="custom-menu-item" onClick={() => handleDelete(cid)}>
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
        );
      },
    },
  ];

  return (
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title={<span className="page-title">Categories</span>}
          subTitle={
            <span className="page-sub">
              {loading ? 'Loading…' : `${filteredCategories.length} in view · ${categorys?.length || 0} total`}
            </span>
          }
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create Category
            </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
       
        <Row gutter={[20, 20]} style={{ width: '100%', maxWidth: '100%', marginInline: 0 }}>
          <Col xs={24} style={{ maxWidth: '100%', paddingInline: 0 }}>
            <div className="toolbar-card">
              <ProjectSorting>
                <div className="project-sort-bar">
                  <div className="project-sort-search" style={{ flex: 1, minWidth: 160, maxWidth: 480 }}>
                    <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search categories" patterns />
                  </div>
                  <div className="sort-group">
                    <span style={{ display: 'flex', alignItems: 'center' }}>Status</span>
                    <Select defaultValue="category" onChange={(value) => setSortStatus(value)} style={{ minWidth: 140 }}>
                      <Select.Option value="category">All</Select.Option>
                      <Select.Option value="active">Active</Select.Option>
                      <Select.Option value="inactive">Inactive</Select.Option>
                    </Select>
                  </div>
                </div>
              </ProjectSorting>
            </div>

            <CategoryTableOuter className="category-table-outer">
              <div className="table-shell">
                <ProjectLists
                  columns={columns}
                  dataSource={dataSource}
                  loading={loading}
                  total={filteredCategories.length}
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  onChange={handlePageChange}
                  onShowSizeChange={handleSizeChange}
                  size="middle"
                  scroll={{ x: 520 }}
                  rowKey="key"
                />
              </div>
            </CategoryTableOuter>
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
    </ScreenWrap>
  );
}

export default Categorys;