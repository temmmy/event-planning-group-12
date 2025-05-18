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
        <div className="animate-spin w-8 h-8 border-4 border-nord9 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-nord1 flex items-center">
            <FiCalendar className="mr-2 text-nord9" />
            Configure Reminders
          </h4>
          <button
            onClick={addReminder}
            className="px-3 py-1 bg-nord9/10 text-nord9 rounded-md flex items-center text-sm hover:bg-nord9/20 transition-colors"
          >
            <FiPlusCircle className="mr-1" />
            Add Reminder
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-nord11/10 text-nord11 rounded-lg flex items-start">
            <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-nord14/10 text-nord14 rounded-lg flex items-start">
            <FiInfo className="mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        {reminders.length === 0 ? (
          <div className="bg-nord6/50 rounded-lg p-4 text-nord3 text-center border border-nord5">
            No reminders configured yet. Add a reminder to notify attendees
            about your event.
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="rounded-lg p-4 bg-nord6/50 border border-nord5"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-nord2 mb-1">
                      Reminder Type
                    </label>
                    <select
                      value={reminder.type}
                      onChange={(e) =>
                        handleChange(reminder.id, "type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-nord5 rounded-md focus:outline-none focus:ring-2 focus:ring-nord9/20 focus:border-nord9 text-nord1 bg-white"
                    >
                      <option value="upcoming">Upcoming Event</option>
                      <option value="confirmation">Request Confirmation</option>
                      <option value="no_response">No Response Reminder</option>
                    </select>
                    <p className="mt-1 text-xs text-nord3">
                      {getReminderTypeDescription(reminder.type)}
                    </p>
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-nord2 mb-1">
                      Send Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={reminder.sendAt}
                      onChange={(e) =>
                        handleChange(reminder.id, "sendAt", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-nord5 rounded-md focus:outline-none focus:ring-2 focus:ring-nord9/20 focus:border-nord9 text-nord1 bg-white"
                      max={
                        reminder.type === "upcoming" ||
                        reminder.type === "no_response"
                          ? eventDateObj.toISOString().substring(0, 16)
                          : undefined
                      }
                    />
                    {(reminder.type === "upcoming" ||
                      reminder.type === "no_response") && (
                      <p className="mt-1 text-xs text-nord3">
                        Must be scheduled before the event
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full md:w-1/4 md:justify-end">
                    <div className="flex-grow md:mr-4">
                      {reminder.sent && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-nord14/20 text-nord14">
                          Already sent
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeReminder(reminder.id)}
                      disabled={reminder.sent}
                      className={`text-nord3 hover:text-nord11 transition-colors ${
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
            className={`px-4 py-2 bg-nord9 text-white rounded-md hover:bg-nord10 transition-colors ${
              saving || reminders.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {saving ? (
              <span className="flex items-center">
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              "Save Reminders"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderConfig;
