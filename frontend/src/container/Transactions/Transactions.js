/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CreateTransaction from './CreateTransaction';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { deleteTransaction, fetchAllTransactions } from '../../redux/transactions/transactionSlice';
import { getComponentPermissions } from '../../config/utils/permission';

function Transactions() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector((state) => state.transactions);
  const { login: user } = useSelector((state) => state.auth);
  const { canAdd, canEdit, canDelete } = getComponentPermissions(user, 'Transactions');
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const { accounts } = useSelector((state) => state.accounts);
  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selectedTransaction: null,
    selectedTransactionId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { notData, visible, selectedTransaction } = state;

  const handleEdit = (transaction) => {
    const { _id: id, ...rest } = transaction;

    setState({
      ...state,
      visible: true,
      selectedTransaction: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteTransaction(id, selectedBranchId));
    toast.success('Deleted successfully 🎉', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedTransaction: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedTransaction: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllTransactions(selectedBranchId));
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (transactions && Array.isArray(transactions)) {
      let filtered = [...transactions];

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((item) => {
          const accountName = accounts?.find((acc) => acc._id === item.accountId)?.accountName || '';
          const description = item.description || '';
          return accountName.toLowerCase().includes(term) || description.toLowerCase().includes(term);
        });
      }

      if (sortStatus !== 'category') {
        filtered = filtered.filter((item) => item.status.toLowerCase() === sortStatus.toLowerCase());
      }

      filtered.sort((a, b) => {
        if (!searchTerm) return 0;
        const term = searchTerm.toLowerCase();
        const nameA = accounts?.find((acc) => acc._id === a.accountId)?.accountName?.toLowerCase() || '';
        const nameB = accounts?.find((acc) => acc._id === b.accountId)?.accountName?.toLowerCase() || '';
        if (nameA.includes(term)) return -1;
        if (nameB.includes(term)) return 1;
        return 0;
      });

      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filtered.slice(start, end);

      const formatted = paginatedData.map((transaction) => {
        const { _id, transactionDate, description, debit, credit, accountId } = transaction;
        const accountName = accounts?.find((head) => head._id === accountId);
        return {
          key: _id || transaction.id,
          transactionDate,
          description,
          debit,
          credit,
          accountName: accountName ? accountName.accountName : 'N/A',
          action: (
            <Dropdown
              overlay={
                <Menu className="custom-dropdown-menu">
                  <Menu.Item
                    disabled={!canEdit}
                    key="edit"
                    className="custom-menu-item"
                    onClick={() => handleEdit(transaction)}
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
                    onClick={() => handleDelete(_id || transaction.id)}
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
  }, [transactions, pagination, searchTerm, sortStatus]);

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
      title: 'Transaction Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Debit',
      dataIndex: 'debit',
      key: 'debit',
    },
    {
      title: 'Credit',
      dataIndex: 'credit',
      key: 'credit',
    },
    {
      title: 'Account Name',
      dataIndex: 'accountName',
      key: 'accountName',
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
          title="Transactions"
          subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Transactions`}</>}
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create Transaction
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
                  <AutoComplete
                    onSearch={handleSearch}
                    dataSource={notData}
                    placeholder="Search transactions"
                    patterns
                  />
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
                total={transactions?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
              />
            </div>
          </Col>
        </Row>
        <CreateTransaction
          visible={visible}
          onCancel={onCancel}
          transaction={selectedTransaction}
          onSuccess={() => {
            dispatch(fetchAllTransactions(selectedBranchId));
          }}
        />
      </Main>
    </>
  );
}

export default Transactions;
