// User Registration and Authentication API Service
import type { RegisterFormData, LoginFormData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://68972036250b078c204109ef.mockapi.io/api/v1';

interface User {
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

interface JobApplication {
  jobId: string;
  status: 'applied' | 'under-review' | 'interview' | 'rejected' | 'hired';
  appliedAt: string;
  jobTitle: string;
  company: string;
  notes?: string;
}

interface RegistrationResponse {
  success: boolean;
  user?: User;
  message?: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export const userAPI = {
  // Login user by email and password
  async loginUser(loginData: LoginFormData): Promise<LoginResponse> {
    try {
      // Fetch all users from the API
      const response = await fetch(`${API_BASE_URL}/users`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users: User[] = await response.json();
      
      // Find user with matching email
      const user = users.find(u => u.email.toLowerCase() === loginData.email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          message: 'No account found with this email address'
        };
      }
      
      // Check password (in a real app, this would be done securely on the server)
      if (user.password !== loginData.password) {
        return {
          success: false,
          message: 'Invalid password'
        };
      }
      
      // Login successful
      return {
        success: true,
        user,
        message: 'Login successful!'
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  },

  // Register new user
  async registerUser(userData: RegisterFormData): Promise<RegistrationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          gender: userData.gender,
          password: userData.password,
          DoB: new Date().toISOString(), // You can modify this to use actual DoB from form
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const user: User = await response.json();
      
      return {
        success: true,
        user,
        message: 'User registered successfully!'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  },

  // Get all users (for testing/verification)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Apply to a job
  async applyToJob(
    userId: string, 
    jobId: string, 
    jobTitle: string, 
    company: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Get current user data
      const user = await this.getUserById(userId);
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Initialize applications array if it doesn't exist
      if (!user.applications) {
        user.applications = [];
      }

      // Check if already applied
      const existingApplication = user.applications.find(app => app.jobId === jobId);
      if (existingApplication) {
        return { success: false, message: 'You have already applied to this job' };
      }

      // Add new application
      const newApplication: JobApplication = {
        jobId,
        status: 'applied',
        appliedAt: new Date().toISOString(),
        jobTitle,
        company,
        notes: 'Applied via job board'
      };

      user.applications.push(newApplication);

      // Update user in API
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true, message: 'Application submitted successfully!' };
    } catch (error) {
      console.error('Error applying to job:', error);
      return { success: false, message: 'Failed to submit application. Please try again.' };
    }
  },

  // Get user's applications
  async getUserApplications(userId: string): Promise<JobApplication[]> {
    try {
      const user = await this.getUserById(userId);
      return user?.applications || [];
    } catch (error) {
      console.error('Error fetching user applications:', error);
      return [];
    }
  },

  // Check if user has applied to a job
  async hasAppliedToJob(userId: string, jobId: string): Promise<boolean> {
    try {
      const applications = await this.getUserApplications(userId);
      return applications.some(app => app.jobId === jobId);
    } catch (error) {
      console.error('Error checking application status:', error);
      return false;
    }
  },

  // Update application status (for employers)
  async updateApplicationStatus(
    userId: string, 
    jobId: string, 
    status: JobApplication['status']
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.applications) {
        return { success: false, message: 'User or applications not found' };
      }

      const application = user.applications.find(app => app.jobId === jobId);
      if (!application) {
        return { success: false, message: 'Application not found' };
      }

      application.status = status;

      // Update user in API
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true, message: 'Application status updated successfully!' };
    } catch (error) {
      console.error('Error updating application status:', error);
      return { success: false, message: 'Failed to update application status.' };
    }
  }
};

// Export types for use in components
export type { User, JobApplication };
