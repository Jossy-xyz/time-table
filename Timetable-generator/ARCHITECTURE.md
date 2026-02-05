# Frontend Architecture - New Implementation

## 🎯 Overview

This document describes the refactored frontend architecture for the Timetable Generator application. The refactoring transforms the application from a flat, monolithic structure into a modern, scalable, and maintainable enterprise-grade React application.

## 📁 Directory Structure

```
src/
├── components/                 # Reusable UI components
│   ├── common/                # Shared, generic components
│   │   ├── Button.js         # Button component with variants
│   │   ├── Input.js          # Form input component
│   │   ├── Modal.js          # Modal dialog component
│   │   ├── Card.js           # Card container component
│   │   ├── Alert.js          # Alert notification component
│   │   └── index.js          # Barrel export
│   ├── layout/               # Layout components
│   │   ├── Header.js         # Top navigation header
│   │   ├── Sidebar.js        # Side navigation menu
│   │   ├── MainLayout.js     # Main layout wrapper
│   │   └── index.js          # Barrel export
│   └── features/             # Feature-specific components
│       ├── auth/            # Authentication components
│       ├── crud/            # CRUD operation components
│       └── timetable/       # Timetable-specific components
│
├── services/                  # Business logic & API calls
│   ├── api/                  # API service layer
│   │   ├── client.js        # Axios instance with interceptors
│   │   ├── authService.js   # Authentication API calls
│   │   ├── studentService.js # Student CRUD operations
│   │   ├── courseService.js  # Course CRUD operations
│   │   ├── staffService.js   # Staff CRUD operations
│   │   ├── venueService.js   # Venue CRUD operations
│   │   ├── timetableService.js # Timetable API calls
│   │   └── index.js          # Barrel export
│   └── state/                # Zustand state stores
│       ├── authStore.js      # Authentication state
│       ├── studentStore.js   # Student state management
│       ├── courseStore.js    # Course state management
│       ├── timetableStore.js # Timetable state management
│       └── index.js          # Barrel export
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.js           # Authentication hook
│   ├── useForm.js           # Form state management
│   ├── useModal.js          # Modal state management
│   ├── useFetch.js          # Data fetching hook
│   └── index.js             # Barrel export
│
├── pages/                     # Full page components
│   ├── LoginPage.js         # Login page
│   ├── DashboardPage.js     # Dashboard
│   ├── StudentsPage.js      # Students management
│   ├── CoursesPage.js       # Courses management
│   ├── StaffPage.js         # Staff management
│   ├── VenuesPage.js        # Venues management
│   ├── TimetablePage.js     # Timetable generation
│   └── SettingsPage.js      # Settings page
│
├── styles/                    # Global styles and themes
│   └── themes/              # Theme configurations
│
├── constants/                 # Application constants
│   └── app.js              # Configuration constants
│
├── utils/                     # Utility functions
│   ├── errorHandler.js      # Error handling utilities
│   └── helpers.js           # Helper functions
│
├── assets/                    # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── App.js                     # Main app component with routing
├── index.js                   # Application entry point
└── index.css                  # Global styles
```

## 🔑 Key Architectural Patterns

### 1. **API Service Layer** (`src/services/api/`)

Centralized API communication with proper error handling and interceptors.

```javascript
// Usage example
import { studentService } from './services/api';

const students = await studentService.getAll();
```

**Features:**
- Axios client with request/response interceptors
- Automatic token injection
- Centralized error handling
- Base URL configuration

### 2. **State Management** (`src/services/state/`)

Zustand stores for global state management without prop drilling.

```javascript
// Usage example
import { useStudentStore } from './services/state';

const { students, fetchStudents, addStudent } = useStudentStore();
```

**Benefits:**
- Lightweight and intuitive
- No boilerplate
- Async action support
- Devtools integration

### 3. **Custom Hooks** (`src/hooks/`)

Reusable logic encapsulation with custom React hooks.

```javascript
// Form management
const { values, handleChange, handleSubmit } = useForm(
  { name: '', email: '' },
  onSubmit
);

// Authentication
const { user, login, logout, isAuthenticated } = useAuth();

// Modal state
const { isOpen, open, close } = useModal();

// Data fetching
const { data, isLoading, error } = useFetch(fetchFn);
```

### 4. **Component Library** (`src/components/`)

Organized into common, layout, and feature components.

```javascript
// Common components (reusable across features)
import { Button, Input, Modal, Card, Alert } from './components/common';

// Layout components
import { MainLayout } from './components/layout';

// Feature components (feature-specific)
import StudentForm from './components/features/crud/StudentForm';
```

### 5. **Routing** (`App.js`)

Protected routes with role-based access control ready.

```javascript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route 
    path="/dashboard" 
    element={<ProtectedRoute element={<DashboardPage />} />} 
  />
  {/* More routes */}
</Routes>
```

## 🎨 Design System

### Color Palette (CSS Variables)

```css
--color-primary: #2563eb    /* Blue */
--color-secondary: #64748b  /* Slate */
--color-danger: #dc2626     /* Red */
--color-success: #16a34a    /* Green */
--color-warning: #ca8a04    /* Amber */
```

### Spacing Scale

```css
--spacing-xs: 0.25rem   /* 4px */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */
```

### Border Radius

```css
--radius-sm: 0.375rem  /* 6px */
--radius-md: 0.5rem    /* 8px */
--radius-lg: 0.75rem   /* 12px */
```

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your API URL
REACT_APP_API_URL=http://localhost:8080
```

### Running the Application

```bash
# Development
npm start

# Build for production
npm build

# Run tests
npm test
```

## 📦 Dependencies

### Production
- **react** ^19.1.0 - UI library
- **react-dom** ^19.1.0 - DOM rendering
- **react-router-dom** ^7.9.2 - Client-side routing
- **zustand** ^4.5.5 - State management
- **axios** ^1.7.7 - HTTP client
- **framer-motion** ^12.23.0 - Animations
- **react-toastify** ^11.0.5 - Toast notifications
- **react-icons** ^5.5.0 - Icon library

### Development
- **tailwindcss** ^3.4.1 - Utility-first CSS
- **postcss** ^8.4.32 - CSS processing
- **autoprefixer** ^10.4.17 - CSS vendor prefixes

## ♿ Accessibility Features

All components implement WCAG 2.1 AA compliance:

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- High contrast support
- Reduced motion support

## 🧪 Testing Strategy

The application is structured to support:

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: Multiple component interaction tests
- **E2E Tests**: User workflow testing
- **Accessibility Tests**: jest-axe integration

## 🔒 Security

- JWT token management
- HTTP-only cookie support ready
- CORS configuration
- XSS protection
- CSRF token support ready

## 📚 Best Practices

1. **Component Composition** - Build components from smaller pieces
2. **Separation of Concerns** - Logic separate from presentation
3. **DRY Principle** - Don't Repeat Yourself
4. **Error Handling** - Comprehensive error management
5. **Type Safety** - JSDoc for JavaScript type hints
6. **Documentation** - Well-commented code

## 🔄 Data Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ (User Interaction)
       ▼
┌─────────────────────┐
│   Components        │  (UI Layer)
└──────┬──────────────┘
       │ (Events/Actions)
       ▼
┌─────────────────────┐
│   Hooks/Store       │  (State Layer)
└──────┬──────────────┘
       │ (API Calls)
       ▼
┌─────────────────────┐
│   Services          │  (Business Logic)
└──────┬──────────────┘
       │ (HTTP Requests)
       ▼
┌─────────────────────┐
│   Backend API       │  (Server)
└─────────────────────┘
```

## 📖 File Naming Conventions

- **Components**: PascalCase (e.g., `Button.js`, `StudentForm.js`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.js`, `useForm.js`)
- **Services**: camelCase with 'Service' suffix (e.g., `studentService.js`)
- **Stores**: camelCase with 'Store' suffix (e.g., `authStore.js`)
- **Utils**: camelCase (e.g., `helpers.js`, `errorHandler.js`)

## 🔧 Configuration Files

- **tailwind.config.js** - Tailwind CSS configuration
- **postcss.config.js** - PostCSS plugins
- **.env.example** - Environment variables template

## 📝 Next Steps

1. Install dependencies
2. Configure API URL in `.env`
3. Implement backend API endpoints
4. Add authentication flow
5. Develop feature-specific components
6. Add comprehensive testing
7. Setup CI/CD pipeline
8. Deploy to production

---

For more information, refer to individual component documentation or the main README.
