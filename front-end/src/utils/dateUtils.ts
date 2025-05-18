/**
 * Format a date in a human-readable way
 * @param date - The date to format
 * @returns Formatted date string (e.g., "May 15, 2023")
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format a date in a shorter format
 * @param date - The date to format
 * @returns Short formatted date string (e.g., "15 May 2023")
 */
export const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Get a relative time description
 * @param date - The date to format
 * @returns A string describing the relative time (e.g. "Today", "Tomorrow", "In 3 days", "2 days ago")
 */
export const getRelativeTimeDescription = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateObj = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffInDays = Math.floor(
    (dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Tomorrow";
  } else if (diffInDays === -1) {
    return "Yesterday";
  } else if (diffInDays > 1 && diffInDays < 7) {
    return `In ${diffInDays} days`;
  } else if (diffInDays < 0 && diffInDays > -7) {
    return `${Math.abs(diffInDays)} days ago`;
  } else {
    return formatDate(date);
  }
};

/**
 * Check if a date is in the past
 * @param date - The date to check
 * @returns True if the date is in the past, false otherwise
 */
export const isPastDate = (date: Date): boolean => {
  const now = new Date();
  return date < now;
};

/**
 * Calculate days remaining until a date
 * @param date - The target date
 * @returns Number of days remaining (negative if date is in the past)
 */
export const daysUntil = (date: Date): number => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return Math.floor(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

/**
 * Format a time string (HH:MM) into a 12-hour format with AM/PM
 * @param timeString - The time string to format (e.g., "14:30")
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (timeString: string): string => {
  if (!timeString || !timeString.includes(":")) {
    return "Invalid Time"; // Or return the original string, or an empty one
  }
  const [hours, minutes] = timeString.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    return "Invalid Time";
  }

  const ampm = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12; // Convert 0 or 12 to 12

  return `${twelveHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};
