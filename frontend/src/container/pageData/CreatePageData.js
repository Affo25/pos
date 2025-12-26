/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import React, { useEffect } from 'react';
import { Form, Row, Col, message, Input, InputNumber, Select, Checkbox, DatePicker, Upload, Radio } from 'antd';
import moment from 'moment';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { BasicFormWrapper } from '../../config/default/styled';
import { createPageData, updatePageData } from '../../redux/pageData/actionCreator';
import HTMLEditor from '../../components/formFields/HTMLEditor';

function CreatePageData({ visible, onCancel, pageTitle, selectedPage, onSuccess }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { pageElements } = useSelector((state) => state.pageElements);
  const { pageId } = useParams();

  const resetForm = () => {
    form.resetFields();
  };

  const generatePageKey = (values) => {
    return values.first_name ? values.first_name.toLowerCase().replace(/\s+/g, '-') : `page-data-${Date.now()}`;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const formattedValues = { ...values };
      pageElements.forEach((element) => {
        const val = values[element.key];
        if (val && (element.type === 'date' || element.type === 'dateTime')) {
          formattedValues[element.key] = val.format(element.type === 'dateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
        }
      });

      pageElements.forEach((element) => {
        if (element.type === 'file') {
          const fileList = values[element.key];
          formattedValues[element.key] = fileList && fileList.length > 0 ? fileList[0].name : null;
        }
      });

      const dataToSend = {
        ...formattedValues,
        page_id: pageId,
        page_title: pageTitle,
        page_key: values.page_key || generatePageKey(values),
      };

      pageElements.forEach((element) => {
        if (element.type === 'file') return;
        const value = values[element.key];
        dataToSend[element.key] = value !== undefined && value !== '' ? value : null;
      });
      const recordId = selectedPage?._id || selectedPage?.id;

      if (recordId) {
        await dispatch(updatePageData(recordId, dataToSend));
        message.success('Data updated successfully');
      } else {
        await dispatch(createPageData(dataToSend));
        message.success('Data saved successfully');
      }

      resetForm();
      onCancel();
      onSuccess?.();
    } catch (error) {
      console.error('Operation error:', error);
      message.error(error.message || 'Failed to save data');
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const renderField = (element) => {
    const {
      type,
      name,
      key,
      required,
      placeholder,
      additional_settings = {},
      multiline,
      rows,
      default_value,
    } = element;

    const rules = required ? [{ required: true, message: `${name} is required` }] : [];
    const options = Array.isArray(additional_settings.options)
      ? additional_settings.options.map((opt) => ({
        value: opt.trim(),
        label: opt.trim(),
      }))
      : [];

    switch (type) {
      case 'text':
        return (
          <Form.Item key={key} name={key} label={name} rules={rules} initialValue={default_value || ''}>
            {multiline ? (
              <Input.TextArea rows={rows || 4} placeholder={placeholder || ''} />
            ) : (
              <Input placeholder={placeholder || ''} />
            )}
          </Form.Item>
        );
      case 'numbers':
        return (
          <Form.Item key={key} name={key} label={name} rules={rules} initialValue={default_value || 0}>
            <InputNumber style={{ width: '100%' }} placeholder={placeholder || ''} />
          </Form.Item>
        );
      case 'dropdownList':
        return (
          <Form.Item key={key} name={key} label={name} rules={rules} initialValue={default_value || undefined}>
            <Select placeholder={placeholder || 'Select an option'}>
              {options.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'options':
        return (
          <Form.Item key={key} name={key} label={name} rules={rules} initialValue={default_value || undefined}>
            <Radio.Group>
              {options.map((opt) => (
                <Radio key={opt.value} value={opt.value}>
                  {opt.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );



      case 'htmlEditor':
        return (
          <Form.Item key={key} name={key} label={name} rules={rules} initialValue={default_value || ''}>
            <HTMLEditor
              value={form.getFieldValue(key) || default_value || ''}
              onChange={(val) => form.setFieldsValue({ [key]: val })}
              placeholder={placeholder || ''}
            />
          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item
            key={key}
            name={key}
            label={name}
            valuePropName="checked"
            initialValue={default_value === 'true' || default_value === true}
          >
            <Checkbox>{placeholder || ''}</Checkbox>
          </Form.Item>
        );
      case 'select':
        return (
          <Form.Item key={key} name={key} label={name} rules={rules}>
            <Select placeholder={placeholder || 'Select an option'}>
              {options.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'date':
      case 'dateTime':
        return (
          <Form.Item
            key={key}
            name={key}
            label={name}
            rules={rules}
            initialValue={
              default_value && moment(default_value).isValid() ? moment(default_value) : null
            }
          >
            <DatePicker
              style={{ width: '100%' }}
              // showTime={type === 'dateTime'}
              format={type === 'dateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
              placeholder={placeholder || ''}
            />
          </Form.Item>
        );
      case 'file': {
        const fileAcceptMap = {
          pdf: '.pdf',
          image: '.jpg,.jpeg,.png',
          doc: '.doc,.docx',
          xls: '.xls,.xlsx',
        };

        const fileType = element.file_type;
        const acceptType = fileAcceptMap[fileType] || '';

        const initialValue = default_value
          ? [{
            uid: '-1',
            name: default_value,
            status: 'done',
          }]
          : [];

        return (
          <>
            <Form.Item
              name={key}
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList}
              rules={rules}
              initialValue={initialValue}
              style={{ display: 'none' }}
            >
              <Upload beforeUpload={() => false} />
            </Form.Item>

            <Form.Item label={name} required={!!rules?.length}>
              <Input.Group compact style={{ width: '100%', display: 'flex' }}>
                <Form.Item name={`${key}_name`} noStyle>
                  <Input
                    readOnly
                    placeholder="No file selected"
                    style={{
                      width: '75%',
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                  />
                </Form.Item>
                <Upload
                  style={{ width: '25%' }}
                  accept={acceptType}
                  beforeUpload={() => false}
                  showUploadList={false}
                  maxCount={1}
                  onChange={({ fileList }) => {
                    const fileName = fileList?.[0]?.name || '';
                    form.setFieldsValue({
                      [key]: fileList,
                      [`${key}_name`]: fileName,
                    });
                  }}
                >
                  <Button
                    type="primary"
                    style={{
                      width: '100%',
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      height: '50px',
                    }}
                  >
                    {fileType?.toUpperCase() || 'Upload'}
                  </Button>
                </Upload>
              </Input.Group>
            </Form.Item >
          </>
        );
      }
      default:
        return (
          <Form.Item key={key} name={key} label={name} rules={rules} initialValue={default_value || ''}>
            <Input placeholder={placeholder || ''} />
          </Form.Item>
        );
    }
  };


  useEffect(() => {
    if (visible) {
      if (selectedPage) {
        const formattedValues = { ...selectedPage };

        pageElements.forEach((element) => {
          const val = formattedValues[element.key];

          if ((element.type === 'date' || element.type === 'dateTime') && val) {
            formattedValues[element.key] = moment(val);
          }

          if (element.type === 'file' && val) {
            formattedValues[element.key] = [{
              uid: '-1',
              name: val,
              status: 'done',
            }];
          }
        });

        form.setFieldsValue(formattedValues);
      } else {
        resetForm();
      }
    }
  }, [visible, selectedPage, form, pageElements]);


  return (
    <Modal
      type="primary"
      title={selectedPage ? 'Edit Data' : 'Add Data'}
      visible={visible}
      footer={[
        <div key="footer" className="page-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {selectedPage ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
      width={800}
    >
      <div className="page-modal">
        <BasicFormWrapper>
          <Form form={form} name="createPageData" layout="vertical">
            <Row gutter={16}>
              {pageElements
                ?.filter(element => {
                  if (!selectedPage) {
                    return element.enable_in_new !== false;
                  }
                  return element.enable_in_update !== false;
                })
                .map((element) => (
                  <Col
                    className={`mt-2 ${element.ui_width || 'col-md-12'}`}
                    key={element.key}
                  >
                    {renderField(element)}
                  </Col>
                ))}
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreatePageData.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  pageTitle: propTypes.string,
  selectedPage: propTypes.shape({
    id: propTypes.string,
    _id: propTypes.string,
  }),
  onSuccess: propTypes.func,
};

export default CreatePageData;
