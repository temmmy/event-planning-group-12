// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useState, useEffect, useRef } from "react";
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
  FiExternalLink,
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-nord3 rounded-full hover:bg-nord6 focus:outline-none focus:ring-2 focus:ring-nord9/50"
        aria-label="Notifications"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-nord11 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute mt-2 left-4 right-4 sm:left-auto sm:right-0 sm:w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-nord5">
          <div className="flex justify-between items-center px-4 py-3 border-b border-nord5">
            <h3 className="text-md font-semibold text-nord1">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-nord9 hover:text-nord10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={unreadCount === 0}
              >
                <FiCheck className="mr-1" />
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin inline-block w-7 h-7 border-2 border-nord5 border-t-nord9 rounded-full"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-nord3">
              <FiBell className="mx-auto text-nord5 text-4xl mb-3" />
              <p className="text-sm">No notifications yet.</p>
            </div>
          ) : (
            <div className="max-h-[55vh] sm:max-h-96 overflow-y-auto">
              <ul className="divide-y divide-nord5">
                {notifications.slice(0, 15).map((notification) => (
                  <li
                    key={notification._id}
                    className={`hover:bg-nord6/70 transition-colors ${
                      !notification.isRead ? "bg-nord10/5" : ""
                    }`}
                  >
                    <div
                      className="flex items-start p-4 cursor-pointer"
                      onClick={() =>
                        notification.event &&
                        navigateToEvent(
                          notification.event._id,
                          notification._id
                        )
                      }
                    >
                      <div className="flex-shrink-0 mr-3.5 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm text-nord1 leading-snug ${
                            !notification.isRead
                              ? "font-semibold"
                              : "text-nord2"
                          }`}
                        >
                          {notification.message}
                        </p>

                        {notification.event && (
                          <p className="mt-1 text-xs text-nord3 truncate">
                            Event: {notification.event.title}
                          </p>
                        )}

                        <p className="text-xs text-nord3 mt-1.5">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <div className="ml-2 mt-0.5 flex-shrink-0">
                          <div className="w-2 h-2 bg-nord9 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-nord5 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/notifications");
                }}
                className="text-sm text-nord9 hover:text-nord10 font-medium flex items-center justify-center w-full"
              >
                View all notifications
                <FiExternalLink className="ml-1.5" size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
