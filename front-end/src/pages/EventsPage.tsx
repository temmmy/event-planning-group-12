import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchEvents,
  selectAllEvents,
  selectEventsLoading,
  selectEventsError,
} from "../features/events/eventsSlice";
import EventCard from "../components/Events/EventCard";
import {
  FiGrid,
  FiList,
  FiPlusCircle,
  FiFilter,
  FiCalendar,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { getRelativeTimeDescription } from "../utils/dateUtils";

const EventsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectAllEvents);
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterVisibility, setFilterVisibility] = useState<
    "all" | "public" | "private"
  >("all");
  const [filterTimeframe, setFilterTimeframe] = useState<
    "all" | "upcoming" | "past"
  >("upcoming");

  // Fetch events on component mount
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Filter and sort events
  const filteredEvents = events.filter((event) => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !event.title.toLowerCase().includes(query) &&
        !event.description.toLowerCase().includes(query) &&
        !event.location.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Apply visibility filter
    if (filterVisibility !== "all" && event.visibility !== filterVisibility) {
      return false;
    }

    // Apply timeframe filter
    if (filterTimeframe !== "all") {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterTimeframe === "upcoming" && eventDate < today) {
        return false;
      }

      if (filterTimeframe === "past" && eventDate >= today) {
        return false;
      }
    }

    return true;
  });

  // Group events by date
  const groupedEvents = filteredEvents.reduce<Record<string, typeof events>>(
    (groups, event) => {
      const eventDate = new Date(event.date);
      const dateKey = getRelativeTimeDescription(eventDate);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(event);
      return groups;
    },
    {}
  );

  // Sort date groups to ensure "Today", "Tomorrow", etc. come before dates
  const sortedDateGroups = Object.keys(groupedEvents).sort((a, b) => {
    const specialOrder = ["Today", "Tomorrow"];
    const aIndex = specialOrder.indexOf(a);
    const bIndex = specialOrder.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // For regular dates, sort by the actual date
    const aEvents = groupedEvents[a];
    const bEvents = groupedEvents[b];

    if (aEvents.length > 0 && bEvents.length > 0) {
      return (
        new Date(aEvents[0].date).getTime() -
        new Date(bEvents[0].date).getTime()
      );
    }

    return 0;
  });

  // Reset search and filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilterVisibility("all");
    setFilterTimeframe("upcoming");
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Render loading state
  if (loading === "pending" && events.length === 0) {
    return (
      <div className="min-h-screen bg-nord6 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
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
            <p className="text-nord10 text-xl">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nord6 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-garamond font-bold text-nord1 mb-4 sm:mb-0">
            Events
          </h1>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Create event button */}
            <Link
              to="/events/create"
              className="flex items-center justify-center px-4 py-2 bg-nord10 text-white rounded-lg hover:bg-nord9 transition-colors"
            >
              <FiPlusCircle className="mr-2" />
              Create Event
            </Link>

            {/* View mode toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center justify-center px-4 py-2 ${
                  viewMode === "grid"
                    ? "bg-nord9 text-white"
                    : "bg-white text-nord3 hover:bg-nord5/50"
                }`}
                aria-label="Grid view"
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center justify-center px-4 py-2 ${
                  viewMode === "list"
                    ? "bg-nord9 text-white"
                    : "bg-white text-nord3 hover:bg-nord5/50"
                }`}
                aria-label="List view"
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search events by title, description, or location"
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`md:w-auto flex items-center justify-center px-4 py-2 rounded-md border ${
                showFilters
                  ? "bg-nord10 text-white border-nord10"
                  : "bg-white text-nord3 border-gray-300 hover:bg-nord5/50"
              }`}
            >
              <FiFilter className="mr-2" />
              Filters
              {(filterVisibility !== "all" ||
                filterTimeframe !== "upcoming") && (
                <span className="ml-2 bg-nord11 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {(filterVisibility !== "all" ? 1 : 0) +
                    (filterTimeframe !== "upcoming" ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                {/* Visibility filter */}
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium text-nord3 mb-2">
                    Visibility
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="all"
                        checked={filterVisibility === "all"}
                        onChange={() => setFilterVisibility("all")}
                        className="form-radio h-4 w-4 text-nord10 focus:ring-nord10"
                      />
                      <span className="ml-2 text-sm text-nord2">All</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={filterVisibility === "public"}
                        onChange={() => setFilterVisibility("public")}
                        className="form-radio h-4 w-4 text-nord10 focus:ring-nord10"
                      />
                      <span className="ml-2 text-sm text-nord2">Public</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={filterVisibility === "private"}
                        onChange={() => setFilterVisibility("private")}
                        className="form-radio h-4 w-4 text-nord10 focus:ring-nord10"
                      />
                      <span className="ml-2 text-sm text-nord2">Private</span>
                    </label>
                  </div>
                </div>

                {/* Timeframe filter */}
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium text-nord3 mb-2">
                    When
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="timeframe"
                        value="all"
                        checked={filterTimeframe === "all"}
                        onChange={() => setFilterTimeframe("all")}
                        className="form-radio h-4 w-4 text-nord10 focus:ring-nord10"
                      />
                      <span className="ml-2 text-sm text-nord2">All dates</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="timeframe"
                        value="upcoming"
                        checked={filterTimeframe === "upcoming"}
                        onChange={() => setFilterTimeframe("upcoming")}
                        className="form-radio h-4 w-4 text-nord10 focus:ring-nord10"
                      />
                      <span className="ml-2 text-sm text-nord2">Upcoming</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="timeframe"
                        value="past"
                        checked={filterTimeframe === "past"}
                        onChange={() => setFilterTimeframe("past")}
                        className="form-radio h-4 w-4 text-nord10 focus:ring-nord10"
                      />
                      <span className="ml-2 text-sm text-nord2">Past</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Reset filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-3 py-1 text-sm text-nord3 hover:text-nord10"
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
            <p className="font-medium">Error loading events</p>
            <p>{error}</p>
          </div>
        )}

        {/* No results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FiCalendar className="mx-auto text-nord9 mb-4" size={48} />
            <h2 className="text-xl font-medium text-nord1 mb-2">
              No events found
            </h2>
            <p className="text-nord3 mb-6">
              {searchQuery
                ? `No events match your search for "${searchQuery}"`
                : "You don't have any events yet"}
            </p>
            <Link
              to="/events/create"
              className="inline-flex items-center px-4 py-2 bg-nord10 text-white rounded-lg hover:bg-nord9 transition-colors"
            >
              <FiPlusCircle className="mr-2" />
              Create your first event
            </Link>
          </div>
        )}

        {/* Event Listings */}
        {filteredEvents.length > 0 && (
          <div className="space-y-8">
            {sortedDateGroups.map((dateGroup) => (
              <div key={dateGroup}>
                {/* Date group heading */}
                <h2 className="text-lg font-medium text-nord3 mb-4 flex items-center">
                  <FiCalendar className="mr-2" />
                  {dateGroup}
                </h2>

                {/* Events grid or list */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedEvents[dateGroup].map((event) => (
                      <EventCard
                        key={event._id}
                        event={event}
                        isCompact={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedEvents[dateGroup].map((event) => (
                      <EventCard key={event._id} event={event} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
