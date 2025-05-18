import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  registerUser,
  clearError as clearApiError,
  selectAuthLoading,
  selectAuthError,
} from "../../features/auth/authSlice";
import AuthLayout from "./AuthLayout";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
}

const RegistrationForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"attendee" | "organizer">("attendee");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoading = useAppSelector(selectAuthLoading) === "pending";
  const apiError = useAppSelector(selectAuthError);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Username validation
    if (!username) {
      errors.username = "Username is required.";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters long.";
    } else if (username.length > 25) {
      errors.username = "Username cannot exceed 25 characters.";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.username =
        "Username can only contain letters, numbers, underscores, and hyphens.";
    }

    // Email validation
    if (!email) {
      errors.email = "Email is required.";
    } else if (
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
        email
      )
    ) {
      errors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    } else if (password.length > 64) {
      errors.password = "Password cannot exceed 64 characters.";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter.";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain at least one number.";
    } else if (!/[!@#$%^&*()_+=[\]{};':"\\\\|,.<>/?-]/.test(password)) {
      errors.password = "Password must contain at least one special character.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegistrationSuccess(false);
    dispatch(clearApiError());
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    const resultAction = await dispatch(
      registerUser({ username, email, password, role })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      setRegistrationSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <AuthLayout
      title={
        <>
          Register For a <span className="text-nord10">New Account</span>
        </>
      }
      subtitle="Join thousands of event planners and attendees. Create, manage, and discover amazing events."
      type="register"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {apiError}
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
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-describedby="username-error"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-nord1 ${
              formErrors.username
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-nord8 focus:border-nord8"
            }`}
            placeholder="Choose a username"
          />
          {formErrors.username && (
            <p id="username-error" className="mt-1 text-xs text-red-600">
              {formErrors.username}
            </p>
          )}
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
            aria-describedby="email-error"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-nord1 ${
              formErrors.email
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-nord8 focus:border-nord8"
            }`}
            placeholder="Enter your email"
          />
          {formErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600">
              {formErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-nord2 mb-1"
          >
            Select your Role
          </label>
          <div className="relative">
            <select
              id="role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "attendee" | "organizer")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-nord8 focus:border-nord8 appearance-none text-nord1"
            >
              <option value="attendee">Attendee</option>
              <option value="organizer">Organizer</option>
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
            aria-describedby="password-error"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-nord1 ${
              formErrors.password
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-nord8 focus:border-nord8"
            }`}
            placeholder="Create a password"
          />
          {formErrors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-600">
              {formErrors.password}
            </p>
          )}
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
          {isLoading ? "Registering..." : "Create Account"}
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
