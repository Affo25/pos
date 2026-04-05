import React from 'react';
import { Row, Col, Table, Pagination } from 'antd';
import propTypes from 'prop-types';
import { ProjectPagination, ProjectList } from './style';
import { Cards } from '../../components/cards/frame/cards-frame';

function ProjectLists({
  toolbar,
  columns,
  dataSource,
  total = 0,
  pageSize = 10,
  current = 1,
  onChange,
  onShowSizeChange,
  size = 'default',
  loading = false,
  scroll,
  rowKey,
}) {
  return (
    <Row gutter={25}>
      <Col xs={24}>
        <Cards headless>
          {toolbar}
          <ProjectList>
            <div className="table-responsive">
              <Table
                size={size}
                pagination={false}
                dataSource={dataSource}
                columns={columns}
                loading={loading}
                scroll={scroll}
                rowKey={rowKey}
              />
            </div>
          </ProjectList>
        </Cards>
      </Col>
      <Col xs={24} className="pb-30">
        <ProjectPagination>
          {total > 0 ? (
            <Pagination
              current={current}
              onChange={onChange}
              showSizeChanger
              onShowSizeChange={onShowSizeChange}
              pageSize={pageSize}
              total={total}
            />
          ) : null}
        </ProjectPagination>
      </Col>
    </Row>
  );
}

ProjectLists.propTypes = {
  toolbar: propTypes.node,
  columns: propTypes.array.isRequired,
  dataSource: propTypes.array.isRequired,
  total: propTypes.number,
  pageSize: propTypes.number,
  current: propTypes.number,
  onChange: propTypes.func,
  onShowSizeChange: propTypes.func,
  size: propTypes.string,
  loading: propTypes.bool,
  scroll: propTypes.object,
  rowKey: propTypes.oneOfType([propTypes.string, propTypes.func]),
};

export default ProjectLists;

