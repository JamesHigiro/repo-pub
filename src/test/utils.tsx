import React from 'react'
import type { PropsWithChildren } from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { enableMapSet } from 'immer'
import authReducer from '../store/slices/authSlice'
import jobsReducer from '../store/slices/jobsSlice'
import applicationsReducer from '../store/slices/applicationsSlice'
import type { RootState } from '../store'

// Enable Immer's MapSet plugin for Set operations
enableMapSet()

// Create a test store with the same configuration as the real store
export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      jobs: jobsReducer,
      applications: applicationsReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware: any) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
          ignoredPaths: ['applications.appliedJobIds'],
        },
      }),
  } as any)
}

// Test wrapper component that provides Redux store
export function TestWrapper({ 
  children, 
  preloadedState 
}: PropsWithChildren<{ preloadedState?: Partial<RootState> }>) {
  const store = createTestStore(preloadedState)
  
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

// Custom render function that includes Redux provider
export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: PropsWithChildren<{}>) {
    return <TestWrapper preloadedState={preloadedState}>{children}</TestWrapper>
  }

  return { store: createTestStore(preloadedState), ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// Mock user data for tests
export const mockUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1234567890',
  gender: 'male',
  password: 'password123',
  applications: []
}

// Mock job data for tests
export const mockJob = {
  id: '1',
  title: 'Software Engineer',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  type: 'Full-time',
  closingDate: '2024-12-31',
  qualifications: ['React', 'TypeScript', 'Node.js'],
  remote: false
}

// Mock application data for tests
export const mockApplication = {
  jobId: '1',
  status: 'applied' as const,
  appliedAt: '2024-01-15T10:00:00Z',
  jobTitle: 'Software Engineer',
  company: 'Tech Corp',
  notes: 'Applied via job board'
}

// Mock API responses
export const mockAPIResponses = {
  loginSuccess: {
    success: true,
    user: mockUser,
    message: 'Login successful!'
  },
  loginFailure: {
    success: false,
    message: 'Invalid credentials'
  },
  registerSuccess: {
    success: true,
    user: mockUser,
    message: 'Registration successful!'
  },
  jobsSuccess: {
    success: true,
    jobs: [mockJob],
    totalPages: 1,
    currentPage: 1,
    totalItems: 1
  }
}
