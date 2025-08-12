import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Space, 
  Tag, 
  Pagination, 
  Row, 
  Col, 
  Typography,
  Switch,
  Empty,
  Spin,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined, 
  EyeOutlined,
  HomeOutlined,
  FilterOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchJobs, setFilters, clearFilters, setCurrentPage } from '../store/slices/jobsSlice';
import { fetchUserApplications } from '../store/slices/applicationsSlice';
import type { AuthState, JobsState, ApplicationsState } from '../store/types';
import JobDetailsModal from './JobDetailsModal';

const { Title, Text } = Typography;
const { Option } = Select;

interface JobListProps {
  onApplicationUpdate?: () => void;
}

const JobList: React.FC<JobListProps> = ({ onApplicationUpdate }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth) as AuthState;
  const jobsState = useAppSelector((state) => state.jobs) as JobsState;
  const applicationsState = useAppSelector((state) => state.applications) as ApplicationsState;
  
  // Modal state
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch jobs and applications on component mount
  useEffect(() => {
    dispatch(fetchJobs({
      filters: jobsState.filters,
      pagination: { page: jobsState.pagination.currentPage, limit: jobsState.pagination.itemsPerPage }
    }));
  }, [dispatch, jobsState.filters, jobsState.pagination.currentPage, jobsState.pagination.itemsPerPage]);

  // Fetch user applications when user changes
  useEffect(() => {
    if (user) {
      dispatch(fetchUserApplications(user.id));
    }
  }, [dispatch, user]);

  // Refresh function for when applications are updated
  const handleApplicationUpdate = () => {
    if (user) {
      dispatch(fetchUserApplications(user.id));
    }
    // Notify parent component to refresh stats
    if (onApplicationUpdate) {
      onApplicationUpdate();
    }
  };

  // Filter handlers
  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ ...jobsState.filters, search: value || undefined }));
    dispatch(setCurrentPage(1)); // Reset to first page
  };

  const handleTypeChange = (value: string) => {
    dispatch(setFilters({ ...jobsState.filters, type: value || undefined }));
    dispatch(setCurrentPage(1));
  };

  const handleLocationChange = (value: string) => {
    dispatch(setFilters({ ...jobsState.filters, location: value || undefined }));
    dispatch(setCurrentPage(1));
  };

  const handleRemoteChange = (checked: boolean) => {
    dispatch(setFilters({ ...jobsState.filters, remote: checked ? true : undefined }));
    dispatch(setCurrentPage(1));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Pagination handler
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setCurrentPage(page));
  };

  // Modal handlers
  const showJobDetails = (job: any) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJob(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get job type color
  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time': return 'blue';
      case 'part-time': return 'green';
      case 'contract': return 'orange';
      case 'internship': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ marginBottom: '8px' }} className="max-md:text-lg max-sm:text-base">
          Available Jobs
        </Title>
        <Text type="secondary" className="max-md:text-xs max-sm:text-xs">
          Find your next career opportunity
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search jobs, companies..."
              prefix={<SearchOutlined />}
              value={jobsState.filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Job Type"
              value={jobsState.filters.type}
              onChange={handleTypeChange}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="Full-time">Full-time</Option>
              <Option value="Part-time">Part-time</Option>
              <Option value="Contract">Contract</Option>
              <Option value="Internship">Internship</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Input
              placeholder="Location"
              prefix={<EnvironmentOutlined />}
              value={jobsState.filters.location || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Text>Remote:</Text>
              <Switch
                checked={jobsState.filters.remote || false}
                onChange={handleRemoteChange}
                checkedChildren={<HomeOutlined />}
                unCheckedChildren={<HomeOutlined />}
              />
            </Space>
          </Col>
          
          <Col xs={24} sm={24} md={6}>
            <Space>
              <Button 
                icon={<FilterOutlined />}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
              <Text type="secondary">
                {jobsState.pagination.totalItems} job{jobsState.pagination.totalItems !== 1 ? 's' : ''} found
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Error Alert */}
      {jobsState.error && (
        <Alert
          message="Error"
          description={jobsState.error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Loading Spinner */}
      <Spin spinning={jobsState.isLoading}>
        {/* Job Cards */}
        {jobsState.jobs.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {jobsState.jobs.map((job: any) => (
                <Col xs={24} sm={12} lg={8} key={job.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      <Button 
                        type="link" 
                        icon={<EyeOutlined />}
                        onClick={() => showJobDetails(job)}
                      >
                        View Details
                      </Button>
                    ]}
                    extra={
                      <div style={{ minHeight: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        {applicationsState.appliedJobIds.has(job.id) && (
                          <Tag color="green" icon={<CheckCircleOutlined />}>
                            Applied
                          </Tag>
                        )}
                      </div>
                    }
                  >
                    <div style={{ height: '220px', display: 'flex', flexDirection: 'column' }}>
                      {/* Job Header */}
                      <div style={{ marginBottom: '12px' }}>
                        <Title level={5} style={{ marginBottom: '4px' }} className="max-md:text-sm max-sm:text-xs">
                          {job.title}
                        </Title>
                        <Text strong style={{ color: '#1890ff' }}>
                          {job.company}
                        </Text>
                      </div>

                      {/* Job Meta */}
                      <Space direction="vertical" size="small" style={{ flex: 1 }}>
                        <div>
                          <EnvironmentOutlined style={{ color: '#52c41a', marginRight: '6px' }} />
                          <Text type="secondary">{job.location}</Text>
                          {job.remote && (
                            <Tag color="cyan" style={{ marginLeft: '8px', fontSize: '12px' }}>
                              Remote
                            </Tag>
                          )}
                        </div>
                        
                        <div>
                          <CalendarOutlined style={{ color: '#fa8c16', marginRight: '6px' }} />
                          <Text type="secondary">Closes: {formatDate(job.closingDate)}</Text>
                        </div>
                        
                        <div style={{ marginTop: 'auto' }}>
                          <Tag color={getJobTypeColor(job.type)}>
                            {job.type}
                          </Tag>
                        </div>
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Pagination
                current={jobsState.pagination.currentPage}
                pageSize={jobsState.pagination.itemsPerPage}
                total={jobsState.pagination.totalItems}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} jobs`
                }
                pageSizeOptions={['10']}
              />
            </div>
          </>
        ) : (
          !jobsState.isLoading && (
            <Empty
              description="No jobs found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: '48px 0' }}
            >
              <Button type="primary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Empty>
          )
        )}
      </Spin>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        visible={modalVisible}
        onClose={closeModal}
        onApplicationUpdate={handleApplicationUpdate}
      />
    </div>
  );
};

export default JobList;
