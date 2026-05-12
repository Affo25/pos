/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Input, Select, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import CreateCategory from './CreateCategory';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteCategory, fetchAllCategorys } from '../../redux/categorys/categorySlice';
import { getComponentPermissions } from '../../config/utils/permission';
import { ScreenWrap } from '../shared/procurementScreenStyles';

function Categorys() {
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
      title: 'Action',
      key: 'action',
      width: 90,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const cat = record.sourceCategory;
        const cid = record.id;
        return (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button type="button" disabled={!canEdit} onClick={() => handleEdit(cat)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#2D3142' }} title="Edit"><EditOutlined style={{ fontSize: 14 }} /></button>
            <button type="button" disabled={!canDelete} onClick={() => handleDelete(cid)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #FEE2E2', background: '#FEF2F2', cursor: 'pointer', color: '#EF4444' }} title="Delete"><DeleteOutlined style={{ fontSize: 14 }} /></button>
          </div>
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
       
        <Row gutter={25}>
          <Col xs={24}>
            <div className="table-shell">
              <div className="table-toolbar">
                <div className="table-toolbar__search">
                  <Input
                    prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
                    placeholder="Search categories"
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="table-toolbar__filters">
                  <span className="table-toolbar__label">Status</span>
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)} style={{ minWidth: 140 }}>
                    <Select.Option value="category">All</Select.Option>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                  </Select>
                </div>
              </div>
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