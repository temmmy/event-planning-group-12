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
      <div className="flex justify-center items-center min-h-screen bg-nord0">
        <div className="text-nord6 text-xl">Loading settings...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-nord0 text-nord6 p-8">
        <div className="max-w-4xl mx-auto bg-nord1 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-nord8 mb-4">
            Unauthorized Access
          </h1>
          <p>
            You do not have permission to view this page. This page is
            restricted to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nord0 text-nord6 p-8">
      <div className="max-w-4xl mx-auto bg-nord1 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-nord8 mb-6">System Settings</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Limits Section */}
            <div className="bg-nord2 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-nord7 mb-4">
                Event Limits
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="maxActiveEventsPerUser"
                  className="block mb-2 text-nord4"
                >
                  Max Active Events Per User
                </label>
                <input
                  type="number"
                  id="maxActiveEventsPerUser"
                  name="maxActiveEventsPerUser"
                  min="1"
                  className="w-full p-2 rounded bg-nord3 text-nord6 border border-nord4 focus:outline-none focus:ring-2 focus:ring-nord8"
                  value={formData.maxActiveEventsPerUser}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="maxInvitationsPerEvent"
                  className="block mb-2 text-nord4"
                >
                  Max Invitations Per Event
                </label>
                <input
                  type="number"
                  id="maxInvitationsPerEvent"
                  name="maxInvitationsPerEvent"
                  min="1"
                  className="w-full p-2 rounded bg-nord3 text-nord6 border border-nord4 focus:outline-none focus:ring-2 focus:ring-nord8"
                  value={formData.maxInvitationsPerEvent}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* File Upload Settings */}
            <div className="bg-nord2 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-nord7 mb-4">
                File Upload Settings
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="maxFileUploadSize"
                  className="block mb-2 text-nord4"
                >
                  Max File Upload Size (MB)
                </label>
                <input
                  type="number"
                  id="maxFileUploadSize"
                  name="maxFileUploadSize"
                  min="1"
                  className="w-full p-2 rounded bg-nord3 text-nord6 border border-nord4 focus:outline-none focus:ring-2 focus:ring-nord8"
                  value={formData.maxFileUploadSize}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="allowedFileTypes"
                  className="block mb-2 text-nord4"
                >
                  Allowed File Types (comma separated)
                </label>
                <input
                  type="text"
                  id="allowedFileTypes"
                  name="allowedFileTypes"
                  className="w-full p-2 rounded bg-nord3 text-nord6 border border-nord4 focus:outline-none focus:ring-2 focus:ring-nord8"
                  value={formData.allowedFileTypes?.join(", ")}
                  onChange={handleFileTypeChange}
                  placeholder="jpg, png, pdf, docx"
                />
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-nord2 p-4 rounded-lg col-span-1 md:col-span-2">
              <h2 className="text-xl font-semibold text-nord7 mb-4">
                Notification Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="beforeEvent"
                    className="block mb-2 text-nord4"
                  >
                    Default Reminder Before Event (hours)
                  </label>
                  <input
                    type="number"
                    id="beforeEvent"
                    name="beforeEvent"
                    min="1"
                    className="w-full p-2 rounded bg-nord3 text-nord6 border border-nord4 focus:outline-none focus:ring-2 focus:ring-nord8"
                    value={formData.defaultReminderTimes?.beforeEvent}
                    onChange={handleReminderChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="forNonResponders"
                    className="block mb-2 text-nord4"
                  >
                    Reminder for Non-Responders (hours)
                  </label>
                  <input
                    type="number"
                    id="forNonResponders"
                    name="forNonResponders"
                    min="1"
                    className="w-full p-2 rounded bg-nord3 text-nord6 border border-nord4 focus:outline-none focus:ring-2 focus:ring-nord8"
                    value={formData.defaultReminderTimes?.forNonResponders}
                    onChange={handleReminderChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-nord10 hover:bg-nord9 text-white font-medium rounded-md transition-colors duration-300"
              disabled={loading === "pending"}
            >
              {loading === "pending" ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>

        {/* Last Updated Information */}
        {settings?.updatedAt && (
          <div className="mt-6 text-sm text-nord4">
            Last updated: {new Date(settings.updatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
