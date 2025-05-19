// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchEvents,
  selectAllEvents,
  selectEventsLoading,
  selectEventsError,
} from "../features/events/eventsSlice";
import { selectUser } from "../features/auth/authSlice";
import EventCard from "../components/Events/EventCard";
import {
  FiGrid,
  FiList,
  FiPlusCircle,
  FiFilter,
  FiCalendar,
  FiSearch,
  FiX,
  FiUserCheck,
} from "react-icons/fi";
import { getRelativeTimeDescription } from "../utils/dateUtils";

const EventsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectAllEvents);
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);
  const currentUser = useAppSelector(selectUser);

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
  const [filterMyEventsOnly, setFilterMyEventsOnly] = useState(false);

  // Fetch events on component mount and when filters change
  useEffect(() => {
    dispatch(
      fetchEvents({
        visibility: filterVisibility,
        timeframe: filterTimeframe,
        myEventsOnly:
          currentUser?.role === "organizer" ? filterMyEventsOnly : undefined,
      })
    );
  }, [
    dispatch,
    filterVisibility,
    filterTimeframe,
    filterMyEventsOnly,
    currentUser?.role,
  ]);

  // Function to refresh events (used for RSVP changes)
  const refreshEvents = () => {
    dispatch(
      fetchEvents({
        visibility: filterVisibility,
        timeframe: filterTimeframe,
        myEventsOnly:
          currentUser?.role === "organizer" ? filterMyEventsOnly : undefined,
      })
    );
  };

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    // Future: Debounce and dispatch fetchEvents with search query if backend handles it
  };

  const resetFilters = () => {
    setFilterVisibility("all");
    setFilterTimeframe("upcoming");
    setFilterMyEventsOnly(false); // Reset the new filter
    // setSearchQuery(""); // Uncomment if search is also part of resettable filters
    setShowFilters(false); // Optionally close filters section on reset
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
            {(currentUser?.role === "organizer" ||
              currentUser?.role === "admin") && (
              <Link
                to="/events/create"
                className="flex items-center justify-center px-4 py-2 bg-nord10 text-white rounded-lg hover:bg-nord9 transition-colors"
              >
                <FiPlusCircle className="mr-2" />
                Create Event
              </Link>
            )}

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
                filterTimeframe !== "upcoming" ||
                (currentUser?.role === "organizer" && filterMyEventsOnly)) && (
                <span className="ml-2 bg-nord11 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {(filterVisibility !== "all" ? 1 : 0) +
                    (filterTimeframe !== "upcoming" ? 1 : 0) +
                    (currentUser?.role === "organizer" && filterMyEventsOnly
                      ? 1
                      : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-6">
                {/* Visibility Filter */}
                <div className="md:col-span-1">
                  <h3 className="text-sm font-medium text-nord1 mb-3">
                    Visibility
                  </h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    <label className="inline-flex items-center group cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="visibility"
                          value="all"
                          checked={filterVisibility === "all"}
                          onChange={() => setFilterVisibility("all")}
                          className="sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-nord5 rounded-full group-hover:border-nord9 transition-colors">
                          {filterVisibility === "all" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-nord9 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="ml-2 text-nord2 group-hover:text-nord1 transition-colors">
                        All
                      </span>
                    </label>

                    <label className="inline-flex items-center group cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="visibility"
                          value="public"
                          checked={filterVisibility === "public"}
                          onChange={() => setFilterVisibility("public")}
                          className="sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-nord5 rounded-full group-hover:border-nord9 transition-colors">
                          {filterVisibility === "public" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-nord9 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="ml-2 text-nord2 group-hover:text-nord1 transition-colors">
                        Public
                      </span>
                    </label>

                    <label className="inline-flex items-center group cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="visibility"
                          value="private"
                          checked={filterVisibility === "private"}
                          onChange={() => setFilterVisibility("private")}
                          className="sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-nord5 rounded-full group-hover:border-nord9 transition-colors">
                          {filterVisibility === "private" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-nord9 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="ml-2 text-nord2 group-hover:text-nord1 transition-colors">
                        Private
                      </span>
                    </label>
                  </div>
                </div>

                {/* Timeframe Filter */}
                <div className="md:col-span-1">
                  <h3 className="text-sm font-medium text-nord1 mb-3">When</h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    <label className="inline-flex items-center group cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="timeframe"
                          value="all"
                          checked={filterTimeframe === "all"}
                          onChange={() => setFilterTimeframe("all")}
                          className="sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-nord5 rounded-full group-hover:border-nord9 transition-colors">
                          {filterTimeframe === "all" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-nord9 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="ml-2 text-nord2 group-hover:text-nord1 transition-colors">
                        All dates
                      </span>
                    </label>

                    <label className="inline-flex items-center group cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="timeframe"
                          value="upcoming"
                          checked={filterTimeframe === "upcoming"}
                          onChange={() => setFilterTimeframe("upcoming")}
                          className="sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-nord5 rounded-full group-hover:border-nord9 transition-colors">
                          {filterTimeframe === "upcoming" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-nord9 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="ml-2 text-nord2 group-hover:text-nord1 transition-colors">
                        Upcoming
                      </span>
                    </label>

                    <label className="inline-flex items-center group cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="timeframe"
                          value="past"
                          checked={filterTimeframe === "past"}
                          onChange={() => setFilterTimeframe("past")}
                          className="sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-nord5 rounded-full group-hover:border-nord9 transition-colors">
                          {filterTimeframe === "past" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-nord9 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="ml-2 text-nord2 group-hover:text-nord1 transition-colors">
                        Past
                      </span>
                    </label>
                  </div>
                </div>

                {/* Organizer's "My Events" Filter */}
                {currentUser?.role === "organizer" && (
                  <div className="md:col-span-1">
                    <h3 className="text-sm font-medium text-nord1 mb-3 flex items-center">
                      <FiUserCheck className="mr-2 text-nord10" /> My Created
                      Events
                    </h3>
                    <div className="space-y-3">
                      <label
                        htmlFor="my-events-filter"
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-nord9 transition-all cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          id="my-events-filter"
                          checked={filterMyEventsOnly}
                          onChange={(e) =>
                            setFilterMyEventsOnly(e.target.checked)
                          }
                          className="form-checkbox h-5 w-5 text-nord10 rounded focus:ring-nord10 focus:ring-offset-0 transition duration-150 ease-in-out"
                        />
                        <span className="text-sm text-nord2 group-hover:text-nord1">
                          Show only events I created
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              {/* Reset filters button reinstated */}
              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center px-4 py-1.5 text-sm text-nord3 hover:text-nord10 border border-nord5 rounded-md hover:bg-nord6/50 transition-colors"
                >
                  <FiX className="mr-1.5" />
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
            {(currentUser?.role === "organizer" ||
              currentUser?.role === "admin") && (
              <Link
                to="/events/create"
                className="inline-flex items-center px-4 py-2 bg-nord10 text-white rounded-lg hover:bg-nord9 transition-colors"
              >
                <FiPlusCircle className="mr-2" />
                Create your first event
              </Link>
            )}
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
                        onRSVPChange={refreshEvents}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedEvents[dateGroup].map((event) => (
                      <EventCard
                        key={event._id}
                        event={event}
                        onRSVPChange={refreshEvents}
                      />
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
