import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userAPI } from '../../services/userAPI'
import { mockUser } from '../../test/utils'

// Mock fetch globally
Object.defineProperty(window, 'fetch', {
  value: vi.fn(),
  writable: true,
})

describe('userAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loginUser', () => {
    it('should handle successful login', async () => {
      const loginData = { email: 'john.doe@example.com', password: 'password123' }
      const mockUsers = [mockUser]
      
      // Mock successful fetch response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      } as Response)

      const result = await userAPI.loginUser(loginData)

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(result.message).toBe('Login successful!')
      expect(fetch).toHaveBeenCalledWith('https://68972036250b078c204109ef.mockapi.io/api/v1/users')
    })

    it('should handle user not found', async () => {
      const loginData = { email: 'nonexistent@example.com', password: 'password' }
      const mockUsers: any[] = []
      
      // Mock successful fetch response with empty users
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      } as Response)

      const result = await userAPI.loginUser(loginData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('No account found with this email address')
      expect(result.user).toBeUndefined()
    })

    it('should handle invalid password', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' }
      const mockUsers = [mockUser]
      
      // Mock successful fetch response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      } as Response)

      const result = await userAPI.loginUser(loginData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('No account found with this email address')
      expect(result.user).toBeUndefined()
    })

    it('should handle network error', async () => {
      const loginData = { email: 'test@example.com', password: 'password' }
      
      // Mock network error
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await userAPI.loginUser(loginData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Login failed. Please try again.')
      expect(result.user).toBeUndefined()
    })

    it('should handle HTTP error', async () => {
      const loginData = { email: 'test@example.com', password: 'password' }
      
      // Mock HTTP error
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      const result = await userAPI.loginUser(loginData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Login failed. Please try again.')
      expect(result.user).toBeUndefined()
    })
  })

  describe('registerUser', () => {
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
      
      const newUser = { ...mockUser, ...registerData, id: '2' }
      
      // Mock successful fetch response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => newUser
      } as Response)

      const result = await userAPI.registerUser(registerData)

      expect(result.success).toBe(true)
      expect(result.user).toEqual(newUser)
      expect(result.message).toBe('User registered successfully!')
      expect(fetch).toHaveBeenCalledWith(
        'https://68972036250b078c204109ef.mockapi.io/api/v1/users',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"firstName":"John"')
        })
      )
    })

    it('should handle registration error', async () => {
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
      
      // Mock HTTP error
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400
      } as Response)

      const result = await userAPI.registerUser(registerData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Registration failed. Please try again.')
      expect(result.user).toBeUndefined()
    })

    it('should handle network error during registration', async () => {
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
      
      // Mock network error
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await userAPI.registerUser(registerData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Registration failed. Please try again.')
      expect(result.user).toBeUndefined()
    })
  })

  describe('applyToJob', () => {
    it('should handle successful job application', async () => {
      const userId = '1'
      const jobId = '1'
      const jobTitle = 'Software Engineer'
      const company = 'Tech Corp'
      
      const userWithApplications = {
        ...mockUser,
        applications: []
      }
      
      // Mock getUserById response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => userWithApplications
      } as Response)
      
      // Mock PUT request response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...userWithApplications,
          applications: [{
            jobId,
            status: 'applied',
            appliedAt: expect.any(String),
            jobTitle,
            company,
            notes: 'Applied via job board'
          }]
        })
      } as Response)

      const result = await userAPI.applyToJob(userId, jobId, jobTitle, company)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Application submitted successfully!')
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should handle user not found', async () => {
      const userId = '999'
      const jobId = '1'
      const jobTitle = 'Software Engineer'
      const company = 'Tech Corp'
      
      // Mock getUserById response - user not found
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => null
      } as Response)

      const result = await userAPI.applyToJob(userId, jobId, jobTitle, company)

      expect(result.success).toBe(false)
      expect(result.message).toBe('User not found')
    })

    it('should handle duplicate application', async () => {
      const userId = '1'
      const jobId = '1'
      const jobTitle = 'Software Engineer'
      const company = 'Tech Corp'
      
      const userWithExistingApplication = {
        ...mockUser,
        applications: [{
          jobId,
          status: 'applied',
          appliedAt: '2024-01-15T10:00:00Z',
          jobTitle,
          company,
          notes: 'Applied via job board'
        }]
      }
      
      // Mock getUserById response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => userWithExistingApplication
      } as Response)

      const result = await userAPI.applyToJob(userId, jobId, jobTitle, company)

      expect(result.success).toBe(false)
      expect(result.message).toBe('You have already applied to this job')
    })

    it('should handle API error during application', async () => {
      const userId = '1'
      const jobId = '1'
      const jobTitle = 'Software Engineer'
      const company = 'Tech Corp'
      
      const userWithApplications = {
        ...mockUser,
        applications: []
      }
      
      // Mock getUserById response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => userWithApplications
      } as Response)
      
      // Mock PUT request error
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      const result = await userAPI.applyToJob(userId, jobId, jobTitle, company)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to submit application. Please try again.')
    })
  })

  describe('getUserApplications', () => {
    it('should return user applications', async () => {
      const userId = '1'
      const mockApplications = [
        {
          jobId: '1',
          status: 'applied',
          appliedAt: '2024-01-15T10:00:00Z',
          jobTitle: 'Software Engineer',
          company: 'Tech Corp',
          notes: 'Applied via job board'
        }
      ]
      
      const userWithApplications = {
        ...mockUser,
        applications: mockApplications
      }
      
      // Mock getUserById response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => userWithApplications
      } as Response)

      const result = await userAPI.getUserApplications(userId)

      expect(result).toEqual(mockApplications)
      expect(fetch).toHaveBeenCalledWith(`https://68972036250b078c204109ef.mockapi.io/api/v1/users/${userId}`)
    })

    it('should return empty array when user has no applications', async () => {
      const userId = '1'
      const userWithoutApplications = {
        ...mockUser,
        applications: []
      }
      
      // Mock getUserById response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => userWithoutApplications
      } as Response)

      const result = await userAPI.getUserApplications(userId)

      expect(result).toEqual([])
    })

    it('should return empty array when user not found', async () => {
      const userId = '999'
      
      // Mock getUserById response - user not found
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => null
      } as Response)

      const result = await userAPI.getUserApplications(userId)

      expect(result).toEqual([])
    })

    it('should handle API error', async () => {
      const userId = '1'
      
      // Mock API error
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await userAPI.getUserApplications(userId)

      expect(result).toEqual([])
    })
  })

  describe('hasAppliedToJob', () => {
    it('should return true when user has applied', async () => {
      const userId = '1'
      const jobId = '1'
      const mockApplications = [
        {
          jobId: '1',
          status: 'applied',
          appliedAt: '2024-01-15T10:00:00Z',
          jobTitle: 'Software Engineer',
          company: 'Tech Corp'
        }
      ]
      
      // Mock getUserApplications response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockUser,
          applications: mockApplications
        })
      } as Response)

      const result = await userAPI.hasAppliedToJob(userId, jobId)

      expect(result).toBe(true)
    })

    it('should return false when user has not applied', async () => {
      const userId = '1'
      const jobId = '2'
      const mockApplications = [
        {
          jobId: '1',
          status: 'applied',
          appliedAt: '2024-01-15T10:00:00Z',
          jobTitle: 'Software Engineer',
          company: 'Tech Corp'
        }
      ]
      
      // Mock getUserApplications response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockUser,
          applications: mockApplications
        })
      } as Response)

      const result = await userAPI.hasAppliedToJob(userId, jobId)

      expect(result).toBe(false)
    })

    it('should return false when user has no applications', async () => {
      const userId = '1'
      const jobId = '1'
      
      // Mock getUserApplications response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockUser,
          applications: []
        })
      } as Response)

      const result = await userAPI.hasAppliedToJob(userId, jobId)

      expect(result).toBe(false)
    })
  })
})
