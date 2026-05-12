import React, { useState } from 'react';
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import { Form, Input, Button } from 'antd';
import {
  AidLoginPage,
  AidLoginCard,
  AidLoginCardBody,
} from './style';
import { Checkbox } from '../../../../components/checkbox/checkbox';

function SignUp() {
  const [state, setState] = useState({
    values: null,
    checked: null,
  });
  const handleSubmit = (values) => {
    setState({ ...state, values });
  };

  const onChange = (checked) => {
    setState({ ...state, checked });
  };

  const logoSrc = `${process.env.PUBLIC_URL}/aid-plus-logo.png`;

  return (
    <AidLoginPage>
      <div className="aid-page-logo">
        <img src={logoSrc} alt="Aid+" />
      </div>

      <AidLoginCard>
        <AidLoginCardBody>
          <h2 className="aid-welcome-title">Create an account</h2>
          <p className="aid-welcome-sub">Fill in your details to get started</p>

          <Form name="register" onFinish={handleSubmit} layout="vertical" requiredMark={false}>
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: 'Please input your full name!' }]}
            >
              <Input placeholder="John Doe" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
            >
              <Input placeholder="name@company.com" autoComplete="email" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password placeholder="Create a password" />
            </Form.Item>
            <div style={{ marginBottom: 18 }}>
              <Checkbox onChange={onChange} checked={state.checked}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </Checkbox>
            </div>
            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                className="aid-signin-submit"
                htmlType="submit"
                type="primary"
                size="large"
                block
              >
                Create Account
              </Button>
            </Form.Item>
            <p style={{ textAlign: 'center', margin: 0, fontSize: 14, color: '#9CA3AF' }}>
              Already have an account?{' '}
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

export default SignUp;
