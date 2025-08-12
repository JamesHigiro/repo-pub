import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space, Divider, Row, Col } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/userAPI';

const { Title, Text } = Typography;

interface TestUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const LoginTest: React.FC = () => {
  const { login, logout, isLoading, error, user, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [registeredUsers, setRegisteredUsers] = useState<TestUser[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState<{email: string, success: boolean, message: string} | null>(null);

  const handleLogin = async (values: any) => {
    setLoginAttempt(null);
    try {
      await login(values);
      setLoginAttempt({
        email: values.email,
        success: true,
        message: 'Login successful!'
      });
      form.resetFields();
    } catch (error) {
      setLoginAttempt({
        email: values.email,
        success: false,
        message: 'Login failed'
      });
    }
  };

  const handleLogout = () => {
    logout();
    setLoginAttempt(null);
  };

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const users = await userAPI.getAllUsers();
      setRegisteredUsers(users.map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        password: u.password
      })));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setFetchingUsers(false);
    }
  };

  const quickLogin = (email: string, password: string) => {
    form.setFieldsValue({ email, password });
    handleLogin({ email, password });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
        Login Test & Verification
      </Title>
      
      <Row gutter={[24, 24]}>
        {/* Login Form Section */}
        <Col xs={24} lg={12}>
          {/* Authentication Status */}
          {isAuthenticated && user ? (
            <Card style={{ marginBottom: '24px', borderColor: '#52c41a' }}>
              <Alert
                type="success"
                message="Successfully Logged In!"
                description={
                  <Space direction="vertical" size="small">
                    <div><Text strong>Name:</Text> {user.firstName} {user.lastName}</div>
                    <div><Text strong>Email:</Text> {user.email}</div>
                    <div><Text strong>ID:</Text> {user.id}</div>
                    <div><Text strong>Role:</Text> {user.role}</div>
                  </Space>
                }
                showIcon
                action={
                  <Button 
                    onClick={handleLogout} 
                    icon={<LogoutOutlined />}
                    danger
                  >
                    Logout
                  </Button>
                }
              />
            </Card>
          ) : (
            <Card title="Login Form" style={{ marginBottom: '24px' }}>
              {error && (
                <Alert 
                  message={error}
                  type="error" 
                  style={{ marginBottom: '16px' }}
                  showIcon
                />
              )}
              
              {loginAttempt && (
                <Alert
                  type={loginAttempt.success ? 'success' : 'error'}
                  message={loginAttempt.message}
                  description={`Email: ${loginAttempt.email}`}
                  style={{ marginBottom: '16px' }}
                  showIcon
                />
              )}
              
              <Form
                form={form}
                onFinish={handleLogin}
                layout="vertical"
                autoComplete="off"
              >
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
                    placeholder="Enter your email"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Please enter password' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter your password"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    loading={isLoading}
                    icon={<LoginOutlined />}
                    block
                  >
                    Login
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )}
        </Col>

        {/* Users List & Quick Login Section */}
        <Col xs={24} lg={12}>
          <Card 
            title="Registered Users" 
            extra={
              <Button onClick={fetchUsers} loading={fetchingUsers}>
                Refresh Users
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Text type="secondary">
                Click "Refresh Users" to see all registered users, then use "Quick Login" to test login with their credentials.
              </Text>
              
              {registeredUsers.length > 0 ? (
                registeredUsers.map((testUser, index) => (
                  <Card key={testUser.id} size="small" style={{ backgroundColor: '#f9f9f9' }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        <Text strong>{testUser.firstName} {testUser.lastName}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Email: {testUser.email}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Password: {testUser.password}</Text>
                      </div>
                      <div>
                        <Text type="secondary">ID: {testUser.id}</Text>
                      </div>
                      {!isAuthenticated && (
                        <Button 
                          type="link" 
                          size="small"
                          onClick={() => quickLogin(testUser.email, testUser.password)}
                          loading={isLoading}
                          icon={<LoginOutlined />}
                        >
                          Quick Login as {testUser.firstName}
                        </Button>
                      )}
                    </Space>
                  </Card>
                ))
              ) : (
                <Text type="secondary">
                  No users found. Go to the Registration Test page to create some users first, or click refresh to load existing users.
                </Text>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      {/* Implementation Details */}
      <Card title="Login Implementation Details">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>✅ Features Working:</Title>
              <div>🔐 <Text strong>Real API Authentication</Text></div>
              <div>📧 <Text strong>Email-based user lookup</Text></div>
              <div>🔑 <Text strong>Password verification</Text></div>
              <div>⚡ <Text strong>Loading states</Text></div>
              <div>❌ <Text strong>Error handling</Text></div>
              <div>💾 <Text strong>Session persistence</Text></div>
              <div>🚪 <Text strong>Logout functionality</Text></div>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>🔄 Authentication Flow:</Title>
              <div><Text code>1.</Text> User enters email/password</div>
              <div><Text code>2.</Text> API fetches all users via GET /users</div>
              <div><Text code>3.</Text> Find user with matching email</div>
              <div><Text code>4.</Text> Compare passwords client-side</div>
              <div><Text code>5.</Text> Create session & store user data</div>
              <div><Text code>6.</Text> Update authentication state</div>
            </Space>
          </Col>
        </Row>
        
        <Divider />
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={4}>🌐 API Endpoint:</Title>
          <Text code>GET https://68972036250b078c204109ef.mockapi.io/api/v1/users</Text>
          
          <Title level={4}>🧪 Test Instructions:</Title>
          <ol>
            <li>Click "Refresh Users" to load existing registered users</li>
            <li>Use "Quick Login" buttons to test with existing users</li>
            <li>Or manually enter email/password in the login form</li>
            <li>Test error cases with wrong email/password</li>
            <li>Verify logout functionality</li>
          </ol>
        </Space>
      </Card>
    </div>
  );
};

export default LoginTest;
