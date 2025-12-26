/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateTaskManagement from './CreateTaskManagement';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteTaskManagement, fetchAllTaskManagements } from '../../redux/taskmanagements/taskmanagementSlice';
import { getComponentPermissions } from '../../config/utils/permission';

function TaskManagements() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { taskmanagements, loading } = useSelector((state) => state.taskmanagements);
  const { login: user } = useSelector(state => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'TaskManagements');
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const [dataSource, setDataSource] = useState([]);
  console.log(taskmanagements, 'taskmanagements');

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedTaskManagement: null,
    selectedTaskManagementId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { notData, visible, selectedTaskManagement } = state;

  const handleEdit = (taskmanagement) => {
    const { _id: id, ...rest } = taskmanagement;

    setState({
      ...state,
      visible: true,
      selectedTaskManagement: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteTaskManagement(id, selectedBranchId));
    toast.success('Deleted successfully 🎉', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedTaskManagement: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedTaskManagement: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllTaskManagements(selectedBranchId));
    }
  }, [dispatch, selectedBranchId]);

  useEffect(() => {
    if (taskmanagements && Array.isArray(taskmanagements)) {
      let filtered = [...taskmanagements];

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

      const formatted = paginatedData.map((taskmanagement) => {
        const { _id, id, description, periority, assignedTo, assignedDate, endDate, status } = taskmanagement;
        return {
          key: _id || id,
          id: _id || id,
          description,
          periority,
          assignedTo,
          assignedDate,
          endDate,
          status,
          action: (
            <Dropdown
              overlay={
                <Menu className="custom-dropdown-menu">
                  <Menu.Item disabled={!canEdit} key="edit" className="custom-menu-item" onClick={() => handleEdit(taskmanagement)}>
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
  }, [taskmanagements, pagination, searchTerm, sortStatus]);

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
      width: 50,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Priority',
      dataIndex: 'periority',
      key: 'periority',
      render: (periority) => {
        if (periority === 'high') return <span className="color-danger">High</span>;
        if (periority === 'medium') return <span className="color-warning">Medium</span>;
        return <span className="color-success">Low</span>;
      },
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assignedDate',
      key: 'assignedDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'completed') return <span className="color-success">Approved</span>;
        if (status === 'in-progress') return <span className="color-warning">In Progress</span>;
        if (status === 'review') return <span className="color-info">Review</span>;
        return <span className="color-danger">Assigned</span>;
      },
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
          title="Task"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Tasks`}</>}
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create TaskManagement
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
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search taskmanagements" patterns />
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
                total={taskmanagements?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
              />
            </div>
          </Col>
        </Row>
        <CreateTaskManagement
          visible={visible}
          onCancel={onCancel}
          taskmanagement={selectedTaskManagement}
          onSuccess={() => {
            dispatch(fetchAllTaskManagements(selectedBranchId));
          }}
        />
      </Main>
    </>
  );
}

export default TaskManagements;