/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Input, message, Select } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateBranchProfile from './CreateBranchProfile';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { ScreenWrap } from '../shared/procurementScreenStyles';
import { deleteBranchProfile, fetchAllBranchProfiles } from '../../redux/branchprofiles/branchprofileSlice';

function BranchProfiles() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { branchprofiles, loading } = useSelector((state) => state.branchprofiles);
  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedBranchProfile: null,
    selectedBranchProfileId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');
  console.log('branchprofiles', branchprofiles);

  const { notData, visible, selectedBranchProfile } = state;

  const handleEdit = (branchprofile) => {
    const { _id: id, ...rest } = branchprofile;

    setState({
      ...state,
      visible: true,
      selectedBranchProfile: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteBranchProfile(id));
    toast.success('Deleted successfully 🎉', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedBranchProfile: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedBranchProfile: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllBranchProfiles());
  }, [dispatch]);

  useEffect(() => {
    if (branchprofiles && Array.isArray(branchprofiles)) {
      let filtered = [...branchprofiles];

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((item) => {
          const name = item.branch_name || ''; // ya branchName agar rename kiya ho
          return name.toLowerCase().includes(term);
        });
      }

      if (sortStatus !== 'category') {
        filtered = filtered.filter((item) => item.status.toLowerCase() === sortStatus.toLowerCase());
      }

      filtered.sort((a, b) => {
        if (!searchTerm) return 0;
        const term = searchTerm.toLowerCase();
        const nameA = (a.branch_name || '').toLowerCase();
        const nameB = (b.branch_name || '').toLowerCase();
        if (nameA.includes(term)) return -1;
        if (nameB.includes(term)) return 1;
        return 0;
      });

      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filtered.slice(start, end);

      const formatted = paginatedData.map((branchprofile) => {
        const {
          _id,
          id,
          branch_name: branchName,
          code,
          vp_name: vpName,
          vp_contact: vpContact,
          email,
          age,
          number,
          status,
        } = branchprofile;
        return {
          key: _id || id,
          id: _id || id,
          branchName,
          code,
          vpName,
          vpContact,
          email,
          age,
          number,
          status:
            status === 'active' ? (
              <span className="color-success">Active</span>
            ) : (
              <span className="color-danger">Inactive</span>
            ),
          action: (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <button type="button" onClick={() => handleEdit(branchprofile)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#2D3142' }} title="Edit"><EditOutlined style={{ fontSize: 14 }} /></button>
              <button type="button" onClick={() => handleDelete(_id || id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #FEE2E2', background: '#FEF2F2', cursor: 'pointer', color: '#EF4444' }} title="Delete"><DeleteOutlined style={{ fontSize: 14 }} /></button>
            </div>
          ),
        };
      });
      setDataSource(formatted);
    }
  }, [branchprofiles, pagination, searchTerm, sortStatus]);

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
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Name',
      dataIndex: 'branchName',
      key: 'branchName',
    },
    {
      title: 'Vp Name',
      dataIndex: 'vpName',
      key: 'vpName',
    },
    {
      title: 'Vp Contact',
      dataIndex: 'vpContact',
      key: 'vpContact',
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
          title="Branch Profiles"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} BranchProfiles`}</>}
          buttons={[
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create BranchProfile
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
                  <Input prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />} placeholder="Search branch profiles" allowClear onChange={(e) => handleSearch(e.target.value)} />
                </div>
                <div className="table-toolbar__filters">
                  <span className="table-toolbar__label">Status</span>
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)} style={{ minWidth: 140 }}>
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
                total={branchprofiles?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
              />
            </div>
          </Col>
        </Row>
        <CreateBranchProfile visible={visible} onCancel={onCancel} branchprofile={selectedBranchProfile} />
      </Main>
    </ScreenWrap>
  );
}

export default BranchProfiles;
