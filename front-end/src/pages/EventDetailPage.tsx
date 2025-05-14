import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchEventById,
  deleteEvent,
  selectEvent,
  selectEventById,
  selectEventsLoading,
  selectEventsError,
} from "../features/events/eventsSlice";
import { selectUser } from "../features/auth/authSlice";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiShare2,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";
import { formatDate, getRelativeTimeDescription } from "../utils/dateUtils";
import InviteUserModal, {
  InviteButton,
} from "../components/Events/InviteUserModal";
import ReminderConfig from "../components/Events/ReminderConfig";

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const event = useAppSelector(selectEvent);
  const eventFromList = useAppSelector((state) =>
    selectEventById(state, id || "")
  );
  const currentEvent = event || (id ? eventFromList : null);
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);
  const currentUser = useAppSelector(selectUser);

  // Delete event state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  // Check if current user is the organizer or admin
  const isOrganizer =
    currentUser &&
    currentEvent &&
    currentUser.id === currentEvent.organizer._id;

  const isAdmin = currentUser?.role === "admin";
  const canManageEvent = isOrganizer || isAdmin;

  // Handle delete event
  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await dispatch(deleteEvent(id)).unwrap();
      navigate("/events");
    } catch (err) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("An error occurred while deleting the event");
      }
      setDeleteLoading(false);
    }
  };

  // Copy event link to clipboard
  const shareEvent = () => {
    const eventUrl = window.location.href;
    navigator.clipboard
      .writeText(eventUrl)
      .then(() => {
        alert("Event link copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy link. Please try again.");
      });
  };

  // If still loading the event
  if (loading === "pending" && !currentEvent) {
    return (
      <div className="min-h-screen bg-nord6 p-6 flex justify-center items-center">
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-nord9"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-nord10 text-xl">Loading event...</p>
        </div>
      </div>
    );
  }

  // If event not found
  if (!currentEvent && loading !== "pending") {
    return (
      <div className="min-h-screen bg-nord6 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center text-nord3 hover:text-nord10 mb-8"
          >
            <FiArrowLeft className="mr-2" />
            Back to events
          </button>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FiAlertCircle className="mx-auto text-nord11 mb-4" size={48} />
            <h1 className="text-2xl font-medium text-nord1 mb-2">
              Event not found
            </h1>
            <p className="text-nord3 mb-6">
              The event you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <button
              onClick={() => navigate("/events")}
              className="px-4 py-2 bg-nord9 text-white rounded-lg hover:bg-nord10 transition-colors"
            >
              Return to events
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentEvent) return null;

  return (
    <div className="min-h-screen bg-nord6 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/events")}
          className="flex items-center text-nord3 hover:text-nord10 mb-6 md:mb-8"
        >
          <FiArrowLeft className="mr-2" />
          Back to events
        </button>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex">
            <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3" size={18} />
            <div>
              <p className="font-medium">Error loading event</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Cover Image or Background Color */}
          <div
            className="w-full h-48 md:h-64 bg-cover bg-center relative"
            style={{
              backgroundColor: currentEvent.backgroundColor || "#eceff4",
              backgroundImage: currentEvent.coverImageUrl
                ? `url(${currentEvent.coverImageUrl})`
                : "none",
            }}
          >
            {/* Visibility Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    currentEvent.visibility === "private"
                      ? "bg-nord3 text-white"
                      : "bg-nord14 text-white"
                  }
                `}
              >
                {currentEvent.visibility === "private" ? "Private" : "Public"}
              </span>
            </div>

            {/* Action Buttons for Organizer */}
            {canManageEvent && (
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Link
                  to={`/events/${currentEvent._id}/edit`}
                  className="flex items-center justify-center p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                >
                  <FiEdit2 className="text-nord9" />
                </Link>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center justify-center p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                >
                  <FiTrash2 className="text-nord11" />
                </button>
                <button
                  onClick={shareEvent}
                  className="flex items-center justify-center p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                >
                  <FiShare2 className="text-nord9" />
                </button>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Event Image */}
              <div className="md:mr-6 mb-4 md:mb-0 flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-lg bg-nord8 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: currentEvent.backgroundColor || "#88c0d0",
                  }}
                >
                  {currentEvent.imageUrl ? (
                    <img
                      src={currentEvent.imageUrl}
                      alt={currentEvent.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-white">
                      {currentEvent.title.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Event Title and Date */}
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h1 className="text-3xl md:text-4xl font-garamond font-bold text-nord1 leading-tight">
                    {currentEvent.title}
                  </h1>

                  <div className="mt-2 md:mt-0 md:ml-4 md:text-right">
                    <div className="inline-flex items-center text-nord10 bg-nord10/10 px-3 py-1 rounded-full">
                      <FiCalendar className="mr-2" />
                      <span className="text-sm font-medium">
                        {getRelativeTimeDescription(
                          new Date(currentEvent.date)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Details Grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date */}
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-nord9">
                      <FiCalendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-nord3 font-medium">Date</p>
                      <p className="text-nord1">
                        {formatDate(new Date(currentEvent.date))}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-nord9">
                      <FiClock size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-nord3 font-medium">Time</p>
                      <p className="text-nord1">{currentEvent.time}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-nord9">
                      <FiMapPin size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-nord3 font-medium">Location</p>
                      <p className="text-nord1">{currentEvent.location}</p>
                    </div>
                  </div>
                </div>

                {/* Capacity if available */}
                {currentEvent.capacity > 0 && (
                  <div className="mt-4 flex items-start">
                    <div className="mt-1 mr-3 text-nord9">
                      <FiUsers size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-nord3 font-medium">Capacity</p>
                      <p className="text-nord1">
                        {currentEvent.attendees.length} /{" "}
                        {currentEvent.capacity} attendees
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Description */}
            <div className="mt-8 prose prose-nord max-w-none">
              <h3 className="text-xl font-medium text-nord1 mb-3">
                Description
              </h3>
              <div className="bg-nord6/50 rounded-lg p-4 border border-nord5">
                <p className="whitespace-pre-line">
                  {currentEvent.description}
                </p>
              </div>
            </div>

            {/* Attendees Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-nord1 mb-4 flex items-center">
                <FiUsers className="mr-2" />
                Attendees ({currentEvent.attendees.length}/{" "}
                {currentEvent.capacity > 0
                  ? currentEvent.capacity
                  : "Unlimited"}
                )
              </h3>

              {/* No attendees placeholder */}
              {currentEvent.attendees.length === 0 ? (
                <div className="text-center py-8 bg-nord6/50 rounded-lg border border-nord5">
                  <p className="text-nord3">
                    No one has joined this event yet.
                  </p>
                  {canManageEvent && (
                    <InviteButton onClick={() => setIsInviteModalOpen(true)} />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentEvent.attendees.map((attendee) => (
                    <div
                      key={attendee._id}
                      className="p-3 bg-nord6 rounded-lg flex items-center"
                    >
                      {/* Attendee avatar */}
                      <div className="w-10 h-10 rounded-full bg-nord9 flex items-center justify-center text-white font-semibold mr-3 overflow-hidden">
                        {attendee.profileImage ? (
                          <img
                            src={attendee.profileImage}
                            alt={attendee.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          attendee.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Attendee info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-nord1 truncate">
                          {attendee.name}
                        </p>
                        <p className="text-xs text-nord3 truncate">
                          {attendee.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invite button for organizer or admin when there are already attendees */}
              {currentEvent.attendees.length > 0 && canManageEvent && (
                <div className="mt-4 flex justify-end">
                  <InviteButton onClick={() => setIsInviteModalOpen(true)} />
                </div>
              )}
            </div>

            {/* Reminder Configuration Section for Organizers */}
            {isOrganizer && (
              <div className="mt-8 border-t border-gray-100 pt-8">
                <h3 className="text-xl font-semibold text-nord1 mb-4">
                  Event Notifications
                </h3>
                <p className="text-nord3 mb-6">
                  Set up automatic reminders for attendees. You can schedule
                  notifications before the event or send reminders to people who
                  haven't responded to your invitation.
                </p>
                <ReminderConfig
                  eventId={currentEvent._id}
                  eventDate={currentEvent.date}
                  onSuccess={() => {
                    // Refresh event data on successful reminder configuration
                    if (id) {
                      dispatch(fetchEventById(id));
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-nord1">Delete Event</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-nord3 hover:text-nord0"
              >
                <FiX size={24} />
              </button>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {deleteError}
              </div>
            )}

            <p className="mb-6 text-nord2">
              Are you sure you want to delete{" "}
              <span className="font-medium">{currentEvent.title}</span>? This
              action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-nord3 rounded-lg hover:bg-gray-50"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-nord11 text-white rounded-lg hover:bg-red-600 flex items-center"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" />
                    Delete Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      <InviteUserModal
        eventId={id || ""}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          // Refresh event data
          if (id) {
            dispatch(fetchEventById(id));
          }
        }}
      />
    </div>
  );
};

export default EventDetailPage;
