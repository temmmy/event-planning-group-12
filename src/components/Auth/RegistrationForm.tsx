import React, { useState } from "react";
import Button from "../Common/Button";

const RegistrationForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    setError("");
    // TODO: Implement registration logic (API call)
    console.log("Registration attempt:", { username, email, password });
  };

  const inputClasses =
    "shadow appearance-none border border-nord4 rounded w-full py-2 px-3 bg-nord6 text-nord0 leading-tight focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-transparent";
  const labelClasses = "block text-nord1 text-sm font-bold mb-2";

  return (
    <div className="flex justify-center items-center flex-grow">
      <form
        onSubmit={handleSubmit}
        className="bg-nord5 p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold text-nord0 mb-6 text-center">
          Register
        </h2>
        {error && (
          <p className="text-nord11 text-xs italic mb-4 text-center">{error}</p>
        )}
        <div className="mb-4">
          <label htmlFor="register-username" className={labelClasses}>
            Username:
          </label>
          <input
            id="register-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={inputClasses}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="register-email" className={labelClasses}>
            Email:
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClasses}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="register-password" className={labelClasses}>
            Password:
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClasses}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="register-confirm-password" className={labelClasses}>
            Confirm Password:
          </label>
          <input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`${inputClasses} ${
              error ? "border-nord11" : "border-nord4"
            }`}
          />
        </div>
        <div className="flex items-center justify-between">
          <Button type="submit" className="w-full">
            Register
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
