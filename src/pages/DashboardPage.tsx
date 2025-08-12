import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Row, Col, Statistic, Button, Tabs } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SearchOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { fetchUserApplications } from '../store/slices/applicationsSlice';
import type { AuthState, ApplicationsState } from '../store/types';
import JobList from '../components/JobList';
import MyApplications from '../components/MyApplications';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth) as AuthState;
  const { applications } = useAppSelector((state) => state.applications) as ApplicationsState;
  const [activeTab, setActiveTab] = useState('dashboard');

  // Calculate user statistics from Redux state
  const userStats = {
    applications: applications.length,
    interviews: applications.filter((app: any) => app.status === 'interview').length,
    hired: applications.filter((app: any) => app.status === 'hired').length
  };

  // Get user role safely
  const userRole = (user as any)?.role || 'jobseeker';

  // Handle logout
  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  // Fetch user applications on component mount
  useEffect(() => {
    if (user) {
      dispatch(fetchUserApplications(user.id));
    }
  }, [dispatch, user]);

  // Function to refresh applications
  const handleApplicationUpdate = () => {
    if (user) {
      dispatch(fetchUserApplications(user.id));
    }
  };

  if (!user) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Loading...</Title>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className='min-h-screen max-md:p'>
      {/* Header */}
      <Header className="bg-white shadow-md px-12 py-10 sticky top-0 z-50">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center">
            <div className="w-11 h-11 bg-green-400 rounded-lg flex items-center justify-center mr-3">
              <DashboardOutlined className="text-white text-lg" />
            </div>
            <h3 className='text-2xl max-md:text-xl max-sm:text-lg font-bold' >
              Job Board
            </h3>
            
          </div>



          <div className="relative group items-center">

            <div className="bg-green-300 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer">
              <p className="text-lg font-bold">{user.firstName.charAt(0)[0]}{user.lastName.charAt(0)[0]}</p>
            </div>


            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <Button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-0 focus:outline-none focus:ring-0">
                <div className="flex items-center">
                  <div className="bg-green-300 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    <UserOutlined/>
                  </div>
                  {user.firstName} {user.lastName}
                </div>
              </Button>
              <Button onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-0 focus:outline-none focus:ring-0">
                <div className="flex items-center">
                  <div className="bg-green-300 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    <LogoutOutlined/>
                  </div>
                  Logout
                </div>
              </Button>
            </div>
          </div>




        </div>
      </Header>

      {/* Main Content */}
      <Content className="p-6 max-md:p-0">
        <div className="max-w-6xl mx-auto max-md:w-full">
          <Title level={2} className="mb-6 mt-3 max-md:text-lg max-sm:text-sm">
            Welcome back, {user.firstName}! 👋
          </Title>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            className="bg-white rounded-lg p-4"
          >
            <TabPane
              tab={
                <span>
                  <DashboardOutlined />
                  Dashboard
                </span>
              }
              key="dashboard"
            >
              {/* Quick Actions */}
              <Row gutter={[16, 16]} className="mb-6">
                {userRole === 'jobseeker' ? (
                  <>
                    <Col xs={24} sm={12} md={8}>
                      <Card hoverable>
                        <div className="text-center">
                          <SearchOutlined className="text-3xl text-blue-500 mb-3" />
                          <Title level={4} className="max-md:text-base max-sm:text-sm">Find Your Next Job</Title>
                          <Text type="secondary" className="max-md:text-xs max-sm:text-xs">Browse thousands of opportunities</Text>
                          <div className="mt-4">
                            <Button
                              type="primary"
                              onClick={() => setActiveTab('jobs')}
                              block
                            >
                              Browse Jobs
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Card hoverable>
                        <div className="text-center">
                          <FileTextOutlined className="text-3xl text-green-500 mb-3" />
                          <Title level={4} className="max-md:text-base max-sm:text-sm">Your Applications</Title>
                          <Text type="secondary" className="max-md:text-xs max-sm:text-xs">Track your job applications</Text>
                          <div className="mt-4">
                            <Button
                              block
                              onClick={() => setActiveTab('applications')}
                            >
                              View Applications ({userStats.applications})
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Col>


                  </>
                ) : (
                  <>
                    <Col xs={24} sm={12} md={8}>
                      <Card hoverable>
                        <div style={{ textAlign: 'center' }}>
                          <FileTextOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                          <Title level={4} className="max-md:text-base max-sm:text-sm">Post a Job</Title>
                          <Text type="secondary" className="max-md:text-xs max-sm:text-xs">Create new job posting</Text>
                          <div style={{ marginTop: '16px' }}>
                            <Button type="primary" block>Post Job</Button>
                          </div>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Card hoverable>
                        <div style={{ textAlign: 'center' }}>
                          <CalendarOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
                          <Title level={4} className="max-md:text-base max-sm:text-sm">Manage Applications</Title>
                          <Text type="secondary" className="max-md:text-xs max-sm:text-xs">Review applications</Text>
                          <div style={{ marginTop: '16px' }}>
                            <Button block>View Applications</Button>
                          </div>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Card hoverable>
                        <div style={{ textAlign: 'center' }}>
                          <TrophyOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '12px' }} />
                          <Title level={4} className="max-md:text-base max-sm:text-sm">Company Profile</Title>
                          <Text type="secondary" className="max-md:text-xs max-sm:text-xs">Update company info</Text>
                          <div style={{ marginTop: '16px' }}>
                            <Button block>Edit Company</Button>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </>
                )}
              </Row>

              {/* Statistics */}
              <Card title={<span className="max-md:text-base max-sm:text-sm">Quick Stats</span>} className="mt-6">
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title={userRole === 'jobseeker' ? 'Applications' : 'Active Jobs'}
                      value={userRole === 'jobseeker' ? userStats.applications : 0}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>

                  <Col xs={12} sm={8}>
                    <Statistic
                      title={userRole === 'jobseeker' ? 'Interviews' : 'Shortlisted'}
                      value={userRole === 'jobseeker' ? userStats.interviews : 0}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title={userRole === 'jobseeker' ? 'Hired' : 'Hired'}
                      value={userRole === 'jobseeker' ? userStats.hired : 0}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                </Row>
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <SearchOutlined />
                  Browse Jobs
                </span>
              }
              key="jobs"
            >
              <JobList onApplicationUpdate={handleApplicationUpdate} />
            </TabPane>

            {userRole === 'jobseeker' && (
              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    My Applications
                  </span>
                }
                key="applications"
              >
                <MyApplications onApplicationUpdate={handleApplicationUpdate} />
              </TabPane>
            )}
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default DashboardPage;
