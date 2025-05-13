import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  checkAuthStatus,
  selectIsAuthenticated,
  selectAppInitialized,
} from "./features/auth/authSlice";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import LoadingScreen from "./components/Common/LoadingScreen";
// Import page components
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
// TODO: Import other pages as they are created (EventsPage, EventDetailPage, etc.)
import "./App.css"; // Keep existing App specific styles

// Placeholder for pages not yet created
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-nord0 text-nord6">
    <h1 className="text-3xl">{title} Page (Placeholder)</h1>
    <p>You are logged in!</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const dispatch = useAppDispatch();
  const appInitialized = useAppSelector(selectAppInitialized);

  // Check auth status on initial load
  useEffect(() => {
    if (!appInitialized) {
      // Only run if not already initialized
      dispatch(checkAuthStatus());
    }
  }, [dispatch, appInitialized]);

  return (
    <>
      {/* Animated Loading Screen */}
      <LoadingScreen isLoading={!appInitialized} />

      {/* Main App */}
      <Router>
        <div className="flex flex-col min-h-screen bg-nord1 text-nord6">
          <Navbar />
          <main className="">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />

              {/* Protected Routes - Example: Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <PlaceholderPage title="Dashboard" />
                  </ProtectedRoute>
                }
              />

              {/* Default Route - Always redirect to login page */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Add other routes here */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </>
  );
}

export default App;
