import React, { useState } from "react";
import Button from "../Common/Button"; // Assuming Button is in Common

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement login logic (API call, state update)
    console.log("Login attempt:", { email, password });
  };

  return (
    <div className="flex justify-center items-center flex-grow">
      <form
        onSubmit={handleSubmit}
        className="bg-nord5 p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold text-nord0 mb-6 text-center">
          Login
        </h2>
        <div className="mb-4">
          <label
            htmlFor="login-email"
            className="block text-nord1 text-sm font-bold mb-2"
          >
            Email:
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow appearance-none border border-nord4 rounded w-full py-2 px-3 bg-nord6 text-nord0 leading-tight focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-transparent"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="login-password"
            className="block text-nord1 text-sm font-bold mb-2"
          >
            Password:
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shadow appearance-none border border-nord4 rounded w-full py-2 px-3 bg-nord6 text-nord0 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-transparent"
          />
        </div>
        <div className="flex items-center justify-between">
          <Button type="submit" className="w-full">
            Login
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
