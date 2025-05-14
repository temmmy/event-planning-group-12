import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchEvents,
  selectAllEvents,
  selectEventsLoading,
  selectEventsError,
  Event, 
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
  FiLoader, 
  FiAlertTriangle, 
  FiInbox, 
} from "react-icons/fi";
import { getRelativeTimeDescription } from "../utils/dateUtils";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Framer Motion Variants
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeInOut" } },
};

const filterPanelVariants: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  visible: { opacity: 1, height: "auto", marginTop: "1rem", marginBottom: "2rem", transition: { duration: 0.3, ease: "easeInOut" } },
};

const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

const listItemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};


const EventsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectAllEvents);
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterVisibility, setFilterVisibility] = useState<"all" | "public" | "private">("all");
  const [filterTimeframe, setFilterTimeframe] = useState<"all" | "upcoming" | "past">("upcoming");

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const processedEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !event.title.toLowerCase().includes(query) &&
          !(event.description || "").toLowerCase().includes(query) &&
          !(event.location || "").toLowerCase().includes(query)
        ) return false;
      }
      if (filterVisibility !== "all" && event.visibility !== filterVisibility) return false;
      if (filterTimeframe !== "all") {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (filterTimeframe === "upcoming" && eventDate < today) return false;
        if (filterTimeframe === "past" && eventDate >= today) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (filterTimeframe === "past") {
            return dateB - dateA; 
        }
        return dateA - dateB; 
    });


    const grouped = filtered.reduce<Record<string, Event[]>>((groups, event) => {
      const eventDate = new Date(event.date);
      const dateKey = getRelativeTimeDescription(eventDate);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
      return groups;
    }, {});

    const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
      const specialOrder = ["Today", "Tomorrow"];
      const aIndex = specialOrder.indexOf(a);
      const bIndex = specialOrder.indexOf(b);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
     
      const firstEventA = grouped[a]?.[0];
      const firstEventB = grouped[b]?.[0];

      if (firstEventA && firstEventB) {
         const dateA = new Date(firstEventA.date).getTime();
         const dateB = new Date(firstEventB.date).getTime();
         if (filterTimeframe === "past") {
            return dateB - dateA;
         }
         return dateA - dateB;
      }
      return 0;
    });

    return { filteredEvents: filtered, groupedEvents: grouped, sortedDateGroups: sortedGroupKeys };
  }, [events, searchQuery, filterVisibility, filterTimeframe]);

  const { filteredEvents, groupedEvents, sortedDateGroups } = processedEvents;

  const resetFilters = () => {
    setSearchQuery("");
    setFilterVisibility("all");
    setFilterTimeframe("upcoming"); 
    setShowFilters(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (filterVisibility !== "all" ? 1 : 0) +
    (filterTimeframe !== "upcoming" ? 1 : 0); 

  if (loading === "pending" && events.length === 0) {
    return (
      <motion.div
        className="min-h-screen bg-nord6 flex flex-col items-center justify-center p-6 text-nord1" // nord1 for text on nord6
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <FiLoader className="animate-spin text-nord9 mb-4" size={48} />
        <p className="text-xl font-semibold">Loading your events...</p>
        <p className="text-nord3">Please wait a moment.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-nord6 p-4 md:p-6 lg:p-8" // nord6 main background
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } }}
        >
          <h1 className="text-3xl sm:text-4xl font-garamond font-bold text-nord0 mb-4 md:mb-0"> {/* nord0 darkest text */}
            Events
          </h1>
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <Link
              to="/events/create"
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-nord10 text-nord6 rounded-lg shadow-md hover:bg-nord9 focus:outline-none focus:ring-2 focus:ring-nord8 focus:ring-offset-2 focus:ring-offset-nord6 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              <FiPlusCircle className="mr-2.5" size={20} />
              <span className="font-medium">Create Event</span>
            </Link>
            <div className="flex self-stretch sm:self-auto rounded-lg border border-nord4 bg-nord6 shadow-sm overflow-hidden"> {/* nord4 border */}
              {([
                {label: "Grid", value: "grid", icon: FiGrid},
                {label: "List", value: "list", icon: FiList}
              ] as const).map(item => (
                <motion.button
                    key={item.value}
                    onClick={() => setViewMode(item.value)}
                    className={`relative flex-1 sm:flex-auto flex items-center justify-center px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus:z-10 focus:ring-2 focus:ring-nord9 ${
                        viewMode === item.value ? "text-nord6" : "text-nord2 hover:bg-nord5 hover:text-nord1" // nord2 secondary text, nord5 light hover
                    }`}
                    aria-label={`${item.label} view`}
                    whileTap={{ scale: 0.95 }}
                >
                    <item.icon size={18} className="mr-0 sm:mr-2" />
                    <span className="hidden sm:inline">{item.label}</span>
                    {viewMode === item.value && (
                        <motion.div
                            className="absolute inset-0 bg-nord9 z-[-1] rounded-md" // nord9 active view
                            layoutId="activeViewIndicator"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                    )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.header>

        {/* Search and Filters Bar */}
        <motion.div
          className="bg-nord6 sticky top-0 z-20 py-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 mb-6 shadow-sm backdrop-blur-md bg-opacity-80" 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } }}
        >
          <div className="max-w-7xl mx-auto bg-white p-4 rounded-xl shadow-lg border border-nord5"> {/* nord5 border */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-grow relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nord3" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search events..."
                  className="w-full pl-12 pr-10 py-2.5 border border-nord4 rounded-lg focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 transition-shadow text-nord1 placeholder-nord3" // nord4 border, nord10 focus, nord1 text, nord3 placeholder
                />
                {searchQuery && (
                  <motion.button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-nord3 hover:text-nord1"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Clear search"
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    exit={{opacity: 0, scale: 0.8}}
                  >
                    <FiX size={20} />
                  </motion.button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full lg:w-auto flex items-center justify-center px-5 py-2.5 rounded-lg border font-medium transition-all duration-200 ease-in-out relative ${
                  showFilters
                    ? "bg-nord10 text-nord6 border-nord10 shadow-md" // nord10 active filter button
                    : "bg-nord6 text-nord1 border-nord4 hover:border-nord3 hover:bg-nord5" // nord6 default, nord1 text, nord4 border
                }`}
                aria-expanded={showFilters}
              >
                <FiFilter className="mr-2.5" size={18} />
                Filters
                {activeFilterCount > 0 && (
                  <motion.span
                    key={activeFilterCount}
                    initial={{scale:0.5, opacity:0}}
                    animate={{scale:1, opacity:1}}
                    className="ml-2.5 bg-nord11 text-nord6 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                  >
                    {activeFilterCount}
                  </motion.span>
                )}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  key="filter-panel"
                  variants={filterPanelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="overflow-hidden" 
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-5">
                    {[
                      {
                        label: "Visibility",
                        state: filterVisibility,
                        setState: setFilterVisibility,
                        options: [
                          { value: "all", label: "All" },
                          { value: "public", label: "Public" },
                          { value: "private", label: "Private" },
                        ],
                      },
                      {
                        label: "Timeframe",
                        state: filterTimeframe,
                        setState: setFilterTimeframe,
                        options: [
                          { value: "all", label: "All Dates" },
                          { value: "upcoming", label: "Upcoming" },
                          { value: "past", label: "Past" },
                        ],
                      },
                    ].map(filterGroup => (
                      <div key={filterGroup.label}>
                        <label className="block text-sm font-semibold text-nord1 mb-2.5">{filterGroup.label}</label>
                        <div className="flex flex-wrap gap-2">
                          {filterGroup.options.map(opt => (
                            <motion.button
                              key={opt.value}
                              onClick={() => filterGroup.setState(opt.value as any)}
                              className={`px-3.5 py-1.5 rounded-md text-sm font-medium border transition-all duration-150 ${
                                filterGroup.state === opt.value
                                  ? "bg-nord9 text-nord6 border-nord9 shadow-sm" // nord9 active filter option
                                  : "bg-nord6 text-nord2 border-nord4 hover:border-nord3 hover:text-nord1"
                              }`}
                              whileTap={{ scale: 0.97 }}
                            >
                              {opt.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-nord5 flex justify-end"> {/* nord5 border */}
                    <button
                      onClick={resetFilters}
                      className="px-4 py-1.5 text-sm font-medium text-nord2 hover:text-nord0 hover:bg-nord5 rounded-md transition-colors" // nord2 text
                    >
                      Reset All Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            className="mb-8 p-5 bg-nord11/10 text-nord11 rounded-xl border border-nord11/30 flex items-start gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
          >
            <FiAlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Oops! Something went wrong.</p>
              <p className="text-sm ">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Event Listings */}
        <AnimatePresence mode="wait">
          {filteredEvents.length === 0 && !error ? (
            <motion.div
              key="no-events"
              className="text-center py-16 sm:py-24 bg-white rounded-xl shadow-lg border border-nord5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <FiInbox className="mx-auto text-nord8 mb-6" size={56} /> {/* nord8 accent */}
              <h2 className="text-2xl font-semibold text-nord1 mb-3">
                No Events Found
              </h2>
              <p className="text-nord3 max-w-md mx-auto mb-8">
                {searchQuery || filterVisibility !== "all" || filterTimeframe !== "upcoming"
                  ? "Try adjusting your search or filter criteria."
                  : "Why not create one? Let's get something planned!"}
              </p>
              <Link
                to="/events/create"
                className="inline-flex items-center px-6 py-3 bg-nord10 text-nord6 rounded-lg shadow-md hover:bg-nord9 focus:outline-none focus:ring-2 focus:ring-nord8 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                <FiPlusCircle className="mr-2.5" size={20}/>
                Create New Event
              </Link>
            </motion.div>
          ) : (
            <motion.div key="event-list-container" className="space-y-10">
              {sortedDateGroups.map((dateGroup, groupIndex) => (
                <motion.section
                  key={dateGroup}
                  variants={listItemVariants} 
                  initial="hidden"
                  animate="visible"
                  transition={{delay: groupIndex * 0.1}} 
                >
                  <h2 className="text-xl sm:text-2xl font-semibold text-nord1 mb-5 flex items-center"> {/* nord1 heading text */}
                    <FiCalendar className="mr-3 text-nord9" size={24} /> {/* nord9 icon color */}
                    {dateGroup}
                  </h2>
                  <motion.div
                    variants={listContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "space-y-5"
                    }
                    
                    layout 
                  >
                    {groupedEvents[dateGroup].map((event) => (
                       <motion.div key={event._id} variants={listItemVariants} layout>
                         <EventCard
                           event={event}
                           isCompact={viewMode === "grid"}
                         />
                       </motion.div>
                    ))}
                  </motion.div>
                </motion.section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EventsPage;