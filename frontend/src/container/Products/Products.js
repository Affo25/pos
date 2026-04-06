/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, Dropdown, Select, Tag, Upload, Card, Typography, Progress, message, Avatar, Image,Modal } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, InboxOutlined, UploadOutlined, FileExcelOutlined, UserOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
import Cookies from 'js-cookie';
import CreateProduct from './CreateProduct';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { API_BASE } from '../../config/apiBase';
import { deleteProduct, fetchAllProducts } from '../../redux/products/productSlice';
import { ScreenWrap } from '../shared/procurementScreenStyles';

function Products() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  
  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [state, setState] = useState({
    notData: [],
    visible: false,
    selectedProduct: null,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('all');
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showExcelUpload, setShowExcelUpload] = useState(false);

  const { notData, visible, selectedProduct } = state;
  const { Text } = Typography;

  const handleEdit = (product) => {
    const { _id: id, ...rest } = product;

    setState({
      ...state,
      visible: true,
      selectedProduct: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selectedProduct: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selectedProduct: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    let filtered = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => (item.name || '').toLowerCase().includes(term));
    }

    if (sortStatus !== 'all') {
      filtered = filtered.filter(
        (item) => item.status?.toLowerCase() === sortStatus.toLowerCase(),
      );
    }

    filtered.sort((a, b) => {
      if (!searchTerm) return (a.name || '').localeCompare(b.name || '');
      const term = searchTerm.toLowerCase();
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      if (nameA.includes(term) && !nameB.includes(term)) return -1;
      if (nameB.includes(term) && !nameA.includes(term)) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

    return filtered;
  }, [products, searchTerm, sortStatus]);

  useEffect(() => {
    if (filteredProducts.length) {
      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filteredProducts.slice(start, end);

      const formatted = paginatedData.map((product, idx) => {
        const {
          _id,
          id,
          name,
          batch_number,
          expiry_date,
          category,
          available_quantity,
          unit_price,
          status,
          manufacturer_license_no,
          manufacturer_registration_no,
          manufacturer,
          medecine_size,
          image, // ✅ Get image URL from product
          imageUrl, // Alternative field name
        } = product;

        // ✅ Get the image URL from multiple possible field names
        const productImage = image || imageUrl || null;
        
        // ✅ Generate initials for fallback avatar
        const getInitials = (productName) => {
          if (!productName) return 'MD';
          const words = productName.split(' ');
          if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
          }
          return productName.substring(0, 2).toUpperCase();
        };

        const categoryLabel =
          category && typeof category === 'object' && category.name != null
            ? category.name
            : String(category || '');

        return {
          key: _id || id,
          id: _id || id,
          name: <span style={{ fontWeight: 600, color: '#0f172a' }}>{name}</span>,
          medecine_size,
          batch_number,
          expiry_date: expiry_date ? moment(expiry_date).format('DD-MM-YYYY') : '-',
          category: (
            <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px', margin: 0 }}>
              {categoryLabel.toUpperCase()}
            </Tag>
          ),
          available_quantity,
          unit_price: (
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {unit_price != null ? Number(unit_price).toFixed(2) : '—'}
            </span>
          ),
          manufacturer_license_no: <Tag color="blue">{manufacturer_license_no?.toUpperCase()}</Tag>,
          manufacturer_registration_no: <Tag color="red">{manufacturer_registration_no?.toUpperCase()}</Tag>,
          manufacturer,
          status:
            status === 'active' ? (
              <span className="color-success">Active</span>
            ) : (
              <span className="color-danger">Inactive</span>
            ),
          action: (
            <Dropdown
              overlay={
                <Menu className="custom-dropdown-menu">
                  <Menu.Item key="edit" className="custom-menu-item" onClick={() => handleEdit(product)}>
                    <div className="custom-action-btn edit-btn">
                      <EditOutlined className="action-icon" />
                      <span className="action-label">Edit</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item key="delete" className="custom-menu-item" onClick={() => handleDelete(_id || id)}>
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
          // ✅ Add image column data with avatar and preview
          image: (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {productImage ? (
                <Avatar 
                  src={productImage}
                  size={48}
                  shape="square"
                  style={{ cursor: 'pointer', borderRadius: '8px' }}
                  onClick={() => {
                    // ✅ Open image preview in modal
                    Modal.info({
                      title: 'Product Image',
                      content: (
                        <img 
                          src={productImage} 
                          alt={name} 
                          style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                        />
                      ),
                      icon: null,
                      width: 500,
                    });
                  }}
                />
              ) : (
                <Avatar 
                  size={48} 
                  shape="square"
                  style={{ backgroundColor: '#1890ff', borderRadius: '8px' }}
                  icon={<UserOutlined />}
                >
                  {getInitials(name)}
                </Avatar>
              )}
            </div>
          ),
        };
      });

      setDataSource(formatted);
    } else {
      setDataSource([]);
    }
  }, [filteredProducts, pagination]);

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
      title: 'Image', 
      dataIndex: 'image', 
      key: 'image',
      width: 88,
      align: 'center',
    },
    {
      title: '#',
      key: 'index',
      width: 56,
      align: 'center',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    { title: 'Medicine name', dataIndex: 'name', key: 'name', ellipsis: true, width: 200 },
    { title: 'Size', dataIndex: 'medecine_size', key: 'medicine_size', width: 100, ellipsis: true },
    { title: 'Batch #', dataIndex: 'batch_number', key: 'batch_number', width: 120, ellipsis: true },
    { title: 'Expiry', dataIndex: 'expiry_date', key: 'expiry_date', width: 120 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 130 },
    { title: 'Qty', dataIndex: 'available_quantity', key: 'available_quantity', width: 80, align: 'right' },
    { title: 'Price', dataIndex: 'unit_price', key: 'unit_price', width: 100, align: 'right' },
    { 
      title: 'Reg & license', 
      key: 'reg_license',
      width: 160,
      render: (text, record) => (
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>
          <div>{record.manufacturer_registration_no || '—'}</div>
          <div>{record.manufacturer_license_no || '—'}</div>
        </div>
      ),
    },
    { title: 'Manufacturer', dataIndex: 'manufacturer', key: 'manufacturer', ellipsis: true },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, align: 'center' },
    { title: '', dataIndex: 'action', key: 'action', width: 56, align: 'center', fixed: 'right' },
  ];

  const handleExcelUpload = async (file) => {
    try {
      setUploadingExcel(true);
      setUploadResult(null);
      const token = Cookies.get('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/products/import-excel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Excel upload failed');

      setUploadResult({
        inserted: data.inserted || 0,
        skipped: data.skipped || 0,
      });
      message.success(`Imported ${data.inserted || 0} products successfully`);
      dispatch(fetchAllProducts());
    } catch (error) {
      message.error(error.message || 'Failed to import products');
    } finally {
      setUploadingExcel(false);
    }
    return false;
  };

  return (
    <ScreenWrap>
      <ProjectHeader>
        <PageHeader
          ghost
          title={<span className="page-title">Medicines</span>}
          subTitle={
            <span className="page-sub">
              {loading ? 'Loading…' : `${filteredProducts.length} in view · ${products?.length || 0} total SKUs`}
            </span>
          }
          buttons={[
            <Button onClick={() => setShowExcelUpload((prev) => !prev)} key="excel" type="success" size="default">
              <UploadOutlined size={16} /> {showExcelUpload ? 'Hide Excel Upload' : 'Upload Excel'}
            </Button>,
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Add Medicine
            </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
      
        <Row gutter={25}>
          <Col xs={24}>
            {showExcelUpload && (
              <Card
                style={{ marginBottom: 16, borderRadius: 12 }}
                bodyStyle={{ padding: 18 }}
                title={
                  <span>
                    <FileExcelOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                    Import Products from Excel
                  </span>
                }
              >
                <Upload.Dragger
                  accept=".xlsx,.xls"
                  beforeUpload={handleExcelUpload}
                  showUploadList={false}
                  disabled={uploadingExcel}
                  style={{ background: '#fafcff', borderRadius: 10 }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: '#1677ff' }} />
                  </p>
                  <p className="ant-upload-text">Click or drag Excel file to upload</p>
                  <p className="ant-upload-hint">
                    Supports .xlsx and .xls. Required columns: name, batch_number, expiry_date, category,
                    supplier_name, unit_price, available_quantity. The category column must match a category
                    name from Categories (or a valid category ID).
                  </p>
                  <Button type="default" size="small">
                    <UploadOutlined /> Select Excel File
                  </Button>
                </Upload.Dragger>

                {uploadingExcel && (
                  <div style={{ marginTop: 14 }}>
                    <Text type="secondary">Uploading and importing products...</Text>
                    <Progress percent={80} status="active" showInfo={false} style={{ marginTop: 8 }} />
                  </div>
                )}

                {uploadResult && (
                  <div style={{ marginTop: 14, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: 10 }}>
                    <Text strong style={{ color: '#389e0d' }}>
                      Import Completed
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>Inserted: {uploadResult.inserted}</Text> | <Text>Skipped: {uploadResult.skipped}</Text>
                    </div>
                  </div>
                )}
              </Card>
            )}

            <div className="toolbar-card">
              <ProjectSorting>
                <div className="project-sort-bar">
                  <div className="project-sort-search">
                    <AutoComplete
                      onSearch={handleSearch}
                      dataSource={notData}
                      placeholder="Search by medicine name"
                      patterns
                    />
                  </div>
                  <div className="sort-group">
                    <span style={{ display: 'flex', alignItems: 'center' }}>Status</span>
                    <Select defaultValue="all" onChange={(value) => setSortStatus(value)} style={{ minWidth: 140 }}>
                      <Select.Option value="all">All</Select.Option>
                      <Select.Option value="active">Active</Select.Option>
                      <Select.Option value="inactive">Inactive</Select.Option>
                    </Select>
                  </div>
                </div>
              </ProjectSorting>
            </div>

            <div className="table-shell" style={{ marginTop: 12 }}>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                total={filteredProducts.length}
                current={pagination.current}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
                size="middle"
                scroll={{ x: 1400 }}
              />
            </div>
          </Col>
        </Row>
        <CreateProduct visible={visible} onCancel={onCancel} product={selectedProduct} />
      </Main>
    </ScreenWrap>
  );
}

export default Products;