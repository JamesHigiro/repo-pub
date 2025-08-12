import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import authReducer from './slices/authSlice';
import jobsReducer from './slices/jobsSlice';
import applicationsReducer from './slices/applicationsSlice';

// Enable Immer's MapSet plugin for Set operations
enableMapSet();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    applications: applicationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
        // Ignore Set serialization issues
        ignoredPaths: ['applications.appliedJobIds'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export types for convenience
export type { AuthState, JobsState, ApplicationsState, User, Job, JobApplication, JobFilters, PaginationParams } from './types';
