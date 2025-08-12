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
  Select,
  DatePicker,
  Divider,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CalendarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { RegisterFormData } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading?: boolean;
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading = false, error }) => {
  const [form] = Form.useForm();
  const [birthday, setBirthday] = useState<any>(null);

  const handleSubmit = (values: any) => {
    const formData: RegisterFormData = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      gender: values.gender,
      role: 'jobseeker' as const,
      password: values.password,
      confirmPassword: values.confirmPassword,
    };
    onSubmit(formData);
  };

  return (
    <div className='w-full flex justify-center items-center' >
      <Card
        className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border-0"
        bodyStyle={{ padding: 0 }}
      >
        <Row className="min-h-[600px]">
          {/* Left Side - Welcome Section */}
          <Col 
            xs={0} 
            md={12} 
            className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex flex-col items-center justify-center p-10 relative overflow-hidden max-md:hidden max-md:hidden"
          >
            <div className="text-center z-10">
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
                Welcome Aboard
              </Title>
              <Text 
                className="text-white text-lg opacity-90 leading-relaxed block mb-8"
              >
                Join our vibrant community and explore new opportunities
              </Text>
              <img
                src="/images/signup-illustration.svg"
                alt="Sign up illustration"
                className="w-4/5 max-w-80 drop-shadow-lg"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-radial from-white from-opacity-20 to-transparent opacity-30" />
          </Col>

          {/* Right Side - Form */}
          <Col xs={24} md={12}>
            <div className="p-10">
              <div className="text-center mb-8">
                <Title 
                  level={2}
                  className="text-indigo-900 font-black mb-2 text-3xl tracking-tight"
                >
                  Create Your Account
                </Title>
                <Text className="text-gray-500 text-base">
                  Get started with your journey today
                </Text>
              </div>

              {error && (
                <Alert 
                  message={error}
                  type="error" 
                  className="mb-6 rounded-lg"
                  showIcon
                />
              )}

              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                requiredMark={false}
                autoComplete="off"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="firstName"
                      label="First Name"
                      rules={[{ required: true, message: 'First name is required' }]}
                    >
                      <Input
                        prefix={<UserOutlined className="text-indigo-500" />}
                        placeholder="James"
                        size="middle"
                        className="rounded-lg text-sm"
                        autoComplete="off"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="lastName"
                      label="Last Name"
                      rules={[{ required: true, message: 'Last name is required' }]}
                    >
                      <Input
                        prefix={<UserOutlined className="text-indigo-500" />}
                        placeholder="Higiro"
                        size="middle"
                        className="rounded-lg text-sm"
                        autoComplete="off"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="birthday"
                      label="Birthday"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value) {
                              return Promise.resolve();
                            }
                            const selectedDate = new Date(value);
                            const today = new Date();
                            today.setHours(23, 59, 59, 999); // Set to end of today
                            
                            if (selectedDate > today) {
                              return Promise.reject(new Error('Birthday cannot be in the future'));
                            }
                            
                            
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <DatePicker
                        placeholder="Select birthday"
                        size="middle"
                        className="w-full rounded-lg text-sm"
                        suffixIcon={<CalendarOutlined className="text-indigo-500" />}
                        value={birthday}
                        onChange={setBirthday}
                        autoComplete="off"
                        disabledDate={(current) => {
                          // Disable future dates and dates less than 13 years ago
                          if (!current) return false;
                          
                          const today = new Date();
                          const minAge = new Date();
                          minAge.setFullYear(minAge.getFullYear());
                          
                          return current.isAfter(today, 'day') || current.isAfter(minAge, 'day');
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="gender"
                      label="Gender"
                      rules={[{ required: true, message: 'Gender is required' }]}
                    >
                      <Select
                        placeholder="Select Gender"
                        size="middle"
                        className="rounded-lg text-sm"
                        suffixIcon={<TeamOutlined className="text-indigo-500" />}
      
                      >
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>

                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

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
                    placeholder="your.email@example.com"
                    size="middle"
                    className="rounded-lg text-sm"
                    autoComplete="off"
                  />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[
                    { required: true, message: 'Phone number is required' },
                    { pattern: /^\+?\d{10,15}$/, message: 'Please enter a valid phone number' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-indigo-500" />}
                    placeholder="+250 123 456 789"
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
                    { min: 8, message: 'Password must be at least 8 characters' },
                    { 
                      pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
                    }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-indigo-500" />}
                    placeholder="Create a strong password"
                    size="middle"
                    className="rounded-lg text-sm"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-indigo-500" />}
                    placeholder="Re-enter your password"
                    size="middle"
                    className="rounded-lg text-sm"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    autoComplete="new-password"
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Form.Item>

                <Divider className="my-6 text-gray-500">
                  OR
                </Divider>

                <div className="text-center mt-4">
                  <Text className="text-gray-500">
                    Already have an account?{' '}
                    <Link 
                      to="/login"
                      className="text-indigo-500 font-semibold no-underline hover:text-indigo-600 transition-colors"
                    >
                      Sign in
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

export default RegisterForm;