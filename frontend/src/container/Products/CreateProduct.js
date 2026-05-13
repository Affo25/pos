/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  message,
  Select,
  DatePicker,
  Tabs,
  Space,
  Button as AntButton,
  Divider,
} from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import styled from 'styled-components';
import ModernModalStyles from '../shared/modalStyles';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import {
  createProduct,
  fetchAllProducts,
  fetchAllCategories,
  fetchAllSuppliers,
  updateProduct,
} from '../../redux/products/productSlice';
import { STATUS } from '../../config/data/data';
import { BasicFormWrapper } from '../../config/default/styled';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;



const ProductModalForm = styled.div`
  padding: 0;

  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
    font-size: 14px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 8px 8px 0 0;
    border-color: #E5E7EB;
  }

  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
    border-bottom-color: #fff;
  }

  .ant-tabs-content-holder {
    padding-top: 4px;
  }

  .ant-tabs-tabpane {
    padding-top: 6px;
  }

  .ant-form-item {
    margin-bottom: 14px !important;
  }

  .ant-form-item-label > label {
    font-weight: 600;
    color: #374151;
    font-size: 13px;
  }

  .ant-input,
  .ant-input-number,
  .ant-picker,
  .ant-input-affix-wrapper {
    border-radius: 8px !important;
    border-color: #D1D5DB !important;
    &:hover {
      border-color: #9CA3AF !important;
    }
    &:focus,
    &-focused {
      border-color: #EF8354 !important;
      box-shadow: 0 0 0 2px rgba(239, 131, 84, 0.12) !important;
    }
  }

  .ant-select-selector {
    border-radius: 8px !important;
    border-color: #D1D5DB !important;
    &:hover {
      border-color: #9CA3AF !important;
    }
  }

  .ant-select-focused .ant-select-selector {
    border-color: #EF8354 !important;
    box-shadow: 0 0 0 2px rgba(239, 131, 84, 0.12) !important;
  }

  .ant-row + .ant-row {
    margin-top: 0;
  }

  .section-gap {
    margin: 12px 0 10px;
  }

  .section-gap.ant-divider-horizontal.ant-divider-with-text {
    margin: 14px 0 12px;
  }

  .section-gap:first-child {
    margin-top: 0;
  }
`;

function CreateProduct({ visible, onCancel, product }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [generating, setGenerating] = useState(false);

  // ✅ GET DATA FROM REDUX
  const { categories, suppliers, loading: productsLoading } = useSelector((state) => state.products);

  const resetForm = () => {
    form.resetFields();
    // Set default values after reset
    form.setFieldsValue({
      available_quantity: 0,
      unit_price: 0,
      discount: 0,
      gst: 0,
      minimum_stock_alert: 0,
      status: 'active',
    });
  };

  // ✅ FETCH CATEGORIES & SUPPLIERS
  useEffect(() => {
    if (!visible) return;

    dispatch(fetchAllCategories());
    dispatch(fetchAllSuppliers());
  }, [visible, dispatch]);

  // ✅ EDIT MODE SET VALUES
  useEffect(() => {
    if (!visible) return;

    if (product) {
      const catVal = product.category;
      const supVal = product.supplier_name;
      form.setFieldsValue({
        ...product,
        category:
          catVal && typeof catVal === 'object' && catVal._id != null
            ? String(catVal._id)
            : String(catVal ?? ''),
        supplier_name:
          supVal && typeof supVal === 'object' && supVal._id != null
            ? String(supVal._id)
            : String(supVal ?? ''),
        expiry_date: product.expiry_date ? moment(product.expiry_date) : null,
        available_quantity: product.available_quantity || 0,
        unit_price: product.unit_price || 0,
      });
    } else {
      // Set default values for create mode
      resetForm();
    }
  }, [product, visible, form]);

  // ✅ GENERATE DUMMY DATA
  const generateDummyData = () => {
    setGenerating(true);
    
    // Dummy medicine names
    const medicineNames = [
      'Paracetamol 500mg', 'Amoxicillin 250mg', 'Ibuprofen 400mg', 
      'Omeprazole 20mg', 'Lisinopril 10mg', 'Metformin 500mg',
      'Atorvastatin 20mg', 'Cetirizine 10mg', 'Azithromycin 500mg',
      'Diclofenac Sodium 50mg', 'Ciprofloxacin 500mg', 'Pantoprazole 40mg'
    ];
    
    // Dummy batch numbers
    const batchPrefixes = ['BCH', 'BT', 'LOT', 'BATCH', 'MFR'];
    const batchNumbers = Array.from({ length: 20 }, () => 
      `${batchPrefixes[Math.floor(Math.random() * batchPrefixes.length)]}-${Math.floor(Math.random() * 10000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
    );
    
    // Dummy manufacturer names
    const manufacturers = [
      'Pfizer Inc.', 'GlaxoSmithKline', 'Novartis', 'Sanofi', 
      'Merck & Co.', 'Roche', 'Johnson & Johnson', 'AstraZeneca',
      'Eli Lilly', 'Abbott Laboratories'
    ];
    
    // Dummy license numbers
    const licenseNos = Array.from({ length: 20 }, () => 
      `LIC-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 1000)}`
    );
    
    // Dummy registration numbers
    const regNos = Array.from({ length: 20 }, () => 
      `REG-${Math.floor(Math.random() * 100000)}`
    );
    
    // Dummy rack locations
    const rackLocations = ['A1', 'B2', 'C3', 'D4', 'E5', 'F6', 'G7', 'H8', 'I9', 'J10'];
    
    // Dummy medicine sizes
    const medicineSizes = ['10x10', '5x10', '20x10', '15x10', '30x10', '50x10', '100x10'];
    
    // Get random category from available categories or use dummy if none exist
    const getRandomCategory = () => {
      if (categories && categories.length > 0) {
        return String(categories[Math.floor(Math.random() * categories.length)]._id);
      }
      return '';
    };
    
    // Get random supplier from available suppliers or use dummy if none exist
    const getRandomSupplier = () => {
      if (suppliers && suppliers.length > 0) {
        return String(suppliers[Math.floor(Math.random() * suppliers.length)]._id);
      }
      return '';
    };
    
    // Generate random date within next 2 years
    const generateExpiryDate = () => {
      const date = moment().add(Math.floor(Math.random() * 730), 'days');
      return date;
    };
    
    // Generate random values
    const randomQuantity = Math.floor(Math.random() * 1000) + 50;
    const randomPrice = Math.floor(Math.random() * 500) + 10;
    const randomDiscount = Math.floor(Math.random() * 30);
    const randomGst = Math.floor(Math.random() * 18) + 1;
    const randomMinAlert = Math.floor(Math.random() * 100) + 10;
    
    // Get random status
    const statuses = ['active', 'inactive', 'discontinued'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate alternative medicines
    const alternativeMedicines = [
      'Alternative Medicine 1', 'Alternative Medicine 2', 'Alternative Medicine 3'
    ];
    
    // Set form values
    form.setFieldsValue({
      name: medicineNames[Math.floor(Math.random() * medicineNames.length)],
      category: getRandomCategory(),
      batch_number: batchNumbers[Math.floor(Math.random() * batchNumbers.length)],
      expiry_date: generateExpiryDate(),
      supplier_name: getRandomSupplier(),
      rack_location: rackLocations[Math.floor(Math.random() * rackLocations.length)],
      medicine_size: medicineSizes[Math.floor(Math.random() * medicineSizes.length)],
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      manufacturer_license_no: licenseNos[Math.floor(Math.random() * licenseNos.length)],
      manufacturer_registration_no: regNos[Math.floor(Math.random() * regNos.length)],
      manufacturer_details: `Manufactured by ${manufacturers[Math.floor(Math.random() * manufacturers.length)]}. Quality assured product with GMP certification.`,
      available_quantity: randomQuantity,
      unit_price: randomPrice,
      minimum_stock_alert: randomMinAlert,
      discount: randomDiscount,
      gst: randomGst,
      status: randomStatus,
      alternative_medicines: alternativeMedicines,
      image: 'https://via.placeholder.com/150',
    });
    
    message.success('Dummy data generated successfully!');
    setGenerating(false);
  };

  // ✅ CLEAR ALL FIELDS
  const clearAllFields = () => {
    resetForm();
    message.info('All fields cleared');
  };

  const handleOk = async () => {
    try {
      // Get form values
      const values = await form.validateFields();
      
      // Ensure numeric fields have values
      const availableQuantity = values.available_quantity !== undefined && values.available_quantity !== null 
        ? Number(values.available_quantity) 
        : 0;
      
      const unitPrice = values.unit_price !== undefined && values.unit_price !== null 
        ? Number(values.unit_price) 
        : 0;
      
      const discount = values.discount !== undefined && values.discount !== null 
        ? Number(values.discount) 
        : 0;
      
      const gst = values.gst !== undefined && values.gst !== null 
        ? Number(values.gst) 
        : 0;
      
      const minimumStockAlert = values.minimum_stock_alert !== undefined && values.minimum_stock_alert !== null 
        ? Number(values.minimum_stock_alert) 
        : 0;

      const rawCat = values.category;
      const categoryId =
        rawCat && typeof rawCat === 'object' && rawCat._id != null
          ? String(rawCat._id)
          : String(rawCat ?? '').trim();

      const rawSup = values.supplier_name;
      const supplierId =
        rawSup && typeof rawSup === 'object' && rawSup._id != null
          ? String(rawSup._id)
          : String(rawSup ?? '').trim();

      const skuTrim = values.sku != null ? String(values.sku).trim() : '';

      const payload = {
        name: values.name,
        ...(skuTrim ? { sku: skuTrim } : {}),
        category: categoryId,
        batch_number: values.batch_number,
        expiry_date: values.expiry_date
          ? values.expiry_date.format('YYYY-MM-DD')
          : null,
        supplier_name: supplierId,
        rack_location: values.rack_location || '',
        medicine_size: values.medicine_size,
        manufacturer: values.manufacturer,
        manufacturer_license_no: values.manufacturer_license_no || '',
        manufacturer_registration_no: values.manufacturer_registration_no || '',
        manufacturer_details: values.manufacturer_details || '',
        available_quantity: availableQuantity,
        unit_price: unitPrice,
        minimum_stock_alert: minimumStockAlert,
           discount,  // ✅ Object shorthand
           gst,       // ✅ Object shorthand
        status: values.status || 'active',
        alternative_medicines: values.alternative_medicines || [],
        image: values.image || '',
        total_value: unitPrice * availableQuantity,
      };

      console.log('Sending payload:', payload);

      if (product) {
        const pid = product.id || product._id;
        if (!pid) {
          message.error('Invalid product selected for update');
          return;
        }
        await dispatch(updateProduct(pid, payload));
      } else {
        await dispatch(createProduct(payload));
      }

      await dispatch(fetchAllProducts());
      resetForm();
      onCancel();
    } catch (error) {
      console.error('Error in handleOk:', error);
      message.error(
        error.response?.data?.error ||
          error.message ||
          'Operation failed'
      );
    }
  };

  return (
    <>
    <ModernModalStyles />
    <Modal
      title={product ? 'Edit Medicine' : 'Create Medicine'}
      visible={visible}
      onCancel={onCancel}
      width={1400}
      className="modern-modal"
      bodyStyle={{
        maxHeight: '72vh',
        overflowY: 'auto',
      }}
      footer={[
        <Space key="actions" direction="horizontal" style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button key="cancel" type="white" onClick={onCancel}>
            Cancel
          </Button>
          <Button key="save" type="primary" onClick={handleOk}>
            {product ? 'Update' : 'Save'}
          </Button>
        </Space>
      ]}
    >
      <BasicFormWrapper>
        <ProductModalForm>
        <Form 
          form={form} 
          layout="vertical"
          size="middle"
          initialValues={{
            available_quantity: 0,
            unit_price: 0,
            discount: 0,
            gst: 0,
            minimum_stock_alert: 0,
            status: 'active',
          }}
        >
          <Tabs defaultActiveKey="1" type="card">
            
            {/* ===== BASIC INFO ===== */}
            <TabPane tab="Basic Info" key="1">
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item 
                    name="name" 
                    label="Medicine Name" 
                    rules={[{ required: true, message: 'Please enter medicine name' }]}
                  >
                    <Input placeholder="Enter medicine name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item
                    name="sku"
                    label="SKU"
                    tooltip="Stock keeping unit (optional — auto-generated if left empty)"
                  >
                    <Input placeholder="e.g. MED-PARA-500" allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item 
                    name="category" 
                    label="Category" 
                    rules={[{ required: true, message: 'Please select category' }]}
                  >
                    <Select
                      showSearch
                      placeholder={categories?.length ? 'Select Category' : 'No categories — add Categories first'}
                      loading={productsLoading}
                      optionFilterProp="children"
                      notFoundContent="No matching category"
                    >
                      {categories?.map((cat) => {
                        const id = String(cat._id);
                        return (
                          <Option key={id} value={id}>
                            {cat.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item 
                    name="batch_number" 
                    label="Batch Number" 
                    rules={[{ required: true, message: 'Please enter batch number' }]}
                  >
                    <Input placeholder="Enter batch number" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider className="section-gap" plain orientation="left" style={{ fontSize: 13, color: '#64748b', margin: '10px 0' }}>
                Expiry, supplier & packaging
              </Divider>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item 
                    name="expiry_date" 
                    label="Expiry Date" 
                    rules={[{ required: true, message: 'Please select expiry date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item 
                    name="supplier_name" 
                    label="Supplier Name" 
                    rules={[{ required: true, message: 'Please select supplier' }]}
                  >
                    <Select
                      showSearch
                      placeholder={suppliers?.length ? 'Select Supplier' : 'No suppliers — add Suppliers first'}
                      loading={productsLoading}
                      optionFilterProp="children"
                      notFoundContent="No matching supplier"
                    >
                      {suppliers?.map((sup) => {
                        const id = String(sup._id);
                        return (
                          <Option key={id} value={id}>
                            {sup.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="rack_location" label="Rack Location">
                    <Input placeholder="Enter rack location" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item 
                    name="medicine_size" 
                    label="Medicine Size" 
                    rules={[{ required: true, message: 'Please enter medicine size' }]}
                  >
                    <Input placeholder="e.g. 10×10" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* ===== MANUFACTURER ===== */}
            <TabPane tab="Manufacturer Info" key="2">
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item 
                    name="manufacturer" 
                    label="Manufacturer Name" 
                    rules={[{ required: true, message: 'Please enter manufacturer name' }]}
                  >
                    <Input placeholder="Enter manufacturer name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="manufacturer_license_no" label="License No">
                    <Input placeholder="Enter license number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="manufacturer_registration_no" label="Registration No">
                    <Input placeholder="Enter registration number" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col span={24}>
                  <Form.Item name="manufacturer_details" label="Details" style={{ marginBottom: 0 }}>
                    <TextArea rows={2} placeholder="Notes" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* ===== STOCK ===== */}
            <TabPane tab="Pricing & Stock" key="3">
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item 
                    name="available_quantity" 
                    label="Quantity" 
                    rules={[{ required: true, message: 'Please enter quantity' }]}
                  >
                    <InputNumber 
                      min={0} 
                      style={{ width: '100%' }} 
                      placeholder="Qty"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item 
                    name="unit_price" 
                    label="Price" 
                    rules={[{ required: true, message: 'Please enter price' }]}
                  >
                    <InputNumber 
                      min={0} 
                      style={{ width: '100%' }} 
                      placeholder="Price"
                      formatter={value => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/PKR\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="minimum_stock_alert" label="Min Alert">
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Min stock" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider className="section-gap" plain orientation="left" style={{ fontSize: 13, color: '#64748b', margin: '10px 0' }}>
                Tax & status
              </Divider>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="discount" label="Discount %">
                    <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="%" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="gst" label="GST %">
                    <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="%" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="status" label="Status" initialValue="active">
                    <Select>
                      {STATUS.map((opt) => (
                        <Option key={opt.key} value={opt.value}>
                          {opt.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* ===== EXTRA ===== */}
            <TabPane tab="Additional Info" key="4">
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="alternative_medicines" label="Alternatives">
                    <Select mode="tags" placeholder="Alternative medicines" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="image" label="Image URL">
                    <Input placeholder="https://…" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

          </Tabs>
        </Form>
        </ProductModalForm>
      </BasicFormWrapper>
    </Modal>
    </>
  );
}

CreateProduct.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  product: propTypes.object,
};

CreateProduct.defaultProps = {
  product: null,
};

export default CreateProduct;