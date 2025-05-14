import React, { useState, useEffect, useRef } from "react";
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
  };
}

const NotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/notifications`, {
        withCredentials: true,
      });
      setNotifications(response.data);

      // Count unread notifications
      const unread = response.data.filter(
        (notification: Notification) => !notification.isRead
      ).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every minute
    const interval = setInterval(() => {
      if (!isOpen) {
        // Only refresh when dropdown is closed
        fetchNotifications();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark notification as read
  const markAsRead = async (id: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

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
        prevNotifications.map((notification) => {
          if (notification._id === id) {
            return { ...notification, isRead: true };
          }
          return notification;
        })
      );

      // Update unread count
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (event: React.MouseEvent) => {
    event.stopPropagation();
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

      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Navigate to event details
  const navigateToEvent = (eventId: string, notificationId: string) => {
    if (!eventId) return;

    // Mark as read first if not already read
    const notification = notifications.find((n) => n._id === notificationId);
    if (notification && !notification.isRead) {
      markAsRead(notificationId);
    }

    setIsOpen(false);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none"
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="text-sm font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No notifications
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <ul className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notification) => (
                  <li
                    key={notification._id}
                    className={`p-3 hover:bg-gray-50 ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div
                      className="flex cursor-pointer"
                      onClick={() =>
                        notification.event &&
                        navigateToEvent(
                          notification.event._id,
                          notification._id
                        )
                      }
                    >
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            !notification.isRead ? "font-medium" : ""
                          } text-gray-900 truncate`}
                        >
                          {notification.message}
                        </p>
                        {notification.event && (
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.event.title} -{" "}
                            {new Date(
                              notification.event.date
                            ).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <button
                          onClick={(e) => markAsRead(notification._id, e)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                          title="Mark as read"
                        >
                          <FiCheck />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {notifications.length > 10 && (
                <div className="p-2 text-center border-t">
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/notifications");
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
