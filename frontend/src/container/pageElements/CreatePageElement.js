import React, { useEffect, useState } from 'react';
import { Form, Input, Row, Col, InputNumber, message, Select, Checkbox, Divider } from 'antd';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import TextArea from 'antd/lib/input/TextArea';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createPageElement, fetchAllPageElements, updatePageElement } from '../../redux/pageElements/pageElementSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { FIELD_TYPE, FIELD_TYPE_OPTIONS, DATE_DEFAULT_OPTIONS } from '../../config/data/data';

function CreatePageElement({ visible, onCancel, pageElement, pageId }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [selectedType, setSelectedType] = useState('text');
    const [incremental, setIncremental] = useState(false);
    const [multiline, setMultiline] = useState(false);
    const [optionsType, setOptionsType] = useState('manual');



    useEffect(() => {
        if (visible) {
            if (pageElement) {
                form.setFieldsValue({
                    ...pageElement,
                    type: pageElement.type || 'text'
                });
                setSelectedType(pageElement.type || 'text');
                setIncremental(pageElement.incremental || false);
                setMultiline(pageElement.multiline || false);
                setOptionsType(pageElement.additional_settings?.options_type || 'manual');
            } else {
                form.resetFields();
                form.setFieldsValue({ type: 'text' });
                setSelectedType('text');
                setIncremental(false);
                setMultiline(false);
                setOptionsType('manual');
            }
        }
    }, [pageElement, visible]);


    const handleTypeChange = (value) => {
        setSelectedType(value);
        form.setFieldsValue({ type: value });
    };

    const handleIncrementalChange = (checked) => {
        setIncremental(checked);
    };

    const handleMultilineChange = (checked) => {
        setMultiline(checked);
    };

    const handleOptionsTypeChange = (value) => {
        setOptionsType(value);
    };

    const resetForm = () => {
        form.resetFields();
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                key: values.name.toLowerCase().replace(/\s+/g, '_'),
                page_id: pageId,
            };
            if (payload.additional_settings?.options &&
                typeof payload.additional_settings.options === 'string') {
                payload.additional_settings.options =
                    payload.additional_settings.options.split('\n');
            }
            if (pageElement) {
                await dispatch(updatePageElement(pageElement.id, payload));
                message.success('Updated successfully');
            } else {
                await dispatch(createPageElement(payload));
                message.success('Created successfully');
            }

            await dispatch(fetchAllPageElements(pageId));
            resetForm();
            onCancel();
        } catch (error) {
            console.error('Full error object:', error);
            console.error('Error response data:', error.response?.data);
            message.error(error.response?.data?.error || error.message || 'Operation failed');
        }
    };

    const handleCancel = () => {
        resetForm();
        onCancel();
    };

    return (
        <Modal
            type="primary"
            title={pageElement ? 'Update Page Element' : 'Create Page Element'}
            visible={visible}
            footer={[
                <div key="footer" className="pageElement-modal-footer">
                    <Button size="default" type="primary" onClick={handleOk}>
                        {pageElement ? "Update" : "Save"}
                    </Button>
                </div>,
            ]}
            onCancel={handleCancel}
        >
            <div className="#project-modal">
                <BasicFormWrapper>
                    <Form form={form} layout="vertical" name="createPageElement">
                        <Row gutter={16}>
                            <Col className='mt-2' span={6}>
                                <Form.Item name="type" label="Field type" rules={[{ required: true }]}>
                                    <Select options={FIELD_TYPE} onChange={handleTypeChange} />
                                </Form.Item>
                            </Col>
                            <Col className='mt-2' span={6}>
                                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                                    <Input placeholder="Enter title" />
                                </Form.Item>
                            </Col>
                            <Col className='mt-2' span={6}>
                                <Form.Item name="label" label="Field Label" rules={[{ required: true }]}>
                                    <Input placeholder="Enter field label" />
                                </Form.Item>
                            </Col>
                            <Col className='mt-2' span={6}>
                                <Form.Item name="required" label="Required" valuePropName="checked">
                                    <Checkbox>Required field</Checkbox>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            {selectedType === 'text' && (
                                <Col className='mt-2' span={6}>
                                    <Form.Item name="multiline" label="Multiline text?" valuePropName="checked">
                                        <Checkbox onChange={(e) => handleMultilineChange(e.target.checked)}>Multiline</Checkbox>
                                    </Form.Item>
                                </Col>
                            )}
                            {selectedType === 'text' && (
                                <Col className='mt-2' span={6}>
                                    <Form.Item name="rows" label="Number of rows">
                                        <InputNumber
                                            min={1}
                                            style={{ width: '100%' }}
                                            disabled={!multiline}
                                        />
                                    </Form.Item>
                                </Col>
                            )}
                            {(selectedType === 'text' ||
                                selectedType === 'htmlEditor' ||
                                selectedType === 'numbers' ||
                                selectedType === 'dateTime' ||
                                selectedType === 'dropdownList' ||
                                selectedType === 'checkbox' ||
                                selectedType === 'options' ||
                                selectedType === 'file') && (
                                    <Col className='mt-2' span={6}>
                                        <Form.Item name="priority" label="Priority">
                                            <InputNumber min={0} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                )}
                            {selectedType === 'text' && (
                                <Col className='mt-2' span={6}>
                                    <Form.Item name="no_duplicate" label="Unique-key field?" valuePropName="checked">
                                        <Checkbox>Do not allow duplicate</Checkbox>
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>
                        {selectedType === 'file' && (
                            <Row gutter={16}>
                                <Col className='mt-2' span={8}>
                                    <Form.Item name="file_type" label="File type">
                                        <Select options={FIELD_TYPE_OPTIONS} />
                                    </Form.Item>
                                </Col>
                                {/* <Col className='mt-2' span={8}>
                                    <Form.Item name="show_preview" label="Need preview?" valuePropName="checked">
                                        <Checkbox>Show preview</Checkbox>
                                    </Form.Item>
                                </Col> */}
                            </Row>
                        )}

                        <Divider />
                        {(selectedType === 'text' || selectedType === 'numbers') && (
                            <Row gutter={16}>
                                <Col className='mt-2' span={8}>
                                    <Form.Item name="incremental" label="Auto Incremental?" valuePropName="checked">
                                        <Checkbox onChange={(e) => handleIncrementalChange(e.target.checked)}>
                                            Auto Increment this field
                                        </Checkbox>
                                    </Form.Item>
                                </Col>
                                {incremental && (
                                    <>
                                        {selectedType === 'text' && (
                                            <Col className='mt-2' span={8}>
                                                <Form.Item name="prefix" label="Prefix format">
                                                    <Input placeholder="XYZ-0001" />
                                                </Form.Item>
                                            </Col>
                                        )}
                                        <Col className='mt-2' span={8}>
                                            <Form.Item name="digits" label="Digital counts">
                                                <Input placeholder="4" />
                                            </Form.Item>
                                        </Col>
                                    </>
                                )}
                            </Row>
                        )}
                        <Row gutter={16}>
                            {(selectedType === 'text' ||
                                selectedType === 'dropdownList' ||
                                selectedType === 'file' ||
                                selectedType === 'checkbox') && (
                                    <Col className='mt-2' span={6}>

                                        <Form.Item name="placeholder" label="Placeholder text">
                                            <Input placeholder="Enter placeholder" />
                                        </Form.Item>
                                    </Col>
                                )}
                            {selectedType !== 'file' && (
                                <Col className='mt-2' span={6}>
                                    <Form.Item name="default_value" label="Default value">
                                        {selectedType === 'checkbox' ? (
                                            <Checkbox>Checked</Checkbox>
                                        ) : selectedType === 'date' ? (
                                            <Select options={DATE_DEFAULT_OPTIONS} />
                                        ) : (
                                            <Input placeholder="Enter default value" />
                                        )}
                                    </Form.Item>
                                </Col>
                            )}
                            {(selectedType === 'text' || selectedType === 'numbers') && (
                                <Col className='mt-2' span={6}>
                                    <Form.Item name="maxlength" label="Max. characters length">
                                        <Input placeholder="Enter max length" />
                                    </Form.Item>
                                </Col>
                            )}
                            {(selectedType === 'text' || selectedType === 'numbers') && (
                                <Col className='mt-2' span={6}>
                                    <Form.Item name="format" label="Text format (regex)">
                                        <Input placeholder="Enter regex format" />
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>
                        {(selectedType === 'dropdownList' || selectedType === 'options') && (
                            <Row gutter={16}>
                                <Col className='mt-2' span={24}>
                                    <Form.Item name={['additional_settings', 'options_type']} label="Options Source">
                                        <Select
                                            options={[
                                                { value: 'manual', label: 'Manual List' },
                                                { value: 'collection', label: 'From Collections' }
                                            ]}
                                            onChange={handleOptionsTypeChange}
                                        />
                                    </Form.Item>
                                </Col>

                                {optionsType === 'manual' ? (
                                    <Col className='mt-2' span={24}>
                                        <Form.Item name={['additional_settings', 'options']} label="Options (one per line)">
                                            <TextArea rows={4} />
                                        </Form.Item>
                                    </Col>
                                ) : (
                                    <>
                                        <Col className='mt-2' span={12}>
                                            <Form.Item name={['additional_settings', 'collection_name']} label="Collection">
                                                <Select placeholder="Select collection">
                                                    {/* Populate with your collections */}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col className='mt-2' span={12}>
                                            <Form.Item name={['additional_settings', 'element_name']} label="Field">
                                                <Select placeholder="Select field">
                                                    {/* Populate with your fields */}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </>
                                )}
                            </Row>
                        )}
                        <Row gutter={16}>
                            <Col className='mt-2' span={8}>
                                <Form.Item name="ui_width" label="UI Width">
                                    <Select>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                            <Select.Option key={n} value={`col-md-${n}`}>
                                                {n} cols
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col className='mt-2' span={8}>
                                <Form.Item name="style_css" label="CSS Class">
                                    <Input placeholder="CSS class name(s)" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col className='mt-2' span={8}>
                                <Form.Item name="enable_in_new" label="Enable_in_new" valuePropName="checked">
                                    <Checkbox>Show new</Checkbox>
                                </Form.Item>
                            </Col>
                            <Col className='mt-2' span={8}>
                                <Form.Item name="enable_in_list" label="Enable_in_list" valuePropName="checked">
                                    <Checkbox>Show list</Checkbox>
                                </Form.Item>
                            </Col>
                            <Col className='mt-2' span={8}>
                                <Form.Item name="enable_in_update" label="Enable_in_update" valuePropName="checked">
                                    <Checkbox>Show update</Checkbox>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </BasicFormWrapper>
            </div>
        </Modal>
    );
}

CreatePageElement.propTypes = {
    visible: propTypes.bool.isRequired,
    onCancel: propTypes.func.isRequired,
    pageElement: propTypes.object,
    pageId: propTypes.string,
};

CreatePageElement.defaultProps = {
    pageElement: null,
    pageId: null,
};

export default CreatePageElement;

