/* eslint-disable object-shorthand */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreatePage from './CreatePage';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deletePage, fetchAllPages } from '../../redux/pages/pageSlice';
import { getComponentPermissions } from '../../config/utils/permission';

function Page() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { pages, loading } = useSelector((state) => state.pages);
  const [dataSource, setDataSource] = useState([]);
  const { login: user } = useSelector(state => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'Pages');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedPage: null,
    selectedPageId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { notData, visible, selectedPage } = state;

  const handleEditPage = (page) => {
    const { _id: id, ...rest } = page;

    setState({
      ...state,
      visible: true,
      selectedPage: {
        ...rest,
        id,
      },
    });
  };

  const handleDeletePage = (id) => {
    dispatch(deletePage(id));
    toast.success('Delete successfully 🎉', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const handleManagePage = (page, pageId) => {
    if (!page) return;

    const id = pageId;
    if (!id) {
      console.error('No page ID found');
      return;
    }

    history.push({
      pathname: `/page-settings/${id}`,
      state: {
        pageId: id,
        dataKey: page.dataKey || 'Untitled Page',
      },
    });
  };


  // const handleCreateTable = (page, pageId) => {
  //   if (!page) return;

  //   const id = pageId;
  //   if (!id) {
  //     console.error('No page ID found');
  //     return;
  //   }

  //   const title = page.title || 'Untitled';
  //   const url = `/page-data/${id}?title=${title}`;
  //   window.open(url, '_blank');
  // };



  // const handleManagePage = (page) => {
  //   const dataKey = page.data_key || page.dataKey;
  //   if (!dataKey) {
  //     console.error('No data_key found');
  //     return;
  //   }

  //   history.push({
  //     pathname: `/page-settings/${dataKey}`,
  //     state: {
  //       dataKey: dataKey,
  //       pageTitle: page.title || 'Untitled Page',
  //     },
  //   });
  // };

  const handleCreateTable = (page) => {
    if (!page) return;

    const dataKey = page.data_key || page.dataKey;

    if (!dataKey) {
      console.error('Data Key missing');
      return;
    }

    const url = `/page-data/${dataKey}`;
    window.open(url, '_blank');
  };



  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedPage: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedPage: null,
    });
  };

  useEffect(() => {
    const loadPages = async () => {
      try {
        await dispatch(fetchAllPages());
      } catch (error) {
        console.error('Failed to load Pages:', error);
        message.error('Failed to load Pages');
      }
    };
    loadPages();
  }, [dispatch]);

  useEffect(() => {
    if (pages && Array.isArray(pages)) {
      let filtered = [...pages];

      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      if (sortStatus !== 'category') {
        filtered = filtered.filter((item) => item.status.toLowerCase() === sortStatus.toLowerCase());
      }

      filtered.sort((a, b) => {
        if (searchTerm) {
          if (a.title.toLowerCase().includes(searchTerm.toLowerCase())) return -1;
          if (b.title.toLowerCase().includes(searchTerm.toLowerCase())) return 1;
        }
        return 0;
      });
      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedPages = filtered.slice(start, end);
      const formatted = paginatedPages.map((page) => {
        const { _id, id, title, status, data_key: dataKey, page_key: pagekey, createdOn } = page;
        return {
          key: _id || id,
          id: _id || id,
          title,
          pagekey,
          status:
            status === 'active' ? (
              <span className="color-success">Active</span>
            ) : (
              <span className="color-danger">Inactive</span>
            ),
          dataKey: dataKey || 'N/A',
          createdOn: new Date(createdOn).toLocaleDateString(),
          action: (
            <Dropdown
              overlay={
                <Menu className="custom-dropdown-menu">
                  <Menu.Item disabled={!canEdit} key="edit" className="custom-menu-item" onClick={() => handleEditPage(page)}>
                    <div className="custom-action-btn edit-btn">
                      <EditOutlined className="action-icon" />
                      <span className="action-label">Edit</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item disabled={!canDelete} key="delete" className="custom-menu-item" onClick={() => handleDeletePage(_id || id)}>
                    <div className="custom-action-btn delete-btn">
                      <DeleteOutlined className="action-icon" />
                      <span className="action-label">Delete</span>
                    </div>
                  </Menu.Item>

                  <Menu.Item
                    key="manage"
                    className="custom-menu-item"
                    onClick={() => handleManagePage(page, _id || id)}
                  >
                    <div className="custom-action-btn setting-btn">
                      <SettingOutlined className="action-icon" />
                      <span className="action-label">Manage</span>
                    </div>
                  </Menu.Item>

                  <Menu.Item
                    key="pagelink"
                    className="custom-menu-item"
                    onClick={() => handleCreateTable(page)}
                  >
                    <div className="custom-action-btn link-btn">
                      <LinkOutlined className="action-icon" />
                      <span className="action-label">Pgae Links</span>
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
  }, [pages, pagination, searchTerm, sortStatus]);

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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'URL',
      dataIndex: 'pagekey',
      key: 'pagekey',
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Data Key',
      dataIndex: 'dataKey',
      key: 'dataKey',
    },
    {
      title: 'Created On',
      dataIndex: 'createdOn',
      key: 'createdOn',
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
          title="Pages"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Running Pages`}</>}
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create Pages
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
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search pages" patterns />
                </div>
                <div className="sort-group">
                  <span style={{ display: 'flex', alignItems: 'center' }}>Sort By:</span>
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)}>
                    <Select.Option value="category">All</Select.Option>
                    <Select.Option value="Active">active</Select.Option>
                    <Select.Option value="InActive">inactive</Select.Option>
                  </Select>
                </div>
              </div>
            </ProjectSorting>
            <div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                total={pages?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
              />
            </div>
          </Col>
        </Row>
        <CreatePage onCancel={onCancel} visible={visible} page={selectedPage} />
      </Main>
    </>
  );
}

export default Page;
