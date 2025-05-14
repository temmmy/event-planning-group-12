import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectUser } from "../features/auth/authSlice";

const AdminDashboardPage: React.FC = () => {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  
  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  // Sample admin stats (in a real app, these would come from API calls)
  const stats = {
    totalUsers: 127,
    totalEvents: 45,
    activeEvents: 23,
    completedEvents: 22,
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-nord0">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-nord9 text-nord0 p-4 rounded shadow">
          <h3 className="font-bold text-lg">Total Users</h3>
          <p className="text-3xl font-semibold">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-nord7 text-nord0 p-4 rounded shadow">
          <h3 className="font-bold text-lg">Total Events</h3>
          <p className="text-3xl font-semibold">{stats.totalEvents}</p>
        </div>
        
        <div className="bg-nord8 text-nord0 p-4 rounded shadow">
          <h3 className="font-bold text-lg">Active Events</h3>
          <p className="text-3xl font-semibold">{stats.activeEvents}</p>
        </div>
        
        <div className="bg-nord14 text-nord0 p-4 rounded shadow">
          <h3 className="font-bold text-lg">Completed Events</h3>
          <p className="text-3xl font-semibold">{stats.completedEvents}</p>
        </div>
      </div>
      
      {/* Admin Actions */}
      <h2 className="text-xl font-semibold text-nord10 mb-4">Admin Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/settings"
          className="bg-nord6 hover:bg-nord5 text-nord0 p-4 rounded shadow flex items-center"
        >
          <div className="w-10 h-10 bg-nord9 rounded-full flex items-center justify-center mr-3 text-nord0">
            <span className="text-lg">⚙️</span>
          </div>
          <div>
            <h3 className="font-bold">System Settings</h3>
            <p className="text-sm text-nord3">Configure system-wide parameters</p>
          </div>
        </Link>
        
        <Link
          to="/admin/users"
          className="bg-nord6 hover:bg-nord5 text-nord0 p-4 rounded shadow flex items-center"
        >
          <div className="w-10 h-10 bg-nord10 rounded-full flex items-center justify-center mr-3 text-nord0">
            <span className="text-lg">👥</span>
          </div>
          <div>
            <h3 className="font-bold">User Management</h3>
            <p className="text-sm text-nord3">View and manage user accounts</p>
          </div>
        </Link>
        
        <Link
          to="/admin/events"
          className="bg-nord6 hover:bg-nord5 text-nord0 p-4 rounded shadow flex items-center"
        >
          <div className="w-10 h-10 bg-nord7 rounded-full flex items-center justify-center mr-3 text-nord0">
            <span className="text-lg">📅</span>
          </div>
          <div>
            <h3 className="font-bold">Event Management</h3>
            <p className="text-sm text-nord3">Moderate and manage all events</p>
          </div>
        </Link>
        
        <Link
          to="/admin/reports"
          className="bg-nord6 hover:bg-nord5 text-nord0 p-4 rounded shadow flex items-center"
        >
          <div className="w-10 h-10 bg-nord13 rounded-full flex items-center justify-center mr-3 text-nord0">
            <span className="text-lg">📊</span>
          </div>
          <div>
            <h3 className="font-bold">Reports & Analytics</h3>
            <p className="text-sm text-nord3">View system usage statistics</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;