import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiCalendar,
  FiPlusCircle,
  FiTrash2,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { API_URL } from "../../config";

interface Reminder {
  id?: string;
  type: "upcoming" | "confirmation" | "no_response";
  sendAt: string;
  sent: boolean;
}

interface ReminderConfigProps {
  eventId: string;
  eventDate: string;
  onSuccess?: () => void;
}

const ReminderConfig: React.FC<ReminderConfigProps> = ({
  eventId,
  eventDate,
  onSuccess,
}) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper function to generate a temp ID
  const generateTempId = () =>
    `temp-${Math.random().toString(36).substring(2, 9)}`;

  // Convert event date to Date object for validation
  const eventDateObj = new Date(eventDate);

  // Fetch existing reminders
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/events/${eventId}`, {
          withCredentials: true,
        });

        if (response.data && response.data.reminders) {
          setReminders(
            response.data.reminders.map(
              (r: {
                type: "upcoming" | "confirmation" | "no_response";
                sendAt: string;
                sent: boolean;
                _id?: string;
              }) => ({
                ...r,
                id: r._id,
                sendAt: new Date(r.sendAt).toISOString().substring(0, 16),
              })
            )
          );
        }
      } catch (err) {
        console.error("Error fetching reminders:", err);
        setError("Failed to load existing reminders");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchReminders();
    }
  }, [eventId]);

  // Add a new reminder
  const addReminder = () => {
    // Calculate a default time (1 day before event)
    const defaultDate = new Date(eventDateObj);
    defaultDate.setDate(defaultDate.getDate() - 1);

    // Add a new reminder to the list
    setReminders([
      ...reminders,
      {
        id: generateTempId(),
        type: "upcoming",
        sendAt: defaultDate.toISOString().substring(0, 16),
        sent: false,
      },
    ]);
  };

  // Remove a reminder
  const removeReminder = (id: string | undefined) => {
    if (!id) return;
    setReminders(reminders.filter((r) => r.id !== id));
  };

  // Handle field changes for a reminder
  const handleChange = (
    id: string | undefined,
    field: string,
    value: string
  ) => {
    if (!id) return;

    setReminders(
      reminders.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value };
        }
        return r;
      })
    );
  };

  // Save reminders
  const saveReminders = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validate reminders before saving
      for (const reminder of reminders) {
        const reminderDate = new Date(reminder.sendAt);

        // For upcoming and no_response reminders, ensure they are before the event
        if (
          (reminder.type === "upcoming" || reminder.type === "no_response") &&
          reminderDate > eventDateObj
        ) {
          setError(
            `${capitalizeFirstLetter(
              reminder.type
            )} reminders must be scheduled before the event`
          );
          setSaving(false);
          return;
        }
      }
      // Format reminders for the API - removing id property which is not needed by backend
      const formattedReminders = reminders.map(({ ...rest }) => rest);

      // Use the spread operator to exclude the id property
      console.log("Sending reminders configuration:", formattedReminders);

      // Save to the API
      await axios.post(
        `${API_URL}/notifications/events/${eventId}/reminders`,
        {
          reminders: formattedReminders,
        },
        {
          withCredentials: true,
        }
      );

      setSuccess("Reminders saved successfully");

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error saving reminders:", err);
      setError("Failed to save reminders");
    } finally {
      setSaving(false);

      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  // Helper to capitalize first letter
  const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.replace(/_/g, " ").slice(1);
  };

  // Get a human-readable description of the reminder type
  const getReminderTypeDescription = (type: string): string => {
    switch (type) {
      case "upcoming":
        return "Upcoming event reminder";
      case "confirmation":
        return "Attendance confirmation request";
      case "no_response":
        return "Reminder for invited users who haven't responded";
      default:
        return "Event reminder";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4 min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiCalendar className="mr-2 text-blue-500" />
          Event Reminders
        </h3>
        <button
          onClick={addReminder}
          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md flex items-center text-sm hover:bg-blue-100 transition-colors"
        >
          <FiPlusCircle className="mr-1" />
          Add Reminder
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
          <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-start">
          <FiInfo className="mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {reminders.length === 0 ? (
        <div className="bg-gray-50 rounded-md p-4 text-gray-500 text-center">
          No reminders configured yet. Add a reminder to notify attendees about
          your event.
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="border rounded-md p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="w-1/3 pr-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Type
                  </label>
                  <select
                    value={reminder.type}
                    onChange={(e) =>
                      handleChange(reminder.id, "type", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="upcoming">Upcoming Event</option>
                    <option value="confirmation">Request Confirmation</option>
                    <option value="no_response">No Response Reminder</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {getReminderTypeDescription(reminder.type)}
                  </p>
                </div>

                <div className="w-1/3 px-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={reminder.sendAt}
                    onChange={(e) =>
                      handleChange(reminder.id, "sendAt", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    max={
                      reminder.type === "upcoming" ||
                      reminder.type === "no_response"
                        ? eventDateObj.toISOString().substring(0, 16)
                        : undefined
                    }
                  />
                  {(reminder.type === "upcoming" ||
                    reminder.type === "no_response") && (
                    <p className="mt-1 text-xs text-gray-500">
                      Must be scheduled before the event
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end w-1/3 pl-2">
                  <div className="flex-grow">
                    {reminder.sent && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Already sent
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removeReminder(reminder.id)}
                    disabled={reminder.sent}
                    className={`text-gray-400 hover:text-red-500 transition-colors ${
                      reminder.sent ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title={
                      reminder.sent
                        ? "Cannot remove sent reminders"
                        : "Remove reminder"
                    }
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={saveReminders}
          disabled={saving || reminders.length === 0}
          className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            saving || reminders.length === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {saving ? "Saving..." : "Save Reminders"}
        </button>
      </div>
    </div>
  );
};

export default ReminderConfig;
