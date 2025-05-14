import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  registerUser,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from "../../features/auth/authSlice";
import AuthLayout from "./AuthLayout";

const RegistrationForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoading = useAppSelector(selectAuthLoading) === "pending";
  const error = useAppSelector(selectAuthError);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegistrationSuccess(false); // Reset success message
    dispatch(clearError()); // Clear previous errors

    const resultAction = await dispatch(
      registerUser({ username, email, password })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      // Registration was successful (thunk fulfilled)
      setRegistrationSuccess(true);
      // Optional: Clear form or redirect after a delay
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Redirect to login after 2 seconds
    }
    // Error state is handled by the selector
  };

  return (
    <AuthLayout
      title={
        <>
          Register For a <span className="text-nord10">Free Trial</span>
        </>
      }
      subtitle="Join thousands of event planners who are making their events memorable. Create, manage, and track all your events in one place."
      type="register"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {registrationSuccess && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
            Registration successful! Redirecting to login...
          </div>
        )}

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-nord2 mb-1"
          >
            Your Name
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nord8 focus:border-nord8 text-nord1"
            placeholder="Enter your name"
          />
        </div>

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
            htmlFor="course"
            className="block text-sm font-medium text-nord2 mb-1"
          >
            Select your Course
          </label>
          <div className="relative">
            <select
              id="course"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-nord8 focus:border-nord8 appearance-none text-nord1"
            >
              <option value="" disabled selected>
                Select your course
              </option>
              <option value="web-dev">Web Development</option>
              <option value="data-science">Data Science</option>
              <option value="mobile-dev">Mobile App Development</option>
              <option value="ui-ux">UI/UX Design</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-nord3">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
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
            placeholder="Create a password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || registrationSuccess}
          className={`w-full bg-nord10 hover:bg-nord9 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nord10 transition-colors ${
            isLoading || registrationSuccess
              ? "opacity-70 cursor-not-allowed"
              : ""
          }`}
        >
          {isLoading ? "Registering..." : "Apply Now"}
        </button>

        <p className="text-center text-nord3 text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-nord10 hover:text-nord9 font-medium">
            Login here
          </a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegistrationForm;
