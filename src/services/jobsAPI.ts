// Jobs API Service
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  closingDate: string;
  qualifications: string[];
  remote: boolean;
}

interface JobsResponse {
  success: boolean;
  jobs?: Job[];
  message?: string;
  total?: number;
}

interface JobFilters {
  search?: string;
  type?: string;
  location?: string;
  remote?: boolean;
}

interface PaginationParams {
  page: number;
  limit: number;
}

const API_BASE_URL = 'https://68972036250b078c204109ef.mockapi.io/api/v1';

export const jobsAPI = {
  // Get all jobs with optional filtering and pagination
  async getJobs(filters: JobFilters = {}, pagination: PaginationParams = { page: 1, limit: 10 }): Promise<JobsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let jobs: Job[] = await response.json();
      
      // Apply filters
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm) ||
          job.location.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.type) {
        jobs = jobs.filter(job => job.type.toLowerCase() === filters.type!.toLowerCase());
      }
      
      if (filters.location) {
        jobs = jobs.filter(job => 
          job.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      
      if (filters.remote !== undefined) {
        jobs = jobs.filter(job => job.remote === filters.remote);
      }
      
      // Apply pagination
      const total = jobs.length;
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedJobs = jobs.slice(startIndex, endIndex);
      
      return {
        success: true,
        jobs: paginatedJobs,
        total,
        message: 'Jobs fetched successfully'
      };
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return {
        success: false,
        message: 'Failed to fetch jobs. Please try again.'
      };
    }
  },

  // Get job by ID
  async getJobById(id: string): Promise<{ success: boolean; job?: Job; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const job: Job = await response.json();
      
      return {
        success: true,
        job,
        message: 'Job fetched successfully'
      };
      
    } catch (error) {
      console.error('Error fetching job:', error);
      return {
        success: false,
        message: 'Failed to fetch job details.'
      };
    }
  },

  // Create new job (for employers)
  async createJob(jobData: Omit<Job, 'id'>): Promise<{ success: boolean; job?: Job; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const job: Job = await response.json();
      
      return {
        success: true,
        job,
        message: 'Job created successfully!'
      };
    } catch (error) {
      console.error('Job creation error:', error);
      return {
        success: false,
        message: 'Job creation failed. Please try again.'
      };
    }
  }
};

// Export types for use in components
export type { JobFilters, PaginationParams };
