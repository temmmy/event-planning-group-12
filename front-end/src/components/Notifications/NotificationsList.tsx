import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiCalendar, FiInfo } from "react-icons/fi";
import { API_URL } from "../../config";

interface Notification {
  _id: string;
  type: "reminder" | "update" | "no_response";
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
        return <FiCalendar className="text-blue-500" />;
      case "update":
        return <FiInfo className="text-green-500" />;
      case "no_response":
        return <FiBell className="text-yellow-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <FiBell className="mx-auto text-gray-400 text-4xl mb-2" />
        <p className="text-gray-500">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button
          onClick={markAllAsRead}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <FiCheck className="mr-1" />
          Mark all as read
        </button>
      </div>

      <ul className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {notifications.map((notification) => (
          <li
            key={notification._id}
            className={`p-4 hover:bg-gray-50 transition duration-150 ${
              !notification.isRead ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-1">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-grow">
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    if (notification.event && !notification.isRead) {
                      markAsRead(notification._id);
                    }
                    if (notification.event) {
                      navigateToEvent(notification.event._id);
                    }
                  }}
                >
                  <p
                    className={`text-sm ${
                      !notification.isRead ? "font-semibold" : ""
                    }`}
                  >
                    {notification.message}
                  </p>

                  {notification.event && (
                    <div className="mt-1 text-xs text-gray-500">
                      <p>Event: {notification.event.title}</p>
                      <p>
                        Date:{" "}
                        {new Date(notification.event.date).toLocaleDateString()}{" "}
                        at {notification.event.time}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </div>

              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="flex-shrink-0 ml-2 text-blue-500 hover:text-blue-700"
                  title="Mark as read"
                >
                  <FiCheck />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsList;
