/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateEvent from './CreateEvent';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteEvent, fetchAllEvents } from '../../redux/events/eventSlice';
import { getComponentPermissions } from '../../config/utils/permission';
import Grid from '../../config/default/Grid';

function Events() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const { login: user } = useSelector((state) => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'Events');
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedEvent: null,
    selectedEventId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { notData, visible, selectedEvent } = state;

  const handleEdit = (event) => {
    const { _id: id, ...rest } = event;

    setState({
      ...state,
      visible: true,
      selectedEvent: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteEvent(id, selectedBranchId));
    toast.success('Deleted successfully 🎉', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedEvent: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedEvent: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllEvents(selectedBranchId));
    }
  }, [dispatch, selectedBranchId]);

  useEffect(() => {
    if (events && Array.isArray(events)) {
      let filtered = [...events];

      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())

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

      const formatted = paginatedData.map((event) => {
        const { _id, id, eventImage, eventName, totalDays, eventDate, number } = event;
        return {
          key: _id || id,
          id: _id || id,
          eventName,
          totalDays,
          eventDate,
          eventImage,
          number,
          action: (
            <Dropdown
              overlay={
                <Menu className="custom-dropdown-menu">
                  <Menu.Item
                    disabled={!canEdit}
                    key="edit"
                    className="custom-menu-item"
                    onClick={() => handleEdit(event)}
                  >
                    <div className="custom-action-btn edit-btn">
                      <EditOutlined className="action-icon" />
                      <span className="action-label">Edit</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item
                    disabled={!canDelete}
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
  }, [events, pagination, searchTerm]);

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
    // {
    //   title: '#',
    //   key: 'index',
    //   render: (text, record, index) =>
    //     (pagination.current - 1) * pagination.pageSize + index + 1,
    // },
    {
      title: 'Event Name',
      dataIndex: 'eventName',
      key: 'eventName',
    },
    {
      title: 'Total Days',
      dataIndex: 'totalDays',
      key: 'totalDays',
    },
    {
      title: 'Event Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
    },
  ];


  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title="Events"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Events`}</>}
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Add Event
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
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search events" patterns />
                </div>
                {/* <div className="sort-group">
                  <span style={{ display: 'flex', alignItems: 'center' }}>Sort By:</span>
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)}>
                    <Select.Option value="category">All</Select.Option>
                    <Select.Option value="Active">active</Select.Option>
                    <Select.Option value="InActive">inactive</Select.Option>
                  </Select>
                </div> */}
              </div>
            </ProjectSorting>
            <div>
              <Grid
                dataSource={dataSource}
                loading={loading}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
                columns={columns}
              />
            </div>
          </Col>
        </Row>
        <CreateEvent
          visible={visible}
          onCancel={onCancel}
          event={selectedEvent}
          onSuccess={() => {
            dispatch(fetchAllEvents(selectedBranchId));
          }}
        />
      </Main>
    </>
  );
}

export default Events;
