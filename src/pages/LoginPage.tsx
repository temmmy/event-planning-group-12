import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../components/Auth/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <LoginForm />
      <p className="text-center text-nord1 text-sm mt-4 pb-4">
        Don't have an account?
        <Link
          to="/register"
          className="font-bold text-nord8 hover:text-nord9 underline"
        >
          Register here
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
