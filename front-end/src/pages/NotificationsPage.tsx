import React from "react";
import NotificationsList from "../components/Notifications/NotificationsList";
import { useAppSelector } from "../store/hooks";
import { Navigate } from "react-router-dom";

const NotificationsPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Notifications</h1>
        <NotificationsList />
      </div>
    </div>
  );
};

export default NotificationsPage;
