import React from 'react';
import { Row, Col, Table, Pagination } from 'antd';
import propTypes from 'prop-types';
import { ProjectPagination, ProjectList } from './style';
import { Cards } from '../../components/cards/frame/cards-frame';

function ProjectLists({ columns, dataSource, total = 0, pageSize = 10, onChange, onShowSizeChange }) {
  return (
    <Row gutter={25}>
      <Col xs={24}>
        <Cards headless>
          <ProjectList>
            <div className="table-responsive">
              <Table pagination={false} dataSource={dataSource} columns={columns} />
            </div>
          </ProjectList>
        </Cards>
      </Col>
      <Col xs={24} className="pb-30">
        <ProjectPagination>
          {dataSource.length ? (
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
    </Row>
  );
}

ProjectLists.propTypes = {
  columns: propTypes.array.isRequired,
  dataSource: propTypes.array.isRequired,
  total: propTypes.number,
  pageSize: propTypes.number,
  onChange: propTypes.func,
  onShowSizeChange: propTypes.func,
};

export default ProjectLists;

