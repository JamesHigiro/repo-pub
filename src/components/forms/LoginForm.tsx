import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Alert,
  Checkbox,
  Divider,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { LoginFormData } from '../../types';

const { Title, Text } = Typography;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, error }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const formData: LoginFormData = {
      email: values.email,
      password: values.password,
    };
      onSubmit(formData);
  };
  
  return (
  <div className='w-full flex justify-center items-center' >


        <Card 
        className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border-0"
        bodyStyle={{ padding: 0 }}
      >
        <Row className="min-h-[500px]">
          {/* Left Side - Welcome Back Section */}
          <Col 
            xs={0} 
            md={12} 
            className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex flex-col items-center justify-center p-10 relative overflow-hidden max-md:hidden"
          >
            <div className="text-center z-10">
              <div className="bg-white bg-opacity-20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <UserOutlined className="text-3xl text-white" />
              </div>
              
              <Title 
                level={1} 
                style={{ 
                  color: 'white',
                  fontWeight: 900,
                  marginBottom: '16px',
                  fontSize: '2.5rem',
                  letterSpacing: '-0.5px'
                }}
              >
                Welcome Back!
              </Title>
              <Text 
                className="text-white text-lg opacity-90 leading-relaxed block mb-8"
              >
                Sign in to continue your job search journey
              </Text>
              
              {/* Features List */}
              <div className="text-left mt-10">
                <div className="flex items-center mb-4">
                  <SafetyOutlined className="text-xl mr-3 text-yellow-400" />
                  <Text className="text-white opacity-90">Secure & Protected</Text>
                </div>
                <div className="flex items-center mb-4">
                  <UserOutlined className="text-xl mr-3 text-green-300" />
                  <Text className="text-white opacity-90">Personalized Experience</Text>
                </div>
                
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-5 right-5 w-25 h-25 rounded-full bg-white bg-opacity-10 opacity-50" />
            <div className="absolute bottom-5 left-5 w-15 h-15 rounded-full bg-white bg-opacity-10 opacity-30" />
          </Col>

          {/* Right Side - Form */}
          <Col xs={24} md={12}>
            <div className="p-10">
              <div className="text-center mb-8">
                <Title 
                  level={2}
                  className="text-indigo-900 font-black mb-2 text-3xl tracking-tight"
                >
                  Sign In
                </Title>
                <Text className="text-gray-500 text-base">
                  Access your account to continue
                </Text>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert 
                  message={error}
                  type="error" 
                  className="mb-6 rounded-lg"
                  showIcon
                />
              )}

              {/* Form */}
              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                requiredMark={false}
                autoComplete="off"
              >
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-indigo-500" />}
                    placeholder="Enter your email"
                    size="middle"
                    className="rounded-lg text-sm"
                    autoComplete="off"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Password is required' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-indigo-500" />}
                    placeholder="Enter your password"
                    size="middle"
                    className="rounded-lg text-sm"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    autoComplete="off"
                  />
                </Form.Item>

                

                <Form.Item className="mb-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={isLoading}
                    block
                    className="h-12 mt-4 rounded-lg font-bold text-lg bg-gradient-to-r from-indigo-500 to-blue-400 border-0 shadow-lg"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Form.Item>

                <Divider className="my-6 text-gray-500">
                  OR
                </Divider>

                <div className="text-center mt-4">
                  <Text className="text-gray-500 text-sm">
                    Don't have an account?{' '}
                    <Link 
                      to="/register"
                      className="text-indigo-500 font-semibold no-underline hover:text-indigo-600 transition-colors"
                    >
                      Create Account
                    </Link>
                  </Text>
                </div>

                
              </Form>
            </div>
          </Col>
        </Row>
        </Card>
        </div>
  );
};

export default LoginForm;