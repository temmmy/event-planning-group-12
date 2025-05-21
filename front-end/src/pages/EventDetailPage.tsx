// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

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
  FiMessageSquare,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiUserPlus,
} from "react-icons/fi";
import {
  formatDate,
  getRelativeTimeDescription,
  formatTime,
} from "../utils/dateUtils";
import InviteUserModal from "../components/Events/InviteUserModal";
import ReminderConfig from "../components/Events/ReminderConfig";
import EventRSVP from "../components/Events/EventRSVP";
import DiscussionBoard from "../components/Discussion/DiscussionBoard";
import JoinRequestButton from "../components/Events/JoinRequestButton";
import JoinRequestsManager from "../components/Events/JoinRequestsManager";

// Nord Color Palette
const nordColors = {
  nord0: "#2E3440", nord1: "#3B4252", nord2: "#434C5E", nord3: "#4C566A",
  nord4: "#D8DEE9", nord5: "#E5E9F0", nord6: "#ECEFF4",
  nord7: "#8FBCBB", nord8: "#88C0D0", nord9: "#81A1C1", nord10: "#5E81AC",
  nord11: "#BF616A", nord12: "#D08770", nord13: "#EBCB8B", nord14: "#A3BE8C", nord15: "#B48EAD",
};

// Custom Invite Button with Nord styling
const InviteButton: React.FC<{ onClick: () => void; className?: string; children?: React.ReactNode }> = ({ onClick, className = "", children }) => (
  <button
    onClick={onClick}
    className={`group inline-flex items-center justify-center px-4 py-2
                bg-gradient-to-t from-nord10 to-nord9 text-white
                shadow-[inset_0px_1px_0px_0px_hsla(207,33%,60%,0.3)]
                hover:from-nord9 hover:to-nord8
                hover:-translate-y-0.5 hover:shadow-lg
                transition-all duration-300 ease-in-out
                rounded-lg text-sm font-medium ${className}`}
  >
    {children || (
      <>
        <FiUserPlus className="mr-2 h-4 w-4" />
        Invite Users
      </>
    )}
  </button>
);

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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  const isOrganizer =
    currentUser &&
    currentEvent &&
    currentEvent.organizer &&
    currentUser.id === currentEvent.organizer._id;

  const isAdmin = currentUser?.role === "admin";
  const canManageEvent = isOrganizer || isAdmin;

  const handleDeleteConfirm = async () => {
    if (!id) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await dispatch(deleteEvent(id)).unwrap();
      navigate("/events", { state: { successMessage: "Event deleted successfully." } });
    } catch (err: any) {
      setDeleteError(err?.message || "An error occurred while deleting the event.");
      setDeleteLoading(false);
    }
  };

  const shareEvent = () => {
    const eventUrl = window.location.href;
    navigator.clipboard.writeText(eventUrl)
      .then(() => {
        setShareFeedback("Event link copied to clipboard!");
        setTimeout(() => setShareFeedback(null), 3000);
      })
      .catch(() => {
        setShareFeedback("Failed to copy link. Please try again.");
        setTimeout(() => setShareFeedback(null), 3000);
      });
  };

  const getStatusStyles = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return { Icon: FiCheckCircle, textColor: "text-nord14", bgColor: "bg-nord14/10", borderColor: "border-nord14/30" };
      case "requested":
        return { Icon: FiAlertTriangle, textColor: "text-nord12", bgColor: "bg-nord12/10", borderColor: "border-nord12/30" };
      case "declined":
        return { Icon: FiXCircle, textColor: "text-nord11", bgColor: "bg-nord11/10", borderColor: "border-nord11/30" };
      default:
        return { Icon: FiUsers, textColor: "text-nord3", bgColor: "bg-nord3/10", borderColor: "border-nord3/30" };
    }
  };

  if (loading === "pending" && !currentEvent) {
    return (
      <div className="min-h-screen bg-nord6 p-6 flex flex-col justify-center items-center text-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-nord9 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-nord1 text-lg font-medium">Loading Event Details...</p>
          <p className="text-nord3 text-sm">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (!currentEvent && loading !== "pending") {
    return (
      <div className="min-h-screen bg-nord6 p-6 flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-xl border border-nord5">
          <FiAlertCircle className="mx-auto text-nord11 mb-5" size={56} />
          <h1 className="text-2xl font-semibold text-nord1 mb-3">Event Not Found</h1>
          <p className="text-nord3 mb-8">
            The event you're looking for doesn't exist, may have been moved, or you might not have permission to view it.
          </p>
          <button
            onClick={() => navigate("/events")}
            className="group px-6 py-3 bg-nord9 text-white rounded-lg hover:bg-nord10 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg font-medium flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2 inline-block transition-transform duration-300 group-hover:-translate-x-1" />
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  if (!currentEvent) return null;

  return (
    <div className="min-h-screen bg-nord6 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/events")}
          className="flex items-center text-nord10 hover:text-nord9 mb-6 md:mb-8 group"
        >
          <FiArrowLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="font-medium text-sm">Back to All Events</span>
        </button>

        {error && (
          <div className="mb-6 p-4 bg-nord11/10 text-nord11 rounded-lg border border-nord11/30 flex items-start">
            <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3 h-5 w-5" />
            <div>
              <p className="font-semibold text-nord0">Error Loading Event Details</p>
              <p className="text-sm text-nord1">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
            </div>
          </div>
        )}
        {shareFeedback && (
          <div className={`fixed top-8 right-8 z-50 p-3 rounded-md shadow-lg text-sm font-medium transition-opacity duration-300 ${shareFeedback.includes("Failed") ? "bg-nord11 text-white" : "bg-nord14 text-nord0"}`}>
            {shareFeedback}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-nord5">
          {/* Cover Image or Background Color */}
          <div
            className="w-full h-56 md:h-72 bg-cover bg-center relative"
            style={{
              backgroundColor: currentEvent.backgroundColor || nordColors.nord8,
              backgroundImage: currentEvent.coverImageUrl ? `url(${currentEvent.coverImageUrl})` : "none",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-nord0/50 via-nord0/20 to-transparent"></div>
            <div className="absolute top-4 right-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-md
                  ${currentEvent.visibility === "private"
                    ? "bg-nord3 text-nord6"
                    : "bg-nord14 text-nord0"
                  }`}
              >
                {currentEvent.visibility === "private" ? "Private Event" : "Public Event"}
              </span>
            </div>

            {canManageEvent && (
              <div className="absolute bottom-4 right-4 flex space-x-2.5">
                {[
                  { to: `/events/${currentEvent._id}/edit`, icon: FiEdit2, label: "Edit Event", color: nordColors.nord9 },
                  { onClick: () => setIsDeleteModalOpen(true), icon: FiTrash2, label: "Delete Event", color: nordColors.nord11 },
                  { onClick: shareEvent, icon: FiShare2, label: "Share Event", color: nordColors.nord10 },
                ].map((action) => (
                  action.to ? (
                    <Link
                      key={action.label}
                      to={action.to}
                      title={action.label}
                      className="flex items-center justify-center p-2.5 bg-nord6/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-nord5 hover:shadow-lg transition-all duration-200"
                      style={{ color: action.color }}
                    >
                      <action.icon size={18} />
                    </Link>
                  ) : (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      title={action.label}
                      className="flex items-center justify-center p-2.5 bg-nord6/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-nord5 hover:shadow-lg transition-all duration-200"
                      style={{ color: action.color }}
                    >
                      <action.icon size={18} />
                    </button>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="p-6 md:p-10">
            {/* Event Header: Icon, Title, Date */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-8">
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg border-4 border-white"
                style={{ backgroundColor: currentEvent.backgroundColor || nordColors.nord7 }}
              >
                {currentEvent.imageUrl && currentEvent.imageUrl !== "/uploads/events/default-event.png" ? (
                  <img src={currentEvent.imageUrl} alt={currentEvent.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl md:text-5xl text-white font-bold">{currentEvent.title.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-grow pt-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1">
                  <h1 className="text-3xl md:text-4xl font-garamond font-bold text-nord1 leading-tight mb-1 sm:mb-0">
                    {currentEvent.title}
                  </h1>
                  <div className="mt-2 sm:mt-0 sm:ml-4 sm:text-right">
                    <div className="inline-flex items-center text-nord10 bg-nord10/10 px-3.5 py-1.5 rounded-full">
                      <FiCalendar className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">{getRelativeTimeDescription(new Date(currentEvent.date))}</span>
                    </div>
                  </div>
                </div>
                <p className="text-nord3 text-base">
                  Organized by:{" "}
                  {currentEvent.organizer?.name ? (
                    <Link to={`/user/${currentEvent.organizer._id}`} className="font-medium text-nord10 hover:underline">
                      {currentEvent.organizer.name}
                    </Link>
                  ) : (
                    <span className="italic text-nord3">Unknown Organizer</span>
                  )}
                </p>
              </div>
            </div>

            {/* Sections Wrapper */}
            <div className="space-y-10">
              {/* Event Details Section */}
              <section>
                <h3 className="text-xl font-semibold text-nord1 mb-4 flex items-center">
                  <FiMapPin className="mr-2.5 h-5 w-5 text-nord9" />
                  Event Information
                </h3>
                <div className="bg-nord6/60 rounded-lg border border-nord5 p-5 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
                    {[
                      { icon: FiCalendar, label: "Date", value: formatDate(new Date(currentEvent.date)) },
                      { icon: FiClock, label: "Time", value: formatTime(currentEvent.time) },
                      { icon: FiMapPin, label: "Location", value: currentEvent.location, fullWidth: currentEvent.location.length > 35 },
                      currentEvent.capacity > 0 && { icon: FiUsers, label: "Capacity", value: `${currentEvent.attendees.length} / ${currentEvent.capacity} spots` },
                    ].filter(Boolean).map((item: any, index) => (
                      <div key={index} className={`flex items-start ${item.fullWidth ? 'sm:col-span-2' : ''}`}>
                        <div className="text-nord9 mt-0.5 mr-3.5 flex-shrink-0 p-2 bg-nord9/10 rounded-full">
                          <item.icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-nord3 font-semibold uppercase tracking-wider">{item.label}</p>
                          <p className="text-nord1 font-medium text-base break-words">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Event Description */}
              <section>
                <h3 className="text-xl font-semibold text-nord1 mb-4 flex items-center">
                  <FiMessageSquare className="mr-2.5 h-5 w-5 text-nord9" />
                  About This Event
                </h3>
                <div className="bg-nord6/60 rounded-lg p-5 md:p-6 border border-nord5 prose prose-sm max-w-none prose-headings:text-nord1 prose-p:text-nord2 prose-a:text-nord10 hover:prose-a:text-nord9">
                  <p className="whitespace-pre-line text-base leading-relaxed">
                    {currentEvent.description || <span className="text-nord3 italic">No description provided for this event.</span>}
                  </p>
                </div>
              </section>

              {/* RSVP Section - Show only if user is invited and is not the organizer */}
              {currentEvent.isUserInvited && !isOrganizer && (
                <section>
                  <h3 className="text-xl font-semibold text-nord1 mb-4 flex items-center">
                    <FiCalendar className="mr-2.5 h-5 w-5 text-nord14" />
                    Your Invitation
                  </h3>
                  <div className="bg-nord6/60 rounded-lg border border-nord5 p-5 md:p-6">
                    <EventRSVP
                      eventId={currentEvent._id}
                      status={currentEvent.userInvitationStatus}
                      displayStyle="both"
                      onSuccess={() => { if (id) { dispatch(fetchEventById(id)); } }}
                    />
                  </div>
                </section>
              )}

              {/* Join Request Button - Show for public events if user is not already involved */}
              {currentEvent.visibility === "public" && currentUser && !isOrganizer && !currentEvent.isUserInvited && (
                <section className="p-5 md:p-6 bg-nord6/60 rounded-lg border border-nord5">
                  <h3 className="font-semibold text-nord1 text-lg mb-2">Interested in Joining?</h3>
                  <p className="text-nord3 mb-5 text-sm">This is a public event. You can request to join, and the organizer will review your submission.</p>
                  <JoinRequestButton
                    eventId={currentEvent._id}
                    eventTitle={currentEvent.title}
                    onSuccess={() => { if (id) { dispatch(fetchEventById(id)); } }}
                    className="w-full sm:w-auto bg-nord14 hover:bg-nord14/80 text-nord0 font-medium"
                  />
                </section>
              )}

              {/* Attendees Section */}
              <section>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
                  <h3 className="text-xl font-semibold text-nord1 flex items-center mb-3 sm:mb-0">
                    <FiUsers className="mr-2.5 h-5 w-5 text-nord9" />
                    Attendees ({currentEvent.attendees.length}
                    {currentEvent.capacity > 0 ? ` / ${currentEvent.capacity}` : " attending"})
                  </h3>
                  {canManageEvent && (
                    <InviteButton onClick={() => setIsInviteModalOpen(true)} />
                  )}
                </div>
                {currentEvent.attendees.length === 0 ? (
                  <div className="text-center flex flex-col items-center py-10 md:py-16 bg-nord6/60 rounded-lg border-2 border-nord5 border-dashed">
                    <FiUsers className="h-12 w-12 text-nord3 mb-4" />
                    <p className="text-nord2 text-lg mb-1">No Attendees Yet</p>
                    <p className="text-nord3 text-sm">
                      {canManageEvent ? "Be the first to invite some people!" : "No one has confirmed their attendance yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentEvent.attendees.map((attendee) => {
                      const { Icon: StatusIcon, textColor, bgColor, borderColor } = getStatusStyles(attendee.status);
                      return (
                        <div
                          key={attendee._id}
                          className={`p-3.5 rounded-lg flex items-center shadow-sm border transition-all duration-300 hover:shadow-md hover:border-nord10/50 ${bgColor} ${borderColor}`}
                        >
                          <div className="w-11 h-11 rounded-full bg-nord8 flex items-center justify-center text-white font-semibold mr-3.5 overflow-hidden flex-shrink-0 border-2 border-white shadow">
                            {attendee.profileImage ? (
                              <img src={attendee.profileImage} alt={attendee.name} className="w-full h-full object-cover" />
                            ) : (
                              attendee.name?.charAt(0).toUpperCase() || '?'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-nord1 truncate text-sm">{attendee.name || "Unknown User"}</p>
                            <p className="text-xs text-nord3 truncate">{attendee.email || "No email"}</p>
                            {attendee.status && (
                              <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${textColor}`}>
                                <StatusIcon className="mr-1 h-3.5 w-3.5" />
                                {attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Join Requests Manager - For organizers and admins */}
              {canManageEvent && currentEvent.attendees.some(att => att.status === "requested") && (
                <section className="border-t border-nord5 pt-8">
                  <h3 className="text-xl font-semibold text-nord1 mb-4 flex items-center">
                    <FiAlertTriangle className="mr-2.5 h-5 w-5 text-nord12" />
                    Manage Join Requests
                  </h3>
                  <JoinRequestsManager
                    eventId={currentEvent._id}
                    requests={currentEvent.attendees.filter((attendee) => attendee.status === "requested")}
                    onSuccess={() => { if (id) { dispatch(fetchEventById(id)); } }}
                  />
                </section>
              )}

              {/* Reminder Configuration Section for Organizers */}
              {isOrganizer && (
                <section className="border-t border-nord5 pt-8">
                  <h3 className="text-xl font-semibold text-nord1 mb-3 flex items-center">
                    <FiClock className="mr-2.5 h-5 w-5 text-nord10" />
                    Event Reminders & Notifications
                  </h3>
                  <p className="text-nord3 mb-6 text-sm leading-relaxed">
                    Configure automatic reminders for attendees. Notify them before the event or remind those who haven't RSVP'd.
                  </p>
                  <ReminderConfig
                    eventId={currentEvent._id}
                    eventDate={currentEvent.date}
                    onSuccess={() => { if (id) { dispatch(fetchEventById(id)); } }}
                  />
                </section>
              )}

              {/* Discussion Board */}
              <section className="border-t border-nord5 pt-8">
                <h3 className="text-xl font-semibold text-nord1 mb-3 flex items-center">
                  <FiMessageSquare className="mr-2.5 h-5 w-5 text-nord7" />
                  Event Discussion
                </h3>
                <p className="text-nord3 mb-6 text-sm leading-relaxed">
                  Engage with other attendees. Ask questions, share your thoughts, or coordinate plans for the event.
                </p>
                {currentEvent._id && <DiscussionBoard eventId={currentEvent._id} />}
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-nord0/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-nord6 rounded-xl shadow-2xl max-w-md w-full p-6 md:p-7 border border-nord3">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-nord1">Confirm Event Deletion</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-nord3 hover:text-nord1 p-1 rounded-full hover:bg-nord4/70 transition-colors">
                <FiX size={20} />
              </button>
            </div>
            {deleteError && (
              <div className="mb-4 p-3 bg-nord11/10 text-nord11 text-sm rounded-md border border-nord11/30">
                {deleteError}
              </div>
            )}
            <p className="mb-6 text-nord2">
              Are you sure you want to permanently delete the event: <br />
              <strong className="text-nord1">{currentEvent.title}</strong>?
              <br />This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 bg-nord4 border border-nord3 text-nord1 rounded-lg hover:bg-nord5 transition-colors text-sm font-medium"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-nord11 text-white rounded-lg hover:bg-nord11/80 flex items-center transition-colors text-sm font-medium"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-1.5 h-4 w-4" />
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
        onSuccess={() => { if (id) { dispatch(fetchEventById(id)); } }}
      />
    </div>
  );
};

export default EventDetailPage;
