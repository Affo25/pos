import React from 'react';
import { Progress, Tag, Menu, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ProjectCard } from './style';
import { Cards } from '../../components/cards/frame/cards-frame';

function GridCard({ value, onEdit, onDelete }) {
    const { id, name, email, status } = value;

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(value);
    };

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(id);
    };

    const menu = (
        <Menu>
            <Menu.Item key="edit" onClick={handleEdit}>
                <EditOutlined /> Edit
            </Menu.Item>
            <Menu.Item key="delete" onClick={handleDelete}>
                <DeleteOutlined /> Delete
            </Menu.Item>
        </Menu>
    );

    return (
        <ProjectCard>
            <Cards headless>
                <div className="project-top">
                    <div className="project-title">
                        <h1>
                            <Link to={`/admin/user/details/${id}`}>{name}</Link>
                            <Tag className={status}>{status}</Tag>
                        </h1>
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Link to="#" onClick={(e) => e.preventDefault()}>
                                <FeatherIcon icon="more-horizontal" size={18} />
                            </Link>
                        </Dropdown>
                    </div>
                    <p className="project-desc">{email}</p>
                    <div className="project-timing">
                        <div>
                            <span>User Type</span>
                            {/* <strong>{user_type}</strong> */}
                        </div>
                        <div>
                            <span>Status</span>
                            <strong>{status}</strong>
                        </div>
                    </div>
                    <div className="project-progress">
                        <Progress
                            percent={status === 'active' ? 100 : 0}
                            strokeWidth={5}
                            status={status === 'active' ? 'success' : 'exception'}
                        />
                        <p>{status === 'active' ? 'Active User' : 'Inactive User'}</p>
                    </div>
                </div>
                <div className="project-bottom">
                    <div className="project-assignees">
                        <p>User Details</p>
                        <ul>
                            <li>
                                <span>Email: {email}</span>
                            </li>
                            {/* <li>
                                <span>Type: {user_type}</span>
                            </li> */}
                        </ul>
                    </div>
                </div>
            </Cards>
        </ProjectCard>
    );
}

GridCard.propTypes = {
    value: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default GridCard;