import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchEventStatistics,
  selectEventStatistics,
  selectEventStatisticsLoading,
  selectEventStatisticsError,
} from "../features/events/eventStatisticsSlice";
import { selectUser } from "../features/auth/authSlice";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

// Admin role check for UI elements
const useIsAdmin = () => {
  const user = useAppSelector(selectUser);
  return user?.role === "admin";
};

const AdminEventStatisticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const statistics = useAppSelector(selectEventStatistics);
  const loading = useAppSelector(selectEventStatisticsLoading);
  const error = useAppSelector(selectEventStatisticsError);
  const isAdmin = useIsAdmin();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchEventStatistics());
    }
  }, [dispatch, isAdmin]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // If user is not admin, show unauthorized message
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
            <Link
              to="/events"
              className="inline-block px-6 py-2 bg-nord10 hover:bg-nord9 text-white font-medium rounded-lg transition-colors duration-300"
            >
              Return to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If still loading the statistics
  if (loading === "pending" && !statistics) {
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
          <p className="text-nord10 text-xl">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nord6 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-nord10 to-nord9 rounded-t-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <p className="text-nord6/80 text-sm font-medium mb-1 uppercase tracking-wider">
                Admin Dashboard
              </p>
              <h1 className="font-garamond text-3xl md:text-4xl font-bold text-white">
                Event <span className="text-nord6">Statistics</span>
              </h1>
            </div>

            <div className="mt-4 md:mt-0">
              <Link
                to="/admin/settings"
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-nord6 text-sm inline-block hover:bg-white/20 transition-colors"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-xl shadow-lg p-6 md:p-8">
          {/* Error message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex">
              <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3" size={18} />
              <div>
                <p className="font-medium">Error loading statistics</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {statistics && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Events */}
                <div className="bg-nord8/10 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center">
                    <div className="mr-4 bg-nord8 rounded-lg p-3 text-white">
                      <FiCalendar size={24} />
                    </div>
                    <div>
                      <p className="text-nord3 text-sm font-medium">
                        Total Events
                      </p>
                      <h3 className="text-left text-3xl font-bold text-nord1">
                        {statistics.totalEvents || 0}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-nord9/10 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center">
                    <div className="mr-4 bg-nord9 rounded-lg p-3 text-white">
                      <FiClock size={24} />
                    </div>
                    <div>
                      <p className="text-nord3 text-sm font-medium">
                        Upcoming Events
                      </p>
                      <h3 className="text-3xl text-left font-bold text-nord1">
                        {statistics.upcomingEvents || 0}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Average Attendees */}
                <div className="bg-nord10/10 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center">
                    <div className="mr-4 bg-nord10 rounded-lg p-3 text-white">
                      <FiUsers size={24} />
                    </div>
                    <div>
                      <p className="text-nord3 text-sm font-medium">
                        Avg. Attendees
                      </p>
                      <h3 className="text-left text-3xl font-bold text-nord1">
                        {(statistics.averageAttendees || 0).toFixed(1)}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Public vs Private */}
                <div className="bg-nord7/10 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center">
                    <div className="mr-4 bg-nord7 rounded-lg p-3 text-white">
                      <FiBarChart2 size={24} />
                    </div>
                    <div>
                      <p className="text-nord3 text-sm font-medium">
                        Public / Private
                      </p>
                      <h3 className="text-left text-3xl font-bold text-nord1">
                        {statistics.publicEvents || 0} /{" "}
                        {statistics.privateEvents || 0}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts & Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Events by Month */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-nord5">
                  <h2 className="text-xl font-semibold text-nord1 mb-4 flex items-center">
                    <FiBarChart2 className="mr-2" /> Events by Month
                  </h2>

                  {statistics.eventsByMonth.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-nord3">
                      No event data available to display
                    </div>
                  ) : (
                    <div className="h-64 relative pt-5">
                      <div className="flex items-end justify-between px-2 h-52 overflow-x-auto">
                        {statistics.eventsByMonth.map((month) => {
                          // Calculate the maximum count for proper scaling
                          const maxCount = Math.max(
                            ...statistics.eventsByMonth.map((m) => m.count),
                            1 // Ensure we don't divide by zero
                          );

                          // Calculate height (min 20px, max 180px)
                          const height = Math.max(
                            Math.min((month.count / maxCount) * 180, 180),
                            20
                          );

                          return (
                            <div
                              key={`${month._id.year}-${month._id.month}`}
                              className="flex flex-col items-center mx-2 min-w-[40px]"
                            >
                              <div
                                className="w-10 bg-nord9 rounded-t-md hover:bg-nord10 transition-colors relative group"
                                style={{ height: `${height}px` }}
                              >
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-nord3 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                                  {month.count} event
                                  {month.count !== 1 ? "s" : ""}
                                </div>

                                {/* Count label on top of bar */}
                                <span className="absolute w-full text-center -top-5 text-xs font-medium text-nord3">
                                  {month.count}
                                </span>
                              </div>

                              {/* Month and year label */}
                              <div className="mt-2 text-xs text-nord3 text-center whitespace-nowrap">
                                {months[month._id.month - 1].substring(0, 3)}{" "}
                                {month._id.year}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Organizers */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-nord5">
                  <h2 className="text-xl font-semibold text-nord1 mb-4 flex items-center">
                    <FiUsers className="mr-2" /> Top Organizers
                  </h2>

                  {statistics.topOrganizers.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-nord3">
                      No organizer data available
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-nord5">
                            <th className="py-3 text-left text-sm font-medium text-nord3">
                              Organizer
                            </th>
                            <th className="py-3 text-left text-sm font-medium text-nord3">
                              Email
                            </th>
                            <th className="py-3 text-right text-sm font-medium text-nord3">
                              Events
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {statistics.topOrganizers.map((organizer) => (
                            <tr
                              key={organizer.organizer._id}
                              className="border-b border-nord5 hover:bg-nord6/50"
                            >
                              <td className="text-left py-3 text-sm text-nord1">
                                {organizer.organizer.username || "Unknown User"}
                              </td>
                              <td className="text-left py-3 text-sm text-nord3">
                                {organizer.organizer.email || "No email"}
                              </td>
                              <td className="py-3 text-sm text-nord1 text-right font-medium">
                                {organizer.count}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Most Popular Events */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-nord5 lg:col-span-2">
                  <h2 className="text-xl font-semibold text-nord1 mb-4 flex items-center">
                    <FiTrendingUp className="mr-2" /> Most Popular Events
                  </h2>

                  {statistics.mostPopularEvents.length === 0 ? (
                    <div className="py-8 flex items-center justify-center text-nord3">
                      No event popularity data available
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-nord5">
                            <th className="py-3 text-left text-sm font-medium text-nord3">
                              Event
                            </th>
                            <th className="py-3 text-left text-sm font-medium text-nord3">
                              Organizer
                            </th>
                            <th className="py-3 text-left text-sm font-medium text-nord3">
                              Date
                            </th>
                            <th className="py-3 text-right text-sm font-medium text-nord3">
                              Attendees
                            </th>
                            <th className="py-3 text-right text-sm font-medium text-nord3">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {statistics.mostPopularEvents.map((event) => (
                            <tr
                              key={event._id}
                              className="border-b border-nord5 hover:bg-nord6/50"
                            >
                              <td className="text-left py-3 text-sm text-nord1 font-medium">
                                {event.title || "Untitled Event"}
                              </td>
                              <td className="text-left py-3 text-sm text-nord3">
                                {event.organizer?.username || "Unknown"}
                              </td>
                              <td className="text-left py-3 text-sm text-nord3">
                                {formatDate(event.date)}
                              </td>
                              <td className="py-3 text-sm text-nord1 text-right font-medium">
                                {event.attendeeCount}
                              </td>
                              <td className="py-3 text-right">
                                <Link
                                  to={`/events/${event._id}`}
                                  className="text-nord10 hover:text-nord9 text-sm font-medium"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEventStatisticsPage;
