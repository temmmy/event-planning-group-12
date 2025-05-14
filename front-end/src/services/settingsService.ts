<<<<<<< HEAD
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Get system settings
export const getSystemSettings = async () => {
  try {
    const response = await apiClient.get("/admin/settings");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Failed to fetch settings";
  }
};

// Update system settings
export const updateSystemSettings = async (settings: any) => {
  try {
    const response = await apiClient.put("/admin/settings", settings);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Failed to update settings";
  }
};
=======
import axios, { AxiosError } from "axios";
import { SystemSettings } from "../features/settings/settingsSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Configure axios defaults
axios.defaults.withCredentials = true; // Important for cookies/session

// Type for error responses from the API
interface ApiErrorResponse {
  message: string;
}

/**
 * Get system settings
 * @returns Promise with system settings data
 */
export const getSettings = async (): Promise<{ settings: SystemSettings }> => {
  try {
    const response = await axios.get(`${API_URL}/api/settings`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return { settings: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch settings"
      );
    }
    throw new Error("Network error when fetching settings");
  }
};

/**
 * Update system settings
 * @param settingsData - Partial settings object with fields to update
 * @returns Promise with updated settings
 */
export const updateSettings = async (
  settingsData: Partial<SystemSettings>
): Promise<{ settings: SystemSettings }> => {
  try {
    const response = await axios.put(`${API_URL}/api/settings`, settingsData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return { settings: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update settings"
      );
    }
    throw new Error("Network error when updating settings");
  }
};

/**
 * Debug function to test session state
 */
export const debugSession = async (): Promise<{
  sessionID: string;
  cookies: string;
  session: Record<string, unknown>;
  user: Record<string, unknown> | string;
}> => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/debug-session`, {
      withCredentials: true,
    });
    console.log("Session debug response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Session debug error:", error);
    throw error;
  }
};
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
