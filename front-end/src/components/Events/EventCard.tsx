import React from "react";
import { Link } from "react-router-dom";
import { Event } from "../../features/events/eventsSlice";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { formatDate } from "../../utils/dateUtils";

interface EventCardProps {
  event: Event;
  isCompact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isCompact = false }) => {
  // Get background color, default to nord8 if not set
  const backgroundColor = event.backgroundColor || "#88c0d0"; // Nord8 color by default

  // Format date for display
  const formattedDate = formatDate(new Date(event.date));

  if (isCompact) {
    // Compact card for dashboard grid view
    return (
      <Link
        to={`/events/${event._id}`}
        className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      >
        <div
          className="h-32 relative"
          style={{
            backgroundColor,
            backgroundImage: event.coverImageUrl
              ? `url(${event.coverImageUrl})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Event visibility badge */}
          <div className="absolute top-2 right-2">
            {event.visibility === "private" ? (
              <span className="bg-white/90 text-nord3 rounded-full px-2 py-1 text-xs flex items-center">
                <FiEyeOff size={12} className="mr-1" /> Private
              </span>
            ) : (
              <span className="bg-white/90 text-nord3 rounded-full px-2 py-1 text-xs flex items-center">
                <FiEye size={12} className="mr-1" /> Public
              </span>
            )}
          </div>

          {/* Event image */}
          {event.imageUrl && (
            <div className="absolute -bottom-6 left-4">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-12 h-12 rounded-lg border-2 border-white object-cover shadow-md"
              />
            </div>
          )}
        </div>

        <div className="bg-white p-4 pt-8">
          <h3 className="font-garamond text-lg font-semibold text-nord1 mb-2 truncate">
            {event.title}
          </h3>

          <div className="flex items-center text-xs text-nord3 mb-1">
            <FiCalendar className="mr-1" size={12} />
            <span>{formattedDate}</span>
            <span className="mx-2">•</span>
            <FiClock className="mr-1" size={12} />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center text-xs text-nord3 truncate">
            <FiMapPin className="mr-1 flex-shrink-0" size={12} />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Full card for event listings
  return (
    <Link
      to={`/events/${event._id}`}
      className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
      style={{
        borderLeft: `4px solid ${backgroundColor}`,
      }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Event image/icon */}
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor }}
            >
              {event.title.substring(0, 1).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Event title and visibility */}
            <div className="flex justify-between items-start">
              <h3 className="font-garamond text-xl font-semibold text-nord1 mb-1 truncate pr-2">
                {event.title}
              </h3>

              {/* Visibility badge */}
              {event.visibility === "private" ? (
                <span className="bg-nord5 text-nord3 rounded-full px-2 py-1 text-xs flex items-center flex-shrink-0">
                  <FiEyeOff size={12} className="mr-1" /> Private
                </span>
              ) : (
                <span className="bg-nord5 text-nord3 rounded-full px-2 py-1 text-xs flex items-center flex-shrink-0">
                  <FiEye size={12} className="mr-1" /> Public
                </span>
              )}
            </div>

            {/* Event meta info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-3">
              <div className="flex items-center text-sm text-nord3">
                <FiCalendar className="mr-2 text-nord9" size={16} />
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center text-sm text-nord3">
                <FiClock className="mr-2 text-nord9" size={16} />
                <span>{event.time}</span>
              </div>

              <div className="flex items-center text-sm text-nord3">
                <FiMapPin className="mr-2 text-nord9" size={16} />
                <span className="truncate">{event.location}</span>
              </div>

              {event.capacity > 0 && (
                <div className="flex items-center text-sm text-nord3">
                  <FiUsers className="mr-2 text-nord9" size={16} />
                  <span>
                    {event.attendees.length} / {event.capacity} attendees
                  </span>
                </div>
              )}
            </div>

            {/* Event description preview */}
            <p className="mt-3 text-sm text-nord2 line-clamp-2">
              {event.description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
