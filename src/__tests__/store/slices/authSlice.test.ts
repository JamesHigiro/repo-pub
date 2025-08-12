import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { enableMapSet } from 'immer'

// Enable Immer's MapSet plugin for Set operations
enableMapSet()
import authReducer, { 
  loginUser, 
  registerUser, 
  logoutUser, 
  loadUserFromStorage,
  clearError
} from '../../../store/slices/authSlice'
import { userAPI } from '../../../services/userAPI'
import { mockUser, mockAPIResponses } from '../../../test/utils'

// Mock the userAPI
vi.mock('../../../services/userAPI', () => ({
  userAPI: {
    loginUser: vi.fn(),
    registerUser: vi.fn(),
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('authSlice', () => {
  let store: ReturnType<typeof setupStore>

  function setupStore(preloadedState = {}) {
    return configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
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
      const state = store.getState().auth
      expect(state).toEqual({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    })
  })

  describe('loginUser thunk', () => {
    it('should handle successful login', async () => {
      const loginData = { email: 'test@example.com', password: 'password' }
      
      // Mock successful API response
      vi.mocked(userAPI.loginUser).mockResolvedValue(mockAPIResponses.loginSuccess)
      
      // Mock localStorage.setItem
      vi.mocked(localStorage.setItem).mockImplementation(() => {})

      // Dispatch login action
      const result = await store.dispatch(loginUser(loginData))

      // Assert the action was fulfilled
      expect(result.meta.requestStatus).toBe('fulfilled')
      
      // Assert state changes
      const state = store.getState().auth
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
      
      // Assert localStorage was called
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
    })

    it('should handle login failure', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' }
      
      // Mock failed API response
      vi.mocked(userAPI.loginUser).mockResolvedValue(mockAPIResponses.loginFailure)

      // Dispatch login action
      const result = await store.dispatch(loginUser(loginData))

      // Assert the action was rejected
      expect(result.meta.requestStatus).toBe('rejected')
      
      // Assert state changes
      const state = store.getState().auth
      expect(state.user).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Invalid credentials')
    })

    it('should handle API error', async () => {
      const loginData = { email: 'test@example.com', password: 'password' }
      
      // Mock API error
      vi.mocked(userAPI.loginUser).mockRejectedValue(new Error('Network error'))

      // Dispatch login action
      const result = await store.dispatch(loginUser(loginData))

      // Assert the action was rejected
      expect(result.meta.requestStatus).toBe('rejected')
      
      // Assert state changes
      const state = store.getState().auth
      expect(state.user).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Login failed. Please try again.')
    })

    it('should set loading state during login', async () => {
      const loginData = { email: 'test@example.com', password: 'password' }
      
      // Mock delayed API response
      vi.mocked(userAPI.loginUser).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockAPIResponses.loginSuccess), 100))
      )

      // Start login (don't await)
      const loginPromise = store.dispatch(loginUser(loginData))
      
      // Check loading state
      expect(store.getState().auth.isLoading).toBe(true)
      
      // Wait for completion
      await loginPromise
      
      // Check loading state is false
      expect(store.getState().auth.isLoading).toBe(false)
    })
  })

  describe('registerUser thunk', () => {
    it('should handle successful registration', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1234567890',
        gender: 'male',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'jobseeker' as const
      }
      
      // Mock successful API response
      vi.mocked(userAPI.registerUser).mockResolvedValue(mockAPIResponses.registerSuccess)
      
      // Mock localStorage.setItem
      vi.mocked(localStorage.setItem).mockImplementation(() => {})

      // Dispatch register action
      const result = await store.dispatch(registerUser(registerData))

      // Assert the action was fulfilled
      expect(result.meta.requestStatus).toBe('fulfilled')
      
      // Assert state changes
      const state = store.getState().auth
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
      
      // Assert localStorage was called
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
    })

    it('should handle registration failure', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        phoneNumber: '+1234567890',
        gender: 'male',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'jobseeker' as const
      }
      
      // Mock failed API response
      vi.mocked(userAPI.registerUser).mockResolvedValue({
        success: false,
        message: 'Email already exists'
      })

      // Dispatch register action
      const result = await store.dispatch(registerUser(registerData))

      // Assert the action was rejected
      expect(result.meta.requestStatus).toBe('rejected')
      
      // Assert state changes
      const state = store.getState().auth
      expect(state.user).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Email already exists')
    })
  })

  describe('logoutUser thunk', () => {
    it('should handle successful logout', async () => {
      // Set up initial authenticated state
      store = setupStore({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      // Mock localStorage.removeItem
      vi.mocked(localStorage.removeItem).mockImplementation(() => {})

      // Dispatch logout action
      const result = await store.dispatch(logoutUser())

      // Assert the action was fulfilled
      expect(result.meta.requestStatus).toBe('fulfilled')
      
      // Assert state changes
      const state = store.getState().auth
      expect(state.user).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
      
      // Assert localStorage was cleared
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('loadUserFromStorage thunk', () => {
    it('should load user from localStorage successfully', async () => {
      // Mock localStorage.getItem to return user data
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUser))

      // Dispatch load action
      const result = await store.dispatch(loadUserFromStorage())

      // Assert the action was fulfilled
      expect(result.meta.requestStatus).toBe('fulfilled')
      
      // Assert state changes
      const state = store.getState().auth
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle no user in localStorage', async () => {
      // Mock localStorage.getItem to return null
      vi.mocked(localStorage.getItem).mockReturnValue(null)

      // Dispatch load action
      const result = await store.dispatch(loadUserFromStorage())

      // Assert the action was rejected
      expect(result.meta.requestStatus).toBe('rejected')
      
      // Assert state remains unchanged
      const state = store.getState().auth
      expect(state.user).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })

    it('should handle invalid JSON in localStorage', async () => {
      // Mock localStorage.getItem to return invalid JSON
      vi.mocked(localStorage.getItem).mockReturnValue('invalid json')

      // Dispatch load action
      const result = await store.dispatch(loadUserFromStorage())

      // Assert the action was rejected
      expect(result.meta.requestStatus).toBe('rejected')
      
      // Assert state remains unchanged
      const state = store.getState().auth
      expect(state.user).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('clearError action', () => {
    it('should clear error state', () => {
      // Set up initial state with error
      store = setupStore({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Some error message',
      })

      // Dispatch clearError action
      store.dispatch(clearError())

      // Assert error is cleared
      const state = store.getState().auth
      expect(state.error).toBe(null)
    })
  })
})
