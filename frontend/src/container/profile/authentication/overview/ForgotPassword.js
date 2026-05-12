import React, { useState } from 'react';
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import { Form, Input, Button } from 'antd';
import {
  AidLoginPage,
  AidLoginCard,
  AidLoginCardBody,
} from './style';

function ForgotPassword() {
  const [state, setState] = useState({
    values: null,
  });
  const handleSubmit = (values) => {
    setState({ ...state, values });
  };

  const logoSrc = `${process.env.PUBLIC_URL}/aid-plus-logo.png`;

  return (
    <AidLoginPage>
      <div className="aid-page-logo">
        <img src={logoSrc} alt="Aid+" />
      </div>

      <AidLoginCard>
        <AidLoginCardBody>
          <h2 className="aid-welcome-title">Forgot Password?</h2>
          <p className="aid-welcome-sub">
            Enter your email and we'll send you instructions to reset your password.
          </p>

          <Form name="forgotPass" onFinish={handleSubmit} layout="vertical" requiredMark={false}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
            >
              <Input placeholder="name@company.com" autoComplete="email" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                className="aid-signin-submit"
                htmlType="submit"
                type="primary"
                size="large"
                block
              >
                Send Reset Instructions
              </Button>
            </Form.Item>
            <p style={{ textAlign: 'center', margin: 0, fontSize: 14, color: '#9CA3AF' }}>
              Return to{' '}
              <NavLink to="/" style={{ color: '#2D3142', fontWeight: 600 }}>
                Sign In
              </NavLink>
            </p>
          </Form>
        </AidLoginCardBody>
      </AidLoginCard>
    </AidLoginPage>
  );
}

export default ForgotPassword;
