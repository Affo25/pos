import React, { useState } from 'react';
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import { Form, Input, Button } from 'antd';
import {
  AidLoginPage,
  AidLoginCard,
  AidLoginCardBody,
} from './style';

function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [emailForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const handleEmailSubmit = () => {
    setStep(2);
  };

  const handleOtpSubmit = () => {
    setStep(3);
  };

  const handlePasswordSubmit = () => {
    setStep(1);
    emailForm.resetFields();
    otpForm.resetFields();
    passwordForm.resetFields();
  };

  const logoSrc = `${process.env.PUBLIC_URL}/aid-plus-logo.png`;

  const stepContent = {
    1: {
      title: 'Forgot Password?',
      subtitle: "Enter your email and we'll send you an OTP to reset your password.",
      buttonText: 'Send OTP',
      form: (
        <Form
          name="forgotPassEmail"
          form={emailForm}
          onFinish={handleEmailSubmit}
          layout="vertical"
          requiredMark={false}
        >
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
              Send OTP
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    2: {
      title: 'Enter OTP',
      subtitle: 'We sent a verification code to your email. Enter it below to continue.',
      buttonText: 'Verify OTP',
      form: (
        <Form
          name="forgotPassOtp"
          form={otpForm}
          onFinish={handleOtpSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            label="One-Time Password"
            name="otp"
            rules={[
              { required: true, message: 'Please enter the OTP sent to your email.' },
              { min: 4, message: 'OTP should be at least 4 digits.' },
            ]}
          >
            <Input placeholder="Enter OTP" autoComplete="one-time-code" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              className="aid-signin-submit"
              htmlType="submit"
              type="primary"
              size="large"
              block
            >
              Verify OTP
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    3: {
      title: 'Create New Password',
      subtitle: 'Set a new password for your account.',
      buttonText: 'Reset Password',
      form: (
        <Form
          name="forgotPassReset"
          form={passwordForm}
          onFinish={handlePasswordSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            label="New Password"
            name="password"
            rules={[{ required: true, message: 'Please enter a new password.' }]}
          >
            <Input.Password placeholder="Enter new password" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your new password.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match.'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" autoComplete="new-password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              className="aid-signin-submit"
              htmlType="submit"
              type="primary"
              size="large"
              block
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  };

  const currentStep = stepContent[step];

  return (
    <AidLoginPage>
      <div className="aid-page-logo">
        <img src={logoSrc} alt="Aid+" />
      </div>

      <AidLoginCard>
        <AidLoginCardBody>
          <h2 className="aid-welcome-title">{currentStep.title}</h2>
          <p className="aid-welcome-sub">{currentStep.subtitle}</p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: step >= index ? '#2D3142' : '#E5E7EB',
                }}
              />
            ))}
          </div>

          {currentStep.form}

          <p style={{ textAlign: 'center', margin: 0, fontSize: 14, color: '#9CA3AF' }}>
            Return to{' '}
            <NavLink to="/" style={{ color: '#2D3142', fontWeight: 600 }}>
              Sign In
            </NavLink>
          </p>
        </AidLoginCardBody>
      </AidLoginCard>
    </AidLoginPage>
  );
}

export default ForgotPassword;
