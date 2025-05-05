import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  registerUser,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from "../../features/auth/authSlice";

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
    <div className="min-h-screen flex items-center justify-center bg-nord0 text-nord6">
      <div className="bg-nord1 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-nord8">
          Register
        </h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-nord11 text-nord6 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          {registrationSuccess && (
            <div className="bg-nord14 text-nord0 p-3 rounded mb-4 text-sm">
              Registration successful! Redirecting to login...
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-nord4 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="shadow appearance-none border border-nord3 rounded w-full py-2 px-3 bg-nord2 text-nord6 leading-tight focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-transparent placeholder-nord4::placeholder"
              placeholder="choose_a_username"
            />
          </div>
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
            {/* TODO: Add password confirmation field and validation */}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading || registrationSuccess} // Disable if loading or after success
              className={`w-full bg-nord10 hover:bg-nord9 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed ${
                isLoading ? "animate-pulse" : ""
              }`}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
          <p className="text-center text-nord4 text-sm mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-nord8 hover:text-nord7 font-bold">
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
