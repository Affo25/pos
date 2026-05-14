import React from 'react';
import { Form, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  AidLoginPage,
  AidLoginCard,
  AidLoginCardBody,
} from './style';
import { loginUser } from '../../../../redux/authentication/authSlice';

const SignIn = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const isLoading = useSelector((state) => state.auth.loading);

  const handleSubmit = (values) => {
    const { username, password } = values;
    dispatch(loginUser({ email: username, password }));
  };

  const logoSrc = `${process.env.PUBLIC_URL}/logo.png`;

  return (
    <AidLoginPage>
      <div className="aid-page-logo">
        <img src={logoSrc} alt="Aid+"/>
      </div>

      <AidLoginCard>
        <AidLoginCardBody>
          <h2 className="aid-welcome-title">Welcome back</h2>
          <p className="aid-welcome-sub">Sign in to your account to continue</p>

          <Form
            name="login"
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your email!' }]}
              label="Email"
            >
              <Input placeholder="name@company.com" autoComplete="email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
              label="Password"
            >
              <Input.Password placeholder="Enter your password" autoComplete="current-password" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                className="aid-signin-submit"
                htmlType="submit"
                type="primary"
                size="large"
                loading={isLoading}
                block
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>
        </AidLoginCardBody>
      </AidLoginCard>
    </AidLoginPage>
  );
};

export default SignIn;
