import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiInfo,
  FiAlertOctagon,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { API_URL } from "../../config";

interface Notification {
  _id: string;
  type:
    | "reminder"
    | "update"
    | "no_response"
    | "invitation"
    | "join_request"
    | "request_approved"
    | "request_declined";
  message: string;
  isRead: boolean;
  createdAt: string;
  event?: {
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    organizer: {
      username: string;
      email: string;
      profileImage: string;
    };
  };
}

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/notifications`, {
          withCredentials: true,
        });
        setNotifications(response.data);
        setError(null);
      } catch (err) {
        // Handle error with proper type casting
        let errorMessage = "Failed to fetch notifications";

        if (axios.isAxiosError(err) && err.response?.data) {
          // Try to get the error message from the response if available
          const responseData: Record<string, unknown> = err.response.data;
          if (typeof responseData.message === "string") {
            errorMessage = responseData.message;
          }
        }

        setError(errorMessage);
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await axios.put(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          withCredentials: true,
        }
      );

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        {
          withCredentials: true,
        }
      );

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Navigate to event details
  const navigateToEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <FiClock className="text-nord13" />;
      case "update":
        return <FiInfo className="text-nord9" />;
      case "invitation":
        return <FiBell className="text-nord10" />;
      case "join_request":
        return <FiAlertOctagon className="text-nord12" />;
      case "request_approved":
        return <FiCheckCircle className="text-nord14" />;
      case "request_declined":
        return <FiXCircle className="text-nord11" />;
      default:
        return <FiBell className="text-nord3" />;
    }
  };

  // Format date to readable format
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-nord9"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-nord11/10 text-nord11 rounded-md flex items-center">
        <FiAlertOctagon className="mr-3 flex-shrink-0" size={20} />
        <p>{error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-10 text-center text-nord3">
        <FiBell className="mx-auto text-nord5 text-5xl mb-4" />
        <p className="text-lg">No notifications yet</p>
        <p className="text-sm">
          We'll let you know when something new comes up.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center px-6 py-4 border-b border-nord5">
        <h2 className="text-lg font-semibold text-nord1">
          Recent Notifications
        </h2>
        <button
          onClick={markAllAsRead}
          className="text-sm text-nord9 hover:text-nord10 flex items-center"
          disabled={notifications.every((n) => n.isRead)}
        >
          <FiCheck className="mr-1.5" />
          Mark all as read
        </button>
      </div>

      <ul className="divide-y divide-nord5 max-h-[60vh] overflow-y-auto">
        {notifications.map((notification) => (
          <li
            key={notification._id}
            className={`p-4 hover:bg-nord6/50 transition duration-150 cursor-pointer ${
              !notification.isRead ? "bg-nord10/5" : ""
            }`}
            onClick={() => {
              if (notification.event) {
                navigateToEvent(notification.event._id);
              }
              if (!notification.isRead) {
                markAsRead(notification._id);
              }
            }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4 mt-1">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-grow min-w-0">
                <p
                  className={`text-sm text-nord1 ${
                    !notification.isRead ? "font-semibold" : "text-nord2"
                  }`}
                >
                  {notification.message}
                </p>

                {notification.event && (
                  <div className="mt-1 text-xs text-nord3">
                    <p className="truncate">
                      Event: {notification.event.title}
                    </p>
                    <p>
                      Date:{" "}
                      {new Date(notification.event.date).toLocaleDateString()}{" "}
                      at {notification.event.time}
                    </p>
                  </div>
                )}

                <p className="text-xs text-nord3 mt-1">
                  {formatTimeAgo(notification.createdAt)}
                </p>
              </div>

              {!notification.isRead && (
                <div className="ml-2 mt-0.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 bg-nord9 rounded-full"></div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsList;
