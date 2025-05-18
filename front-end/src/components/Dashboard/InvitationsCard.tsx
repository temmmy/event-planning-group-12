import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { selectAllEvents } from "../../features/events/eventsSlice";
import { FiMail, FiCalendar, FiChevronRight } from "react-icons/fi";
import { formatDate } from "../../utils/dateUtils";
import EventRSVP from "../Events/EventRSVP";

interface InvitationsCardProps {
  onRSVPChange?: () => void;
  maxItems?: number;
}

const InvitationsCard: React.FC<InvitationsCardProps> = ({
  onRSVPChange,
  maxItems = 3,
}) => {
  const allEvents = useAppSelector(selectAllEvents);

  // Filter events where the user is invited and hasn't responded
  const invitations = allEvents
    .filter(
      (event) => event.isUserInvited && event.userInvitationStatus === "pending"
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get a limited number of invitations to display
  const displayInvitations = invitations.slice(0, maxItems);

  if (invitations.length === 0) {
    return null; // Don't render if there are no invitations
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-yellow-50 flex items-center justify-between">
        <h3 className="font-medium text-yellow-800 flex items-center">
          <FiMail className="mr-2" />
          Pending Invitations
        </h3>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          {invitations.length}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {displayInvitations.map((event) => (
          <div key={event._id} className="p-4">
            <div className="flex items-start mb-3">
              {/* Event icon or image */}
              <div
                className="w-12 h-12 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: event.backgroundColor || "#88c0d0" }}
              >
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  event.title.substring(0, 1).toUpperCase()
                )}
              </div>

              {/* Event details */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/events/${event._id}`}
                  className="font-medium text-nord1 hover:text-nord10 transition-colors"
                >
                  {event.title}
                </Link>
                <p className="text-sm text-nord3 mt-1 flex items-center">
                  <FiCalendar className="mr-1" size={14} />
                  {formatDate(new Date(event.date))} at {event.time}
                </p>
                <p className="text-sm text-nord3 mt-1">
                  Organized by {event.organizer.name}
                </p>
              </div>
            </div>

            {/* RSVP controls */}
            <EventRSVP
              eventId={event._id}
              status="pending"
              onSuccess={onRSVPChange}
            />
          </div>
        ))}
      </div>

      {/* If there are more invitations than we're showing */}
      {invitations.length > maxItems && (
        <Link
          to="/events"
          className="block p-3 text-center text-sm text-nord10 hover:text-nord9 border-t border-gray-100"
        >
          View all invitations ({invitations.length})
          <FiChevronRight className="inline ml-1" />
        </Link>
      )}
    </div>
  );
};

export default InvitationsCard;
