import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { enableMapSet } from 'immer'

// Enable Immer's MapSet plugin for Set operations
enableMapSet()
import applicationsReducer, { 
  applyToJob, 
  fetchUserApplications, 
  checkApplicationStatus,
  updateApplicationStatus,
  clearError,
  clearApplications,
  addApplication
} from '../../../store/slices/applicationsSlice'
import { userAPI } from '../../../services/userAPI'
import { mockApplication } from '../../../test/utils'

// Mock the userAPI
vi.mock('../../../services/userAPI', () => ({
  userAPI: {
    applyToJob: vi.fn(),
    getUserApplications: vi.fn(),
    hasAppliedToJob: vi.fn(),
    updateApplicationStatus: vi.fn(),
  }
}))

describe('applicationsSlice', () => {
  let store: ReturnType<typeof setupStore>

  function setupStore(preloadedState = {}) {
    return configureStore({
      reducer: { applications: applicationsReducer },
      preloadedState: { applications: { 
        applications: [],
        isLoading: false,
        error: null,
        appliedJobIds: new Set<string>(),
        ...preloadedState 
      }},
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST'],
            ignoredPaths: ['applications.appliedJobIds'],
          },
        }),
    })
  }

  beforeEach(() => {
    store = setupStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().applications
      expect(state).toEqual({
        applications: [],
        isLoading: false,
        error: null,
        appliedJobIds: new Set(),
      })
    })
  })

  describe('applyToJob thunk', () => {
    it('should handle successful job application', async () => {
      const applicationData = {
        userId: '1',
        jobId: '1',
        jobTitle: 'Software Engineer',
        company: 'Tech Corp'
      }
      
      // Mock successful API response
      vi.mocked(userAPI.applyToJob).mockResolvedValue({
        success: true,
        message: 'Application submitted successfully!'
      })

      // Dispatch apply action
      const result = await store.dispatch(applyToJob(applicationData))

      // Assert the action was fulfilled
      expect(result.meta.requestStatus).toBe('fulfilled')
      
      // Assert state changes
      const state = store.getState().applications
      expect(state.applications).toHaveLength(1)
      expect(state.applications[0]).toMatchObject({
        jobId: '1',
        status: 'applied',
        jobTitle: 'Software Engineer',
        company: 'Tech Corp'
      })
      expect(state.appliedJobIds.has('1')).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle application failure', async () => {
      const applicationData = {
        userId: '1',
        jobId: '1',
        jobTitle: 'Software Engineer',
        company: 'Tech Corp'
      }
      
      // Mock failed API response
      vi.mocked(userAPI.applyToJob).mockResolvedValue({
        success: false,
        message: 'You have already applied to this job'
      })

      // Dispatch apply action
      const result = await store.dispatch(applyToJob(applicationData))

      // Assert the action was rejected
      expect(result.meta.requestStatus).toBe('rejected')
      
      // Assert state changes
      const state = store.getState().applications
      expect(state.applications).toHaveLength(0)
      expect(state.appliedJobIds.has('1')).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('You have already applied to this job')
    })

    it('should handle API error', async () => {
      const applicationData = {
        userId: '1',
        jobId: '1',
        jobTitle: 'Software Engineer',
        company: 'Tech Corp'
      }
      
      // Mock API error
      vi.mocked(userAPI.applyToJob).mockRejectedValue(new Error('Network error'))

      // Dispatch apply action
      const result = await store.dispatch(applyToJob(applicationData))

      // Assert the action was rejected
      expect(result.meta.requestStatus).toBe('rejected')
      
      // Assert state changes
      const state = store.getState().applications
      expect(state.applications).toHaveLength(0)
      expect(state.appliedJobIds.has('1')).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Failed to apply to job. Please try again.')
    })

    it('should set loading state during application', async () => {
      const applicationData = {
        userId: '1',
        jobId: '1',
        jobTitle: 'Software Engineer',
        company: 'Tech Corp'
      }
      
      // Mock delayed API response
      vi.mocked(userAPI.applyToJob).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Application submitted successfully!'
        }), 100))
      )

      // Start application (don't await)
      const applyPromise = store.dispatch(applyToJob(applicationData))
      
      // Check loading state
      expect(store.getState().applications.isLoading).toBe(true)
      
      // Wait for completion
      await applyPromise
      
      // Check loading state is false
      expect(store.getState().applications.isLoading).toBe(false)
    })
  })

  describe('fetchUserApplications thunk', () => {
    it('should handle successful applications fetch', async () => {
      const mockApplications = [mockApplication]
      
      // Mock successful API response
      vi.mocked(userAPI.getUserApplications).mockResolvedValue(mockApplications)

      // Dispatch fetch action
      const result = await store.dispatch(fetchUserApplications('1'))

      // Assert the action was fulfilled
      expect(result.meta.requestStatus).toBe('fulfilled')
      
      // Assert state changes
      const state = store.getState().applications
      expect(state.applications).toEqual(mockApplications)
      expect(state.appliedJobIds.has('1')).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle empty applications list', async () => {
      // Mock empty API response
      vi.mocked(userAPI.getUserApplications).mockResolvedValue([])

      // Dispatch fetch action
      const result = await store.dispatch(fetchUserApplications('1'))

      // Assert the action was fulfilled
      expect(result.meta.requestStatus).toBe('fulfilled')
      
      // Assert state changes
      const state = store.getState().applications
      expect(state.applications).toEqual([])
      expect(state.appliedJobIds.size).toBe(0)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle API error during fetch', async () => {
      // Mock API error
      vi.mocked(userAPI.getUserApplications).mockRejectedValue(new Error('Network error'))

      // Dispatch fetch action
      const result = await store.dispatch(fetchUserApplications('1'))

      // Assert the action was rejected
      expect(result.meta.requestStatus).toBe('rejected')
      
      // Assert state changes
      const state = store.getState().applications
      expect(state.applications).toEqual([])
      expect(state.appliedJobIds.size).toBe(0)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Failed to fetch applications. Please try again.')
    })
  })

  describe('checkApplicationStatus thunk', () => {
    it('should handle user has applied', async () => {
      // Mock successful API response
      vi.mocked(userAPI.hasAppliedToJob).mockResolvedValue(true)

      // Dispatch check action
      const result = await store.dispatch(checkApplicationStatus({
        userId: '1',
        jobId: '1'
      }))

      // Assert the action was fulfilled
      expect(result.meta.requestStatus).toBe('fulfilled')
      
      // Assert state changes
      const state = store.getState().applications
      expect(state.appliedJobIds.has('1')).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle user has not applied', async () => {
      // Mock successful API response
      vi.mocked(userAPI.hasAppliedToJob).mockResolvedValue(false)

      // Dispatch check action
      const result = await store.dispatch(checkApplicationStatus({
        userId: '1',
        jobId: '1'
      }))

      // Assert the action was fulfilled
      expect(result.meta.requestStatus).toBe('fulfilled')
      
      // Assert state changes
      const state = store.getState().applications
      expect(state.appliedJobIds.has('1')).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })
  })

  describe('updateApplicationStatus thunk', () => {
    it('should handle successful status update', async () => {
      // Set up initial state with an application
      store = setupStore({
        applications: [mockApplication],
        isLoading: false,
        error: null,
        appliedJobIds: new Set(['1']),
      })
      
      // Mock successful API response
      vi.mocked(userAPI.updateApplicationStatus).mockResolvedValue({
        success: true,
        message: 'Status updated successfully'
      })

      // Dispatch update action
      const result = await store.dispatch(updateApplicationStatus({
        userId: '1',
        jobId: '1',
        status: 'interview'
      }))

      // Assert the action was fulfilled
      expect(result.meta.requestStatus).toBe('fulfilled')
      
      // Assert state changes
      const state = store.getState().applications
      expect(state.applications[0].status).toBe('interview')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle status update failure', async () => {
      // Mock failed API response
      vi.mocked(userAPI.updateApplicationStatus).mockResolvedValue({
        success: false,
        message: 'Application not found'
      })

      // Dispatch update action
      const result = await store.dispatch(updateApplicationStatus({
        userId: '1',
        jobId: '1',
        status: 'interview'
      }))

      // Assert the action was rejected
      expect(result.meta.requestStatus).toBe('rejected')
      
      // Assert state changes
      const state = store.getState().applications
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Application not found')
    })
  })

  describe('reducer actions', () => {
    it('should clear error', () => {
      // Set up initial state with error
      store = setupStore({
        applications: [],
        isLoading: false,
        error: 'Some error message',
        appliedJobIds: new Set(),
      })

      // Dispatch clearError action
      store.dispatch(clearError())

      // Assert error is cleared
      const state = store.getState().applications
      expect(state.error).toBe(null)
    })

    it('should clear applications', () => {
      // Set up initial state with applications
      store = setupStore({
        applications: [mockApplication],
        isLoading: false,
        error: null,
        appliedJobIds: new Set(['1']),
      })

      // Dispatch clearApplications action
      store.dispatch(clearApplications())

      // Assert applications are cleared
      const state = store.getState().applications
      expect(state.applications).toEqual([])
      expect(state.appliedJobIds.size).toBe(0)
    })

    it('should add application', () => {
      const newApplication = {
        jobId: '2',
        status: 'applied' as const,
        appliedAt: '2024-01-16T10:00:00Z',
        jobTitle: 'Frontend Developer',
        company: 'Startup Inc',
        notes: 'Applied via job board'
      }

      // Dispatch addApplication action
      store.dispatch(addApplication(newApplication))

      // Assert application is added
      const state = store.getState().applications
      expect(state.applications).toHaveLength(1)
      expect(state.applications[0]).toEqual(newApplication)
      expect(state.appliedJobIds.has('2')).toBe(true)
    })
  })
})
