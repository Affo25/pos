import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AuthWrapper } from './style';
import { loginUser } from '../../../../redux/authentication/authSlice';
import Heading from '../../../../components/heading/heading';

const SignIn = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const isLoading = useSelector((state) => state.auth.loading);
  const loginData = useSelector((state) => state.auth.login);
  const loginError = useSelector((state) => state.auth.error);

  useEffect(() => {
    if (loginData) {
      toast.success('Login successful! 🎉', {
        position: 'top-right',
        autoClose: 3000,
      });
      history.push('/');
    }
  }, [loginData]);

  useEffect(() => {
    if (loginError) {
      toast.error(loginError || 'Login failed ❌', {
        position: 'top-right',
        autoClose: 4000,
      });
    }
  }, [loginError]);

  const handleSubmit = (values) => {
    const { username, password } = values;
    dispatch(loginUser({ email: username, password }));
  };

  return (
    <AuthWrapper>
      <div className="auth-contents">
        <Form name="login" form={form} onFinish={handleSubmit} layout="vertical">
          <Heading as="h3">
            Sign in to <span className="color-secondary">Admin</span>
          </Heading>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your email!' }]}
            label="Email"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            label="Password"
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button
              className="btn-signin"
              htmlType="submit"
              type="primary"
              size="large"
              loading={isLoading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </AuthWrapper>
  );
};

export default SignIn;