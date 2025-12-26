import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, Dropdown } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { useLocation, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import CreatePageElement from './CreatePageElement';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import {
    fetchAllPageElements,
    deletePageElement,
    resetPageElements,
} from '../../redux/pageElements/pageElementSlice';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';

function PageElement() {
    const { pageId } = useParams();
    const dispatch = useDispatch();
    const location = useLocation();
    const { pageElements, loading } = useSelector((state) => state.pageElements);

    const [dataSource, setDataSource] = useState([]);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });
    const [state, setState] = useState({
        notData: [],
        visible: false,
        categoryActive: 'all',
        selectedPageElement: null,
        selectedPageId: null,
    });
    const [searchTerm, setSearchTerm] = useState('');

    const { dataKey } = location.state || {};
    const { notData, visible, selectedPageElement } = state;

    const handleEditPageElement = (pageElement) => {
        const { _id: id, ...rest } = pageElement;

        setState({
            ...state,
            visible: true,
            selectedPageElement: {
                ...rest,
                id,
            },
        });
    };

    const handleDeletePageElement = (id) => {
        dispatch(deletePageElement(id, pageId))
    };
    const handleSearch = (searchText) => {
        setSearchTerm(searchText);
    };

    const showModal = () => {
        setState({
            ...state,
            visible: true,
            selectedPageElement: null,
        });
    };

    const onCancel = () => {
        setState({
            ...state,
            visible: false,
            selectedPageElement: null,
        });
    };

    useEffect(() => {
        if (pageId) {
            dispatch(resetPageElements());
            dispatch(fetchAllPageElements(pageId))
        }
    }, [dispatch, pageId]);

    useEffect(() => {
        if (pageElements && Array.isArray(pageElements)) {
            let filtered = [...pageElements];

            if (searchTerm) {
                filtered = filtered.filter((item) =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.key.toLowerCase().includes(searchTerm.toLowerCase())
                );
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
            const paginatedPageElements = filtered.slice(start, end);
            const formatted = paginatedPageElements.map((PageElemenp) => {
                const { _id, id, name, key, type, required, placeholder, createdOn } = PageElemenp;
                return {
                    key: _id || id,
                    id: _id || id,
                    name,
                    keyField: key,
                    type,
                    placeholder,
                    required: required ? <span className='color-success'>Yes</span> : <span className='color-danger'>No</span>,
                    createdOn: new Date(createdOn).toLocaleDateString(),
                    action: (
                        <Dropdown
                            overlay={
                                <Menu className="custom-dropdown-menu">
                                    <Menu.Item
                                        key="edit"
                                        className="custom-menu-item"
                                        onClick={() => handleEditPageElement(PageElemenp)}
                                    >
                                        <div className="custom-action-btn edit-btn">
                                            <EditOutlined className="action-icon" />
                                            <span className="action-label">Edit</span>
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item
                                        key="delete"
                                        className="custom-menu-item"
                                        onClick={() => handleDeletePageElement(_id || id)}
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
                    )
                };
            });
            setDataSource(formatted);
        }
    }, [pageElements, pagination, searchTerm]);


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
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Key',
            dataIndex: 'keyField',
            key: 'keyField',
        },
        {
            title: 'Placeholder',
            dataIndex: 'placeholder',
            key: 'placeholder',
        },
        {
            title: 'Required',
            dataIndex: 'required',
            key: 'required',
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
                    title={dataKey || 'Page Elements'}
                    subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Running PageElements`}</>}
                    buttons={[
                        <Button onClick={showModal} key="1" type="primary" size="default">
                            <FeatherIcon icon="plus" size={16} /> Create PageElements
                        </Button>,
                    ]}
                />
            </ProjectHeader>
            <Main>
                <Row gutter={25}>
                    <Col xs={24} className='mb-3'>
                        <a
                            href={`/page-data/${dataKey}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button style={{ height: '30px', padding: '0 8px' }} type="primary" size="default">
                                Page Link
                            </Button>
                        </a>

                    </Col>
                    <Col xs={24}>
                        <ProjectSorting>
                            <div className="project-sort-bar">
                                <div className="project-sort-search">
                                    <AutoComplete
                                        onSearch={handleSearch}
                                        dataSource={notData}
                                        placeholder="Search PageElements"
                                        patterns
                                    />
                                </div>
                            </div>
                        </ProjectSorting>
                        <div>
                            <ProjectLists
                                columns={columns}
                                dataSource={dataSource}
                                loading={false}
                                total={pageElements?.length || 0}
                                pageSize={pagination.pageSize}
                                onChange={handlePageChange}
                                onShowSizeChange={handleSizeChange}
                            />

                        </div>
                    </Col>
                </Row>
                <CreatePageElement
                    onCancel={onCancel}
                    visible={visible}
                    pageElement={selectedPageElement}
                    pageId={pageId}
                />
            </Main>
        </>
    )
}

export default PageElement;