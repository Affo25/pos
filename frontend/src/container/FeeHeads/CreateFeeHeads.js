import React, { useEffect } from 'react';
import { Form, Input, Row, Col, message, Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { STATUS } from '../../config/data/data';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { createFeeHeads, updateFeeHeads } from '../../redux/feeheads/feeheadsSlice';
import { BasicFormWrapper } from '../../config/default/styled';
import { generateSubjectCode } from '../../config/utils/codeGenerator';

function CreateFeeHeads({ visible, onCancel, feeheads, onSuccess }) {
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (feeheads) {
        form.setFieldsValue({
          name: feeheads.name,
          code: feeheads.code,
          status: feeheads.status,
        });
      }
    }
  }, [feeheads, form, visible]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setFieldsValue({
      code: generateSubjectCode(name),
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const feeheadsData = {
        name: values.name,
        code: values.code,
        status: values.status,
        branch_id: selectedBranchId,
      };

      if (feeheads) {
        await dispatch(updateFeeHeads(feeheads.id, feeheadsData));
        toast.success('Updated successfully 🎉', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await dispatch(createFeeHeads(feeheadsData));
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
      title={feeheads ? 'Edit FeeHeads' : 'Create FeeHeads'}
      visible={visible}
      footer={[
        <div key="1" className="feeheads-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {feeheads ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="feeheads-modal">
        <BasicFormWrapper>
          <Form form={form} name="createFeeHeads" layout="vertical">
            <Row gutter={16}>
              <Col className="mt-2" span={12}>
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter Name" onChange={handleNameChange} />
                </Form.Item>
              </Col>

              <Col className="mt-2" span={12}>
                <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                  <Input  placeholder="Enter Code" />
                </Form.Item>
              </Col>

              <Col className="mt-2" span={12}>
                <Form.Item name="status" label="Status" initialValue="active">
                  <Select>
                    {STATUS.map((option) => (
                      <Select.Option key={option.key} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateFeeHeads.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  feeheads: propTypes.object,
  onSuccess: propTypes.func,
};

CreateFeeHeads.defaultProps = {
  feeheads: null,
};

export default CreateFeeHeads;
