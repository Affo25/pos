import React from 'react';
import { Table } from 'antd';
import { Cards } from '../../../../components/cards/frame/cards-frame';

function TopProducts({ sales }) {
  const productsMap = {};

  sales.forEach(sale => {
    (sale.items || []).forEach(item => {
      if (productsMap[item.product_name]) {
        productsMap[item.product_name].sold += item.quantity;
        productsMap[item.product_name].revenue += item.line_total;
      } else {
        productsMap[item.product_name] = {
          name: item.product_name,
          sold: item.quantity,
          revenue: item.line_total,
          price: item.unit_price,
        };
      }
    });
  });

  const productsData = Object.values(productsMap)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
    .map((product, index) => ({
      key: index + 1,
      name: product.name,
      sold: product.sold,
      revenue: `$${product.revenue.toLocaleString()}`,
      price: `$${product.price.toLocaleString()}`,
    }));

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Sold',
      dataIndex: 'sold',
      key: 'sold',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
    },
  ];

  return (
    <Cards title="Most Sold Products" size="large">
      <div className="table-responsive">
        <Table columns={columns} dataSource={productsData} pagination={false} />
      </div>
    </Cards>
  );
}

export default TopProducts;
