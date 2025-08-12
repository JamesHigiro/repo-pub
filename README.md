# Job Board Platform

A modern, full-featured Job Board platform built with React, TypeScript, Redux Toolkit, and Tailwind CSS. Users can browse jobs, apply for positions, and track their applications with a beautiful, responsive interface.

## 🚀 Features

### Authentication & User Management
- **Login/Register**: Email/password authentication with role selection (Job Seeker/Employer)
- **Form Validation**: Real-time validation with helpful error messages
- **Persistent Sessions**: Automatic login state management with localStorage

### Job Management
- **Job Listings**: Browse available jobs with search and filtering
- **Advanced Filters**: Filter by job type, location, remote work, and keywords
- **Job Details**: Comprehensive job information with application functionality
- **Pagination**: Efficient job browsing with paginated results

### Application System
- **Easy Application**: One-click job application with status tracking
- **Application History**: View all your applications and their current status
- **Status Tracking**: Monitor application progress (applied, under review, interview, hired, rejected)
- **Duplicate Prevention**: Prevents multiple applications to the same job


### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Redux Toolkit**: Centralized state management with RTK Query
- **Tailwind CSS**: Modern utility-first styling with responsive design
- **Component Architecture**: Reusable, well-structured components
- **Testing**: Comprehensive test suite with Vitest and React Testing Library

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input)
│   ├── forms/           # Form components (LoginForm, RegisterForm)
│   ├── JobList.tsx      # Job browsing component
│   ├── MyApplications.tsx # Application tracking component
│   ├── JobDetailsModal.tsx # Job details modal
│   └── layout/          # Layout components
├── pages/
│   ├── auth/            # Authentication pages (Login, Register)
│   ├── DashboardPage.tsx # Main dashboard with role-based content
│   ├── jobs/            # Job-related pages
│   └── profile/         # User profile pages
├── store/
│   ├── slices/          # Redux slices (auth, jobs, applications)
│   ├── hooks.ts         # Typed Redux hooks
│   ├── index.ts         # Store configuration
│   └── types.ts         # Redux type definitions
├── services/
│   ├── userAPI.ts       # User authentication and applications API
│   └── jobsAPI.ts       # Jobs data API
├── routes/
│   ├── AppRoutes.tsx    # Main routes component
│   └── routes.ts        # Routes configuration
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── test/                # Test utilities and setup
```

## 🛠️ Technology Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management with RTK Query
- **Tailwind CSS** - Modern utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing utilities
- **ESLint** - Code quality and consistency
- **Ant Design** - UI component library

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-board
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173`


## 🔧 Environment Variables

### Required Variables
- `VITE_API_BASE_URL`: The base URL for the API endpoints
  - Default: `https://68972036250b078c204109ef.mockapi.io/api/v1`

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:run     # Run tests once

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
```

## 🧪 Testing

The project includes a comprehensive test suite built with Vitest and React Testing Library.

### Test Structure
```
src/__tests__/
├── services/
│   └── userAPI.test.ts
└── store/
    └── slices/
        ├── applicationsSlice.test.ts
        └── authSlice.test.ts
```

### Running Tests
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test userAPI.test.ts
```

### Test Coverage
The test suite covers:
- ✅ API service functions
- ✅ Redux slice reducers and thunks
- ✅ Component rendering and interactions
- ✅ Authentication flows
- ✅ Job application functionality

## 🔧 Redux State Management

The application uses Redux Toolkit with three main slices:

### 1. Auth Slice (`authSlice.ts`)
Manages user authentication state:
- User login/logout
- Registration
- Profile updates
- Persistent sessions

### 2. Jobs Slice (`jobsSlice.ts`)
Manages job listings and filtering:
- Job data fetching
- Search and filtering
- Pagination
- Job details

### 3. Applications Slice (`applicationsSlice.ts`)
Manages job applications:
- Application submission
- Application tracking
- Status updates
- Applied job tracking

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) for main actions
- **Secondary**: Green (#10B981) for success states
- **Accent**: Purple (#8B5CF6) for highlights
- **Neutral**: Gray scale for text and backgrounds

### Responsive Design
The application is fully responsive with mobile-first design:
- **Desktop**: Full-featured interface
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Streamlined interface with touch-friendly interactions

### Components
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Input**: With icons, validation states, and helper text
- **Card**: Flexible card components for content display
- **Modal**: Responsive modal dialogs
- **Table**: Sortable and filterable data tables

## 🔒 Security Features

- **Input Validation**: Client-side and server-side validation
- **Authentication**: Secure login with session management
- **Role-based Access**: Different permissions for different user types
- **Error Handling**: Secure error messages without exposing sensitive data

## 🚧 Development Workflow

### Code Quality
- **TypeScript**: Type safety and IntelliSense
- **Prettier**: Code formatting (integrated with ESLint)


## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Test Failures**
```bash
# Clear test cache
npm run test -- --clearCache
```

**TypeScript Errors**
```bash
# Run type checking
npm run type-check
```

### Development Tips
- Use React DevTools for component debugging
- Use Redux DevTools for state debugging
- Check browser console for errors
- Verify API endpoints are accessible

## 📝 API Documentation

The application uses RESTful APIs for data management:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Jobs Endpoints
- `GET /jobs` - Get job listings with filters
- `GET /jobs/:id` - Get specific job details
- `POST /jobs` - Create new job (employers only)

### Applications Endpoints
- `POST /applications` - Apply to a job
- `GET /applications/user/:id` - Get user applications
- `PUT /applications/:id` - Update application status


**Built with ❤️ using React, TypeScript, and Redux Toolkit**
