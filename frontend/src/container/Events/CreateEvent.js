/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, message, DatePicker } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createEvent, updateEvent } from '../../redux/events/eventSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import FileUpload from '../../components/common/fileUpload';

function CreateEvent({ visible, onCancel, event, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (event) {
        form.setFieldsValue({
          eventName: event.eventName,
          totalDays: event.totalDays,
          eventDate: event.eventDate ? moment(event.eventDate) : null,
          eventImage: event.eventImage
            ? event.eventImage.map((file, index) => ({
              uid: index.toString(),
              name: file.split('/').pop(),
              url: `${process.env.REACT_APP_API_URL}${file}`,
            }))
            : [],
        });
      }
    }
  }, [event, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const eventData = {
        eventName: values.eventName,
        totalDays: values.totalDays,
        eventDate: values.eventDate?.format('YYYY-MM-DD'),
        eventImage: uploadedImageUrl || values.eventImage,
        branch_id: selectedBranchId,
      };

      if (values.eventImage && values.eventImage.length > 0) {
        const file = values.eventImage[0].originFileObj;
        eventData.eventImage = file;
      }

      if (event) {
        await dispatch(updateEvent(event.id, eventData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createEvent(eventData));
        toast.success('Created successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      }

      onSuccess();
      resetForm();
      onCancel();
    } catch (error) {
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
      title={event ? 'Edit Event' : 'Create Event'}
      visible={visible}
      footer={[
        <div key="1" className="event-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {event ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="event-modal">
        <BasicFormWrapper>
          <Form form={form} name="createEvent" layout="vertical">
            <Row gutter={16}>
              {/* Event Name */}
              <Col className="mt-2" span={12}>
                <Form.Item
                  name="eventName"
                  label="Event Name"
                  rules={[{ required: true, message: 'Please enter Event Name' }]}
                >
                  <Input placeholder="Enter Event Name" />
                </Form.Item>
              </Col>

              {/* Total Days */}
              <Col className="mt-2" span={12}>
                <Form.Item
                  name="totalDays"
                  label="Total Days"
                  rules={[{ required: true, message: 'Please enter Total Days' }]}
                >
                  <Input type="number" placeholder="Enter Total Days" />
                </Form.Item>
              </Col>
              {/* Choose Date */}
              <Col className="mt-2" span={12}>
                <Form.Item
                  name="eventDate"
                  label="Choose Date"
                  rules={[{ required: true, message: 'Please choose a date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              {/* Event Image */}
              <Col span={24} className="mt-2">
                <Form.Item name="eventImage" label="Event File" valuePropName="value" getValueFromEvent={(e) => e}>
                  <FileUpload
                    maxCount={1}
                    buttonText="Upload event File"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateEvent.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  event: propTypes.object,
  onSuccess: propTypes.func,
};

CreateEvent.defaultProps = {
  event: null,
};

export default CreateEvent;
