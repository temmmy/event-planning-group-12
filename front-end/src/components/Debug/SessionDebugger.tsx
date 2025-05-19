// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Define type for session data
interface SessionData {
  sessionID: string;
  cookies: string;
  session: Record<string, unknown>;
  user: Record<string, unknown> | string;
}

const SessionDebugger: React.FC = () => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check browser cookies
      console.log("Client-side cookies:", document.cookie);

      // Try to fetch debug info from server
      const response = await axios.get<SessionData>(
        `${API_URL}/api/auth/debug-session`,
        {
          withCredentials: true,
        }
      );

      setSessionData(response.data);
    } catch (err) {
      console.error("Session debug error:", err);
      // Safely handle error message
      if (err instanceof Error) {
        setError(err.message || "Failed to check session");
      } else {
        setError("Failed to check session");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={checkSession}
        className="bg-nord10 hover:bg-nord9 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Checking..." : "Debug Session"}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {sessionData && (
        <div className="mt-2 p-3 bg-nord2 text-nord4 rounded-md max-w-lg max-h-64 overflow-auto">
          <h3 className="font-bold text-nord8 mb-2">Session Data:</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SessionDebugger;
