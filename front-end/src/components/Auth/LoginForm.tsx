// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loginUser,
  clearError,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from "../../features/auth/authSlice";
import AuthLayout from "./AuthLayout";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading) === "pending";
  const error = useAppSelector(selectAuthError);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to auth-success handler to determine where to go based on role
      navigate("/auth-success", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearError()); // Clear previous errors
    dispatch(loginUser({ email, password }));
  };

  return (
    <AuthLayout
      title={
        <>
          Login to Your <span className="text-nord10">Account</span>
        </>
      }
      subtitle="Welcome back! Sign in to access your events, track RSVPs, and manage your event planning all in one place."
      type="login"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-nord2 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nord8 focus:border-nord8 text-nord1"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-nord2 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nord8 focus:border-nord8 text-nord1"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-nord10 focus:ring-nord8 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-nord3"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-nord10 hover:text-nord9">
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-nord10 hover:bg-nord9 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nord10 transition-colors ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Logging In..." : "Login Now"}
        </button>

        <p className="text-center text-nord3 text-sm mt-6">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-nord10 hover:text-nord9 font-medium"
          >
            Register here
          </a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginForm;
