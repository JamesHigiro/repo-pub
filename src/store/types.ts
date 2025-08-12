// Redux State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  filters: JobFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ApplicationsState {
  applications: JobApplication[];
  isLoading: boolean;
  error: string | null;
  appliedJobIds: Set<string>;
}

// User type from API
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  password: string;
  DoB?: string;
  applications?: JobApplication[];
}

// Job type from API
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

// Job Application type
export interface JobApplication {
  jobId: string;
  status: 'applied' | 'under-review' | 'interview' | 'rejected' | 'hired';
  appliedAt: string;
  jobTitle: string;
  company: string;
  notes?: string;
}

// Job Filters type
export interface JobFilters {
  search?: string;
  type?: string;
  location?: string;
  remote?: boolean;
}

// Pagination type
export interface PaginationParams {
  page: number;
  limit: number;
}

// Root State type
export interface RootState {
  auth: AuthState;
  jobs: JobsState;
  applications: ApplicationsState;
}
