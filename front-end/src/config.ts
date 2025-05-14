// API URL - Configurable based on environment
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Default app name
export const APP_NAME = "Nikiplan";

// Default background color (Nord8 - light blue)
export const DEFAULT_BACKGROUND_COLOR = "#88c0d0";

// Max file upload size (in bytes)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
