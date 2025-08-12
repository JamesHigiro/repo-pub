import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { jobsAPI } from '../../services/jobsAPI';
import type { Job, JobFilters, PaginationParams } from '../../services/jobsAPI';

// Job state interface
interface JobsState {
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

// Async thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async ({ filters, pagination }: { filters?: JobFilters; pagination?: PaginationParams }, { rejectWithValue }) => {
    try {
      const response = await jobsAPI.getJobs(filters, pagination);
      if (response.success && response.jobs) {
        return {
          jobs: response.jobs,
          total: response.total || 0,
        };
      } else {
        return rejectWithValue(response.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch jobs. Please try again.');
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await jobsAPI.getJobById(jobId);
      if (response.success && response.job) {
        return response.job;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch job details');
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch job details. Please try again.');
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData: Omit<Job, 'id'>, { rejectWithValue }) => {
    try {
      const response = await jobsAPI.createJob(jobData);
      if (response.success && response.job) {
        return response.job;
      } else {
        return rejectWithValue(response.message || 'Failed to create job');
      }
    } catch (error) {
      return rejectWithValue('Failed to create job. Please try again.');
    }
  }
);

// Initial state
const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

// Jobs slice
const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<JobFilters>) => {
      state.filters = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch jobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload.jobs;
        state.pagination.totalItems = action.payload.total;
        state.pagination.totalPages = Math.ceil(action.payload.total / state.pagination.itemsPerPage);
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch job by ID
    builder
      .addCase(fetchJobById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJob = action.payload;
        state.error = null;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create job
    builder
      .addCase(createJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add the new job to the beginning of the jobs array
        state.jobs.unshift(action.payload);
        state.error = null;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  setCurrentPage, 
  clearCurrentJob, 
  setLoading 
} = jobsSlice.actions;

export default jobsSlice.reducer;
