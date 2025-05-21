// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom"; 
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
  FiChevronDown, 
  FiChevronUp,   
  FiAlertCircle, 
} from "react-icons/fi";
import { getRelativeTimeDescription } from "../utils/dateUtils";



const EventsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const allEvents = useAppSelector(selectAllEvents); 
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);
  const currentUser = useAppSelector(selectUser);
  const location = useLocation(); 

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  
  const [filterVisibility, setFilterVisibility] = useState<"all" | "public" | "private">("all");
  const [filterTimeframe, setFilterTimeframe] = useState<"all" | "upcoming" | "past">("upcoming");
  const [filterMyEventsOnly, setFilterMyEventsOnly] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        
        window.history.replaceState({}, document.title)
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);


  
  useEffect(() => {
    dispatch(
      fetchEvents({
        visibility: filterVisibility,
        timeframe: filterTimeframe,
        
        myEventsOnly: currentUser?.role === "organizer" && filterMyEventsOnly ? true : undefined,
        search: searchQuery.trim() || undefined, 
      })
    );
  }, [
    dispatch,
    filterVisibility,
    filterTimeframe,
    filterMyEventsOnly,
    currentUser?.role,
    searchQuery, 
  ]);


  
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !event.title.toLowerCase().includes(query) &&
          !(event.description || "").toLowerCase().includes(query) && 
          !(event.location || "").toLowerCase().includes(query) 
        ) {
          return false;
        }
      }
      
      return true;
    });
  }, [allEvents, searchQuery]);


  
  const groupedEvents = useMemo(() =>
    filteredEvents.reduce<Record<string, typeof filteredEvents>>(
    (groups, event) => {
      const eventDate = new Date(event.date);
      const dateKey = getRelativeTimeDescription(eventDate);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {}
  ), [filteredEvents]);

  const sortedDateGroups = useMemo(() => Object.keys(groupedEvents).sort((a, b) => {
    const specialOrder = ["Today", "Tomorrow"];
    const aIndex = specialOrder.indexOf(a);
    const bIndex = specialOrder.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    const aEvents = groupedEvents[a];
    const bEvents = groupedEvents[b];
    if (aEvents.length > 0 && bEvents.length > 0) {
      return new Date(aEvents[0].date).getTime() - new Date(bEvents[0].date).getTime();
    }
    return 0;
  }), [groupedEvents]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
   
  };

  const resetFilters = () => {
    setFilterVisibility("all");
    setFilterTimeframe("upcoming"); 
    setFilterMyEventsOnly(false);
    
  };

  const activeFilterCount =
    (filterVisibility !== "all" ? 1 : 0) +
    (filterTimeframe !== "upcoming" ? 1 : 0) + 
    (currentUser?.role === "organizer" && filterMyEventsOnly ? 1 : 0);


  if (loading === "pending" && allEvents.length === 0) {
    return (
      <div className="min-h-screen bg-nord6 p-6 flex flex-col justify-center items-center text-center font-sans">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-nord9 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-nord1 text-lg font-medium">Loading Events...</p>
          <p className="text-nord3 text-sm">Fetching the latest event information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nord6 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {successMessage && (
            <div className="fixed top-8 right-8 z-50 p-4 rounded-md shadow-lg bg-nord14 text-nord0 text-sm font-medium transition-all duration-300 ease-in-out">
                {successMessage}
            </div>
        )}
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-4xl font-garamond font-bold text-nord1 mb-4 sm:mb-0">
            Discover Events
          </h1>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {(currentUser?.role === "organizer" || currentUser?.role === "admin") && (
              <Link
                to="/events/create"
                className="btn group w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-t from-nord10 to-nord9 text-white rounded-lg shadow-[inset_0px_1px_0px_0px_hsla(207,33%,60%,0.3)] hover:from-nord9 hover:to-nord8 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ease-in-out text-sm font-medium"
              >
                <FiPlusCircle className="mr-2 h-5 w-5" />
                Create Event
              </Link>
            )}
            <div className="flex self-stretch sm:self-auto rounded-lg shadow-sm border border-nord4 overflow-hidden bg-white">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 transition-colors duration-150 ${
                  viewMode === "grid"
                    ? "bg-nord9 text-white shadow-inner"
                    : "text-nord3 hover:bg-nord5 hover:text-nord1"
                }`}
              > <FiGrid size={18} /> </button>
              <div className="w-px bg-nord4"></div> {/* Separator */}
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 transition-colors duration-150 ${
                  viewMode === "list"
                    ? "bg-nord9 text-white shadow-inner"
                    : "text-nord3 hover:bg-nord5 hover:text-nord1"
                }`}
              > <FiList size={18} /> </button>
            </div>
          </div>
        </div>

        {/* Search and filters bar */}
        <div className="bg-white rounded-xl shadow-lg p-5 md:p-6 mb-8 border border-nord5">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-grow w-full relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-nord3" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by title, description, or location..."
                className="block w-full pl-12 pr-10 py-3 bg-nord6/50 border border-nord4 rounded-lg focus:outline-none focus:ring-2 focus:ring-nord9 focus:border-nord9 text-nord1 placeholder-nord3 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} title="Clear search" className="absolute inset-y-0 right-0 pr-4 flex items-center text-nord3 hover:text-nord1 transition-colors">
                  <FiX />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full md:w-auto flex items-center justify-center px-5 py-3 rounded-lg border transition-all duration-200 ease-in-out group hover:shadow-md
                ${ showFilters || activeFilterCount > 0
                  ? "bg-nord9 text-white border-nord9 hover:bg-nord10"
                  : "bg-nord5 text-nord1 border-nord4 hover:border-nord9 hover:text-nord1"
                }`}
            >
              <FiFilter className="mr-2 h-5 w-5" />
              <span className="font-medium text-sm">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-nord11 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
              {showFilters ? <FiChevronUp className="ml-2 h-5 w-5" /> : <FiChevronDown className="ml-2 h-5 w-5" />}
            </button>
          </div>

          {/* Expanded filters section */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-nord5 transition-all duration-300 ease-in-out">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 mb-6">
                {/* Visibility Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-nord1 mb-3">Visibility</h3>
                  <div className="space-y-2.5">
                    {(["all", "public", "private"] as const).map((vis) => (
                      <label key={vis} className="flex items-center group cursor-pointer p-2 rounded-md hover:bg-nord6 transition-colors">
                        <input type="radio" name="visibility" value={vis} checked={filterVisibility === vis} onChange={() => setFilterVisibility(vis)}
                          className="form-radio h-4 w-4 text-nord10 border-nord4 focus:ring-nord10 focus:ring-offset-0 transition" />
                        <span className="ml-3 text-sm text-nord2 group-hover:text-nord1">{vis.charAt(0).toUpperCase() + vis.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Timeframe Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-nord1 mb-3">Date Range</h3>
                  <div className="space-y-2.5">
                    {(["all", "upcoming", "past"] as const).map((time) => (
                      <label key={time} className="flex items-center group cursor-pointer p-2 rounded-md hover:bg-nord6 transition-colors">
                        <input type="radio" name="timeframe" value={time} checked={filterTimeframe === time} onChange={() => setFilterTimeframe(time)}
                         className="form-radio h-4 w-4 text-nord10 border-nord4 focus:ring-nord10 focus:ring-offset-0 transition" />
                        <span className="ml-3 text-sm text-nord2 group-hover:text-nord1">
                          {time === "all" ? "All Dates" : time.charAt(0).toUpperCase() + time.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* My Created Events Filter */}
                {currentUser?.role === "organizer" && (
                  <div>
                    <h3 className="text-sm font-semibold text-nord1 mb-3 flex items-center">
                      <FiUserCheck className="mr-1.5 text-nord9" /> My Events
                    </h3>
                    <label htmlFor="my-events-filter" className="flex items-center p-3 bg-nord6/50 border border-nord4 rounded-lg hover:border-nord9 transition-all cursor-pointer group">
                      <input type="checkbox" id="my-events-filter" checked={filterMyEventsOnly} onChange={(e) => setFilterMyEventsOnly(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-nord10 rounded border-nord4 focus:ring-nord10 focus:ring-offset-0 transition" />
                      <span className="ml-3 text-sm text-nord2 group-hover:text-nord1">Show only events I created</span>
                    </label>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button onClick={resetFilters} className="flex items-center px-4 py-2 text-sm text-nord3 hover:text-nord1 border border-nord4 rounded-lg hover:bg-nord5 transition-colors shadow-sm hover:shadow-md">
                  <FiX className="mr-1.5 h-4 w-4" /> Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error loading events */}
        {error && !loading && (
          <div className="mb-8 p-4 bg-nord11/10 text-nord11 rounded-lg border border-nord11/30 flex items-start shadow-sm">
            <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3 h-5 w-5" />
            <div>
                <p className="font-semibold text-nord0">Error Loading Events</p>
                <p className="text-sm text-nord1">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
            </div>
          </div>
        )}

        {/* No events found */}
        {!loading && filteredEvents.length === 0 && !error && (
          <div className="text-center py-16 md:py-24 bg-white rounded-xl shadow-lg border border-nord5">
            <FiCalendar className="mx-auto text-nord9 mb-6" size={60} />
            <h2 className="text-2xl font-semibold text-nord1 mb-3">No Events Found</h2>
            <p className="text-nord3 mb-8 max-w-md mx-auto">
              {searchQuery
                ? `We couldn't find any events matching your search for "${searchQuery}". Try adjusting your search or filters.`
                : "There are currently no events matching your selected filters. Why not create one?"}
            </p>
            {(currentUser?.role === "organizer" || currentUser?.role === "admin") && (
              <Link
                to="/events/create"
                className="btn group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-t from-nord10 to-nord9 text-white rounded-lg shadow-[inset_0px_1px_0px_0px_hsla(207,33%,60%,0.3)] hover:from-nord9 hover:to-nord8 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ease-in-out text-sm font-medium"
              >
                <FiPlusCircle className="mr-2 h-5 w-5" />
                Create New Event
              </Link>
            )}
          </div>
        )}

        {/* Event Listings */}
        {filteredEvents.length > 0 && (
          <div className="space-y-10">
            {sortedDateGroups.map((dateGroup) => (
              <section key={dateGroup}>
                <h2 className="text-xl font-semibold text-nord2 mb-5 flex items-center sticky top-0 bg-nord6 py-3 z-10 -mx-2 px-2 md:mx-0 md:px-0"> {/* Sticky date header */}
                  <FiCalendar className="mr-2.5 text-nord9" />
                  {dateGroup}
                </h2>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedEvents[dateGroup].map((event) => (
                      <EventCard key={event._id} event={event} isCompact={true} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {groupedEvents[dateGroup].map((event) => (
                      <EventCard key={event._id} event={event} isCompact={false} /> // Assuming EventCard handles list view styling
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;