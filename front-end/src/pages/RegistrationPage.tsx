// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

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
