import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Typography, Button, Empty, Spin, Tooltip, message } from 'antd';
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import { jobsAPI } from '../services/jobsAPI';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserApplications } from '../store/slices/applicationsSlice';
import type { AuthState, ApplicationsState, JobApplication } from '../store/types';
import JobDetailsModal from './JobDetailsModal';

const { Title, Text } = Typography;

interface ApplicationWithDetails {
  jobId: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedAt: string;
  notes?: string;
  jobDetails?: any;
}

interface MyApplicationsProps {
  onApplicationUpdate?: () => void;
}

const MyApplications: React.FC<MyApplicationsProps> = ({ onApplicationUpdate }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth) as AuthState;
  const { applications, isLoading: loading } = useAppSelector((state) => state.applications) as ApplicationsState;
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch user applications
  const fetchApplications = async () => {
    if (!user) return;

    try {
      await dispatch(fetchUserApplications(user.id));
      
      // Notify parent component to refresh stats
      if (onApplicationUpdate) {
        onApplicationUpdate();
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [dispatch, user]);

  // Handle view job details
  const handleViewJob = async (jobId: string) => {
    try {
      console.log('Fetching job details for jobId:', jobId);
      
      // Get the application data first
      const application = applications.find((app: JobApplication) => app.jobId === jobId);
      if (!application) {
        message.error('Application not found');
        return;
      }

      // Try to fetch complete job details from API
      const response = await jobsAPI.getJobById(jobId);
      console.log('Job details response:', response);
      
      if (response.success && response.job) {
        // Use the complete job data from API
        setSelectedJob(response.job);
        setModalVisible(true);
      } else {
        // If API fails, create job object using application data + job ID
        const enhancedJob = {
          id: jobId,
          title: application.jobTitle,
          company: application.company,
          location: 'Location data not available', // Could be enhanced later
          type: 'Position Type not available', // Could be enhanced later
          closingDate: application.appliedAt, // Use application date as fallback
          qualifications: [
            `Applied on ${new Date(application.appliedAt).toLocaleDateString()}`,
            `Current Status: ${application.status}`,
            application.notes || 'Application submitted via job board'
          ],
          remote: false
        };
        setSelectedJob(enhancedJob);
        setModalVisible(true);
        message.warning('Showing enhanced application details (some job data unavailable)');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      
      // Fallback: create job object from application data
      const application = applications.find((app: JobApplication) => app.jobId === jobId);
      if (application) {
        const enhancedJob = {
          id: jobId,
          title: application.jobTitle,
          company: application.company,
          location: 'Location data not available',
          type: 'Position Type not available',
          closingDate: application.appliedAt,
          qualifications: [
            `Applied on ${new Date(application.appliedAt).toLocaleDateString()}`,
            `Current Status: ${application.status}`,
            application.notes || 'Application submitted via job board'
          ],
          remote: false
        };
        setSelectedJob(enhancedJob);
        setModalVisible(true);
        message.warning('Showing enhanced application details (job data unavailable)');
      } else {
        message.error('An error occurred while loading job details.');
      }
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJob(null);
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      applied: { 
        icon: <ClockCircleOutlined />, 
        color: 'blue', 
        text: 'Applied' 
      },
      'under-review': { 
        icon: <EyeOutlined />, 
        color: 'orange', 
        text: 'Under Review' 
      },
      interview: { 
        icon: <UsergroupAddOutlined />, 
        color: 'purple', 
        text: 'Interview' 
      },
      hired: { 
        icon: <TrophyOutlined />, 
        color: 'green', 
        text: 'Hired' 
      },
      rejected: { 
        icon: <CloseCircleOutlined />, 
        color: 'red', 
        text: 'Rejected' 
      }
    };

    const config = (statusConfig as any)[status] || statusConfig.applied;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Job Title',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      width: '30%',
      render: (title: string, record: any) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ fontSize: '16px' }}>{title}</Text>
          <Text type="secondary">{record.company}</Text>
        </Space>
      ),
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      width: '10%',
      render: (date: string, record: any) => (
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text>{formatDate(date)}</Text>
        </Space>
      ),
      sorter: (a: any, b: any) => 
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status: string) => getStatusDisplay(status),
      filters: [
        { text: 'Applied', value: 'applied' },
        { text: 'Under Review', value: 'under-review' },
        { text: 'Interview', value: 'interview' },
        { text: 'Hired', value: 'hired' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '5%',
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => handleViewJob(record.jobId)}
        >
          View Job
        </Button>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    total: applications.length,
    applied: applications.filter((app: JobApplication) => app.status === 'applied').length,
    underReview: applications.filter((app: JobApplication) => app.status === 'under-review').length,
    interviews: applications.filter((app: JobApplication) => app.status === 'interview').length,
    hired: applications.filter((app: JobApplication) => app.status === 'hired').length,
    rejected: applications.filter((app: JobApplication) => app.status === 'rejected').length,
  };

  if (!user) {
    return (
      <Card>
        <Empty description="Please log in to view your applications" />
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className='mb-8'>
        <Title level={3} style={{ marginBottom: '8px' }} className="max-md:text-lg max-sm:text-base">
          My Applications
        </Title>
        <Text type="secondary" className="max-md:text-xs max-sm:text-xs">
          Track your job applications and their current status
        </Text>
      </div>

      {/* Statistics Cards */}
      <div className='mb-8'>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {stats.total}
            </div>
            <div className="text-gray-600 text-sm">Total Applications</div>
          </Card>
          
          <Card size="small" className="text-center">
            <div className="text-xl font-bold text-green-500">
              {stats.interviews}
            </div>
            <div className="text-gray-600 text-sm">Interviews</div>
          </Card>
          
          <Card size="small" className="text-center">
            <div className="text-xl font-bold text-purple-500">
              {stats.hired}
            </div>
            <div className="text-gray-600 text-sm">Hired</div>
          </Card>
        </div>
      </div>

      {/* Applications Table */}
      <Card>
        <Spin spinning={loading}>
          {applications.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                dataSource={applications}
                rowKey="jobId"
                scroll={{ x: 500 }}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} applications`,
                  responsive: true
                }}
              />
            </div>
          ) : (
            <Empty
              description="No applications yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Text type="secondary">
                Start applying to jobs to see your applications here!
              </Text>
            </Empty>
          )}
        </Spin>
      </Card>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        visible={modalVisible}
        onClose={closeModal}
        onApplicationUpdate={fetchApplications}
        isAlreadyApplied={true}
      />
    </div>
  );
};

export default MyApplications;
