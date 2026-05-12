import React from 'react';
import { Table, Tag } from 'antd';
import moment from 'moment';
import { Cards } from '../../../../components/cards/frame/cards-frame';

function LatestSales({ sales }) {
  const latestSales = [...sales]
    .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))
    .slice(0, 10)
    .map((sale, index) => ({
      key: index + 1,
      invoice_no: sale.invoice_no,
      customer: sale.customer_name || 'Walk-in Customer',
      amount: `$${sale.net_amount.toLocaleString()}`,
      date: moment(sale.sale_date).format('MMMM DD, YYYY'),
      status: sale.status,
    }));

  const columns = [
    {
      title: 'Invoice No',
      dataIndex: 'invoice_no',
      key: 'invoice_no',
      render: (text) => <span style={{ color: '#2D3142', fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'success' : 'warning'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <Cards title="Latest Sales" size="large">
      <div className="table-responsive">
        <Table columns={columns} dataSource={latestSales} pagination={false} />
      </div>
    </Cards>
  );
}

export default LatestSales;
