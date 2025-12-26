import React, { useState } from 'react';
import { Row, Col, Form, Input, Upload, Spin, PageHeader } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
import { Main, BasicFormWrapper } from '../../styled';
import {
  axiosDataSubmit,
  axiosFileUploder,
  axiosFileClear,
} from '../../../redux/crud/axios/actionCreator';
import Heading from '../../../components/heading/heading';
import { RecordFormWrapper } from '../../crud/axios/Style';
import { changePassword } from '../../../redux/users/userSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const { login } = useSelector((state) => state.auth);
  const { url, isFileLoading } = useSelector((state) => {
    return {
      isLoading: state.AxiosCrud.loading,
      url: state.AxiosCrud.url,
      isFileLoading: state.AxiosCrud.fileLoading,
    };
  });

  const [form] = Form.useForm();

  const [state] = useState({
    join: '',
  });

  const handleValuesChange = (_, allValues) => {
    if (changePasswordMode) {
      const { newPassword, confirmPassword } = allValues;
      setIsSaveEnabled(
        !!newPassword &&
        !!confirmPassword &&
        newPassword === confirmPassword
      );
    }
  };

  const handleSubmit = (values) => {
    if (changePasswordMode) {
      dispatch(
        changePassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        })
      );
    } else {
      dispatch(
        axiosDataSubmit({
          ...values,
          image: url,
          join: state.join,
          id: new Date().getTime(),
        })
      );
      dispatch(axiosFileClear());
    }

    form.resetFields();
    setChangePasswordMode(false);
  };

  const props = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    multiple: false,
    showUploadList: false,
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        dispatch(axiosFileUploder(info.file.originFileObj));
      }
    },
  };

  return (
    <>
      <PageHeader
        buttons={[
          <Button
            className="btn-add_new"
            size="default"
            key="1"
            type="primary"
          />,
        ]}
        ghost
        title="Profile"
      />
      <Main>
        <Row gutter={15}>
          <Col xs={24}>
            <RecordFormWrapper>
              <Cards headless>
                <Row justify="center">
                  <Col xl={10} md={16} xs={24}>
                    <BasicFormWrapper>
                      <Form
                        className="add-record-form"
                        style={{ width: '100%' }}
                        layout="vertical"
                        form={form}
                        name="addnew"
                        onFinish={handleSubmit}
                        onValuesChange={handleValuesChange}
                      >
                        <figure className="pro-image align-center-v">
                          <img
                            src={
                              url === null
                                ? require('../../../static/img/avatar/profileImage.png')
                                : `https://demo.jsnorm.com/laravel/strikingdash/${url}`
                            }
                            alt=""
                          />
                          <figcaption>
                            <Upload {...props}>
                              <Link className="upload-btn" to="#">
                                <FeatherIcon icon="camera" size={16} />
                              </Link>
                            </Upload>
                            <div className="info">
                              <Heading as="h4">Profile Photo</Heading>
                            </div>
                            {isFileLoading && (
                              <div className="isUploadSpain">
                                <Spin />
                              </div>
                            )}
                          </figcaption>
                        </figure>

                        {changePasswordMode ? (
                          <>
                            <Form.Item
                              name="oldPassword"
                              label="Old Password"
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter old password',
                                },
                              ]}
                            >
                              <Input.Password placeholder="Enter Old Password" />
                            </Form.Item>

                            <Form.Item
                              name="newPassword"
                              label="New Password"
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter new password',
                                },
                              ]}
                            >
                              <Input.Password placeholder="Enter New Password" />
                            </Form.Item>

                            <Form.Item
                              name="confirmPassword"
                              label="Confirm Password"
                              dependencies={['newPassword']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please confirm your password',
                                },
                                ({ getFieldValue }) => ({
                                  validator(_, value) {
                                    if (
                                      !value ||
                                      getFieldValue('newPassword') === value
                                    ) {
                                      return Promise.resolve();
                                    }
                                    return Promise.reject(
                                      new Error('Passwords do not match!')
                                    );
                                  },
                                }),
                              ]}
                            >
                              <Input.Password placeholder="Confirm Password" />
                            </Form.Item>
                          </>
                        ) : (
                          <>
                            <Form.Item name="name" label="Name">
                              <Input
                                placeholder="Input Name"
                                defaultValue={login.name}
                              />
                            </Form.Item>
                            <Form.Item name="password" label="Password">
                              <Input.Password
                                placeholder="Enter Password"
                                defaultValue={login.plain_password}
                              />
                            </Form.Item>
                          </>
                        )}

                        <div className=" text-right">
                          <Button
                            size="default"
                            type="primary"
                            onClick={() =>
                              setChangePasswordMode(!changePasswordMode)
                            }
                          >
                            {changePasswordMode
                              ? 'Cancel'
                              : 'Change Password'}
                          </Button>

                          {changePasswordMode && (
                            <Button
                              size="default"
                              type="primary"
                              htmlType="submit"
                              style={{ marginLeft: '10px' }}
                              disabled={!isSaveEnabled}
                            >
                              Update Password
                            </Button>
                          )}
                        </div>
                      </Form>
                    </BasicFormWrapper>
                  </Col>
                </Row>
              </Cards>
            </RecordFormWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default Profile;
