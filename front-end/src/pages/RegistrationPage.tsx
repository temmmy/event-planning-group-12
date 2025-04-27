import React from "react";
import { Link } from "react-router-dom";
import RegistrationForm from "../components/Auth/RegistrationForm";

const RegistrationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <RegistrationForm />
      <p className="text-center text-nord1 text-sm mt-4 pb-4">
        Already have an account?
        <Link
          to="/login"
          className="font-bold text-nord8 hover:text-nord9 underline"
        >
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegistrationPage;
