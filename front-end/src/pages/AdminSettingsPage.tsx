import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchSettings,
  updateSettings,
  selectSettings,
  selectSettingsLoading,
  selectSettingsError,
  SystemSettings,
} from "../features/settings/settingsSlice";
import { selectUser } from "../features/auth/authSlice";
import adminSvg from "../assets/admin.svg";

// Admin role check for UI elements
const useIsAdmin = () => {
  const user = useAppSelector(selectUser);
  return user?.role === "admin";
};

const AdminSettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const loading = useAppSelector(selectSettingsLoading);
  const error = useAppSelector(selectSettingsError);
  const isAdmin = useIsAdmin();

  const [formData, setFormData] = useState<Partial<SystemSettings>>({
    maxActiveEventsPerUser: 5,
    maxInvitationsPerEvent: 100,
    maxFileUploadSize: 10,
    allowedFileTypes: [],
    defaultReminderTimes: {
      beforeEvent: 24,
      forNonResponders: 48,
    },
  });

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("eventLimits");

  // Load settings on component mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        maxActiveEventsPerUser: settings.maxActiveEventsPerUser,
        maxInvitationsPerEvent: settings.maxInvitationsPerEvent,
        maxFileUploadSize: settings.maxFileUploadSize,
        allowedFileTypes: [...settings.allowedFileTypes],
        defaultReminderTimes: {
          beforeEvent: settings.defaultReminderTimes.beforeEvent,
          forNonResponders: settings.defaultReminderTimes.forNonResponders,
        },
      });
    }
  }, [settings]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData({ ...formData, [name]: parseInt(value, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle reminder time changes
  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      defaultReminderTimes: {
        ...formData.defaultReminderTimes!,
        [name]: parseInt(value, 10),
      },
    });
  };

  // Handle allowed file types
  const handleFileTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const fileTypes = value.split(",").map((type) => type.trim().toLowerCase());

    setFormData({
      ...formData,
      allowedFileTypes: fileTypes,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      return; // Prevent non-admins from submitting
    }

    try {
      await dispatch(updateSettings(formData)).unwrap();
      setSuccessMessage("Settings updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  if (loading === "pending" && !settings) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-nord6">
        <div className="text-nord10 text-xl font-medium">
          <span className="inline-block animate-spin mr-2">⚙️</span>
          Loading settings...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nord6 p-4 md:p-8">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden p-8">
          <div className="text-center">
            <div className="text-nord11 text-5xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-nord1 mb-4">
              Unauthorized Access
            </h1>
            <p className="text-nord3 mb-6">
              You don't have permission to access this page. This section is
              restricted to administrators.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-nord10 hover:bg-nord9 text-white font-medium rounded-lg transition-colors duration-300"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nord6 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-nord10 to-nord9 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <p className="text-nord6/80 text-sm font-medium mb-1 uppercase tracking-wider">
                Admin Control Panel
              </p>
              <h1 className="font-garamond text-3xl md:text-4xl font-bold text-white">
                System <span className="text-nord6">Settings</span>
              </h1>
            </div>

            {settings?.updatedAt && (
              <div className="mt-4 md:mt-0 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-nord6/90 text-sm">
                Last updated: {new Date(settings.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row">
          {/* Form Section */}
          <div className="p-6 md:p-8 md:w-3/5">
            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center">
                <span className="mr-2">✅</span>
                {successMessage}
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveSection("eventLimits")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeSection === "eventLimits"
                    ? "text-nord10 border-b-2 border-nord10"
                    : "text-nord3 hover:text-nord10"
                }`}
              >
                Event Limits
              </button>
              <button
                onClick={() => setActiveSection("fileUpload")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeSection === "fileUpload"
                    ? "text-nord10 border-b-2 border-nord10"
                    : "text-nord3 hover:text-nord10"
                }`}
              >
                File Uploads
              </button>
              <button
                onClick={() => setActiveSection("notifications")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeSection === "notifications"
                    ? "text-nord10 border-b-2 border-nord10"
                    : "text-nord3 hover:text-nord10"
                }`}
              >
                Notifications
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Event Limits Section */}
              <div
                className={activeSection === "eventLimits" ? "block" : "hidden"}
              >
                <div className="bg-nord8/10 p-6 rounded-xl">
                  <h2 className="text-xl font-semibold text-nord1 mb-6 flex items-center">
                    <span className="mr-2">📅</span> Event Limits
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="maxActiveEventsPerUser"
                        className="block mb-2 text-sm font-medium text-nord2"
                      >
                        Maximum Active Events Per User
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="maxActiveEventsPerUser"
                          name="maxActiveEventsPerUser"
                          min="1"
                          className="w-full p-3 pr-12 rounded-lg bg-white text-nord1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={formData.maxActiveEventsPerUser}
                          onChange={handleInputChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-nord3 pointer-events-none">
                          events
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-nord3">
                        Maximum number of active events a user can create at
                        once
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="maxInvitationsPerEvent"
                        className="block mb-2 text-sm font-medium text-nord2"
                      >
                        Maximum Invitations Per Event
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="maxInvitationsPerEvent"
                          name="maxInvitationsPerEvent"
                          min="1"
                          className="w-full p-3 pr-12 rounded-lg bg-white text-nord1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={formData.maxInvitationsPerEvent}
                          onChange={handleInputChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-nord3 pointer-events-none">
                          people
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-nord3">
                        Maximum number of invitations that can be sent for a
                        single event
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload Settings */}
              <div
                className={activeSection === "fileUpload" ? "block" : "hidden"}
              >
                <div className="bg-nord7/10 p-6 rounded-xl">
                  <h2 className="text-xl font-semibold text-nord1 mb-6 flex items-center">
                    <span className="mr-2">📁</span> File Upload Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="maxFileUploadSize"
                        className="block mb-2 text-sm font-medium text-nord2"
                      >
                        Maximum File Upload Size
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="maxFileUploadSize"
                          name="maxFileUploadSize"
                          min="1"
                          className="w-full p-3 pr-12 rounded-lg bg-white text-nord1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={formData.maxFileUploadSize}
                          onChange={handleInputChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-nord3 pointer-events-none">
                          MB
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-nord3">
                        Maximum file size users can upload (in megabytes)
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="allowedFileTypes"
                        className="block mb-2 text-sm font-medium text-nord2"
                      >
                        Allowed File Types
                      </label>
                      <input
                        type="text"
                        id="allowedFileTypes"
                        name="allowedFileTypes"
                        className="w-full p-3 rounded-lg bg-white text-nord1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10"
                        value={formData.allowedFileTypes?.join(", ")}
                        onChange={handleFileTypeChange}
                        placeholder="jpg, png, pdf, docx"
                      />
                      <p className="mt-1 text-xs text-nord3">
                        Comma-separated list of allowed file extensions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div
                className={
                  activeSection === "notifications" ? "block" : "hidden"
                }
              >
                <div className="bg-nord9/10 p-6 rounded-xl">
                  <h2 className="text-xl font-semibold text-nord1 mb-6 flex items-center">
                    <span className="mr-2">🔔</span> Notification Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="beforeEvent"
                        className="block mb-2 text-sm font-medium text-nord2"
                      >
                        Default Reminder Before Event
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="beforeEvent"
                          name="beforeEvent"
                          min="1"
                          className="w-full p-3 pr-12 rounded-lg bg-white text-nord1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={formData.defaultReminderTimes?.beforeEvent}
                          onChange={handleReminderChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-nord3 pointer-events-none">
                          hours
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-nord3">
                        How many hours before an event should we send reminders
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="forNonResponders"
                        className="block mb-2 text-sm font-medium text-nord2"
                      >
                        Reminder for Non-Responders
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="forNonResponders"
                          name="forNonResponders"
                          min="1"
                          className="w-full p-3 pr-12 rounded-lg bg-white text-nord1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={
                            formData.defaultReminderTimes?.forNonResponders
                          }
                          onChange={handleReminderChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-nord3 pointer-events-none">
                          hours
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-nord3">
                        How many hours before an event to remind people who
                        haven't responded
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-nord10 hover:bg-nord9 text-white font-medium rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center"
                  disabled={loading === "pending"}
                >
                  {loading === "pending" ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⚙️</span>
                      Saving...
                    </>
                  ) : (
                    <>Save Settings</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Image Section */}
          <div className="p-4 flex justify-center items-center bg-nord5 md:w-2/5 border-t md:border-t-0 md:border-l border-nord4">
            <div className="relative w-full max-w-md">
              <img
                src={adminSvg}
                alt="Admin Settings"
                className="w-full h-auto object-contain rounded-lg border-2 border-nord9/20 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
