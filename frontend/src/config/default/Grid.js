import React from 'react';
import { Row, Col, Card, Pagination, Table } from 'antd';
import propTypes from 'prop-types';
import { ProjectPagination } from './style';
import { Cards } from '../../components/cards/frame/cards-frame';

const { Meta } = Card;


function Grid({
    dataSource,
    total = 0,
    pageSize = 9,
    onChange,
    onShowSizeChange,
    loading,
    columns,
}) {
    return (
        <Row gutter={25}>
            {dataSource.map((item, rowIndex) => {
                const userInfoData = columns.map((col, index) => {
                    let value = null;

                    if (col.render) {
                        value = col.render(item[col.dataIndex], item, rowIndex);
                    } else if (col.dataIndex) {
                        value = item[col.dataIndex];
                    }

                    return {
                        key: index,
                        field: col.title,
                        value,
                    };
                });
                const imageUrl =
                    Array.isArray(item.eventImage) && item.eventImage.length > 0
                        ? `${process.env.REACT_APP_API_URL}${item.eventImage[0]}`
                        : null;
                return (
                    <Col key={item.key} xl={8} md={12} xs={24}>
                        <Cards headless className="no-card">
                            <Card
                                className="no-space-card"
                                style={{ width: '100%', marginBottom: 5 }}
                                bodyStyle={{ padding: 0 }}
                                cover={
                                    <div>
                                        {imageUrl ? (
                                            <img
                                                alt={item.eventName || 'event'}
                                                src={imageUrl}
                                                style={{
                                                    width: '100%',
                                                    height: 170,
                                                    objectFit: 'contain',
                                                    borderBottom: '1px solid #f0f0f0',
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: 90,
                                                    background: '#f5f5f5',
                                                    borderBottom: '1px solid #f0f0f0',
                                                }}
                                            />
                                        )}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                padding: '6px 12px',
                                            }}
                                        >
                                            {item.action}
                                        </div>
                                    </div>
                                }
                            >
                                <Meta
                                    description={
                                        <Table
                                            dataSource={userInfoData}
                                            columns={[
                                                { title: 'Field', dataIndex: 'field', key: 'field' },
                                                { title: 'Value', dataIndex: 'value', key: 'value' },
                                            ]}
                                            pagination={false}
                                            showHeader={false}
                                            size="small"
                                            className='p-0 m-0'
                                            bordered={false}
                                        />
                                    }
                                />
                            </Card>
                        </Cards>
                    </Col>
                );
            })}

            <Col xs={24} className="pb-30">
                <ProjectPagination>
                    {dataSource.length && !loading ? (
                        <Pagination
                            onChange={onChange}
                            showSizeChanger
                            onShowSizeChange={onShowSizeChange}
                            pageSize={pageSize}
                            defaultCurrent={1}
                            total={total}
                        />
                    ) : null}
                </ProjectPagination>
            </Col>
        </Row >
    );
}

Grid.propTypes = {
    dataSource: propTypes.array.isRequired,
    total: propTypes.number,
    pageSize: propTypes.number,
    onChange: propTypes.func,
    onShowSizeChange: propTypes.func,
    loading: propTypes.bool,
    columns: propTypes.array.isRequired,
};

export default Grid;
