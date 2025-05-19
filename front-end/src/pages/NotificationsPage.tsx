// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React from "react";
import NotificationsList from "../components/Notifications/NotificationsList";
import { useAppSelector } from "../store/hooks";
import { Navigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";

const NotificationsPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-nord6 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-garamond font-bold text-nord1 mb-8 flex items-center">
          <FiBell className="mr-3 text-nord9" />
          Your Notifications
        </h1>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <NotificationsList />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
