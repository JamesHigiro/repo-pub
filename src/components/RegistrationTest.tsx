import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Typography, Alert, Space, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/userAPI';

const { Title, Text } = Typography;
const { Option } = Select;

const RegistrationTest: React.FC = () => {
  const { register, isLoading, error, user, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const handleRegistration = async (values: any) => {
    try {
      await register(values);
      form.resetFields();
      // Fetch updated user list after registration
      fetchUsers();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const users = await userAPI.getAllUsers();
      setRegisteredUsers(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setFetchingUsers(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
        User Registration Test
      </Title>
      
      {/* Current Auth Status */}
      {isAuthenticated && user && (
        <Alert
          type="success"
          message="Registration Successful!"
          description={`Welcome ${user.firstName} ${user.lastName}! Your account has been created.`}
          style={{ marginBottom: '24px' }}
          showIcon
        />
      )}
      
      {/* Registration Form */}
      <Card title="Register New User" style={{ marginBottom: '24px' }}>
        {error && (
          <Alert 
            message={error}
            type="error" 
            style={{ marginBottom: '16px' }}
            showIcon
          />
        )}
        
        <Form
          form={form}
          onFinish={handleRegistration}
          layout="vertical"
          autoComplete="off"
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name' }]}
              style={{ flex: 1 }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter first name"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
              style={{ flex: 1 }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter last name"
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Enter phone number"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: 'Please select gender' }]}
          >
            <Select placeholder="Select gender" size="large">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role" size="large">
              <Option value="jobseeker">Job Seeker</Option>
              <Option value="employer">Employer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm password' },
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
              prefix={<LockOutlined />}
              placeholder="Confirm password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              loading={isLoading}
              block
            >
              Register User
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {/* Users List */}
      <Card 
        title="Registered Users" 
        extra={
          <Button onClick={fetchUsers} loading={fetchingUsers}>
            Refresh List
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">
            Click "Refresh List" to see all users registered in the MockAPI
          </Text>
          
          {registeredUsers.length > 0 ? (
            registeredUsers.map((user) => (
              <Card key={user.id} size="small" style={{ marginBottom: '8px' }}>
                <Space direction="vertical" size="small">
                  <div>
                    <Text strong>{user.firstName} {user.lastName}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Email: {user.email}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Phone: {user.phoneNumber}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Gender: {user.gender}</Text>
                  </div>
                  <div>
                    <Text type="secondary">ID: {user.id}</Text>
                  </div>
                </Space>
              </Card>
            ))
          ) : (
            <Text type="secondary">No users found. Register a user or click refresh to load existing users.</Text>
          )}
        </Space>
      </Card>
      
      <Divider />
      
      <Card title="API Integration Info">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>✅ <Text strong>Real MockAPI Integration</Text></div>
          <div>✅ <Text strong>User Registration with POST /users</Text></div>
          <div>✅ <Text strong>Form Validation</Text></div>
          <div>✅ <Text strong>Error Handling</Text></div>
          <div>✅ <Text strong>Loading States</Text></div>
          <div>✅ <Text strong>User List Fetching</Text></div>
          <div>
            <Text type="secondary">
              API Endpoint: https://68972036250b078c204109ef.mockapi.io/api/v1/users
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default RegistrationTest;
