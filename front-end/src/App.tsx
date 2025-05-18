import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  checkAuthStatus,
  selectIsAuthenticated,
  selectAppInitialized,
  selectUser,
  selectAuthLoading,
} from "./features/auth/authSlice";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import LoadingScreen from "./components/Common/LoadingScreen";
// Import page components
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminEventStatisticsPage from "./pages/AdminEventStatisticsPage";
import EventsPage from "./pages/EventsPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import EventDetailPage from "./pages/EventDetailPage";
import NotificationsPage from "./pages/NotificationsPage";
// Debug component (only used in development)
import SessionDebugger from "./components/Debug/SessionDebugger";
// TODO: Import other pages as they are created (EventsPage, EventDetailPage, etc.)
import "./App.css"; // Keep existing App specific styles

// Environment check
const isDevelopment = import.meta.env.MODE === "development";

// Placeholder for pages not yet created - REMOVED
/*
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-nord0 text-nord6">
    <h1 className="text-3xl">{title} Page (Placeholder)</h1>
    <p>You are logged in!</p>
  </div>
);
*/

// Protected Route Component with built-in loading state
const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const appInitialized = useAppSelector(selectAppInitialized);
  const location = useLocation();

  // Wait for auth check to complete before making a routing decision
  if (!appInitialized) {
    return null; // Return nothing while checking auth, LoadingScreen is shown at App level
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin Route Component with built-in loading state
const AdminRoute = ({ children }: { children: React.JSX.Element }) => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const appInitialized = useAppSelector(selectAppInitialized);
  const location = useLocation();

  // Wait for auth check to complete before making a routing decision
  if (!appInitialized) {
    return null; // Return nothing while checking auth, LoadingScreen is shown at App level
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin") {
    // Redirect to events page if authenticated but not admin
    return <Navigate to="/events" state={{ from: location }} replace />;
  }

  return children;
};

// OrganizerOrAdmin Route Component
const OrganizerOrAdminRoute = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const appInitialized = useAppSelector(selectAppInitialized);
  const location = useLocation();

  if (!appInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin" && user?.role !== "organizer") {
    // Redirect to events page if authenticated but not admin or organizer
    return <Navigate to="/events" state={{ from: location }} replace />;
  }

  return children;
};

// Handle Login Success and Admin Redirect
const LoginSuccessHandler = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // If user is an admin, redirect to admin settings page
      if (user?.role === "admin") {
        navigate("/admin/settings", { replace: true });
      } else {
        // Otherwise redirect to events page
        navigate("/events", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return null;
};

function App() {
  const dispatch = useAppDispatch();
  const appInitialized = useAppSelector(selectAppInitialized);
  const authLoading = useAppSelector(selectAuthLoading);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Check auth status on initial load
  useEffect(() => {
    if (!appInitialized) {
      // Only run if not already initialized
      dispatch(checkAuthStatus());
    }
  }, [dispatch, appInitialized]);

  // Set initial load complete after auth check and a minimum duration
  useEffect(() => {
    if (appInitialized && !initialLoadComplete) {
      // Use a longer minimum animation duration for loading screen
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 1200); // Longer minimum loading time to ensure animation completes

      return () => clearTimeout(timer);
    }
  }, [appInitialized, initialLoadComplete]);

  // Use a more reliable approach to determine when to show loading screen
  const showLoadingScreen = !appInitialized || !initialLoadComplete;

  return (
    <>
      {/* Keep loading screen outside of Router to prevent routing during transitions */}
      <LoadingScreen isLoading={showLoadingScreen} />

      {!showLoadingScreen && (
        <Router>
          <div className="flex flex-col min-h-screen bg-nord1 text-nord6">
            <Navbar />
            <main className="flex-grow">
              {/* Show loading overlay during subsequent auth operations if needed */}
              {authLoading === "pending" && initialLoadComplete && (
                <div className="fixed inset-0 bg-nord0 bg-opacity-50 z-40 flex items-center justify-center">
                  <div className="animate-pulse text-nord6">Loading...</div>
                </div>
              )}

              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/auth-success" element={<LoginSuccessHandler />} />

                {/* Protected Routes - Example: Dashboard - REMOVED */}
                {/*
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <PlaceholderPage title="Dashboard" />
                    </ProtectedRoute>
                  }
                />
                */}

                {/* Event Routes */}
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/create"
                  element={
                    <OrganizerOrAdminRoute>
                      <CreateEventPage />
                    </OrganizerOrAdminRoute>
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoute>
                      <EventDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditEventPage />
                    </ProtectedRoute>
                  }
                />

                {/* Notifications Route */}
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/settings"
                  element={
                    <AdminRoute>
                      <AdminSettingsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/statistics"
                  element={
                    <AdminRoute>
                      <AdminEventStatisticsPage />
                    </AdminRoute>
                  }
                />

                {/* Default Route - Redirect based on authentication */}
                <Route
                  path="/"
                  element={<Navigate to="/auth-success" replace />}
                />

                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
            <Footer />

            {/* Include session debugger only in development */}
            {isDevelopment && <SessionDebugger />}
          </div>
        </Router>
      )}
    </>
  );
}

export default App;
