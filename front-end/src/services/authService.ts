import axios from "axios";

// Define the base URL for your backend API
// Use environment variable or fallback for development
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending session cookies!
  headers: {
    "Content-Type": "application/json",
  },
});

// Log interceptor for debugging session issues
apiClient.interceptors.request.use((request) => {
  console.log("Starting Request:", request.url);
  console.log("Request headers:", request.headers);
  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error(
      "Response Error:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

// Define types for request/response
interface UserCredentials {
  email: string;
  password: string;
}

interface RegistrationData extends UserCredentials {
  username: string;
  role?: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthResponse {
  message: string;
  user?: UserData;
}

// Registration function
export const register = async (
  userData: RegistrationData
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      userData
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error.message || "Registration failed";
    }
    throw new Error("Registration failed");
  }
};

// Login function
export const login = async (
  credentials: UserCredentials
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    console.log("Login response cookies:", document.cookie); // Log cookies for debugging
    return response.data; // Should contain { message: string, user: object }
  } catch (error) {
    if (error instanceof Error) {
      throw error.message || "Login failed";
    }
    throw new Error("Login failed");
  }
};

// Logout function
export const logout = async (): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>("/auth/logout");
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error.message || "Logout failed";
    }
    throw new Error("Logout failed");
  }
};

// Function to get current user data (checks session)
export const getCurrentUser = async (): Promise<{ user: UserData } | null> => {
  try {
    console.log("Cookies before getCurrentUser:", document.cookie); // Log cookies for debugging
    const response = await apiClient.get<{ user: UserData }>("/auth/me");
    return response.data; // Should contain { user: object } or error
  } catch (error) {
    // It's common for this to fail if not logged in, handle gracefully
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      error.response.status === 401
    ) {
      return null; // Indicate not authenticated
    }
    if (error instanceof Error) {
      throw error.message || "Failed to fetch user status";
    }
    throw new Error("Failed to fetch user status");
  }
};
