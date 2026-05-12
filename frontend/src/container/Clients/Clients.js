/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, message, Select, Input } from 'antd';
import { EditOutlined, DeleteOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateClient from './CreateClient';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteClient, fetchAllClients } from '../../redux/clients/clientSlice';
import { ScreenWrap } from '../shared/procurementScreenStyles';

function Clients() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { clients, loading } = useSelector((state) => state.clients);
  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedClient: null,
    selectedClientId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { visible, selectedClient } = state;

  const handleEdit = (client) => {
    const { _id: id, ...rest } = client;

    setState({
      ...state,
      visible: true,
      selectedClient: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteClient(id));
    toast.success('Deleted successfully 🎉', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const handleManage = (client, clientId) => {
    if (!client) return;

    const id = clientId;
    if (!id) {
      console.error('No client ID found');
      return;
    }

    history.push({
      pathname: `/admin/clients-settings/${id}`,
      state: {
        clientId: id,
        clientTitle: client.title || 'Untitled Client',
      },
    });
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedClient: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedClient: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllClients());
  }, []);

  useEffect(() => {
    if (clients && Array.isArray(clients)) {
      let filtered = [...clients];

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

      const formatted = paginatedData.map((client) => {
        const { _id, id, name, email, contact, status } = client;
        return {
          key: _id || id,
          id: _id || id,
          name,
          email,
          contact,
          status:
            status === 'active' ? (
              <span className="color-success">Active</span>
            ) : (
              <span className="color-danger">Inactive</span>
            ),
          action: (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <button type="button" onClick={() => handleEdit(client)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#2D3142' }} title="Edit"><EditOutlined style={{ fontSize: 14 }} /></button>
              <button type="button" onClick={() => handleDelete(_id || id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #FEE2E2', background: '#FEF2F2', cursor: 'pointer', color: '#EF4444' }} title="Delete"><DeleteOutlined style={{ fontSize: 14 }} /></button>
              <button type="button" onClick={() => handleManage(client, _id || id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#2D3142' }} title="Manage"><SettingOutlined style={{ fontSize: 14 }} /></button>
            </div>
          ),
        };
      });
      setDataSource(formatted);
    }
  }, [clients, pagination, searchTerm, sortStatus]);

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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
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
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title="Clients"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Clients`}</>}
          buttons={[
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create Client
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
                    placeholder="Search clients"
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="table-toolbar__filters">
                  <span className="table-toolbar__label">Sort By</span>
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)} style={{ minWidth: 130 }}>
                    <Select.Option value="category">All</Select.Option>
                    <Select.Option value="Active">Active</Select.Option>
                    <Select.Option value="InActive">Inactive</Select.Option>
                  </Select>
                </div>
              </div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                total={clients?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
              />
            </div>
          </Col>
        </Row>
        <CreateClient
          visible={visible}
          onCancel={onCancel}
          client={selectedClient}
        />
      </Main>
    </ScreenWrap>
  );
}

export default Clients;