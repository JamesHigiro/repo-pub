import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { userAPI } from '../../services/userAPI';
import type { JobApplication } from '../../services/userAPI';

// Application state interface
interface ApplicationsState {
  applications: JobApplication[];
  isLoading: boolean;
  error: string | null;
  appliedJobIds: Set<string>; // Track which jobs the user has applied to
}

// Async thunks
export const applyToJob = createAsyncThunk(
  'applications/applyToJob',
  async ({ 
    userId, 
    jobId, 
    jobTitle, 
    company 
  }: { 
    userId: string; 
    jobId: string; 
    jobTitle: string; 
    company: string; 
  }, { rejectWithValue }) => {
    try {
      const response = await userAPI.applyToJob(userId, jobId, jobTitle, company);
      
      if (response.success) {
        return { jobId, jobTitle, company };
      } else {
        return rejectWithValue(response.message || 'Failed to apply to job');
      }
    } catch (error) {
      return rejectWithValue('Failed to apply to job. Please try again.');
    }
  }
);

export const fetchUserApplications = createAsyncThunk(
  'applications/fetchUserApplications',
  async (userId: string, { rejectWithValue }) => {
    try {
      const applications = await userAPI.getUserApplications(userId);
      return applications;
    } catch (error) {
      return rejectWithValue('Failed to fetch applications. Please try again.');
    }
  }
);

export const checkApplicationStatus = createAsyncThunk(
  'applications/checkApplicationStatus',
  async ({ userId, jobId }: { userId: string; jobId: string }, { rejectWithValue }) => {
    try {
      const hasApplied = await userAPI.hasAppliedToJob(userId, jobId);
      return { jobId, hasApplied };
    } catch (error) {
      return rejectWithValue('Failed to check application status.');
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateApplicationStatus',
  async ({ 
    userId, 
    jobId, 
    status 
  }: { 
    userId: string; 
    jobId: string; 
    status: JobApplication['status']; 
  }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateApplicationStatus(userId, jobId, status);
      if (response.success) {
        return { jobId, status };
      } else {
        return rejectWithValue(response.message || 'Failed to update application status');
      }
    } catch (error) {
      return rejectWithValue('Failed to update application status. Please try again.');
    }
  }
);

// Initial state
const initialState: ApplicationsState = {
  applications: [],
  isLoading: false,
  error: null,
  appliedJobIds: new Set(),
};

// Applications slice
const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearApplications: (state) => {
      state.applications = [];
      state.appliedJobIds.clear();
    },
    addApplication: (state, action: PayloadAction<JobApplication>) => {
      state.applications.push(action.payload);
      state.appliedJobIds.add(action.payload.jobId);
    },
    updateApplication: (state, action: PayloadAction<{ jobId: string; status: JobApplication['status'] }>) => {
      const { jobId, status } = action.payload;
      const application = state.applications.find(app => app.jobId === jobId);
      if (application) {
        application.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    // Apply to job
    builder
      .addCase(applyToJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.isLoading = false;
        const { jobId } = action.payload;
        state.appliedJobIds.add(jobId);
        
        // Add a new application entry
        const newApplication: JobApplication = {
          jobId,
          status: 'applied',
          appliedAt: new Date().toISOString(),
          jobTitle: action.payload.jobTitle,
          company: action.payload.company,
          notes: 'Applied via job board'
        };
        state.applications.push(newApplication);
        state.error = null;
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch user applications
    builder
      .addCase(fetchUserApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload;
        // Update applied job IDs set
        state.appliedJobIds = new Set(action.payload.map(app => app.jobId));
        state.error = null;
      })
      .addCase(fetchUserApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check application status
    builder
      .addCase(checkApplicationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkApplicationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const { jobId, hasApplied } = action.payload;
        if (hasApplied) {
          state.appliedJobIds.add(jobId);
        } else {
          state.appliedJobIds.delete(jobId);
        }
        state.error = null;
      })
      .addCase(checkApplicationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update application status
    builder
      .addCase(updateApplicationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const { jobId, status } = action.payload;
        const application = state.applications.find(app => app.jobId === jobId);
        if (application) {
          application.status = status;
        }
        state.error = null;
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setLoading, 
  clearApplications, 
  addApplication, 
  updateApplication 
} = applicationsSlice.actions;

export default applicationsSlice.reducer;
