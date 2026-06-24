import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  AidLoginPage,
  AidLoginCard,
  AidLoginCardBody,
} from './style';
import { loginUser } from '../../../../redux/authentication/authSlice';
import { API_BASE, responseJson } from '../../../../config/apiBase';

const SignIn = () => {
  const dispatch = useDispatch();
  const [loginForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [view, setView] = useState('login');
  const [resetEmail, setResetEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const isLoading = useSelector((state) => state.auth.loading);

  const handleLoginSubmit = (values) => {
    const { username, password } = values;
    dispatch(loginUser({ email: username, password }));
  };

  const handleSendEmail = async (values) => {
    try {
      setSendingOtp(true);
      const response = await fetch(`${API_BASE}/users/send-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });
      const data = await responseJson(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setResetEmail(values.email);
      message.success(data.message || 'OTP sent to email');
      setView('otp');
    } catch (error) {
      message.error(error.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (values) => {
    try {
      setVerifyingOtp(true);
      const response = await fetch(`${API_BASE}/users/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: values.otp }),
      });
      const data = await responseJson(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      message.success(data.message || 'OTP verified successfully');
      setView('reset');
    } catch (error) {
      message.error(error.message || 'Failed to verify OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (values) => {
    try {
      setResettingPassword(true);
      const response = await fetch(`${API_BASE}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }),
      });
      const data = await responseJson(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      message.success(data.message || 'Password reset successfully');
      setView('login');
      setResetEmail('');
      loginForm.resetFields();
      emailForm.resetFields();
      otpForm.resetFields();
      resetForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const logoSrc = `${process.env.PUBLIC_URL}/logo.png`;

  const viewConfig = {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to your account to continue',
      form: (
        <Form
          name="login"
          form={loginForm}
          onFinish={handleLoginSubmit}
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

          <div style={{ textAlign: 'right', marginTop: -6, marginBottom: 16 }}>
            <Button
              type="link"
              onClick={() => setView('email')}
              style={{ color: '#2D3142', fontWeight: 600, fontSize: 13, padding: 0, height: 'auto' }}
            >
              Forgot password?
            </Button>
          </div>

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
      ),
    },
    email: {
      title: 'Forgot Password?',
      subtitle: 'Enter your email address to receive an OTP.',
      form: (
        <Form
          name="forgotPasswordEmail"
          form={emailForm}
          onFinish={handleSendEmail}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
            label="Email"
          >
            <Input placeholder="name@company.com" autoComplete="email" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              className="aid-signin-submit"
              htmlType="submit"
              type="primary"
              size="large"
              loading={sendingOtp}
              block
            >
              Send Email
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    otp: {
      title: 'Verify OTP',
      subtitle: 'Enter the 6-digit OTP sent to your email.',
      form: (
        <Form
          name="forgotPasswordOtp"
          form={otpForm}
          onFinish={handleVerifyOtp}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="otp"
            rules={[
              { required: true, message: 'Please enter OTP!' },
              { pattern: /^\d{6}$/, message: 'OTP must be 6 digits.' },
            ]}
            label="OTP"
          >
            <Input placeholder="Enter 6-digit OTP" maxLength={6} autoComplete="one-time-code" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              className="aid-signin-submit"
              htmlType="submit"
              type="primary"
              size="large"
              loading={verifyingOtp}
              block
            >
              Verify OTP
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    reset: {
      title: 'Set New Password',
      subtitle: 'Create a new password and confirm it.',
      form: (
        <Form
          name="forgotPasswordReset"
          form={resetForm}
          onFinish={handleResetPassword}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="newPassword"
            rules={[{ required: true, message: 'Please enter new password!' }]}
            label="New Password"
          >
            <Input.Password placeholder="Enter new password" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match.'));
                },
              }),
            ]}
            label="Confirm Password"
          >
            <Input.Password placeholder="Confirm new password" autoComplete="new-password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              className="aid-signin-submit"
              htmlType="submit"
              type="primary"
              size="large"
              loading={resettingPassword}
              block
            >
              Update Password
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  };

  const currentView = viewConfig[view];

  return (
    <AidLoginPage>
      <div className="aid-page-logo">
        <img src={logoSrc} alt="Aid+" />
      </div>

      <AidLoginCard>
        <AidLoginCardBody>
          <h2 className="aid-welcome-title">{currentView.title}</h2>
          <p className="aid-welcome-sub">{currentView.subtitle}</p>
          {currentView.form}

          {view !== 'login' && (
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <Button
                type="link"
                onClick={() => {
                  setView('login');
                  setResetEmail('');
                  emailForm.resetFields();
                  otpForm.resetFields();
                  resetForm.resetFields();
                }}
                style={{ color: '#2D3142', fontWeight: 600, fontSize: 13, padding: 0, height: 'auto' }}
              >
                Back to Sign in
              </Button>
            </div>
          )}
        </AidLoginCardBody>
      </AidLoginCard>
    </AidLoginPage>
  );
};

export default SignIn;
