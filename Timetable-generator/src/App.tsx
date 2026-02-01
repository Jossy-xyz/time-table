import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./services/state/authStore";
import { ThemeProvider } from "./context/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-toastify";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import CoursesPage from "./pages/CoursesPage";
import StaffPage from "./pages/StaffPage";
import VenuesPage from "./pages/VenuesPage";
import TimetablePage from "./pages/TimetablePage";
import SettingsPage from "./pages/SettingsPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import MainLayout from "./components/layout/MainLayout";

// Initialize Query Client with deterministic defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Institutional stability over aggressive updates
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes cache for robust academic data
    },
  },
});

/**
 * Protected route wrapper
 */
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? element : <Navigate to="/login" />;
}

/**
 * Main App component with routing and providers
 */
export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              }
            />
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <StudentsPage />
                </MainLayout>
              }
            />
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <CoursesPage />
                </MainLayout>
              }
            />
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <StaffPage />
                </MainLayout>
              }
            />
          }
        />

        <Route
          path="/venues"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <VenuesPage />
                </MainLayout>
              }
            />
          }
        />

        <Route
          path="/timetable"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <TimetablePage />
                </MainLayout>
              }
            />
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <SettingsPage />
                </MainLayout>
              }
            />
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </QueryClientProvider>
  );
}
