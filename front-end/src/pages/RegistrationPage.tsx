import React from "react";
import RegistrationForm from "../components/Auth/RegistrationForm";

const RegistrationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <RegistrationForm />
    </div>
  );
};

export default RegistrationPage;
