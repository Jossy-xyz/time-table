# 🎓 Timetable Generator - Frontend

**React 18 + TypeScript Application**

---

## 📋 Overview

This is the frontend application for the Bells University Timetable Generator. It provides a modern, responsive interface for managing examination timetables with role-based access control.

---

## 🚀 Quick Start

### Development Mode

```bash
npm install
npm start
```

Runs on: `http://localhost:3000`

### Production Build

```bash
npm run build
```

Creates optimized build in `/build` folder.

---

## 🏗️ Architecture

### Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Zustand** - State Management
- **React Router v6** - Navigation
- **Framer Motion** - Animations
- **React Toastify** - Notifications
- **Lucide React** - Icons

### Project Structure

```
src/
├── pages/              # Page Components
│   ├── DashboardPage.tsx
│   ├── TimetablePage.tsx
│   ├── SettingsPage.tsx
│   ├── VenuesPage.tsx
│   └── ...
├── components/         # Reusable Components
│   ├── layout/         # Layout Components
│   ├── molecules/      # Complex Components
│   └── atoms/          # Basic Components
├── services/           # API Services
│   ├── api/            # API Clients
│   └── ...
├── types/              # TypeScript Types
├── stores/             # Zustand Stores
└── utils/              # Utilities
```

---

## 🔐 RBAC Integration

The frontend implements strict role-based access control:

### Role Checks

```typescript
import { useAuthStore } from "./stores/authStore";

const { user } = useAuthStore();
const isAdmin = user?.roleCode === "AD" || user?.roleId === 1;
const canAccessVenues =
  ["AD", "CR"].includes(user?.roleCode) || [1, 2].includes(user?.roleId);
```

### UI Hiding Strategy

The app uses **"Hide, Don't Disable"** philosophy:

```typescript
// Hide entire sections for unauthorized users
{isAdmin && (
  <div className="admin-controls">
    {/* Admin-only content */}
  </div>
)}

// Filter navigation links
const visibleLinks = links.filter(link =>
  link.roles.includes(user?.roleCode)
);
```

---

## 📡 API Integration

### Base Configuration

```typescript
// services/api/config.ts
export const API_BASE_URL = "http://localhost:8080";
```

### Authentication Header

All API requests include:

```typescript
headers: {
  'X-Actor-Username': user.username,
  'Content-Type': 'application/json'
}
```

### Service Pattern

```typescript
// services/api/courseService.ts
export const courseService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/course/get`, {
      headers: { "X-Actor-Username": username },
    });
    return response.json();
  },
};
```

---

## 🎨 Styling

### CSS Architecture

- **Global Styles**: `index.css` - Design tokens and resets
- **Component Styles**: Co-located with components
- **Responsive**: Mobile-first approach
- **Themes**: Light/Dark mode support

### Design Tokens

```css
:root {
  --primary: #6b2e1e; /* Brick Brown */
  --secondary: #ffd36b; /* Shiny Yellow */
  --text: #fff7f0; /* Off-white */
  --bg: #1a1a1a; /* Dark Background */
}
```

---

## 🧪 Testing

```bash
npm test
```

Launches test runner in watch mode.

---

## 📦 Available Scripts

| Script          | Description                      |
| --------------- | -------------------------------- |
| `npm start`     | Development server (port 3000)   |
| `npm test`      | Run tests                        |
| `npm run build` | Production build                 |
| `npm run eject` | Eject from CRA (⚠️ irreversible) |

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_VERSION=4.0
```

### Proxy (Development)

CORS is handled by backend `@CrossOrigin` annotation. No proxy needed.

---

## 🐛 Troubleshooting

### Common Issues

**1. API Calls Failing**

- Check backend is running on port 8080
- Verify `X-Actor-Username` header is set
- Check CORS configuration in backend

**2. RBAC Not Working**

- Verify user object in Zustand store has `roleCode` and `roleId`
- Check backend returns correct role data in login response

**3. Build Errors**

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

---

## 📚 Key Features

### Pages

- **Dashboard** - Overview and quick actions
- **Timetable** - Generation interface with readiness checklist
- **Settings** - Configuration (Admin-only tabs)
- **Venues** - Physical venue management (AD/CR only)
- **Courses** - Course management (scoped by role)
- **Students** - Student management (scoped by role)
- **Staff** - Staff management (scoped by role)

### Components

- **Sidebar** - Role-filtered navigation
- **Header** - User profile and theme toggle
- **Calendar Grid** - Period exclusion selector
- **Institutional Constraints** - Tabbed constraint editor
- **Pre-Flight Checklist** - Readiness validation

---

## 🚀 Deployment

### Build

```bash
npm run build
```

### Serve

```bash
npx serve -s build -l 3000
```

### Production Checklist

- [ ] Update API_BASE_URL to production backend
- [ ] Enable production optimizations
- [ ] Test all RBAC scenarios
- [ ] Verify responsive design
- [ ] Check accessibility (WCAG AA)

---

## 📝 Notes

- **React Version**: 18.3.1
- **TypeScript**: Enabled
- **State Management**: Zustand (not Redux)
- **Routing**: React Router v6
- **Build Tool**: Create React App

---

**Last Updated:** February 1, 2026  
**Status:** Production Ready ✅
