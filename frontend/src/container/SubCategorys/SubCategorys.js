/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select, Space, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateSubCategory from './CreateSubCategory';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteSubCategory, fetchAllSubCategorys } from '../../redux/subcategorys/subcategorySlice';
import { getComponentPermissions } from '../../config/utils/permission';
import { fetchAllCategorys } from '../../redux/categorys/categorySlice';

function SubCategorys() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { subcategorys, loading } = useSelector((state) => state.subcategorys);
  const { categorys } = useSelector((state) => state.categorys);
  const { login: user } = useSelector(state => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'SubCategorys');

  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedSubCategory: null,
    selectedSubCategoryId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { notData, visible, selectedSubCategory } = state;

  const handleEdit = (subcategory) => {
    const { _id: id, ...rest } = subcategory;

    setState({
      ...state,
      visible: true,
      selectedSubCategory: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = async (id, name) => {
    try {
      await dispatch(deleteSubCategory(id)).unwrap();
      message.success(`SubCategory "${name}" deleted successfully`);
      dispatch(fetchAllSubCategorys());
    } catch (error) {
      message.error(error.message || 'Failed to delete subcategory');
    }
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedSubCategory: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedSubCategory: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllSubCategorys());
  }, []);

  // Fetch categories when component mounts
  useEffect(() => {
    if (!categorys || categorys.length === 0) {
      dispatch(fetchAllCategorys());
    }
  }, []);

  useEffect(() => {
    if (subcategorys && Array.isArray(subcategorys)) {
      let filtered = [...subcategorys];

      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.status || '').toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      if (sortStatus !== 'category') {
        filtered = filtered.filter((item) => 
          (item.status || '').toLowerCase() === sortStatus.toLowerCase()
        );
      }

      filtered.sort((a, b) => {
        if (searchTerm) {
          const aName = a.name || '';
          const bName = b.name || '';
          if (aName.toLowerCase().includes(searchTerm.toLowerCase())) return -1;
          if (bName.toLowerCase().includes(searchTerm.toLowerCase())) return 1;
        }
        return 0;
      });

      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filtered.slice(start, end);

      const formatted = paginatedData.map((subcategory) => {
        const { _id, id, name, category_id, status, description } = subcategory;
        const categoryName =
          categorys?.find(cat => cat._id === category_id)?.name || '—';

        return {
          key: _id || id,
          id: _id || id,
          name: name || 'Unnamed',
          category: categoryName,
          description: description || '—',
          status: status === 'active' ? (
            <span className="color-success" style={{ fontWeight: 500, fontSize: '12px' }}>Active</span>
          ) : (
            <span className="color-danger" style={{ fontWeight: 500, fontSize: '12px' }}>Inactive</span>
          ),
         action: (
  <Space size="small" style={{ gap: '6px' }}>
    <Button
      disabled={!canEdit}
      type="primary"
      size="small"
      style={{
        backgroundColor: '#1890ff',
        borderColor: '#1890ff',
        borderRadius: '4px',
        height: '28px',
        padding: '0 8px',
        fontSize: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 1px 2px rgba(24, 144, 255, 0.2)',
      }}
      onClick={() => handleEdit(subcategory)}
    >
      <EditOutlined style={{ fontSize: '12px' }} />
      Edit
    </Button>
    
    <Popconfirm
      title="Delete SubCategory"
      description={`Delete "${name}"?`}
      onConfirm={() => handleDelete(_id || id, name)}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{ danger: true, size: 'small' }}
    >
      <Button
        disabled={!canDelete}
        type="primary"
        danger
        size="small"
        style={{
          backgroundColor: '#ff4d4f',
          borderColor: '#ff4d4f',
          borderRadius: '4px',
          height: '28px',
          padding: '0 8px',
          fontSize: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: 'white',
          boxShadow: '0 1px 2px rgba(255, 77, 79, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ff7875';
          e.currentTarget.style.borderColor = '#ff7875';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ff4d4f';
          e.currentTarget.style.borderColor = '#ff4d4f';
        }}
      >
        <DeleteOutlined style={{ fontSize: '12px' }} />
        Delete
      </Button>
    </Popconfirm>
  </Space>
),
        };
      });
      setDataSource(formatted);
    }
  }, [subcategorys, categorys, pagination, searchTerm, sortStatus, canEdit, canDelete]);

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
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      align: 'center',
      fixed: 'right',
    },
  ];

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title="SubCategories"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} SubCategories`}</>}
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create SubCategory
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
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search subcategories" patterns />
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
                total={subcategorys?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
                scroll={{ x: 800 }}
              />
            </div>
          </Col>
        </Row>
        <CreateSubCategory
          visible={visible}
          onCancel={onCancel}
          subcategory={selectedSubCategory}
          onSuccess={() => {
            dispatch(fetchAllSubCategorys());
          }}
        />
      </Main>
    </>
  );
}

export default SubCategorys;