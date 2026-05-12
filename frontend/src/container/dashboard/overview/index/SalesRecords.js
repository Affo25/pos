import React from 'react';
import { Row, Col } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { Cards } from '../../../../components/cards/frame/cards-frame';

function SalesRecords({ sales }) {
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.net_amount || 0), 0);
  const totalDiscount = sales.reduce((acc, sale) => acc + (sale.discount_amount || 0), 0);
  const totalTax = sales.reduce((acc, sale) => acc + (sale.tax_amount || 0), 0);

  return (
    <Cards title="Sales Records" size="large">
      <Row gutter={25}>
        <Col md={12} xs={24} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(95, 99, 242, 0.1)', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginRight: '15px'
            }}>
              <FeatherIcon icon="shopping-cart" size={24} style={{ color: '#2D3142' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>{totalSales}</h1>
              <p style={{ margin: 0, color: '#9CA3AF' }}>Total Sales</p>
            </div>
          </div>
        </Col>
        <Col md={12} xs={24} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(32, 201, 151, 0.1)', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginRight: '15px'
            }}>
              <FeatherIcon icon="dollar-sign" size={24} style={{ color: '#20C997' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>${totalRevenue.toLocaleString()}</h1>
              <p style={{ margin: 0, color: '#9CA3AF' }}>Total Revenue</p>
            </div>
          </div>
        </Col>
        <Col md={12} xs={24}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(255, 77, 79, 0.1)', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginRight: '15px'
            }}>
              <FeatherIcon icon="tag" size={24} style={{ color: '#FF4D4F' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>${totalDiscount.toLocaleString()}</h1>
              <p style={{ margin: 0, color: '#9CA3AF' }}>Total Discount</p>
            </div>
          </div>
        </Col>
        <Col md={12} xs={24}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(250, 173, 20, 0.1)', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginRight: '15px'
            }}>
              <FeatherIcon icon="percent" size={24} style={{ color: '#FAAD14' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>${totalTax.toLocaleString()}</h1>
              <p style={{ margin: 0, color: '#9CA3AF' }}>Total Tax</p>
            </div>
          </div>
        </Col>
      </Row>
    </Cards>
  );
}

export default SalesRecords;
