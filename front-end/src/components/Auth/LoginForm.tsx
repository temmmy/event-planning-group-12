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
      navigate("/"); // Redirect to home/dashboard after login
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearError()); // Clear previous errors
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nord0 text-nord6">
      <div className="bg-nord1 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-nord8">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-nord11 text-nord6 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-nord4 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="shadow appearance-none border border-nord3 rounded w-full py-2 px-3 bg-nord2 text-nord6 leading-tight focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-transparent placeholder-nord4::placeholder"
              placeholder="your@email.com"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-nord4 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow appearance-none border border-nord3 rounded w-full py-2 px-3 bg-nord2 text-nord6 leading-tight focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-transparent placeholder-nord4::placeholder"
              placeholder="********"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-nord10 hover:bg-nord9 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed ${
                isLoading ? "animate-pulse" : ""
              }`}
            >
              {isLoading ? "Logging In..." : "Login"}
            </button>
          </div>
          <p className="text-center text-nord4 text-sm mt-6">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-nord8 hover:text-nord7 font-bold"
            >
              Register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
