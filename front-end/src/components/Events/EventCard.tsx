import React from "react";
import { Link } from "react-router-dom";
import { Event } from "../../features/events/eventsSlice"; // Ensure this path is correct
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { formatDate } from "../../utils/dateUtils"; // Ensure this path is correct

interface EventCardProps {
  event: Event;
  isCompact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isCompact = false }) => {
  const backgroundColor = event.backgroundColor || "#88c0d0"; // Nord8 as default
  const formattedDate = event.date ? formatDate(new Date(event.date)) : "Date TBD";
  const eventTime = event.time || "Time TBD";

  // Helper for attendees string
  const attendeesText = event.capacity > 0
    ? `${event.attendees?.length || 0} / ${event.capacity} attendees`
    : `${event.attendees?.length || 0} attendees`;


  if (isCompact) {
    // Compact card - often used in a grid layout
    return (
      <Link
        to={`/events/${event._id}`}
        className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nord10 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
        aria-label={`View details for ${event.title}`}
      >
        <div
          className="h-36 sm:h-40 w-full relative bg-cover bg-center"
          style={{
            backgroundColor: !event.coverImageUrl ? backgroundColor : undefined, // Show color if no image
            backgroundImage: event.coverImageUrl
              ? `url(${event.coverImageUrl})`
              : "none",
          }}
        >
          {/* Overlay for better text visibility on cover images if needed */}
          {event.coverImageUrl && <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>}

          {/* Event visibility badge */}
          <div className="absolute top-3 right-3 z-10">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                ${event.visibility === "private" ? "bg-nord3/80 text-nord6 backdrop-blur-sm" : "bg-nord14/80 text-nord0 backdrop-blur-sm"}`}
            >
              {event.visibility === "private" ? (
                <FiEyeOff size={12} className="mr-1.5" />
              ) : (
                <FiEye size={12} className="mr-1.5" />
              )}
              {event.visibility === "private" ? "Private" : "Public"}
            </span>
          </div>

          {/* Event image/icon (if no cover image, this can be more prominent) */}
          {event.imageUrl && (
            <div className={`absolute -bottom-5 left-4 z-10 transition-transform duration-300 group-hover:scale-105`}>
              <img
                src={event.imageUrl}
                alt={`${event.title} icon`}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-white object-cover shadow-md"
              />
            </div>
          )}
           {!event.imageUrl && !event.coverImageUrl && ( // Fallback initial if no images at all
            <div className="absolute -bottom-5 left-4 z-10 transition-transform duration-300 group-hover:scale-105">
                 <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-white shadow-md flex items-center justify-center text-white text-xl sm:text-2xl font-bold"
                    style={{ backgroundColor }} // Uses event's main background color
                >
                    {event.title.substring(0, 1).toUpperCase()}
                </div>
            </div>
          )}
        </div>

        <div className="bg-nord6 p-4 pt-7"> {/* pt-7 to give space for the overlapping image */}
          <h3 className="font-garamond text-lg sm:text-xl font-semibold text-nord1 mb-2 truncate group-hover:text-nord10 transition-colors">
            {event.title}
          </h3>

          <div className="space-y-1.5 text-xs sm:text-sm text-nord3">
            <div className="flex items-center">
              <FiCalendar className="mr-2 flex-shrink-0" size={14} />
              <span>{formattedDate}</span>
              <span className="mx-1.5 text-nord4">•</span>
              <FiClock className="mr-1.5 flex-shrink-0" size={14} />
              <span>{eventTime}</span>
            </div>
            <div className="flex items-center truncate">
              <FiMapPin className="mr-2 flex-shrink-0" size={14} />
              <span className="truncate">{event.location || "Location TBD"}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Full card - often used in a list view
  return (
    <Link
      to={`/events/${event._id}`}
      className="group block bg-nord6 rounded-xl overflow-hidden shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nord10 transition-all duration-300 ease-in-out"
      style={{ borderLeft: `5px solid ${backgroundColor}` }}
      aria-label={`View details for ${event.title}`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          {/* Event image/icon - stacks on mobile, side-by-side on larger screens */}
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={`${event.title} icon`}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
            />
          ) : (
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-md group-hover:scale-105 transition-transform"
              style={{ backgroundColor }}
            >
              {event.title.substring(0, 1).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-1">
              <h3 className="font-garamond text-xl sm:text-2xl font-semibold text-nord1 mb-1 sm:mb-0 truncate pr-2 group-hover:text-nord10 transition-colors">
                {event.title}
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 mt-1 sm:mt-0
                  ${event.visibility === "private" ? "bg-nord3/20 text-nord3" : "bg-nord14/20 text-nord14"}`}
              >
                {event.visibility === "private" ? (
                  <FiEyeOff size={14} className="mr-1.5" />
                ) : (
                  <FiEye size={14} className="mr-1.5" />
                )}
                {event.visibility === "private" ? "Private" : "Public"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-4 mt-3 text-sm text-nord3">
              <div className="flex items-center">
                <FiCalendar className="mr-2.5 text-nord9 flex-shrink-0" size={16} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <FiClock className="mr-2.5 text-nord9 flex-shrink-0" size={16} />
                <span>{eventTime}</span>
              </div>
              <div className="flex items-center md:col-span-2"> {/* Location can take full width if others wrap */}
                <FiMapPin className="mr-2.5 text-nord9 flex-shrink-0" size={16} />
                <span className="truncate">{event.location || "Location TBD"}</span>
              </div>
              {(event.capacity > 0 || (event.attendees && event.attendees.length > 0)) && (
                <div className="flex items-center">
                  <FiUsers className="mr-2.5 text-nord9 flex-shrink-0" size={16} />
                  <span>{attendeesText}</span>
                </div>
              )}
            </div>

            {event.description && (
              <p className="mt-4 text-sm text-nord2 line-clamp-2 sm:line-clamp-3">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;