import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, Dropdown } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import FeatherIcon from 'feather-icons-react';
import { useLocation, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import CreatePageData from './CreatePageData';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { fetchAllPageElements } from '../../redux/pageElements/pageElementSlice';
import { deletePageData, fetchPageDataByPageId } from '../../redux/pageData/actionCreator';

function PageData() {
    const { dataKey } = useParams();
    const dispatch = useDispatch();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const pageTitle = queryParams.get('title') || 'Page Data';
    const { data: pageDatas, loading } = useSelector((state) => state.pageDatas);
    const { pageElements } = useSelector((state) => state.pageElements);

    const [dataSource, setDataSource] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });
    const [state, setState] = useState({
        notData: [],
        visible: false,
        selectedPageData: null,
    });
    const [searchTerm, setSearchTerm] = useState('');

    const { notData, visible } = state;

    const handleEditPageData = (pageData) => {
        setState({
            ...state,
            visible: true,
            selectedPageData: pageData,
        });
    };

    const handleDeletePageData = (id) => {
        dispatch(deletePageData(id, pageTitle))
            .then(() => {
                toast.success(' deleted successfully 🎉', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                dispatch(fetchPageDataByPageId(dataKey));
            })
            .catch(() => {
                toast.success(' deleted successfully 🎉', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            });
    };



    const handleSearch = (searchText) => {
        setSearchTerm(searchText);
    };

    const showModal = () => {
        setState({
            ...state,
            visible: true,
            selectedPageData: null,
        });
    };

    const onCancel = () => {
        setState({
            ...state,
            visible: false,
            selectedPageData: null,
        });
    };

    useEffect(() => {
        if (dataKey) {
            dispatch(fetchPageDataByPageId(dataKey))
                .then(result => {
                    console.log("Fetch result:", result);
                })
                .catch(error => {
                    console.error("Fetch error:", error);
                });
            dispatch(fetchAllPageElements(dataKey));
        }
    }, [dispatch, dataKey]);

    useEffect(() => {
        if (pageDatas && Array.isArray(pageDatas)) {
            let filtered = [...pageDatas];

            if (searchTerm) {
                filtered = filtered.filter((item) => {
                    return Object.values(item).some(
                        (val) => typeof val === 'string' &&
                            val.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                });
            }

            const start = (pagination.current - 1) * pagination.pageSize;
            const end = start + pagination.pageSize;
            const paginatedPages = filtered.slice(start, end);

            const formatted = paginatedPages.map((pageData) => {
                const { _id, id, createdAt, ...rest } = pageData;

                const dynamicFields = {};
                pageElements?.forEach(element => {
                    dynamicFields[element.name] = rest[element.key] || 'N/A';
                });

                return {
                    key: _id || id,
                    id: _id || id,
                    ...rest,
                    ...dynamicFields,
                    createdAt: new Date(createdAt).toLocaleDateString(),
                    action: (
                        <Dropdown
                            overlay={
                                <Menu className="custom-dropdown-menu">
                                    <Menu.Item
                                        key="edit"
                                        className="custom-menu-item"
                                        onClick={() => handleEditPageData(pageData)}
                                    >
                                        <div className="custom-action-btn edit-btn">
                                            <EditOutlined className="action-icon" />
                                            <span className="action-label">Edit</span>
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item
                                        key="delete"
                                        className="custom-menu-item"
                                        onClick={() => handleDeletePageData(_id || id)}
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
    }, [pageDatas, pagination, searchTerm, pageElements]);

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
        ...(pageElements
            ?.filter(element => element.enable_in_list !== false)
            .map(element => ({
                title: element.name,
                dataIndex: element.name,
                key: element.key,
            })) || []),
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
                    title={dataKey || 'Page Data'}
                    subTitle={<>{loading ? 'Loading...' : `${dataSource.length} Page Data Entries`}</>}
                    buttons={[
                        <Button onClick={showModal} key="1" type="primary" size="default">
                            <FeatherIcon icon="plus" size={16} /> Add Data
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
                                        placeholder="Search Page Data"
                                        patterns
                                    />
                                </div>
                            </div>
                        </ProjectSorting>
                        <div>
                            <ProjectLists
                                columns={columns}
                                dataSource={dataSource}
                                loading={loading}
                                total={pageDatas?.length || 0}
                                pageSize={pagination.pageSize}
                                onChange={handlePageChange}
                                onShowSizeChange={handleSizeChange}
                            />
                        </div>
                    </Col>
                </Row>
                <CreatePageData
                    pageTitle={pageTitle}
                    onCancel={onCancel}
                    visible={visible}
                    selectedPage={state.selectedPageData}
                    onSuccess={() => dispatch(fetchPageDataByPageId(dataKey))}
                />
            </Main>
        </>
    );
}

export default PageData;