import axios from "axios";

// Define the base URL for your backend API
// Use environment variable or fallback for development
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending session cookies!
});

// Define types for request/response data (optional but recommended)
// Add types for registration, login credentials, and user data

// Registration function
export const register = async (userData: any) => {
  try {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    // Re-throw or handle specific errors (e.g., validation, conflict)
    throw error.response?.data || error.message || "Registration failed";
  }
};

// Login function
export const login = async (credentials: any) => {
  try {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data; // Should contain { message: string, user: object }
  } catch (error: any) {
    throw error.response?.data || error.message || "Login failed";
  }
};

// Logout function
export const logout = async () => {
  try {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Logout failed";
  }
};

// Function to get current user data (checks session)
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data; // Should contain { user: object } or error
  } catch (error: any) {
    // It's common for this to fail if not logged in, handle gracefully
    if (error.response?.status === 401) {
      return null; // Indicate not authenticated
    }
    throw (
      error.response?.data || error.message || "Failed to fetch user status"
    );
  }
};
