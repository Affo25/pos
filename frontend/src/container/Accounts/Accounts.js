/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateAccount from './CreateAccount';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteAccount, fetchAllAccounts } from '../../redux/accounts/accountSlice';
import { getComponentPermissions } from '../../config/utils/permission';

function Accounts() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { accounts, loading } = useSelector((state) => state.accounts);
  const { login: user } = useSelector((state) => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'Accounts');
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const [dataSource, setDataSource] = useState([]);
  const { accountheads } = useSelector((state) => state.accountheads);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedAccount: null,
    selectedAccountId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { notData, visible, selectedAccount } = state;

  const handleEdit = (account) => {
    const { _id: id, ...rest } = account;

    setState({
      ...state,
      visible: true,
      selectedAccount: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteAccount(id, selectedBranchId));
    toast.success('Deleted successfully 🎉', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedAccount: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedAccount: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllAccounts(selectedBranchId));
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (accounts && Array.isArray(accounts)) {
      let filtered = [...accounts];

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

      const formatted = paginatedData.map((account) => {
        const { _id, id, accountName, accountType, openingBalance, accountHeadId } = account;
        const accountHead = accountheads?.find((head) => head._id === accountHeadId);
        return {
          key: _id || id,
          id: _id || id,
          accountName,
          accountType,
          openingBalance,
          accountHead: accountHead ? accountHead.name : 'N/A',
          action: (
            <Dropdown
              overlay={
                <Menu className="custom-dropdown-menu">
                  <Menu.Item
                    disabled={!canEdit}
                    key="edit"
                    className="custom-menu-item"
                    onClick={() => handleEdit(account)}
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
  }, [accounts, pagination, searchTerm, sortStatus]);

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
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: 'Type',
      dataIndex: 'accountType',
      key: 'accountType',
    },
    {
      title: 'Opening Balance',
      dataIndex: 'openingBalance',
      key: 'openingBalance',
    },
    {
      title: 'Account Head',
      dataIndex: 'accountHead',
      key: 'accountHead',
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
          title="Accounts"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Accounts`}</>}
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create Account
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
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search accounts" patterns />
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
                total={accounts?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
              />
            </div>
          </Col>
        </Row>
        <CreateAccount
          visible={visible}
          onCancel={onCancel}
          account={selectedAccount}
          onSuccess={() => {
            dispatch(fetchAllAccounts(selectedBranchId));
          }}
        />
      </Main>
    </>
  );
}

export default Accounts;
