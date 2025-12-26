
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, Dropdown, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import CreateUser from './CreateUser';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteUser, fetchAllUsers } from '../../redux/users/userSlice';
import ProjectLists from '../../config/default/List';
import { getComponentPermissions } from '../../config/utils/permission';

function Users() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);
  const { login: loggedInUser } = useSelector((state) => state.auth);
  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    selectedUser: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('all');

  const { notData, visible, selectedUser } = state;

  const handleEdit = (user) => {
    const { _id: id } = user;
    setState({
      ...state,
      visible: true,
      selectedUser: {
        ...user,
        id: id || user.id,
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteUser(id));
      toast.success('User deleted successfully 🎉');
      dispatch(fetchAllUsers());
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedUser: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedUser: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (users && Array.isArray(users)) {
      const roleHierarchy = ['superAdmin', 'admin', 'modertor', 'client', 'user'];
      const loggedInIndex = roleHierarchy.indexOf(loggedInUser?.user_type);
      let filtered = users.filter((item) => {
        const itemIndex = roleHierarchy.indexOf(item.user_type);
        return itemIndex > loggedInIndex;
      });

      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      if (sortStatus !== 'all') {
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

      const formatted = paginatedData.map((user, index) => {
        const { _id, id, name, email, status, user_type: userType } = user;
        return {
          key: _id || id,
          index: start + index + 1,
          id: _id || id,
          name,
          email,
          user_type: userType,
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
                  <Menu.Item
                    key="edit"
                    className="custom-menu-item"
                    onClick={() => handleEdit(user)}
                  >
                    <div className="custom-action-btn edit-btn">
                      <EditOutlined className="action-icon" />
                      <span className="action-label">Edit</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item
                    key="delete"
                    className="custom-menu-item"
                    onClick={() => handleDelete(_id || id)}
                  >
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
  }, [users, pagination, searchTerm, sortStatus, loggedInUser]);

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 50,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'User Type',
      dataIndex: 'user_type',
      key: 'user_type',
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
          title="Users"
          subTitle={<>{loading ? 'Loading...' : `${dataSource?.length || 0} Running Users`}</>}
          buttons={[
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create User
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
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search users" patterns />
                </div>
                <div className="sort-group">
                  <span style={{ display: 'flex', alignItems: 'center' }}>Sort By:</span>
                  <Select defaultValue="all" onChange={setSortStatus}>
                    <Select.Option value="all">All</Select.Option>
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
              pagination={{
                ...pagination,
                total: users?.length || 0,
                showSizeChanger: true,
                onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                onShowSizeChange: (current, size) => setPagination({ current: 1, pageSize: size }),
              }}
            />
          </Col>
        </Row>
        <CreateUser visible={visible} onCancel={onCancel} user={selectedUser} />
      </Main>
    </>
  );
}

export default Users;
